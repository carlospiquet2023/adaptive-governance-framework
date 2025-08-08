/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

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

import { Logger } from '../infrastructure/Logger';
import { RedisService } from '../infrastructure/RedisService';
import { DatabaseService } from '../infrastructure/DatabaseService';

export interface ContextData {
    id: string;
    sessionId: string;
    userId?: string;
    type: 'user' | 'system' | 'application' | 'environment';
    data: Record<string, any>;
    timestamp: Date;
    ttl?: number; // Time to live in seconds
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

export class ContextEngine {
    private logger = Logger.getInstance();
    private redis = RedisService.getInstance();
    private database = DatabaseService.getInstance();
    private contexts = new Map<string, ContextData[]>(); // sessionId -> contexts
    private patterns = new Map<string, ContextPattern>();
    private compressionThreshold = 1000; // Number of contexts before compression
    private retentionDays = 30;
    
    constructor() {
        this.initialize();
    }
    
    private async initialize(): Promise<void> {
        await this.loadPatterns();
        await this.setupCleanupScheduler();
        this.logger.info('Context Engine inicializado', {
            patterns: this.patterns.size
        });
    }
    
    private async loadPatterns(): Promise<void> {
        try {
            const cachedPatterns = await this.redis.get<ContextPattern[]>('context:patterns');
            
            if (cachedPatterns) {
                for (const pattern of cachedPatterns) {
                    this.patterns.set(pattern.id, pattern);
                }
                this.logger.debug('Patterns carregados do cache', { count: cachedPatterns.length });
            } else {
                await this.loadPatternsFromDatabase();
            }
        } catch (error) {
            this.logger.error('Falha ao carregar patterns', { error });
        }
    }
    
    private async loadPatternsFromDatabase(): Promise<void> {
        const dbPatterns = await this.database.findMany<ContextPattern>(
            'context_patterns',
            {},
            { orderBy: 'frequency', orderDirection: 'DESC' }
        );
        
        for (const pattern of dbPatterns) {
            this.patterns.set(pattern.id, pattern);
        }
        
        // Cache for future loads
        await this.redis.set('context:patterns', Array.from(this.patterns.values()), { ttl: 600 });
        
        this.logger.info('Patterns carregados do banco', { count: dbPatterns.length });
    }
    
    private async setupCleanupScheduler(): Promise<void> {
        // Clean up expired contexts every hour
        setInterval(async () => {
            try {
                await this.cleanupExpiredContexts();
            } catch (error) {
                this.logger.error('Falha na limpeza de contextos', { error });
            }
        }, 60 * 60 * 1000); // 1 hour
    }
    
    // Context management
    public async addContext(context: Omit<ContextData, 'id' | 'timestamp'>): Promise<ContextData> {
        const contextData: ContextData = {
            ...context,
            id: this.generateId(),
            timestamp: new Date()
        };
        
        // Store in memory
        const sessionContexts = this.contexts.get(context.sessionId) || [];
        sessionContexts.push(contextData);
        this.contexts.set(context.sessionId, sessionContexts);
        
        // Store in Redis with TTL
        const ttl = context.ttl || 3600; // 1 hour default
        await this.redis.hset(`context:session:${context.sessionId}`, contextData.id, contextData);
        await this.redis.expire(`context:session:${context.sessionId}`, ttl);
        
        // Store important contexts in database
        if (contextData.metadata.importance === 'high' || contextData.metadata.importance === 'critical') {
            await this.database.create('context_data', contextData);
        }
        
        // Check for compression
        if (sessionContexts.length > this.compressionThreshold) {
            await this.compressContexts(context.sessionId);
        }
        
        // Update patterns
        await this.updatePatterns(contextData);
        
        this.logger.debug('Contexto adicionado', {
            sessionId: context.sessionId,
            type: context.type,
            importance: contextData.metadata.importance
        });
        
        return contextData;
    }
    
