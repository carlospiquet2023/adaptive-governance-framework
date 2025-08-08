/**
 * 🚀 ADAPTIVE GOVERNANCE FRAMEWORK - ENTERPRISE EDITION
 * 
 * Sistema único de governança adaptativa com AI, machine learning
 * e integração empresarial completa.
 * 
 * Arquitetura: Clean Architecture + DDD + CQRS + Event Sourcing
 */

import { GovernanceOrchestrator } from './domain/GovernanceOrchestrator';
import { Logger } from './infrastructure/Logger';
import { ConfigManager } from './infrastructure/ConfigManager';

export class AdaptiveGovernanceFramework {
    private static instance: AdaptiveGovernanceFramework;
    private orchestrator: GovernanceOrchestrator;
    private logger: Logger;
    
    private constructor() {
        this.logger = Logger.getInstance();
        this.orchestrator = GovernanceOrchestrator.getInstance();
    }
    
    public static getInstance(): AdaptiveGovernanceFramework {
        if (!AdaptiveGovernanceFramework.instance) {
            AdaptiveGovernanceFramework.instance = new AdaptiveGovernanceFramework();
        }
        return AdaptiveGovernanceFramework.instance;
    }
    
    public async initialize(): Promise<void> {
        try {
            this.logger.info('🚀 Inicializando Adaptive Governance Framework...');
            
            await this.orchestrator.initialize();
            
            this.logger.info('✅ Framework inicializado com sucesso');
        } catch (error) {
            this.logger.error('❌ Falha na inicialização', { error });
            throw error;
        }
    }
    
    public async shutdown(): Promise<void> {
        await this.orchestrator.shutdown();
        this.logger.info('🛑 Framework finalizado');
    }
    
    public getOrchestrator(): GovernanceOrchestrator {
        return this.orchestrator;
    }
}

// Export principal
export default AdaptiveGovernanceFramework;

// Exports de componentes principais
export { GovernanceOrchestrator } from './domain/GovernanceOrchestrator';
export { Logger } from './infrastructure/Logger';
export { ConfigManager } from './infrastructure/ConfigManager';
export { DatabaseService } from './infrastructure/DatabaseService';
export { RedisService } from './infrastructure/RedisService';

// Export engines
export { PolicyEngine } from './engines/PolicyEngine';
export { ContextEngine } from './engines/ContextEngine';
export { LearningEngine } from './engines/LearningEngine';
