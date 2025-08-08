export interface ModelInfo {
    id: string;
    name: string;
    type: 'classification' | 'regression' | 'embedding' | 'rl' | 'custom';
    version: string;
    metrics?: Record<string, number>;
    trainedAt?: Date;
    active?: boolean;
    metadata?: Record<string, any>;
}
export declare class ModelRegistry {
    private static instance;
    private models;
    private logger;
    private constructor();
    static getInstance(): ModelRegistry;
    list(): ModelInfo[];
    get(id: string): ModelInfo | undefined;
    register(model: Omit<ModelInfo, 'id'>): ModelInfo;
    activate(id: string): void;
    deactivate(id: string): void;
}
