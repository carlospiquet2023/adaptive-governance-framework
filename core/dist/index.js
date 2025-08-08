"use strict";
/**
 * 🚀 ADAPTIVE GOVERNANCE FRAMEWORK - ENTERPRISE EDITION
 *
 * Sistema único de governança adaptativa com AI, machine learning
 * e integração empresarial completa.
 *
 * Arquitetura: Clean Architecture + DDD + CQRS + Event Sourcing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyService = exports.DecisionPipelineEngine = exports.ModelRegistry = exports.XAIEngine = exports.RuleDSLParser = exports.PluginLoader = exports.PluginRegistry = exports.LearningEngine = exports.ContextEngine = exports.PolicyEngine = exports.RedisService = exports.DatabaseService = exports.ConfigManager = exports.Logger = exports.GovernanceOrchestrator = exports.AdaptiveGovernanceFramework = void 0;
const GovernanceOrchestrator_1 = require("./domain/GovernanceOrchestrator");
const Logger_1 = require("./infrastructure/Logger");
class AdaptiveGovernanceFramework {
    static instance;
    orchestrator;
    logger;
    constructor() {
        this.logger = Logger_1.Logger.getInstance();
        this.orchestrator = GovernanceOrchestrator_1.GovernanceOrchestrator.getInstance();
    }
    static getInstance() {
        if (!AdaptiveGovernanceFramework.instance) {
            AdaptiveGovernanceFramework.instance = new AdaptiveGovernanceFramework();
        }
        return AdaptiveGovernanceFramework.instance;
    }
    async initialize() {
        try {
            this.logger.info('🚀 Inicializando Adaptive Governance Framework...');
            await this.orchestrator.initialize();
            this.logger.info('✅ Framework inicializado com sucesso');
        }
        catch (error) {
            this.logger.error('❌ Falha na inicialização', { error });
            throw error;
        }
    }
    async shutdown() {
        await this.orchestrator.shutdown();
        this.logger.info('🛑 Framework finalizado');
    }
    getOrchestrator() {
        return this.orchestrator;
    }
}
exports.AdaptiveGovernanceFramework = AdaptiveGovernanceFramework;
// Export principal
exports.default = AdaptiveGovernanceFramework;
// Exports de componentes principais
var GovernanceOrchestrator_2 = require("./domain/GovernanceOrchestrator");
Object.defineProperty(exports, "GovernanceOrchestrator", { enumerable: true, get: function () { return GovernanceOrchestrator_2.GovernanceOrchestrator; } });
var Logger_2 = require("./infrastructure/Logger");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return Logger_2.Logger; } });
var ConfigManager_1 = require("./infrastructure/ConfigManager");
Object.defineProperty(exports, "ConfigManager", { enumerable: true, get: function () { return ConfigManager_1.ConfigManager; } });
var DatabaseService_1 = require("./infrastructure/DatabaseService");
Object.defineProperty(exports, "DatabaseService", { enumerable: true, get: function () { return DatabaseService_1.DatabaseService; } });
var RedisService_1 = require("./infrastructure/RedisService");
Object.defineProperty(exports, "RedisService", { enumerable: true, get: function () { return RedisService_1.RedisService; } });
// Export engines
var PolicyEngine_1 = require("./engines/PolicyEngine");
Object.defineProperty(exports, "PolicyEngine", { enumerable: true, get: function () { return PolicyEngine_1.PolicyEngine; } });
var ContextEngine_1 = require("./engines/ContextEngine");
Object.defineProperty(exports, "ContextEngine", { enumerable: true, get: function () { return ContextEngine_1.ContextEngine; } });
var LearningEngine_1 = require("./engines/LearningEngine");
Object.defineProperty(exports, "LearningEngine", { enumerable: true, get: function () { return LearningEngine_1.LearningEngine; } });
// New modules
var plugins_1 = require("./plugins");
Object.defineProperty(exports, "PluginRegistry", { enumerable: true, get: function () { return plugins_1.PluginRegistry; } });
Object.defineProperty(exports, "PluginLoader", { enumerable: true, get: function () { return plugins_1.PluginLoader; } });
var rule_dsl_1 = require("./dsl/rule-dsl");
Object.defineProperty(exports, "RuleDSLParser", { enumerable: true, get: function () { return rule_dsl_1.RuleDSLParser; } });
var XAIEngine_1 = require("./xai/XAIEngine");
Object.defineProperty(exports, "XAIEngine", { enumerable: true, get: function () { return XAIEngine_1.XAIEngine; } });
var ModelRegistry_1 = require("./model_registry/ModelRegistry");
Object.defineProperty(exports, "ModelRegistry", { enumerable: true, get: function () { return ModelRegistry_1.ModelRegistry; } });
var DecisionPipeline_1 = require("./pipelines/DecisionPipeline");
Object.defineProperty(exports, "DecisionPipelineEngine", { enumerable: true, get: function () { return DecisionPipeline_1.DecisionPipelineEngine; } });
var PrivacyService_1 = require("./privacy/PrivacyService");
Object.defineProperty(exports, "PrivacyService", { enumerable: true, get: function () { return PrivacyService_1.PrivacyService; } });
//# sourceMappingURL=index.js.map