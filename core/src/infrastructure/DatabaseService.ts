/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

/**
 * 🔧 DATABASE SERVICE
 * 
 * Serviço unificado de banco de dados com recursos avançados:
 * - Connection pooling
 * - Health monitoring
 * - Query optimization
 * - Transaction management
 */

import { Pool, Client, PoolConfig } from 'pg';
import { Logger } from './Logger';
import { ConfigManager } from './ConfigManager';

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

export class DatabaseService {
    private static instance: DatabaseService;
    private pool!: Pool;
    private logger = Logger.getInstance();
    private config = ConfigManager.getInstance();
    private healthCheckInterval?: NodeJS.Timeout;
    
    private constructor() {
        this.initializePool();
        this.setupHealthCheck();
    }
    
    public static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    
    private initializePool(): void {
        const dbConfig = this.config.getDatabaseConfig();
        
        const poolConfig: PoolConfig = {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.username,
            password: dbConfig.password,
            ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
            min: dbConfig.pool.min,
            max: dbConfig.pool.max,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
            query_timeout: 10000,
            statement_timeout: 30000
        };
        
        this.pool = new Pool(poolConfig);
        
        // Event listeners
        this.pool.on('connect', (client) => {
            this.logger.debug('Nova conexão estabelecida com o banco', {
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount,
                waitingCount: this.pool.waitingCount
            });
        });
        
        this.pool.on('error', (error, client) => {
            this.logger.error('Erro no pool de conexões', { error: error.message });
        });
        
        this.pool.on('remove', (client) => {
            this.logger.debug('Cliente removido do pool', {
                totalCount: this.pool.totalCount,
                idleCount: this.pool.idleCount
            });
        });
    }
    
