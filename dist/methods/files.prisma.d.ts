import { FileAttachment, CreateFileAttachmentData } from "../types/index";
export declare const getFileAttachmentById: (id: string) => Promise<FileAttachment | null>;
export declare const getFileAttachmentsByTaskId: (taskId: string) => Promise<FileAttachment[]>;
export declare const createFileAttachment: (data: CreateFileAttachmentData) => Promise<FileAttachment>;
export declare const deleteFileAttachment: (id: string) => Promise<void>;
export declare const saveUploadedFile: (file: Express.Multer.File, taskId: string, userId: string) => Promise<FileAttachment>;
