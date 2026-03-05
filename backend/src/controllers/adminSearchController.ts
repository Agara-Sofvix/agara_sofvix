import { Request, Response } from 'express';
import User from '../models/User';
import Tournament from '../models/Tournament';
import AuditLog from '../models/AuditLog';

// @desc    Global search across users, tournaments, and logs
// @route   GET /api/admin/search
// @access  Private (Admin)
export const globalSearch = async (req: Request, res: Response): Promise<void> => {
    try {
        const query = req.query.q as string;
        if (!query || query.length < 2) {
            res.json({
                success: true,
                data: { users: [], tournaments: [], logs: [] }
            });
            return;
        }

        const searchRegex = { $regex: query, $options: 'i' };

        const [users, tournaments, logs] = await Promise.all([
            // Search Users
            User.find({
                $or: [
                    { name: searchRegex },
                    { username: searchRegex },
                    { email: searchRegex }
                ]
            })
                .select('name username email createdAt')
                .limit(5),

            // Search Tournaments
            Tournament.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            })
                .select('name status startDate endDate')
                .limit(5),

            // Search Audit Logs
            AuditLog.find({
                $or: [
                    { action: searchRegex },
                    { targetType: searchRegex },
                    { 'metadata.username': searchRegex }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(5)
        ]);

        res.json({
            success: true,
            data: {
                users,
                tournaments,
                logs
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Search failed', error: error.message });
    }
};
