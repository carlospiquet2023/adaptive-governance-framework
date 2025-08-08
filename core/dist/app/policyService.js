"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
class PolicyService {
    policies = [];
    list() {
        return this.policies;
    }
    create(data) {
        const policy = { ...data, id: crypto.randomUUID() };
        this.policies.push(policy);
        return policy;
    }
}
exports.PolicyService = PolicyService;
//# sourceMappingURL=policyService.js.map