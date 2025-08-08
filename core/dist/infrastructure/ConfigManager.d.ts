/**
 * 🔧 ENTERPRISE CONFIG MANAGER
 *
 * Sistema unificado de configuração com recursos avançados:
 * - Configuração por ambiente
 * - Validação de tipos
 * - Hot reload
 * - Configuração hierárquica
 */
export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    ssl: boolean;
    pool: {
        min: number;
        max: number;
    };
}
export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    keyPrefix: string;
}
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
    issuer: string;
    audience: string;
}
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
}
export interface SecurityConfig {
    cors: {
        origin: string[];
        credentials: boolean;
        methods: string[];
        allowedHeaders: string[];
    };
    helmet: {
        contentSecurityPolicy: boolean;
        crossOriginEmbedderPolicy: boolean;
        crossOriginOpenerPolicy: boolean;
        crossOriginResourcePolicy: boolean;
    };
}
export interface AIEngineConfig {
    models: {
        primary: string;
        fallback: string;
        contextWindow: number;
        maxTokens: number;
    };
    providers: {
        openai: {
            apiKey: string;
            organization?: string;
        };
        anthropic?: {
            apiKey: string;
        };
    };
}
export interface EngineConfig {
    policy: {
        ruleEngine: string;
        cacheSize: number;
        evaluationTimeout: number;
    };
    context: {
        maxHistorySize: number;
        compressionThreshold: number;
        retentionDays: number;
    };
    learning: {
        modelPath: string;
        trainingSchedule: string;
        feedbackLoopEnabled: boolean;
    };
}
export interface AgentConfig {
    security: {
        scanInterval: number;
        threatLevels: string[];
        autoRemediation: boolean;
    };
    performance: {
        metricsInterval: number;
        thresholds: {
            cpu: number;
            memory: number;
            response: number;
        };
    };
    quality: {
        codeAnalysis: boolean;
        testCoverage: number;
        complexityThreshold: number;
    };
    architect: {
        designPatterns: string[];
        principlesCheck: boolean;
        refactoringEnabled: boolean;
    };
}
export interface AppConfig {
    app: {
        name: string;
        version: string;
        environment: string;
        port: number;
        host: string;
        logLevel: string;
        debug: boolean;
    };
    database: DatabaseConfig;
    redis: RedisConfig;
    jwt: JwtConfig;
    rateLimit: RateLimitConfig;
    security: SecurityConfig;
    aiEngine: AIEngineConfig;
    engines: EngineConfig;
    agents: AgentConfig;
}
export declare class ConfigManager {
    private static instance;
    private config;
    private logger;
    private configPath;
    private watchers;
    private constructor();
    static getInstance(): ConfigManager;
    private findConfigPath;
    private createDefaultConfig;
    private loadConfig;
    private mergeWithEnv;
    private setupWatchers;
    get<T = any>(path: string): T;
    set(path: string, value: any): void;
    private saveConfig;
    getConfig(): AppConfig;
    reload(): void;
    getDatabaseConfig(): DatabaseConfig;
    getRedisConfig(): RedisConfig;
    getJwtConfig(): JwtConfig;
    getSecurityConfig(): SecurityConfig;
    getAIEngineConfig(): AIEngineConfig;
    getEngineConfig(): EngineConfig;
    getAgentConfig(): AgentConfig;
    isProduction(): boolean;
    isDevelopment(): boolean;
    isTest(): boolean;
    validate(): {
        valid: boolean;
        errors: string[];
    };
    healthCheck(): Promise<boolean>;
}
