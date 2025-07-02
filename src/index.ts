import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import configurations
import { prisma } from "./config/prisma";
import swaggerSetup from "./config/swagger";
import socketService from "./config/socket";
import cronService from "./services/cronService";

// Import routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import projectRoutes from "./routes/projects";
import taskRoutes from "./routes/tasks";
import teamRoutes from "./routes/teams";
import notificationRoutes from "./routes/notifications";
import fileRoutes from "./routes/files";
import healthRoutes from "./routes/health";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";

class Server {
  private app: Express;
  private server: http.Server;
  private port: number;

  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.port = parseInt(process.env.PORT || "3000", 10);

    this.initializeDatabase();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSocket();
    this.initializeCronJobs();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private async initializeDatabase(): Promise<void> {
    try {
      // Test Prisma connection
      await prisma.$connect();
      console.log("✅ Database connected successfully via Prisma");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      process.exit(1);
    }
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10) * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
      message: "Too many requests from this IP, please try again later.",
    });
    this.app.use(limiter);

    // CORS configuration
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:3001",
        credentials: true,
      })
    );

    // Body parsing middleware
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Compression middleware
    this.app.use(compression());

    // Logging middleware
    if (process.env.NODE_ENV !== "test") {
      // this.app.use(morgan('combined'));
    }

    // Static files
    this.app.use(
      "/uploads",
      express.static(path.join(process.cwd(), "uploads"))
    );
  }

  private initializeRoutes(): void {
    // Health check routes
    this.app.use("/health", healthRoutes);

    // API routes
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/users", userRoutes);
    this.app.use("/api/projects", projectRoutes);
    this.app.use("/api/tasks", taskRoutes);
    this.app.use("/api/teams", teamRoutes);
    this.app.use("/api/notifications", notificationRoutes);
    this.app.use("/api/files", fileRoutes);

    // 404 handler
    this.app.use("*", (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
      });
    });
  }

  private initializeSocket(): void {
    socketService.initialize(this.server);

    // Make socket service accessible to controllers
    this.app.set("socketService", socketService);
  }

  private initializeCronJobs(): void {
    cronService.initialize();
  }

  private initializeSwagger(): void {
    swaggerSetup(this.app);
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.server.listen(this.port, () => {
      console.log(`🚀 Server is running on port ${this.port}`);
      console.log(
        `📚 API Documentation: http://localhost:${this.port}/api-docs`
      );
      console.log(
        `🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3001"}`
      );
      console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  }

  public getApp(): Express {
    return this.app;
  }

  public getServer(): http.Server {
    return this.server;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;
