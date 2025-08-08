

# Adaptive Governance Framework

Framework enterprise para governança adaptativa de software, com núcleo TypeScript, UI React, integrações externas e pronto para produção.

## Passo a passo para rodar e usar

### Pré-requisitos
- Node.js 18+
- Docker Desktop

### 1. Subir tudo com Docker Compose

#### Ambiente de Desenvolvimento
Para o ambiente de desenvolvimento, crie um arquivo `.env` a partir do `.env.example` e preencha as variáveis de ambiente.
```sh
cp .env.example .env
```
Em seguida, suba os serviços com o Docker Compose:
```sh
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

#### Ambiente de Produção
Para o ambiente de produção, utilize o arquivo `docker-compose.prod.yml`:
```sh
docker-compose -f docker-compose.prod.yml up -d --build
```
- UI: http://localhost:8080
- Core/API: http://localhost:3000
- Banco: localhost:5432

### 2. Desenvolvimento local
#### Core
```sh
cd core
npm install
npm run dev # modo dev
npm run api # API mock para autenticação, políticas, integrações
```
#### UI
```sh
cd ui
npm install
npm run dev
```

### 3. Fluxo de autenticação
- Acesse `/login` na UI
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
