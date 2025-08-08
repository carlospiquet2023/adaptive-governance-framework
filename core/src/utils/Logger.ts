/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface LogMetadata {
    [key: string]: unknown;
}

export class Logger {
    private static instance: Logger;
    private logger: winston.Logger;

    private constructor() {
        const logDir = join(process.cwd(), 'logs');
        if (!existsSync(logDir)) {
            mkdirSync(logDir, { recursive: true });
        }

        const errorFilter = winston.format((info: winston.Logform.TransformableInfo) => {
            return info.level === 'error' ? info : false;
        });

        const infoFilter = winston.format((info: winston.Logform.TransformableInfo) => {
            return info.level === 'info' ? info : false;
        });

        this.logger = winston.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD HH:mm:ss'
                }),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
            defaultMeta: { 
                service: 'adaptive-governance',
                environment: process.env.NODE_ENV || 'development'
            },
            transports: [
                new DailyRotateFile({
                    filename: join(logDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                    format: winston.format.combine(
                        errorFilter(),
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),
                new DailyRotateFile({
                    filename: join(logDir, 'combined-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston.format.combine(
                        infoFilter(),
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                })
            ]
        });

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }));
        }
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public info(message: string, metadata: LogMetadata = {}): void {
        this.logger.info(message, metadata);
    }

    public error(message: string, metadata: LogMetadata = {}): void {
        this.logger.error(message, metadata);
    }

    public warn(message: string, metadata: LogMetadata = {}): void {
        this.logger.warn(message, metadata);
    }

    public debug(message: string, metadata: LogMetadata = {}): void {
        this.logger.debug(message, metadata);
    }

    public async query(options: unknown): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.logger.query(options as winston.QueryOptions, (err: Error | null, results: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
}
