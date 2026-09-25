import { Request, Response } from 'express';
import { notificationsService } from '../services/notifications.service';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { userId, unreadOnly } = req.query;
    const notifications = await notificationsService.getNotifications(
      userId as string,
      unreadOnly === 'true'
    );
    res.json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch notifications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await notificationsService.markAsRead(String(id));
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark notification as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await notificationsService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all notifications as read',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const count = await notificationsService.getUnreadCount(userId as string);
    res.json({ success: true, data: { count } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch unread count',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
