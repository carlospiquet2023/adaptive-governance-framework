export type Token = {
    type: string;
    value: string;
};
export interface ParsedRule {
    ast: any;
    toJSON(): any;
}
export declare class RuleDSLParser {
    tokenize(input: string): Token[];
    parse(input: string): ParsedRule;
}
