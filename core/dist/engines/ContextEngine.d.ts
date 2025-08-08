/**
 * 🧠 CONTEXT ENGINE
 *
 * Engine de contexto com recursos avançados:
 * - Context awareness
 * - Historical tracking
 * - Pattern recognition
 * - Context compression
 * - Real-time updates
 */
export interface ContextData {
    id: string;
    sessionId: string;
    userId?: string;
    type: 'user' | 'system' | 'application' | 'environment';
    data: Record<string, any>;
    timestamp: Date;
    ttl?: number;
    metadata: {
        source: string;
        version: string;
        tags: string[];
        importance: 'low' | 'medium' | 'high' | 'critical';
    };
}
export interface ContextQuery {
    sessionId?: string;
    userId?: string;
    type?: string;
    timeRange?: {
        from: Date;
        to: Date;
    };
    tags?: string[];
    importance?: string[];
    limit?: number;
    includeExpired?: boolean;
}
export interface ContextPattern {
    id: string;
    name: string;
    pattern: Record<string, any>;
    frequency: number;
    confidence: number;
    lastSeen: Date;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        category: string;
        description: string;
    };
}
export interface ContextSnapshot {
    id: string;
    sessionId: string;
    timestamp: Date;
    contextData: ContextData[];
    patterns: ContextPattern[];
    summary: {
        totalItems: number;
        categories: Record<string, number>;
        timespan: number;
        keyInsights: string[];
    };
}
export interface ContextPrediction {
    nextAction: string;
    confidence: number;
    timeframe: number;
    factors: string[];
    alternatives: Array<{
        action: string;
        confidence: number;
    }>;
}
export declare class ContextEngine {
    private logger;
    private redis;
    private database;
    private contexts;
    private patterns;
    private compressionThreshold;
    private retentionDays;
    constructor();
    private initialize;
    private loadPatterns;
    private loadPatternsFromDatabase;
    private setupCleanupScheduler;
    addContext(context: Omit<ContextData, 'id' | 'timestamp'>): Promise<ContextData>;
    getContext(sessionId: string, query?: ContextQuery): Promise<ContextData[]>;
    private getContextsFromDatabase;
    private filterContexts;
    updateContext(contextId: string, updates: Partial<ContextData>): Promise<ContextData | null>;
    deleteContext(contextId: string): Promise<boolean>;
    private compressContexts;
    private categorizeContexts;
    private extractKeyInsights;
    private updatePatterns;
    private extractPatternSignature;
    private extractKeyFields;
    private matchesPattern;
    private generatePatternName;
    private identifyPatterns;
    analyzeContext(sessionId: string): Promise<{
        summary: Record<string, any>;
        patterns: ContextPattern[];
        trends: Record<string, number>;
        anomalies: ContextData[];
    }>;
    private getImportanceDistribution;
    private getSourceDistribution;
    private analyzeTrends;
    private detectAnomalies;
    predictNext(sessionId: string): Promise<ContextPrediction | null>;
    private predictNextAction;
    private estimateTimeframe;
    private getAlternativePredictions;
    private cleanupExpiredContexts;
    getSnapshot(snapshotId: string): Promise<ContextSnapshot | null>;
    getSnapshots(sessionId: string): Promise<ContextSnapshot[]>;
    healthCheck(): Promise<{
        healthy: boolean;
        contextsInMemory: number;
        patternsCount: number;
        oldestContext: Date | null;
    }>;
    private generateId;
}
