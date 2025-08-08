/**
 * 🔧 ENTERPRISE LOGGER
 *
 * Sistema unificado de logging com recursos avançados:
 * - Rotação automática de logs
 * - Diferentes níveis e destinos
 * - Correlação de eventos
 * - Métricas integradas
 */
export interface LogContext {
    [key: string]: unknown;
    correlationId?: string;
    userId?: string;
    operation?: string;
}
export declare class Logger {
    private static instance;
    private winston;
    private correlationId?;
    private constructor();
    static getInstance(): Logger;
    private setupLogger;
    setCorrelationId(id: string): void;
    clearCorrelationId(): void;
    info(message: string, context?: LogContext): void;
    error(message: string, context?: LogContext): void;
    warn(message: string, context?: LogContext): void;
    debug(message: string, context?: LogContext): void;
    audit(action: string, context?: LogContext): void;
    security(event: string, context?: LogContext): void;
    performance(metric: string, value: number, context?: LogContext): void;
    business(event: string, context?: LogContext): void;
    queryLogs(options?: {
        level?: string;
        from?: Date;
        to?: Date;
        limit?: number;
    }): Promise<any[]>;
    healthCheck(): Promise<boolean>;
}
