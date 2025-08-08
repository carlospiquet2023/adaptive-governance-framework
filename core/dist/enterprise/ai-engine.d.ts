import { PolicySuggestion, RiskAnalysis } from '../types';
export declare class AIEngine {
    private static instance;
    private openai;
    private constructor();
    static getInstance(): AIEngine;
    suggestPolicies(context: any): Promise<PolicySuggestion[]>;
    analyzeRisks(codebase: string): Promise<RiskAnalysis>;
    optimizePolicies(policies: any[]): Promise<any[]>;
    private buildPolicyPrompt;
    private buildRiskAnalysisPrompt;
    private parsePolicySuggestions;
    private parseRiskAnalysis;
}
