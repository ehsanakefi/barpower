import { Router } from 'express';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../controllers/notifications.controller';

const router = Router();

router.get('/', getNotifications);              // GET /api/notifications
router.get('/unread-count', getUnreadCount);    // GET /api/notifications/unread-count
router.put('/:id/read', markAsRead);            // PUT /api/notifications/:id/read
router.put('/read-all', markAllAsRead);         // PUT /api/notifications/read-all

export default router;
