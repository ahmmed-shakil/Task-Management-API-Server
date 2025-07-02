import { Router } from "express";
import { body, param } from "express-validator";
import { authenticateToken } from "../middleware/auth";
import { validateRequest } from "../middleware/validation";
import notificationController from "../controllers/notificationController";

const router = Router();

// Validation rules
const createNotificationValidation = [
  body("userId")
    .optional()
    .isUUID()
    .withMessage("User ID must be a valid UUID"),
  body("type").trim().notEmpty().withMessage("Notification type is required"),
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
];

const notificationIdValidation = [
  param("id").isUUID().withMessage("Notification ID must be a valid UUID"),
];

// Apply authentication to all routes
router.use(authenticateToken);

// Notification routes
router.get("/", notificationController.getNotifications as any);
router.get("/unread-count", notificationController.getUnreadCount as any);
router.post(
  "/",
  createNotificationValidation,
  validateRequest,
  notificationController.createNotification as any
);
router.get(
  "/:id",
  notificationIdValidation,
  validateRequest,
  notificationController.getNotificationById as any
);
router.put(
  "/:id/read",
  notificationIdValidation,
  validateRequest,
  notificationController.markAsRead as any
);
router.put("/read-all", notificationController.markAllAsRead as any);
router.delete(
  "/:id",
  notificationIdValidation,
  validateRequest,
  notificationController.deleteNotification as any
);

export default router;
