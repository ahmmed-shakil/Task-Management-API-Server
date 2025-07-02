import * as fileMethods from "../methods/files.prisma";
import multer from "multer";
import path from "path";
import { Request, Response } from "express";

class FileService {
  // Configure multer for file uploads
  configureMulter() {
    const storage = multer.memoryStorage();

    const fileFilter = (
      _req: Request,
      file: Express.Multer.File,
      cb: multer.FileFilterCallback
    ) => {
      // Check file types, sizes, etc.
      const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/zip",
      ];

      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(
          new Error(
            "Invalid file type. Only images, documents, spreadsheets, and archives are allowed."
          )
        );
      }
    };

    const limits = {
      fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // Default: 10MB
    };

    return multer({ storage, fileFilter, limits });
  }

  // Upload a file
  async uploadFile(taskId: string, userId: string, file: Express.Multer.File) {
    try {
      const attachment = await fileMethods.saveUploadedFile(
        file,
        taskId,
        userId
      );

      return {
        success: true,
        message: "File uploaded successfully",
        data: attachment,
      };
    } catch (error: any) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  // Get file by ID
  async getFileById(id: string) {
    try {
      const file = await fileMethods.getFileAttachmentById(id);

      if (!file) {
        return {
          success: false,
          message: "File not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "File retrieved successfully",
        data: file,
      };
    } catch (error: any) {
      throw new Error(`Failed to get file: ${error.message}`);
    }
  }

  // Get files by task ID
  async getFilesByTaskId(taskId: string) {
    try {
      const files = await fileMethods.getFileAttachmentsByTaskId(taskId);

      return {
        success: true,
        message: "Files retrieved successfully",
        data: files,
      };
    } catch (error: any) {
      throw new Error(`Failed to get files: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(id: string, userId: string) {
    try {
      const file = await fileMethods.getFileAttachmentById(id);

      if (!file) {
        return {
          success: false,
          message: "File not found",
          data: null,
        };
      }

      // Check if the user is authorized to delete this file
      // Only file uploader or task owner/admin can delete
      if (file.userId !== userId) {
        // Check if user is admin or task owner - implement your own logic here
        const isAuthorized = false; // Replace with actual authorization check

        if (!isAuthorized) {
          return {
            success: false,
            message: "You are not authorized to delete this file",
            data: null,
          };
        }
      }

      await fileMethods.deleteFileAttachment(id);

      return {
        success: true,
        message: "File deleted successfully",
        data: null,
      };
    } catch (error: any) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  // Download file
  serveFile(filePath: string, res: Response) {
    try {
      const absolutePath = path.join(process.cwd(), filePath);
      return res.sendFile(absolutePath);
    } catch (error: any) {
      throw new Error(`Failed to serve file: ${error.message}`);
    }
  }
}

export default new FileService();
