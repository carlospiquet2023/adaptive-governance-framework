/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

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
