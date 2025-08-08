export type PluginType = 'rule' | 'connector' | 'ml-model' | 'transform' | 'custom';
export interface PluginMeta {
    name: string;
    version: string;
    type: PluginType;
    description?: string;
    author?: string;
    dependencies?: Record<string, string>;
}
export interface PluginModule<TInput = any, TOutput = any> {
    meta: PluginMeta;
    execute(input: TInput): Promise<TOutput> | TOutput;
    init?(): Promise<void> | void;
    dispose?(): Promise<void> | void;
}
export declare class PluginRegistry {
    private static instance;
    private plugins;
    private constructor();
    static getInstance(): PluginRegistry;
    list(type?: PluginType): PluginMeta[];
    get(name: string): PluginModule | undefined;
    register(module: PluginModule): Promise<void>;
    unregister(name: string): Promise<void>;
}
export declare class PluginLoader {
    private baseDir;
    constructor(baseDir: string);
    loadAll(): Promise<number>;
}
