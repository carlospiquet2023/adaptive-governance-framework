export type Sensitivity = 'public' | 'internal' | 'confidential' | 'restricted';
export interface FieldPolicy {
    path: string;
    sensitivity: Sensitivity;
    mask?: 'full' | 'partial' | 'hash';
    allowRevealRoles?: string[];
}
export declare class PrivacyService {
    private policies;
    constructor(policies?: FieldPolicy[]);
    addPolicy(p: FieldPolicy): void;
    maskObject(obj: any, roles?: string[]): any;
    private hash;
    private partial;
}
