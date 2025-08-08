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
export interface PolicyRule {
    id: string;
    name: string;
    description: string;
    version: string;
    enabled: boolean;
    priority: number;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    metadata: {
        createdBy: string;
        createdAt: Date;
        modifiedBy?: string;
        modifiedAt?: Date;
        tags: string[];
        category: string;
    };
}
export interface PolicyCondition {
    id: string;
    type: 'field' | 'function' | 'composite';
    field?: string;
    operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'nin' | 'regex' | 'exists';
    value?: any;
    function?: string;
    conditions?: PolicyCondition[];
    logic?: 'and' | 'or';
}
export interface PolicyAction {
    id: string;
    type: 'allow' | 'deny' | 'transform' | 'log' | 'notify' | 'custom';
    parameters?: Record<string, any>;
    message?: string;
}
export interface PolicyContext {
    userId?: string;
    roles?: string[];
    permissions?: string[];
    resource?: string;
    action?: string;
    environment?: Record<string, any>;
    timestamp: Date;
    correlationId?: string;
}
export interface PolicyEvaluationResult {
    allowed: boolean;
    matchedRules: PolicyRule[];
    actions: PolicyAction[];
    reasons: string[];
    context: PolicyContext;
    evaluationTime: number;
    cacheHit: boolean;
}
export interface PolicyMetrics {
    totalEvaluations: number;
    allowedCount: number;
    deniedCount: number;
    averageEvaluationTime: number;
    cacheHitRate: number;
    topRules: Array<{
        ruleId: string;
        count: number;
    }>;
}
export declare class PolicyEngine {
    private logger;
    private redis;
    private database;
    private rules;
    private rulesByPriority;
    private evaluationCache;
    private metrics;
    constructor();
    private initialize;
    private loadRules;
    private loadRulesFromDatabase;
    private updateRulesPriority;
    private setupCacheInvalidation;
    evaluate(context: PolicyContext, resource?: string, action?: string): Promise<PolicyEvaluationResult>;
    private evaluateRules;
    private evaluateRule;
    private evaluateCondition;
    private evaluateFieldCondition;
    private evaluateFunctionCondition;
    private evaluateCompositeCondition;
    private getFieldValue;
    private getCustomFunction;
    createRule(rule: Omit<PolicyRule, 'id'> & {
        metadata?: Partial<PolicyRule['metadata']>;
    }): Promise<PolicyRule>;
    updateRule(ruleId: string, updates: Partial<PolicyRule>): Promise<PolicyRule>;
    deleteRule(ruleId: string): Promise<void>;
    getRule(ruleId: string): PolicyRule | undefined;
    getRules(filter?: {
        enabled?: boolean;
        category?: string;
        tags?: string[];
    }): PolicyRule[];
    private generateCacheKey;
    private invalidateRule;
    private removeRule;
    private flushCache;
    private updateMetrics;
    getMetrics(): PolicyMetrics;
    healthCheck(): Promise<{
        healthy: boolean;
        rulesLoaded: number;
        cacheSize: number;
        metrics: PolicyMetrics;
    }>;
    private generateId;
    private generateCorrelationId;
}
