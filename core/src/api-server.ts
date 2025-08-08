/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import express from 'express';
import cors from 'cors';
import publicApi from './api/public';
import { register as metricsRegister } from './metrics/metrics';
import swaggerUi from 'swagger-ui-express';
import { tenantMiddleware, requireTenant, checkLimit, trackUsage, tenantService, billingService, PLANS } from './saas';

const app = express();
app.use(express.json());
app.use(cors());

// SaaS tenant middleware - aplicar a todas as rotas
app.use(tenantMiddleware);

const integrationLogs: any[] = [];

const users = [
  { username: 'admin', password: 'admin', role: 'admin', token: 'admin-token' },
  { username: 'user', password: 'user', role: 'user', token: 'user-token' },
];

const policies = [
  { name: 'Maintainability', value: 85 },
  { name: 'Security', value: 95 },
  { name: 'Performance', value: 90 },
];

app.post('/auth/login', trackUsage('decisions'), (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );
  if (user) {
    res.status(200).json({ 
      token: user.token, 
      role: user.role,
      tenant: req.tenant ? {
        id: req.tenant.id,
        name: req.tenant.name,
        subdomain: req.tenant.subdomain,
        planType: req.tenant.planType,
        limits: req.tenant.limits
      } : null
    });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

app.get('/policies', checkLimit('canCreatePolicy'), async (req, res) => {
  // Se tem tenant, retornar políticas específicas do tenant
  if (req.tenant) {
    // Aqui você integraria com PolicyEngine para filtrar por tenant
    res.status(200).json(policies.map(p => ({
      ...p,
      tenantId: req.tenant!.id
    })));
  } else {
    res.status(200).json(policies);
  }
});

app.post('/policies', requireTenant, checkLimit('canCreatePolicy'), trackUsage('policies'), async (req, res) => {
  try {
    const { name, value } = req.body;
    // Aqui você integraria com PolicyEngine para criar política do tenant
    const newPolicy = { name, value, tenantId: req.tenant!.id };
    policies.push(newPolicy);
    res.status(201).json(newPolicy);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/users', (req, res) => {
  const { username, password, role } = req.body;
  if (users.find((u) => u.username === username)) {
    res.status(409).json({ error: 'Usuário já existe' });
    return;
  }
  const token = `${username}-token`;
  users.push({ username, password, role, token });
  res.status(201).json({ token, role });
});

app.get('/logs', (req, res) => {
  res
    .status(200)
    .json([
      { event: 'login', user: 'admin', date: new Date() },
      ...integrationLogs,
    ]);
});

app.post('/integrations/slack', (req, res) => {
  const { message } = req.body;
  integrationLogs.push({
    provider: 'slack',
    type: 'send',
    message,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', sent: true, provider: 'slack', message });
});

app.post('/integrations/github', (req, res) => {
  const payload = req.body;
  integrationLogs.push({
    provider: 'github',
    type: 'receive',
    event: payload,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', received: true, provider: 'github', event: payload });
});

app.post('/integrations/teams', (req, res) => {
  const { message } = req.body;
  integrationLogs.push({
    provider: 'teams',
    type: 'send',
    message,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', sent: true, provider: 'teams', message });
});

app.post('/integrations/jira', (req, res) => {
  const payload = req.body;
  integrationLogs.push({
    provider: 'jira',
    type: 'receive',
    event: payload,
    date: new Date(),
  });
  res
    .status(200)
    .json({ status: 'ok', received: true, provider: 'jira', event: payload });
});

app.use('/api/public', publicApi);

// === SaaS Management APIs ===

// Tenant management
app.post('/api/saas/tenants', async (req, res) => {
  try {
    const { name, subdomain, ownerId, timezone } = req.body;
    const tenant = await tenantService.createTenant({ name, subdomain, ownerId, timezone });
    res.status(201).json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/saas/tenant', requireTenant, async (req, res) => {
  try {
    const tenant = await tenantService.getTenant(req.tenant!.id);
    const usage = await tenantService.getCurrentUsage(req.tenant!.id);
    const limits = await tenantService.checkLimits(req.tenant!.id);
    const plan = await tenantService.getTenantPlan(req.tenant!.id);
    
    res.json({
      tenant,
      usage,
      limits,
      plan
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/saas/tenant', requireTenant, async (req, res) => {
  try {
    const updates = req.body;
    const tenant = await tenantService.updateTenant(req.tenant!.id, updates);
    res.json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Billing management
app.post('/api/saas/billing/customer', requireTenant, async (req, res) => {
  try {
    const { email, name, phone } = req.body;
    const customerId = await billingService.createStripeCustomer(req.tenant!.id, { email, name, phone });
    res.json({ customerId });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/saas/billing/checkout', requireTenant, async (req, res) => {
  try {
    const { planType, successUrl, cancelUrl } = req.body;
    const url = await billingService.createCheckoutSession(req.tenant!.id, planType, successUrl, cancelUrl);
    res.json({ url });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/saas/billing/portal', requireTenant, async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;
    const url = await billingService.createCustomerPortalSession(customerId, returnUrl);
    res.json({ url });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/saas/subscription', requireTenant, async (req, res) => {
  try {
    const subscription = await billingService.getSubscriptionByTenant(req.tenant!.id);
    res.json(subscription);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/saas/subscription/cancel', requireTenant, async (req, res) => {
  try {
    const { immediately = false } = req.body;
    const subscription = await billingService.cancelSubscription(req.tenant!.id, immediately);
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Plans and pricing
app.get('/api/saas/plans', (req, res) => {
  res.json(Object.values(PLANS));
});

// Stripe webhooks
app.post('/api/saas/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test...';
  
  try {
    // Em produção, verificar assinatura do Stripe
    // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    
    // Para desenvolvimento, assumir que o body é o evento
    const event = JSON.parse(req.body.toString());
    
    await billingService.handleWebhook(event);
    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

// Admin endpoints (sem tenant - para painel administrativo)
app.get('/api/admin/tenants', async (req, res) => {
  try {
    const tenants = await tenantService.listTenants();
    res.json(tenants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/admin/tenants/:tenantId/suspend', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await tenantService.suspendTenant(tenantId);
    res.json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/admin/tenants/:tenantId/reactivate', async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await tenantService.reactivateTenant(tenantId);
    res.json(tenant);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// === Original routes with tenant support ===

// Métricas Prometheus
app.get('/metrics', async (_req, res) => {
  res.set('Content-Type', metricsRegister.contentType);
  res.send(await metricsRegister.metrics());
});

// Swagger (placeholder) - para plugar OpenAPI gerado
const swaggerDoc = { openapi: '3.0.0', info: { title: 'AGF Core API', version: '0.1.0' } } as any;
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Core online' });
});

app.listen(3000, () => {
  console.log('API core mock rodando em http://localhost:3000');
});
