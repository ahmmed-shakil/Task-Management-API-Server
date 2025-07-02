import { Router } from "express";
import { body, param } from "express-validator";
import projectController from "../controllers/projectController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Validation rules
const createProjectValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["planning", "active", "completed", "on-hold"])
    .withMessage("Status must be one of: planning, active, completed, on-hold"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date"),
  body("budget").optional().isNumeric().withMessage("Budget must be a number"),
];

const updateProjectValidation = [
  param("id").isUUID().withMessage("Project ID must be a valid UUID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Project name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("status")
    .optional()
    .isIn(["planning", "active", "completed", "on-hold"])
    .withMessage("Status must be one of: planning, active, completed, on-hold"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high", "urgent"])
    .withMessage("Priority must be one of: low, medium, high, urgent"),
];

const projectIdValidation = [
  param("id").isUUID().withMessage("Project ID must be a valid UUID"),
];

const memberValidation = [
  param("id").isUUID().withMessage("Project ID must be a valid UUID"),
  body("userId").isUUID().withMessage("User ID must be a valid UUID"),
  body("role")
    .optional()
    .isIn(["owner", "admin", "member", "viewer"])
    .withMessage("Role must be one of: owner, admin, member, viewer"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Project routes
router.get("/", projectController.getAllProjects as any);
router.post(
  "/",
  createProjectValidation,
  validateRequest,
  projectController.createProject as any
);
router.get(
  "/:id",
  projectIdValidation,
  validateRequest,
  projectController.getProjectById as any
);
router.put(
  "/:id",
  updateProjectValidation,
  validateRequest,
  projectController.updateProject as any
);
router.delete(
  "/:id",
  projectIdValidation,
  validateRequest,
  projectController.deleteProject as any
);

// Project member routes
router.get(
  "/:id/members",
  projectIdValidation,
  validateRequest,
  projectController.getProjectMembers as any
);
router.post(
  "/:id/members",
  memberValidation,
  validateRequest,
  projectController.addProjectMember as any
);
router.delete(
  "/:id/members/:userId",
  [
    param("id").isUUID().withMessage("Project ID must be a valid UUID"),
    param("userId").isUUID().withMessage("User ID must be a valid UUID"),
  ],
  validateRequest,
  projectController.removeProjectMember as any
);

export default router;
