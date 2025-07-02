"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Task Management API",
            version: "1.0.0",
            description: "A robust RESTful API backend for task management applications",
            contact: {
                name: "API Support",
                email: "support@taskmanagement.com",
            },
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        email: { type: "string", format: "email" },
                        firstName: { type: "string" },
                        lastName: { type: "string" },
                        avatar: { type: "string" },
                        role: { type: "string", enum: ["admin", "user"] },
                        isActive: { type: "boolean" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Project: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        name: { type: "string" },
                        description: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["planning", "active", "completed", "on-hold"],
                        },
                        priority: {
                            type: "string",
                            enum: ["low", "medium", "high", "urgent"],
                        },
                        startDate: { type: "string", format: "date" },
                        endDate: { type: "string", format: "date" },
                        ownerId: { type: "string", format: "uuid" },
                        teamId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Task: {
                    type: "object",
                    properties: {
                        id: { type: "string", format: "uuid" },
                        title: { type: "string" },
                        description: { type: "string" },
                        status: {
                            type: "string",
                            enum: ["todo", "in-progress", "in-review", "completed"],
                        },
                        priority: {
                            type: "string",
                            enum: ["low", "medium", "high", "urgent"],
                        },
                        assigneeId: { type: "string", format: "uuid" },
                        projectId: { type: "string", format: "uuid" },
                        dueDate: { type: "string", format: "date-time" },
                        estimatedHours: { type: "number" },
                        actualHours: { type: "number" },
                        tags: { type: "array", items: { type: "string" } },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Team: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        description: { type: "string" },
                        leaderId: { type: "string", format: "uuid" },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string" },
                        error: { type: "object" },
                    },
                },
                Success: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: true },
                        message: { type: "string" },
                        data: { type: "object" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.ts", "./controllers/*.ts"], // paths to files containing OpenAPI definitions
};
const specs = (0, swagger_jsdoc_1.default)(options);
const swaggerSetup = (app) => {
    app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs, {
        explorer: true,
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: "Task Management API Documentation",
    }));
};
exports.default = swaggerSetup;
