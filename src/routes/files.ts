import { Router } from "express";
import { param } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import fileController from "../controllers/fileController";
import fileService from "../services/fileService";

const router = Router();

// Validation rules
const fileIdValidation = [
  param("id").isUUID().withMessage("File ID must be a valid UUID"),
];

const taskIdValidation = [
  param("taskId").isUUID().withMessage("Task ID must be a valid UUID"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const upload = fileService.configureMulter();

// File routes
router.post(
  "/upload",
  upload.single("file"),
  fileController.uploadFile as any,
  fileController.handleFileUploadError as any
);

router.get(
  "/:id",
  fileIdValidation,
  validateRequest,
  fileController.getFileById as any
);

router.get(
  "/:id/download",
  fileIdValidation,
  validateRequest,
  fileController.downloadFile as any
);

router.get(
  "/task/:taskId",
  taskIdValidation,
  validateRequest,
  fileController.getFilesByTaskId as any
);

router.delete(
  "/:id",
  fileIdValidation,
  validateRequest,
  fileController.deleteFile as any
);

export default router;
