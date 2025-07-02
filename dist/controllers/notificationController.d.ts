import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
}
declare class NotificationController {
    getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getNotificationById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteNotification(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: NotificationController;
export default _default;
