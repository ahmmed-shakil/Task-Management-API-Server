import teamService from "../services/teamService";
import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { RequestUser, CreateTeamData } from "../types/index";
import socketService from "../config/socket";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
}

class TeamController {
  async getAllTeams(
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

      const result = await teamService.getAllTeams(req.query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTeam(
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

      // Set the current user as the leader if not specified
      const teamData: CreateTeamData = {
        ...req.body,
        leaderId: req.body.leaderId || req.user.id,
      };

      const result = await teamService.createTeam(teamData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTeamById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await teamService.getTeamById(req.params.id!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTeam(
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

      const result = await teamService.updateTeam(req.params.id!, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTeam(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await teamService.deleteTeam(req.params.id!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTeamMembers(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await teamService.getTeamMembers(req.params.id!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async addTeamMember(
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

      const result = await teamService.addTeamMember(
        req.params.id!,
        req.body.userId,
        req.body.role
      );

      // Emit real-time event for team member addition
      if (result.success && result.data) {
        socketService.emitTeamMemberAdded(req.params.id!, result.data);
      }

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async removeTeamMember(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await teamService.removeTeamMember(
        req.params.id!,
        req.params.userId!
      );

      // Emit real-time event for team member removal
      if (result.success) {
        socketService.emitTeamMemberRemoved(req.params.id!, req.params.userId!);
      }

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getUserTeams(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await teamService.getUserTeams(req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default new TeamController();
