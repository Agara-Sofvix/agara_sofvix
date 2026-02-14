import express from 'express';
import { getActiveNotifications, markNotificationsAsRead } from '../controllers/notificationController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/', getActiveNotifications);
router.put('/read', protect, markNotificationsAsRead);

export default router;
