/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Logger } from '../infrastructure/Logger';
import { Counter, Histogram, Registry } from 'prom-client';

export class TelemetryService {
    private static instance: TelemetryService;
    private readonly registry = new Registry();
    private readonly logger = Logger.getInstance();
    private readonly latency = new Histogram({ name: 'agf_latency_ms', help: 'Latência por operação', buckets: [5,10,20,50,100,200,500,1000], registers: [this.registry] });
    private readonly policyExec = new Counter({ name: 'agf_policy_execution_total', help: 'Execuções de políticas', labelNames: ['result'], registers: [this.registry] });
    private readonly memory = new Histogram({ name: 'agf_system_memory_heap_bytes', help: 'Uso de heap', buckets: [1e6,2e6,5e6,1e7,2e7,5e7,1e8], registers: [this.registry] });

    static getInstance(): TelemetryService {
        if (!this.instance) this.instance = new TelemetryService();
        return this.instance;
    }

    recordLatency(operation: string, timeMs: number) {
        this.latency.observe(timeMs);
    }

    incrementPolicyExecution(policyId: string, success: boolean) {
        this.policyExec.inc({ result: success ? 'success' : 'failure' });
        this.logger.info('policy_execution', { policyId, success, timestamp: new Date().toISOString() });
    }

    recordMemoryUsage() {
        const usage = process.memoryUsage();
        this.memory.observe(usage.heapUsed);
    }

    getRegistry() { return this.registry; }
}
