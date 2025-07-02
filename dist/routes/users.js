"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const userController_1 = __importDefault(require("../controllers/userController"));
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Validation rules
const updateProfileValidation = [
    (0, express_validator_1.body)("firstName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),
    (0, express_validator_1.body)("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
];
const updateUserValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Invalid user ID format"),
    (0, express_validator_1.body)("firstName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("First name must be at least 2 characters long"),
    (0, express_validator_1.body)("lastName")
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage("Last name must be at least 2 characters long"),
    (0, express_validator_1.body)("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
    (0, express_validator_1.body)("role")
        .optional()
        .isIn(["admin", "user"])
        .withMessage("Role must be either admin or user"),
    (0, express_validator_1.body)("isActive")
        .optional()
        .isBoolean()
        .withMessage("isActive must be a boolean value"),
];
const userIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Invalid user ID format"),
];
const checkEmailValidation = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email"),
];
// Routes
// Get current user profile
router.get("/profile", auth_1.authenticateToken, userController_1.default.getProfile);
// Update current user profile
router.put("/profile", auth_1.authenticateToken, updateProfileValidation, validation_1.validateRequest, userController_1.default.updateProfile);
// Get user statistics
router.get("/stats", auth_1.authenticateToken, userController_1.default.getUserStats);
// Check email availability (can be used without authentication)
router.post("/check-email", auth_1.optionalAuth, checkEmailValidation, validation_1.validateRequest, userController_1.default.checkEmailAvailability);
// Admin only routes
router.get("/", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("admin"), userController_1.default.getAllUsers);
// Get user by ID (admin only)
router.get("/:id", auth_1.authenticateToken, userIdValidation, validation_1.validateRequest, (0, auth_1.authorizeRoles)("admin"), userController_1.default.getUserById);
// Update user (admin only or own profile)
router.put("/:id", auth_1.authenticateToken, updateUserValidation, validation_1.validateRequest, userController_1.default.updateUser);
// Deactivate user (admin only)
router.delete("/:id", auth_1.authenticateToken, userIdValidation, validation_1.validateRequest, (0, auth_1.authorizeRoles)("admin"), userController_1.default.deactivateUser);
exports.default = router;
