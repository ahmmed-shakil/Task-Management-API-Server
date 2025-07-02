import multer from "multer";
import { Response } from "express";
declare class FileService {
    configureMulter(): multer.Multer;
    uploadFile(taskId: string, userId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        message: string;
        data: import("../types").FileAttachment;
    }>;
    getFileById(id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types").FileAttachment;
    }>;
    getFilesByTaskId(taskId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../types").FileAttachment[];
    }>;
    deleteFile(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    serveFile(filePath: string, res: Response): void;
}
declare const _default: FileService;
export default _default;
