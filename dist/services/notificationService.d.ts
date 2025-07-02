declare class NotificationService {
    getNotifications(userId: string, query: any): Promise<{
        success: boolean;
        message: string;
        data: {
            notifications: import("../types/index").Notification[];
            total: number;
            page: number;
            limit: number;
        };
    }>;
    getNotificationById(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    } | {
        success: boolean;
        message: string;
        data: import("../types/index").Notification;
    }>;
    createNotification(notificationData: {
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
    }): Promise<{
        success: boolean;
        message: string;
        data: import("../types/index").Notification;
    }>;
    markAsRead(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../types/index").Notification | null;
    }>;
    markAllAsRead(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
    deleteNotification(id: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    getUnreadCount(userId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            count: number;
        };
    }>;
}
declare const _default: NotificationService;
export default _default;
