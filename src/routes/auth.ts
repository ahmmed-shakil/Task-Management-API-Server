import { Router } from "express";
import { body } from "express-validator";
import authController from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";

const router = Router();

// Validation rules
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters long"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters long"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
];

const resetPasswordValidation = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Public routes
router.post(
  "/register",
  registerValidation,
  validateRequest,
  authController.register
);

router.post("/login", loginValidation, validateRequest, authController.login);

router.post("/refresh", authController.refreshToken);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword
);

router.post("/verify-email", authController.verifyEmail);

// Protected routes
router.post("/logout", authenticateToken, authController.logout);
router.get("/me", authenticateToken, authController.getProfile);
router.post(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  validateRequest,
  authController.changePassword
);

export default router;
