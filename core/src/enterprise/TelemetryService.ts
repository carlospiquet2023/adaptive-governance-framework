/**
 * 📊 TELEMETRY SERVICE
 * 
 * Sistema de telemetria integrado para monitoramento
 * de performance e métricas empresariais.
 */

import { Logger } from '../infrastructure/Logger';

// Simple metrics interfaces
interface Counter {
    increment(value?: number): void;
    get(): number;
}

interface Timer {
    start(): () => number;
    record(milliseconds: number): void;
    get(): { count: number; avg: number; min: number; max: number };
}

interface Histogram {
    update(value: number): void;
    get(): { count: number; min: number; max: number; mean: number; p95: number };
}

// Simple metrics implementations
class SimpleCounter implements Counter {
    private value = 0;

    increment(value = 1): void {
        this.value += value;
    }

    get(): number {
        return this.value;
    }
}

class SimpleTimer implements Timer {
    private measurements: number[] = [];

    start(): () => number {
        const start = Date.now();
        return () => {
            const duration = Date.now() - start;
            this.record(duration);
            return duration;
        };
    }

    record(milliseconds: number): void {
        this.measurements.push(milliseconds);
    }

    get(): { count: number; avg: number; min: number; max: number } {
        if (this.measurements.length === 0) {
            return { count: 0, avg: 0, min: 0, max: 0 };
        }

        const count = this.measurements.length;
        const sum = this.measurements.reduce((a, b) => a + b, 0);
        const avg = sum / count;
        const min = Math.min(...this.measurements);
        const max = Math.max(...this.measurements);

        return { count, avg, min, max };
    }
}

class SimpleHistogram implements Histogram {
    private values: number[] = [];

    update(value: number): void {
        this.values.push(value);
    }

    get(): { count: number; min: number; max: number; mean: number; p95: number } {
        if (this.values.length === 0) {
            return { count: 0, min: 0, max: 0, mean: 0, p95: 0 };
        }

        const sorted = [...this.values].sort((a, b) => a - b);
        const count = sorted.length;
        const min = sorted[0];
        const max = sorted[count - 1];
        const mean = sorted.reduce((a, b) => a + b, 0) / count;
        const p95Index = Math.floor(count * 0.95);
        const p95 = sorted[p95Index];

        return { count, min, max, mean, p95 };
    }
}

class MetricRegistry {
    private counters = new Map<string, Counter>();
    private timers = new Map<string, Timer>();
    private histograms = new Map<string, Histogram>();

    counter(name: string): Counter {
        let counter = this.counters.get(name);
        if (!counter) {
            counter = new SimpleCounter();
            this.counters.set(name, counter);
        }
        return counter;
    }

    timer(name: string): Timer {
        let timer = this.timers.get(name);
        if (!timer) {
            timer = new SimpleTimer();
            this.timers.set(name, timer);
        }
        return timer;
    }

    histogram(name: string): Histogram {
        let histogram = this.histograms.get(name);
        if (!histogram) {
            histogram = new SimpleHistogram();
            this.histograms.set(name, histogram);
        }
        return histogram;
    }

    getMetrics(): Record<string, any> {
        const metrics: Record<string, any> = {
            counters: {},
            timers: {},
            histograms: {}
        };

        for (const [name, counter] of this.counters) {
            metrics.counters[name] = counter.get();
        }

        for (const [name, timer] of this.timers) {
            metrics.timers[name] = timer.get();
        }

        for (const [name, histogram] of this.histograms) {
            metrics.histograms[name] = histogram.get();
        }

        return metrics;
    }

    reset(): void {
        this.counters.clear();
        this.timers.clear();
        this.histograms.clear();
    }
}

export class TelemetryService {
    private static instance: TelemetryService;
    private logger = Logger.getInstance();
    private metrics = new MetricRegistry();
    private startTime = Date.now();

    private constructor() {}

    public static getInstance(): TelemetryService {
        if (!TelemetryService.instance) {
            TelemetryService.instance = new TelemetryService();
        }
        return TelemetryService.instance;
    }

    // Request metrics
    recordRequest(endpoint: string, method: string, duration: number, statusCode: number): void {
        this.metrics.counter('http.requests.total').increment();
        this.metrics.counter(`http.requests.${method.toLowerCase()}`).increment();
        this.metrics.counter(`http.responses.${Math.floor(statusCode / 100)}xx`).increment();
        this.metrics.timer('http.request.duration').record(duration);
        this.metrics.histogram('http.request.size').update(duration);

        this.logger.debug('Request recorded', {
            endpoint,
            method,
            duration,
            statusCode,
            metric: 'http_request'
        });
    }

