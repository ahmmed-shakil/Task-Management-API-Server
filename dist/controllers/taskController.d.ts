import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
}
declare class TaskController {
    getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTaskById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTask(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTasksByProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTaskComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTaskComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addTaskAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTaskAttachments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTaskAttachment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: TaskController;
export default _default;
