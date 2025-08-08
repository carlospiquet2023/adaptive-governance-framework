"use strict";
/**
 * 🔧 ENTERPRISE CONFIG MANAGER
 *
 * Sistema unificado de configuração com recursos avançados:
 * - Configuração por ambiente
 * - Validação de tipos
 * - Hot reload
 * - Configuração hierárquica
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const Logger_1 = require("./Logger");
class ConfigManager {
    static instance;
    config;
    logger = Logger_1.Logger.getInstance();
    configPath;
    watchers = new Map();
    constructor() {
        this.configPath = this.findConfigPath();
        this.loadConfig();
        this.setupWatchers();
    }
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    findConfigPath() {
        const environment = process.env.NODE_ENV || 'development';
        const possiblePaths = [
            (0, path_1.join)(process.cwd(), `config.${environment}.json`),
            (0, path_1.join)(process.cwd(), 'config.json'),
            (0, path_1.join)(process.cwd(), 'config', `${environment}.json`),
            (0, path_1.join)(process.cwd(), 'config', 'config.json')
        ];
        for (const path of possiblePaths) {
            if ((0, fs_1.existsSync)(path)) {
                return path;
            }
        }
        // Create default config if none exists
        return this.createDefaultConfig();
    }
    createDefaultConfig() {
        const defaultConfig = {
            app: {
                name: 'adaptive-governance-framework',
                version: '2.0.0',
                environment: process.env.NODE_ENV || 'development',
                port: parseInt(process.env.PORT || '3000', 10),
                host: process.env.HOST || 'localhost',
                logLevel: process.env.LOG_LEVEL || 'info',
                debug: process.env.NODE_ENV !== 'production'
            },
            database: {
                host: process.env.DB_HOST || 'localhost',
                port: parseInt(process.env.DB_PORT || '5432', 10),
                database: process.env.DB_NAME || 'governance',
                username: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD || 'postgres',
                ssl: process.env.DB_SSL === 'true',
                pool: {
                    min: 2,
                    max: 10
                }
            },
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379', 10),
                password: process.env.REDIS_PASSWORD,
                db: parseInt(process.env.REDIS_DB || '0', 10),
                keyPrefix: 'agf:'
            },
            jwt: {
                secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
                expiresIn: process.env.JWT_EXPIRES_IN || '15m',
                refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
                issuer: process.env.JWT_ISSUER || 'adaptive-governance-framework',
                audience: process.env.JWT_AUDIENCE || 'agf-users'
            },
            rateLimit: {
                windowMs: 15 * 60 * 1000, // 15 minutes
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
                skipSuccessfulRequests: false,
                skipFailedRequests: false
            },
            security: {
                cors: {
                    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
                    credentials: true,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
                },
                helmet: {
                    contentSecurityPolicy: process.env.NODE_ENV === 'production',
                    crossOriginEmbedderPolicy: false,
                    crossOriginOpenerPolicy: false,
                    crossOriginResourcePolicy: false
                }
            },
            aiEngine: {
                models: {
                    primary: 'gpt-4-turbo',
                    fallback: 'gpt-3.5-turbo',
                    contextWindow: 128000,
                    maxTokens: 4096
                },
                providers: {
                    openai: {
                        apiKey: process.env.OPENAI_API_KEY || '',
                        organization: process.env.OPENAI_ORG_ID
                    },
                    anthropic: {
                        apiKey: process.env.ANTHROPIC_API_KEY || ''
                    }
                }
            },
            engines: {
                policy: {
                    ruleEngine: 'drools',
                    cacheSize: 1000,
                    evaluationTimeout: 5000
                },
                context: {
                    maxHistorySize: 10000,
                    compressionThreshold: 1000,
                    retentionDays: 30
                },
                learning: {
                    modelPath: './models',
                    trainingSchedule: '0 2 * * *', // Daily at 2 AM
                    feedbackLoopEnabled: true
                }
            },
            agents: {
                security: {
                    scanInterval: 300000, // 5 minutes
                    threatLevels: ['low', 'medium', 'high', 'critical'],
                    autoRemediation: false
                },
                performance: {
                    metricsInterval: 60000, // 1 minute
                    thresholds: {
                        cpu: 80,
                        memory: 85,
                        response: 1000
                    }
                },
                quality: {
                    codeAnalysis: true,
                    testCoverage: 80,
                    complexityThreshold: 10
                },
                architect: {
                    designPatterns: ['singleton', 'factory', 'observer', 'strategy'],
                    principlesCheck: true,
                    refactoringEnabled: true
                }
            }
        };
        const configPath = (0, path_1.join)(process.cwd(), 'config.json');
        (0, fs_1.writeFileSync)(configPath, JSON.stringify(defaultConfig, null, 2));
        this.logger.info('Arquivo de configuração padrão criado', { path: configPath });
        return configPath;
    }
    loadConfig() {
        try {
            const configContent = (0, fs_1.readFileSync)(this.configPath, 'utf-8');
            const parsedConfig = JSON.parse(configContent);
            // Merge with environment variables
            this.config = this.mergeWithEnv(parsedConfig);
            this.logger.info('Configuração carregada com sucesso', {
                environment: this.config.app.environment,
                configPath: this.configPath
            });
        }
        catch (error) {
            this.logger.error('Falha ao carregar configuração', { error, path: this.configPath });
            throw new Error(`Failed to load config from ${this.configPath}: ${error}`);
        }
    }
    mergeWithEnv(config) {
        // Override with environment variables where they exist
        return {
            ...config,
            app: {
                ...config.app,
                environment: process.env.NODE_ENV || config.app.environment,
                port: parseInt(process.env.PORT || config.app.port.toString(), 10),
                host: process.env.HOST || config.app.host,
                logLevel: process.env.LOG_LEVEL || config.app.logLevel,
                debug: process.env.DEBUG === 'true' || config.app.debug
            },
            database: {
                ...config.database,
                host: process.env.DB_HOST || config.database.host,
                port: parseInt(process.env.DB_PORT || config.database.port.toString(), 10),
                database: process.env.DB_NAME || config.database.database,
                username: process.env.DB_USER || config.database.username,
                password: process.env.DB_PASSWORD || config.database.password,
                ssl: process.env.DB_SSL === 'true' || config.database.ssl
            },
            redis: {
                ...config.redis,
                host: process.env.REDIS_HOST || config.redis.host,
                port: parseInt(process.env.REDIS_PORT || config.redis.port.toString(), 10),
                password: process.env.REDIS_PASSWORD || config.redis.password,
                db: parseInt(process.env.REDIS_DB || config.redis.db.toString(), 10)
            },
            jwt: {
                ...config.jwt,
                secret: process.env.JWT_SECRET || config.jwt.secret,
                expiresIn: process.env.JWT_EXPIRES_IN || config.jwt.expiresIn,
                refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || config.jwt.refreshExpiresIn,
                issuer: process.env.JWT_ISSUER || config.jwt.issuer,
                audience: process.env.JWT_AUDIENCE || config.jwt.audience
            }
        };
    }
    setupWatchers() {
        if (process.env.NODE_ENV === 'development') {
            const fs = require('fs');
            fs.watchFile(this.configPath, () => {
                this.logger.info('Configuração alterada, recarregando...');
                try {
                    this.loadConfig();
                    this.logger.info('Configuração recarregada com sucesso');
                }
                catch (error) {
                    this.logger.error('Falha ao recarregar configuração', { error });
                }
            });
        }
    }
    get(path) {
        const keys = path.split('.');
        let value = this.config;
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            }
            else {
                return undefined;
            }
        }
        return value;
    }
    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        current[keys[keys.length - 1]] = value;
        this.saveConfig();
    }
    saveConfig() {
        try {
            (0, fs_1.writeFileSync)(this.configPath, JSON.stringify(this.config, null, 2));
            this.logger.info('Configuração salva', { path: this.configPath });
        }
        catch (error) {
            this.logger.error('Falha ao salvar configuração', { error, path: this.configPath });
        }
    }
    getConfig() {
        return this.config;
    }
    reload() {
        this.loadConfig();
    }
    // Shortcut methods for common configs
    getDatabaseConfig() {
        return this.config.database;
    }
    getRedisConfig() {
        return this.config.redis;
    }
    getJwtConfig() {
        return this.config.jwt;
    }
    getSecurityConfig() {
        return this.config.security;
    }
    getAIEngineConfig() {
        return this.config.aiEngine;
    }
    getEngineConfig() {
        return this.config.engines;
    }
    getAgentConfig() {
        return this.config.agents;
    }
    isProduction() {
        return this.config.app.environment === 'production';
    }
    isDevelopment() {
        return this.config.app.environment === 'development';
    }
    isTest() {
        return this.config.app.environment === 'test';
    }
    // Validation
    validate() {
        const errors = [];
        // Required fields validation
        if (!this.config.jwt.secret || this.config.jwt.secret === 'your-super-secret-key-change-in-production') {
            errors.push('JWT secret deve ser alterado em produção');
        }
        if (this.isProduction() && !this.config.database.ssl) {
            errors.push('SSL do banco deve estar habilitado em produção');
        }
        if (!this.config.aiEngine.providers.openai.apiKey && !this.config.aiEngine.providers.anthropic?.apiKey) {
            errors.push('Pelo menos uma API key de IA deve estar configurada');
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    async healthCheck() {
        try {
            return (0, fs_1.existsSync)(this.configPath) && this.config !== undefined;
        }
        catch {
            return false;
        }
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=ConfigManager.js.map