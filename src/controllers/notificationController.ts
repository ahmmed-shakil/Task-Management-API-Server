import notificationService from "../services/notificationService";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
import socketService from "../config/socket";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class NotificationController {
  async getNotifications(
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

      const result = await notificationService.getNotifications(
        req.user.id,
        req.query
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getNotificationById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await notificationService.getNotificationById(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createNotification(
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

      // Set the current user as the recipient if not specified
      const notificationData = {
        ...req.body,
        userId: req.body.userId || req.user.id,
      };

      const result = await notificationService.createNotification(
        notificationData
      );

      // Emit real-time notification to the user
      if (result.success && result.data) {
        socketService.emitNotificationToUser(
          notificationData.userId,
          result.data
        );
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await notificationService.markAsRead(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await notificationService.markAllAsRead(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteNotification(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await notificationService.deleteNotification(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await notificationService.getUnreadCount(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
