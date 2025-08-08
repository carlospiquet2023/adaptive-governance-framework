import { Pool } from 'pg';
export declare class TenantManager {
    private static instance;
    private tenantPools;
    private constructor();
    static getInstance(): TenantManager;
    createTenant(tenantId: string, config: any): Promise<void>;
    getTenantConnection(tenantId: string): Promise<Pool>;
    executeTenantQuery(tenantId: string, query: string, params?: any[]): Promise<any>;
}
