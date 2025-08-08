/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { LearningLoop } from './index';

describe('LearningLoop', () => {
  it('refina políticas de latência corretamente', () => {
    const feedback = [
      { type: 'latency', value: 300 },
      { type: 'latency', value: 250 },
    ];
    const loop = new LearningLoop(feedback);
    const policies = {
      performance: { slo: { latency_p95_ms: 280 } },
    };
    const result = loop.refinePolicies(policies);
    expect(result.performance.slo.latency_p95_ms).toBe(180);
  });
});
