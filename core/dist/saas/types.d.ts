export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';
export interface Plan {
    id: string;
    name: string;
    type: PlanType;
    price: number;
    currency: string;
    limits: {
        maxPolicies: number;
        maxDecisionsPerMonth: number;
        maxModels: number;
        maxPlugins: number;
        hasXAI: boolean;
        hasAdvancedAnalytics: boolean;
        hasPrioritySupport: boolean;
    };
    features: string[];
}
export interface Tenant {
    id: string;
    name: string;
    subdomain: string;
    ownerId: string;
    planId: string;
    status: 'active' | 'suspended' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
    settings: {
        timezone: string;
        branding?: {
            logo?: string;
            primaryColor?: string;
            customDomain?: string;
        };
    };
}
export interface Subscription {
    id: string;
    tenantId: string;
    planId: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    status: SubscriptionStatus;
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface Usage {
    id: string;
    tenantId: string;
    month: string;
    decisionsCount: number;
    policiesCount: number;
    modelsCount: number;
    pluginsCount: number;
    lastUpdated: Date;
}
export declare const PLANS: Record<PlanType, Plan>;
