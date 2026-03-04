import { Request, Response } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';

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
        const updatedUser = await User.findByIdAndUpdate(
            (req as any).user._id,
            { lastNotificationReadAt: new Date() },
            { new: true, runValidators: false }
        );

        if (updatedUser) {
            res.json({ message: 'Notifications marked as read', lastNotificationReadAt: updatedUser.lastNotificationReadAt });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Protected/Public (handled in controller)
export const getUnreadNotificationCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const lastRead = (req as any).user?.lastNotificationReadAt || new Date(0);
        const count = await Notification.countDocuments({
            isActive: true,
            createdAt: { $gt: lastRead }
        });
        res.json({ count });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
