import taskService from "../services/taskService";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class TaskController {
  async getAllTasks(
    req: Request,
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

      const result = await taskService.getAllTasks(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTask(
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

      const result = await taskService.createTask(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.getTaskById(req.params.id!, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(
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

      const result = await taskService.updateTask(
        req.params.id!,
        req.user.id,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.deleteTask(req.params.id!, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTasksByProject(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.getTasksByProject(
        req.params.projectId!,
        req.user.id,
        req.query.status as any
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTasks(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.getUserTasks(req.user.id, req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addTaskComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { content } = req.body;
      const result = await taskService.addTaskComment(
        req.params.id!,
        req.user.id,
        content
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskComments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await taskService.getTaskComments(
        req.params.id!,
        req.user.id,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTaskComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { content } = req.body;
      const result = await taskService.updateTaskComment(
        req.params.commentId!,
        req.user!.id,
        content
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTaskComment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.deleteTaskComment(req.params.commentId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addTaskAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.addTaskAttachment(
        req.params.id!,
        req.user.id,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskAttachments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.getTaskAttachments(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTaskAttachment(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await taskService.deleteTaskAttachment(
        req.params.attachmentId!
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TaskController();
