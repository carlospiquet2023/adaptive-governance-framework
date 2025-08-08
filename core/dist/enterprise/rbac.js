"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RBAC = void 0;
class RBAC {
    static instance;
    roles = new Map();
    constructor() {
        this.initializeDefaultRoles();
    }
    static getInstance() {
        if (!RBAC.instance) {
            RBAC.instance = new RBAC();
        }
        return RBAC.instance;
    }
    initializeDefaultRoles() {
        // Super Admin
        this.createRole('super_admin', {
            name: 'Super Admin',
            permissions: ['*'],
            description: 'Acesso total ao sistema'
        });
        // Admin Tenant
        this.createRole('tenant_admin', {
            name: 'Administrador do Tenant',
            permissions: [
                'manage_users',
                'manage_policies',
                'view_analytics',
                'manage_integrations'
            ],
            description: 'Administração do tenant'
        });
        // Auditor
        this.createRole('auditor', {
            name: 'Auditor',
            permissions: [
                'view_logs',
                'view_policies',
                'view_analytics',
                'export_reports'
            ],
            description: 'Auditoria e compliance'
        });
        // Policy Manager
        this.createRole('policy_manager', {
            name: 'Gerente de Políticas',
            permissions: [
                'manage_policies',
                'view_analytics',
                'view_logs'
            ],
            description: 'Gestão de políticas'
        });
    }
    createRole(id, role) {
        this.roles.set(id, role);
    }
    hasPermission(roleId, permission) {
        const role = this.roles.get(roleId);
        if (!role)
            return false;
        return role.permissions.includes('*') ||
            role.permissions.includes(permission);
    }
    getRoles() {
        return Array.from(this.roles.values());
    }
    getRole(roleId) {
        return this.roles.get(roleId);
    }
}
exports.RBAC = RBAC;
//# sourceMappingURL=rbac.js.map