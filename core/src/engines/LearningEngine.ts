/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

/**
 * 🤖 LEARNING ENGINE
 * 
 * Engine de aprendizado com recursos avançados:
 * - Machine Learning models
 * - Feedback loops
 * - Model training and evaluation
 * - Adaptive optimization
 * - Performance monitoring
 */

import { Logger } from '../infrastructure/Logger';
import { RedisService } from '../infrastructure/RedisService';
import { DatabaseService } from '../infrastructure/DatabaseService';

export interface LearningModel {
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'clustering' | 'reinforcement';
    version: string;
    status: 'training' | 'ready' | 'deployed' | 'deprecated';
    accuracy: number;
    performance: {
        precision: number;
        recall: number;
        f1Score: number;
        trainingTime: number;
        inferenceTime: number;
    };
    parameters: Record<string, any>;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        trainedBy: string;
        datasetSize: number;
        features: string[];
        description: string;
    };
}

export interface TrainingData {
    id: string;
    modelId: string;
    features: Record<string, any>;
    target: any;
    timestamp: Date;
    source: string;
    validated: boolean;
    metadata: {
        sessionId?: string;
        userId?: string;
        context?: Record<string, any>;
        feedback?: number; // -1 to 1 scale
    };
}

export interface Prediction {
    id: string;
    modelId: string;
    input: Record<string, any>;
    output: any;
    confidence: number;
    timestamp: Date;
    processing_time: number;
    metadata: {
        version: string;
        features_used: string[];
        context?: Record<string, any>;
    };
}

export interface FeedbackData {
    id: string;
    predictionId: string;
    actualOutcome: any;
    userFeedback: number; // -1 to 1 scale
    timestamp: Date;
    source: string;
    metadata: {
        userId?: string;
        sessionId?: string;
        context?: Record<string, any>;
    };
}

export interface ModelEvaluation {
    modelId: string;
    timestamp: Date;
    metrics: {
        accuracy: number;
        precision: number;
        recall: number;
        f1Score: number;
        auc?: number;
        rmse?: number;
        mae?: number;
    };
    testSize: number;
    confusionMatrix?: number[][];
    featureImportance: Record<string, number>;
}

export interface LearningInsight {
    id: string;
    type: 'pattern' | 'anomaly' | 'trend' | 'correlation';
    title: string;
    description: string;
    confidence: number;
    data: Record<string, any>;
    timestamp: Date;
    actionable: boolean;
    recommendations: string[];
}

export class LearningEngine {
    private logger = Logger.getInstance();
    private redis = RedisService.getInstance();
    private database = DatabaseService.getInstance();
    private models = new Map<string, LearningModel>();
    private trainingQueue: TrainingData[] = [];
    private feedbackBuffer: FeedbackData[] = [];
    private insights = new Map<string, LearningInsight>();
    private isTraining = false;
    private trainingSchedule?: NodeJS.Timeout;
    
    constructor() {
        this.initialize();
    }
    
    private async initialize(): Promise<void> {
        await this.loadModels();
        await this.setupTrainingSchedule();
        await this.setupFeedbackProcessing();
        this.logger.info('Learning Engine inicializado', {
            models: this.models.size,
            trainingQueue: this.trainingQueue.length
        });
    }
    
    private async loadModels(): Promise<void> {
        try {
            // Load from cache first
            const cachedModels = await this.redis.get<LearningModel[]>('learning:models');
            
            if (cachedModels) {
                for (const model of cachedModels) {
                    this.models.set(model.id, model);
                }
                this.logger.debug('Modelos carregados do cache', { count: cachedModels.length });
            } else {
                await this.loadModelsFromDatabase();
            }
            
            // Load default models if none exist
            if (this.models.size === 0) {
                await this.createDefaultModels();
            }
            
        } catch (error) {
            this.logger.error('Falha ao carregar modelos', { error });
        }
    }
    
    private async loadModelsFromDatabase(): Promise<void> {
        const dbModels = await this.database.findMany<LearningModel>(
            'learning_models',
            { status: 'ready' },
            { orderBy: 'accuracy', orderDirection: 'DESC' }
        );
        
        for (const model of dbModels) {
            this.models.set(model.id, model);
        }
        
        // Cache models
        await this.redis.set('learning:models', Array.from(this.models.values()), { ttl: 600 });
        
        this.logger.info('Modelos carregados do banco', { count: dbModels.length });
    }
    
