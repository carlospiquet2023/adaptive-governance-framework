"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const Logger_1 = require("../infrastructure/Logger");
const prom_client_1 = require("prom-client");
class TelemetryService {
    static instance;
    registry = new prom_client_1.Registry();
    logger = Logger_1.Logger.getInstance();
    latency = new prom_client_1.Histogram({ name: 'agf_latency_ms', help: 'Latência por operação', buckets: [5, 10, 20, 50, 100, 200, 500, 1000], registers: [this.registry] });
    policyExec = new prom_client_1.Counter({ name: 'agf_policy_execution_total', help: 'Execuções de políticas', labelNames: ['result'], registers: [this.registry] });
    memory = new prom_client_1.Histogram({ name: 'agf_system_memory_heap_bytes', help: 'Uso de heap', buckets: [1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8], registers: [this.registry] });
    static getInstance() {
        if (!this.instance)
            this.instance = new TelemetryService();
        return this.instance;
    }
    recordLatency(operation, timeMs) {
        this.latency.observe(timeMs);
    }
    incrementPolicyExecution(policyId, success) {
        this.policyExec.inc({ result: success ? 'success' : 'failure' });
        this.logger.info('policy_execution', { policyId, success, timestamp: new Date().toISOString() });
    }
    recordMemoryUsage() {
        const usage = process.memoryUsage();
        this.memory.observe(usage.heapUsed);
    }
    getRegistry() { return this.registry; }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map