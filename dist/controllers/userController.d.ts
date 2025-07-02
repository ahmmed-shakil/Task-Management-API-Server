import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
}
declare class UserController {
    /**
     * @swagger
     * /api/users/profile:
     *   get:
     *     summary: Get user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User profile retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/User'
     */
    getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/profile:
     *   put:
     *     summary: Update user profile
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *               avatar:
     *                 type: string
     *     responses:
     *       200:
     *         description: Profile updated successfully
     */
    updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users:
     *   get:
     *     summary: Get all users (admin only)
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: page
     *         schema:
     *           type: integer
     *           default: 1
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           default: 10
     *       - in: query
     *         name: search
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Users retrieved successfully
     */
    getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/{id}:
     *   get:
     *     summary: Get user by ID
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: User retrieved successfully
     *       404:
     *         description: User not found
     */
    getUserById(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/{id}:
     *   put:
     *     summary: Update user (admin only or own profile)
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               firstName:
     *                 type: string
     *               lastName:
     *                 type: string
     *               avatar:
     *                 type: string
     *               role:
     *                 type: string
     *                 enum: [admin, user]
     *               isActive:
     *                 type: boolean
     *     responses:
     *       200:
     *         description: User updated successfully
     *       403:
     *         description: Insufficient permissions
     */
    updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/{id}:
     *   delete:
     *     summary: Deactivate user (admin only)
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *           format: uuid
     *     responses:
     *       200:
     *         description: User deactivated successfully
     *       403:
     *         description: Insufficient permissions
     */
    deactivateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/check-email:
     *   post:
     *     summary: Check email availability
     *     tags: [Users]
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
     *         description: Email availability checked
     */
    checkEmailAvailability(req: Request, res: Response, next: NextFunction): Promise<void>;
    /**
     * @swagger
     * /api/users/stats:
     *   get:
     *     summary: Get user statistics
     *     tags: [Users]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: User statistics retrieved successfully
     */
    getUserStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: UserController;
export default _default;
