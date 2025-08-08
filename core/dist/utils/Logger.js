"use strict";
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
    logger;
    constructor() {
        const logDir = (0, path_1.join)(process.cwd(), 'logs');
        if (!(0, fs_1.existsSync)(logDir)) {
            (0, fs_1.mkdirSync)(logDir, { recursive: true });
        }
        const errorFilter = winston_1.default.format((info) => {
            return info.level === 'error' ? info : false;
        });
        const infoFilter = winston_1.default.format((info) => {
            return info.level === 'info' ? info : false;
        });
        this.logger = winston_1.default.createLogger({
            level: process.env.LOG_LEVEL || 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json()),
            defaultMeta: {
                service: 'adaptive-governance',
                environment: process.env.NODE_ENV || 'development'
            },
            transports: [
                new winston_daily_rotate_file_1.default({
                    filename: (0, path_1.join)(logDir, 'error-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    level: 'error',
                    format: winston_1.default.format.combine(errorFilter(), winston_1.default.format.timestamp(), winston_1.default.format.json())
                }),
                new winston_daily_rotate_file_1.default({
                    filename: (0, path_1.join)(logDir, 'combined-%DATE%.log'),
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '14d',
                    format: winston_1.default.format.combine(infoFilter(), winston_1.default.format.timestamp(), winston_1.default.format.json())
                })
            ]
        });
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
            }));
        }
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    info(message, metadata = {}) {
        this.logger.info(message, metadata);
    }
    error(message, metadata = {}) {
        this.logger.error(message, metadata);
    }
    warn(message, metadata = {}) {
        this.logger.warn(message, metadata);
    }
    debug(message, metadata = {}) {
        this.logger.debug(message, metadata);
    }
    async query(options) {
        return new Promise((resolve, reject) => {
            this.logger.query(options, (err, results) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(results);
                }
            });
        });
    }
}
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map