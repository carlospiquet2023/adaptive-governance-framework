# Contribuindo com o Adaptive Governance Framework

Obrigado por considerar contribuir com o projeto! Este documento fornece diretrizes para contribuições.

## Como Contribuir

### Reportando Bugs
1. Verifique se o bug já não foi reportado em [Issues](https://github.com/carlospiquet2023/adaptive-governance-framework/issues)
2. Se não encontrou, [crie uma nova issue](https://github.com/carlospiquet2023/adaptive-governance-framework/issues/new)
3. Use o template de bug e forneça:
   - Descrição clara
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots se relevante
   - Ambiente (SO, versões, etc)

### Sugerindo Melhorias
1. Abra uma issue usando o template de feature
2. Descreva claramente:
   - Problema que resolve
   - Solução proposta
   - Alternativas consideradas
   - Exemplos de uso

### Pull Requests
1. Fork o repositório
2. Crie uma branch para sua feature: `git checkout -b feature/nome-da-feature`
3. Faça suas mudanças seguindo:
   - [Conventional Commits](https://www.conventionalcommits.org/)
   - Testes para novas funcionalidades
   - Documentação atualizada
4. Push para seu fork
5. Abra PR para `main`

## Ambiente de Desenvolvimento

```bash
# Clone
git clone https://github.com/SEU_USUARIO/adaptive-governance-framework.git
cd adaptive-governance-framework

# Core
cd core
npm install
npm run dev # servidor de desenvolvimento
npm test # testes
npm run lint # verificação de código

# UI
cd ../ui
npm install
npm run dev # interface de desenvolvimento
```

## Estrutura do Projeto

```
adaptive-governance-framework/
├── core/                   # Núcleo TypeScript
│   ├── src/
│   │   ├── policy-engine/
│   │   ├── learning-loop/
│   │   └── context-engine/
│   └── tests/
├── ui/                    # Interface React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   └── tests/
└── docs/                 # Documentação
