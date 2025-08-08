"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRegistry = void 0;
const Logger_1 = require("../infrastructure/Logger");
class ModelRegistry {
    static instance;
    models = new Map();
    logger = Logger_1.Logger.getInstance();
    constructor() { }
    static getInstance() {
        if (!this.instance)
            this.instance = new ModelRegistry();
        return this.instance;
    }
    list() { return Array.from(this.models.values()); }
    get(id) { return this.models.get(id); }
    register(model) {
        const id = `model_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const info = { id, active: false, ...model };
        this.models.set(id, info);
        this.logger.info('Modelo registrado', { id, name: info.name, version: info.version });
        return info;
    }
    activate(id) {
        const m = this.models.get(id);
        if (!m)
            throw new Error('Modelo não encontrado');
        for (const mm of this.models.values())
            if (mm.name === m.name)
                mm.active = false;
        m.active = true;
        this.logger.info('Modelo ativado', { id });
    }
    deactivate(id) {
        const m = this.models.get(id);
        if (!m)
            throw new Error('Modelo não encontrado');
        m.active = false;
        this.logger.info('Modelo desativado', { id });
    }
}
exports.ModelRegistry = ModelRegistry;
//# sourceMappingURL=ModelRegistry.js.map