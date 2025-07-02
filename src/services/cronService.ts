import * as cron from "node-cron";
import { prisma } from "../config/prisma";

class CronService {
  private isDbHealthy: boolean = true;
  private lastHealthCheck: Date = new Date();

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

  private async performDatabaseHealthCheck() {
    try {
      const startTime = Date.now();

      // Test database connection
      await prisma.$queryRaw`SELECT 1 as health_check`;

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
    } catch (error: any) {
      if (this.isDbHealthy) {
        console.error("❌ Database connection lost:", error.message);
        this.isDbHealthy = false;
      }
    }
  }

  private async cleanupExpiredTokens() {
    try {
      const now = new Date();
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      if (result.count > 0) {
        console.log(`🧹 Cleaned up ${result.count} expired refresh tokens`);
      }
    } catch (error: any) {
      console.error("❌ Failed to cleanup expired tokens:", error.message);
    }
  }

  private logSystemStats() {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    console.log(
      `📊 System Stats - Uptime: ${Math.floor(uptime)}s, Memory: ${Math.round(
        memUsage.heapUsed / 1024 / 1024
      )}MB, DB: ${this.isDbHealthy ? "✅" : "❌"}`
    );
  }

  getHealthStatus() {
    return {
      isDbHealthy: this.isDbHealthy,
      lastHealthCheck: this.lastHealthCheck,
    };
  }
}

export default new CronService();
