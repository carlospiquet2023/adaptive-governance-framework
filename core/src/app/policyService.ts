import { Policy } from '../core/policy';

export class PolicyService {
  private policies: Policy[] = [];

  list(): Policy[] {
    return this.policies;
  }

  create(data: Omit<Policy, 'id'>): Policy {
    const policy: Policy = { ...data, id: crypto.randomUUID() };
    this.policies.push(policy);
    return policy;
  }
}
