import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        username: string;
        role: string;
        permissions: string[];
    };
}
export declare class AuthMiddleware {
    private static instance;
    private authService;
    private rateLimiter;
    private logger;
    private constructor();
    static getInstance(): AuthMiddleware;
    authenticate: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    authorize: (requiredPermissions: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
}
