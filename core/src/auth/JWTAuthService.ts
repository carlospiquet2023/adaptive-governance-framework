/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface User {
    id: string;
    username: string;
    role: string;
    permissions: string[];
}

export class JWTAuthService {
    private static instance: JWTAuthService;
    private readonly secretKey: string;
    private readonly tokenExpiration: string;
    
    private constructor() {
        this.secretKey = process.env.JWT_SECRET_KEY || uuidv4();
        this.tokenExpiration = process.env.JWT_EXPIRATION || '24h';
    }

    public static getInstance(): JWTAuthService {
        if (!JWTAuthService.instance) {
            JWTAuthService.instance = new JWTAuthService();
        }
        return JWTAuthService.instance;
    }

    async generateToken(user: User): Promise<string> {
        try {
            const payload = {
                sub: user.id,
                username: user.username,
                role: user.role,
                permissions: user.permissions,
            };

            return jwt.sign(payload, this.secretKey, {
                expiresIn: this.tokenExpiration,
                algorithm: 'HS256',
                jwtid: uuidv4(),
            } as jwt.SignOptions);
        } catch (error) {
            throw new Error('Erro ao gerar token JWT');
        }
    }

    async verifyToken(token: string): Promise<User> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as any;
            return {
                id: decoded.sub,
                username: decoded.username,
                role: decoded.role,
                permissions: decoded.permissions,
            };
        } catch (error) {
            throw new Error('Token JWT inválido ou expirado');
        }
    }

    async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    }

    async validatePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}
