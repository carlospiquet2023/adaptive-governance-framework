import { PolicyEvaluationResult } from '../engines/PolicyEngine';
export interface ExplanationFeature {
    feature: string;
    contribution: number;
    direction: 'positive' | 'negative';
}
export interface DecisionExplanation {
    score: number;
    influentialFeatures: ExplanationFeature[];
    reasons: string[];
    model?: string;
}
export declare class XAIEngine {
    private logger;
    explainDecision(result: PolicyEvaluationResult, features?: Record<string, any>): Promise<DecisionExplanation>;
}
