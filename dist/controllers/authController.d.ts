import { Request, Response, NextFunction } from "express";
declare class AuthController {
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
    register(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    login(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    logout(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    resetPassword(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    getProfile(req: Request, res: Response, next: NextFunction): Promise<void>;
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
    changePassword(req: Request, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: AuthController;
export default _default;
