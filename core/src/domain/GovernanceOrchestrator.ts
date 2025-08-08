/**
 * 🎯 GOVERNANCE ORCHESTRATOR
 * 
 * Coordenador central do framework de governança adaptativa.
 * Unifica todos os engines, infraestrutura e tomada de decisão.
 */

import { Logger } from '../utils/Logger';
import { ConfigManager } from '../infrastructure/ConfigManager';
import { DatabaseService } from '../infrastructure/DatabaseService';
import { RedisService } from '../infrastructure/RedisService';

// Import engines
import { PolicyEngine } from '../engines/PolicyEngine';
import { ContextEngine } from '../engines/ContextEngine';
import { LearningEngine } from '../engines/LearningEngine';
import { XAIEngine } from '../xai/XAIEngine';
import { PrivacyService } from '../privacy/PrivacyService';
import { DecisionPipelineEngine, DecisionPipelineDef } from '../pipelines/DecisionPipeline';
import { decisionsTotal, decisionLatency } from '../metrics/metrics';
import { PluginLoader } from '../plugins';
import * as fs from 'node:fs';
import * as path from 'node:path';
import YAML from 'yaml';

export interface GovernanceEvent {
    id: string;
    type: string;
    source: string;
    data: Record<string, any>;
    timestamp: Date;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface GovernanceDecision {
    id: string;
    decision: 'allow' | 'deny' | 'review' | 'escalate';
    confidence: number;
    reasoning: string[];
    timestamp: Date;
}

export class GovernanceOrchestrator {
    private static instance: GovernanceOrchestrator;
    private logger = Logger.getInstance();
    private config = ConfigManager.getInstance();
    private database = DatabaseService.getInstance();
    private redis = RedisService.getInstance();
    
    // Engines
    private policyEngine!: PolicyEngine;
    private contextEngine!: ContextEngine;
    private learningEngine!: LearningEngine;
    private xaiEngine!: XAIEngine;
    private privacy!: PrivacyService;
    private pipeline!: DecisionPipelineEngine;
    private pipelineDef?: DecisionPipelineDef;
    
    // State
    private initialized = false;
    private eventQueue: GovernanceEvent[] = [];
    private metrics = {
        totalRequests: 0,
        totalDecisions: 0,
        lastReset: new Date()
    };
    
    private constructor() {}
    
    public static getInstance(): GovernanceOrchestrator {
        if (!GovernanceOrchestrator.instance) {
            GovernanceOrchestrator.instance = new GovernanceOrchestrator();
        }
        return GovernanceOrchestrator.instance;
    }
    
    public async initialize(): Promise<void> {
        if (this.initialized) return;
        
        this.logger.info('🚀 Inicializando Governance Orchestrator...');
        
        try {
            // Initialize engines
            this.policyEngine = new PolicyEngine();
            this.contextEngine = new ContextEngine();
            this.learningEngine = new LearningEngine();
            this.xaiEngine = new XAIEngine();
            this.privacy = new PrivacyService();
            this.pipeline = new DecisionPipelineEngine();

            // Handlers básicos do pipeline
            this.pipeline.registerHandler('context', async ({ input }) => {
                return { enriched: { ...input.context } };
            });
            this.pipeline.registerHandler('policy', async ({ input }) => {
                return await this.policyEngine.evaluate({ ...input.context, timestamp: new Date(), correlationId: input.correlationId } as any);
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
                await new PluginLoader(pluginsDir).loadAll().catch(() => undefined);
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
            
        } catch (error) {
            this.logger.error('❌ Falha na inicialização do Orchestrator', { error });
            throw error;
        }
    }
    
    public async makeDecision(request: {
        userId?: string;
        resource: string;
        action: string;
        context?: Record<string, any>;
    }): Promise<GovernanceDecision> {
        const requestId = this.generateId();
        
        this.logger.info('🎯 Processando decisão de governança', {
            requestId,
            resource: request.resource,
            action: request.action
        });
        
        try {
            this.metrics.totalRequests++;
            const timer = decisionLatency.startTimer();
            
            // Evaluate with pipeline se definido, senão fallback ao PolicyEngine
            let policyResult: any;
            if (this.pipelineDef) {
                const results = await this.pipeline.run(this.pipelineDef, { context: request, correlationId: requestId });
                policyResult = results['policy'];
            } else {
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
            const decision: GovernanceDecision = {
                id: this.generateId(),
                decision: policyResult.allowed ? 'allow' : 'deny',
                confidence: 0.9,
                reasoning: policyResult.reasons,
                timestamp: new Date()
            };
            
            this.metrics.totalDecisions++;
            decisionsTotal.inc();
            timer();
            
            this.logger.info('✅ Decisão tomada', {
                requestId,
                decision: decision.decision,
                confidence: decision.confidence
            });
            
            return decision;
            
        } catch (error) {
            this.logger.error('❌ Erro na tomada de decisão', { requestId, error });
            throw error;
        }
    }
    
    public async emitEvent(event: Omit<GovernanceEvent, 'id' | 'timestamp'>): Promise<void> {
        const governanceEvent: GovernanceEvent = {
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
    
    public getMetrics(): typeof this.metrics {
        return { ...this.metrics };
    }
    
    public async shutdown(): Promise<void> {
        this.logger.info('🛑 Iniciando shutdown do Governance Orchestrator...');
        
        try {
            if (this.learningEngine) {
                await this.learningEngine.cleanup();
            }
            
            await this.database.close();
            await this.redis.disconnect();
            
            this.initialized = false;
            this.logger.info('✅ Governance Orchestrator shutdown concluído');
            
        } catch (error) {
            this.logger.error('❌ Erro durante shutdown', { error });
            throw error;
        }
    }
    
    private generateId(): string {
        return `gov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
