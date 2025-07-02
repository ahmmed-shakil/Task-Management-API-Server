import userService from "../services/userService";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class UserController {
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
  async getProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.getUserProfile(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const result = await userService.updateUserProfile(req.user.id, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async getAllUsers(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.getAllUsers(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async getUserById(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.getUserById(req.params.id!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async updateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
        return;
      }

      const result = await userService.updateUser(
        req.params.id!,
        req.body,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async deactivateUser(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.deactivateUser(
        req.params.id!,
        req.user.id,
        req.user.role
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async checkEmailAvailability(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const excludeUserId = (req as any).user
        ? (req as any).user.id
        : undefined;
      const result = await userService.checkEmailAvailability(
        email,
        excludeUserId
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

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
  async getUserStats(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await userService.getUserStats(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
