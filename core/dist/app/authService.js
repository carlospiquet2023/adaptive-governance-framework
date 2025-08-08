"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    jwtSecret = process.env.JWT_SECRET || 'supersecret';
    jwtExpires = '15m';
    async hashPassword(password) {
        return bcrypt_1.default.hash(password, 12);
    }
    async validatePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    generateToken(user) {
        const payload = { sub: user.id, role: user.role, permissions: user.permissions };
        const options = { expiresIn: this.jwtExpires };
        return jsonwebtoken_1.default.sign(payload, this.jwtSecret, options);
    }
    verifyToken(token) {
        return jsonwebtoken_1.default.verify(token, this.jwtSecret);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map