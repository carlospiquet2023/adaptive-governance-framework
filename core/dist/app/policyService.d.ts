import { Policy } from '../core/policy';
export declare class PolicyService {
    private policies;
    list(): Policy[];
    create(data: Omit<Policy, 'id'>): Policy;
}
