"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToAll = exports.emitToProject = exports.emitToUser = exports.setupSocketIO = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_prisma_1 = require("../methods/users.prisma");
const setupSocketIO = (io) => {
    // Middleware for socket authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error("Authentication error"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await (0, users_prisma_1.getUserById)(decoded.userId);
            if (!user) {
                return next(new Error("User not found"));
            }
            socket.userId = user.id;
            socket.user = user;
            next();
        }
        catch (error) {
            next(new Error("Authentication error"));
        }
    });
    io.on("connection", (socket) => {
        const authSocket = socket;
        console.log(`User ${authSocket.user.email} connected`);
        // Join user to their personal room
        authSocket.join(`user_${authSocket.userId}`);
        // Handle joining project rooms
        authSocket.on("join_project", (projectId) => {
            authSocket.join(`project_${projectId}`);
            console.log(`User ${authSocket.user.email} joined project ${projectId}`);
        });
        // Handle leaving project rooms
        authSocket.on("leave_project", (projectId) => {
            authSocket.leave(`project_${projectId}`);
            console.log(`User ${authSocket.user.email} left project ${projectId}`);
        });
        // Handle task updates
        authSocket.on("task_update", (data) => {
            // Broadcast to project members
            authSocket.to(`project_${data.projectId}`).emit("task_updated", data);
        });
        // Handle new task creation
        authSocket.on("task_created", (data) => {
            // Broadcast to project members
            authSocket.to(`project_${data.projectId}`).emit("new_task", data);
        });
        // Handle task assignment
        authSocket.on("task_assigned", (data) => {
            // Notify assigned user
            if (data.assigneeId) {
                authSocket
                    .to(`user_${data.assigneeId}`)
                    .emit("task_assigned_to_you", data);
            }
            // Broadcast to project members
            authSocket
                .to(`project_${data.projectId}`)
                .emit("task_assignment_updated", data);
        });
        // Handle comments
        authSocket.on("comment_added", (data) => {
            // Broadcast to project members
            authSocket.to(`project_${data.projectId}`).emit("new_comment", data);
        });
        // Handle typing indicators
        authSocket.on("typing_start", (data) => {
            authSocket.to(`project_${data.projectId}`).emit("user_typing", {
                userId: authSocket.userId,
                userName: `${authSocket.user.firstName} ${authSocket.user.lastName}`,
                taskId: data.taskId,
            });
        });
        authSocket.on("typing_stop", (data) => {
            authSocket.to(`project_${data.projectId}`).emit("user_stopped_typing", {
                userId: authSocket.userId,
                taskId: data.taskId,
            });
        });
        // Handle disconnect
        authSocket.on("disconnect", () => {
            console.log(`User ${authSocket.user.email} disconnected`);
        });
    });
};
exports.setupSocketIO = setupSocketIO;
// Helper functions to emit events from controllers
const emitToUser = (io, userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
};
exports.emitToUser = emitToUser;
const emitToProject = (io, projectId, event, data) => {
    io.to(`project_${projectId}`).emit(event, data);
};
exports.emitToProject = emitToProject;
const emitToAll = (io, event, data) => {
    io.emit(event, data);
};
exports.emitToAll = emitToAll;
