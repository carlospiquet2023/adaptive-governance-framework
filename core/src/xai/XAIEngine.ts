/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { PolicyEvaluationResult, PolicyRule } from '../engines/PolicyEngine';
import { Logger } from '../infrastructure/Logger';

export interface ExplanationFeature {
  feature: string;
  contribution: number; // -1..1
  direction: 'positive' | 'negative';
}

export interface DecisionExplanation {
  score: number; // confiança original
  influentialFeatures: ExplanationFeature[];
  reasons: string[]; // motivos legíveis
  model?: string;
}

export class XAIEngine {
  private logger = Logger.getInstance();

  async explainDecision(result: PolicyEvaluationResult, features?: Record<string, any>): Promise<DecisionExplanation> {
    // Heurística simples baseada nas rules e reasons enquanto não pluga SHAP/LIME reais.
    const factors: ExplanationFeature[] = [];

    for (const rule of result.matchedRules) {
      const weight = (rule.priority || 0) / 100;
      for (const cond of rule.conditions) {
        const field = cond.field || cond.function || 'composite';
        const dir = result.allowed ? 'positive' : 'negative';
        factors.push({ feature: field, contribution: weight, direction: dir });
      }
    }

    // Normalize e agregue por feature
    const agg: Record<string, number> = {};
    for (const f of factors) {
      const s = f.direction === 'positive' ? f.contribution : -f.contribution;
      agg[f.feature] = (agg[f.feature] || 0) + s;
    }

    const influentialFeatures: ExplanationFeature[] = Object.entries(agg)
      .map(([feature, sum]) => ({ feature, contribution: Math.max(-1, Math.min(1, sum)), direction: (sum >= 0 ? 'positive' : 'negative') as 'positive' | 'negative' }))
      .sort((a,b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 10);

    const explanation: DecisionExplanation = {
      score: result.allowed ? 0.9 : 0.1,
      influentialFeatures,
      reasons: result.reasons,
      model: 'policy-heuristic'
    };

    this.logger.info('XAI explanation gerada', { top: influentialFeatures[0]?.feature });
    return explanation;
  }
}
