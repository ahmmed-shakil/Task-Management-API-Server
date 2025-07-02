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
const userMethods = __importStar(require("../methods/users.prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
class UserService {
    async getUserProfile(userId) {
        try {
            const user = await userMethods.getUserWithDetails(userId);
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return {
                success: true,
                message: "User profile retrieved successfully",
                data: user,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async updateUserProfile(userId, updateData) {
        try {
            const { firstName, lastName, avatar } = updateData;
            // Validate data
            const allowedFields = {};
            if (firstName !== undefined)
                allowedFields.firstName = firstName;
            if (lastName !== undefined)
                allowedFields.lastName = lastName;
            if (avatar !== undefined)
                allowedFields.avatar = avatar;
            if (Object.keys(allowedFields).length === 0) {
                throw new errorHandler_1.AppError("No valid fields to update", 400);
            }
            const updatedUser = await userMethods.updateUser(userId, allowedFields);
            if (!updatedUser) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return {
                success: true,
                message: "Profile updated successfully",
                data: updatedUser,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getAllUsers(query) {
        try {
            const { page = 1, limit = 10, search = "" } = query;
            // Validate pagination
            const pageNum = Math.max(1, parseInt(page.toString()));
            const limitNum = Math.max(1, Math.min(50, parseInt(limit.toString()))); // Max 50 per page
            const result = await userMethods.getAllUsers(pageNum, limitNum, search);
            return {
                success: true,
                message: "Users retrieved successfully",
                data: result,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserById(userId) {
        try {
            const user = await userMethods.getUserById(userId);
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return {
                success: true,
                message: "User retrieved successfully",
                data: user,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async updateUser(userId, updateData, requesterId, requesterRole) {
        try {
            // Check permissions - only admin can update other users
            if (userId !== requesterId && requesterRole !== "admin") {
                throw new errorHandler_1.AppError("Insufficient permissions to update this user", 403);
            }
            const { firstName, lastName, avatar, role, isActive } = updateData;
            const allowedFields = {};
            if (firstName !== undefined)
                allowedFields.firstName = firstName;
            if (lastName !== undefined)
                allowedFields.lastName = lastName;
            if (avatar !== undefined)
                allowedFields.avatar = avatar;
            // Only admin can update role and isActive
            if (requesterRole === "admin") {
                if (role !== undefined)
                    allowedFields.role = role;
                if (isActive !== undefined)
                    allowedFields.isActive = isActive;
            }
            if (Object.keys(allowedFields).length === 0) {
                throw new errorHandler_1.AppError("No valid fields to update", 400);
            }
            const updatedUser = await userMethods.updateUser(userId, allowedFields);
            if (!updatedUser) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return {
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async deactivateUser(userId, requesterId, requesterRole) {
        try {
            // Check permissions - only admin can deactivate users
            if (requesterRole !== "admin") {
                throw new errorHandler_1.AppError("Only administrators can deactivate users", 403);
            }
            // Prevent admin from deactivating themselves
            if (userId === requesterId) {
                throw new errorHandler_1.AppError("You cannot deactivate your own account", 400);
            }
            const deletedUser = await userMethods.deleteUser(userId);
            if (!deletedUser) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return {
                success: true,
                message: "User deactivated successfully",
                data: { id: userId },
            };
        }
        catch (error) {
            throw error;
        }
    }
    async checkEmailAvailability(email, _excludeUserId) {
        try {
            const exists = await userMethods.userExists(email);
            return {
                success: true,
                message: "Email availability checked",
                data: {
                    email,
                    available: !exists,
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getUserStats(userId) {
        try {
            // This would typically involve aggregating data from multiple tables
            // For now, we'll return basic user info with some computed stats
            const user = await userMethods.getUserWithDetails(userId);
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            const stats = {
                totalProjects: user.projects ? user.projects.length : 0,
                totalTeams: user.teams ? user.teams.length : 0,
                projectsAsOwner: user.projects
                    ? user.projects.filter((p) => p.role === "owner").length
                    : 0,
                teamsAsLeader: user.teams
                    ? user.teams.filter((t) => t.role === "leader").length
                    : 0,
            };
            return {
                success: true,
                message: "User statistics retrieved successfully",
                data: {
                    user: {
                        id: user.id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        role: user.role,
                    },
                    stats,
                },
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = new UserService();
