export declare class RateLimiter {
    private static instance;
    private redis;
    private config;
    private constructor();
    static getInstance(): RateLimiter;
    isRateLimited(key: string): Promise<boolean>;
    resetLimit(key: string): Promise<void>;
    close(): Promise<void>;
}
