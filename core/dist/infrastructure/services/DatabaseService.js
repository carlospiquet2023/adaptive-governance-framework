"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const pg_1 = require("pg");
class DatabaseService {
    static instance;
    pool;
    logger;
    constructor() {
        this.logger = Logger.getInstance();
        this.pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'governance',
            password: process.env.DB_PASSWORD || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432'),
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        this.pool.on('error', (err) => {
            this.logger.error('Erro inesperado no pool do PostgreSQL', { error: err });
        });
    }
    static getInstance() {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }
    async query(text, params) {
        const start = Date.now();
        try {
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            this.logger.debug('Consulta executada', {
                text,
                duration,
                rows: result.rowCount
            });
            return result;
        }
        catch (error) {
            this.logger.error('Erro ao executar consulta', {
                error,
                text,
                params
            });
            throw error;
        }
    }
    async getClient() {
        try {
            const client = await this.pool.connect();
            return client;
        }
        catch (error) {
            this.logger.error('Erro ao obter cliente do pool', { error });
            throw error;
        }
    }
    async transaction(callback) {
        const client = await this.getClient();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            throw error;
        }
        finally {
            client.release();
        }
    }
    async healthCheck() {
        try {
            await this.query('SELECT 1');
            return true;
        }
        catch (error) {
            this.logger.error('Falha no health check do banco', { error });
            return false;
        }
    }
    async close() {
        try {
            await this.pool.end();
            this.logger.info('Conexão com o banco encerrada');
        }
        catch (error) {
            this.logger.error('Erro ao encerrar conexão com o banco', { error });
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map