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
        feedback?: number;
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
    userFeedback: number;
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
export declare class LearningEngine {
    private logger;
    private redis;
    private database;
    private models;
    private trainingQueue;
    private feedbackBuffer;
    private insights;
    private isTraining;
    private trainingSchedule?;
    constructor();
    private initialize;
    private loadModels;
    private loadModelsFromDatabase;
    private createDefaultModels;
    private setupTrainingSchedule;
    private setupFeedbackProcessing;
    createModel(modelData: Omit<LearningModel, 'id' | 'metadata'>): Promise<LearningModel>;
    updateModel(modelId: string, updates: Partial<LearningModel>): Promise<LearningModel>;
    getModel(modelId: string): LearningModel | undefined;
    getModels(filter?: {
        type?: string;
        status?: string;
        minAccuracy?: number;
    }): LearningModel[];
    predict(modelId: string, input: Record<string, any>, context?: Record<string, any>): Promise<Prediction>;
    private performPrediction;
    private performClassification;
    private performRegression;
    private performClustering;
    private performReinforcementLearning;
    private calculateConfidence;
    addTrainingData(data: Omit<TrainingData, 'id' | 'timestamp'>): Promise<TrainingData>;
    trainModel(modelId: string, options?: {
        maxSamples?: number;
        validationSplit?: number;
        epochs?: number;
    }): Promise<ModelEvaluation>;
    private performTraining;
    private calculateFeatureImportance;
    private performScheduledTraining;
    addFeedback(feedback: Omit<FeedbackData, 'id' | 'timestamp'>): Promise<FeedbackData>;
    private processFeedbackBuffer;
    generateInsights(): Promise<LearningInsight[]>;
    private analyzePerformanceTrends;
    private analyzeDataPatterns;
    private analyzeFeedbackTrends;
    getInsights(filter?: {
        type?: string;
        actionable?: boolean;
        minConfidence?: number;
    }): LearningInsight[];
    healthCheck(): Promise<{
        healthy: boolean;
        modelsCount: number;
        trainingQueueSize: number;
        feedbackBufferSize: number;
        averageAccuracy: number;
        lastTraining?: Date;
    }>;
    cleanup(): Promise<void>;
    private generateId;
}
