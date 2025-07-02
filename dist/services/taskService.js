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
const taskMethods = __importStar(require("../methods/tasks.prisma"));
const projectMethods = __importStar(require("../methods/projects.prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
class TaskService {
    async getAllTasks(filters = {}) {
        try {
            const { page = 1, limit = 10, status, priority, projectId, assigneeId, search, } = filters;
            const taskFilters = {
                page: parseInt(page.toString()),
                limit: parseInt(limit.toString()),
            };
            if (status)
                taskFilters.status = status;
            if (priority)
                taskFilters.priority = priority;
            if (projectId)
                taskFilters.projectId = projectId;
            if (assigneeId)
                taskFilters.assigneeId = assigneeId;
            if (search)
                taskFilters.search = search;
            const tasks = await taskMethods.getAllTasks(taskFilters);
            return {
                success: true,
                data: tasks,
                message: "Tasks retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, 500);
        }
    }
    async createTask(userId, taskData) {
        try {
            // Validate required fields
            if (!taskData.title) {
                throw new errorHandler_1.AppError("Task title is required", 400);
            }
            if (!taskData.projectId) {
                throw new errorHandler_1.AppError("Project ID is required", 400);
            }
            // Check if user has access to the project
            const memberRole = await projectMethods.isProjectMember(taskData.projectId, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this project", 403);
            }
            // Add reporter ID to task data
            const dataWithReporter = {
                ...taskData,
                reporterId: userId,
            };
            const task = await taskMethods.createTask(dataWithReporter);
            return {
                success: true,
                data: task,
                message: "Task created successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getTaskById(taskId, userId) {
        try {
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has access to this task's project
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            return {
                success: true,
                data: task,
                message: "Task retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async updateTask(taskId, userId, updateData) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has permission to update this task (project member and either task owner or assignee)
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            // Allow update if user is the reporter, assignee, or has admin/owner role in project
            const canUpdate = task.reporter_id === userId ||
                task.assignee_id === userId ||
                memberRole === "owner" ||
                memberRole === "admin";
            if (!canUpdate) {
                throw new errorHandler_1.AppError("Permission denied to update this task", 403);
            }
            const updatedTask = await taskMethods.updateTask(taskId, updateData);
            if (!updatedTask) {
                throw new errorHandler_1.AppError("Failed to update task", 500);
            }
            return {
                success: true,
                data: updatedTask,
                message: "Task updated successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async deleteTask(taskId, userId) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has permission to delete this task (project owner/admin or task reporter)
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            const canDelete = task.reporter_id === userId ||
                memberRole === "owner" ||
                memberRole === "admin";
            if (!canDelete) {
                throw new errorHandler_1.AppError("Permission denied to delete this task", 403);
            }
            await taskMethods.deleteTask(taskId);
            return {
                success: true,
                data: null,
                message: "Task deleted successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getTasksByProject(projectId, userId, status) {
        try {
            // Check if user has access to this project
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this project", 403);
            }
            const tasks = await taskMethods.getTasksByProject(projectId, status ? { status } : undefined);
            return {
                success: true,
                data: tasks.tasks,
                message: "Project tasks retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getUserTasks(userId, filters = {}) {
        try {
            const tasks = await taskMethods.getUserTasks(userId, filters);
            return {
                success: true,
                data: tasks.tasks,
                message: "User tasks retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async addTaskComment(taskId, userId, content) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has access to this task's project
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            const comment = await taskMethods.addTaskComment(taskId, userId, content);
            return {
                success: true,
                data: comment,
                message: "Comment added successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getTaskComments(taskId, userId, page = 1, limit = 20) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has access to this task's project
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            const comments = await taskMethods.getTaskComments(taskId, page, limit);
            return {
                success: true,
                data: comments.comments,
                message: "Comments retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async updateTaskComment(commentId, userId, content) {
        try {
            // Note: In a real implementation, you'd want to check if the user owns the comment
            const updatedComment = await taskMethods.updateTaskComment(commentId, userId, content);
            if (!updatedComment) {
                throw new errorHandler_1.AppError("Comment not found", 404);
            }
            return {
                success: true,
                data: updatedComment,
                message: "Comment updated successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async deleteTaskComment(commentId) {
        try {
            // Note: In a real implementation, you'd want to check if the user owns the comment
            const deletedComment = await taskMethods.deleteTaskComment(commentId);
            if (!deletedComment) {
                throw new errorHandler_1.AppError("Comment not found", 404);
            }
            return {
                success: true,
                data: null,
                message: "Comment deleted successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async addTaskAttachment(taskId, userId, attachmentData) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has access to this task's project
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            const attachment = await taskMethods.addTaskAttachment(taskId, userId, attachmentData.fileName, attachmentData.originalName, attachmentData.filePath, attachmentData.fileSize, attachmentData.mimeType);
            return {
                success: true,
                data: attachment,
                message: "Attachment added successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getTaskAttachments(taskId, userId) {
        try {
            // Get task to check permissions
            const task = await taskMethods.getTaskById(taskId);
            if (!task) {
                throw new errorHandler_1.AppError("Task not found", 404);
            }
            // Check if user has access to this task's project
            const memberRole = await projectMethods.isProjectMember(task.project_id, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this task", 403);
            }
            const attachments = await taskMethods.getTaskAttachments(taskId);
            return {
                success: true,
                data: attachments,
                message: "Attachments retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async deleteTaskAttachment(attachmentId) {
        try {
            // Note: In a real implementation, you'd want to check if the user owns the attachment or has proper permissions
            const deletedAttachment = await taskMethods.deleteTaskAttachment(attachmentId);
            if (!deletedAttachment) {
                throw new errorHandler_1.AppError("Attachment not found", 404);
            }
            return {
                success: true,
                data: null,
                message: "Attachment deleted successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
}
exports.default = new TaskService();
