"use strict";
/**
 * 🔧 REDIS SERVICE
 *
 * Serviço unificado de cache Redis com recursos avançados:
 * - Connection pooling
 * - Pub/Sub messaging
 * - Distributed locking
 * - Health monitoring
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const Logger_1 = require("./Logger");
const ConfigManager_1 = require("./ConfigManager");
class RedisService {
    static instance;
    client;
    subscriber;
    publisher;
    logger = Logger_1.Logger.getInstance();
    config = ConfigManager_1.ConfigManager.getInstance();
    messageHandlers = new Map();
    locks = new Map();
    constructor() {
        this.initializeClients();
        this.setupEventHandlers();
    }
    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
    initializeClients() {
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
        this.client = new ioredis_1.default(connectionOptions);
        this.subscriber = new ioredis_1.default(connectionOptions);
        this.publisher = new ioredis_1.default(connectionOptions);
    }
    setupEventHandlers() {
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
        this.subscriber.on('message', (channel, message) => {
            const handler = this.messageHandlers.get(channel);
            if (handler) {
                handler({ channel, message });
            }
        });
        this.subscriber.on('pmessage', (pattern, channel, message) => {
            const handler = this.messageHandlers.get(pattern);
            if (handler) {
                handler({ channel, pattern, message });
            }
        });
    }
    // Basic cache operations
    async set(key, value, options = {}) {
        const { ttl, serializer = 'json' } = options;
        let serializedValue;
        if (serializer === 'json') {
            serializedValue = JSON.stringify(value);
        }
        else {
            serializedValue = String(value);
        }
        if (ttl) {
            return await this.client.setex(key, ttl, serializedValue);
        }
        else {
            return await this.client.set(key, serializedValue);
        }
    }
    async get(key, options = {}) {
        const { serializer = 'json' } = options;
        const value = await this.client.get(key);
        if (value === null)
            return null;
        if (serializer === 'json') {
            try {
                return JSON.parse(value);
            }
            catch (error) {
                this.logger.error('Erro ao deserializar valor do cache', { key, error });
                return null;
            }
        }
        else {
            return value;
        }
    }
    async del(key) {
        if (Array.isArray(key)) {
            return await this.client.del(...key);
        }
        else {
            return await this.client.del(key);
        }
    }
    async exists(key) {
        if (Array.isArray(key)) {
            return await this.client.exists(...key);
        }
        else {
            return await this.client.exists(key);
        }
    }
    async expire(key, seconds) {
        return await this.client.expire(key, seconds);
    }
    async ttl(key) {
        return await this.client.ttl(key);
    }
    // Advanced cache operations
    async getOrSet(key, fetchFunction, options = {}) {
        const cached = await this.get(key, options);
        if (cached !== null) {
            return cached;
        }
        const fresh = await fetchFunction();
        await this.set(key, fresh, options);
        return fresh;
    }
    async mget(keys) {
        const values = await this.client.mget(...keys);
        return values.map(value => {
            if (value === null)
                return null;
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        });
    }
    async mset(keyValuePairs, ttl) {
        const serialized = [];
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
    async hset(key, field, value) {
        return await this.client.hset(key, field, JSON.stringify(value));
    }
    async hget(key, field) {
        const value = await this.client.hget(key, field);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async hgetall(key) {
        const hash = await this.client.hgetall(key);
        const result = {};
        for (const [field, value] of Object.entries(hash)) {
            try {
                result[field] = JSON.parse(value);
            }
            catch {
                result[field] = value;
            }
        }
        return result;
    }
    async hdel(key, ...fields) {
        return await this.client.hdel(key, ...fields);
    }
    // List operations
    async lpush(key, ...values) {
        const serialized = values.map(v => JSON.stringify(v));
        return await this.client.lpush(key, ...serialized);
    }
    async rpush(key, ...values) {
        const serialized = values.map(v => JSON.stringify(v));
        return await this.client.rpush(key, ...serialized);
    }
    async lpop(key) {
        const value = await this.client.lpop(key);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async rpop(key) {
        const value = await this.client.rpop(key);
        if (value === null)
            return null;
        try {
            return JSON.parse(value);
        }
        catch {
            return value;
        }
    }
    async llen(key) {
        return await this.client.llen(key);
    }
    async lrange(key, start, stop) {
        const values = await this.client.lrange(key, start, stop);
        return values.map(value => {
            try {
                return JSON.parse(value);
            }
            catch {
                return value;
            }
        });
    }
    // Set operations
    async sadd(key, ...members) {
        const serialized = members.map(m => JSON.stringify(m));
        return await this.client.sadd(key, ...serialized);
    }
    async srem(key, ...members) {
        const serialized = members.map(m => JSON.stringify(m));
        return await this.client.srem(key, ...serialized);
    }
    async smembers(key) {
        const members = await this.client.smembers(key);
        return members.map(member => {
            try {
                return JSON.parse(member);
            }
            catch {
                return member;
            }
        });
    }
    async sismember(key, member) {
        return await this.client.sismember(key, JSON.stringify(member));
    }
    async scard(key) {
        return await this.client.scard(key);
    }
    // Pub/Sub operations
    async publish(channel, message) {
        const serialized = typeof message === 'string' ? message : JSON.stringify(message);
        return await this.publisher.publish(channel, serialized);
    }
    async subscribe(channel, handler) {
        this.messageHandlers.set(channel, handler);
        await this.subscriber.subscribe(channel);
    }
    async psubscribe(pattern, handler) {
        this.messageHandlers.set(pattern, handler);
        await this.subscriber.psubscribe(pattern);
    }
    async unsubscribe(channel) {
        if (channel) {
            this.messageHandlers.delete(channel);
            await this.subscriber.unsubscribe(channel);
        }
        else {
            this.messageHandlers.clear();
            await this.subscriber.unsubscribe();
        }
    }
    // Distributed locking
    async acquireLock(key, options = {}) {
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
    async releaseLock(key) {
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
    async rateLimit(key, limit, windowMs) {
        const now = Date.now();
        const window = Math.floor(now / windowMs);
        const rateKey = `rate:${key}:${window}`;
        const pipeline = this.client.pipeline();
        pipeline.incr(rateKey);
        pipeline.expire(rateKey, Math.ceil(windowMs / 1000));
        const results = await pipeline.exec();
        const count = results?.[0]?.[1];
        const remaining = Math.max(0, limit - count);
        const resetTime = (window + 1) * windowMs;
        return {
            allowed: count <= limit,
            remaining,
            resetTime
        };
    }
    // Batch operations using pipeline
    async pipeline(operations) {
        const pipeline = this.client.pipeline();
        for (const operation of operations) {
            operation.call(pipeline);
        }
        const results = await pipeline.exec();
        return results?.map(result => result[1]) || [];
    }
    // Health check and monitoring
    async healthCheck() {
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
        }
        catch (error) {
            this.logger.error('Health check do Redis falhou', { error });
            return {
                healthy: false,
                latency: Date.now() - start,
                memory: null,
                stats: null
            };
        }
    }
    async flushdb() {
        return await this.client.flushdb();
    }
    async keys(pattern = '*') {
        return await this.client.keys(pattern);
    }
    async disconnect() {
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
exports.RedisService = RedisService;
//# sourceMappingURL=RedisService.js.map