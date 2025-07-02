"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveUploadedFile = exports.deleteFileAttachment = exports.createFileAttachment = exports.getFileAttachmentsByTaskId = exports.getFileAttachmentById = void 0;
const prisma_1 = require("../config/prisma");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
// Helper function to map Prisma task attachment to FileAttachment interface
const mapPrismaAttachmentToFileAttachment = (prismaAttachment) => {
    return {
        id: prismaAttachment.id,
        taskId: prismaAttachment.taskId,
        userId: prismaAttachment.userId,
        fileName: prismaAttachment.fileName,
        originalName: prismaAttachment.originalName,
        filePath: prismaAttachment.filePath,
        fileSize: prismaAttachment.fileSize,
        mimeType: prismaAttachment.mimeType,
        createdAt: prismaAttachment.createdAt,
    };
};
// Get file attachment by ID
const getFileAttachmentById = async (id) => {
    try {
        const attachment = await prisma_1.prisma.taskAttachment.findUnique({
            where: { id },
            include: {
                task: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!attachment) {
            return null;
        }
        return mapPrismaAttachmentToFileAttachment(attachment);
    }
    catch (error) {
        console.error("Error getting file attachment by ID:", error);
        throw new Error("Failed to get file attachment");
    }
};
exports.getFileAttachmentById = getFileAttachmentById;
// Get file attachments by task ID
const getFileAttachmentsByTaskId = async (taskId) => {
    try {
        const attachments = await prisma_1.prisma.taskAttachment.findMany({
            where: { taskId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return attachments.map(mapPrismaAttachmentToFileAttachment);
    }
    catch (error) {
        console.error("Error getting file attachments by task ID:", error);
        throw new Error("Failed to get file attachments");
    }
};
exports.getFileAttachmentsByTaskId = getFileAttachmentsByTaskId;
// Create file attachment
const createFileAttachment = async (data) => {
    try {
        const attachment = await prisma_1.prisma.taskAttachment.create({
            data: {
                taskId: data.taskId,
                userId: data.userId,
                fileName: data.fileName,
                originalName: data.originalName,
                filePath: data.filePath,
                fileSize: data.fileSize,
                mimeType: data.mimeType,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return mapPrismaAttachmentToFileAttachment(attachment);
    }
    catch (error) {
        console.error("Error creating file attachment:", error);
        throw new Error("Failed to create file attachment");
    }
};
exports.createFileAttachment = createFileAttachment;
// Delete file attachment
const deleteFileAttachment = async (id) => {
    try {
        // Get the file path before deleting
        const attachment = await prisma_1.prisma.taskAttachment.findUnique({
            where: { id },
            select: { filePath: true },
        });
        if (!attachment) {
            throw new Error("File attachment not found");
        }
        // Delete from database
        await prisma_1.prisma.taskAttachment.delete({
            where: { id },
        });
        // Delete file from disk
        const filePath = path_1.default.join(process.cwd(), attachment.filePath);
        if (fs_1.default.existsSync(filePath)) {
            fs_1.default.unlinkSync(filePath);
        }
    }
    catch (error) {
        console.error("Error deleting file attachment:", error);
        throw new Error("Failed to delete file attachment");
    }
};
exports.deleteFileAttachment = deleteFileAttachment;
// Save uploaded file to disk
const saveUploadedFile = async (file, taskId, userId) => {
    try {
        const uploadDir = path_1.default.join(process.cwd(), "uploads");
        // Create uploads directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        // Generate unique filename
        const uniqueFilename = `${(0, uuid_1.v4)()}-${file.originalname.replace(/\s+/g, "-")}`;
        const filePath = path_1.default.join("uploads", uniqueFilename);
        const fullPath = path_1.default.join(process.cwd(), filePath);
        // Write file to disk
        fs_1.default.writeFileSync(fullPath, file.buffer);
        // Save file metadata to database
        const fileData = {
            taskId,
            userId,
            fileName: uniqueFilename,
            originalName: file.originalname,
            filePath: filePath.replace(/\\/g, "/"), // Normalize path for storage
            fileSize: file.size,
            mimeType: file.mimetype,
        };
        return await (0, exports.createFileAttachment)(fileData);
    }
    catch (error) {
        console.error("Error saving uploaded file:", error);
        throw new Error("Failed to save uploaded file");
    }
};
exports.saveUploadedFile = saveUploadedFile;
