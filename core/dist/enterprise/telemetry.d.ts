import { Registry } from 'prom-client';
export declare class TelemetryService {
    private static instance;
    private readonly registry;
    private readonly logger;
    private readonly latency;
    private readonly policyExec;
    private readonly memory;
    static getInstance(): TelemetryService;
    recordLatency(operation: string, timeMs: number): void;
    incrementPolicyExecution(policyId: string, success: boolean): void;
    recordMemoryUsage(): void;
    getRegistry(): Registry<"text/plain; version=0.0.4; charset=utf-8">;
}
