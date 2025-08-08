"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyService = void 0;
class PrivacyService {
    policies;
    constructor(policies = []) {
        this.policies = policies;
    }
    addPolicy(p) { this.policies.push(p); }
    maskObject(obj, roles = []) {
        const clone = JSON.parse(JSON.stringify(obj));
        for (const p of this.policies) {
            const parts = p.path.split('.');
            let ref = clone;
            for (let i = 0; i < parts.length - 1; i++) {
                ref = ref?.[parts[i]];
                if (!ref)
                    break;
            }
            const key = parts[parts.length - 1];
            if (!ref || !(key in ref))
                continue;
            const canReveal = p.allowRevealRoles?.some((r) => roles.includes(r));
            if (canReveal)
                continue;
            const val = ref[key];
            if (p.mask === 'hash') {
                ref[key] = this.hash(String(val));
            }
            else if (p.mask === 'partial') {
                ref[key] = this.partial(String(val));
            }
            else {
                ref[key] = '***';
            }
        }
        return clone;
    }
    hash(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++)
            h = (h << 5) - h + s.charCodeAt(i);
        return `h_${Math.abs(h)}`;
    }
    partial(s) {
        if (s.length <= 4)
            return '***';
        return s.slice(0, 2) + '***' + s.slice(-2);
    }
}
exports.PrivacyService = PrivacyService;
//# sourceMappingURL=PrivacyService.js.map