"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTAuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
class JWTAuthService {
    static instance;
    secretKey;
    tokenExpiration;
    constructor() {
        this.secretKey = process.env.JWT_SECRET_KEY || (0, uuid_1.v4)();
        this.tokenExpiration = process.env.JWT_EXPIRATION || '24h';
    }
    static getInstance() {
        if (!JWTAuthService.instance) {
            JWTAuthService.instance = new JWTAuthService();
        }
        return JWTAuthService.instance;
    }
    async generateToken(user) {
        try {
            const payload = {
                sub: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
            };
            return jsonwebtoken_1.default.sign(payload, this.secretKey, {
                expiresIn: this.tokenExpiration,
                algorithm: 'HS256',
                jwtid: (0, uuid_1.v4)(),
            });
        }
        catch (error) {
            throw new Error('Erro ao gerar token JWT');
        }
    }
    async verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.secretKey);
            return {
                id: decoded.sub,
                username: decoded.username,
                role: decoded.role,
                permissions: decoded.permissions,
            };
        }
        catch (error) {
            throw new Error('Token JWT inválido ou expirado');
        }
    }
    async hashPassword(password) {
        const saltRounds = 12;
        return bcrypt_1.default.hash(password, saltRounds);
    }
    async validatePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.JWTAuthService = JWTAuthService;
//# sourceMappingURL=JWTAuthService.js.map