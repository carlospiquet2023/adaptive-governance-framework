/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

/**
 * 🔧 REDIS SERVICE
 * 
 * Serviço unificado de cache Redis com recursos avançados:
 * - Connection pooling
 * - Pub/Sub messaging
 * - Distributed locking
 * - Health monitoring
 */

import Redis, { Redis as RedisInstance } from 'ioredis';
import { Logger } from './Logger';
import { ConfigManager } from './ConfigManager';

export interface CacheOptions {
    ttl?: number; // Time to live in seconds
    prefix?: string;
    serializer?: 'json' | 'string';
}

export interface PubSubMessage {
    channel: string;
    pattern?: string;
    message: string;
}

export interface LockOptions {
    ttl?: number; // Lock TTL in milliseconds
    retryCount?: number;
    retryDelay?: number;
}

export class RedisService {
    private static instance: RedisService;
    private client!: RedisInstance;
    private subscriber!: RedisInstance;
    private publisher!: RedisInstance;
    private logger = Logger.getInstance();
    private config = ConfigManager.getInstance();
    private messageHandlers = new Map<string, (message: PubSubMessage) => void>();
    private locks = new Map<string, NodeJS.Timeout>();
    
    private constructor() {
        this.initializeClients();
        this.setupEventHandlers();
    }
    
    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    
    private initializeClients(): void {
        const redisConfig = this.config.getRedisConfig();
        
        const connectionOptions = {
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.db,
            keyPrefix: redisConfig.keyPrefix,
            retryDelayOnFailover: 100,
            maxRetriesPerRequest: 3,
            lazyConnect: true,
            keepAlive: 30000,
            connectTimeout: 10000,
            commandTimeout: 5000
        };
        
        this.client = new Redis(connectionOptions);
        this.subscriber = new Redis(connectionOptions);
        this.publisher = new Redis(connectionOptions);
    }
    
    private setupEventHandlers(): void {
        // Main client events
        this.client.on('connect', () => {
            this.logger.info('Redis client conectado');
        });
        
        this.client.on('ready', () => {
            this.logger.info('Redis client pronto');
        });
        
        this.client.on('error', (error) => {
            this.logger.error('Erro no Redis client', { error: error.message });
        });
        
        this.client.on('close', () => {
            this.logger.warn('Conexão Redis fechada');
        });
        
        this.client.on('reconnecting', () => {
            this.logger.info('Reconectando ao Redis...');
        });
        
        // Subscriber events
        this.subscriber.on('message', (channel: string, message: string) => {
            const handler = this.messageHandlers.get(channel);
            if (handler) {
                handler({ channel, message });
            }
        });
        
        this.subscriber.on('pmessage', (pattern: string, channel: string, message: string) => {
            const handler = this.messageHandlers.get(pattern);
            if (handler) {
                handler({ channel, pattern, message });
            }
        });
    }
    
    // Basic cache operations
    public async set(
        key: string, 
        value: any, 
        options: CacheOptions = {}
    ): Promise<string> {
        const { ttl, serializer = 'json' } = options;
        
        let serializedValue: string;
        if (serializer === 'json') {
            serializedValue = JSON.stringify(value);
        } else {
            serializedValue = String(value);
        }
        
        if (ttl) {
            return await this.client.setex(key, ttl, serializedValue);
        } else {
            return await this.client.set(key, serializedValue);
        }
    }
    
    public async get<T = any>(
        key: string, 
        options: CacheOptions = {}
    ): Promise<T | null> {
        const { serializer = 'json' } = options;
        const value = await this.client.get(key);
        
        if (value === null) return null;
        
        if (serializer === 'json') {
            try {
                return JSON.parse(value) as T;
            } catch (error) {
                this.logger.error('Erro ao deserializar valor do cache', { key, error });
                return null;
            }
        } else {
            return value as T;
        }
    }
    
    public async del(key: string | string[]): Promise<number> {
        if (Array.isArray(key)) {
            return await this.client.del(...key);
        } else {
            return await this.client.del(key);
        }
    }
    
    public async exists(key: string | string[]): Promise<number> {
        if (Array.isArray(key)) {
            return await this.client.exists(...key);
        } else {
            return await this.client.exists(key);
        }
    }
    
