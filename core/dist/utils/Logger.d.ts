interface LogMetadata {
    [key: string]: unknown;
}
export declare class Logger {
    private static instance;
    private logger;
    private constructor();
    static getInstance(): Logger;
    info(message: string, metadata?: LogMetadata): void;
    error(message: string, metadata?: LogMetadata): void;
    warn(message: string, metadata?: LogMetadata): void;
    debug(message: string, metadata?: LogMetadata): void;
    query(options: unknown): Promise<unknown>;
}
export {};
