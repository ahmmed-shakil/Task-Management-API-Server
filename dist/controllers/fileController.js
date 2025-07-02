"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fileService_1 = __importDefault(require("../services/fileService"));
const multer_1 = __importDefault(require("multer"));
const socket_1 = __importDefault(require("../config/socket"));
class FileController {
    // Upload file
    async uploadFile(req, res, next) {
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
            const result = await fileService_1.default.uploadFile(req.body.taskId, req.user.id, req.file);
            // Emit real-time event for file upload
            if (result.success && result.data) {
                socket_1.default.emitFileUploaded(req.body.taskId, result.data);
            }
            res.status(201).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Get file by ID
    async getFileById(req, res, next) {
        try {
            const result = await fileService_1.default.getFileById(req.params.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Download file
    async downloadFile(req, res, next) {
        try {
            const fileResult = await fileService_1.default.getFileById(req.params.id);
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
            res.setHeader("Content-Disposition", `attachment; filename="${file.originalName}"`);
            res.setHeader("Content-Type", file.mimeType);
            fileService_1.default.serveFile(file.filePath, res);
        }
        catch (error) {
            next(error);
        }
    }
    // Get files by task ID
    async getFilesByTaskId(req, res, next) {
        try {
            const result = await fileService_1.default.getFilesByTaskId(req.params.taskId);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Delete file
    async deleteFile(req, res, next) {
        try {
            const result = await fileService_1.default.deleteFile(req.params.id, req.user.id);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // Handle file upload errors
    handleFileUploadError(err, _req, res, next) {
        if (err instanceof multer_1.default.MulterError) {
            // A Multer error occurred when uploading
            res.status(400).json({
                success: false,
                message: `File upload error: ${err.message}`,
                data: null,
            });
        }
        else {
            // An unknown error occurred
            next(err);
        }
    }
}
exports.default = new FileController();
