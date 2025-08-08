import Stripe from 'stripe';
import { Subscription, PlanType } from './types';
/**
 * Serviço de billing e pagamentos com Stripe
 */
export declare class BillingService {
    private subscriptions;
    /**
     * Criar customer no Stripe para um tenant
     */
    createStripeCustomer(tenantId: string, customerData: {
        email: string;
        name: string;
        phone?: string;
    }): Promise<string>;
    /**
     * Criar subscription para upgrade de plano
     */
    createSubscription(tenantId: string, planType: PlanType, customerId: string): Promise<Subscription>;
    /**
     * Obter subscription por tenant
     */
    getSubscriptionByTenant(tenantId: string): Promise<Subscription | null>;
    /**
     * Cancelar subscription
     */
    cancelSubscription(tenantId: string, immediately?: boolean): Promise<Subscription>;
    /**
     * Webhook handler para eventos do Stripe
     */
    handleWebhook(event: Stripe.Event): Promise<void>;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handlePaymentSucceeded;
    private handlePaymentFailed;
    /**
     * Mapear status do Stripe para nosso enum
     */
    private mapStripeStatus;
    /**
     * Criar portal do cliente para gerenciar billing
     */
    createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string>;
    /**
     * Criar Checkout Session para upgrade
     */
    createCheckoutSession(tenantId: string, planType: PlanType, successUrl: string, cancelUrl: string): Promise<string>;
}
export declare const billingService: BillingService;
