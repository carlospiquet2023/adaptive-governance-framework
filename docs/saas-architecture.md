# SaaS Multi-Tenant Architecture

Este documento descreve o sistema SaaS multi-tenant implementado no Adaptive Governance Framework.

## 🏗️ Arquitetura

### Componentes Principais

1. **TenantService**: Gerenciamento de tenants, planos e usage tracking
2. **BillingService**: Integração com Stripe para pagamentos e assinaturas
3. **Tenant Middleware**: Resolução automática de tenant por subdomain/header
4. **Plan Enforcement**: Verificação de limites por plano em tempo real

### Modelo de Dados

```typescript
// Tenant principal
interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  settings: {
    timezone: string;
    branding?: object;
  };
}

// Tracking de uso mensal
interface Usage {
  tenantId: string;
  month: string; // YYYY-MM
  decisionsCount: number;
  policiesCount: number;
  modelsCount: number;
  pluginsCount: number;
}
```

## 💰 Planos e Pricing

### Free Plan
- ✅ 1,000 decisions/month
- ✅ 5 policies
- ✅ 1 ML model
- ❌ XAI explanations
- ❌ Custom plugins
- ❌ Advanced analytics

### Pro Plan ($29/month)
- ✅ 50,000 decisions/month
- ✅ Unlimited policies
- ✅ 10 ML models
- ✅ XAI explanations
- ✅ 5 custom plugins
- ✅ Advanced analytics

### Enterprise Plan ($199/month)
- ✅ Unlimited everything
- ✅ Priority support
- ✅ SSO integration
- ✅ Custom branding
- ✅ SLA guarantee

## 🔧 Configuração

### 1. Variáveis de Ambiente

```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Setup Inicial

```bash
# Criar dados de demonstração
npm run setup-saas
```

### 3. Configuração do Stripe

1. Criar produtos no Stripe Dashboard:
   - Pro Monthly: $29.00
   - Enterprise Monthly: $199.00

2. Configurar webhook endpoint: `/api/saas/webhooks/stripe`

3. Eventos necessários:
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

## 🌐 Tenant Resolution

### Desenvolvimento (localhost)
```
http://localhost:3000/tenant/demo/api/policies
```

### Produção (subdomain)
```
http://demo.yoursaas.com/api/policies
```

### API Header
```bash
curl -H "x-tenant-subdomain: demo" \
     http://localhost:3000/api/policies
```

## 📡 API Endpoints

### Tenant Management
```typescript
// Criar tenant
POST /api/saas/tenants
{
  "name": "My Company",
  "subdomain": "mycompany", 
  "ownerId": "user123",
  "timezone": "America/Sao_Paulo"
}

// Obter info do tenant atual
GET /api/saas/tenant
Headers: x-tenant-subdomain: mycompany

// Atualizar tenant
PUT /api/saas/tenant
{
  "name": "New Company Name",
  "settings": {
    "branding": {
      "primaryColor": "#ff0000"
    }
  }
}
```

### Billing & Subscriptions
```typescript
// Criar customer no Stripe
POST /api/saas/billing/customer
{
  "email": "owner@mycompany.com",
  "name": "John Doe",
  "phone": "+5511999999999"
}

// Criar checkout session para upgrade
POST /api/saas/billing/checkout
{
  "planType": "pro",
  "successUrl": "https://myapp.com/success",
  "cancelUrl": "https://myapp.com/cancel"
}

// Portal de gerenciamento (Stripe)
POST /api/saas/billing/portal
{
  "customerId": "cus_...",
  "returnUrl": "https://myapp.com/settings"
}

// Cancelar assinatura
POST /api/saas/subscription/cancel
{
  "immediately": false
}
```

### Plans & Usage
```typescript
// Listar planos disponíveis
GET /api/saas/plans

// Ver usage atual
GET /api/saas/tenant
// Retorna: { tenant, usage, limits, plan }
```

## 🛡️ Rate Limiting & Enforcement

### Middleware de Verificação
```typescript
// Verificar se pode criar política
router.post('/policies', 
  requireTenant,
  checkLimit('canCreatePolicy'),
  trackUsage('policies'),
  (req, res) => { /* handler */ }
);

// Verificar se tem acesso ao XAI
router.post('/xai/explain',
  requireTenant,
  checkLimit('hasXAI'),
  trackUsage('decisions'),
  (req, res) => { /* handler */ }
);
```

### Limites Automáticos
- ✅ Contagem automática de uso
- ✅ Bloqueio quando limite excedido
- ✅ Reset mensal automático
- ✅ Upgrade/downgrade em tempo real

## 🔄 Webhooks do Stripe

### Eventos Processados

1. **subscription.updated**: Atualizar status da assinatura
2. **subscription.deleted**: Downgrade para free
3. **payment_succeeded**: Confirmar pagamento
4. **payment_failed**: Tratar falha de pagamento

### Endpoint
```
POST /api/saas/webhooks/stripe
Content-Type: application/json
Stripe-Signature: t=...,v1=...
```

## 🎯 Casos de Uso

### 1. Onboarding de Novo Customer
```typescript
// 1. Criar tenant
const tenant = await tenantService.createTenant({
  name: "Acme Corp",
  subdomain: "acme",
  ownerId: "user123"
});

// 2. Iniciar com plano free
// (automático na criação)

// 3. Upgrade para pro
const checkoutUrl = await billingService.createCheckoutSession(
  tenant.id, 
  'pro',
  'https://app.com/success',
  'https://app.com/cancel'
);
```

### 2. Verificação de Limites em Runtime
```typescript
app.post('/api/policies', async (req, res) => {
  // Middleware já verificou tenant e limites
  if (!req.tenant.limits.canCreatePolicy) {
    return res.status(403).json({
      error: 'Plan limit exceeded',
      upgradeUrl: '/upgrade'
    });
  }
  
  // Criar política e incrementar counter
  // trackUsage('policies') faz isso automaticamente
});
```

### 3. Dashboard Administrativo
```typescript
// Listar todos os tenants
GET /api/admin/tenants

// Suspender tenant
PUT /api/admin/tenants/:id/suspend

// Reativar tenant  
PUT /api/admin/tenants/:id/reactivate
```

## 🚀 Deploy e Produção

### Configuração de DNS
```
# CNAME records para subdomains wildcard
*.yoursaas.com → your-server-ip
```

### Variáveis de Produção
```bash
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_...
SAAS_DOMAIN=yoursaas.com
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

### Health Check
```bash
curl https://yoursaas.com/health
```

## 📊 Monitoramento

### Métricas do Prometheus
- `tenant_count_total`: Total de tenants ativos
- `subscription_count_by_plan`: Assinaturas por plano
- `usage_decisions_total`: Total de decisões processadas
- `billing_revenue_monthly`: Revenue mensal

### Logs Estruturados
```json
{
  "level": "info",
  "msg": "Tenant created",
  "tenantId": "tenant_...",
  "subdomain": "acme",
  "planType": "free",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
