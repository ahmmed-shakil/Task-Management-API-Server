import { Router } from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import teamController from "../controllers/teamController";

const router = Router();

// Validation rules
const createTeamValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("leaderId")
    .optional()
    .isUUID()
    .withMessage("Leader ID must be a valid UUID"),
];

const updateTeamValidation = [
  param("id").isUUID().withMessage("Team ID must be a valid UUID"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Team name must be between 2 and 100 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must not exceed 500 characters"),
  body("leaderId")
    .optional()
    .isUUID()
    .withMessage("Leader ID must be a valid UUID"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const addMemberValidation = [
  param("id").isUUID().withMessage("Team ID must be a valid UUID"),
  body("userId").isUUID().withMessage("User ID must be a valid UUID"),
  body("role").optional().isString().withMessage("Role must be a string"),
];

const teamIdValidation = [
  param("id").isUUID().withMessage("Team ID must be a valid UUID"),
];

const memberIdValidation = [
  param("id").isUUID().withMessage("Team ID must be a valid UUID"),
  param("userId").isUUID().withMessage("User ID must be a valid UUID"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Team routes
router.get("/", teamController.getAllTeams as any);
router.post(
  "/",
  createTeamValidation,
  validateRequest,
  teamController.createTeam as any
);
router.get(
  "/:id",
  teamIdValidation,
  validateRequest,
  teamController.getTeamById as any
);
router.put(
  "/:id",
  updateTeamValidation,
  validateRequest,
  teamController.updateTeam as any
);
router.delete(
  "/:id",
  teamIdValidation,
  validateRequest,
  teamController.deleteTeam as any
);

// Team member routes
router.get(
  "/:id/members",
  teamIdValidation,
  validateRequest,
  teamController.getTeamMembers as any
);
router.post(
  "/:id/members",
  addMemberValidation,
  validateRequest,
  teamController.addTeamMember as any
);
router.delete(
  "/:id/members/:userId",
  memberIdValidation,
  validateRequest,
  teamController.removeTeamMember as any
);

// Get current user's teams
router.get("/user/me", teamController.getUserTeams as any);

export default router;
