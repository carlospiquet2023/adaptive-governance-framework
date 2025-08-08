/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import Redis from 'ioredis';
import { logger } from '../shared/logger';

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

export class RateLimiter {
    private static instance: RateLimiter;
    private redis: Redis;
    private config: RateLimitConfig;

    private constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            }
        });

        
        this.config = {
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 minutos
        };

        this.redis.on('error', (error: unknown) => {
            logger.error('Erro na conexão com Redis', { error });
        });
    }

    public static getInstance(): RateLimiter {
        if (!RateLimiter.instance) {
            RateLimiter.instance = new RateLimiter();
        }
        return RateLimiter.instance;
    }

    public async isRateLimited(key: string): Promise<boolean> {
        const now = Date.now();
        const windowStart = now - this.config.windowMs;

        try {
            // Remove registros expirados
            await this.redis.zremrangebyscore(key, 0, windowStart);

            // Conta requisições no período
            const requestCount = await this.redis.zcard(key);

            if (requestCount >= this.config.maxRequests) {
                logger.info('Rate limit atingido', { key, requestCount });
                return true;
            }

            // Adiciona nova requisição
            await this.redis.zadd(key, now.toString(), now.toString());
            
            // Define TTL para limpeza automática
            await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

            return false;
        } catch (error) {
            logger.error('Erro ao verificar rate limit', { error, key });
            return false; // Em caso de erro, permite a requisição
        }
    }

    public async resetLimit(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            logger.error('Erro ao resetar rate limit', { error, key });
        }
    }

    public async close(): Promise<void> {
        await this.redis.quit();
    }
}
