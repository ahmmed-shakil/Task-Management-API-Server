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
const projectMethods = __importStar(require("../methods/projects.prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
class ProjectService {
    async getAllProjects(userId, filters = {}) {
        try {
            const { page = 1, limit = 10, status, priority, search } = filters;
            const projectFilters = {
                page: parseInt(page.toString()),
                limit: parseInt(limit.toString()),
                userId, // This will filter to projects the user is a member of
            };
            if (status)
                projectFilters.status = status;
            if (priority)
                projectFilters.priority = priority;
            if (search)
                projectFilters.search = search;
            const projects = await projectMethods.getAllProjects(projectFilters);
            return {
                success: true,
                data: projects.projects,
                message: "Projects retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, 500);
        }
    }
    async createProject(userId, projectData) {
        try {
            // Validate required fields
            if (!projectData.name) {
                throw new errorHandler_1.AppError("Project name is required", 400);
            }
            // Add owner ID to project data
            const dataWithOwner = {
                ...projectData,
                ownerId: userId,
            };
            const project = await projectMethods.createProject(dataWithOwner);
            return {
                success: true,
                data: project,
                message: "Project created successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getProjectById(projectId, userId) {
        try {
            // Check if user has access to this project
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this project", 403);
            }
            const project = await projectMethods.getProjectById(projectId);
            if (!project) {
                throw new errorHandler_1.AppError("Project not found", 404);
            }
            return {
                success: true,
                data: project,
                message: "Project retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async updateProject(projectId, userId, updateData) {
        try {
            // Check if user has permission to update this project (owner or admin role)
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
                throw new errorHandler_1.AppError("Permission denied to update this project", 403);
            }
            const project = await projectMethods.updateProject(projectId, updateData);
            if (!project) {
                throw new errorHandler_1.AppError("Project not found", 404);
            }
            return {
                success: true,
                data: project,
                message: "Project updated successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async deleteProject(projectId, userId) {
        try {
            // Check if user is the project owner
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole || memberRole !== "owner") {
                throw new errorHandler_1.AppError("Only project owner can delete the project", 403);
            }
            await projectMethods.deleteProject(projectId);
            return {
                success: true,
                data: null,
                message: "Project deleted successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getProjectMembers(projectId, userId) {
        try {
            // Check if user has access to this project
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole) {
                throw new errorHandler_1.AppError("Access denied to this project", 403);
            }
            const members = await projectMethods.getProjectMembers(projectId);
            return {
                success: true,
                data: members,
                message: "Project members retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async addProjectMember(projectId, userId, memberData) {
        try {
            // Check if user has permission to add members (owner or admin)
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
                throw new errorHandler_1.AppError("Permission denied to add members to this project", 403);
            }
            const member = await projectMethods.addProjectMember(projectId, memberData.userId, memberData.role || "member");
            return {
                success: true,
                data: member,
                message: "Member added to project successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async removeProjectMember(projectId, memberId, userId) {
        try {
            // Check if user has permission to remove members (owner or admin)
            const memberRole = await projectMethods.isProjectMember(projectId, userId);
            if (!memberRole || (memberRole !== "owner" && memberRole !== "admin")) {
                throw new errorHandler_1.AppError("Permission denied to remove members from this project", 403);
            }
            await projectMethods.removeProjectMember(projectId, memberId);
            return {
                success: true,
                data: null,
                message: "Member removed from project successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
    async getUserProjects(userId, page = 1, limit = 10) {
        try {
            const projects = await projectMethods.getUserProjects(userId, {
                page,
                limit,
            });
            return {
                success: true,
                data: projects.projects,
                message: "User projects retrieved successfully",
            };
        }
        catch (error) {
            throw new errorHandler_1.AppError(error.message, error.statusCode || 500);
        }
    }
}
exports.default = new ProjectService();
