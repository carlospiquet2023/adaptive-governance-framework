# Adaptive Governance Framework - Core

Este diretório contém o núcleo do framework, com engines modulares e integração avançada para agentes, banco de dados e testes automatizados.

## Estrutura
- `src/` - Código-fonte principal (deve ser usado para novos arquivos)
- `src/plugins/` - Sistema de plugins (loader/registry)
- `src/dsl/` - DSL de regras (IF ... THEN allow|deny)
- `src/xai/` - Explainability (XAIEngine)
- `src/model_registry/` - Registry de modelos (em memória)
- `src/pipelines/` - Orquestração de decisão (YAML)
- `src/privacy/` - Camada de privacidade (masking)
- `src/metrics/` - Métricas Prometheus
- `policy_engine/`, `learning_loop/`, `context_engine/` - Engines modulares (mover para `src/` para build ideal)
- `Dockerfile` e `docker-compose.yml` - Deploy e integração
- `jest.config.ts` - Testes avançados com cobertura
- `eslint` - Linting e qualidade de código

## Comandos
- `npm install` — Instala dependências
- `npm run build` — Compila TypeScript para `dist/`
- `npm run api` — API mock com /metrics e /docs
- `npm test` — Testes unitários com cobertura
- `npm run lint` — Lint avançado
- `npm run cli -- <args>` — Executa gov-cli (DSL, policies, modelos)

## Observações
- Para build ideal, mova os arquivos de engines para `src/` ou ajuste o `tsconfig.json`.
- O projeto está pronto para CI/CD, Docker e integração com banco PostgreSQL.

### Plugins
- Coloque seus plugins em `plugins/<nome>/index.(ts|js)` com export default `{ meta, execute }`.
- O Orchestrator tenta carregar automaticamente se a pasta `plugins/` existir na raiz do processo.

### Pipelines
- Exemplo em `pipelines/decision-flow.example.yaml`.
- Defina `AGF_PIPELINE_FILE` para apontar para outro YAML.

### Métricas
- Disponíveis em `/metrics` no API server (Prometheus).
