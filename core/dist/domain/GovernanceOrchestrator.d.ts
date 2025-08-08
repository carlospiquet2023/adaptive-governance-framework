/**
 * 🎯 GOVERNANCE ORCHESTRATOR
 *
 * Coordenador central do framework de governança adaptativa.
 * Unifica todos os engines, infraestrutura e tomada de decisão.
 */
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
export declare class GovernanceOrchestrator {
    private static instance;
    private logger;
    private config;
    private database;
    private redis;
    private policyEngine;
    private contextEngine;
    private learningEngine;
    private initialized;
    private eventQueue;
    private metrics;
    private constructor();
    static getInstance(): GovernanceOrchestrator;
    initialize(): Promise<void>;
    makeDecision(request: {
        userId?: string;
        resource: string;
        action: string;
        context?: Record<string, any>;
    }): Promise<GovernanceDecision>;
    emitEvent(event: Omit<GovernanceEvent, 'id' | 'timestamp'>): Promise<void>;
    getMetrics(): typeof this.metrics;
    shutdown(): Promise<void>;
    private generateId;
}