    private async createDefaultModels(): Promise<void> {
        const defaultModels: Omit<LearningModel, 'id' | 'metadata'>[] = [
            {
                name: 'UserBehaviorClassifier',
                type: 'classification',
                version: '1.0.0',
                status: 'ready',
                accuracy: 0.75,
                performance: {
                    precision: 0.78,
                    recall: 0.72,
                    f1Score: 0.75,
                    trainingTime: 120000,
                    inferenceTime: 50
                },
                parameters: {
                    algorithm: 'random_forest',
                    n_estimators: 100,
                    max_depth: 10
                }
            },
            {
                name: 'PolicyOptimizer',
                type: 'reinforcement',
                version: '1.0.0',
                status: 'ready',
                accuracy: 0.68,
                performance: {
                    precision: 0.70,
                    recall: 0.66,
                    f1Score: 0.68,
                    trainingTime: 300000,
                    inferenceTime: 80
                },
                parameters: {
                    algorithm: 'q_learning',
                    learning_rate: 0.01,
                    epsilon: 0.1,
                    discount_factor: 0.95
                }
            },
            {
                name: 'AnomalyDetector',
                type: 'clustering',
                version: '1.0.0',
                status: 'ready',
                accuracy: 0.82,
                performance: {
                    precision: 0.85,
                    recall: 0.79,
                    f1Score: 0.82,
                    trainingTime: 90000,
                    inferenceTime: 30
                },
                parameters: {
                    algorithm: 'isolation_forest',
                    contamination: 0.1,
                    n_estimators: 50
                }
            }
        ];
        
        for (const modelData of defaultModels) {
            const model = await this.createModel(modelData);
            this.logger.info('Modelo padrão criado', { modelId: model.id, name: model.name });
        }
    }
    
    private async setupTrainingSchedule(): Promise<void> {
        // Schedule periodic training (every 6 hours)
        this.trainingSchedule = setInterval(async () => {
            try {
                if (!this.isTraining && this.trainingQueue.length >= 10) {
                    await this.performScheduledTraining();
                }
            } catch (error) {
                this.logger.error('Erro no treinamento agendado', { error });
            }
        }, 6 * 60 * 60 * 1000);
        
        this.logger.info('Agendamento de treinamento configurado');
    }
    
    private async setupFeedbackProcessing(): Promise<void> {
        // Process feedback buffer every 5 minutes
        setInterval(async () => {
            try {
                if (this.feedbackBuffer.length > 0) {
                    await this.processFeedbackBuffer();
                }
            } catch (error) {
                this.logger.error('Erro no processamento de feedback', { error });
            }
        }, 5 * 60 * 1000);
    }
    
    // Model management
    public async createModel(modelData: Omit<LearningModel, 'id' | 'metadata'>): Promise<LearningModel> {
        const model: LearningModel = {
            ...modelData,
            id: this.generateId(),
            metadata: {
                createdAt: new Date(),
                updatedAt: new Date(),
                trainedBy: 'system',
                datasetSize: 0,
                features: [],
                description: `${modelData.type} model: ${modelData.name}`
            }
        };
        
        // Save to database
        await this.database.create('learning_models', model);
        
        // Add to memory
        this.models.set(model.id, model);
        
        // Invalidate cache
        await this.redis.del('learning:models');
        
        this.logger.info('Novo modelo criado', {
            modelId: model.id,
            name: model.name,
            type: model.type
        });
        
        return model;
    }
    
    public async updateModel(modelId: string, updates: Partial<LearningModel>): Promise<LearningModel> {
        const existing = this.models.get(modelId);
        if (!existing) {
            throw new Error(`Modelo não encontrado: ${modelId}`);
        }
        
        const updated: LearningModel = {
            ...existing,
            ...updates,
            metadata: {
                ...existing.metadata,
                updatedAt: new Date()
            }
        };
        
        // Save to database
        await this.database.update('learning_models', { id: modelId }, updated);
        
        // Update memory
        this.models.set(modelId, updated);
        
        // Invalidate cache
        await this.redis.del('learning:models');
        
        this.logger.info('Modelo atualizado', { modelId, name: updated.name });
        
        return updated;
    }
    
    public getModel(modelId: string): LearningModel | undefined {
        return this.models.get(modelId);
    }
    
