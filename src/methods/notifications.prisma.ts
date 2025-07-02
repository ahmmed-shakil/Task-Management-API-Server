import { prisma } from "../config/prisma";
import { Notification, NotificationFilters } from "../types/index";
import { Prisma } from "../generated/prisma";

// Helper function to map Prisma notification to Notification interface
const mapPrismaNotificationToNotification = (
  prismaNotification: any
): Notification => {
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
export const getNotificationsByUserId = async (
  userId: string,
  filters: NotificationFilters = {}
): Promise<{
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const { page = 1, limit = 10, isRead, type } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(isRead !== undefined && { isRead }),
      ...(type && { type }),
    };

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
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
      prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map(mapPrismaNotificationToNotification),
      total,
      page,
      limit,
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new Error("Failed to get notifications");
  }
};

// Get notification by ID
export const getNotificationById = async (
  id: string
): Promise<Notification | null> => {
  try {
    const notification = await prisma.notification.findUnique({
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
  } catch (error) {
    console.error("Error getting notification by ID:", error);
    throw new Error("Failed to get notification");
  }
};

// Create notification
export const createNotification = async (notificationData: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}): Promise<Notification> => {
  try {
    const notification = await prisma.notification.create({
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
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  id: string
): Promise<Notification | null> => {
  try {
    const notification = await prisma.notification.update({
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
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read");
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: string
): Promise<number> => {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return result.count;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw new Error("Failed to mark all notifications as read");
  }
};

// Delete notification
export const deleteNotification = async (id: string): Promise<void> => {
  try {
    await prisma.notification.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error("Failed to delete notification");
  }
};

// Get unread count for a user
export const getUnreadNotificationCount = async (
  userId: string
): Promise<number> => {
  try {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw new Error("Failed to get unread notification count");
  }
};
