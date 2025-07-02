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
const cron = __importStar(require("node-cron"));
const prisma_1 = require("../config/prisma");
class CronService {
    isDbHealthy = true;
    lastHealthCheck = new Date();
    initialize() {
        console.log("🕐 Initializing cron jobs...");
        // Database health check every 30 seconds
        cron.schedule("*/30 * * * * *", async () => {
            await this.performDatabaseHealthCheck();
        });
        // Cleanup expired refresh tokens every hour
        cron.schedule("0 * * * *", async () => {
            await this.cleanupExpiredTokens();
        });
        // Log system stats every 5 minutes
        cron.schedule("*/5 * * * *", () => {
            this.logSystemStats();
        });
        console.log("✅ Cron jobs initialized successfully");
    }
    async performDatabaseHealthCheck() {
        try {
            const startTime = Date.now();
            // Test database connection
            await prisma_1.prisma.$queryRaw `SELECT 1 as health_check`;
            const responseTime = Date.now() - startTime;
            this.lastHealthCheck = new Date();
            if (!this.isDbHealthy) {
                console.log("✅ Database connection restored");
                this.isDbHealthy = true;
            }
            // Only log every 10th check to avoid spam (every 5 minutes)
            if (Math.floor(Date.now() / 1000) % 300 < 30) {
                console.log(`💾 DB Health Check: OK (${responseTime}ms)`);
            }
        }
        catch (error) {
            if (this.isDbHealthy) {
                console.error("❌ Database connection lost:", error.message);
                this.isDbHealthy = false;
            }
        }
    }
    async cleanupExpiredTokens() {
        try {
            const now = new Date();
            const result = await prisma_1.prisma.refreshToken.deleteMany({
                where: {
                    expiresAt: {
                        lt: now,
                    },
                },
            });
            if (result.count > 0) {
                console.log(`🧹 Cleaned up ${result.count} expired refresh tokens`);
            }
        }
        catch (error) {
            console.error("❌ Failed to cleanup expired tokens:", error.message);
        }
    }
    logSystemStats() {
        const memUsage = process.memoryUsage();
        const uptime = process.uptime();
        console.log(`📊 System Stats - Uptime: ${Math.floor(uptime)}s, Memory: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB, DB: ${this.isDbHealthy ? "✅" : "❌"}`);
    }
    getHealthStatus() {
        return {
            isDbHealthy: this.isDbHealthy,
            lastHealthCheck: this.lastHealthCheck,
        };
    }
}
exports.default = new CronService();