    public async expire(key: string, seconds: number): Promise<number> {
        return await this.client.expire(key, seconds);
    }
    
    public async ttl(key: string): Promise<number> {
        return await this.client.ttl(key);
    }
    
    // Advanced cache operations
    public async getOrSet<T = any>(
        key: string,
        fetchFunction: () => Promise<T>,
        options: CacheOptions = {}
    ): Promise<T> {
        const cached = await this.get<T>(key, options);
        if (cached !== null) {
            return cached;
        }
        
        const fresh = await fetchFunction();
        await this.set(key, fresh, options);
        return fresh;
    }
    
    public async mget<T = any>(keys: string[]): Promise<(T | null)[]> {
        const values = await this.client.mget(...keys);
        return values.map(value => {
            if (value === null) return null;
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as T;
            }
        });
    }
    
    public async mset(keyValuePairs: Record<string, any>, ttl?: number): Promise<string> {
        const serialized: string[] = [];
        
        for (const [key, value] of Object.entries(keyValuePairs)) {
            serialized.push(key, JSON.stringify(value));
        }
        
        const result = await this.client.mset(...serialized);
        
        if (ttl) {
            const pipeline = this.client.pipeline();
            for (const key of Object.keys(keyValuePairs)) {
                pipeline.expire(key, ttl);
            }
            await pipeline.exec();
        }
        
        return result;
    }
    
    // Hash operations
    public async hset(key: string, field: string, value: any): Promise<number> {
        return await this.client.hset(key, field, JSON.stringify(value));
    }
    
    public async hget<T = any>(key: string, field: string): Promise<T | null> {
        const value = await this.client.hget(key, field);
        if (value === null) return null;
        
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }
    
    public async hgetall<T = any>(key: string): Promise<Record<string, T>> {
        const hash = await this.client.hgetall(key);
        const result: Record<string, T> = {};
        
        for (const [field, value] of Object.entries(hash)) {
            try {
                result[field] = JSON.parse(value) as T;
            } catch {
                result[field] = value as T;
            }
        }
        
        return result;
    }
    
    public async hdel(key: string, ...fields: string[]): Promise<number> {
        return await this.client.hdel(key, ...fields);
    }
    
    // List operations
    public async lpush(key: string, ...values: any[]): Promise<number> {
        const serialized = values.map(v => JSON.stringify(v));
        return await this.client.lpush(key, ...serialized);
    }
    
    public async rpush(key: string, ...values: any[]): Promise<number> {
        const serialized = values.map(v => JSON.stringify(v));
        return await this.client.rpush(key, ...serialized);
    }
    
    public async lpop<T = any>(key: string): Promise<T | null> {
        const value = await this.client.lpop(key);
        if (value === null) return null;
        
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }
    
    public async rpop<T = any>(key: string): Promise<T | null> {
        const value = await this.client.rpop(key);
        if (value === null) return null;
        
        try {
            return JSON.parse(value) as T;
        } catch {
            return value as T;
        }
    }
    
    public async llen(key: string): Promise<number> {
        return await this.client.llen(key);
    }
    
    public async lrange<T = any>(key: string, start: number, stop: number): Promise<T[]> {
        const values = await this.client.lrange(key, start, stop);
        return values.map(value => {
            try {
                return JSON.parse(value) as T;
            } catch {
                return value as T;
            }
        });
    }
    
    // Set operations
    public async sadd(key: string, ...members: any[]): Promise<number> {
        const serialized = members.map(m => JSON.stringify(m));
        return await this.client.sadd(key, ...serialized);
    }
    
    public async srem(key: string, ...members: any[]): Promise<number> {
        const serialized = members.map(m => JSON.stringify(m));
        return await this.client.srem(key, ...serialized);
    }
    
    public async smembers<T = any>(key: string): Promise<T[]> {
        const members = await this.client.smembers(key);
        return members.map(member => {
            try {
                return JSON.parse(member) as T;
            } catch {
                return member as T;
            }
        });
    }
    
    public async sismember(key: string, member: any): Promise<number> {
        return await this.client.sismember(key, JSON.stringify(member));
    }
    
    public async scard(key: string): Promise<number> {
        return await this.client.scard(key);
    }
    
    // Pub/Sub operations
    public async publish(channel: string, message: any): Promise<number> {
        const serialized = typeof message === 'string' ? message : JSON.stringify(message);
        return await this.publisher.publish(channel, serialized);
    }
    
    public async subscribe(
        channel: string,
        handler: (message: PubSubMessage) => void
    ): Promise<void> {
        this.messageHandlers.set(channel, handler);
        await this.subscriber.subscribe(channel);
    }
    
    public async psubscribe(
        pattern: string,
        handler: (message: PubSubMessage) => void
    ): Promise<void> {
        this.messageHandlers.set(pattern, handler);
        await this.subscriber.psubscribe(pattern);
    }
    
    public async unsubscribe(channel?: string): Promise<void> {
        if (channel) {
            this.messageHandlers.delete(channel);
            await this.subscriber.unsubscribe(channel);
        } else {
            this.messageHandlers.clear();
            await this.subscriber.unsubscribe();
        }
    }
    
    // Distributed locking
    public async acquireLock(
        key: string,
        options: LockOptions = {}
    ): Promise<boolean> {
        const { ttl = 10000, retryCount = 3, retryDelay = 100 } = options;
        const lockKey = `lock:${key}`;
        const lockValue = `${Date.now()}-${Math.random()}`;
        
        for (let i = 0; i < retryCount; i++) {
            const result = await this.client.set(lockKey, lockValue, 'PX', ttl, 'NX');
            
            if (result === 'OK') {
                // Set up auto-release
                const timeout = setTimeout(async () => {
                    await this.releaseLock(key);
                }, ttl);
                
                this.locks.set(key, timeout);
                return true;
            }
            
            if (i < retryCount - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }
        }
        
        return false;
    }
    
    public async releaseLock(key: string): Promise<boolean> {
        const lockKey = `lock:${key}`;
        const timeout = this.locks.get(key);
        
        if (timeout) {
            clearTimeout(timeout);
            this.locks.delete(key);
        }
        
        const result = await this.client.del(lockKey);
        return result === 1;
    }
    
    // Rate limiting
    public async rateLimit(
        key: string,
        limit: number,
        windowMs: number
    ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
        const now = Date.now();
        const window = Math.floor(now / windowMs);
        const rateKey = `rate:${key}:${window}`;
        
        const pipeline = this.client.pipeline();
        pipeline.incr(rateKey);
        pipeline.expire(rateKey, Math.ceil(windowMs / 1000));
        
        const results = await pipeline.exec();
        const count = results?.[0]?.[1] as number;
        
        const remaining = Math.max(0, limit - count);
        const resetTime = (window + 1) * windowMs;
        
        return {
            allowed: count <= limit,
            remaining,
            resetTime
        };
    }
    
    // Batch operations using pipeline
    public async pipeline(operations: Array<() => void>): Promise<any[]> {
        const pipeline = this.client.pipeline();
        
        for (const operation of operations) {
            operation.call(pipeline);
        }
        
        const results = await pipeline.exec();
        return results?.map(result => result[1]) || [];
    }
    
    // Health check and monitoring
    public async healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        memory: any;
        stats: any;
    }> {
        const start = Date.now();
        
        try {
            await this.client.ping();
            const latency = Date.now() - start;
            
            const [memoryStats, serverStats] = await Promise.all([
                this.client.info('memory'),
                this.client.info('stats')
            ]);
            
            return {
                healthy: true,
                latency,
                memory: memoryStats,
                stats: serverStats
            };
        } catch (error) {
            this.logger.error('Health check do Redis falhou', { error });
            return {
                healthy: false,
                latency: Date.now() - start,
                memory: null,
                stats: null
            };
        }
    }
    
    public async flushdb(): Promise<string> {
        return await this.client.flushdb();
    }
    
    public async keys(pattern: string = '*'): Promise<string[]> {
        return await this.client.keys(pattern);
    }
    
    public async disconnect(): Promise<void> {
        await Promise.all([
            this.client.disconnect(),
            this.subscriber.disconnect(),
            this.publisher.disconnect()
        ]);
        
        // Clear all locks
        for (const timeout of this.locks.values()) {
            clearTimeout(timeout);
        }
        this.locks.clear();
        
        this.logger.info('Redis disconnected');
    }
}
