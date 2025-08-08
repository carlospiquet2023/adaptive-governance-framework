"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricService = void 0;
const logger_1 = require("../../shared/logger");
const DatabaseService_1 = require("./DatabaseService");
class MetricService {
    db;
    constructor() {
        this.db = DatabaseService_1.DatabaseService.getInstance();
    }
    async getCurrentMetrics() {
        try {
            const query = `
                SELECT * FROM metrics 
                WHERE timestamp >= NOW() - INTERVAL '5 minutes'
                ORDER BY timestamp DESC
            `;
            const result = await this.db.query(query);
            return result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                value: row.value,
                unit: row.unit,
                timestamp: row.timestamp,
                tags: row.tags,
                source: row.source
            }));
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar métricas', { error });
            return [];
        }
    }
    async saveMetric(metric) {
        try {
            const query = `
                INSERT INTO metrics (name, value, unit, timestamp, tags, source)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await this.db.query(query, [
                metric.name,
                metric.value,
                metric.unit,
                metric.timestamp,
                metric.tags,
                metric.source
            ]);
            logger_1.logger.info('Métrica salva com sucesso', { metric });
        }
        catch (error) {
            logger_1.logger.error('Erro ao salvar métrica', { error, metric });
            throw error;
        }
    }
    async getMetricsByTimeRange(startTime, endTime, metricNames) {
        try {
            let query = `
                SELECT * FROM metrics 
                WHERE timestamp BETWEEN $1 AND $2
            `;
            const params = [startTime, endTime];
            if (metricNames && metricNames.length > 0) {
                query += ' AND name = ANY($3)';
                params.push(metricNames);
            }
            query += ' ORDER BY timestamp ASC';
            const result = await this.db.query(query, params);
            return result.rows.map((row) => ({
                id: row.id,
                name: row.name,
                value: row.value,
                unit: row.unit,
                timestamp: row.timestamp,
                tags: row.tags,
                source: row.source
            }));
        }
        catch (error) {
            logger_1.logger.error('Erro ao buscar métricas por intervalo', { error, startTime, endTime });
            return [];
        }
    }
    async deleteOldMetrics(retentionDays) {
        try {
            const query = `
                DELETE FROM metrics 
                WHERE timestamp < NOW() - INTERVAL '$1 days'
                RETURNING id
            `;
            const result = await this.db.query(query, [retentionDays]);
            const deletedCount = result.rowCount || 0;
            logger_1.logger.info('Métricas antigas deletadas', {
                deletedCount,
                retentionDays
            });
            return deletedCount;
        }
        catch (error) {
            logger_1.logger.error('Erro ao deletar métricas antigas', { error });
            throw error;
        }
    }
}
exports.MetricService = MetricService;
//# sourceMappingURL=MetricService.js.map