import Stripe from 'stripe';
import { Subscription, SubscriptionStatus, PlanType } from './types';
import { tenantService } from './TenantService';

// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_...', {
  apiVersion: '2025-07-30.basil',
});

/**
 * Serviço de billing e pagamentos com Stripe
 */
export class BillingService {
  private subscriptions: Map<string, Subscription> = new Map();

  /**
   * Criar customer no Stripe para um tenant
   */
  async createStripeCustomer(tenantId: string, customerData: {
    email: string;
    name: string;
    phone?: string;
  }): Promise<string> {
    const tenant = await tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    const customer = await stripe.customers.create({
      email: customerData.email,
      name: customerData.name,
      phone: customerData.phone,
      metadata: {
        tenantId: tenant.id,
        tenantName: tenant.name,
        subdomain: tenant.subdomain,
      },
    });

    return customer.id;
  }

  /**
   * Criar subscription para upgrade de plano
   */
  async createSubscription(tenantId: string, planType: PlanType, customerId: string): Promise<Subscription> {
    const tenant = await tenantService.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant ${tenantId} not found`);
    }

    // Price IDs do Stripe (devem ser criados no dashboard)
    const priceMap = {
      free: null, // Plano free não tem cobrança
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    };

    if (planType === 'free') {
      throw new Error('Free plan does not require subscription');
    }

    const priceId = priceMap[planType];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${planType}`);
    }

    // Criar subscription no Stripe
    const stripeSubscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        tenantId,
        planType,
      },
    });

    // Criar subscription local
    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      planId: `plan_${planType}`,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      status: this.mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);

    // Atualizar plano do tenant
    await tenantService.changePlan(tenantId, planType);

    return subscription;
  }

  /**
   * Obter subscription por tenant
   */
  async getSubscriptionByTenant(tenantId: string): Promise<Subscription | null> {
    return Array.from(this.subscriptions.values())
      .find(s => s.tenantId === tenantId) || null;
  }

  /**
   * Cancelar subscription
   */
  async cancelSubscription(tenantId: string, immediately: boolean = false): Promise<Subscription> {
    const subscription = await this.getSubscriptionByTenant(tenantId);
    if (!subscription) {
      throw new Error(`Subscription not found for tenant ${tenantId}`);
    }

    // Cancelar no Stripe
    const canceledSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: !immediately,
    });

    if (immediately) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    // Atualizar subscription local
    const updatedSubscription = {
      ...subscription,
      status: this.mapStripeStatus(canceledSubscription.status),
      cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, updatedSubscription);

    // Se cancelamento imediato, downgrade para free
    if (immediately) {
      await tenantService.changePlan(tenantId, 'free');
    }

    return updatedSubscription;
  }

  /**
   * Webhook handler para eventos do Stripe
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      
      case 'invoice.payment_succeeded':
        await this.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleSubscriptionUpdated(stripeSubscription: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSubscription.metadata.tenantId;
    if (!tenantId) return;

    const subscription = await this.getSubscriptionByTenant(tenantId);
    if (!subscription) return;

    const updatedSubscription = {
      ...subscription,
      status: this.mapStripeStatus(stripeSubscription.status),
      currentPeriodStart: new Date((stripeSubscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((stripeSubscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      updatedAt: new Date(),
    };

    this.subscriptions.set(subscription.id, updatedSubscription);

    // Se subscription foi cancelada, downgrade para free
    if (stripeSubscription.status === 'canceled') {
      await tenantService.changePlan(tenantId, 'free');
    }
  }

  private async handleSubscriptionDeleted(stripeSubscription: Stripe.Subscription): Promise<void> {
    const tenantId = stripeSubscription.metadata.tenantId;
    if (!tenantId) return;

    // Downgrade para plano free
    await tenantService.changePlan(tenantId, 'free');

    // Atualizar subscription status
    const subscription = await this.getSubscriptionByTenant(tenantId);
    if (subscription) {
      const updatedSubscription = {
        ...subscription,
        status: 'cancelled' as SubscriptionStatus,
        updatedAt: new Date(),
      };
      this.subscriptions.set(subscription.id, updatedSubscription);
    }
  }

  private async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    // Lógica para processar pagamento bem-sucedido
    console.log(`Payment succeeded for customer ${customerId}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId = invoice.customer as string;
    // Lógica para processar falha de pagamento
    console.log(`Payment failed for customer ${customerId}`);
    
    // Aqui você pode implementar lógica de retry, suspensão de conta, etc.
  }

  /**
   * Mapear status do Stripe para nosso enum
   */
  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const statusMap: Record<string, SubscriptionStatus> = {
      'active': 'active',
      'canceled': 'cancelled',
      'incomplete': 'past_due',
      'incomplete_expired': 'cancelled',
      'past_due': 'past_due',
      'paused': 'past_due',
      'trialing': 'trialing',
      'unpaid': 'past_due',
    };

    return statusMap[stripeStatus] || 'past_due';
  }

  /**
   * Criar portal do cliente para gerenciar billing
   */
  async createCustomerPortalSession(customerId: string, returnUrl: string): Promise<string> {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return session.url;
  }

  /**
   * Criar Checkout Session para upgrade
   */
  async createCheckoutSession(tenantId: string, planType: PlanType, successUrl: string, cancelUrl: string): Promise<string> {
    const priceMap = {
      free: null,
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly',
    };

    const priceId = priceMap[planType];
    if (!priceId) {
      throw new Error(`Price ID not configured for plan: ${planType}`);
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tenantId,
        planType,
      },
    });

    return session.url!;
  }
}

// Singleton instance
export const billingService = new BillingService();