    // Database metrics
    recordDatabaseQuery(operation: string, duration: number, success: boolean): void {
        this.metrics.counter('db.queries.total').increment();
        this.metrics.counter(`db.queries.${operation}`).increment();
        this.metrics.timer('db.query.duration').record(duration);
        
        if (success) {
            this.metrics.counter('db.queries.success').increment();
        } else {
            this.metrics.counter('db.queries.error').increment();
        }

        this.logger.debug('Database query recorded', {
            operation,
            duration,
            success,
            metric: 'db_query'
        });
    }

    // Cache metrics
    recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'delete', key?: string): void {
        this.metrics.counter('cache.operations.total').increment();
        this.metrics.counter(`cache.operations.${operation}`).increment();

        this.logger.debug('Cache operation recorded', {
            operation,
            key: key ? key.substring(0, 50) : undefined,
            metric: 'cache_operation'
        });
    }

    // Business metrics
    recordBusinessEvent(event: string, properties?: Record<string, any>): void {
        this.metrics.counter('business.events.total').increment();
        this.metrics.counter(`business.events.${event}`).increment();

        this.logger.info('Business event recorded', {
            event,
            properties,
            metric: 'business_event'
        });
    }

    // Performance metrics
    recordPerformance(component: string, operation: string, duration: number): void {
        this.metrics.timer(`performance.${component}.${operation}`).record(duration);
        this.metrics.histogram(`performance.${component}.duration`).update(duration);

        this.logger.debug('Performance metric recorded', {
            component,
            operation,
            duration,
            metric: 'performance'
        });
    }

    // Error metrics
    recordError(error: Error, context?: Record<string, any>): void {
        this.metrics.counter('errors.total').increment();
        this.metrics.counter(`errors.${error.constructor.name}`).increment();

        this.logger.error('Error recorded', {
            error: error.message,
            stack: error.stack,
            context,
            metric: 'error'
        });
    }

    // User activity metrics
    recordUserActivity(userId: string, action: string, resource?: string): void {
        this.metrics.counter('user.activities.total').increment();
        this.metrics.counter(`user.activities.${action}`).increment();

        this.logger.info('User activity recorded', {
            userId,
            action,
            resource,
            metric: 'user_activity'
        });
    }

    // System metrics
    recordSystemMetrics(): void {
        const uptime = Date.now() - this.startTime;
        const memUsage = process.memoryUsage();

        this.metrics.histogram('system.uptime').update(uptime);
        this.metrics.histogram('system.memory.heap_used').update(memUsage.heapUsed);
        this.metrics.histogram('system.memory.heap_total').update(memUsage.heapTotal);
        this.metrics.histogram('system.memory.rss').update(memUsage.rss);

        this.logger.debug('System metrics recorded', {
            uptime,
            memUsage,
            metric: 'system'
        });
    }

    // Get all metrics
    getMetrics(): Record<string, any> {
        const baseMetrics = this.metrics.getMetrics();
        
        return {
            ...baseMetrics,
            system: {
                uptime: Date.now() - this.startTime,
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform
            },
            timestamp: new Date().toISOString()
        };
    }

    // Export metrics in Prometheus format
    getPrometheusMetrics(): string {
        const metrics = this.getMetrics();
        const lines: string[] = [];

        // Counters
        Object.entries(metrics.counters).forEach(([name, value]) => {
            lines.push(`# TYPE ${name.replace(/\./g, '_')} counter`);
            lines.push(`${name.replace(/\./g, '_')} ${value}`);
        });

        // Timers
        Object.entries(metrics.timers).forEach(([name, stats]: [string, any]) => {
            const baseName = name.replace(/\./g, '_');
            lines.push(`# TYPE ${baseName}_count counter`);
            lines.push(`${baseName}_count ${stats.count}`);
            lines.push(`# TYPE ${baseName}_avg gauge`);
            lines.push(`${baseName}_avg ${stats.avg}`);
        });

        // System metrics
        lines.push(`# TYPE system_uptime_seconds gauge`);
        lines.push(`system_uptime_seconds ${(Date.now() - this.startTime) / 1000}`);

        return lines.join('\n');
    }

    // Reset all metrics
    reset(): void {
        this.metrics.reset();
        this.startTime = Date.now();
        this.logger.info('Telemetry metrics reset');
    }

    // Start automatic system metrics collection
    startSystemMetricsCollection(intervalMs = 30000): void {
        setInterval(() => {
            this.recordSystemMetrics();
        }, intervalMs);

        this.logger.info('System metrics collection started', { intervalMs });
    }
}
