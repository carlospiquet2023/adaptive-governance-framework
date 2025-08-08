/**
 * 🔧 DATABASE SERVICE
 *
 * Serviço unificado de banco de dados com recursos avançados:
 * - Connection pooling
 * - Health monitoring
 * - Query optimization
 * - Transaction management
 */
export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: any[];
}
export interface Transaction {
    query: <T = any>(text: string, params?: any[]) => Promise<QueryResult<T>>;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
}
export declare class DatabaseService {
    private static instance;
    private pool;
    private logger;
    private config;
    private healthCheckInterval?;
    private constructor();
    static getInstance(): DatabaseService;
    private initializePool;
    private setupHealthCheck;
    query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
    transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
    findOne<T = any>(table: string, where: Record<string, any>): Promise<T | null>;
    findMany<T = any>(table: string, where?: Record<string, any>, options?: {
        limit?: number;
        offset?: number;
        orderBy?: string;
        orderDirection?: 'ASC' | 'DESC';
    }): Promise<T[]>;
    create<T = any>(table: string, data: Record<string, any>): Promise<T>;
    update<T = any>(table: string, where: Record<string, any>, data: Record<string, any>): Promise<T>;
    delete(table: string, where: Record<string, any>): Promise<number>;
    createTable(tableName: string, columns: Record<string, string>): Promise<void>;
    dropTable(tableName: string): Promise<void>;
    tableExists(tableName: string): Promise<boolean>;
    backup(tables?: string[]): Promise<string>;
    getConnectionStats(): Promise<{
        total: number;
        idle: number;
        waiting: number;
    }>;
    getTableStats(tableName: string): Promise<{
        rowCount: number;
        size: string;
    }>;
    healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        connectionStats: any;
    }>;
    close(): Promise<void>;
}
