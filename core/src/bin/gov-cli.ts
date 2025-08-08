#!/usr/bin/env node
import { Command } from 'commander';
import { RuleDSLParser } from '../dsl/rule-dsl';
import { PolicyEngine } from '../engines/PolicyEngine';
import { ModelRegistry } from '../model_registry/ModelRegistry';
import { PluginRegistry } from '../plugins';
import { promises as fs } from 'node:fs';

const program = new Command();
program.name('gov-cli').description('CLI do Adaptive Governance Framework');

program
  .command('dsl-compile')
  .description('Compila regra DSL para JSON interno')
  .argument('<file>', 'arquivo .rule')
  .action(async (file: string) => {
    const text = await fs.readFile(file, 'utf-8');
    const parser = new RuleDSLParser();
    const parsed = parser.parse(text);
    console.log(JSON.stringify(parsed.toJSON(), null, 2));
  });

program
  .command('policy-eval')
  .description('Avalia uma política com contexto')
  .requiredOption('-c, --context <json>', 'Contexto JSON')
  .action(async (opts: { context: string }) => {
    const engine = new PolicyEngine();
    const ctx = JSON.parse(opts.context);
    const res = await engine.evaluate({ ...ctx, timestamp: new Date() } as any);
    console.log(JSON.stringify(res, null, 2));
  });

program
  .command('model')
  .description('Gerencia modelos no registry')
  .option('--list', 'Lista modelos')
  .option('--add <json>', 'Adiciona modelo (JSON)')
  .option('--activate <id>', 'Ativa modelo por id')
  .action((opts: { list?: boolean; add?: string; activate?: string }) => {
    const registry = ModelRegistry.getInstance();
    if (opts.list) return console.log(registry.list());
    if (opts.add) return console.log(registry.register(JSON.parse(opts.add)));
    if (opts.activate) return registry.activate(opts.activate);
  });

program
  .command('plugins')
  .description('Lista plugins carregados')
  .action(async () => {
    const reg = PluginRegistry.getInstance();
    console.log(reg.list());
  });

program.parseAsync(process.argv);
