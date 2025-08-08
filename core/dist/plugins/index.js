"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = exports.PluginRegistry = void 0;
class PluginRegistry {
    static instance;
    plugins = new Map();
    constructor() { }
    static getInstance() {
        if (!this.instance)
            this.instance = new PluginRegistry();
        return this.instance;
    }
    list(type) {
        const all = Array.from(this.plugins.values()).map((p) => p.meta);
        return type ? all.filter((m) => m.type === type) : all;
    }
    get(name) {
        return this.plugins.get(name);
    }
    async register(module) {
        if (this.plugins.has(module.meta.name))
            return;
        if (module.init)
            await module.init();
        this.plugins.set(module.meta.name, module);
    }
    async unregister(name) {
        const mod = this.plugins.get(name);
        if (!mod)
            return;
        if (mod.dispose)
            await mod.dispose();
        this.plugins.delete(name);
    }
}
exports.PluginRegistry = PluginRegistry;
class PluginLoader {
    baseDir;
    constructor(baseDir) {
        this.baseDir = baseDir;
    }
    async loadAll() {
        // Suporta require dinâmico a partir de caminho.
        // Em produção, considere sandboxing.
        const glob = await Promise.resolve().then(() => __importStar(require('node:fs')));
        const path = await Promise.resolve().then(() => __importStar(require('node:path')));
        const entries = glob.readdirSync(this.baseDir, { withFileTypes: true });
        let count = 0;
        for (const e of entries) {
            if (!e.isDirectory())
                continue;
            const pluginPath = path.join(this.baseDir, e.name, 'index.js');
            const tsPath = path.join(this.baseDir, e.name, 'index.ts');
            let mod;
            if (glob.existsSync(pluginPath)) {
                mod = await Promise.resolve(`${pathToFileURL(pluginPath).toString()}`).then(s => __importStar(require(s)));
            }
            else if (glob.existsSync(tsPath)) {
                mod = await Promise.resolve(`${pathToFileURL(tsPath).toString()}`).then(s => __importStar(require(s)));
            }
            else {
                continue;
            }
            const plugin = mod.default || mod.plugin || mod;
            if (plugin && plugin.meta) {
                await PluginRegistry.getInstance().register(plugin);
                count++;
            }
        }
        return count;
    }
}
exports.PluginLoader = PluginLoader;
function pathToFileURL(p) {
    const { pathToFileURL } = require('node:url');
    return pathToFileURL(p);
}
//# sourceMappingURL=index.js.map