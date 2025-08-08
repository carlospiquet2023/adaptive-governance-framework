"use strict";
/**
 * 🔧 DATABASE SERVICE
 *
 * Serviço unificado de banco de dados com recursos avançados:
 * - Connection pooling
 * - Health monitoring
 * - Query optimization
 * - Transaction management
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
const Logger_1 = require("./Logger");
const ConfigManager_1 = require("./ConfigManager");
class DatabaseService {
    static instance;
    pool;
    logger = Logger_1.Logger.getInstance();
    config = ConfigManager_1.ConfigManager.getInstance();
    healthCheckInterval;
    constructor() {
        this.initializePool();
        this.setupHealthCheck();
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    initializePool() {
        const dbConfig = this.config.getDatabaseConfig();
        const poolConfig = {
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
        this.pool = new pg_1.Pool(poolConfig);
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
    setupHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.healthCheck();
            }
            catch (error) {
                this.logger.error('Health check do banco falhou', { error });
            }
        }, 60000); // Check every minute
    }
    async query(text, params) {
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
            return result;
        }
        finally {
            client.release();
        }
    }
    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const transaction = {
                query: async (text, params) => {
                    const result = await client.query(text, params);
                    return result;
                },
                commit: async () => {
                    await client.query('COMMIT');
                },
                rollback: async () => {
                    await client.query('ROLLBACK');
                }
            };
            const result = await callback(transaction);
            await transaction.commit();
            this.logger.debug('Transação completada com sucesso');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transação falhou, fazendo rollback', { error });
            throw error;
        }
        finally {
            client.release();
        }
    }
    // Métodos de conveniência para operações CRUD
    async findOne(table, where) {
        const whereClause = Object.keys(where)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(where);
        const query = `SELECT * FROM ${table} WHERE ${whereClause} LIMIT 1`;
        const result = await this.query(query, values);
        return result.rows[0] || null;
    }
    async findMany(table, where = {}, options = {}) {
        let query = `SELECT * FROM ${table}`;
        const values = [];
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
        const result = await this.query(query, values);
        return result.rows;
    }
    async create(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
        const query = `
            INSERT INTO ${table} (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *
        `;
        const result = await this.query(query, values);
        return result.rows[0];
    }
    async update(table, where, data) {
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
        const result = await this.query(query, values);
        return result.rows[0];
    }
    async delete(table, where) {
        const whereClause = Object.keys(where)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(' AND ');
        const values = Object.values(where);
        const query = `DELETE FROM ${table} WHERE ${whereClause}`;
        const result = await this.query(query, values);
        return result.rowCount;
    }
    // Schema management
    async createTable(tableName, columns) {
        const columnDefinitions = Object.entries(columns)
            .map(([name, type]) => `${name} ${type}`)
            .join(', ');
        const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
        await this.query(query);
        this.logger.info('Tabela criada', { table: tableName });
    }
    async dropTable(tableName) {
        const query = `DROP TABLE IF EXISTS ${tableName}`;
        await this.query(query);
        this.logger.info('Tabela removida', { table: tableName });
    }
    async tableExists(tableName) {
        const query = `
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = $1
            )
        `;
        const result = await this.query(query, [tableName]);
        return result.rows[0].exists;
    }
    // Backup and restore
    async backup(tables) {
        // This would typically use pg_dump
        // For now, return a simple JSON export
        const backupData = {};
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
    async getConnectionStats() {
        return {
            total: this.pool.totalCount,
            idle: this.pool.idleCount,
            waiting: this.pool.waitingCount
        };
    }
    async getTableStats(tableName) {
        const [countResult, sizeResult] = await Promise.all([
            this.query(`SELECT COUNT(*) as count FROM ${tableName}`),
            this.query(`
                SELECT pg_size_pretty(pg_total_relation_size($1)) as size
            `, [tableName])
        ]);
        return {
            rowCount: parseInt(countResult.rows[0].count, 10),
            size: sizeResult.rows[0].size
        };
    }
    async healthCheck() {
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
        }
        catch (error) {
            this.logger.error('Health check do banco falhou', { error });
            return {
                healthy: false,
                latency: Date.now() - start,
                connectionStats: await this.getConnectionStats()
            };
        }
    }
    async close() {
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
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map