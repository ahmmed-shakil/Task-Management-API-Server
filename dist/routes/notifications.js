"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const router = (0, express_1.Router)();
// Validation rules
const createNotificationValidation = [
    (0, express_validator_1.body)("userId")
        .optional()
        .isUUID()
        .withMessage("User ID must be a valid UUID"),
    (0, express_validator_1.body)("type").trim().notEmpty().withMessage("Notification type is required"),
    (0, express_validator_1.body)("title").trim().notEmpty().withMessage("Title is required"),
    (0, express_validator_1.body)("message").trim().notEmpty().withMessage("Message is required"),
];
const notificationIdValidation = [
    (0, express_validator_1.param)("id").isUUID().withMessage("Notification ID must be a valid UUID"),
];
// Apply authentication to all routes
router.use(auth_1.authenticateToken);
// Notification routes
router.get("/", notificationController_1.default.getNotifications);
router.get("/unread-count", notificationController_1.default.getUnreadCount);
router.post("/", createNotificationValidation, validation_1.validateRequest, notificationController_1.default.createNotification);
router.get("/:id", notificationIdValidation, validation_1.validateRequest, notificationController_1.default.getNotificationById);
router.put("/:id/read", notificationIdValidation, validation_1.validateRequest, notificationController_1.default.markAsRead);
router.put("/read-all", notificationController_1.default.markAllAsRead);
router.delete("/:id", notificationIdValidation, validation_1.validateRequest, notificationController_1.default.deleteNotification);
exports.default = router;
