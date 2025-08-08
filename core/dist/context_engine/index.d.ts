export declare class ContextEngine {
    private context;
    constructor(context: any);
    analyze(): {
        security: {
            owasp: string[];
            encryption: string;
        };
        performance: {
            slo: {
                latency_p95_ms: number;
            };
        };
    } | {
        security?: undefined;
        performance?: undefined;
    };
}
