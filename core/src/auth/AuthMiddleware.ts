/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Request, Response, NextFunction } from 'express';
import { JWTAuthService } from './JWTAuthService';
import { RateLimiter } from '../security/RateLimiter';
import { Logger } from '../utils/Logger';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
        permissions: string[];
    };
}

export class AuthMiddleware {
    private static instance: AuthMiddleware;
    private authService: JWTAuthService;
    private rateLimiter: RateLimiter;
    private logger: Logger;

    private constructor() {
        this.authService = JWTAuthService.getInstance();
        this.rateLimiter = RateLimiter.getInstance();
        this.logger = Logger.getInstance();
    }

    public static getInstance(): AuthMiddleware {
        if (!AuthMiddleware.instance) {
            AuthMiddleware.instance = new AuthMiddleware();
        }
        return AuthMiddleware.instance;
    }

    public authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            // Rate limiting check
            const clientIp = req.ip || 'unknown';
            if (await this.rateLimiter.isRateLimited(clientIp)) {
                this.logger.warn('Rate limit exceeded', { ip: clientIp });
                return res.status(429).json({
                    error: 'Muitas requisições. Tente novamente em alguns minutos.'
                });
            }

            const authHeader = req.headers.authorization;
            
            if (!authHeader) {
                return res.status(401).json({
                    error: 'Token não fornecido'
                });
            }

            const [, token] = authHeader.split(' ');

            if (!token) {
                return res.status(401).json({
                    error: 'Token mal formatado'
                });
            }

            try {
                const user = await this.authService.verifyToken(token);
                req.user = user;
                
                // Log successful authentication
                this.logger.info('Autenticação bem sucedida', {
                    userId: user.id,
                    username: user.username,
                });

                return next();
            } catch (error) {
                return res.status(401).json({
                    error: 'Token inválido ou expirado'
                });
            }
        } catch (error) {
            this.logger.error('Erro no middleware de autenticação', { error });
            return res.status(500).json({
                error: 'Erro interno no servidor'
            });
        }
    }

    public authorize = (requiredPermissions: string[]) => {
        return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
            try {
                const user = req.user;

                if (!user) {
                    return res.status(401).json({
                        error: 'Usuário não autenticado'
                    });
                }

                const hasAllPermissions = requiredPermissions.every(
                    permission => user.permissions.includes(permission)
                );

                if (!hasAllPermissions) {
                    this.logger.warn('Tentativa de acesso não autorizado', {
                        userId: user.id,
                        username: user.username,
                        requiredPermissions,
                        userPermissions: user.permissions
                    });

                    return res.status(403).json({
                        error: 'Permissões insuficientes'
                    });
                }

                return next();
            } catch (error) {
                this.logger.error('Erro no middleware de autorização', { error });
                return res.status(500).json({
                    error: 'Erro interno no servidor'
                });
            }
        }
    }
}
