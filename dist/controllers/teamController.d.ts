import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
}
declare class TeamController {
    getAllTeams(req: Request, res: Response, next: NextFunction): Promise<void>;
    createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTeamById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserTeams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: TeamController;
export default _default;
