import { Pool, PoolClient, QueryResult } from "pg";
declare const pool: Pool;
export declare const connectDB: () => Promise<boolean>;
export declare const query: (text: string, params?: any[]) => Promise<QueryResult>;
export declare const transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
export { pool };
declare const _default: {
    pool: Pool;
    connectDB: () => Promise<boolean>;
    query: (text: string, params?: any[]) => Promise<QueryResult>;
    transaction: <T>(callback: (client: PoolClient) => Promise<T>) => Promise<T>;
};
export default _default;
