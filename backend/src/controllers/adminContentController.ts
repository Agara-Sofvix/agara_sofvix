import { Request, Response } from 'express';
import TamilText from '../models/TamilText';
import AuditLog from '../models/AuditLog';

// @desc    Get all Tamil texts
// @route   GET /api/admin/texts
// @access  Private (Admin)
export const getTexts = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const category = req.query.category as string;
        const skip = (page - 1) * limit;

        const query: any = {};
        if (category) {
            query.category = category;
        }

        const texts = await TamilText.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await TamilText.countDocuments(query);

        res.json({
            texts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new Tamil text
// @route   POST /api/admin/texts
// @access  Private (Admin)
export const addText = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, category, difficulty } = req.body;

        const text = await TamilText.create({
            content,
            category,
            difficulty,
        });

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'ADD_TEXT',
            targetType: 'TamilText',
            targetId: text._id,
            metadata: { category, difficulty },
            ipAddress: req.ip,
        });

        res.status(201).json(text);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Tamil text
// @route   PUT /api/admin/texts/:id
// @access  Private (Admin)
export const updateText = async (req: Request, res: Response): Promise<void> => {
    try {
        const { content, category, difficulty } = req.body;

        const text = await TamilText.findByIdAndUpdate(
            req.params.id,
            { content, category, difficulty },
            { new: true, runValidators: true }
        );

        if (!text) {
            res.status(404).json({ message: 'Text not found' });
            return;
        }

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'UPDATE_TEXT',
            targetType: 'TamilText',
            targetId: req.params.id,
            ipAddress: req.ip,
        });

        res.json(text);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Tamil text
// @route   DELETE /api/admin/texts/:id
// @access  Private (Admin)
export const deleteText = async (req: Request, res: Response): Promise<void> => {
    try {
        const text = await TamilText.findById(req.params.id);

        if (!text) {
            res.status(404).json({ message: 'Text not found' });
            return;
        }

        await TamilText.findByIdAndDelete(req.params.id);

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'DELETE_TEXT',
            targetType: 'TamilText',
            targetId: req.params.id,
            ipAddress: req.ip,
        });

        res.json({ message: 'Text deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