    private setupHealthCheck(): void {
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.healthCheck();
            } catch (error) {
                this.logger.error('Health check do banco falhou', { error });
            }
        }, 60000); // Check every minute
    }
    
    public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const start = Date.now();
        const client = await this.pool.connect();
        
        try {
            this.logger.debug('Executando query', { 
                query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
                params: params?.length || 0
            });
            
            const result = await client.query(text, params);
            const duration = Date.now() - start;
            
            this.logger.performance('database_query', duration, {
                rowCount: result.rowCount,
                command: result.command
            });
            
            return result as QueryResult<T>;
            
        } finally {
            client.release();
        }
    }
    
    public async transaction<T>(
        callback: (trx: Transaction) => Promise<T>
    ): Promise<T> {
        const client = await this.pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const transaction: Transaction = {
                query: async <U = any>(text: string, params?: any[]): Promise<QueryResult<U>> => {
                    const result = await client.query(text, params);
                    return result as QueryResult<U>;
                },
                commit: async (): Promise<void> => {
                    await client.query('COMMIT');
                },
                rollback: async (): Promise<void> => {
                    await client.query('ROLLBACK');
                }
            };
            
            const result = await callback(transaction);
            await transaction.commit();
            
            this.logger.debug('Transação completada com sucesso');
            return result;
            
        } catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transação falhou, fazendo rollback', { error });
            throw error;
        } finally {
            client.release();
        }
    }
    
    // Métodos de conveniência para operações CRUD
    public async findOne<T = any>(
        table: string,
        where: Record<string, any>
    ): Promise<T | null> {
        const whereClause = Object.keys(where)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        
        const values = Object.values(where);
        const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
        
        const result = await this.query<T>(query, values);
        return result.rows[0] || null;
    }
    
    public async findMany<T = any>(
        table: string,
        where: Record<string, any> = {},
        options: {
            limit?: number;
            offset?: number;
            orderBy?: string;
            orderDirection?: 'ASC' | 'DESC';
        } = {}
    ): Promise<T[]> {
        let query = `SELECT * FROM ${table}`;
        const values: any[] = [];
        
        if (Object.keys(where).length > 0) {
            const whereClause = Object.keys(where)
                .map((key, index) => `${key} = $${index + 1}`)
                .join(' AND ');
            query += ` WHERE ${whereClause}`;
            values.push(...Object.values(where));
        }
        
        if (options.orderBy) {
            query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
        }
        
        if (options.limit) {
            query += ` LIMIT $${values.length + 1}`;
            values.push(options.limit);
        }
        
        if (options.offset) {
            query += ` OFFSET $${values.length + 1}`;
            values.push(options.offset);
        }
        
        const result = await this.query<T>(query, values);
        return result.rows;
    }
    
    public async create<T = any>(
        table: string,
        data: Record<string, any>
    ): Promise<T> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
            INSERT INTO ${table} (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        
        const result = await this.query<T>(query, values);
        return result.rows[0];
    }
    
    public async update<T = any>(
        table: string,
        where: Record<string, any>,
        data: Record<string, any>
    ): Promise<T> {
        const dataKeys = Object.keys(data);
        const whereKeys = Object.keys(where);
        
        const setClause = dataKeys
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        
        const whereClause = whereKeys
            .map((key, index) => `${key} = $${dataKeys.length + index + 1}`)
            .join(' AND ');
        
        const values = [...Object.values(data), ...Object.values(where)];
        
        const query = `
            UPDATE ${table} 
            SET ${setClause} 
            WHERE ${whereClause} 
            RETURNING *
        `;
        
        const result = await this.query<T>(query, values);
        return result.rows[0];
    }
    
    public async delete(
        table: string,
        where: Record<string, any>
    ): Promise<number> {
        const whereClause = Object.keys(where)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        
        const values = Object.values(where);
        const query = `DELETE FROM ${table} WHERE ${whereClause}`;
        
        const result = await this.query(query, values);
        return result.rowCount;
    }
    
    // Schema management
    public async createTable(tableName: string, columns: Record<string, string>): Promise<void> {
        const columnDefinitions = Object.entries(columns)
            .map(([name, type]) => `${name} ${type}`)
            .join(', ');
        
        const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
        await this.query(query);
        
        this.logger.info('Tabela criada', { table: tableName });
    }
    
    public async dropTable(tableName: string): Promise<void> {
        const query = `DROP TABLE IF EXISTS ${tableName}`;
        await this.query(query);
        
        this.logger.info('Tabela removida', { table: tableName });
    }
    
    public async tableExists(tableName: string): Promise<boolean> {
        const query = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            )
        `;
        
        const result = await this.query<{ exists: boolean }>(query, [tableName]);
        return result.rows[0].exists;
    }
    
    // Backup and restore
    public async backup(tables?: string[]): Promise<string> {
        // This would typically use pg_dump
        // For now, return a simple JSON export
        const backupData: Record<string, any[]> = {};
        
        if (tables) {
            for (const table of tables) {
                const result = await this.query(`SELECT * FROM ${table}`);
                backupData[table] = result.rows;
            }
        }
        
        const backupJson = JSON.stringify(backupData, null, 2);
        this.logger.info('Backup criado', { tables: tables?.length || 'all' });
        
        return backupJson;
    }
    
    // Statistics and monitoring
    public async getConnectionStats(): Promise<{
        total: number;
        idle: number;
        waiting: number;
    }> {
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount
        };
    }
    
    public async getTableStats(tableName: string): Promise<{
        rowCount: number;
        size: string;
    }> {
        const [countResult, sizeResult] = await Promise.all([
            this.query<{ count: string }>(`SELECT COUNT(*) as count FROM ${tableName}`),
            this.query<{ size: string }>(`
                SELECT pg_size_pretty(pg_total_relation_size($1)) as size
            `, [tableName])
        ]);
        
        return {
            rowCount: parseInt(countResult.rows[0].count, 10),
            size: sizeResult.rows[0].size
        };
    }
    
    public async healthCheck(): Promise<{
        healthy: boolean;
        latency: number;
        connectionStats: any;
    }> {
        const start = Date.now();
        
        try {
            await this.query('SELECT 1');
            const latency = Date.now() - start;
            const connectionStats = await this.getConnectionStats();
            
            return {
                healthy: true,
                latency,
                connectionStats
            };
        } catch (error) {
            this.logger.error('Health check do banco falhou', { error });
            return {
                healthy: false,
                latency: Date.now() - start,
                connectionStats: await this.getConnectionStats()
            };
        }
    }
    
    public async close(): Promise<void> {
        if (this.healthCheckInterval) {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = undefined;
        }
        }
        
        await this.pool.end();
        this.logger.info('Pool de conexões fechado');
    }
}
