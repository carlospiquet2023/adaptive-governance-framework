/**
 * 🔧 REDIS SERVICE
 *
 * Serviço unificado de cache Redis com recursos avançados:
 * - Connection pooling
 * - Pub/Sub messaging
 * - Distributed locking
 * - Health monitoring
 */
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
    serializer?: 'json' | 'string';
}
export interface PubSubMessage {
    channel: string;
    pattern?: string;
    message: string;
}
export interface LockOptions {
    ttl?: number;
    retryCount?: number;
    retryDelay?: number;
}
export declare class RedisService {
    private static instance;
    private client;
    private subscriber;
    private publisher;
    private logger;
    private config;
    private messageHandlers;
    private locks;
    private constructor();
    static getInstance(): RedisService;
    private initializeClients;
    private setupEventHandlers;
    set(key: string, value: any, options?: CacheOptions): Promise<string>;
    get<T = any>(key: string, options?: CacheOptions): Promise<T | null>;
    del(key: string | string[]): Promise<number>;
    exists(key: string | string[]): Promise<number>;
    expire(key: string, seconds: number): Promise<number>;
    ttl(key: string): Promise<number>;
    getOrSet<T = any>(key: string, fetchFunction: () => Promise<T>, options?: CacheOptions): Promise<T>;
    mget<T = any>(keys: string[]): Promise<(T | null)[]>;
    mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<string>;
    hset(key: string, field: string, value: any): Promise<number>;
    hget<T = any>(key: string, field: string): Promise<T | null>;
    hgetall<T = any>(key: string): Promise<Record<string, T>>;
    hdel(key: string, ...fields: string[]): Promise<number>;
    lpush(key: string, ...values: any[]): Promise<number>;
    rpush(key: string, ...values: any[]): Promise<number>;
    lpop<T = any>(key: string): Promise<T | null>;
    rpop<T = any>(key: string): Promise<T | null>;
    llen(key: string): Promise<number>;
    lrange<T = any>(key: string, start: number, stop: number): Promise<T[]>;
    sadd(key: string, ...members: any[]): Promise<number>;
    srem(key: string, ...members: any[]): Promise<number>;
    smembers<T = any>(key: string): Promise<T[]>;
    sismember(key: string, member: any): Promise<number>;
    scard(key: string): Promise<number>;
    publish(channel: string, message: any): Promise<number>;
    subscribe(channel: string, handler: (message: PubSubMessage) => void): Promise<void>;
    psubscribe(pattern: string, handler: (message: PubSubMessage) => void): Promise<void>;
    unsubscribe(channel?: string): Promise<void>;
    acquireLock(key: string, options?: LockOptions): Promise<boolean>;
    releaseLock(key: string): Promise<boolean>;
    rateLimit(key: string, limit: number, windowMs: number): Promise<{
        allowed: boolean;
        remaining: number;
        resetTime: number;
    }>;
    pipeline(operations: Array<() => void>): Promise<any[]>;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        memory: any;
        stats: any;
    }>;
    flushdb(): Promise<string>;
    keys(pattern?: string): Promise<string[]>;
    disconnect(): Promise<void>;
}
