"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.transaction = exports.query = exports.connectDB = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Database connection pool
const pool = new pg_1.Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME || "task_management",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool = pool;
// Test database connection
const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Database connected successfully");
        client.release();
        return true;
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
        throw error;
    }
};
exports.connectDB = connectDB;
// Query helper function
const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log("Executed query", { text, duration, rows: res.rowCount });
        return res;
    }
    catch (error) {
        console.error("Query error:", error);
        throw error;
    }
};
exports.query = query;
// Transaction helper
const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    }
    catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};
exports.transaction = transaction;
exports.default = { pool, connectDB: exports.connectDB, query: exports.query, transaction: exports.transaction };
