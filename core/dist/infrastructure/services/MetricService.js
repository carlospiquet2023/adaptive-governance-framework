"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricService = void 0;
class MetricService {
    async getCurrentMetrics() {
        // Retorna métricas simuladas enquanto não integra fonte real
        return [
            { name: 'cpu_usage', value: Math.random() * 100, unit: '%', timestamp: new Date() },
            { name: 'req_per_sec', value: 10 + Math.random() * 50, unit: 'rps', timestamp: new Date() },
        ];
    }
}
exports.MetricService = MetricService;
//# sourceMappingURL=MetricService.js.map