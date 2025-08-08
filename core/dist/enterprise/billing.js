"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingManager = exports.PlanType = void 0;
var PlanType;
(function (PlanType) {
    PlanType["FREE"] = "free";
    PlanType["STARTUP"] = "startup";
    PlanType["BUSINESS"] = "business";
    PlanType["ENTERPRISE"] = "enterprise";
})(PlanType || (exports.PlanType = PlanType = {}));
class BillingManager {
    static instance;
    plans = new Map();
    constructor() {
        this.initializePlans();
    }
    static getInstance() {
        if (!BillingManager.instance) {
            BillingManager.instance = new BillingManager();
        }
        return BillingManager.instance;
    }
    initializePlans() {
        // Plano Free
        this.plans.set(PlanType.FREE, {
            users: 5,
            policies: 10,
            integrations: 2,
            customPolicies: false,
            aiAssistant: false,
            support: 'Community',
            sla: 'Best Effort',
            analytics: false,
            apiCalls: 1000
        });
        // Plano Startup (R$ 999/mês)
        this.plans.set(PlanType.STARTUP, {
            users: 20,
            policies: 50,
            integrations: 5,
            customPolicies: true,
            aiAssistant: false,
            support: 'Email 8x5',
            sla: '24h',
            analytics: true,
            apiCalls: 10000
        });
        // Plano Business (R$ 2999/mês)
        this.plans.set(PlanType.BUSINESS, {
            users: 100,
            policies: 200,
            integrations: 15,
            customPolicies: true,
            aiAssistant: true,
            support: 'Email 24x7',
            sla: '4h',
            analytics: true,
            apiCalls: 100000
        });
        // Plano Enterprise (Sob Consulta)
        this.plans.set(PlanType.ENTERPRISE, {
            users: -1, // Ilimitado
            policies: -1, // Ilimitado
            integrations: -1, // Ilimitado
            customPolicies: true,
            aiAssistant: true,
            support: 'Dedicated 24x7',
            sla: '15min',
            analytics: true,
            apiCalls: -1 // Ilimitado
        });
    }
    getPlan(type) {
        return this.plans.get(type);
    }
    async validateUsage(tenantId) {
        // Implementar verificação de uso vs limites do plano
        return true;
    }
    async generateInvoice(tenantId) {
        // Implementar geração de fatura
        return {};
    }
    calculateUpgrade(currentPlan, targetPlan) {
        // Implementar cálculo de upgrade de plano
        return 0;
    }
}
exports.BillingManager = BillingManager;
//# sourceMappingURL=billing.js.map