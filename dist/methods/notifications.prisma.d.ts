import { Notification, NotificationFilters } from "../types/index";
export declare const getNotificationsByUserId: (userId: string, filters?: NotificationFilters) => Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
}>;
export declare const getNotificationById: (id: string) => Promise<Notification | null>;
export declare const createNotification: (notificationData: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: any;
}) => Promise<Notification>;
export declare const markNotificationAsRead: (id: string) => Promise<Notification | null>;
export declare const markAllNotificationsAsRead: (userId: string) => Promise<number>;
export declare const deleteNotification: (id: string) => Promise<void>;
export declare const getUnreadNotificationCount: (userId: string) => Promise<number>;
