export interface User {
    id: string;
    username: string;
    role: string;
    permissions: string[];
}
export declare class JWTAuthService {
    private static instance;
    private readonly secretKey;
    private readonly tokenExpiration;
    private constructor();
    static getInstance(): JWTAuthService;
    generateToken(user: User): Promise<string>;
    verifyToken(token: string): Promise<User>;
    hashPassword(password: string): Promise<string>;
    validatePassword(password: string, hash: string): Promise<boolean>;
}
