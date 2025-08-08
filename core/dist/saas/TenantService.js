"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantService = exports.TenantService = void 0;
const types_1 = require("./types");
/**
 * Serviço de gerenciamento de tenants e multi-tenancy
 */
class TenantService {
    tenants = new Map();
    subscriptions = new Map();
    usage = new Map();
    /**
     * Criar novo tenant com plano free por padrão
     */
    async createTenant(data) {
        const tenantId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Verificar se subdomain já existe
        const existingBySubdomain = Array.from(this.tenants.values())
            .find(t => t.subdomain === data.subdomain);
        if (existingBySubdomain) {
            throw new Error(`Subdomain '${data.subdomain}' already exists`);
        }
        const tenant = {
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
    async getTenant(tenantId) {
        return this.tenants.get(tenantId) || null;
    }
    /**
     * Obter tenant por subdomain
     */
    async getTenantBySubdomain(subdomain) {
        return Array.from(this.tenants.values())
            .find(t => t.subdomain === subdomain) || null;
    }
    /**
     * Atualizar tenant
     */
    async updateTenant(tenantId, updates) {
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
    async getTenantPlan(tenantId) {
        const tenant = await this.getTenant(tenantId);
        if (!tenant) {
            throw new Error(`Tenant ${tenantId} not found`);
        }
        const planType = tenant.planId.replace('plan_', '');
        return types_1.PLANS[planType];
    }
    /**
     * Verificar limites do tenant
     */
    async checkLimits(tenantId) {
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
    async incrementUsage(tenantId, type) {
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
    async getCurrentUsage(tenantId) {
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
    async changePlan(tenantId, newPlanType) {
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
    async listTenants() {
        return Array.from(this.tenants.values());
    }
    /**
     * Suspender tenant
     */
    async suspendTenant(tenantId) {
        return await this.updateTenant(tenantId, { status: 'suspended' });
    }
    /**
     * Reativar tenant
     */
    async reactivateTenant(tenantId) {
        return await this.updateTenant(tenantId, { status: 'active' });
    }
}
exports.TenantService = TenantService;
// Singleton instance
exports.tenantService = new TenantService();
//# sourceMappingURL=TenantService.js.map