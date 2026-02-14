import { Request, Response } from 'express';
import SystemEvent from '../models/SystemEvent';

// @desc    Get all system events
// @route   GET /api/admin/events
// @access  Private (Admin)
export const getSystemEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await SystemEvent.find().sort({ createdAt: -1 }).limit(100);
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark all system events as read
// @route   PUT /api/admin/events/read
// @access  Private (Admin)
export const markEventsAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        await SystemEvent.updateMany({ read: false }, { read: true });
        res.json({ message: 'All events marked as read' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
