/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Logger } from '../infrastructure/Logger';

export interface ModelInfo {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'embedding' | 'rl' | 'custom';
  version: string;
  metrics?: Record<string, number>;
  trainedAt?: Date;
  active?: boolean;
  metadata?: Record<string, any>;
}

export class ModelRegistry {
  private static instance: ModelRegistry;
  private models = new Map<string, ModelInfo>();
  private logger = Logger.getInstance();

  private constructor() {}

  static getInstance() {
    if (!this.instance) this.instance = new ModelRegistry();
    return this.instance;
  }

  list() { return Array.from(this.models.values()); }
  get(id: string) { return this.models.get(id); }

  register(model: Omit<ModelInfo, 'id'>): ModelInfo {
    const id = `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const info: ModelInfo = { id, active: false, ...model };
    this.models.set(id, info);
    this.logger.info('Modelo registrado', { id, name: info.name, version: info.version });
    return info;
  }

  activate(id: string) {
    const m = this.models.get(id);
    if (!m) throw new Error('Modelo não encontrado');
    for (const mm of this.models.values()) if (mm.name === m.name) mm.active = false;
    m.active = true;
    this.logger.info('Modelo ativado', { id });
  }

  deactivate(id: string) {
    const m = this.models.get(id);
    if (!m) throw new Error('Modelo não encontrado');
    m.active = false;
    this.logger.info('Modelo desativado', { id });
  }
}
