import { EventEmitter } from 'events';
export declare class ContextEngine extends EventEmitter {
    private static instance;
    private logger;
    private metricService;
    private policyService;
    private context;
    private analysisInterval;
    private constructor();
    static getInstance(): ContextEngine;
    start(intervalMs?: number): Promise<void>;
    stop(): void;
    private analyzeContext;
    private updateContext;
    private evaluatePolicy;
    private determineAction;
    getContextSnapshot(): Record<string, any>;
}
