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
