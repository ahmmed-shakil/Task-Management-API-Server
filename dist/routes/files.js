"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const fileController_1 = __importDefault(require("../controllers/fileController"));
const fileService_1 = __importDefault(require("../services/fileService"));
const router = (0, express_1.Router)();
// Validation rules
const fileIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("File ID must be a valid UUID"),
];
const taskIdValidation = [
    (0, express_validator_1.param)("taskId").isUUID().withMessage("Task ID must be a valid UUID"),
];
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Configure multer for file uploads
const upload = fileService_1.default.configureMulter();
// File routes
router.post("/upload", upload.single("file"), fileController_1.default.uploadFile, fileController_1.default.handleFileUploadError);
router.get("/:id", fileIdValidation, validation_1.validateRequest, fileController_1.default.getFileById);
router.get("/:id/download", fileIdValidation, validation_1.validateRequest, fileController_1.default.downloadFile);
router.get("/task/:taskId", taskIdValidation, validation_1.validateRequest, fileController_1.default.getFilesByTaskId);
router.delete("/:id", fileIdValidation, validation_1.validateRequest, fileController_1.default.deleteFile);
exports.default = router;
