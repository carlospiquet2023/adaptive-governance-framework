"use strict";
/**
 * 🏗️ POLICY ENGINE
 *
 * Engine de políticas com recursos avançados:
 * - Rule evaluation engine
 * - Context-aware policies
 * - Real-time policy updates
 * - Policy versioning
 * - Compliance tracking
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyEngine = void 0;
const Logger_1 = require("../infrastructure/Logger");
const RedisService_1 = require("../infrastructure/RedisService");
const DatabaseService_1 = require("../infrastructure/DatabaseService");
class PolicyEngine {
    logger = Logger_1.Logger.getInstance();
    redis = RedisService_1.RedisService.getInstance();
    database = DatabaseService_1.DatabaseService.getInstance();
    rules = new Map();
    rulesByPriority = [];
    evaluationCache = new Map();
    metrics = {
        totalEvaluations: 0,
        allowedCount: 0,
        deniedCount: 0,
        averageEvaluationTime: 0,
        cacheHitRate: 0,
        topRules: []
    };
    constructor() {
        this.initialize();
    }
    async initialize() {
        await this.loadRules();
        await this.setupCacheInvalidation();
        this.logger.info('Policy Engine inicializado', {
            totalRules: this.rules.size
        });
    }
    async loadRules() {
        try {
            const cachedRules = await this.redis.get('policy:rules');
            if (cachedRules) {
                for (const rule of cachedRules) {
                    this.rules.set(rule.id, rule);
                }
                this.logger.debug('Rules carregadas do cache', { count: cachedRules.length });
            }
            else {
                await this.loadRulesFromDatabase();
            }
            this.updateRulesPriority();
        }
        catch (error) {
            this.logger.error('Falha ao carregar rules', { error });
            throw error;
        }
    }
    async loadRulesFromDatabase() {
        const dbRules = await this.database.findMany('policy_rules', { enabled: true }, { orderBy: 'priority', orderDirection: 'DESC' });
        for (const rule of dbRules) {
            this.rules.set(rule.id, rule);
        }
        // Cache for future loads
        await this.redis.set('policy:rules', Array.from(this.rules.values()), { ttl: 300 });
        this.logger.info('Rules carregadas do banco', { count: dbRules.length });
    }
    updateRulesPriority() {
        this.rulesByPriority = Array.from(this.rules.values())
            .filter(rule => rule.enabled)
            .sort((a, b) => b.priority - a.priority);
    }
    async setupCacheInvalidation() {
        await this.redis.subscribe('policy:invalidate', (message) => {
            const { type, ruleId } = JSON.parse(message.message);
            switch (type) {
                case 'rule_updated':
                case 'rule_created':
                    this.invalidateRule(ruleId);
                    break;
                case 'rule_deleted':
                    this.removeRule(ruleId);
                    break;
                case 'flush_all':
                    this.flushCache();
                    break;
            }
        });
    }
    // Public API
    async evaluate(context, resource, action) {
        const start = Date.now();
        const fullContext = {
            ...context,
            resource: resource || context.resource,
            action: action || context.action,
            timestamp: new Date(),
            correlationId: context.correlationId || this.generateCorrelationId()
        };
        this.logger.setCorrelationId(fullContext.correlationId);
        // Check cache first
        const cacheKey = this.generateCacheKey(fullContext);
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            this.metrics.totalEvaluations++;
            this.updateMetrics(true, Date.now() - start, true);
            return {
                ...cached,
                cacheHit: true
            };
        }
        // Evaluate rules
        const result = await this.evaluateRules(fullContext);
        const evaluationTime = Date.now() - start;
        result.evaluationTime = evaluationTime;
        result.cacheHit = false;
        // Cache result
        await this.redis.set(cacheKey, result, { ttl: 60 });
        // Update metrics
        this.updateMetrics(result.allowed, evaluationTime, false);
        this.logger.info('Política avaliada', {
            correlationId: fullContext.correlationId,
            allowed: result.allowed,
            matchedRules: result.matchedRules.length,
            evaluationTime
        });
        return result;
    }
    async evaluateRules(context) {
        const matchedRules = [];
        const actions = [];
        const reasons = [];
        let allowed = true; // Default allow
        for (const rule of this.rulesByPriority) {
            try {
                const isMatch = await this.evaluateRule(rule, context);
                if (isMatch) {
                    matchedRules.push(rule);
                    actions.push(...rule.actions);
                    // Check for deny actions (highest priority)
                    const denyAction = rule.actions.find(a => a.type === 'deny');
                    if (denyAction) {
                        allowed = false;
                        reasons.push(denyAction.message || `Negado pela rule: ${rule.name}`);
                        break; // Stop on first deny
                    }
                    // Allow actions
                    const allowAction = rule.actions.find(a => a.type === 'allow');
                    if (allowAction) {
                        reasons.push(allowAction.message || `Permitido pela rule: ${rule.name}`);
                    }
                }
            }
            catch (error) {
                this.logger.error('Erro ao avaliar rule', {
                    ruleId: rule.id,
                    error: error
                });
            }
        }
        return {
            allowed,
            matchedRules,
            actions,
            reasons,
            context,
            evaluationTime: 0, // Will be set by caller
            cacheHit: false
        };
    }
    async evaluateRule(rule, context) {
        if (!rule.enabled)
            return false;
        for (const condition of rule.conditions) {
            const result = await this.evaluateCondition(condition, context);
            if (!result)
                return false; // All conditions must pass
        }
        return true;
    }
    async evaluateCondition(condition, context) {
        switch (condition.type) {
            case 'field':
                return this.evaluateFieldCondition(condition, context);
            case 'function':
                return await this.evaluateFunctionCondition(condition, context);
            case 'composite':
                return await this.evaluateCompositeCondition(condition, context);
            default:
                return false;
        }
    }
    evaluateFieldCondition(condition, context) {
        if (!condition.field)
            return false;
        const fieldValue = this.getFieldValue(condition.field, context);
        switch (condition.operator) {
            case 'eq':
                return fieldValue === condition.value;
            case 'ne':
                return fieldValue !== condition.value;
            case 'gt':
                return fieldValue > condition.value;
            case 'lt':
                return fieldValue < condition.value;
            case 'gte':
                return fieldValue >= condition.value;
            case 'lte':
                return fieldValue <= condition.value;
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(fieldValue);
            case 'nin':
                return Array.isArray(condition.value) && !condition.value.includes(fieldValue);
            case 'regex':
                if (typeof condition.value === 'string' && typeof fieldValue === 'string') {
                    const regex = new RegExp(condition.value);
                    return regex.test(fieldValue);
                }
                return false;
            case 'exists':
                return fieldValue !== undefined && fieldValue !== null;
            default:
                return false;
        }
    }
    async evaluateFunctionCondition(condition, context) {
        if (!condition.function)
            return false;
        try {
            // Custom function evaluation
            const func = this.getCustomFunction(condition.function);
            if (func) {
                return await func(context, condition.value);
            }
            return false;
        }
        catch (error) {
            this.logger.error('Erro na função customizada', {
                function: condition.function,
                error
            });
            return false;
        }
    }
    async evaluateCompositeCondition(condition, context) {
        if (!condition.conditions || condition.conditions.length === 0)
            return false;
        const results = await Promise.all(condition.conditions.map(c => this.evaluateCondition(c, context)));
        switch (condition.logic) {
            case 'and':
                return results.every(r => r);
            case 'or':
                return results.some(r => r);
            default:
                return false;
        }
    }
    getFieldValue(fieldPath, context) {
        const parts = fieldPath.split('.');
        let value = context;
        for (const part of parts) {
            if (value && typeof value === 'object' && part in value) {
                value = value[part];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    getCustomFunction(functionName) {
        // Registry of custom functions
        const functions = {
            isBusinessHours: async (context) => {
                const now = new Date();
                const hour = now.getHours();
                return hour >= 9 && hour <= 17; // 9 AM to 5 PM
            },
            hasPermission: async (context, permission) => {
                return context.permissions?.includes(permission) || false;
            },
            isWeekend: async (context) => {
                const now = new Date();
                const day = now.getDay();
                return day === 0 || day === 6; // Sunday or Saturday
            },
            userInGroup: async (context, group) => {
                // Check if user belongs to specific group
                // This would typically query a user service or database
                return false; // Placeholder
            }
        };
        return functions[functionName] || null;
    }
    // Rule management
    async createRule(rule) {
        const newRule = {
            ...rule,
            id: this.generateId(),
            metadata: {
                createdBy: rule.metadata?.createdBy || 'system',
                createdAt: new Date(),
                tags: rule.metadata?.tags || [],
                category: rule.metadata?.category || 'general'
            }
        };
        // Save to database
        await this.database.create('policy_rules', newRule);
        // Update memory
        this.rules.set(newRule.id, newRule);
        this.updateRulesPriority();
        // Invalidate cache
        await this.redis.del('policy:rules');
        await this.redis.publish('policy:invalidate', JSON.stringify({
            type: 'rule_created',
            ruleId: newRule.id
        }));
        this.logger.info('Nova rule criada', { ruleId: newRule.id, name: newRule.name });
        return newRule;
    }
    async updateRule(ruleId, updates) {
        const existingRule = this.rules.get(ruleId);
        if (!existingRule) {
            throw new Error(`Rule não encontrada: ${ruleId}`);
        }
        const updatedRule = {
            ...existingRule,
            ...updates,
            metadata: {
                ...existingRule.metadata,
                modifiedBy: 'system',
                modifiedAt: new Date()
            }
        };
        // Save to database
        await this.database.update('policy_rules', { id: ruleId }, updatedRule);
        // Update memory
        this.rules.set(ruleId, updatedRule);
        this.updateRulesPriority();
        // Invalidate cache
        await this.redis.del('policy:rules');
        await this.redis.publish('policy:invalidate', JSON.stringify({
            type: 'rule_updated',
            ruleId
        }));
        this.logger.info('Rule atualizada', { ruleId, name: updatedRule.name });
        return updatedRule;
    }
    async deleteRule(ruleId) {
        const rule = this.rules.get(ruleId);
        if (!rule) {
            throw new Error(`Rule não encontrada: ${ruleId}`);
        }
        // Delete from database
        await this.database.delete('policy_rules', { id: ruleId });
        // Remove from memory
        this.rules.delete(ruleId);
        this.updateRulesPriority();
        // Invalidate cache
        await this.redis.del('policy:rules');
        await this.redis.publish('policy:invalidate', JSON.stringify({
            type: 'rule_deleted',
            ruleId
        }));
        this.logger.info('Rule removida', { ruleId, name: rule.name });
    }
    getRule(ruleId) {
        return this.rules.get(ruleId);
    }
    getRules(filter) {
        let rules = Array.from(this.rules.values());
        if (filter) {
            if (filter.enabled !== undefined) {
                rules = rules.filter(r => r.enabled === filter.enabled);
            }
            if (filter.category) {
                rules = rules.filter(r => r.metadata.category === filter.category);
            }
            if (filter.tags && filter.tags.length > 0) {
                rules = rules.filter(r => filter.tags.some(tag => r.metadata.tags.includes(tag)));
            }
        }
        return rules;
    }
    // Cache management
    generateCacheKey(context) {
        const key = {
            userId: context.userId,
            roles: context.roles?.sort(),
            resource: context.resource,
            action: context.action,
            // Include relevant environment data
            environment: context.environment
        };
        return `policy:eval:${Buffer.from(JSON.stringify(key)).toString('base64')}`;
    }
    invalidateRule(ruleId) {
        // Reload specific rule from database
        this.loadRulesFromDatabase().catch(error => {
            this.logger.error('Falha ao recarregar rules', { error });
        });
        // Clear evaluation cache
        this.evaluationCache.clear();
    }
    removeRule(ruleId) {
        this.rules.delete(ruleId);
        this.updateRulesPriority();
        this.evaluationCache.clear();
    }
    flushCache() {
        this.evaluationCache.clear();
        this.loadRulesFromDatabase().catch(error => {
            this.logger.error('Falha ao recarregar rules', { error });
        });
    }
    // Metrics and monitoring
    updateMetrics(allowed, evaluationTime, cacheHit) {
        this.metrics.totalEvaluations++;
        if (allowed) {
            this.metrics.allowedCount++;
        }
        else {
            this.metrics.deniedCount++;
        }
        // Update average evaluation time
        const oldAvg = this.metrics.averageEvaluationTime;
        const count = this.metrics.totalEvaluations;
        this.metrics.averageEvaluationTime = (oldAvg * (count - 1) + evaluationTime) / count;
        // Update cache hit rate
        const cacheHits = cacheHit ? 1 : 0;
        this.metrics.cacheHitRate = (this.metrics.cacheHitRate * (count - 1) + cacheHits) / count;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async healthCheck() {
        try {
            const cacheSize = this.evaluationCache.size;
            return {
                healthy: true,
                rulesLoaded: this.rules.size,
                cacheSize,
                metrics: this.getMetrics()
            };
        }
        catch (error) {
            return {
                healthy: false,
                rulesLoaded: 0,
                cacheSize: 0,
                metrics: this.getMetrics()
            };
        }
    }
    // Utility methods
    generateId() {
        return `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCorrelationId() {
        return `pol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.PolicyEngine = PolicyEngine;
//# sourceMappingURL=PolicyEngine.js.map