import express from 'express';
import { getActiveNotifications, markNotificationsAsRead, getUnreadNotificationCount } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getActiveNotifications);
router.get('/unread-count', protect, getUnreadNotificationCount);
router.put('/read', protect, markNotificationsAsRead);

export default router;
