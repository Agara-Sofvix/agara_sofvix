import { Request, Response } from 'express';
import Notification from '../models/Notification';

// @desc    Get active notifications for users
// @route   GET /api/notifications
// @access  Public
export const getActiveNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find({ isActive: true }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read
// @access  Private
export const markNotificationsAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await import('../models/User').then(m => m.default.findById((req as any).user._id));

        if (user) {
            user.lastNotificationReadAt = new Date();
            await user.save();
            res.json({ message: 'Notifications marked as read', lastNotificationReadAt: user.lastNotificationReadAt });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
