import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
}
declare class ProjectController {
    getAllProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getProjectMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    removeProjectMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getUserProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
declare const _default: ProjectController;
export default _default;
