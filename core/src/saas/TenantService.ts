import { Tenant, Subscription, Plan, Usage, PLANS, PlanType } from './types';

/**
 * Serviço de gerenciamento de tenants e multi-tenancy
 */
export class TenantService {
  private tenants: Map<string, Tenant> = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private usage: Map<string, Usage> = new Map();

  /**
   * Criar novo tenant com plano free por padrão
   */
  async createTenant(data: {
    name: string;
    subdomain: string;
    ownerId: string;
    timezone?: string;
  }): Promise<Tenant> {
    const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Verificar se subdomain já existe
    const existingBySubdomain = Array.from(this.tenants.values())
      .find(t => t.subdomain === data.subdomain);
    
    if (existingBySubdomain) {
      throw new Error(`Subdomain '${data.subdomain}' already exists`);
    }

    const tenant: Tenant = {
      id: tenantId,
      name: data.name,
      subdomain: data.subdomain,
      ownerId: data.ownerId,
      planId: 'plan_free',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      settings: {
        timezone: data.timezone || 'UTC',
      }
    };

    this.tenants.set(tenantId, tenant);

    // Inicializar usage tracking
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    this.usage.set(`${tenantId}_${currentMonth}`, {
      id: `usage_${tenantId}_${currentMonth}`,
      tenantId,
      month: currentMonth,
      decisionsCount: 0,
      policiesCount: 0,
      modelsCount: 0,
      pluginsCount: 0,
      lastUpdated: new Date()
    });

    return tenant;
  }

  /**
   * Obter tenant por ID
   */
  async getTenant(tenantId: string): Promise<Tenant | null> {
    return this.tenants.get(tenantId) || null;
  }

  /**
   * Obter tenant por subdomain
   */
  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    return Array.from(this.tenants.values())
      .find(t => t.subdomain === subdomain) || null;
  }

  /**
   * Atualizar tenant
   */
  async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<Tenant> {
    const tenant = this.tenants.get(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const updatedTenant = {
      ...tenant,
      ...updates,
      updatedAt: new Date()
    };

    this.tenants.set(tenantId, updatedTenant);
    return updatedTenant;
  }

  /**
   * Obter plano atual do tenant
   */
  async getTenantPlan(tenantId: string): Promise<Plan> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const planType = tenant.planId.replace('plan_', '') as PlanType;
    return PLANS[planType];
  }

  /**
   * Verificar limites do tenant
   */
  async checkLimits(tenantId: string): Promise<{
    canCreatePolicy: boolean;
    canCreateModel: boolean;
    canAddPlugin: boolean;
    canMakeDecision: boolean;
    hasXAI: boolean;
    hasAdvancedAnalytics: boolean;
    hasPrioritySupport: boolean;
  }> {
    const plan = await this.getTenantPlan(tenantId);
    const usage = await this.getCurrentUsage(tenantId);

    return {
      canCreatePolicy: plan.limits.maxPolicies === -1 || usage.policiesCount < plan.limits.maxPolicies,
      canCreateModel: plan.limits.maxModels === -1 || usage.modelsCount < plan.limits.maxModels,
      canAddPlugin: plan.limits.maxPlugins === -1 || usage.pluginsCount < plan.limits.maxPlugins,
      canMakeDecision: plan.limits.maxDecisionsPerMonth === -1 || usage.decisionsCount < plan.limits.maxDecisionsPerMonth,
      hasXAI: plan.limits.hasXAI,
      hasAdvancedAnalytics: plan.limits.hasAdvancedAnalytics,
      hasPrioritySupport: plan.limits.hasPrioritySupport,
    };
  }

  /**
   * Incrementar usage counters
   */
  async incrementUsage(tenantId: string, type: 'decisions' | 'policies' | 'models' | 'plugins'): Promise<void> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usageKey = `${tenantId}_${currentMonth}`;
    
    let usage = this.usage.get(usageKey);
    if (!usage) {
      usage = {
        id: `usage_${tenantId}_${currentMonth}`,
        tenantId,
        month: currentMonth,
        decisionsCount: 0,
        policiesCount: 0,
        modelsCount: 0,
        pluginsCount: 0,
        lastUpdated: new Date()
      };
    }

    switch (type) {
      case 'decisions':
        usage.decisionsCount++;
        break;
      case 'policies':
        usage.policiesCount++;
        break;
      case 'models':
        usage.modelsCount++;
        break;
      case 'plugins':
        usage.pluginsCount++;
        break;
    }

    usage.lastUpdated = new Date();
    this.usage.set(usageKey, usage);
  }

  /**
   * Obter usage atual do mês
   */
  async getCurrentUsage(tenantId: string): Promise<Usage> {
    const currentMonth = new Date().toISOString().substring(0, 7);
    const usageKey = `${tenantId}_${currentMonth}`;
    
    let usage = this.usage.get(usageKey);
    if (!usage) {
      usage = {
        id: `usage_${tenantId}_${currentMonth}`,
        tenantId,
        month: currentMonth,
        decisionsCount: 0,
        policiesCount: 0,
        modelsCount: 0,
        pluginsCount: 0,
        lastUpdated: new Date()
      };
      this.usage.set(usageKey, usage);
    }

    return usage;
  }

  /**
   * Upgrade/downgrade do plano
   */
  async changePlan(tenantId: string, newPlanType: PlanType): Promise<Tenant> {
    const tenant = await this.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const newPlanId = `plan_${newPlanType}`;
    return await this.updateTenant(tenantId, { planId: newPlanId });
  }

  /**
   * Listar todos os tenants (admin)
   */
  async listTenants(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  /**
   * Suspender tenant
   */
  async suspendTenant(tenantId: string): Promise<Tenant> {
    return await this.updateTenant(tenantId, { status: 'suspended' });
  }

  /**
   * Reativar tenant
   */
  async reactivateTenant(tenantId: string): Promise<Tenant> {
    return await this.updateTenant(tenantId, { status: 'active' });
  }
}

// Singleton instance
export const tenantService = new TenantService();
