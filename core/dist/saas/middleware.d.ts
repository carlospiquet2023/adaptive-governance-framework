import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            tenant?: {
                id: string;
                name: string;
                subdomain: string;
                planType: string;
                limits: any;
            };
        }
    }
}
/**
 * Middleware para identificar e validar tenant baseado no subdomain
 * Formato esperado: {subdomain}.yourdomain.com ou localhost:3000/{subdomain}
 */
export declare const tenantMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware para exigir tenant válido
 */
export declare const requireTenant: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware para verificar limites específicos
 */
export declare const checkLimit: (limitType: "canCreatePolicy" | "canCreateModel" | "canAddPlugin" | "canMakeDecision" | "hasXAI" | "hasAdvancedAnalytics") => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Middleware para incrementar usage counter automaticamente
 */
export declare const trackUsage: (usageType: "decisions" | "policies" | "models" | "plugins") => (req: Request, res: Response, next: NextFunction) => Promise<void>;
