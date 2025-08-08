/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Request, Response, NextFunction } from 'express';
import { tenantService } from './TenantService';

// Estender o Request para incluir tenant info
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
export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let subdomain: string | null = null;

    // Extrair subdomain do header Host
    const host = req.headers.host;
    if (host) {
      // Produção: subdomain.yourdomain.com
      if (host.includes('.') && !host.startsWith('localhost')) {
        subdomain = host.split('.')[0];
      }
      // Desenvolvimento: localhost:3000 com path /tenant/{subdomain}
      else if (host.startsWith('localhost') && req.path.startsWith('/tenant/')) {
        subdomain = req.path.split('/')[2];
        // Reescrever path removendo /tenant/{subdomain}
        req.url = req.url.replace(`/tenant/${subdomain}`, '') || '/';
        // Note: req.path é read-only, então não podemos alterá-lo diretamente
      }
    }

    // Se não encontrou subdomain, usar header customizado (útil para APIs)
    if (!subdomain && req.headers['x-tenant-subdomain']) {
      subdomain = req.headers['x-tenant-subdomain'] as string;
    }

    // Buscar tenant
    if (subdomain) {
      const tenant = await tenantService.getTenantBySubdomain(subdomain);
      
      if (!tenant) {
        return res.status(404).json({
          error: 'Tenant not found',
          code: 'TENANT_NOT_FOUND',
          subdomain
        });
      }

      if (tenant.status !== 'active') {
        return res.status(403).json({
          error: 'Tenant suspended',
          code: 'TENANT_SUSPENDED',
          status: tenant.status
        });
      }

      // Obter plano e limites
      const plan = await tenantService.getTenantPlan(tenant.id);
      const limits = await tenantService.checkLimits(tenant.id);

      // Adicionar info do tenant ao request
      req.tenant = {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        planType: plan.type,
        limits
      };
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      error: 'Internal server error in tenant resolution',
      code: 'TENANT_MIDDLEWARE_ERROR'
    });
  }
};

/**
 * Middleware para exigir tenant válido
 */
export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  if (!req.tenant) {
    return res.status(400).json({
      error: 'Tenant required',
      code: 'TENANT_REQUIRED',
      message: 'This endpoint requires a valid tenant. Provide subdomain via host, path, or x-tenant-subdomain header.'
    });
  }
  next();
};

/**
 * Middleware para verificar limites específicos
 */
export const checkLimit = (limitType: 'canCreatePolicy' | 'canCreateModel' | 'canAddPlugin' | 'canMakeDecision' | 'hasXAI' | 'hasAdvancedAnalytics') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(400).json({
        error: 'Tenant required',
        code: 'TENANT_REQUIRED'
      });
    }

    const hasAccess = req.tenant.limits[limitType];
    if (!hasAccess) {
      try {
        const plan = await tenantService.getTenantPlan(req.tenant.id);
        
        return res.status(403).json({
          error: 'Plan limit exceeded',
          code: 'PLAN_LIMIT_EXCEEDED',
          limitType,
          currentPlan: plan.type,
          message: `This feature requires a higher plan. Current plan: ${plan.name}`
        });
      } catch (error) {
        return res.status(500).json({
          error: 'Error checking plan limits',
          code: 'PLAN_CHECK_ERROR'
        });
      }
    }

    next();
  };
};

/**
 * Middleware para incrementar usage counter automaticamente
 */
export const trackUsage = (usageType: 'decisions' | 'policies' | 'models' | 'plugins') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.tenant) {
      try {
        await tenantService.incrementUsage(req.tenant.id, usageType);
      } catch (error) {
        console.error('Usage tracking error:', error);
        // Não bloquear request por erro de tracking
      }
    }
    next();
  };
};
