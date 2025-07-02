import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
interface AuthenticatedRequest extends Request {
    user: RequestUser;
    file?: Express.Multer.File;
}
declare class FileController {
    uploadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getFileById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    downloadFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getFilesByTaskId(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteFile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    handleFileUploadError(err: Error, _req: Request, res: Response, next: NextFunction): void;
}
declare const _default: FileController;
export default _default;
