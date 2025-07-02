"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadNotificationCount = exports.deleteNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.createNotification = exports.getNotificationById = exports.getNotificationsByUserId = void 0;
const prisma_1 = require("../config/prisma");
// Helper function to map Prisma notification to Notification interface
const mapPrismaNotificationToNotification = (prismaNotification) => {
    return {
        id: prismaNotification.id,
        user_id: prismaNotification.userId,
        type: prismaNotification.type,
        title: prismaNotification.title,
        message: prismaNotification.message,
        data: prismaNotification.data,
        is_read: prismaNotification.isRead,
        created_at: prismaNotification.createdAt,
    };
};
// Get all notifications for a user
const getNotificationsByUserId = async (userId, filters = {}) => {
    try {
        const { page = 1, limit = 10, isRead, type } = filters;
        const skip = (page - 1) * limit;
        const where = {
            userId,
            ...(isRead !== undefined && { isRead }),
            ...(type && { type }),
        };
        const [notifications, total] = await Promise.all([
            prisma_1.prisma.notification.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
            prisma_1.prisma.notification.count({ where }),
        ]);
        return {
            notifications: notifications.map(mapPrismaNotificationToNotification),
            total,
            page,
            limit,
        };
    }
    catch (error) {
        console.error("Error getting notifications:", error);
        throw new Error("Failed to get notifications");
    }
};
exports.getNotificationsByUserId = getNotificationsByUserId;
// Get notification by ID
const getNotificationById = async (id) => {
    try {
        const notification = await prisma_1.prisma.notification.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        if (!notification) {
            return null;
        }
        return mapPrismaNotificationToNotification(notification);
    }
    catch (error) {
        console.error("Error getting notification by ID:", error);
        throw new Error("Failed to get notification");
    }
};
exports.getNotificationById = getNotificationById;
// Create notification
const createNotification = async (notificationData) => {
    try {
        const notification = await prisma_1.prisma.notification.create({
            data: {
                userId: notificationData.userId,
                type: notificationData.type,
                title: notificationData.title,
                message: notificationData.message,
                data: notificationData.data || {},
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return mapPrismaNotificationToNotification(notification);
    }
    catch (error) {
        console.error("Error creating notification:", error);
        throw new Error("Failed to create notification");
    }
};
exports.createNotification = createNotification;
// Mark notification as read
const markNotificationAsRead = async (id) => {
    try {
        const notification = await prisma_1.prisma.notification.update({
            where: { id },
            data: { isRead: true },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });
        return mapPrismaNotificationToNotification(notification);
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        throw new Error("Failed to mark notification as read");
    }
};
exports.markNotificationAsRead = markNotificationAsRead;
// Mark all notifications as read for a user
const markAllNotificationsAsRead = async (userId) => {
    try {
        const result = await prisma_1.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        return result.count;
    }
    catch (error) {
        console.error("Error marking all notifications as read:", error);
        throw new Error("Failed to mark all notifications as read");
    }
};
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Delete notification
const deleteNotification = async (id) => {
    try {
        await prisma_1.prisma.notification.delete({
            where: { id },
        });
    }
    catch (error) {
        console.error("Error deleting notification:", error);
        throw new Error("Failed to delete notification");
    }
};
exports.deleteNotification = deleteNotification;
// Get unread count for a user
const getUnreadNotificationCount = async (userId) => {
    try {
        return await prisma_1.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }
    catch (error) {
        console.error("Error getting unread notification count:", error);
        throw new Error("Failed to get unread notification count");
    }
};
exports.getUnreadNotificationCount = getUnreadNotificationCount;
