/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

export type PlanType = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number; // em cents
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
  month: string; // YYYY-MM
  decisionsCount: number;
  policiesCount: number;
  modelsCount: number;
  pluginsCount: number;
  lastUpdated: Date;
}

// Plans predefinidos
export const PLANS: Record<PlanType, Plan> = {
  free: {
    id: 'plan_free',
    name: 'Free',
    type: 'free',
    price: 0,
    currency: 'usd',
    limits: {
      maxPolicies: 5,
      maxDecisionsPerMonth: 1000,
      maxModels: 1,
      maxPlugins: 0,
      hasXAI: false,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
    },
    features: [
      '1,000 decisions/month',
      '5 policies',
      '1 ML model',
      'Basic analytics',
      'Community support'
    ]
  },
  pro: {
    id: 'plan_pro',
    name: 'Pro',
    type: 'pro',
    price: 2900, // $29.00
    currency: 'usd',
    limits: {
      maxPolicies: -1, // unlimited
      maxDecisionsPerMonth: 50000,
      maxModels: 10,
      maxPlugins: 5,
      hasXAI: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: false,
    },
    features: [
      '50,000 decisions/month',
      'Unlimited policies',
      '10 ML models',
      '5 custom plugins',
      'XAI explanations',
      'Advanced analytics',
      'Email support'
    ]
  },
  enterprise: {
    id: 'plan_enterprise',
    name: 'Enterprise',
    type: 'enterprise',
    price: 19900, // $199.00
    currency: 'usd',
    limits: {
      maxPolicies: -1,
      maxDecisionsPerMonth: -1, // unlimited
      maxModels: -1,
      maxPlugins: -1,
      hasXAI: true,
      hasAdvancedAnalytics: true,
      hasPrioritySupport: true,
    },
    features: [
      'Unlimited decisions',
      'Unlimited policies',
      'Unlimited ML models',
      'Unlimited plugins',
      'XAI explanations',
      'Advanced analytics',
      'Priority support',
      'SSO integration',
      'Custom branding',
      'SLA guarantee'
    ]
  }
};
