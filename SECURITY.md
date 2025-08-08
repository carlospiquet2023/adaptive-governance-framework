# Política de Segurança

## Reportando uma Vulnerabilidade

A segurança do Adaptive Governance Framework é uma prioridade máxima. Se você descobrir uma vulnerabilidade de segurança, por favor, nos avise imediatamente.

### Como Reportar

1. **NÃO** crie uma Issue pública para a vulnerabilidade.
2. Envie um email para [security@example.com](mailto:security@example.com) com:
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir o problema
   - Versões afetadas
   - Possível impacto
   - Sugestões de mitigação (se houver)

### O que esperar

1. **Confirmação**: Você receberá uma confirmação em até 24 horas.
2. **Avaliação**: Nossa equipe avaliará a vulnerabilidade e poderá entrar em contato para mais informações.
3. **Correção**: Desenvolveremos e testaremos uma correção.
4. **Divulgação**: Após a correção, divulgaremos a vulnerabilidade de forma responsável.

## Práticas de Segurança

- Todo o código é revisado antes do merge
- Dependências são monitoradas usando GitHub Security Advisories
- Análise estática de código é executada em cada PR
- Testes de segurança automatizados são executados regularmente

## Versões Suportadas

| Versão | Suporte          |
| ------ | ---------------- |
| 2.x.x  | :white_check_mark: |
| 1.x.x  | :x:              |

## Atualizações de Segurança

- Atualizações críticas são lançadas imediatamente
- Patches de segurança são backported para a última versão minor
- Notificações são enviadas via GitHub Security Advisories

## Boas Práticas para Contribuidores

1. Mantenha dependências atualizadas
2. Siga as diretrizes de código seguro
3. Execute testes de segurança localmente
4. Revise código cuidadosamente
5. Reporte vulnerabilidades responsavelmente
