"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = void 0;
// Plans predefinidos
exports.PLANS = {
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
//# sourceMappingURL=types.js.map