# Avançado: Adaptive Governance Framework - Core

Este diretório contém o núcleo do framework, com engines modulares e integração avançada para agentes, banco de dados e testes automatizados.

## Estrutura
- `src/` - Código-fonte principal (deve ser usado para novos arquivos)
- `policy_engine/`, `learning_loop/`, `context_engine/` - Engines modulares (mover para `src/` para build ideal)
- `Dockerfile` e `docker-compose.yml` - Deploy e integração
- `jest.config.ts` - Testes avançados com cobertura
- `eslint` - Linting e qualidade de código

## Comandos
- `npm install` — Instala dependências
- `npm run build` — Compila TypeScript para `dist/`
- `npm run dev` — Hot reload para desenvolvimento
- `npm test` — Testes unitários com cobertura
- `npm run lint` — Lint avançado

## Observações
- Para build ideal, mova os arquivos de engines para `src/` ou ajuste o `tsconfig.json`.
- O projeto está pronto para CI/CD, Docker e integração com banco PostgreSQL.
