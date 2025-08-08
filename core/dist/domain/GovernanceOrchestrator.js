"use strict";
/**
 * 🎯 GOVERNANCE ORCHESTRATOR
 *
 * Coordenador central do framework de governança adaptativa.
 * Unifica todos os engines, infraestrutura e tomada de decisão.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GovernanceOrchestrator = void 0;
const Logger_1 = require("../utils/Logger");
const ConfigManager_1 = require("../infrastructure/ConfigManager");
const DatabaseService_1 = require("../infrastructure/DatabaseService");
const RedisService_1 = require("../infrastructure/RedisService");
// Import engines
const PolicyEngine_1 = require("../engines/PolicyEngine");
const ContextEngine_1 = require("../engines/ContextEngine");
const LearningEngine_1 = require("../engines/LearningEngine");
class GovernanceOrchestrator {
    static instance;
    logger = Logger_1.Logger.getInstance();
    config = ConfigManager_1.ConfigManager.getInstance();
    database = DatabaseService_1.DatabaseService.getInstance();
    redis = RedisService_1.RedisService.getInstance();
    // Engines
    policyEngine;
    contextEngine;
    learningEngine;
    // State
    initialized = false;
    eventQueue = [];
    metrics = {
        totalRequests: 0,
        totalDecisions: 0,
        lastReset: new Date()
    };
    constructor() { }
    static getInstance() {
        if (!GovernanceOrchestrator.instance) {
            GovernanceOrchestrator.instance = new GovernanceOrchestrator();
        }
        return GovernanceOrchestrator.instance;
    }
    async initialize() {
        if (this.initialized)
            return;
        this.logger.info('🚀 Inicializando Governance Orchestrator...');
        try {
            // Initialize engines
            this.policyEngine = new PolicyEngine_1.PolicyEngine();
            this.contextEngine = new ContextEngine_1.ContextEngine();
            this.learningEngine = new LearningEngine_1.LearningEngine();
            this.initialized = true;
            this.logger.info('✅ Governance Orchestrator inicializado com sucesso');
        }
        catch (error) {
            this.logger.error('❌ Falha na inicialização do Orchestrator', { error });
            throw error;
        }
    }
    async makeDecision(request) {
        const requestId = this.generateId();
        this.logger.info('🎯 Processando decisão de governança', {
            requestId,
            resource: request.resource,
            action: request.action
        });
        try {
            this.metrics.totalRequests++;
            // Evaluate with policy engine
            const policyResult = await this.policyEngine.evaluate({
                userId: request.userId,
                resource: request.resource,
                action: request.action,
                timestamp: new Date(),
                correlationId: requestId,
                ...request.context
            });
            // Create decision
            const decision = {
                id: this.generateId(),
                decision: policyResult.allowed ? 'allow' : 'deny',
                confidence: 0.9,
                reasoning: policyResult.reasons,
                timestamp: new Date()
            };
            this.metrics.totalDecisions++;
            this.logger.info('✅ Decisão tomada', {
                requestId,
                decision: decision.decision,
                confidence: decision.confidence
            });
            return decision;
        }
        catch (error) {
            this.logger.error('❌ Erro na tomada de decisão', { requestId, error });
            throw error;
        }
    }
    async emitEvent(event) {
        const governanceEvent = {
            ...event,
            id: this.generateId(),
            timestamp: new Date()
        };
        this.eventQueue.push(governanceEvent);
        this.logger.debug('📡 Evento emitido', {
            eventId: governanceEvent.id,
            type: event.type,
            source: event.source
        });
    }
    getMetrics() {
        return { ...this.metrics };
    }
    async shutdown() {
        this.logger.info('🛑 Iniciando shutdown do Governance Orchestrator...');
        try {
            if (this.learningEngine) {
                await this.learningEngine.cleanup();
            }
            await this.database.close();
            await this.redis.disconnect();
            this.initialized = false;
            this.logger.info('✅ Governance Orchestrator shutdown concluído');
        }
        catch (error) {
            this.logger.error('❌ Erro durante shutdown', { error });
            throw error;
        }
    }
    generateId() {
        return `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.GovernanceOrchestrator = GovernanceOrchestrator;
//# sourceMappingURL=GovernanceOrchestrator.js.map