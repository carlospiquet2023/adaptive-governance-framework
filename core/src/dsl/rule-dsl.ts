/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

export type Token = { type: string; value: string };

export interface ParsedRule {
  ast: any;
  toJSON(): any;
}

// DSL: IF <expr> THEN allow|deny
// expr: <field> <op> <value> [AND|OR expr]
// ops: == != > < >= <= IN NOT IN MATCHES EXISTS

export class RuleDSLParser {
  tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    const regex = /(IF|THEN|AND|OR|IN|NOT|MATCHES|EXISTS|>=|<=|==|!=|>|<|\(|\)|'[^']*'|"[^"]*"|[A-Za-z_][A-Za-z0-9_\.]*|\S)/g;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(input)) !== null) {
      tokens.push({ type: 'tok', value: m[0] });
    }
    return tokens;
  }

  parse(input: string): ParsedRule {
    const tokens = this.tokenize(input).map((t) => t.value);
    let i = 0;
    function peek() { return tokens[i]; }
    function consume(expected?: string) {
      const t = tokens[i++];
      if (expected && t !== expected) throw new Error(`Esperado ${expected}, obteve ${t}`);
      return t;
    }

    function parseValue(): any {
      const t = consume();
      if (t.startsWith("'") || t.startsWith('"')) return t.slice(1, -1);
      if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
      if (t === 'true' || t === 'false') return t === 'true';
      return { field: t };
    }

    function parseExpr(): any {
      let left: any = parseComparison();
      while (peek() === 'AND' || peek() === 'OR') {
        const op = consume();
        const right = parseComparison();
        left = { type: op, left, right };
      }
      return left;
    }

    function parseComparison(): any {
      const left = parseValue();
      const op = peek();
      if (['==','!=','>','<','>=','<=','IN','NOT','MATCHES','EXISTS'].includes(op)) {
        const operator = consume();
        if (operator === 'EXISTS') return { type: 'EXISTS', left };
        const right = parseValue();
        return { type: 'CMP', operator, left, right };
      }
      throw new Error('Comparação inválida');
    }

    if (consume('IF') !== 'IF') throw new Error('Regra deve começar com IF');
    const condition = parseExpr();
    consume('THEN');
    const decision = consume();
    if (!['allow', 'deny'].includes(decision)) throw new Error('Decisão inválida');

    const ast = { type: 'RULE', condition, decision };

    return {
      ast,
      toJSON() {
        function toCondJSON(node: any): any {
          if (!node) return null;
          if (node.type === 'AND' || node.type === 'OR') {
            return {
              type: 'composite',
              logic: node.type.toLowerCase(),
              conditions: [toCondJSON(node.left), toCondJSON(node.right)]
            };
          }
          if (node.type === 'EXISTS') {
            return { type: 'field', field: node.left.field, operator: 'exists' };
          }
          if (node.type === 'CMP') {
            const map: Record<string,string> = {
              '==':'eq','!=':'ne','>':'gt','<':'lt','>=':'gte','<=':'lte','IN':'in','NOT':'nin','MATCHES':'regex'
            };
            const leftField = node.left.field || node.left;
            const value = typeof node.right === 'object' && 'field' in node.right ? `{{${node.right.field}}}` : node.right;
            return { type: 'field', field: leftField, operator: map[node.operator], value };
          }
          return node;
        }
        return {
          conditions: [toCondJSON(condition)],
          actions: [ { id: 'a1', type: decision as any, message: `DSL ${decision}` } ],
          enabled: true,
          priority: 100,
          name: 'dsl-rule',
          description: 'Gerada via DSL',
          version: '1.0.0',
          metadata: { createdBy: 'dsl', createdAt: new Date(), tags: ['dsl'], category: 'dsl' }
        };
      }
    };
  }
}
