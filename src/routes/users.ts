import { Router } from "express";
import { body, param } from "express-validator";
import userController from "../controllers/userController";
import {
  authenticateToken,
  authorizeRoles,
  optionalAuth,
} from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Validation rules
const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
];

const updateUserValidation = [
  param("id").isUUID().withMessage("Invalid user ID format"),
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  body("role")
    .optional()
    .isIn(["admin", "user"])
    .withMessage("Role must be either admin or user"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean value"),
];

const userIdValidation = [
  param("id").isUUID().withMessage("Invalid user ID format"),
];

const checkEmailValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

// Routes

// Get current user profile
router.get("/profile", authenticateToken, userController.getProfile as any);

// Update current user profile
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  validateRequest,
  userController.updateProfile as any
);

// Get user statistics
router.get("/stats", authenticateToken, userController.getUserStats as any);

// Check email availability (can be used without authentication)
router.post(
  "/check-email",
  optionalAuth,
  checkEmailValidation,
  validateRequest,
  userController.checkEmailAvailability as any
);

// Admin only routes
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  userController.getAllUsers as any
);

// Get user by ID (admin only)
router.get(
  "/:id",
  authenticateToken,
  userIdValidation,
  validateRequest,
  authorizeRoles("admin"),
  userController.getUserById as any
);

// Update user (admin only or own profile)
router.put(
  "/:id",
  authenticateToken,
  updateUserValidation,
  validateRequest,
  userController.updateUser as any
);

// Deactivate user (admin only)
router.delete(
  "/:id",
  authenticateToken,
  userIdValidation,
  validateRequest,
  authorizeRoles("admin"),
  userController.deactivateUser as any
);

export default router;
