import * as notificationMethods from "../methods/notifications.prisma";
import { NotificationFilters } from "../types/index";

class NotificationService {
  async getNotifications(userId: string, query: any) {
    try {
      const { page = 1, limit = 10, isRead, type } = query;

      // Create filter object matching the shape expected by the method
      const filters: NotificationFilters = {
        page: parseInt(typeof page === "string" ? page : String(page)),
        limit: parseInt(typeof limit === "string" ? limit : String(limit)),
        isRead:
          isRead === "true" ? true : isRead === "false" ? false : undefined,
        type: type || undefined,
      };

      const result = await notificationMethods.getNotificationsByUserId(
        userId,
        filters
      );

      return {
        success: true,
        message: "Notifications retrieved successfully",
        data: result,
      };
    } catch (error: any) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }

  async getNotificationById(id: string, userId: string) {
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
    } catch (error: any) {
      throw new Error(`Failed to get notification: ${error.message}`);
    }
  }

  async createNotification(notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }) {
    try {
      const notification = await notificationMethods.createNotification(
        notificationData
      );

      return {
        success: true,
        message: "Notification created successfully",
        data: notification,
      };
    } catch (error: any) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  async markAsRead(id: string, userId: string) {
    try {
      // First check if notification exists and belongs to user
      const existingNotification =
        await notificationMethods.getNotificationById(id);

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
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  }

  async markAllAsRead(userId: string) {
    try {
      const count = await notificationMethods.markAllNotificationsAsRead(
        userId
      );

      return {
        success: true,
        message: `${count} notifications marked as read`,
        data: { count },
      };
    } catch (error: any) {
      throw new Error(
        `Failed to mark all notifications as read: ${error.message}`
      );
    }
  }

  async deleteNotification(id: string, userId: string) {
    try {
      // First check if notification exists and belongs to user
      const existingNotification =
        await notificationMethods.getNotificationById(id);

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
    } catch (error: any) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  }

  async getUnreadCount(userId: string) {
    try {
      const count = await notificationMethods.getUnreadNotificationCount(
        userId
      );

      return {
        success: true,
        message: "Unread count retrieved successfully",
        data: { count },
      };
    } catch (error: any) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }
  }
}

export default new NotificationService();
