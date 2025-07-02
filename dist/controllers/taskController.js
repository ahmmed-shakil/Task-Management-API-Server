"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const taskService_1 = __importDefault(require("../services/taskService"));
const express_validator_1 = require("express-validator");
const socket_1 = __importDefault(require("../config/socket"));
class TaskController {
    async getAllTasks(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }
            const result = await taskService_1.default.getAllTasks(req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async createTask(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }
            const result = await taskService_1.default.createTask(req.user.id, req.body);
            // Emit real-time event for task creation
            if (result.success && result.data) {
                socket_1.default.emitTaskCreated(result.data.project_id, result.data);
            }
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTaskById(req, res, next) {
        try {
            const result = await taskService_1.default.getTaskById(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTask(req, res, next) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errors.array(),
                });
                return;
            }
            const result = await taskService_1.default.updateTask(req.params.id, req.user.id, req.body);
            // Emit real-time event for task update
            if (result.success && result.data) {
                socket_1.default.emitTaskUpdated(result.data.project_id, result.data);
                // If task status changed to completed, emit special event
                if (result.data.status === "completed") {
                    socket_1.default.emitTaskCompleted(result.data.project_id, result.data);
                }
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTask(req, res, next) {
        try {
            // Get task data before deletion for socket event
            const taskData = await taskService_1.default.getTaskById(req.params.id, req.user.id);
            const result = await taskService_1.default.deleteTask(req.params.id, req.user.id);
            // Emit real-time event for task deletion
            if (result.success && taskData.success && taskData.data) {
                socket_1.default.emitTaskDeleted(taskData.data.project_id, req.params.id);
            }
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTasksByProject(req, res, next) {
        try {
            const result = await taskService_1.default.getTasksByProject(req.params.projectId, req.user.id, req.query.status);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getUserTasks(req, res, next) {
        try {
            const result = await taskService_1.default.getUserTasks(req.user.id, req.query);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async addTaskComment(req, res, next) {
        try {
            const { content } = req.body;
            const result = await taskService_1.default.addTaskComment(req.params.id, req.user.id, content);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTaskComments(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const result = await taskService_1.default.getTaskComments(req.params.id, req.user.id, page, limit);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async updateTaskComment(req, res, next) {
        try {
            const { content } = req.body;
            const result = await taskService_1.default.updateTaskComment(req.params.commentId, req.user.id, content);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTaskComment(req, res, next) {
        try {
            const result = await taskService_1.default.deleteTaskComment(req.params.commentId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async addTaskAttachment(req, res, next) {
        try {
            const result = await taskService_1.default.addTaskAttachment(req.params.id, req.user.id, req.body);
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async getTaskAttachments(req, res, next) {
        try {
            const result = await taskService_1.default.getTaskAttachments(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTaskAttachment(req, res, next) {
        try {
            const result = await taskService_1.default.deleteTaskAttachment(req.params.attachmentId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new TaskController();
