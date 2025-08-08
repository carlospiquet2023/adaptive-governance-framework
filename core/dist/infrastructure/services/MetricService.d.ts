export interface MetricRecord {
    name: string;
    value: number;
    unit?: string;
    timestamp?: Date;
    tags?: Record<string, string>;
}
export declare class MetricService {
    getCurrentMetrics(): Promise<MetricRecord[]>;
}
