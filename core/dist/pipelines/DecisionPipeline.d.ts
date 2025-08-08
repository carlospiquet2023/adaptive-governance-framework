export type NodeHandler = (ctx: any) => Promise<any> | any;
export interface PipelineNode {
    id: string;
    type: string;
    next?: string[];
    config?: Record<string, any>;
}
export interface DecisionPipelineDef {
    name: string;
    nodes: PipelineNode[];
    entry: string;
}
export declare class DecisionPipelineEngine {
    private logger;
    private handlers;
    registerHandler(type: string, handler: NodeHandler): void;
    loadFromYAML(yamlText: string): DecisionPipelineDef;
    run(def: DecisionPipelineDef, input: any): Promise<Record<string, any>>;
}
