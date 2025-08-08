/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

/**
 * 🔧 ENTERPRISE LOGGER
 * 
 * Sistema unificado de logging com recursos avançados:
 * - Rotação automática de logs
 * - Diferentes níveis e destinos
 * - Correlação de eventos
 * - Métricas integradas
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface LogContext {
    [key: string]: unknown;
    correlationId?: string;
    userId?: string;
    operation?: string;
}

export class Logger {
    private static instance: Logger;
    private winston!: winston.Logger;
    private correlationId?: string;
    
    private constructor() {
        this.setupLogger();
    }
    
    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    
    private setupLogger(): void {
        const logDir = join(process.cwd(), 'logs');
        
        if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
        }
        
        this.winston = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss.SSS'
                }),
                winston.format.errors({ stack: true }),
                winston.format.json(),
                winston.format.printf(({ timestamp, level, message, ...meta }) => {
                    const logObject = {
                        timestamp,
                        level: level.toUpperCase(),
                        message,
                        correlationId: this.correlationId,
                        service: 'adaptive-governance',
                        environment: process.env.NODE_ENV || 'development',
                        ...meta
                    };
                    return JSON.stringify(logObject);
                })
            ),
            defaultMeta: {
                version: process.env.npm_package_version || '1.0.0',
                hostname: require('os').hostname(),
                pid: process.pid
            },
            transports: [
                // Error logs
                new DailyRotateFile({
                    filename: join(logDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),
                
                // Application logs
                new DailyRotateFile({
                    filename: join(logDir, 'app-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),
                
                // Audit logs
                new DailyRotateFile({
                    filename: join(logDir, 'audit-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'warn',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '90d',
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            ]
        });
        
        // Console output for development
        if (process.env.NODE_ENV !== 'production') {
            this.winston.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({
                        format: 'HH:mm:ss'
                    }),
                    winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                        const correlation = correlationId ? `[${correlationId}] ` : '';
                        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                        return `${timestamp} ${level}: ${correlation}${message}${metaStr}`;
                    })
                )
            }));
        }
    }
    
    public setCorrelationId(id: string): void {
        this.correlationId = id;
    }
    
    public clearCorrelationId(): void {
        this.correlationId = undefined;
    }
    
    public info(message: string, context: LogContext = {}): void {
        this.winston.info(message, context);
    }
    
    public error(message: string, context: LogContext = {}): void {
        this.winston.error(message, context);
    }
    
    public warn(message: string, context: LogContext = {}): void {
        this.winston.warn(message, context);
    }
    
    public debug(message: string, context: LogContext = {}): void {
        this.winston.debug(message, context);
    }
    
    // Specialized logging methods
    public audit(action: string, context: LogContext = {}): void {
        this.winston.warn(`AUDIT: ${action}`, {
            ...context,
            auditLog: true,
            timestamp: new Date().toISOString()
        });
    }
    
    public security(event: string, context: LogContext = {}): void {
        this.winston.error(`SECURITY: ${event}`, {
            ...context,
            securityEvent: true,
            timestamp: new Date().toISOString()
        });
    }
    
    public performance(metric: string, value: number, context: LogContext = {}): void {
        this.winston.info(`PERFORMANCE: ${metric}`, {
            ...context,
            metric,
            value,
            performanceLog: true,
            timestamp: new Date().toISOString()
        });
    }
    
    public business(event: string, context: LogContext = {}): void {
        this.winston.info(`BUSINESS: ${event}`, {
            ...context,
            businessEvent: true,
            timestamp: new Date().toISOString()
        });
    }
    
    // Query logs (for debugging)
    public async queryLogs(options: {
        level?: string;
        from?: Date;
        to?: Date;
        limit?: number;
    } = {}): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const queryOptions = {
                from: options.from || new Date(Date.now() - 24 * 60 * 60 * 1000),
                until: options.to || new Date(),
                limit: options.limit || 100,
                start: 0,
                order: 'desc' as const,
                fields: ['timestamp', 'level', 'message']
            };
            
            this.winston.query(queryOptions, (err: Error | null, results: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results.file || []);
                }
            });
        });
    }
    
    // Health check
    public async healthCheck(): Promise<boolean> {
        try {
            this.winston.info('Logger health check');
            return true;
        } catch (error) {
            return false;
        }
    }
}