    public async getContext(sessionId: string, query?: ContextQuery): Promise<ContextData[]> {
        let contexts: ContextData[] = [];
        
        // Try Redis first
        const redisContexts = await this.redis.hgetall<ContextData>(`context:session:${sessionId}`);
        contexts = Object.values(redisContexts);
        
        // If not in Redis or need historical data, check database
        if (contexts.length === 0 || (query?.timeRange && query.timeRange.from < new Date(Date.now() - 24 * 60 * 60 * 1000))) {
            const dbContexts = await this.getContextsFromDatabase(sessionId, query);
            contexts = [...contexts, ...dbContexts];
        }
        
        // Filter contexts based on query
        if (query) {
            contexts = this.filterContexts(contexts, query);
        }
        
        // Sort by timestamp (newest first)
        contexts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        
        // Apply limit
        if (query?.limit) {
            contexts = contexts.slice(0, query.limit);
        }
        
        return contexts;
    }
    
    private async getContextsFromDatabase(sessionId: string, query?: ContextQuery): Promise<ContextData[]> {
        const whereClause: Record<string, any> = { sessionId };
        
        if (query) {
            if (query.userId) whereClause.userId = query.userId;
            if (query.type) whereClause.type = query.type;
        }
        
        return await this.database.findMany<ContextData>('context_data', whereClause, {
            orderBy: 'timestamp',
            orderDirection: 'DESC',
            limit: query?.limit || 1000
        });
    }
    
