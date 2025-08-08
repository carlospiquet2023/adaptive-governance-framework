export interface MetricRecord {
  name: string;
  value: number;
  unit?: string;
  timestamp?: Date;
  tags?: Record<string, string>;
}

export class MetricService {
  async getCurrentMetrics(): Promise<MetricRecord[]> {
    // Retorna métricas simuladas enquanto não integra fonte real
    return [
      { name: 'cpu_usage', value: Math.random() * 100, unit: '%', timestamp: new Date() },
      { name: 'req_per_sec', value: 10 + Math.random() * 50, unit: 'rps', timestamp: new Date() },
    ];
  }
}
