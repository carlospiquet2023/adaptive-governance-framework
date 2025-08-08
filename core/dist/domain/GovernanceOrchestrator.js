"use strict";
/**
 * 🎯 GOVERNANCE ORCHESTRATOR
 *
 * Coordenador central do framework de governança adaptativa.
 * Unifica todos os engines, infraestrutura e tomada de decisão.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const XAIEngine_1 = require("../xai/XAIEngine");
const PrivacyService_1 = require("../privacy/PrivacyService");
const DecisionPipeline_1 = require("../pipelines/DecisionPipeline");
const metrics_1 = require("../metrics/metrics");
const plugins_1 = require("../plugins");
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
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
    xaiEngine;
    privacy;
    pipeline;
    pipelineDef;
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
            this.xaiEngine = new XAIEngine_1.XAIEngine();
            this.privacy = new PrivacyService_1.PrivacyService();
            this.pipeline = new DecisionPipeline_1.DecisionPipelineEngine();
            // Handlers básicos do pipeline
            this.pipeline.registerHandler('context', async ({ input }) => {
                return { enriched: { ...input.context } };
            });
            this.pipeline.registerHandler('policy', async ({ input }) => {
                return await this.policyEngine.evaluate({ ...input.context, timestamp: new Date(), correlationId: input.correlationId });
            });
            this.pipeline.registerHandler('xai', async ({ results }) => {
                const pol = results['policy'];
                return await this.xaiEngine.explainDecision(pol);
            });
            this.pipeline.registerHandler('privacy', async ({ input, results }) => {
                const roles = input.context?.roles || [];
                return this.privacy.maskObject(results, roles);
            });
            // Carregar plugins opcionais
            const pluginsDir = path.resolve(process.cwd(), 'plugins');
            if (fs.existsSync(pluginsDir)) {
                await new plugins_1.PluginLoader(pluginsDir).loadAll().catch(() => undefined);
            }
            // Carregar pipeline YAML se existir
            const pipelineFile = process.env.AGF_PIPELINE_FILE || path.resolve(process.cwd(), 'pipelines', 'decision-flow.yaml');
            if (fs.existsSync(pipelineFile)) {
                const yamlText = fs.readFileSync(pipelineFile, 'utf-8');
                this.pipelineDef = this.pipeline.loadFromYAML(yamlText);
                this.logger.info('Pipeline de decisão carregado', { name: this.pipelineDef.name });
            }
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
            const timer = metrics_1.decisionLatency.startTimer();
            // Evaluate with pipeline se definido, senão fallback ao PolicyEngine
            let policyResult;
            if (this.pipelineDef) {
                const results = await this.pipeline.run(this.pipelineDef, { context: request, correlationId: requestId });
                policyResult = results['policy'];
            }
            else {
                policyResult = await this.policyEngine.evaluate({
                    userId: request.userId,
                    resource: request.resource,
                    action: request.action,
                    timestamp: new Date(),
                    correlationId: requestId,
                    ...request.context
                });
            }
            // Create decision
            const decision = {
                id: this.generateId(),
                decision: policyResult.allowed ? 'allow' : 'deny',
                confidence: 0.9,
                reasoning: policyResult.reasons,
                timestamp: new Date()
            };
            this.metrics.totalDecisions++;
            metrics_1.decisionsTotal.inc();
            timer();
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