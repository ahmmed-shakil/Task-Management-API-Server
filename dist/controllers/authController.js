"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const authService_1 = __importDefault(require("../services/authService"));
class AuthController {
    /**
     * @swagger
     * /api/auth/register:
     *   post:
     *     summary: Register a new user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *               - firstName
     *               - lastName
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *                 minLength: 6
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Success'
     *       400:
     *         description: Validation error
     *       409:
     *         description: User already exists
     */
    async register(req, res, next) {
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
            const userData = {
                email: req.body.email,
                password: req.body.password,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                role: req.body.role || "user",
            };
            const result = await authService_1.default.register(userData);
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: result.user,
                    tokens: result.tokens,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/login:
     *   post:
     *     summary: Login user
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login successful
     *       400:
     *         description: Validation error
     *       401:
     *         description: Invalid credentials
     */
    async login(req, res, next) {
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
            const credentials = {
                email: req.body.email,
                password: req.body.password,
            };
            const result = await authService_1.default.login(credentials);
            res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: result.user,
                    tokens: result.tokens,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - refreshToken
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Token refreshed successfully
     *       400:
     *         description: Invalid refresh token
     */
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                res.status(400).json({
                    success: false,
                    message: "Refresh token is required",
                });
                return;
            }
            const result = await authService_1.default.refreshToken(refreshToken);
            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: {
                    tokens: result,
                },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/logout:
     *   post:
     *     summary: Logout user
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Logout successful
     *       401:
     *         description: Unauthorized
     */
    async logout(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            await authService_1.default.logout(userId);
            res.status(200).json({
                success: true,
                message: "Logout successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/forgot-password:
     *   post:
     *     summary: Request password reset
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *             properties:
     *               email:
     *                 type: string
     *                 format: email
     *     responses:
     *       200:
     *         description: Password reset email sent
     *       404:
     *         description: User not found
     */
    async forgotPassword(req, res, next) {
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
            const { email } = req.body;
            await authService_1.default.forgotPassword(email);
            res.status(200).json({
                success: true,
                message: "Password reset email sent",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/reset-password:
     *   post:
     *     summary: Reset password
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *               - password
     *             properties:
     *               token:
     *                 type: string
     *               password:
     *                 type: string
     *                 minLength: 6
     *     responses:
     *       200:
     *         description: Password reset successful
     *       400:
     *         description: Invalid or expired token
     */
    async resetPassword(req, res, next) {
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
            const { token, password } = req.body;
            await authService_1.default.resetPassword(token, password);
            res.status(200).json({
                success: true,
                message: "Password reset successful",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/verify-email:
     *   post:
     *     summary: Verify email address
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - token
     *             properties:
     *               token:
     *                 type: string
     *     responses:
     *       200:
     *         description: Email verified successfully
     *       400:
     *         description: Invalid or expired token
     */
    async verifyEmail(req, res, next) {
        try {
            const { token } = req.body;
            if (!token) {
                res.status(400).json({
                    success: false,
                    message: "Verification token is required",
                });
                return;
            }
            await authService_1.default.verifyEmail(token);
            res.status(200).json({
                success: true,
                message: "Email verified successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current user profile
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *       401:
     *         description: Unauthorized
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const user = await authService_1.default.getUserProfile(userId);
            res.status(200).json({
                success: true,
                message: "User profile retrieved successfully",
                data: { user },
            });
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * @swagger
     * /api/auth/change-password:
     *   post:
     *     summary: Change user password
     *     tags: [Authentication]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - currentPassword
     *               - newPassword
     *             properties:
     *               currentPassword:
     *                 type: string
     *               newPassword:
     *                 type: string
     *                 minLength: 6
     *     responses:
     *       200:
     *         description: Password changed successfully
     *       400:
     *         description: Validation error or current password incorrect
     *       401:
     *         description: Unauthorized
     */
    async changePassword(req, res, next) {
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
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            await authService_1.default.changePassword(userId, currentPassword, newPassword);
            res.status(200).json({
                success: true,
                message: "Password changed successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new AuthController();
