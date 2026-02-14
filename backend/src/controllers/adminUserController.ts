import { Request, Response } from 'express';
import User from '../models/User';
import TournamentResult from '../models/TournamentResult';
import TypingResult from '../models/TypingResult';
import AuditLog from '../models/AuditLog';

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private (Admin)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const banned = req.query.banned as string;

        const skip = (page - 1) * limit;

        // Build query
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        if (banned === 'true') {
            query.isBanned = true;
        } else if (banned === 'false') {
            query.isBanned = false;
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
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

// @desc    Get user statistics
// @route   GET /api/admin/users/stats
// @access  Private (Admin)
export const getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const totalUsers = await User.countDocuments();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        startOfWeek.setHours(0, 0, 0, 0);

        // Active today: unique users who had any result today
        const activeTodayTournaments = await TournamentResult.distinct('user', { createdAt: { $gte: startOfToday } });
        const activeTodayTyping = await TypingResult.distinct('user', { createdAt: { $gte: startOfToday } });

        const activeTodaySet = new Set([
            ...activeTodayTournaments.map(id => id.toString()),
            ...activeTodayTyping.map(id => id.toString())
        ]);
        const activeToday = activeTodaySet.size;

        const newThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } });

        res.json({
            totalUsers,
            activeToday,
            newThisWeek,
            reportedIssues: 0, // Placeholder for now
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Get user stats
        const tournamentResults = await TournamentResult.find({ user: user._id })
            .populate('tournament', 'name')
            .sort({ createdAt: -1 })
            .limit(20);

        const typingResults = await TypingResult.find({ user: user._id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            user,
            tournamentResults,
            typingResults
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        await User.findByIdAndDelete(req.params.id);

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'DELETE_USER',
            targetType: 'User',
            targetId: req.params.id,
            metadata: { username: user.username, email: user.email },
            ipAddress: req.ip,
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin)
export const toggleUserBan = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        user.isBanned = !user.isBanned;
        await user.save();

        // Log the action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: user.isBanned ? 'BAN_USER' : 'UNBAN_USER',
            targetType: 'User',
            targetId: req.params.id,
            metadata: { username: user.username, newStatus: user.isBanned },
            ipAddress: req.ip,
        });

        res.json({
            message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
            user: {
                _id: user._id,
                username: user.username,
                isBanned: user.isBanned,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
