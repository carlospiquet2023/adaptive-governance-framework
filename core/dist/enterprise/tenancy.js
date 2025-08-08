"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantManager = void 0;
const pg_1 = require("pg");
class TenantManager {
    static instance;
    tenantPools = new Map();
    constructor() { }
    static getInstance() {
        if (!TenantManager.instance) {
            TenantManager.instance = new TenantManager();
        }
        return TenantManager.instance;
    }
    async createTenant(tenantId, config) {
        // Criar schema isolado para o tenant
        const pool = new pg_1.Pool({
            ...config,
            schema: `tenant_${tenantId}`
        });
        this.tenantPools.set(tenantId, pool);
    }
    async getTenantConnection(tenantId) {
        const pool = this.tenantPools.get(tenantId);
        if (!pool) {
            throw new Error(`Tenant ${tenantId} não encontrado`);
        }
        return pool;
    }
    async executeTenantQuery(tenantId, query, params) {
        const pool = await this.getTenantConnection(tenantId);
        return pool.query(query, params);
    }
}
exports.TenantManager = TenantManager;
//# sourceMappingURL=tenancy.js.map