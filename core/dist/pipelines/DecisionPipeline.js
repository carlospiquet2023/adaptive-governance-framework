"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionPipelineEngine = void 0;
const yaml_1 = __importDefault(require("yaml"));
const Logger_1 = require("../infrastructure/Logger");
class DecisionPipelineEngine {
    logger = Logger_1.Logger.getInstance();
    handlers = new Map();
    registerHandler(type, handler) { this.handlers.set(type, handler); }
    loadFromYAML(yamlText) {
        const obj = yaml_1.default.parse(yamlText);
        if (!obj?.nodes || !obj?.entry)
            throw new Error('Pipeline YAML inválido');
        return obj;
    }
    async run(def, input) {
        const results = {};
        let current = def.entry;
        const visited = new Set();
        while (current) {
            if (visited.has(current))
                throw new Error(`Ciclo detectado em ${current}`);
            visited.add(current);
            const node = def.nodes.find((n) => n.id === current);
            if (!node)
                throw new Error(`Nó não encontrado: ${current}`);
            const handler = this.handlers.get(node.type);
            if (!handler)
                throw new Error(`Handler não registrado: ${node.type}`);
            const output = await handler({ input, config: node.config, results });
            results[node.id] = output;
            current = node.next?.[0] || '';
        }
        return results;
    }
}
exports.DecisionPipelineEngine = DecisionPipelineEngine;
//# sourceMappingURL=DecisionPipeline.js.map