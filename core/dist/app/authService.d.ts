import jwt from 'jsonwebtoken';
import { User } from '../core/user';
export declare class AuthService {
    private jwtSecret;
    private jwtExpires;
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hash: string): Promise<boolean>;
    generateToken(user: User): string;
    verifyToken(token: string): string | jwt.JwtPayload;
}
