"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorsTotal = exports.decisionsTotal = exports.decisionLatency = exports.register = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
exports.register = new prom_client_1.default.Registry();
prom_client_1.default.collectDefaultMetrics({ register: exports.register });
exports.decisionLatency = new prom_client_1.default.Histogram({
    name: 'agf_decision_latency_ms',
    help: 'Latência da decisão em ms',
    buckets: [5, 10, 20, 50, 100, 200, 500, 1000],
    registers: [exports.register],
});
exports.decisionsTotal = new prom_client_1.default.Counter({
    name: 'agf_decisions_total',
    help: 'Total de decisões tomadas',
    registers: [exports.register],
});
exports.errorsTotal = new prom_client_1.default.Counter({
    name: 'agf_errors_total',
    help: 'Total de erros no framework',
    registers: [exports.register],
});
//# sourceMappingURL=metrics.js.map