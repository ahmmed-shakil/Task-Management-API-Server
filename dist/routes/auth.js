"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const authController_1 = __importDefault(require("../controllers/authController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Validation rules
const registerValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("firstName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),
    (0, express_validator_1.body)("lastName")
        .trim()
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),
];
const loginValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
const forgotPasswordValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
];
const resetPasswordValidation = [
    (0, express_validator_1.body)("token").notEmpty().withMessage("Reset token is required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
];
const changePasswordValidation = [
    (0, express_validator_1.body)("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    (0, express_validator_1.body)("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long"),
];
// Public routes
router.post("/register", registerValidation, validation_1.validateRequest, authController_1.default.register);
router.post("/login", loginValidation, validation_1.validateRequest, authController_1.default.login);
router.post("/refresh", authController_1.default.refreshToken);
router.post("/forgot-password", forgotPasswordValidation, validation_1.validateRequest, authController_1.default.forgotPassword);
router.post("/reset-password", resetPasswordValidation, validation_1.validateRequest, authController_1.default.resetPassword);
router.post("/verify-email", authController_1.default.verifyEmail);
// Protected routes
router.post("/logout", auth_1.authenticateToken, authController_1.default.logout);
router.get("/me", auth_1.authenticateToken, authController_1.default.getProfile);
router.post("/change-password", auth_1.authenticateToken, changePasswordValidation, validation_1.validateRequest, authController_1.default.changePassword);
exports.default = router;
