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
const authMethods = __importStar(require("../methods/auth.prisma"));
const userMethods = __importStar(require("../methods/users.prisma"));
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    async register(userData) {
        try {
            const { email, password, firstName, lastName } = userData;
            // Validate required fields
            if (!email || !password || !firstName || !lastName) {
                throw new errorHandler_1.AppError("All fields are required", 400);
            }
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new errorHandler_1.AppError("Invalid email format", 400);
            }
            // Validate password strength
            if (password.length < 6) {
                throw new errorHandler_1.AppError("Password must be at least 6 characters long", 400);
            }
            const result = await authMethods.register(userData);
            return result;
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "User with this email already exists") {
                throw new errorHandler_1.AppError(error.message, 409);
            }
            throw error;
        }
    }
    async login(credentials) {
        try {
            const { email, password } = credentials;
            if (!email || !password) {
                throw new errorHandler_1.AppError("Email and password are required", 400);
            }
            const result = await authMethods.login({ email, password });
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message === "Invalid credentials") {
                throw new errorHandler_1.AppError(error.message, 401);
            }
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            if (!refreshToken) {
                throw new errorHandler_1.AppError("Refresh token is required", 400);
            }
            const tokens = await authMethods.refreshAccessToken(refreshToken);
            return tokens;
        }
        catch (error) {
            if (error instanceof Error && error.message === "Invalid refresh token") {
                throw new errorHandler_1.AppError(error.message, 401);
            }
            throw error;
        }
    }
    async logout(refreshToken) {
        try {
            await authMethods.logout(refreshToken);
        }
        catch (error) {
            throw error;
        }
    }
    async forgotPassword(email) {
        try {
            if (!email) {
                throw new errorHandler_1.AppError("Email is required", 400);
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new errorHandler_1.AppError("Invalid email format", 400);
            }
            // TODO: Implement forgot password functionality
            // await authMethods.forgotPassword(email);
            throw new errorHandler_1.AppError("Forgot password functionality not implemented yet", 501);
        }
        catch (error) {
            if (error instanceof Error && error.message === "User not found") {
                throw new errorHandler_1.AppError(error.message, 404);
            }
            throw error;
        }
    }
    async resetPassword(token, password) {
        try {
            if (!token || !password) {
                throw new errorHandler_1.AppError("Token and password are required", 400);
            }
            if (password.length < 6) {
                throw new errorHandler_1.AppError("Password must be at least 6 characters long", 400);
            }
            // TODO: Implement proper token verification and email lookup
            // For now, we'll throw an error since this needs proper implementation
            throw new errorHandler_1.AppError("Reset password functionality not implemented yet", 501);
            // await authMethods.resetPassword(email, password, token);
        }
        catch (error) {
            if (error instanceof Error &&
                (error.message === "Invalid token" || error.message === "Token expired")) {
                throw new errorHandler_1.AppError(error.message, 400);
            }
            throw error;
        }
    }
    async verifyEmail(token) {
        try {
            if (!token) {
                throw new errorHandler_1.AppError("Verification token is required", 400);
            }
            // TODO: Implement email verification functionality
            throw new errorHandler_1.AppError("Email verification functionality not implemented yet", 501);
            // await authMethods.verifyEmail(token);
        }
        catch (error) {
            if (error instanceof Error &&
                (error.message === "Invalid token" || error.message === "Token expired")) {
                throw new errorHandler_1.AppError(error.message, 400);
            }
            throw error;
        }
    }
    async getUserProfile(userId) {
        try {
            const user = await userMethods.getUserWithDetails(userId);
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            if (!currentPassword || !newPassword) {
                throw new errorHandler_1.AppError("Current password and new password are required", 400);
            }
            if (newPassword.length < 6) {
                throw new errorHandler_1.AppError("New password must be at least 6 characters long", 400);
            }
            await authMethods.changePassword(userId, currentPassword, newPassword);
        }
        catch (error) {
            if (error instanceof Error &&
                error.message === "Current password is incorrect") {
                throw new errorHandler_1.AppError(error.message, 400);
            }
            throw error;
        }
    }
    async updateProfile(userId, updateData) {
        try {
            const user = await userMethods.updateUser(userId, updateData);
            if (!user) {
                throw new errorHandler_1.AppError("User not found", 404);
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.default = new AuthService();
