"use strict";
/**
 * 🔧 ENTERPRISE LOGGER
 *
 * Sistema unificado de logging com recursos avançados:
 * - Rotação automática de logs
 * - Diferentes níveis e destinos
 * - Correlação de eventos
 * - Métricas integradas
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const fs_1 = require("fs");
const path_1 = require("path");
class Logger {
    static instance;
    winston;
    correlationId;
    constructor() {
        this.setupLogger();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setupLogger() {
        const logDir = (0, path_1.join)(process.cwd(), 'logs');
        if (!(0, fs_1.existsSync)(logDir)) {
            (0, fs_1.mkdirSync)(logDir, { recursive: true });
        }
        this.winston = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss.SSS'
            }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json(), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
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
            })),
            defaultMeta: {
                version: process.env.npm_package_version || '1.0.0',
                hostname: require('os').hostname(),
                pid: process.pid
            },
            transports: [
                // Error logs
                new winston_daily_rotate_file_1.default({
                    filename: (0, path_1.join)(logDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'error',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '30d',
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
                }),
                // Application logs
                new winston_daily_rotate_file_1.default({
                    filename: (0, path_1.join)(logDir, 'app-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
                }),
                // Audit logs
                new winston_daily_rotate_file_1.default({
                    filename: (0, path_1.join)(logDir, 'audit-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    level: 'warn',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '90d',
                    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
                })
            ]
        });
        // Console output for development
        if (process.env.NODE_ENV !== 'production') {
            this.winston.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
                    format: 'HH:mm:ss'
                }), winston_1.default.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
                    const correlation = correlationId ? `[${correlationId}] ` : '';
                    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
                    return `${timestamp} ${level}: ${correlation}${message}${metaStr}`;
                }))
            }));
        }
    }
    setCorrelationId(id) {
        this.correlationId = id;
    }
    clearCorrelationId() {
        this.correlationId = undefined;
    }
    info(message, context = {}) {
        this.winston.info(message, context);
    }
    error(message, context = {}) {
        this.winston.error(message, context);
    }
    warn(message, context = {}) {
        this.winston.warn(message, context);
    }
    debug(message, context = {}) {
        this.winston.debug(message, context);
    }
    // Specialized logging methods
    audit(action, context = {}) {
        this.winston.warn(`AUDIT: ${action}`, {
            ...context,
            auditLog: true,
            timestamp: new Date().toISOString()
        });
    }
    security(event, context = {}) {
        this.winston.error(`SECURITY: ${event}`, {
            ...context,
            securityEvent: true,
            timestamp: new Date().toISOString()
        });
    }
    performance(metric, value, context = {}) {
        this.winston.info(`PERFORMANCE: ${metric}`, {
            ...context,
            metric,
            value,
            performanceLog: true,
            timestamp: new Date().toISOString()
        });
    }
    business(event, context = {}) {
        this.winston.info(`BUSINESS: ${event}`, {
            ...context,
            businessEvent: true,
            timestamp: new Date().toISOString()
        });
    }
    // Query logs (for debugging)
    async queryLogs(options = {}) {
        return new Promise((resolve, reject) => {
            const queryOptions = {
                from: options.from || new Date(Date.now() - 24 * 60 * 60 * 1000),
                until: options.to || new Date(),
                limit: options.limit || 100,
                start: 0,
                order: 'desc',
                fields: ['timestamp', 'level', 'message']
            };
            this.winston.query(queryOptions, (err, results) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(results.file || []);
                }
            });
        });
    }
    // Health check
    async healthCheck() {
        try {
            this.winston.info('Logger health check');
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map