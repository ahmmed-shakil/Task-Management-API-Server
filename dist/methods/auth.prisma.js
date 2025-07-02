"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredTokens = exports.resetPassword = exports.changePassword = exports.verifyUserToken = exports.logoutAll = exports.logout = exports.refreshAccessToken = exports.login = exports.register = exports.verifyToken = exports.removeAllRefreshTokensForUser = exports.removeRefreshToken = exports.validateRefreshToken = exports.saveRefreshToken = exports.generateTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../config/prisma");
const users_prisma_1 = require("./users.prisma");
// Generate JWT tokens
const generateTokens = (userId) => {
    const payload = { userId };
    const jwtSecret = process.env.JWT_SECRET;
    const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!jwtSecret || !jwtRefreshSecret) {
        throw new Error("JWT secrets not configured");
    }
    const accessToken = jsonwebtoken_1.default.sign(payload, jwtSecret, {
        expiresIn: process.env.JWT_EXPIRE || "7d",
    });
    const refreshToken = jsonwebtoken_1.default.sign(payload, jwtRefreshSecret, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || "30d",
    });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
// Save refresh token to database
const saveRefreshToken = async (userId, refreshToken) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    try {
        // First, clean up expired tokens for this user
        await prisma_1.prisma.refreshToken.deleteMany({
            where: {
                userId,
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
        // Use upsert to insert or update the refresh token
        await prisma_1.prisma.refreshToken.upsert({
            where: { userId },
            update: {
                token: refreshToken,
                expiresAt,
            },
            create: {
                userId,
                token: refreshToken,
                expiresAt,
            },
        });
    }
    catch (error) {
        console.error("Error saving refresh token:", error);
        throw new Error("Failed to save refresh token");
    }
};
exports.saveRefreshToken = saveRefreshToken;
// Validate refresh token
const validateRefreshToken = async (refreshToken) => {
    try {
        const tokenRecord = await prisma_1.prisma.refreshToken.findUnique({
            where: {
                token: refreshToken,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        isActive: true,
                    },
                },
            },
        });
        if (!tokenRecord ||
            tokenRecord.expiresAt < new Date() ||
            !tokenRecord.user.isActive) {
            return null;
        }
        return tokenRecord.userId;
    }
    catch (error) {
        console.error("Error validating refresh token:", error);
        return null;
    }
};
exports.validateRefreshToken = validateRefreshToken;
// Remove refresh token (logout)
const removeRefreshToken = async (refreshToken) => {
    try {
        await prisma_1.prisma.refreshToken.delete({
            where: {
                token: refreshToken,
            },
        });
    }
    catch (error) {
        console.error("Error removing refresh token:", error);
        throw new Error("Failed to remove refresh token");
    }
};
exports.removeRefreshToken = removeRefreshToken;
// Remove all refresh tokens for user (logout all devices)
const removeAllRefreshTokensForUser = async (userId) => {
    try {
        await prisma_1.prisma.refreshToken.delete({
            where: {
                userId: userId,
            },
        });
    }
    catch (error) {
        console.error("Error removing all refresh tokens for user:", error);
        throw new Error("Failed to remove refresh tokens");
    }
};
exports.removeAllRefreshTokensForUser = removeAllRefreshTokensForUser;
// Verify JWT token
const verifyToken = (token, secret) => {
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
// Register new user
const register = async (userData) => {
    try {
        // Check if user already exists
        const existingUser = await (0, users_prisma_1.getUserByEmail)(userData.email);
        if (existingUser) {
            throw new Error("User with this email already exists");
        }
        // Create new user
        const user = await (0, users_prisma_1.createUser)(userData);
        // Generate tokens
        const tokens = (0, exports.generateTokens)(user.id);
        // Save refresh token
        await (0, exports.saveRefreshToken)(user.id, tokens.refreshToken);
        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tokens,
        };
    }
    catch (error) {
        console.error("Error during registration:", error);
        throw error;
    }
};
exports.register = register;
// Login user
const login = async (credentials) => {
    try {
        const { email, password } = credentials;
        // Get user with password
        const user = await (0, users_prisma_1.getUserByEmail)(email);
        if (!user || !user.password) {
            throw new Error("Invalid credentials");
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error("Invalid credentials");
        }
        // Check if user is active
        if (!user.isActive) {
            throw new Error("Account is deactivated");
        }
        // Update last login
        await (0, users_prisma_1.updateUserLastLogin)(user.id);
        // Generate tokens
        const tokens = (0, exports.generateTokens)(user.id);
        // Save refresh token
        await (0, exports.saveRefreshToken)(user.id, tokens.refreshToken);
        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            tokens,
        };
    }
    catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
};
exports.login = login;
// Refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        // Validate refresh token
        const userId = await (0, exports.validateRefreshToken)(refreshToken);
        if (!userId) {
            throw new Error("Invalid or expired refresh token");
        }
        // Get user to make sure they still exist and are active
        const user = await (0, users_prisma_1.getUserById)(userId);
        if (!user || !user.isActive) {
            throw new Error("User not found or inactive");
        }
        // Generate new tokens
        const tokens = (0, exports.generateTokens)(userId);
        // Save new refresh token
        await (0, exports.saveRefreshToken)(userId, tokens.refreshToken);
        // Remove old refresh token
        await (0, exports.removeRefreshToken)(refreshToken);
        return tokens;
    }
    catch (error) {
        console.error("Error refreshing token:", error);
        throw error;
    }
};
exports.refreshAccessToken = refreshAccessToken;
// Logout user
const logout = async (refreshToken) => {
    try {
        await (0, exports.removeRefreshToken)(refreshToken);
    }
    catch (error) {
        console.error("Error during logout:", error);
        throw error;
    }
};
exports.logout = logout;
// Logout from all devices
const logoutAll = async (userId) => {
    try {
        await (0, exports.removeAllRefreshTokensForUser)(userId);
    }
    catch (error) {
        console.error("Error during logout all:", error);
        throw error;
    }
};
exports.logoutAll = logoutAll;
// Verify user token and get user data
const verifyUserToken = async (token) => {
    try {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            throw new Error("JWT secret not configured");
        }
        const decoded = (0, exports.verifyToken)(token, jwtSecret);
        if (!decoded || !decoded.userId) {
            return null;
        }
        const user = await (0, users_prisma_1.getUserById)(decoded.userId);
        if (!user || !user.isActive) {
            return null;
        }
        return user;
    }
    catch (error) {
        console.error("Error verifying user token:", error);
        return null;
    }
};
exports.verifyUserToken = verifyUserToken;
// Change password
const changePassword = async (userId, currentPassword, newPassword) => {
    try {
        // Get user with current password
        const user = await (0, users_prisma_1.getUserById)(userId);
        if (!user) {
            throw new Error("User not found");
        }
        // Get user with password for verification
        const userWithPassword = await (0, users_prisma_1.getUserByEmail)(user.email);
        if (!userWithPassword || !userWithPassword.password) {
            throw new Error("User not found");
        }
        // Verify current password
        const isValidPassword = await bcryptjs_1.default.compare(currentPassword, userWithPassword.password);
        if (!isValidPassword) {
            throw new Error("Current password is incorrect");
        }
        // Hash new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password in database
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword },
        });
        // Logout from all devices for security
        await (0, exports.logoutAll)(userId);
    }
    catch (error) {
        console.error("Error changing password:", error);
        throw error;
    }
};
exports.changePassword = changePassword;
// Reset password (for forgot password functionality)
const resetPassword = async (email, newPassword, _resetToken) => {
    try {
        // In a real implementation, you would verify the reset token here
        // For now, we'll just update the password
        const user = await (0, users_prisma_1.getUserByEmail)(email);
        if (!user) {
            throw new Error("User not found");
        }
        // Hash new password
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Update password in database
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword },
        });
        // Logout from all devices for security
        await (0, exports.logoutAll)(user.id);
    }
    catch (error) {
        console.error("Error resetting password:", error);
        throw error;
    }
};
exports.resetPassword = resetPassword;
// Clean up expired refresh tokens (should be run periodically)
const cleanupExpiredTokens = async () => {
    try {
        await prisma_1.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }
    catch (error) {
        console.error("Error cleaning up expired tokens:", error);
    }
};
exports.cleanupExpiredTokens = cleanupExpiredTokens;
