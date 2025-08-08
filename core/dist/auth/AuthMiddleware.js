"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const JWTAuthService_1 = require("./JWTAuthService");
const RateLimiter_1 = require("../security/RateLimiter");
const Logger_1 = require("../utils/Logger");
class AuthMiddleware {
    static instance;
    authService;
    rateLimiter;
    logger;
    constructor() {
        this.authService = JWTAuthService_1.JWTAuthService.getInstance();
        this.rateLimiter = RateLimiter_1.RateLimiter.getInstance();
        this.logger = Logger_1.Logger.getInstance();
    }
    static getInstance() {
        if (!AuthMiddleware.instance) {
            AuthMiddleware.instance = new AuthMiddleware();
        }
        return AuthMiddleware.instance;
    }
    authenticate = async (req, res, next) => {
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
            }
            catch (error) {
                return res.status(401).json({
                    error: 'Token inválido ou expirado'
                });
            }
        }
        catch (error) {
            this.logger.error('Erro no middleware de autenticação', { error });
            return res.status(500).json({
                error: 'Erro interno no servidor'
            });
        }
    };
    authorize = (requiredPermissions) => {
        return async (req, res, next) => {
            try {
                const user = req.user;
                if (!user) {
                    return res.status(401).json({
                        error: 'Usuário não autenticado'
                    });
                }
                const hasAllPermissions = requiredPermissions.every(permission => user.permissions.includes(permission));
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
            }
            catch (error) {
                this.logger.error('Erro no middleware de autorização', { error });
                return res.status(500).json({
                    error: 'Erro interno no servidor'
                });
            }
        };
    };
}
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=AuthMiddleware.js.map