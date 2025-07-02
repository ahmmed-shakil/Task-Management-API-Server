import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

class HealthController {
  async checkDatabase(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const startTime = Date.now();

      // Test database connection with a simple query
      await prisma.$queryRaw`SELECT 1 as health_check`;

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      res.json({
        success: true,
        message: "Database is healthy",
        data: {
          status: "connected",
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString(),
          database: "PostgreSQL with Prisma ORM",
        },
      });
    } catch (error: any) {
      console.error("Database health check failed:", error);
      res.status(503).json({
        success: false,
        message: "Database is unhealthy",
        data: {
          status: "disconnected",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }

  async checkOverallHealth(
    _req: Request,
    res: Response,
    _next: NextFunction
  ): Promise<void> {
    try {
      const startTime = Date.now();

      // Check database
      let dbStatus = "healthy";
      let dbResponseTime = 0;
      let dbError = null;

      try {
        const dbStartTime = Date.now();
        await prisma.$queryRaw`SELECT 1 as health_check`;
        dbResponseTime = Date.now() - dbStartTime;
      } catch (error: any) {
        dbStatus = "unhealthy";
        dbError = error.message;
      }

      // Check memory usage
      const memUsage = process.memoryUsage();

      // Check uptime
      const uptime = process.uptime();

      const endTime = Date.now();
      const totalResponseTime = endTime - startTime;

      const isHealthy = dbStatus === "healthy";

      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? "System is healthy" : "System has issues",
        data: {
          status: isHealthy ? "healthy" : "unhealthy",
          timestamp: new Date().toISOString(),
          responseTime: `${totalResponseTime}ms`,
          uptime: `${Math.floor(uptime)}s`,
          database: {
            status: dbStatus,
            responseTime: `${dbResponseTime}ms`,
            error: dbError,
          },
          memory: {
            rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
            heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
            heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
            external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
          },
          environment: process.env.NODE_ENV || "development",
        },
      });
    } catch (error: any) {
      console.error("Overall health check failed:", error);
      res.status(500).json({
        success: false,
        message: "Health check failed",
        data: {
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
}

export default new HealthController();
