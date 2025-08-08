

# 🚀 Adaptive Governance Framework - Enterprise Edition

⚠️ **PROPRIEDADE INTELECTUAL PROTEGIDA** ⚠️

[![CI](https://github.com/carlospiquet2023/adaptive-governance-framework/actions/workflows/ci.yml/badge.svg)](./infra/github-actions/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-PROPRIETÁRIA-red?style=for-the-badge)](./LICENSE)

## 📌 **AUTORIA E DIREITOS AUTORAIS**

### 🔒 **PROPRIEDADE INTELECTUAL EXCLUSIVA**

Este projeto foi **idealizado, estruturado e desenvolvido por Carlos Antonio de Oliveira Piquet e Dougla de Pinho Reck dos Santos**.

**TODOS OS DIREITOS RESERVADOS** - Este framework é propriedade intelectual exclusiva dos autores. 

### ⛔ **USO PROIBIDO SEM AUTORIZAÇÃO**

**É EXPRESSAMENTE PROIBIDO:**
- ❌ Copiar, clonar ou reproduzir qualquer parte deste código
- ❌ Usar este código em projetos pessoais ou comerciais  
- ❌ Modificar, adaptar ou criar obras derivadas
- ❌ Distribuir, sublicenciar ou comercializar
- ❌ Incorporar trechos em outros sistemas
- ❌ Usar conceitos ou arquiteturas proprietárias

### ⚖️ **PROTEÇÃO LEGAL**

**Violações estão sujeitas às penalidades da Lei Brasileira:**
- 📜 Lei 9.610/98 (Direitos Autorais)
- 🖥️ Lei 12.853/13 (Marco Civil da Internet)  
- ⚖️ Código Penal Brasileiro (Art. 184)
- 💰 Indenizações por danos materiais e morais

### 💼 **LICENCIAMENTO COMERCIAL**

Para **licença de uso**, **parcerias comerciais** ou **consultoria especializada**:

📧 **Email:** carlospiquet.projetos@gmail.com  
📱 **LinkedIn:** https://linkedin.com/in/carlospiquet2023  
🌐 **Portfólio:** https://github.com/carlospiquet2023  

---

## 🌟 **Framework Único de Governança Adaptativa com AI/ML**

Sistema empresarial avançado de governança adaptativa que utiliza **Inteligência Artificial**, **Machine Learning** e **Event Sourcing** para tomada de decisão inteligente em tempo real.

### ✨ **Características Principais**

- 🧠 **AI-Powered**: Machine Learning integrado para predições comportamentais
- 🏗️ **Clean Architecture**: DDD + CQRS + Event Sourcing + Microservices
- 🔒 **Enterprise Security**: JWT, RBAC, Rate Limiting, OWASP Compliance
- 📊 **Observabilidade Completa**: Logs estruturados, métricas, telemetria
- ⚡ **Alta Performance**: Connection pooling, caching Redis, otimizações
- 🐳 **Cloud Ready**: Docker, Kubernetes, CI/CD pipeline completo
- 🎯 **Real-time**: WebSockets, event-driven, decisões em milissegundos

### 💼 **SaaS Multi-Tenant Ready**

- 🏢 **Multi-tenancy**: Isolamento completo de dados por tenant
- 💳 **Stripe Integration**: Billing automático, planos flexíveis
- 📊 **Usage Tracking**: Monitoramento de uso em tempo real
- 🎛️ **Plan Enforcement**: Limites automáticos por plano
- 🚀 **Subdomain Routing**: `{tenant}.yourdomain.com`
- 🔧 **Admin Panel**: Gestão centralizada de tenants
- 📈 **Metrics Dashboard**: Revenue, usage, conversion rates

**Planos Disponíveis:**
- 🆓 **Free**: 1K decisions/month, 5 policies, 1 ML model
- 💎 **Pro** ($29/month): 50K decisions/month, XAI, plugins, analytics
- 🏢 **Enterprise** ($199/month): Unlimited + priority support + SSO

### 🎛️ **Painéis Web Completos (Centro de Controle)**

#### 👨‍💼 **Dashboard Administrativo (Super-Admin)**
- 📊 **Controle Centralizado**: Gestão completa de todos os tenants
- 💰 **Gestão Financeira**: Faturamento, planos, transações, inadimplência
- 📈 **Métricas do Sistema**: Revenue, tenants ativos, conversões, churn
- 👥 **Tenant Management**: CRUD completo (criar, editar, suspender, remover)
- 🔍 **Monitoramento**: Logs de atividade, auditoria, alertas
- 📋 **Relatórios**: Export de dados, dashboards customizáveis

#### 🏢 **Dashboard Tenant (Cliente)**
- 🎨 **Visão Personalizada**: Dashboard exclusivo por tenant
- 💳 **Status Financeiro**: Plano atual, próxima cobrança, histórico de faturas
- 📊 **Métricas de Uso**: API calls, usuários ativos, dados processados
- ⚙️ **Configurações**: Personalização (logo, cores), gestão de usuários
- 💰 **Autogestão Financeira**: Upgrade/downgrade, métodos de pagamento
- 🔗 **Integrações**: Slack, Teams, webhooks, API keys

#### 🎨 **Características dos Painéis**
- **Material-UI Responsivo**: Interface moderna e intuitiva
- **Gráficos Interativos**: Chart.js para visualizações avançadas
- **Autenticação com Roles**: RBAC com proteção de rotas
- **Navegação Dinâmica**: Alternância automática admin/tenant
- **Real-time Updates**: WebSocket para dados em tempo real
- **Multi-idioma**: Suporte para internacionalização

---

## 🎯 **Arquitetura Enterprise**

```mermaid
graph TB
    subgraph "🎛️ Governance Orchestrator"
        GO[Central Coordinator]
    end
    
    subgraph "🧠 AI Engines"
        PE[Policy Engine]
        CE[Context Engine] 
        LE[Learning Engine]
    end
    
    subgraph "🔧 Infrastructure"
        LOG[Advanced Logger]
        DB[Database Service]
        REDIS[Redis Service]
        CFG[Config Manager]
    end
    
    subgraph "🌐 Interfaces"
        API[GraphQL/REST API]
        UI[React Dashboard]
        WH[Webhooks]
    end
    
    GO --> PE
    GO --> CE
    GO --> LE
    GO --> LOG
    GO --> DB
    GO --> REDIS
    GO --> CFG
    
    API --> GO
    UI --> API
    WH --> GO
```

---

## 🚀 **Quick Start**

### **📋 Pré-requisitos**
- **Node.js** 18+ LTS
- **Docker** & Docker Compose
- **PostgreSQL** 14+
- **Redis** 6+

### **⚡ Instalação Rápida (POC pronta)**

```bash
# Clone o repositório
git clone https://github.com/carlospiquet2023/adaptive-governance-framework.git
cd adaptive-governance-framework

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env

# API (Core) com SaaS
cd core && npm ci --legacy-peer-deps

# Setup inicial do SaaS (cria tenants demo)
npm run setup-saas

# Inicie o servidor API
npm run api

# UI (Painel)
cd ../ui && npm ci && npm run dev
```

### **🎯 Acesso aos Serviços**
- 🖥️ **Dashboard**: http://localhost:8080
- 🔌 **API Core**: http://localhost:3000
- 📚 **Swagger UI**: http://localhost:3000/docs
- 📊 **Metrics**: http://localhost:3000/metrics
- 🏢 **Tenant Demo (Pro)**: http://localhost:3000/tenant/demo
- 🧪 **Tenant Test (Free)**: http://localhost:3000/tenant/test
- 💾 **Database**: localhost:5432
- 🔴 **Redis**: localhost:6379

### **🎛️ Demo dos Painéis Web**

#### **👨‍💼 Login Administrativo**
```bash
# Acesse: http://localhost:8080
# Email: admin@sistema.com
# Senha: admin123
# Role: ADMIN (Super-Admin)
```
**Funcionalidades disponíveis:**
- Dashboard com métricas de todos os tenants
- Gestão completa de tenants (CRUD)
- Controle financeiro e billing
- Logs e auditoria do sistema
- Relatórios e análises

#### **🏢 Login Tenant**
```bash
# Acesse: http://localhost:8080
# Email: tenant@demo.com
# Senha: tenant123
# Role: TENANT (Cliente)
```
**Funcionalidades disponíveis:**
- Dashboard personalizado do tenant
- Status do plano e faturas
- Métricas de uso individual
- Configurações da conta
- Gestão de usuários internos
- Upgrade/downgrade de plano

#### **🔄 Alternância de Painéis**
- **Navegação Automática**: Sistema detecta o role e redireciona
- **Menu de Alternância**: Botão para trocar entre Admin/Tenant
- **Rotas Protegidas**: Acesso baseado em permissões
- **Estado Persistente**: Mantém preferências do usuário

---

## 🔥 **Funcionalidades Enterprise**

### **🧠 Inteligência Artificial Integrada**
- **Policy Engine**: Avaliação inteligente de políticas com cache e context awareness
- **Context Engine**: Análise de padrões comportamentais e detecção de anomalias
- **Learning Engine**: ML models com treinamento automático e feedback loops
- **Explainability (XAI)**: Explicabilidade de decisões (features influentes) via XAIEngine

### **🏗️ Arquitetura de Classe Mundial**
- **Clean Architecture**: Separação clara de responsabilidades
- **Domain-Driven Design**: Modelagem rica do domínio
- **CQRS + Event Sourcing**: Escalabilidade e auditoria completa
- **Microservices Ready**: Preparado para arquitetura distribuída

### **🔒 Segurança Enterprise**
- **JWT Authentication**: Tokens seguros com refresh automático
- **RBAC Avançado**: Role-based access control granular  
- **Rate Limiting**: Proteção contra ataques DDoS
- **Input Sanitization**: Validação e sanitização completa
- **OWASP Compliance**: Seguindo melhores práticas de segurança

### **📊 Observabilidade Completa**
- **Structured Logging**: Winston com correlation IDs e rotação
- **Metrics & Telemetry**: Prometheus-ready (/metrics) com prom-client
- **Health Monitoring**: Monitoramento de saúde em tempo real
- **Distributed Tracing**: Rastreamento de requests distribuídos

### **⚡ Performance & Escalabilidade**
- **Connection Pooling**: Pool de conexões otimizado
- **Redis Caching**: Cache distribuído com TTL inteligente  
- **Async Processing**: Event queue com processamento assíncrono
- **Load Balancing**: Preparado para múltiplas instâncias

---

## 💻 **Desenvolvimento e POC**

### **🏃‍♂️ Desenvolvimento Local**

```bash
# Core (Backend)
cd core
npm install
npm run api          # API mock com /docs e /metrics
npm run build        # Build de produção  
npm run test         # Testes com coverage
npm run test:watch   # Testes em modo watch

# UI (Frontend) - Painéis Web Completos
cd ui
npm install
npm run dev          # Servidor React com painéis Admin/Tenant
npm run build        # Build otimizado dos painéis
npm run preview      # Preview do build
npm run test         # Testes unitários
```

### **🎨 Stack Tecnológico dos Painéis**

#### **Frontend (React + TypeScript)**
- **React 18+**: Hooks, Suspense, Concurrent Features
- **Material-UI (MUI)**: Componentes modernos e responsivos
- **Chart.js**: Gráficos interativos e dashboards
- **React Router**: Roteamento com proteção baseada em roles
- **Axios**: Cliente HTTP com interceptors
- **TypeScript**: Tipagem estática para maior robustez

#### **Autenticação & Autorização**
- **JWT Tokens**: Autenticação stateless
- **RBAC (Role-Based Access Control)**: Admin vs Tenant
- **Protected Routes**: Proteção automática de rotas
- **Context API**: Estado global de autenticação
- **Refresh Tokens**: Renovação automática de sessões

#### **UX/UI Avançada**
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Tema adaptável
- **Loading States**: Feedback visual durante operações
- **Error Boundaries**: Tratamento robusto de erros
- **Internationalização**: Suporte multi-idioma (i18n)

### **🐳 Docker (Produção)**

```bash
# Desenvolvimento com hot reload
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Produção otimizada
docker-compose -f docker-compose.prod.yml up -d --build

# Testes automatizados
docker-compose -f docker-compose.test.yml up --build --abort-on-container-exit
```

### **🧪 Testes & Quality**

```bash
# Testes completos
npm run test:full

# Coverage report
npm run test:coverage

# Linting & formatting
npm run lint
npm run format

# Type checking
npm run type-check
```

---

## 🎯 **Como Usar**

### **1️⃣ CLI Oficial (gov-cli)**
Comandos úteis:

```bash
# Compilar DSL para JSON interno do PolicyEngine
cd core
npm run cli -- dsl-compile ./pipelines/sample.rule

# Avaliar uma política (contexto inline)
npm run cli -- policy-eval -c '{"resource":"res","action":"read"}'

# Gerenciar modelos (Model Registry)
npm run cli -- model --add '{"name":"fraud","type":"classification","version":"1.0.0"}'
npm run cli -- model --list
```

### **2️⃣ API Pública (exemplos)**

```bash
# Models (requer tenant)
GET  http://localhost:3000/api/public/models
POST http://localhost:3000/api/public/models             # body: { name, type, version }
POST http://localhost:3000/api/public/models/:id/activate

# XAI (requer plano Pro/Enterprise)
POST http://localhost:3000/api/public/xai/explain        # body: { context: { resource, action, ... } }
```

### **3️⃣ SaaS Management APIs**

```bash
# Tenant Management
POST /api/saas/tenants                    # Criar novo tenant
GET  /api/saas/tenant                     # Info do tenant atual
PUT  /api/saas/tenant                     # Atualizar tenant

# Billing & Subscriptions  
POST /api/saas/billing/customer           # Criar customer no Stripe
POST /api/saas/billing/checkout           # Checkout session para upgrade
POST /api/saas/billing/portal             # Portal de gerenciamento
POST /api/saas/subscription/cancel        # Cancelar assinatura

# Plans & Usage
GET  /api/saas/plans                      # Listar planos disponíveis
GET  /api/saas/tenant                     # Ver usage e limites atuais

# Admin (sem tenant)
GET  /api/admin/tenants                   # Listar todos os tenants
PUT  /api/admin/tenants/:id/suspend       # Suspender tenant
PUT  /api/admin/tenants/:id/reactivate    # Reativar tenant
```

**Headers para tenant:**
```bash
# Via header personalizado
curl -H "x-tenant-subdomain: demo" http://localhost:3000/api/saas/tenant

# Via subdomain (produção)
curl http://demo.yourdomain.com/api/saas/tenant

# Via path (desenvolvimento)
curl http://localhost:3000/tenant/demo/api/saas/tenant
```

### **3️⃣ SDK/Framework**
```typescript
import { AdaptiveGovernanceFramework } from '@adaptive-governance/core';

const framework = AdaptiveGovernanceFramework.getInstance();
await framework.initialize();

// Fazer uma decisão de governança
const decision = await framework.makeGovernanceDecision({
  userId: 'user123',
  resource: 'sensitive-data',
  action: 'read',
  context: { ip: '192.168.1.1', time: 'business-hours' }
});

console.log(decision); // { decision: 'allow', confidence: 0.95, reasoning: [...] }
```

### **4️⃣ Políticas Dinâmicas**
```typescript
// Criar política adaptativa
await framework.createPolicy({
  id: 'data-access-policy',
  rules: [
    {
      condition: 'user.role === "admin"',
      action: 'allow'
    },
    {
      condition: 'time.isBusinessHours && user.department === "finance"',
      action: 'allow'
    }
  ],
  adaptiveRules: [
    {
      trigger: 'anomaly-detected',
      action: 'escalate-to-human'
    }
  ]
});
```

### **5️⃣ Machine Learning**
```typescript
// Treinar modelo comportamental
const model = await framework.trainBehaviorModel({
  type: 'user-behavior-analysis',
  features: ['access-patterns', 'time-based', 'resource-type'],
  trainingData: historicalData
});

// Usar predições em decisões
const prediction = await framework.predict(model.id, {
  userId: 'user123',
  requestedResource: 'confidential-file'
});
```

---

## 📈 **Monitoramento & Observabilidade**

### **📊 Métricas Disponíveis**
- **Business Metrics**: Decisões por segundo, taxa de aprovação/negação
- **Performance Metrics**: Latência, throughput, errors por endpoint
- **System Metrics**: CPU, memória, conexões DB, cache hit ratio
- **Security Metrics**: Tentativas de login, rate limiting, anomalias

### **🔍 Logs Estruturados**
```json
{
  "timestamp": "2025-08-08T10:30:45.123Z",
  "level": "info", 
  "message": "Governance decision made",
  "correlationId": "req_1691485845123_abc123",
  "userId": "user123",
  "decision": "allow",
  "confidence": 0.95,
  "processingTime": 15,
  "enginesUsed": ["PolicyEngine", "ContextEngine", "LearningEngine"]
}
```

### **📈 Dashboard Analytics**
- Real-time decision flow
- ML model performance tracking  
- Policy effectiveness analysis
- User behavior insights
- System health overview

---

## 🌐 **API Reference**

### **🔌 GraphQL Endpoint**
```graphql
# Fazer decisão de governança
mutation MakeDecision($input: GovernanceDecisionInput!) {
  makeGovernanceDecision(input: $input) {
    id
    decision
    confidence  
    reasoning
    timestamp
    metadata
  }
}

# Buscar métricas
query GetMetrics($timeRange: TimeRange!) {
  metrics(timeRange: $timeRange) {
    totalDecisions
    averageResponseTime
    decisionDistribution {
      allow
      deny  
      review
      escalate
    }
  }
}
```

### **🛠️ REST Endpoints**
```bash
POST   /api/v1/governance/decision     # Tomar decisão
GET    /api/v1/governance/metrics      # Obter métricas
POST   /api/v1/policies                # Criar política
PUT    /api/v1/policies/:id            # Atualizar política
GET    /api/v1/health                  # Health check
GET    /api/v1/metrics                 # Prometheus metrics
```

---

## 🏗️ **Deployment**

### **☁️ Cloud Deployment**

**AWS ECS/Fargate:**
```bash
# Deploy com Terraform
cd infrastructure/aws
terraform init
terraform plan
terraform apply
```

**Kubernetes:**
```bash
# Deploy no K8s
kubectl apply -f k8s/
helm install adaptive-governance ./helm-chart
```

**Azure Container Apps:**
```bash
az containerapp up --name adaptive-governance --source .
```

### **🔧 Environment Variables**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/governance
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your-super-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ENCRYPTION_KEY=32-byte-encryption-key

# Observability  
LOG_LEVEL=info
ENABLE_METRICS=true
PROMETHEUS_PORT=9090

# ML Features
ENABLE_LEARNING_ENGINE=true
MODEL_TRAINING_INTERVAL=24h
```

---

## 🤝 **Contributing**

### **🔄 Development Workflow**
1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

### **📝 Coding Standards**
- **TypeScript** com strict mode
- **ESLint** + **Prettier** para formatação
- **Jest** para testes unitários
- **Conventional Commits** para mensagens
- **JSDoc** para documentação

---

## 📄 **License**

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👥 **Equipe**

**Desenvolvido por:**
- 🚀 **Carlos Piquet** - Arquiteto Principal & Lead Developer
- 🌟 **Douglas de Pinho Reck dos Santos** -  Arquiteto Principal & Lead Developer

---

## 📞 **Suporte**

- 📧 **Email**: carlospiquet.projetos@gmail.com
- 💬 **Discord**: [Join our community](https://discord.gg/adaptive-governance)
- 📖 **Documentation**: [Full docs](https://docs.adaptive-governance.dev)
- 🐛 **Issues**: [GitHub Issues](https://github.com/carlospiquet2023/adaptive-governance-framework/issues)

---

<div align="center">
  
**⭐ Se este projeto te ajudou, considere dar uma estrela!**

[![GitHub stars](https://img.shields.io/github/stars/carlospiquet2023/adaptive-governance-framework.svg?style=social&label=Star)](https://github.com/carlospiquet2023/adaptive-governance-framework)

</div>
- Usuário padrão: `admin` / Senha: `admin` (role admin)
- Usuário comum: `user` / Senha: `user`
- Após login, navegue pelo dashboard e políticas

### 4. Endpoints principais do core
- **POST /auth/login** `{ username, password }` → `{ token, role }`
- **POST /users** `{ username, password, role }` → `{ token, role }`
- **GET /policies** → lista de políticas
- **GET /logs** → logs de eventos e integrações

---

## 🚨 **AVISO LEGAL FINAL**

### ⚖️ **ESTE PROJETO É PROPRIEDADE INTELECTUAL PROTEGIDA**

**Ao visualizar este repositório, você reconhece e declara que:**

✅ **Compreende** que este código é propriedade exclusiva de Carlos Antonio de Oliveira Piquet  
✅ **Está ciente** das restrições legais de uso, cópia e distribuição  
✅ **Concorda** em não utilizar qualquer parte deste código sem autorização  
✅ **Aceita** as consequências legais em caso de violação  

### 📞 **CONTATO PARA LICENCIAMENTO**

**Para uso comercial, parcerias ou consultoria:**

📧 **Email Direto:** carlospiquet.projetos@gmail.com  
📱 **LinkedIn Profissional:** https://linkedin.com/in/carlospiquet2023  
🌐 **Portfólio Completo:** https://github.com/carlospiquet2023  

### 🔒 **PROTEÇÃO TECNOLÓGICA**

- 🤖 **Monitoramento Automatizado** de cópias não autorizadas
- 🕵️ **Rastreamento de Uso Indevido** em tempo real  
- 📊 **Análise de Similaridade** com outros repositórios
- ⚡ **Alerta Imediato** para violações detectadas

### 📜 **DOCUMENTOS LEGAIS**

📋 [**LICENÇA COMPLETA**](./LICENSE) - Termos e condições detalhados  
📋 [**PROPRIEDADE INTELECTUAL**](./PROPRIEDADE_INTELECTUAL.md) - Aviso legal completo  

---

**© 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos - Todos os direitos reservados**

*Este projeto representa anos de desenvolvimento e inovação em arquiteturas empresariais avançadas pelos co-fundadores.*

### 5. Integrações externas simuladas
- **POST /integrations/slack** `{ message }` → envia mensagem para Slack
- **POST /integrations/teams** `{ message }` → envia mensagem para Teams
- **POST /integrations/github** `{ ...payload }` → recebe evento do GitHub
- **POST /integrations/jira** `{ ...payload }` → recebe evento do Jira

Todos os eventos são logados e podem ser consultados em `/logs`.

### 6. Estrutura do projeto
- `core/` — Núcleo TypeScript, engines, API mock, integrações
- `ui/` — Interface React/Vite, autenticação, dashboard, gráficos
- `infra/` — Docker, CI/CD
- `docs/` — Documentação e políticas
- `.github/` — Templates para Issues e Pull Requests

### 7. Documentação
- [Código de Conduta](CODE_OF_CONDUCT.md) — Diretrizes de comportamento para contribuidores
- [Guia de Contribuição](CONTRIBUTING.md) — Como contribuir com o projeto
- [Política de Segurança](SECURITY.md) — Diretrizes de segurança e reporte de vulnerabilidades
- [Documentação Técnica](docs/DOCUMENTATION.md) — Documentação detalhada do framework

## Contribuindo

Adoraríamos receber suas contribuições! Por favor, leia nosso [Guia de Contribuição](CONTRIBUTING.md) para detalhes sobre nosso processo de submissão de Pull Requests.

## Segurança

Se você descobrir uma vulnerabilidade de segurança, por favor, siga nossa [Política de Segurança](SECURITY.md).

## Código de Conduta

Este projeto segue um [Código de Conduta](CODE_OF_CONDUCT.md). Ao participar, você concorda em seguir suas diretrizes.

---

**Dúvidas ou quer evoluir? Só pedir!**
