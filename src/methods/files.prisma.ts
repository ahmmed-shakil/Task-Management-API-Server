import { prisma } from "../config/prisma";
import { FileAttachment, CreateFileAttachmentData } from "../types/index";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Helper function to map Prisma task attachment to FileAttachment interface
const mapPrismaAttachmentToFileAttachment = (
  prismaAttachment: any
): FileAttachment => {
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
export const getFileAttachmentById = async (
  id: string
): Promise<FileAttachment | null> => {
  try {
    const attachment = await prisma.taskAttachment.findUnique({
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
  } catch (error) {
    console.error("Error getting file attachment by ID:", error);
    throw new Error("Failed to get file attachment");
  }
};

// Get file attachments by task ID
export const getFileAttachmentsByTaskId = async (
  taskId: string
): Promise<FileAttachment[]> => {
  try {
    const attachments = await prisma.taskAttachment.findMany({
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
  } catch (error) {
    console.error("Error getting file attachments by task ID:", error);
    throw new Error("Failed to get file attachments");
  }
};

// Create file attachment
export const createFileAttachment = async (
  data: CreateFileAttachmentData
): Promise<FileAttachment> => {
  try {
    const attachment = await prisma.taskAttachment.create({
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
  } catch (error) {
    console.error("Error creating file attachment:", error);
    throw new Error("Failed to create file attachment");
  }
};

// Delete file attachment
export const deleteFileAttachment = async (id: string): Promise<void> => {
  try {
    // Get the file path before deleting
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id },
      select: { filePath: true },
    });

    if (!attachment) {
      throw new Error("File attachment not found");
    }

    // Delete from database
    await prisma.taskAttachment.delete({
      where: { id },
    });

    // Delete file from disk
    const filePath = path.join(process.cwd(), attachment.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error("Error deleting file attachment:", error);
    throw new Error("Failed to delete file attachment");
  }
};

// Save uploaded file to disk
export const saveUploadedFile = async (
  file: Express.Multer.File,
  taskId: string,
  userId: string
): Promise<FileAttachment> => {
  try {
    const uploadDir = path.join(process.cwd(), "uploads");

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname.replace(
      /\s+/g,
      "-"
    )}`;
    const filePath = path.join("uploads", uniqueFilename);
    const fullPath = path.join(process.cwd(), filePath);

    // Write file to disk
    fs.writeFileSync(fullPath, file.buffer);

    // Save file metadata to database
    const fileData: CreateFileAttachmentData = {
      taskId,
      userId,
      fileName: uniqueFilename,
      originalName: file.originalname,
      filePath: filePath.replace(/\\/g, "/"), // Normalize path for storage
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    return await createFileAttachment(fileData);
  } catch (error) {
    console.error("Error saving uploaded file:", error);
    throw new Error("Failed to save uploaded file");
  }
};
