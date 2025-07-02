import projectService from "../services/projectService";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class ProjectController {
  async getAllProjects(
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

      const result = await projectService.getAllProjects(
        req.user.id,
        req.query
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createProject(
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

      const result = await projectService.createProject(req.user.id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await projectService.getProjectById(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateProject(
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

      const result = await projectService.updateProject(
        req.params.id!,
        req.user.id,
        req.body
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteProject(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await projectService.deleteProject(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProjectMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await projectService.getProjectMembers(
        req.params.id!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addProjectMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await projectService.addProjectMember(
        req.params.id!,
        req.user.id,
        req.body
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeProjectMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await projectService.removeProjectMember(
        req.params.id!,
        req.params.memberId!,
        req.user.id
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserProjects(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await projectService.getUserProjects(
        req.user.id,
        page,
        limit
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new ProjectController();
