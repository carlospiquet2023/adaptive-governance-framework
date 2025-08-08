import { Tenant, Plan, Usage, PlanType } from './types';
/**
 * Serviço de gerenciamento de tenants e multi-tenancy
 */
export declare class TenantService {
    private tenants;
    private subscriptions;
    private usage;
    /**
     * Criar novo tenant com plano free por padrão
     */
    createTenant(data: {
        name: string;
        subdomain: string;
        ownerId: string;
        timezone?: string;
    }): Promise<Tenant>;
    /**
     * Obter tenant por ID
     */
    getTenant(tenantId: string): Promise<Tenant | null>;
    /**
     * Obter tenant por subdomain
     */
    getTenantBySubdomain(subdomain: string): Promise<Tenant | null>;
    /**
     * Atualizar tenant
     */
    updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant>;
    /**
     * Obter plano atual do tenant
     */
    getTenantPlan(tenantId: string): Promise<Plan>;
    /**
     * Verificar limites do tenant
     */
    checkLimits(tenantId: string): Promise<{
        canCreatePolicy: boolean;
        canCreateModel: boolean;
        canAddPlugin: boolean;
        canMakeDecision: boolean;
        hasXAI: boolean;
        hasAdvancedAnalytics: boolean;
        hasPrioritySupport: boolean;
    }>;
    /**
     * Incrementar usage counters
     */
    incrementUsage(tenantId: string, type: 'decisions' | 'policies' | 'models' | 'plugins'): Promise<void>;
    /**
     * Obter usage atual do mês
     */
    getCurrentUsage(tenantId: string): Promise<Usage>;
    /**
     * Upgrade/downgrade do plano
     */
    changePlan(tenantId: string, newPlanType: PlanType): Promise<Tenant>;
    /**
     * Listar todos os tenants (admin)
     */
    listTenants(): Promise<Tenant[]>;
    /**
     * Suspender tenant
     */
    suspendTenant(tenantId: string): Promise<Tenant>;
    /**
     * Reativar tenant
     */
    reactivateTenant(tenantId: string): Promise<Tenant>;
}
export declare const tenantService: TenantService;
