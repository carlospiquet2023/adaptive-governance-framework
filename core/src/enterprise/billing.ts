/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

export enum PlanType {
    FREE = 'free',
    STARTUP = 'startup',
    BUSINESS = 'business',
    ENTERPRISE = 'enterprise'
}

export interface PlanLimit {
    users: number;
    policies: number;
    integrations: number;
    customPolicies: boolean;
    aiAssistant: boolean;
    support: string;
    sla: string;
    analytics: boolean;
    apiCalls: number;
}

export class BillingManager {
    private static instance: BillingManager;
    private plans: Map<PlanType, PlanLimit> = new Map();
    
    private constructor() {
        this.initializePlans();
    }
    
    static getInstance(): BillingManager {
        if (!BillingManager.instance) {
            BillingManager.instance = new BillingManager();
        }
        return BillingManager.instance;
    }
    
    private initializePlans(): void {
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
    
    getPlan(type: PlanType): PlanLimit | undefined {
        return this.plans.get(type);
    }
    
    async validateUsage(tenantId: string): Promise<boolean> {
        // Implementar verificação de uso vs limites do plano
        return true;
    }
    
    async generateInvoice(tenantId: string): Promise<any> {
        // Implementar geração de fatura
        return {};
    }
    
    calculateUpgrade(currentPlan: PlanType, targetPlan: PlanType): number {
        // Implementar cálculo de upgrade de plano
        return 0;
    }
}
