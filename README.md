

# 🚀 Adaptive Governance Framework - Enterprise Edition

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)

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

### **⚡ Instalação Rápida**

```bash
# Clone o repositório
git clone https://github.com/carlospiquet2023/adaptive-governance-framework.git
cd adaptive-governance-framework

# Instale dependências
npm install

# Configure ambiente
cp .env.example .env

# Suba com Docker (RECOMENDADO)
docker-compose up --build

# OU desenvolvimento local
cd core && npm install && npm run dev
cd ui && npm install && npm run dev
```

### **🎯 Acesso aos Serviços**
- 🖥️ **Dashboard**: http://localhost:8080
- 🔌 **API Core**: http://localhost:3000
- 📊 **Metrics**: http://localhost:3000/metrics
- 💾 **Database**: localhost:5432
- 🔴 **Redis**: localhost:6379

---

## 🔥 **Funcionalidades Enterprise**

### **🧠 Inteligência Artificial Integrada**
- **Policy Engine**: Avaliação inteligente de políticas com cache e context awareness
- **Context Engine**: Análise de padrões comportamentais e detecção de anomalias
- **Learning Engine**: ML models com treinamento automático e feedback loops
- **Predictive Analytics**: Predição de riscos e comportamentos em tempo real

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
- **Metrics & Telemetry**: Prometheus-compatible metrics
- **Health Monitoring**: Monitoramento de saúde em tempo real
- **Distributed Tracing**: Rastreamento de requests distribuídos

### **⚡ Performance & Escalabilidade**
- **Connection Pooling**: Pool de conexões otimizado
- **Redis Caching**: Cache distribuído com TTL inteligente  
- **Async Processing**: Event queue com processamento assíncrono
- **Load Balancing**: Preparado para múltiplas instâncias

---

## 💻 **Desenvolvimento**

### **🏃‍♂️ Desenvolvimento Local**

```bash
# Core (Backend)
cd core
npm install
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção  
npm run test         # Testes com coverage
npm run test:watch   # Testes em modo watch

# UI (Frontend)
cd ui
npm install
npm run dev          # Servidor React
npm run build        # Build otimizado
npm run preview      # Preview do build
npm run test         # Testes unitários
```

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

### **1️⃣ Autenticação**
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

### **2️⃣ Políticas Dinâmicas**
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

### **3️⃣ Machine Learning**
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
- 🌟 **Powered by AI** - GitHub Copilot Integration

---

## 📞 **Suporte**

- 📧 **Email**: support@adaptive-governance.dev
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
