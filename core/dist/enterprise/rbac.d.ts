import { Role, Permission } from '../types';
export declare class RBAC {
    private static instance;
    private roles;
    private constructor();
    static getInstance(): RBAC;
    private initializeDefaultRoles;
    createRole(id: string, role: Role): void;
    hasPermission(roleId: string, permission: Permission): boolean;
    getRoles(): Role[];
    getRole(roleId: string): Role | undefined;
}
