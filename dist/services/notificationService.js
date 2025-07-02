"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const notificationMethods = __importStar(require("../methods/notifications.prisma"));
class NotificationService {
    async getNotifications(userId, query) {
        try {
            const { page = 1, limit = 10, isRead, type } = query;
            // Create filter object matching the shape expected by the method
            const filters = {
                page: parseInt(typeof page === 'string' ? page : String(page)),
                limit: parseInt(typeof limit === 'string' ? limit : String(limit)),
                isRead: isRead === "true" ? true :
                    isRead === "false" ? false : undefined,
                type: type || undefined
            };
            const result = await notificationMethods.getNotificationsByUserId(userId, filters);
            return {
                success: true,
                message: "Notifications retrieved successfully",
                data: result,
            };
        }
        catch (error) {
            throw new Error(`Failed to get notifications: ${error.message}`);
        }
    }
    async getNotificationById(id, userId) {
        try {
            const notification = await notificationMethods.getNotificationById(id);
            if (!notification) {
                return {
                    success: false,
                    message: "Notification not found",
                    data: null,
                };
            }
            // Check if the notification belongs to the user
            if (notification.user_id !== userId) {
                return {
                    success: false,
                    message: "Access denied",
                    data: null,
                };
            }
            return {
                success: true,
                message: "Notification retrieved successfully",
                data: notification,
            };
        }
        catch (error) {
            throw new Error(`Failed to get notification: ${error.message}`);
        }
    }
    async createNotification(notificationData) {
        try {
            const notification = await notificationMethods.createNotification(notificationData);
            return {
                success: true,
                message: "Notification created successfully",
                data: notification,
            };
        }
        catch (error) {
            throw new Error(`Failed to create notification: ${error.message}`);
        }
    }
    async markAsRead(id, userId) {
        try {
            // First check if notification exists and belongs to user
            const existingNotification = await notificationMethods.getNotificationById(id);
            if (!existingNotification) {
                return {
                    success: false,
                    message: "Notification not found",
                    data: null,
                };
            }
            if (existingNotification.user_id !== userId) {
                return {
                    success: false,
                    message: "Access denied",
                    data: null,
                };
            }
            const notification = await notificationMethods.markNotificationAsRead(id);
            return {
                success: true,
                message: "Notification marked as read",
                data: notification,
            };
        }
        catch (error) {
            throw new Error(`Failed to mark notification as read: ${error.message}`);
        }
    }
    async markAllAsRead(userId) {
        try {
            const count = await notificationMethods.markAllNotificationsAsRead(userId);
            return {
                success: true,
                message: `${count} notifications marked as read`,
                data: { count },
            };
        }
        catch (error) {
            throw new Error(`Failed to mark all notifications as read: ${error.message}`);
        }
    }
    async deleteNotification(id, userId) {
        try {
            // First check if notification exists and belongs to user
            const existingNotification = await notificationMethods.getNotificationById(id);
            if (!existingNotification) {
                return {
                    success: false,
                    message: "Notification not found",
                    data: null,
                };
            }
            if (existingNotification.user_id !== userId) {
                return {
                    success: false,
                    message: "Access denied",
                    data: null,
                };
            }
            await notificationMethods.deleteNotification(id);
            return {
                success: true,
                message: "Notification deleted successfully",
                data: null,
            };
        }
        catch (error) {
            throw new Error(`Failed to delete notification: ${error.message}`);
        }
    }
    async getUnreadCount(userId) {
        try {
            const count = await notificationMethods.getUnreadNotificationCount(userId);
            return {
                success: true,
                message: "Unread count retrieved successfully",
                data: { count },
            };
        }
        catch (error) {
            throw new Error(`Failed to get unread count: ${error.message}`);
        }
    }
}
exports.default = new NotificationService();
