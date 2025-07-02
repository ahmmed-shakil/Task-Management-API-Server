import fileService from "../services/fileService";
import { Request, Response, NextFunction } from "express";
import { RequestUser } from "../types/index";
import multer from "multer";

interface AuthenticatedRequest extends Request {
  user: RequestUser;
  file?: Express.Multer.File;
}

class FileController {
  // Upload file
  async uploadFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
          data: null,
        });
        return;
      }

      if (!req.body.taskId) {
        res.status(400).json({
          success: false,
          message: "Task ID is required",
          data: null,
        });
        return;
      }

      const result = await fileService.uploadFile(
        req.body.taskId,
        req.user.id,
        req.file
      );
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  // Get file by ID
  async getFileById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await fileService.getFileById(req.params.id!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Download file
  async downloadFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const fileResult = await fileService.getFileById(req.params.id!);

      if (!fileResult.success || !fileResult.data) {
        res.status(404).json({
          success: false,
          message: "File not found",
          data: null,
        });
        return;
      }

      const file = fileResult.data;

      // Set content disposition and send the file
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.originalName}"`
      );
      res.setHeader("Content-Type", file.mimeType);

      fileService.serveFile(file.filePath, res);
    } catch (error) {
      next(error);
    }
  }

  // Get files by task ID
  async getFilesByTaskId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await fileService.getFilesByTaskId(req.params.taskId!);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Delete file
  async deleteFile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await fileService.deleteFile(req.params.id!, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // Handle file upload errors
  handleFileUploadError(
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      res.status(400).json({
        success: false,
        message: `File upload error: ${err.message}`,
        data: null,
      });
    } else {
      // An unknown error occurred
      next(err);
    }
  }
}

export default new FileController();