    public getModels(filter?: {
        type?: string;
        status?: string;
        minAccuracy?: number;
    }): LearningModel[] {
        let models = Array.from(this.models.values());
        
        if (filter) {
            if (filter.type) {
                models = models.filter(m => m.type === filter.type);
            }
            if (filter.status) {
                models = models.filter(m => m.status === filter.status);
            }
            if (filter.minAccuracy) {
                models = models.filter(m => m.accuracy >= (filter.minAccuracy || 0));
            }
        }
        
        return models.sort((a, b) => b.accuracy - a.accuracy);
    }
    
    // Prediction and inference
    public async predict(
        modelId: string,
        input: Record<string, any>,
        context?: Record<string, any>
    ): Promise<Prediction> {
        const model = this.models.get(modelId);
        if (!model || model.status !== 'ready') {
            throw new Error(`Modelo não disponível: ${modelId}`);
        }
        
        const start = Date.now();
        
        // Perform prediction (simplified mock implementation)
        const output = await this.performPrediction(model, input);
        const confidence = this.calculateConfidence(model, input, output);
        
        const prediction: Prediction = {
            id: this.generateId(),
            modelId,
            input,
            output,
            confidence,
            timestamp: new Date(),
            processing_time: Date.now() - start,
            metadata: {
                version: model.version,
                features_used: Object.keys(input),
                context
            }
        };
        
        // Store prediction for feedback tracking
        await this.database.create('predictions', prediction);
        
        // Cache recent predictions
        await this.redis.lpush(`predictions:${modelId}`, prediction);
        await this.redis.expire(`predictions:${modelId}`, 3600); // 1 hour
        
        this.logger.debug('Predição realizada', {
            modelId,
            predictionId: prediction.id,
            confidence,
            processingTime: prediction.processing_time
        });
        
        return prediction;
    }
    
    private async performPrediction(model: LearningModel, input: Record<string, any>): Promise<any> {
        // Simplified prediction logic - in reality would use ML libraries
        switch (model.type) {
            case 'classification':
                return this.performClassification(model, input);
            case 'regression':
                return this.performRegression(model, input);
            case 'clustering':
                return this.performClustering(model, input);
            case 'reinforcement':
                return this.performReinforcementLearning(model, input);
            default:
                throw new Error(`Tipo de modelo não suportado: ${model.type}`);
        }
    }
    
    private performClassification(model: LearningModel, input: Record<string, any>): any {
        // Mock classification - would use actual ML model
        const features = Object.values(input);
        const sum = features.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
        
        if (model.name === 'UserBehaviorClassifier') {
            return sum > 50 ? 'high_risk' : sum > 20 ? 'medium_risk' : 'low_risk';
        }
        
        return 'unknown';
    }
    
    private performRegression(model: LearningModel, input: Record<string, any>): number {
        // Mock regression
        const features = Object.values(input).filter(v => typeof v === 'number') as number[];
        return features.reduce((a, b) => a + b, 0) / features.length;
    }
    
    private performClustering(model: LearningModel, input: Record<string, any>): string {
        // Mock clustering
        const features = Object.values(input);
        const sum = features.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
        return `cluster_${sum % 3}`;
    }
    
    private performReinforcementLearning(model: LearningModel, input: Record<string, any>): any {
        // Mock RL action selection
        const actions = ['allow', 'deny', 'review', 'escalate'];
        const features = Object.values(input);
        const sum = features.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
        return actions[sum % actions.length];
    }
    
    private calculateConfidence(model: LearningModel, input: Record<string, any>, output: any): number {
        // Simplified confidence calculation
        const baseConfidence = model.accuracy;
        const inputComplexity = Object.keys(input).length;
        
        // Adjust confidence based on input complexity and model parameters
        let confidence = baseConfidence;
        
        if (inputComplexity < 3) {
            confidence *= 0.8; // Lower confidence for simple inputs
        } else if (inputComplexity > 10) {
            confidence *= 0.9; // Slightly lower for very complex inputs
        }
        
        return Math.max(0.1, Math.min(0.99, confidence));
    }
    
    // Training and learning
    public async addTrainingData(data: Omit<TrainingData, 'id' | 'timestamp'>): Promise<TrainingData> {
        const trainingData: TrainingData = {
            ...data,
            id: this.generateId(),
            timestamp: new Date()
        };
        
        // Add to queue
        this.trainingQueue.push(trainingData);
        
        // Store in database
        await this.database.create('training_data', trainingData);
        
        // Trigger training if queue is large enough
        if (this.trainingQueue.length >= 50 && !this.isTraining) {
            setImmediate(() => this.performScheduledTraining());
        }
        
        this.logger.debug('Dados de treinamento adicionados', {
            modelId: data.modelId,
            queueSize: this.trainingQueue.length
        });
        
        return trainingData;
    }
    
