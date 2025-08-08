/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import YAML from 'yaml';
import { Logger } from '../infrastructure/Logger';

export type NodeHandler = (ctx: any) => Promise<any> | any;

export interface PipelineNode {
  id: string;
  type: string; // ex: context, policy, xai, audit
  next?: string[]; // ids próximos
  config?: Record<string, any>;
}

export interface DecisionPipelineDef {
  name: string;
  nodes: PipelineNode[];
  entry: string; // id do nó inicial
}

export class DecisionPipelineEngine {
  private logger = Logger.getInstance();
  private handlers = new Map<string, NodeHandler>();

  registerHandler(type: string, handler: NodeHandler) { this.handlers.set(type, handler); }

  loadFromYAML(yamlText: string): DecisionPipelineDef {
    const obj = YAML.parse(yamlText) as any;
    if (!obj?.nodes || !obj?.entry) throw new Error('Pipeline YAML inválido');
    return obj as DecisionPipelineDef;
  }

  async run(def: DecisionPipelineDef, input: any) {
    const results: Record<string, any> = {};
    let current = def.entry;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) throw new Error(`Ciclo detectado em ${current}`);
      visited.add(current);
      const node = def.nodes.find((n) => n.id === current);
      if (!node) throw new Error(`Nó não encontrado: ${current}`);
      const handler = this.handlers.get(node.type);
      if (!handler) throw new Error(`Handler não registrado: ${node.type}`);
      const output = await handler({ input, config: node.config, results });
      results[node.id] = output;
      current = node.next?.[0] || '';
    }
    return results;
  }
}
