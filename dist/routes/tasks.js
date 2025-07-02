"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const taskController_1 = __importDefault(require("../controllers/taskController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Validation rules
const createTaskValidation = [
    (0, express_validator_1.body)("title")
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage("Task title must be between 2 and 200 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description must not exceed 1000 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["todo", "in-progress", "in-review", "completed"])
        .withMessage("Status must be one of: todo, in-progress, in-review, completed"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Priority must be one of: low, medium, high, urgent"),
    (0, express_validator_1.body)("projectId").isUUID().withMessage("Project ID must be a valid UUID"),
    (0, express_validator_1.body)("assigneeId")
        .optional()
        .isUUID()
        .withMessage("Assignee ID must be a valid UUID"),
    (0, express_validator_1.body)("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("estimatedHours")
        .optional()
        .isNumeric()
        .withMessage("Estimated hours must be a number"),
    (0, express_validator_1.body)("tags").optional().isArray().withMessage("Tags must be an array"),
];
const updateTaskValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Task ID must be a valid UUID"),
    (0, express_validator_1.body)("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage("Task title must be between 2 and 200 characters"),
    (0, express_validator_1.body)("description")
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage("Description must not exceed 1000 characters"),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(["todo", "in-progress", "in-review", "completed"])
        .withMessage("Status must be one of: todo, in-progress, in-review, completed"),
    (0, express_validator_1.body)("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"])
        .withMessage("Priority must be one of: low, medium, high, urgent"),
    (0, express_validator_1.body)("assigneeId")
        .optional()
        .isUUID()
        .withMessage("Assignee ID must be a valid UUID"),
    (0, express_validator_1.body)("dueDate")
        .optional()
        .isISO8601()
        .withMessage("Due date must be a valid ISO 8601 date"),
    (0, express_validator_1.body)("estimatedHours")
        .optional()
        .isNumeric()
        .withMessage("Estimated hours must be a number"),
    (0, express_validator_1.body)("actualHours")
        .optional()
        .isNumeric()
        .withMessage("Actual hours must be a number"),
];
const taskIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Task ID must be a valid UUID"),
];
const commentValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Task ID must be a valid UUID"),
    (0, express_validator_1.body)("content")
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage("Comment content must be between 1 and 1000 characters"),
];
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Task routes
router.get("/", taskController_1.default.getAllTasks);
router.post("/", createTaskValidation, validation_1.validateRequest, taskController_1.default.createTask);
router.get("/:id", taskIdValidation, validation_1.validateRequest, taskController_1.default.getTaskById);
router.put("/:id", updateTaskValidation, validation_1.validateRequest, taskController_1.default.updateTask);
router.delete("/:id", taskIdValidation, validation_1.validateRequest, taskController_1.default.deleteTask);
// Task comment routes
router.get("/:id/comments", taskIdValidation, validation_1.validateRequest, taskController_1.default.getTaskComments);
router.post("/:id/comments", commentValidation, validation_1.validateRequest, taskController_1.default.addTaskComment);
// Task attachment routes
router.get("/:id/attachments", taskIdValidation, validation_1.validateRequest, taskController_1.default.getTaskAttachments);
exports.default = router;
