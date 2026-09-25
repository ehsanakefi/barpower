"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const notifications_service_1 = require("../services/notifications.service");
const getNotifications = async (req, res) => {
    try {
        const { userId, unreadOnly } = req.query;
        const notifications = await notifications_service_1.notificationsService.getNotifications(userId, unreadOnly === 'true');
        res.json({ success: true, data: notifications });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch notifications',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const notification = await notifications_service_1.notificationsService.markAsRead(String(id));
        res.json({ success: true, data: notification });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const { userId } = req.body;
        await notifications_service_1.notificationsService.markAllAsRead(userId);
        res.json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark all notifications as read',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.markAllAsRead = markAllAsRead;
const getUnreadCount = async (req, res) => {
    try {
        const { userId } = req.query;
        const count = await notifications_service_1.notificationsService.getUnreadCount(userId);
        res.json({ success: true, data: { count } });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch unread count',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getUnreadCount = getUnreadCount;
