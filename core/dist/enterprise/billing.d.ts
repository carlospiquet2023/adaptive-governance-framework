export declare enum PlanType {
    FREE = "free",
    STARTUP = "startup",
    BUSINESS = "business",
    ENTERPRISE = "enterprise"
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
export declare class BillingManager {
    private static instance;
    private plans;
    private constructor();
    static getInstance(): BillingManager;
    private initializePlans;
    getPlan(type: PlanType): PlanLimit | undefined;
    validateUsage(tenantId: string): Promise<boolean>;
    generateInvoice(tenantId: string): Promise<any>;
    calculateUpgrade(currentPlan: PlanType, targetPlan: PlanType): number;
}