    public async trainModel(modelId: string, options?: {
        maxSamples?: number;
        validationSplit?: number;
        epochs?: number;
    }): Promise<ModelEvaluation> {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Modelo não encontrado: ${modelId}`);
        }
        
        this.isTraining = true;
        const start = Date.now();
        
        try {
            // Get training data
            const trainingData = await this.database.findMany<TrainingData>(
                'training_data',
                { modelId, validated: true },
                { 
                    limit: options?.maxSamples || 1000,
                    orderBy: 'timestamp',
                    orderDirection: 'DESC'
                }
            );
            
            if (trainingData.length < 10) {
                throw new Error('Dados insuficientes para treinamento');
            }
            
            // Perform training (mock implementation)
            const evaluation = await this.performTraining(model, trainingData, options);
            
            // Update model with new performance metrics
            await this.updateModel(modelId, {
                accuracy: evaluation.metrics.accuracy,
                performance: {
                    ...model.performance,
                    precision: evaluation.metrics.precision,
                    recall: evaluation.metrics.recall,
                    f1Score: evaluation.metrics.f1Score,
                    trainingTime: Date.now() - start
                },
                metadata: {
                    ...model.metadata,
                    updatedAt: new Date(),
                    datasetSize: trainingData.length
                }
            });
            
            // Store evaluation
            await this.database.create('model_evaluations', evaluation);
            
            this.logger.info('Treinamento do modelo concluído', {
                modelId,
                accuracy: evaluation.metrics.accuracy,
                trainingTime: Date.now() - start,
                datasetSize: trainingData.length
            });
            
            return evaluation;
            
        } finally {
            this.isTraining = false;
        }
    }
    
    private async performTraining(
        model: LearningModel,
        trainingData: TrainingData[],
        options?: any
    ): Promise<ModelEvaluation> {
        // Mock training implementation
        const validationSplit = options?.validationSplit || 0.2;
        const testSize = Math.floor(trainingData.length * validationSplit);
        
        // Simulate training metrics improvement
        const currentAccuracy = model.accuracy;
        const improvementFactor = Math.min(0.1, trainingData.length / 1000 * 0.05);
        const newAccuracy = Math.min(0.95, currentAccuracy + improvementFactor);
        
        const evaluation: ModelEvaluation = {
            modelId: model.id,
            timestamp: new Date(),
            metrics: {
                accuracy: newAccuracy,
                precision: newAccuracy + 0.02,
                recall: newAccuracy - 0.01,
                f1Score: newAccuracy,
                auc: model.type === 'classification' ? newAccuracy + 0.03 : undefined
            },
            testSize,
            featureImportance: this.calculateFeatureImportance(trainingData)
        };
        
        return evaluation;
    }
    
    private calculateFeatureImportance(trainingData: TrainingData[]): Record<string, number> {
        const importance: Record<string, number> = {};
        
        // Calculate simple feature importance based on frequency
        for (const data of trainingData) {
            for (const feature of Object.keys(data.features)) {
                importance[feature] = (importance[feature] || 0) + 1;
            }
        }
        
        // Normalize
        const total = Object.values(importance).reduce((a, b) => a + b, 0);
        for (const feature in importance) {
            importance[feature] /= total;
        }
        
        return importance;
    }
    
    private async performScheduledTraining(): Promise<void> {
        if (this.isTraining) return;
        
        // Group training data by model
        const modelGroups = new Map<string, TrainingData[]>();
        
        for (const data of this.trainingQueue) {
            const existing = modelGroups.get(data.modelId) || [];
            existing.push(data);
            modelGroups.set(data.modelId, existing);
        }
        
        // Train models with enough data
        for (const [modelId, data] of modelGroups.entries()) {
            if (data.length >= 20) {
                try {
                    await this.trainModel(modelId, { maxSamples: data.length });
                    
                    // Remove trained data from queue
                    this.trainingQueue = this.trainingQueue.filter(d => d.modelId !== modelId);
                    
                } catch (error) {
                    this.logger.error('Falha no treinamento agendado', { 
                        modelId, 
                        error,
                        dataSize: data.length 
                    });
                }
            }
        }
    }
    
    // Feedback processing
    public async addFeedback(feedback: Omit<FeedbackData, 'id' | 'timestamp'>): Promise<FeedbackData> {
        const feedbackData: FeedbackData = {
            ...feedback,
            id: this.generateId(),
            timestamp: new Date()
        };
        
        // Add to buffer
        this.feedbackBuffer.push(feedbackData);
        
        // Store in database
        await this.database.create('feedback_data', feedbackData);
        
        this.logger.debug('Feedback adicionado', {
            predictionId: feedback.predictionId,
            feedback: feedback.userFeedback
        });
        
        return feedbackData;
    }
    
    private async processFeedbackBuffer(): Promise<void> {
        if (this.feedbackBuffer.length === 0) return;
        
        // Process feedback to create training data
        for (const feedback of this.feedbackBuffer) {
            try {
                const prediction = await this.database.findOne<Prediction>(
                    'predictions',
                    { id: feedback.predictionId }
                );
                
                if (prediction) {
                    // Create training data from feedback
                    const trainingData: Omit<TrainingData, 'id' | 'timestamp'> = {
                        modelId: prediction.modelId,
                        features: prediction.input,
                        target: feedback.actualOutcome || prediction.output,
                        source: 'feedback',
                        validated: Math.abs(feedback.userFeedback) > 0.5,
                        metadata: {
                            ...feedback.metadata,
                            feedback: feedback.userFeedback
                        }
                    };
                    
                    await this.addTrainingData(trainingData);
                }
                
            } catch (error) {
                this.logger.error('Erro ao processar feedback', {
                    feedbackId: feedback.id,
                    error
                });
            }
        }
        
        // Clear buffer
        this.feedbackBuffer = [];
        
        this.logger.info('Buffer de feedback processado', {
            processed: this.feedbackBuffer.length
        });
    }
    
    // Insights and analytics
    public async generateInsights(): Promise<LearningInsight[]> {
        const insights: LearningInsight[] = [];
        
        // Analyze model performance trends
        const performanceInsight = await this.analyzePerformanceTrends();
        if (performanceInsight) insights.push(performanceInsight);
        
        // Analyze data patterns
        const patternInsight = await this.analyzeDataPatterns();
        if (patternInsight) insights.push(patternInsight);
        
        // Analyze feedback trends
        const feedbackInsight = await this.analyzeFeedbackTrends();
        if (feedbackInsight) insights.push(feedbackInsight);
        
        // Store insights
        for (const insight of insights) {
            this.insights.set(insight.id, insight);
            await this.database.create('learning_insights', insight);
        }
        
        return insights;
    }
    
    private async analyzePerformanceTrends(): Promise<LearningInsight | null> {
        const evaluations = await this.database.findMany<ModelEvaluation>(
            'model_evaluations',
            {},
            { orderBy: 'timestamp', orderDirection: 'DESC', limit: 100 }
        );
        
        if (evaluations.length < 5) return null;
        
        // Calculate trend
        const recentAccuracy = evaluations.slice(0, 10).reduce((a, b) => a + b.metrics.accuracy, 0) / 10;
        const olderAccuracy = evaluations.slice(-10).reduce((a, b) => a + b.metrics.accuracy, 0) / 10;
        const trend = recentAccuracy - olderAccuracy;
        
        if (Math.abs(trend) > 0.05) {
            return {
                id: this.generateId(),
                type: 'trend',
                title: trend > 0 ? 'Melhoria de Performance' : 'Degradação de Performance',
                description: `Tendência de ${trend > 0 ? 'melhoria' : 'degradação'} detectada nos modelos`,
                confidence: Math.min(0.9, Math.abs(trend) * 10),
                data: { trend, recentAccuracy, olderAccuracy },
                timestamp: new Date(),
                actionable: true,
                recommendations: trend > 0 ? 
                    ['Continue o treinamento regular', 'Monitore dados de entrada'] :
                    ['Revisar dados de treinamento', 'Considerar retreinamento', 'Verificar drift de dados']
            };
        }
        
        return null;
    }
    
    private async analyzeDataPatterns(): Promise<LearningInsight | null> {
        const recentData = await this.database.findMany<TrainingData>(
            'training_data',
            {},
            { orderBy: 'timestamp', orderDirection: 'DESC', limit: 1000 }
        );
        
        if (recentData.length < 100) return null;
        
        // Analyze feature patterns
        const featureCounts: Record<string, number> = {};
        for (const data of recentData) {
            for (const feature of Object.keys(data.features)) {
                featureCounts[feature] = (featureCounts[feature] || 0) + 1;
            }
        }
        
        const topFeatures = Object.entries(featureCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        return {
            id: this.generateId(),
            type: 'pattern',
            title: 'Padrões de Features',
            description: 'Padrões identificados nos dados de entrada',
            confidence: 0.8,
            data: { topFeatures, totalSamples: recentData.length },
            timestamp: new Date(),
            actionable: true,
            recommendations: [
                'Considere otimizar modelos para features mais frequentes',
                'Monitore qualidade das features principais'
            ]
        };
    }
    
    private async analyzeFeedbackTrends(): Promise<LearningInsight | null> {
        const feedbacks = await this.database.findMany<FeedbackData>(
            'feedback_data',
            {},
            { orderBy: 'timestamp', orderDirection: 'DESC', limit: 500 }
        );
        
        if (feedbacks.length < 20) return null;
        
        const averageFeedback = feedbacks.reduce((a, b) => a + b.userFeedback, 0) / feedbacks.length;
        const negativeFeedback = feedbacks.filter(f => f.userFeedback < -0.3).length;
        const negativeFeedbackRate = negativeFeedback / feedbacks.length;
        
        if (negativeFeedbackRate > 0.3) {
            return {
                id: this.generateId(),
                type: 'anomaly',
                title: 'Alto Índice de Feedback Negativo',
                description: `${(negativeFeedbackRate * 100).toFixed(1)}% de feedback negativo detectado`,
                confidence: 0.9,
                data: { averageFeedback, negativeFeedbackRate, totalFeedbacks: feedbacks.length },
                timestamp: new Date(),
                actionable: true,
                recommendations: [
                    'Investigar causas do feedback negativo',
                    'Considerar retreinamento dos modelos',
                    'Revisar critérios de validação'
                ]
            };
        }
        
        return null;
    }
    
    public getInsights(filter?: {
        type?: string;
        actionable?: boolean;
        minConfidence?: number;
    }): LearningInsight[] {
        let insights = Array.from(this.insights.values());
        
        if (filter) {
            if (filter.type) {
                insights = insights.filter(i => i.type === filter.type);
            }
            if (filter.actionable !== undefined) {
                insights = insights.filter(i => i.actionable === filter.actionable);
            }
            if (filter.minConfidence) {
                insights = insights.filter(i => i.confidence >= (filter.minConfidence || 0));
            }
        }
        
        return insights.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    
    // Health check and monitoring
    public async healthCheck(): Promise<{
        healthy: boolean;
        modelsCount: number;
        trainingQueueSize: number;
        feedbackBufferSize: number;
        averageAccuracy: number;
        lastTraining?: Date;
    }> {
        try {
            const models = Array.from(this.models.values());
            const averageAccuracy = models.length > 0 ? 
                models.reduce((a, b) => a + b.accuracy, 0) / models.length : 0;
            
            const lastEvaluation = await this.database.findMany<ModelEvaluation>(
                'model_evaluations',
                {},
                { orderBy: 'timestamp', orderDirection: 'DESC', limit: 1 }
            );
            
            return {
                healthy: true,
                modelsCount: this.models.size,
                trainingQueueSize: this.trainingQueue.length,
                feedbackBufferSize: this.feedbackBuffer.length,
                averageAccuracy,
                lastTraining: lastEvaluation.length > 0 ? lastEvaluation[0].timestamp : undefined
            };
        } catch (error) {
            this.logger.error('Health check do Learning Engine falhou', { error });
            return {
                healthy: false,
                modelsCount: 0,
                trainingQueueSize: 0,
                feedbackBufferSize: 0,
                averageAccuracy: 0
            };
        }
    }
    
    // Cleanup
    public async cleanup(): Promise<void> {
        if (this.trainingSchedule) {
        if (this.trainingSchedule) {
            clearInterval(this.trainingSchedule);
            this.trainingSchedule = undefined;
        }
        }
        
        // Clean up old predictions and evaluations
        const cutoffTime = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
        
        await Promise.all([
            this.database.query('DELETE FROM predictions WHERE timestamp < $1', [cutoffTime]),
            this.database.query('DELETE FROM model_evaluations WHERE timestamp < $1', [cutoffTime]),
            this.database.query('DELETE FROM learning_insights WHERE timestamp < $1', [cutoffTime])
        ]);
        
        this.logger.info('Limpeza do Learning Engine concluída');
    }
    
    // Utility methods
    private generateId(): string {
        return `learn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}
