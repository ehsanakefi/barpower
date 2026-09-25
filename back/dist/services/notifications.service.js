"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsService = void 0;
// Mock notifications data
let mockNotifications = [
    {
        id: '1',
        userId: '1',
        message: 'سند جدید TAV234-18/00 منتشر شد',
        timestamp: '2 ساعت پیش',
        read: false,
        type: 'document'
    },
    {
        id: '2',
        userId: '1',
        message: 'به‌روزرسانی دستورالعمل GIS',
        timestamp: '5 ساعت پیش',
        read: false,
        type: 'document'
    },
    {
        id: '3',
        userId: '1',
        message: 'بک‌آپ خودکار با موفقیت انجام شد',
        timestamp: '1 روز پیش',
        read: true,
        type: 'system'
    },
    {
        id: '4',
        userId: '1',
        message: 'سند TAV125-06/01 تایید شد',
        timestamp: '2 روز پیش',
        read: true,
        type: 'document'
    }
];
class NotificationsService {
    async getNotifications(userId, unreadOnly = false) {
        let notifications = mockNotifications.filter(n => n.userId === userId);
        if (unreadOnly) {
            notifications = notifications.filter(n => !n.read);
        }
        return notifications;
    }
    async markAsRead(id) {
        const notification = mockNotifications.find(n => n.id === id);
        if (!notification) {
            throw new Error('Notification not found');
        }
        notification.read = true;
        return notification;
    }
    async markAllAsRead(userId) {
        mockNotifications.forEach(n => {
            if (n.userId === userId) {
                n.read = true;
            }
        });
    }
    async getUnreadCount(userId) {
        return mockNotifications.filter(n => n.userId === userId && !n.read).length;
    }
    async createNotification(userId, message, type) {
        const newNotification = {
            id: String(mockNotifications.length + 1),
            userId,
            message,
            timestamp: 'الان',
            read: false,
            type
        };
        mockNotifications.unshift(newNotification);
        return newNotification;
    }
}
exports.notificationsService = new NotificationsService();
