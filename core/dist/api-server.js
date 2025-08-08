"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const public_1 = __importDefault(require("./api/public"));
const metrics_1 = require("./metrics/metrics");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const saas_1 = require("./saas");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// SaaS tenant middleware - aplicar a todas as rotas
app.use(saas_1.tenantMiddleware);
const integrationLogs = [];
const users = [
    { username: 'admin', password: 'admin', role: 'admin', token: 'admin-token' },
    { username: 'user', password: 'user', role: 'user', token: 'user-token' },
];
const policies = [
    { name: 'Maintainability', value: 85 },
    { name: 'Security', value: 95 },
    { name: 'Performance', value: 90 },
];
app.post('/auth/login', (0, saas_1.trackUsage)('decisions'), (req, res) => {
    const { username, password } = req.body;
    const user = users.find((u) => u.username === username && u.password === password);
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
    }
    else {
        res.status(401).json({ error: 'Credenciais inválidas' });
    }
});
app.get('/policies', (0, saas_1.checkLimit)('canCreatePolicy'), async (req, res) => {
    // Se tem tenant, retornar políticas específicas do tenant
    if (req.tenant) {
        // Aqui você integraria com PolicyEngine para filtrar por tenant
        res.status(200).json(policies.map(p => ({
            ...p,
            tenantId: req.tenant.id
        })));
    }
    else {
        res.status(200).json(policies);
    }
});
app.post('/policies', saas_1.requireTenant, (0, saas_1.checkLimit)('canCreatePolicy'), (0, saas_1.trackUsage)('policies'), async (req, res) => {
    try {
        const { name, value } = req.body;
        // Aqui você integraria com PolicyEngine para criar política do tenant
        const newPolicy = { name, value, tenantId: req.tenant.id };
        policies.push(newPolicy);
        res.status(201).json(newPolicy);
    }
    catch (error) {
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
app.use('/api/public', public_1.default);
// === SaaS Management APIs ===
// Tenant management
app.post('/api/saas/tenants', async (req, res) => {
    try {
        const { name, subdomain, ownerId, timezone } = req.body;
        const tenant = await saas_1.tenantService.createTenant({ name, subdomain, ownerId, timezone });
        res.status(201).json(tenant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/saas/tenant', saas_1.requireTenant, async (req, res) => {
    try {
        const tenant = await saas_1.tenantService.getTenant(req.tenant.id);
        const usage = await saas_1.tenantService.getCurrentUsage(req.tenant.id);
        const limits = await saas_1.tenantService.checkLimits(req.tenant.id);
        const plan = await saas_1.tenantService.getTenantPlan(req.tenant.id);
        res.json({
            tenant,
            usage,
            limits,
            plan
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/saas/tenant', saas_1.requireTenant, async (req, res) => {
    try {
        const updates = req.body;
        const tenant = await saas_1.tenantService.updateTenant(req.tenant.id, updates);
        res.json(tenant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Billing management
app.post('/api/saas/billing/customer', saas_1.requireTenant, async (req, res) => {
    try {
        const { email, name, phone } = req.body;
        const customerId = await saas_1.billingService.createStripeCustomer(req.tenant.id, { email, name, phone });
        res.json({ customerId });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/saas/billing/checkout', saas_1.requireTenant, async (req, res) => {
    try {
        const { planType, successUrl, cancelUrl } = req.body;
        const url = await saas_1.billingService.createCheckoutSession(req.tenant.id, planType, successUrl, cancelUrl);
        res.json({ url });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.post('/api/saas/billing/portal', saas_1.requireTenant, async (req, res) => {
    try {
        const { customerId, returnUrl } = req.body;
        const url = await saas_1.billingService.createCustomerPortalSession(customerId, returnUrl);
        res.json({ url });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/saas/subscription', saas_1.requireTenant, async (req, res) => {
    try {
        const subscription = await saas_1.billingService.getSubscriptionByTenant(req.tenant.id);
        res.json(subscription);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post('/api/saas/subscription/cancel', saas_1.requireTenant, async (req, res) => {
    try {
        const { immediately = false } = req.body;
        const subscription = await saas_1.billingService.cancelSubscription(req.tenant.id, immediately);
        res.json(subscription);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Plans and pricing
app.get('/api/saas/plans', (req, res) => {
    res.json(Object.values(saas_1.PLANS));
});
// Stripe webhooks
app.post('/api/saas/webhooks/stripe', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test...';
    try {
        // Em produção, verificar assinatura do Stripe
        // const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        // Para desenvolvimento, assumir que o body é o evento
        const event = JSON.parse(req.body.toString());
        await saas_1.billingService.handleWebhook(event);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Webhook error:', error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});
// Admin endpoints (sem tenant - para painel administrativo)
app.get('/api/admin/tenants', async (req, res) => {
    try {
        const tenants = await saas_1.tenantService.listTenants();
        res.json(tenants);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.put('/api/admin/tenants/:tenantId/suspend', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const tenant = await saas_1.tenantService.suspendTenant(tenantId);
        res.json(tenant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.put('/api/admin/tenants/:tenantId/reactivate', async (req, res) => {
    try {
        const { tenantId } = req.params;
        const tenant = await saas_1.tenantService.reactivateTenant(tenantId);
        res.json(tenant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// === Original routes with tenant support ===
// Métricas Prometheus
app.get('/metrics', async (_req, res) => {
    res.set('Content-Type', metrics_1.register.contentType);
    res.send(await metrics_1.register.metrics());
});
// Swagger (placeholder) - para plugar OpenAPI gerado
const swaggerDoc = { openapi: '3.0.0', info: { title: 'AGF Core API', version: '0.1.0' } };
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDoc));
app.get('/', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Core online' });
});
app.listen(3000, () => {
    console.log('API core mock rodando em http://localhost:3000');
});
//# sourceMappingURL=api-server.js.map