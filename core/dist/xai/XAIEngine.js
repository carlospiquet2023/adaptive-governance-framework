"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XAIEngine = void 0;
const Logger_1 = require("../infrastructure/Logger");
class XAIEngine {
    logger = Logger_1.Logger.getInstance();
    async explainDecision(result, features) {
        // Heurística simples baseada nas rules e reasons enquanto não pluga SHAP/LIME reais.
        const factors = [];
        for (const rule of result.matchedRules) {
            const weight = (rule.priority || 0) / 100;
            for (const cond of rule.conditions) {
                const field = cond.field || cond.function || 'composite';
                const dir = result.allowed ? 'positive' : 'negative';
                factors.push({ feature: field, contribution: weight, direction: dir });
            }
        }
        // Normalize e agregue por feature
        const agg = {};
        for (const f of factors) {
            const s = f.direction === 'positive' ? f.contribution : -f.contribution;
            agg[f.feature] = (agg[f.feature] || 0) + s;
        }
        const influentialFeatures = Object.entries(agg)
            .map(([feature, sum]) => ({ feature, contribution: Math.max(-1, Math.min(1, sum)), direction: (sum >= 0 ? 'positive' : 'negative') }))
            .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
            .slice(0, 10);
        const explanation = {
            score: result.allowed ? 0.9 : 0.1,
            influentialFeatures,
            reasons: result.reasons,
            model: 'policy-heuristic'
        };
        this.logger.info('XAI explanation gerada', { top: influentialFeatures[0]?.feature });
        return explanation;
    }
}
exports.XAIEngine = XAIEngine;
//# sourceMappingURL=XAIEngine.js.map