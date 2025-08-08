/**
 * 🚀 ADAPTIVE GOVERNANCE FRAMEWORK - ENTERPRISE EDITION
 *
 * Sistema único de governança adaptativa com AI, machine learning
 * e integração empresarial completa.
 *
 * Arquitetura: Clean Architecture + DDD + CQRS + Event Sourcing
 */
import { GovernanceOrchestrator } from './domain/GovernanceOrchestrator';
export declare class AdaptiveGovernanceFramework {
    private static instance;
    private orchestrator;
    private logger;
    private constructor();
    static getInstance(): AdaptiveGovernanceFramework;
    initialize(): Promise<void>;
    shutdown(): Promise<void>;
    getOrchestrator(): GovernanceOrchestrator;
}
export default AdaptiveGovernanceFramework;
export { GovernanceOrchestrator } from './domain/GovernanceOrchestrator';
export { Logger } from './infrastructure/Logger';
export { ConfigManager } from './infrastructure/ConfigManager';
export { DatabaseService } from './infrastructure/DatabaseService';
export { RedisService } from './infrastructure/RedisService';
export { PolicyEngine } from './engines/PolicyEngine';
export { ContextEngine } from './engines/ContextEngine';
export { LearningEngine } from './engines/LearningEngine';
