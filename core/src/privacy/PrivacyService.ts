export type Sensitivity = 'public' | 'internal' | 'confidential' | 'restricted';

export interface FieldPolicy {
  path: string; // ex: user.email
  sensitivity: Sensitivity;
  mask?: 'full' | 'partial' | 'hash';
  allowRevealRoles?: string[];
}

export class PrivacyService {
  constructor(private policies: FieldPolicy[] = []) {}

  addPolicy(p: FieldPolicy) { this.policies.push(p); }

  maskObject(obj: any, roles: string[] = []): any {
    const clone = JSON.parse(JSON.stringify(obj));
    for (const p of this.policies) {
      const parts = p.path.split('.');
      let ref: any = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        ref = ref?.[parts[i]];
        if (!ref) break;
      }
      const key = parts[parts.length - 1];
      if (!ref || !(key in ref)) continue;

      const canReveal = p.allowRevealRoles?.some((r) => roles.includes(r));
      if (canReveal) continue;

      const val = ref[key];
      if (p.mask === 'hash') {
        ref[key] = this.hash(String(val));
      } else if (p.mask === 'partial') {
        ref[key] = this.partial(String(val));
      } else {
        ref[key] = '***';
      }
    }
    return clone;
  }

  private hash(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return `h_${Math.abs(h)}`;
  }

  private partial(s: string) {
    if (s.length <= 4) return '***';
    return s.slice(0, 2) + '***' + s.slice(-2);
  }
}
