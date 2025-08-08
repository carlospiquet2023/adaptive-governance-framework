/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import client from 'prom-client';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const decisionLatency = new client.Histogram({
  name: 'agf_decision_latency_ms',
  help: 'Latência da decisão em ms',
  buckets: [5, 10, 20, 50, 100, 200, 500, 1000],
  registers: [register],
});

export const decisionsTotal = new client.Counter({
  name: 'agf_decisions_total',
  help: 'Total de decisões tomadas',
  registers: [register],
});

export const errorsTotal = new client.Counter({
  name: 'agf_errors_total',
  help: 'Total de erros no framework',
  registers: [register],
});