    private filterContexts(contexts: ContextData[], query: ContextQuery): ContextData[] {
        return contexts.filter(context => {
            // Time range filter
            if (query.timeRange) {
                const contextTime = new Date(context.timestamp);
                if (contextTime < query.timeRange.from || contextTime > query.timeRange.to) {
                    return false;
                }
            }
            
            // Type filter
            if (query.type && context.type !== query.type) {
                return false;
            }
            
            // Tags filter
            if (query.tags && query.tags.length > 0) {
                const hasTag = query.tags.some(tag => context.metadata.tags.includes(tag));
                if (!hasTag) return false;
            }
            
            // Importance filter
            if (query.importance && query.importance.length > 0) {
                if (!query.importance.includes(context.metadata.importance)) {
                    return false;
                }
            }
            
            // TTL check (exclude expired unless explicitly requested)
            if (!query.includeExpired && context.ttl) {
                const expirationTime = new Date(context.timestamp.getTime() + context.ttl * 1000);
                if (expirationTime < new Date()) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    public async updateContext(contextId: string, updates: Partial<ContextData>): Promise<ContextData | null> {
        // Find context in memory first
        for (const [sessionId, sessionContexts] of this.contexts.entries()) {
            const contextIndex = sessionContexts.findIndex(c => c.id === contextId);
            if (contextIndex !== -1) {
                const updatedContext = { ...sessionContexts[contextIndex], ...updates };
                sessionContexts[contextIndex] = updatedContext;
                
                // Update Redis
                await this.redis.hset(`context:session:${sessionId}`, contextId, updatedContext);
                
                // Update database if important
                if (updatedContext.metadata.importance === 'high' || updatedContext.metadata.importance === 'critical') {
                    await this.database.update('context_data', { id: contextId }, updatedContext);
                }
                
                return updatedContext;
            }
        }
        
        // If not in memory, try database
        const dbContext = await this.database.findOne<ContextData>('context_data', { id: contextId });
        if (dbContext) {
            const updatedContext = { ...dbContext, ...updates };
            await this.database.update('context_data', { id: contextId }, updatedContext);
            return updatedContext;
        }
        
        return null;
    }
    
    public async deleteContext(contextId: string): Promise<boolean> {
        let found = false;
        
        // Remove from memory
        for (const [sessionId, sessionContexts] of this.contexts.entries()) {
            const contextIndex = sessionContexts.findIndex(c => c.id === contextId);
            if (contextIndex !== -1) {
                sessionContexts.splice(contextIndex, 1);
                found = true;
                
                // Remove from Redis
                await this.redis.hdel(`context:session:${sessionId}`, contextId);
                break;
            }
        }
        
        // Remove from database
        const deleted = await this.database.delete('context_data', { id: contextId });
        if (deleted > 0) found = true;
        
        return found;
    }
    
    // Context compression
    private async compressContexts(sessionId: string): Promise<void> {
        const contexts = this.contexts.get(sessionId) || [];
        
        if (contexts.length <= this.compressionThreshold) return;
        
        // Sort contexts by timestamp (oldest first)
        contexts.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // Keep recent contexts in memory, compress older ones
        const recentContexts = contexts.slice(-500); // Keep last 500
        const oldContexts = contexts.slice(0, -500);
        
        // Create compressed snapshot
        const snapshot: ContextSnapshot = {
            id: this.generateId(),
            sessionId,
            timestamp: new Date(),
            contextData: oldContexts,
            patterns: await this.identifyPatterns(oldContexts),
            summary: {
                totalItems: oldContexts.length,
                categories: this.categorizeContexts(oldContexts),
                timespan: oldContexts[oldContexts.length - 1].timestamp.getTime() - oldContexts[0].timestamp.getTime(),
                keyInsights: this.extractKeyInsights(oldContexts)
            }
        };
        
        // Store snapshot in database
        await this.database.create('context_snapshots', snapshot);
        
        // Update memory
        this.contexts.set(sessionId, recentContexts);
        
        // Update Redis
        await this.redis.del(`context:session:${sessionId}`);
        for (const context of recentContexts) {
            await this.redis.hset(`context:session:${sessionId}`, context.id, context);
        }
        
        this.logger.info('Contextos comprimidos', {
            sessionId,
            original: contexts.length,
            compressed: oldContexts.length,
            remaining: recentContexts.length
        });
    }
    
    private categorizeContexts(contexts: ContextData[]): Record<string, number> {
        const categories: Record<string, number> = {};
        
        for (const context of contexts) {
            const category = context.metadata.tags[0] || context.type;
            categories[category] = (categories[category] || 0) + 1;
        }
        
        return categories;
    }
    
    private extractKeyInsights(contexts: ContextData[]): string[] {
        const insights: string[] = [];
        
        // Most frequent actions
        const actions: Record<string, number> = {};
        for (const context of contexts) {
            if (context.data.action) {
                actions[context.data.action] = (actions[context.data.action] || 0) + 1;
            }
        }
        
        const topAction = Object.entries(actions).sort((a, b) => b[1] - a[1])[0];
        if (topAction) {
            insights.push(`Ação mais frequente: ${topAction[0]} (${topAction[1]}x)`);
        }
        
        // Time patterns
        const hours = contexts.map(c => new Date(c.timestamp).getHours());
        const hourCounts: Record<number, number> = {};
        for (const hour of hours) {
            hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
        
        const peakHour = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
        if (peakHour) {
            insights.push(`Horário de pico: ${peakHour[0]}h`);
        }
        
        return insights;
    }
    
    // Pattern recognition
    private async updatePatterns(context: ContextData): Promise<void> {
        // Extract pattern signature from context
        const signature = this.extractPatternSignature(context);
        
        // Find or create pattern
        let pattern = Array.from(this.patterns.values()).find(p => 
            this.matchesPattern(signature, p.pattern)
        );
        
        if (pattern) {
            // Update existing pattern
            pattern.frequency++;
            pattern.lastSeen = new Date();
            pattern.confidence = Math.min(pattern.confidence + 0.01, 1.0);
        } else {
            // Create new pattern
            pattern = {
                id: this.generateId(),
                name: this.generatePatternName(signature),
                pattern: signature,
                frequency: 1,
                confidence: 0.1,
                lastSeen: new Date(),
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    category: context.type,
                    description: `Pattern detected from ${context.metadata.source}`
                }
            };
            
            this.patterns.set(pattern.id, pattern);
        }
        
        // Save significant patterns to database
        if (pattern.frequency >= 5 && pattern.confidence >= 0.5) {
            await this.database.create('context_patterns', pattern);
        }
    }
    
    private extractPatternSignature(context: ContextData): Record<string, any> {
        return {
            type: context.type,
            source: context.metadata.source,
            tags: context.metadata.tags.sort(),
            // Extract key fields from data
            keyFields: this.extractKeyFields(context.data)
        };
    }
    
    private extractKeyFields(data: Record<string, any>): Record<string, any> {
        const keyFields: Record<string, any> = {};
        
        // Common important fields
        const importantFields = ['action', 'resource', 'status', 'category', 'type'];
        
        for (const field of importantFields) {
            if (data[field] !== undefined) {
                keyFields[field] = data[field];
            }
        }
        
        return keyFields;
    }
    
    private matchesPattern(signature: Record<string, any>, pattern: Record<string, any>): boolean {
        const signatureStr = JSON.stringify(signature);
        const patternStr = JSON.stringify(pattern);
        return signatureStr === patternStr;
    }
    
    private generatePatternName(signature: Record<string, any>): string {
        const type = signature.type || 'unknown';
        const action = signature.keyFields?.action || 'action';
        return `${type}_${action}_pattern`;
    }
    
    private async identifyPatterns(contexts: ContextData[]): Promise<ContextPattern[]> {
        const patternCounts = new Map<string, { pattern: ContextPattern; count: number }>();
        
        for (const context of contexts) {
            for (const pattern of this.patterns.values()) {
                const signature = this.extractPatternSignature(context);
                if (this.matchesPattern(signature, pattern.pattern)) {
                    const key = pattern.id;
                    const existing = patternCounts.get(key);
                    if (existing) {
                        existing.count++;
                    } else {
                        patternCounts.set(key, { pattern, count: 1 });
                    }
                }
            }
        }
        
        return Array.from(patternCounts.values())
            .sort((a, b) => b.count - a.count)
            .map(p => p.pattern);
    }
    
    // Context analysis and prediction
    public async analyzeContext(sessionId: string): Promise<{
        summary: Record<string, any>;
        patterns: ContextPattern[];
        trends: Record<string, number>;
        anomalies: ContextData[];
    }> {
        const contexts = await this.getContext(sessionId);
        
        if (contexts.length === 0) {
            return {
                summary: {},
                patterns: [],
                trends: {},
                anomalies: []
            };
        }
        
        const summary = {
            totalContexts: contexts.length,
            timespan: contexts[0].timestamp.getTime() - contexts[contexts.length - 1].timestamp.getTime(),
            categories: this.categorizeContexts(contexts),
            importance: this.getImportanceDistribution(contexts),
            sources: this.getSourceDistribution(contexts)
        };
        
        const patterns = await this.identifyPatterns(contexts);
        const trends = this.analyzeTrends(contexts);
        const anomalies = this.detectAnomalies(contexts);
        
        return { summary, patterns, trends, anomalies };
    }
    
    private getImportanceDistribution(contexts: ContextData[]): Record<string, number> {
        const distribution: Record<string, number> = {};
        for (const context of contexts) {
            const importance = context.metadata.importance;
            distribution[importance] = (distribution[importance] || 0) + 1;
        }
        return distribution;
    }
    
    private getSourceDistribution(contexts: ContextData[]): Record<string, number> {
        const distribution: Record<string, number> = {};
        for (const context of contexts) {
            const source = context.metadata.source;
            distribution[source] = (distribution[source] || 0) + 1;
        }
        return distribution;
    }
    
    private analyzeTrends(contexts: ContextData[]): Record<string, number> {
        const trends: Record<string, number> = {};
        
        // Analyze frequency trends over time
        const recentContexts = contexts.slice(0, Math.floor(contexts.length / 2));
        const olderContexts = contexts.slice(Math.floor(contexts.length / 2));
        
        const recentCategories = this.categorizeContexts(recentContexts);
        const olderCategories = this.categorizeContexts(olderContexts);
        
        for (const category in recentCategories) {
            const recentCount = recentCategories[category] || 0;
            const olderCount = olderCategories[category] || 0;
            
            if (olderCount > 0) {
                trends[category] = (recentCount - olderCount) / olderCount;
            } else if (recentCount > 0) {
                trends[category] = 1; // New category
            }
        }
        
        return trends;
    }
    
    private detectAnomalies(contexts: ContextData[]): ContextData[] {
        const anomalies: ContextData[] = [];
        
        // Simple anomaly detection based on frequency
        const categories = this.categorizeContexts(contexts);
        const avgFrequency = Object.values(categories).reduce((a, b) => a + b, 0) / Object.keys(categories).length;
        
        for (const context of contexts) {
            const category = context.metadata.tags[0] || context.type;
            const frequency = categories[category];
            
            // Mark as anomaly if frequency is very different from average
            if (frequency < avgFrequency * 0.1 || frequency > avgFrequency * 3) {
                anomalies.push(context);
            }
        }
        
        return anomalies;
    }
    
    public async predictNext(sessionId: string): Promise<ContextPrediction | null> {
        const contexts = await this.getContext(sessionId, { limit: 100 });
        
        if (contexts.length < 5) return null;
        
        // Analyze recent patterns
        const recentPatterns = await this.identifyPatterns(contexts.slice(0, 20));
        
        if (recentPatterns.length === 0) return null;
        
        const strongestPattern = recentPatterns[0];
        
        // Predict based on strongest pattern
        const nextAction = this.predictNextAction(contexts, strongestPattern);
        
        return {
            nextAction,
            confidence: strongestPattern.confidence,
            timeframe: this.estimateTimeframe(contexts),
            factors: [`Pattern: ${strongestPattern.name}`, `Frequency: ${strongestPattern.frequency}`],
            alternatives: this.getAlternativePredictions(recentPatterns)
        };
    }
    
    private predictNextAction(contexts: ContextData[], pattern: ContextPattern): string {
        // Simple prediction based on most common next action after pattern
        const patternContexts = contexts.filter(c => {
            const signature = this.extractPatternSignature(c);
            return this.matchesPattern(signature, pattern.pattern);
        });
        
        const nextActions: Record<string, number> = {};
        
        for (let i = 0; i < patternContexts.length - 1; i++) {
            const nextContext = patternContexts[i + 1];
            const action = nextContext.data.action || 'unknown';
            nextActions[action] = (nextActions[action] || 0) + 1;
        }
        
        const mostLikely = Object.entries(nextActions).sort((a, b) => b[1] - a[1])[0];
        return mostLikely ? mostLikely[0] : 'unknown';
    }
    
    private estimateTimeframe(contexts: ContextData[]): number {
        if (contexts.length < 2) return 0;
        
        // Calculate average time between contexts
        let totalTime = 0;
        for (let i = 0; i < contexts.length - 1; i++) {
            totalTime += contexts[i].timestamp.getTime() - contexts[i + 1].timestamp.getTime();
        }
        
        return totalTime / (contexts.length - 1);
    }
    
    private getAlternativePredictions(patterns: ContextPattern[]): Array<{ action: string; confidence: number }> {
        return patterns.slice(1, 4).map(pattern => ({
            action: pattern.name,
            confidence: pattern.confidence
        }));
    }
    
    // Cleanup and maintenance
    private async cleanupExpiredContexts(): Promise<void> {
        const cutoffTime = new Date(Date.now() - this.retentionDays * 24 * 60 * 60 * 1000);
        
        // Clean up database
        await this.database.query(
            'DELETE FROM context_data WHERE timestamp < $1',
            [cutoffTime]
        );
        
        // Clean up memory
        for (const [sessionId, contexts] of this.contexts.entries()) {
            const validContexts = contexts.filter(c => {
                if (c.ttl) {
                    const expirationTime = new Date(c.timestamp.getTime() + c.ttl * 1000);
                    return expirationTime > new Date();
                }
                return c.timestamp > cutoffTime;
            });
            
            if (validContexts.length !== contexts.length) {
                this.contexts.set(sessionId, validContexts);
            }
        }
        
        this.logger.info('Limpeza de contextos expirados concluída');
    }
    
    public async getSnapshot(snapshotId: string): Promise<ContextSnapshot | null> {
        return await this.database.findOne<ContextSnapshot>('context_snapshots', { id: snapshotId });
    }
    
    public async getSnapshots(sessionId: string): Promise<ContextSnapshot[]> {
        return await this.database.findMany<ContextSnapshot>('context_snapshots', 
            { sessionId },
            { orderBy: 'timestamp', orderDirection: 'DESC' }
        );
    }
    
    // Health check
    public async healthCheck(): Promise<{
        healthy: boolean;
        contextsInMemory: number;
        patternsCount: number;
        oldestContext: Date | null;
    }> {
        try {
            let totalContexts = 0;
            let oldestTimestamp: number | null = null;
            
            for (const contexts of this.contexts.values()) {
                totalContexts += contexts.length;
                for (const context of contexts) {
                    const timestamp = context.timestamp.getTime();
                    if (oldestTimestamp === null || timestamp < oldestTimestamp) {
                        oldestTimestamp = timestamp;
                    }
                }
            }
            
            return {
                healthy: true,
                contextsInMemory: totalContexts,
                patternsCount: this.patterns.size,
                oldestContext: oldestTimestamp ? new Date(oldestTimestamp) : null
            };
        } catch (error) {
            this.logger.error('Health check do Context Engine falhou', { error });
            return {
                healthy: false,
                contextsInMemory: 0,
                patternsCount: 0,
                oldestContext: null
            };
        }
    }
    
    // Utility methods
    private generateId(): string {
        return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
