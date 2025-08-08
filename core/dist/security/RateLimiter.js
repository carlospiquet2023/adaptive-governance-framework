"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimiter = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../shared/logger");
class RateLimiter {
    static instance;
    redis;
    config;
    constructor() {
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });
        this.config = {
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutos
        };
        this.redis.on('error', (error) => {
            logger_1.logger.error('Erro na conexão com Redis', { error });
        });
    }
    static getInstance() {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }
    async isRateLimited(key) {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;
        try {
            // Remove registros expirados
            await this.redis.zremrangebyscore(key, 0, windowStart);
            // Conta requisições no período
            const requestCount = await this.redis.zcard(key);
            if (requestCount >= this.config.maxRequests) {
                logger_1.logger.info('Rate limit atingido', { key, requestCount });
                return true;
            }
            // Adiciona nova requisição
            await this.redis.zadd(key, now.toString(), now.toString());
            // Define TTL para limpeza automática
            await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));
            return false;
        }
        catch (error) {
            logger_1.logger.error('Erro ao verificar rate limit', { error, key });
            return false; // Em caso de erro, permite a requisição
        }
    }
    async resetLimit(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            logger_1.logger.error('Erro ao resetar rate limit', { error, key });
        }
    }
    async close() {
        await this.redis.quit();
    }
}
exports.RateLimiter = RateLimiter;
//# sourceMappingURL=RateLimiter.js.map