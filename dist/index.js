"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import configurations
const prisma_1 = require("./config/prisma");
const swagger_1 = __importDefault(require("./config/swagger"));
const socket_1 = require("./config/socket");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const teams_1 = __importDefault(require("./routes/teams"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const files_1 = __importDefault(require("./routes/files"));
// Import middleware
const errorHandler_1 = require("./middleware/errorHandler");
class Server {
    app;
    server;
    io;
    port;
    constructor() {
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:3001",
                methods: ["GET", "POST"],
            },
        });
        this.port = parseInt(process.env.PORT || "3000", 10);
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeSocketIO();
        this.initializeSwagger();
        this.initializeErrorHandling();
    }
    async initializeDatabase() {
        try {
            // Test Prisma connection
            await prisma_1.prisma.$connect();
            console.log("✅ Database connected successfully via Prisma");
        }
        catch (error) {
            console.error("❌ Database connection failed:", error);
            process.exit(1);
        }
    }
    initializeMiddlewares() {
        // Security middleware
        this.app.use((0, helmet_1.default)());
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "15", 10) * 60 * 1000,
            max: parseInt(process.env.RATE_LIMIT_MAX || "100", 10),
            message: "Too many requests from this IP, please try again later.",
        });
        this.app.use(limiter);
        // CORS configuration
        this.app.use((0, cors_1.default)({
            origin: process.env.CLIENT_URL || "http://localhost:3001",
            credentials: true,
        }));
        // Body parsing middleware
        this.app.use(express_1.default.json({ limit: "10mb" }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
        // Compression middleware
        this.app.use((0, compression_1.default)());
        // Logging middleware
        if (process.env.NODE_ENV !== "test") {
            // TODO: Re-enable morgan after fixing TypeScript import
            // this.app.use(morgan('combined'));
        }
        // Static files
        this.app.use("/uploads", express_1.default.static(path_1.default.join(process.cwd(), "uploads")));
    }
    initializeRoutes() {
        // Health check
        this.app.get("/health", (_req, res) => {
            res.status(200).json({
                status: "OK",
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || "development",
            });
        });
        // API routes
        this.app.use("/api/auth", auth_1.default);
        this.app.use("/api/users", users_1.default);
        this.app.use("/api/projects", projects_1.default);
        this.app.use("/api/tasks", tasks_1.default);
        this.app.use("/api/teams", teams_1.default);
        this.app.use("/api/notifications", notifications_1.default);
        this.app.use("/api/files", files_1.default);
        // 404 handler
        this.app.use("*", (req, res) => {
            res.status(404).json({
                success: false,
                message: "Route not found",
                path: req.originalUrl,
            });
        });
    }
    initializeSocketIO() {
        (0, socket_1.setupSocketIO)(this.io);
        // Make io accessible to other parts of the application
        this.app.set("io", this.io);
    }
    initializeSwagger() {
        (0, swagger_1.default)(this.app);
    }
    initializeErrorHandling() {
        this.app.use(errorHandler_1.errorHandler);
    }
    start() {
        this.server.listen(this.port, () => {
            console.log(`🚀 Server is running on port ${this.port}`);
            console.log(`📚 API Documentation: http://localhost:${this.port}/api-docs`);
            console.log(`🌐 Client URL: ${process.env.CLIENT_URL || "http://localhost:3001"}`);
            console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
        });
    }
    getApp() {
        return this.app;
    }
    getServer() {
        return this.server;
    }
    getIO() {
        return this.io;
    }
}
// Create and start server
const server = new Server();
server.start();
exports.default = server;
