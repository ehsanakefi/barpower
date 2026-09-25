interface Notification {
  id: string;
  userId: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'document' | 'system';
}

// Mock notifications data
let mockNotifications: Notification[] = [
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
  async getNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let notifications = mockNotifications.filter(n => n.userId === userId);
    
    if (unreadOnly) {
      notifications = notifications.filter(n => !n.read);
    }
    
    return notifications;
  }

  async markAsRead(id: string): Promise<Notification> {
    const notification = mockNotifications.find(n => n.id === id);
    if (!notification) {
      throw new Error('Notification not found');
    }
    
    notification.read = true;
    return notification;
  }

  async markAllAsRead(userId: string): Promise<void> {
    mockNotifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return mockNotifications.filter(n => n.userId === userId && !n.read).length;
  }

  async createNotification(userId: string, message: string, type: Notification['type']): Promise<Notification> {
    const newNotification: Notification = {
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

export const notificationsService = new NotificationsService();
