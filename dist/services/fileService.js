"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileMethods = __importStar(require("../methods/files.prisma"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
class FileService {
    // Configure multer for file uploads
    configureMulter() {
        const storage = multer_1.default.memoryStorage();
        const fileFilter = (_req, file, cb) => {
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
            }
            else {
                cb(new Error("Invalid file type. Only images, documents, spreadsheets, and archives are allowed."));
            }
        };
        const limits = {
            fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // Default: 10MB
        };
        return (0, multer_1.default)({ storage, fileFilter, limits });
    }
    // Upload a file
    async uploadFile(taskId, userId, file) {
        try {
            const attachment = await fileMethods.saveUploadedFile(file, taskId, userId);
            return {
                success: true,
                message: "File uploaded successfully",
                data: attachment,
            };
        }
        catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
    // Get file by ID
    async getFileById(id) {
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
        }
        catch (error) {
            throw new Error(`Failed to get file: ${error.message}`);
        }
    }
    // Get files by task ID
    async getFilesByTaskId(taskId) {
        try {
            const files = await fileMethods.getFileAttachmentsByTaskId(taskId);
            return {
                success: true,
                message: "Files retrieved successfully",
                data: files,
            };
        }
        catch (error) {
            throw new Error(`Failed to get files: ${error.message}`);
        }
    }
    // Delete file
    async deleteFile(id, userId) {
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
        }
        catch (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    // Download file
    serveFile(filePath, res) {
        try {
            const absolutePath = path_1.default.join(process.cwd(), filePath);
            return res.sendFile(absolutePath);
        }
        catch (error) {
            throw new Error(`Failed to serve file: ${error.message}`);
        }
    }
}
exports.default = new FileService();
