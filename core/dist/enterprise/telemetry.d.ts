export declare class TelemetryService {
    private static instance;
    private metrics;
    private logger;
    private constructor();
    static getInstance(): TelemetryService;
    recordLatency(operation: string, timeMs: number): void;
    incrementPolicyExecution(policyId: string, success: boolean): void;
    recordMemoryUsage(): void;
    generateInsights(): Promise<any>;
    private analyzeTrends;
    private generatePredictions;
    private generateRecommendations;
}
