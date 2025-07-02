import { Router } from "express";
import { body, param } from "express-validator";
import taskController from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Validation rules
const createTaskValidation = [
  body("title")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be between 2 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "in-review", "completed"])
    .withMessage(
      "Status must be one of: todo, in-progress, in-review, completed"
    ),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
  body("projectId").isUUID().withMessage("Project ID must be a valid UUID"),
  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Assignee ID must be a valid UUID"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
  body("estimatedHours")
    .optional()
    .isNumeric()
    .withMessage("Estimated hours must be a number"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
];

const updateTaskValidation = [
  param("id").isUUID().withMessage("Task ID must be a valid UUID"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Task title must be between 2 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("status")
    .optional()
    .isIn(["todo", "in-progress", "in-review", "completed"])
    .withMessage(
      "Status must be one of: todo, in-progress, in-review, completed"
    ),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
  body("assigneeId")
    .optional()
    .isUUID()
    .withMessage("Assignee ID must be a valid UUID"),
  body("dueDate")
    .optional()
    .isISO8601()
    .withMessage("Due date must be a valid ISO 8601 date"),
  body("estimatedHours")
    .optional()
    .isNumeric()
    .withMessage("Estimated hours must be a number"),
  body("actualHours")
    .optional()
    .isNumeric()
    .withMessage("Actual hours must be a number"),
];

const taskIdValidation = [
  param("id").isUUID().withMessage("Task ID must be a valid UUID"),
];

const commentValidation = [
  param("id").isUUID().withMessage("Task ID must be a valid UUID"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment content must be between 1 and 1000 characters"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Task routes
router.get("/", taskController.getAllTasks as any);
router.post(
  "/",
  createTaskValidation,
  validateRequest,
  taskController.createTask as any
);
router.get(
  "/:id",
  taskIdValidation,
  validateRequest,
  taskController.getTaskById as any
);
router.put(
  "/:id",
  updateTaskValidation,
  validateRequest,
  taskController.updateTask as any
);
router.delete(
  "/:id",
  taskIdValidation,
  validateRequest,
  taskController.deleteTask as any
);

// Task comment routes
router.get(
  "/:id/comments",
  taskIdValidation,
  validateRequest,
  taskController.getTaskComments as any
);
router.post(
  "/:id/comments",
  commentValidation,
  validateRequest,
  taskController.addTaskComment as any
);

// Task attachment routes
router.get(
  "/:id/attachments",
  taskIdValidation,
  validateRequest,
  taskController.getTaskAttachments as any
);

export default router;
