#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const rule_dsl_1 = require("../dsl/rule-dsl");
const PolicyEngine_1 = require("../engines/PolicyEngine");
const ModelRegistry_1 = require("../model_registry/ModelRegistry");
const plugins_1 = require("../plugins");
const node_fs_1 = require("node:fs");
const program = new commander_1.Command();
program.name('gov-cli').description('CLI do Adaptive Governance Framework');
program
    .command('dsl-compile')
    .description('Compila regra DSL para JSON interno')
    .argument('<file>', 'arquivo .rule')
    .action(async (file) => {
    const text = await node_fs_1.promises.readFile(file, 'utf-8');
    const parser = new rule_dsl_1.RuleDSLParser();
    const parsed = parser.parse(text);
    console.log(JSON.stringify(parsed.toJSON(), null, 2));
});
program
    .command('policy-eval')
    .description('Avalia uma política com contexto')
    .requiredOption('-c, --context <json>', 'Contexto JSON')
    .action(async (opts) => {
    const engine = new PolicyEngine_1.PolicyEngine();
    const ctx = JSON.parse(opts.context);
    const res = await engine.evaluate({ ...ctx, timestamp: new Date() });
    console.log(JSON.stringify(res, null, 2));
});
program
    .command('model')
    .description('Gerencia modelos no registry')
    .option('--list', 'Lista modelos')
    .option('--add <json>', 'Adiciona modelo (JSON)')
    .option('--activate <id>', 'Ativa modelo por id')
    .action((opts) => {
    const registry = ModelRegistry_1.ModelRegistry.getInstance();
    if (opts.list)
        return console.log(registry.list());
    if (opts.add)
        return console.log(registry.register(JSON.parse(opts.add)));
    if (opts.activate)
        return registry.activate(opts.activate);
});
program
    .command('plugins')
    .description('Lista plugins carregados')
    .action(async () => {
    const reg = plugins_1.PluginRegistry.getInstance();
    console.log(reg.list());
});
program.parseAsync(process.argv);
//# sourceMappingURL=gov-cli.js.map