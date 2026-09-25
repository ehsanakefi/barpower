"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const router = (0, express_1.Router)();
router.get('/', notifications_controller_1.getNotifications); // GET /api/notifications
router.get('/unread-count', notifications_controller_1.getUnreadCount); // GET /api/notifications/unread-count
router.put('/:id/read', notifications_controller_1.markAsRead); // PUT /api/notifications/:id/read
router.put('/read-all', notifications_controller_1.markAllAsRead); // PUT /api/notifications/read-all
exports.default = router;
