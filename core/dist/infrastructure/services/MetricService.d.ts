import { MetricData } from '../../domain/types';
export declare class MetricService {
    private db;
    constructor();
    getCurrentMetrics(): Promise<MetricData[]>;
    saveMetric(metric: MetricData): Promise<void>;
    getMetricsByTimeRange(startTime: Date, endTime: Date, metricNames?: string[]): Promise<MetricData[]>;
    deleteOldMetrics(retentionDays: number): Promise<number>;
}
