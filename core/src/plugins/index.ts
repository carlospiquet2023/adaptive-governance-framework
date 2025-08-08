/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

export type PluginType = 'rule' | 'connector' | 'ml-model' | 'transform' | 'custom';

export interface PluginMeta {
  name: string;
  version: string;
  type: PluginType;
  description?: string;
  author?: string;
  dependencies?: Record<string, string>;
}

export interface PluginModule<TInput = any, TOutput = any> {
  meta: PluginMeta;
  execute(input: TInput): Promise<TOutput> | TOutput;
  init?(): Promise<void> | void;
  dispose?(): Promise<void> | void;
}

export class PluginRegistry {
  private static instance: PluginRegistry;
  private plugins = new Map<string, PluginModule>();

  private constructor() {}

  static getInstance(): PluginRegistry {
    if (!this.instance) this.instance = new PluginRegistry();
    return this.instance;
  }

  list(type?: PluginType): PluginMeta[] {
    const all = Array.from(this.plugins.values()).map((p) => p.meta);
    return type ? all.filter((m) => m.type === type) : all;
  }

  get(name: string): PluginModule | undefined {
    return this.plugins.get(name);
  }

  async register(module: PluginModule): Promise<void> {
    if (this.plugins.has(module.meta.name)) return;
    if (module.init) await module.init();
    this.plugins.set(module.meta.name, module);
  }

  async unregister(name: string): Promise<void> {
    const mod = this.plugins.get(name);
    if (!mod) return;
    if (mod.dispose) await mod.dispose();
    this.plugins.delete(name);
  }
}

export class PluginLoader {
  constructor(private baseDir: string) {}

  async loadAll(): Promise<number> {
    // Suporta require dinâmico a partir de caminho.
    // Em produção, considere sandboxing.
    const glob = await import('node:fs');
    const path = await import('node:path');
    const entries = glob.readdirSync(this.baseDir, { withFileTypes: true });
    let count = 0;
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const pluginPath = path.join(this.baseDir, e.name, 'index.js');
      const tsPath = path.join(this.baseDir, e.name, 'index.ts');
      let mod: any;
      if (glob.existsSync(pluginPath)) {
        mod = await import(pathToFileURL(pluginPath).toString());
      } else if (glob.existsSync(tsPath)) {
        mod = await import(pathToFileURL(tsPath).toString());
      } else {
        continue;
      }
      const plugin: PluginModule = mod.default || mod.plugin || mod;
      if (plugin && plugin.meta) {
        await PluginRegistry.getInstance().register(plugin);
        count++;
      }
    }
    return count;
  }
}

function pathToFileURL(p: string) {
  const { pathToFileURL } = require('node:url');
  return pathToFileURL(p);
}
