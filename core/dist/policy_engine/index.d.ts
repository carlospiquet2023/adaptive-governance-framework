export declare class PolicyEngine {
    private policies;
    constructor(policies: any);
    enforce(policyName: string, data: any): boolean;
}
