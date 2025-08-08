import { PoolClient, QueryResult } from 'pg';
export declare class DatabaseService {
    private static instance;
    private pool;
    private logger;
    private constructor();
    static getInstance(): DatabaseService;
    query(text: string, params?: any[]): Promise<QueryResult>;
    getClient(): Promise<PoolClient>;
    transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
    healthCheck(): Promise<boolean>;
    close(): Promise<void>;
}
