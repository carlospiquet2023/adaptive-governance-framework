/**
 * 📊 TELEMETRY SERVICE
 *
 * Sistema de telemetria integrado para monitoramento
 * de performance e métricas empresariais.
 */
export declare class TelemetryService {
    private static instance;
    private logger;
    private metrics;
    private startTime;
    private constructor();
    static getInstance(): TelemetryService;
    recordRequest(endpoint: string, method: string, duration: number, statusCode: number): void;
    recordDatabaseQuery(operation: string, duration: number, success: boolean): void;
    recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key?: string): void;
    recordBusinessEvent(event: string, properties?: Record<string, any>): void;
    recordPerformance(component: string, operation: string, duration: number): void;
    recordError(error: Error, context?: Record<string, any>): void;
    recordUserActivity(userId: string, action: string, resource?: string): void;
    recordSystemMetrics(): void;
    getMetrics(): Record<string, any>;
    getPrometheusMetrics(): string;
    reset(): void;
    startSystemMetricsCollection(intervalMs?: number): void;
}
