"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SocketService {
    io = null;
    connectedUsers = new Map(); // userId -> Set of socketIds
    userSockets = new Map(); // socketId -> socket
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
            cors: {
                origin: process.env.CORS_ORIGIN || "http://localhost:3000",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });
        this.setupEventHandlers();
        console.log("🔌 Socket.IO server initialized");
        return this.io;
    }
    setupEventHandlers() {
        if (!this.io)
            return;
        this.io.on("connection", (socket) => {
            console.log(`🔗 Client connected: ${socket.id}`);
            // Authentication
            socket.on("authenticate", (data) => {
                this.authenticateSocket(socket, data.token);
            });
            // User activity tracking
            socket.on("user_active", () => {
                if (socket.userId) {
                    this.broadcastUserActivity(socket.userId, "active");
                }
            });
            socket.on("user_inactive", () => {
                if (socket.userId) {
                    this.broadcastUserActivity(socket.userId, "inactive");
                }
            });
            // Join rooms for real-time updates
            socket.on("join_project", (projectId) => {
                if (socket.userId) {
                    socket.join(`project_${projectId}`);
                    console.log(`👤 User ${socket.userId} joined project ${projectId}`);
                }
            });
            socket.on("leave_project", (projectId) => {
                if (socket.userId) {
                    socket.leave(`project_${projectId}`);
                    console.log(`👤 User ${socket.userId} left project ${projectId}`);
                }
            });
            socket.on("join_team", (teamId) => {
                if (socket.userId) {
                    socket.join(`team_${teamId}`);
                    console.log(`👥 User ${socket.userId} joined team ${teamId}`);
                }
            });
            socket.on("leave_team", (teamId) => {
                if (socket.userId) {
                    socket.leave(`team_${teamId}`);
                    console.log(`👥 User ${socket.userId} left team ${teamId}`);
                }
            });
            // File upload progress
            socket.on("upload_progress", (data) => {
                if (socket.userId) {
                    socket.emit("upload_progress_update", data);
                }
            });
            // Disconnect handling
            socket.on("disconnect", (reason) => {
                console.log(`💔 Client disconnected: ${socket.id}, reason: ${reason}`);
                this.handleDisconnection(socket);
            });
        });
    }
    authenticateSocket(socket, token) {
        try {
            if (!process.env.JWT_ACCESS_SECRET) {
                throw new Error("JWT_ACCESS_SECRET not configured");
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.userId = decoded.userId;
            socket.userEmail = decoded.email;
            // Track connected user
            if (!this.connectedUsers.has(decoded.userId)) {
                this.connectedUsers.set(decoded.userId, new Set());
            }
            this.connectedUsers.get(decoded.userId).add(socket.id);
            this.userSockets.set(socket.id, socket);
            socket.emit("authenticated", {
                userId: decoded.userId,
                email: decoded.email,
            });
            // Broadcast user online status
            this.broadcastUserActivity(decoded.userId, "online");
            console.log(`✅ Socket authenticated: ${socket.id} -> User: ${decoded.email}`);
        }
        catch (error) {
            console.error("❌ Socket authentication failed:", error);
            socket.emit("authentication_error", { message: "Invalid token" });
            socket.disconnect();
        }
    }
    handleDisconnection(socket) {
        if (socket.userId) {
            const userSockets = this.connectedUsers.get(socket.userId);
            if (userSockets) {
                userSockets.delete(socket.id);
                if (userSockets.size === 0) {
                    this.connectedUsers.delete(socket.userId);
                    // Broadcast user offline status
                    this.broadcastUserActivity(socket.userId, "offline");
                }
            }
            this.userSockets.delete(socket.id);
        }
    }
    broadcastUserActivity(userId, status) {
        if (!this.io)
            return;
        this.io.emit("user_activity", {
            userId,
            status,
            timestamp: new Date().toISOString(),
        });
    }
    // Public methods for emitting events from controllers/services
    // Task-related events
    emitTaskCreated(projectId, task) {
        if (!this.io)
            return;
        this.io.to(`project_${projectId}`).emit("task_created", {
            type: "task_created",
            data: task,
            timestamp: new Date().toISOString(),
        });
    }
    emitTaskUpdated(projectId, task) {
        if (!this.io)
            return;
        this.io.to(`project_${projectId}`).emit("task_updated", {
            type: "task_updated",
            data: task,
            timestamp: new Date().toISOString(),
        });
    }
    emitTaskCompleted(projectId, task) {
        if (!this.io)
            return;
        this.io.to(`project_${projectId}`).emit("task_completed", {
            type: "task_completed",
            data: task,
            timestamp: new Date().toISOString(),
        });
    }
    emitTaskDeleted(projectId, taskId) {
        if (!this.io)
            return;
        this.io.to(`project_${projectId}`).emit("task_deleted", {
            type: "task_deleted",
            data: { taskId },
            timestamp: new Date().toISOString(),
        });
    }
    // Project-related events
    emitProjectUpdated(projectId, project) {
        if (!this.io)
            return;
        this.io.to(`project_${projectId}`).emit("project_updated", {
            type: "project_updated",
            data: project,
            timestamp: new Date().toISOString(),
        });
    }
    // Team-related events
    emitTeamMemberAdded(teamId, member) {
        if (!this.io)
            return;
        this.io.to(`team_${teamId}`).emit("team_member_added", {
            type: "team_member_added",
            data: member,
            timestamp: new Date().toISOString(),
        });
    }
    emitTeamMemberRemoved(teamId, userId) {
        if (!this.io)
            return;
        this.io.to(`team_${teamId}`).emit("team_member_removed", {
            type: "team_member_removed",
            data: { userId },
            timestamp: new Date().toISOString(),
        });
    }
    emitTeamNotification(teamId, notification) {
        if (!this.io)
            return;
        this.io.to(`team_${teamId}`).emit("team_notification", {
            type: "team_notification",
            data: notification,
            timestamp: new Date().toISOString(),
        });
    }
    // File upload events
    emitFileUploadProgress(userId, fileId, progress) {
        if (!this.io)
            return;
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach((socketId) => {
                const socket = this.userSockets.get(socketId);
                if (socket) {
                    socket.emit("file_upload_progress", {
                        type: "file_upload_progress",
                        data: { fileId, progress },
                        timestamp: new Date().toISOString(),
                    });
                }
            });
        }
    }
    emitFileUploaded(taskId, file) {
        if (!this.io)
            return;
        this.io.emit("file_uploaded", {
            type: "file_uploaded",
            data: { taskId, file },
            timestamp: new Date().toISOString(),
        });
    }
    // Notification events
    emitNotificationToUser(userId, notification) {
        if (!this.io)
            return;
        const userSockets = this.connectedUsers.get(userId);
        if (userSockets) {
            userSockets.forEach((socketId) => {
                const socket = this.userSockets.get(socketId);
                if (socket) {
                    socket.emit("notification", {
                        type: "notification",
                        data: notification,
                        timestamp: new Date().toISOString(),
                    });
                }
            });
        }
    }
    // Utility methods
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.keys());
    }
    isUserOnline(userId) {
        return this.connectedUsers.has(userId);
    }
}
exports.default = new SocketService();
