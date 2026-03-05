import { Request, Response } from 'express';
import Notification from '../models/Notification';
import AuditLog from '../models/AuditLog';

// @desc    Get all notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const notifications = await Notification.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: notifications
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a notification
// @route   POST /api/admin/notifications
// @access  Private (Admin)
export const createNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, tag } = req.body;

        const notification = await Notification.create({
            title,
            description,
            tag
        });

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'CREATE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            metadata: { title },
            ipAddress: req.ip,
        });

        res.status(201).json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a notification
// @route   PUT /api/admin/notifications/:id
// @access  Private (Admin)
export const updateNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, tag, isActive } = req.body;
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        if (title) notification.title = title;
        if (description) notification.description = description;
        if (tag) notification.tag = tag;
        if (isActive !== undefined) notification.isActive = isActive;

        await notification.save();

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'UPDATE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            ipAddress: req.ip,
        });

        res.json({
            success: true,
            data: notification
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private (Admin)
export const deleteNotification = async (req: Request, res: Response): Promise<void> => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }

        await notification.deleteOne();

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'DELETE_NOTIFICATION',
            targetType: 'Notification',
            targetId: notification._id,
            ipAddress: req.ip,
        });

        res.json({ success: true, message: 'Notification removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
