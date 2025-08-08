/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { Pool } from 'pg';

export class TenantManager {
    private static instance: TenantManager;
    private tenantPools: Map<string, Pool> = new Map();
    
    private constructor() {}
    
    static getInstance(): TenantManager {
        if (!TenantManager.instance) {
            TenantManager.instance = new TenantManager();
        }
        return TenantManager.instance;
    }
    
    async createTenant(tenantId: string, config: any): Promise<void> {
        // Criar schema isolado para o tenant
        const pool = new Pool({
            ...config,
            schema: `tenant_${tenantId}`
        });
        
        this.tenantPools.set(tenantId, pool);
    }
    
    async getTenantConnection(tenantId: string): Promise<Pool> {
        const pool = this.tenantPools.get(tenantId);
        if (!pool) {
            throw new Error(`Tenant ${tenantId} não encontrado`);
        }
        return pool;
    }
    
    async executeTenantQuery(tenantId: string, query: string, params?: any[]): Promise<any> {
        const pool = await this.getTenantConnection(tenantId);
        return pool.query(query, params);
    }
}
