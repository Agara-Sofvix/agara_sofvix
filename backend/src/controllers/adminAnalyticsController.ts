import { Request, Response } from 'express';
import Tournament from '../models/Tournament';
import TournamentResult from '../models/TournamentResult';
import User from '../models/User';
import AuditLog from '../models/AuditLog';

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        // Total users
        const totalUsers = await User.countDocuments();
        const bannedUsers = await User.countDocuments({ isBanned: true });

        // Active tournaments
        const activeTournaments = await Tournament.countDocuments({ status: 'live' });

        // Total tournaments
        const totalTournaments = await Tournament.countDocuments();

        // Get average WPM (from all tournament results)
        const avgWpmResult = await TournamentResult.aggregate([
            { $group: { _id: null, avgWpm: { $avg: '$wpm' } } },
        ]);
        const avgWpm = avgWpmResult.length > 0 ? Math.round(avgWpmResult[0].avgWpm) : 0;

        // Recent activity (last 10 users)
        const recentUsers = await User.find()
            .select('name username createdAt')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            stats: {
                totalUsers,
                activeUsers: totalUsers - bannedUsers,
                bannedUsers,
                activeTournaments,
                totalTournaments,
                avgWpm,
            },
            recentUsers,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user analytics (growth over time)
// @route   GET /api/admin/analytics/users
// @access  Private (Admin)
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(userGrowth);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get performance analytics
// @route   GET /api/admin/analytics/performance
// @access  Private (Admin)
export const getPerformanceAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const days = parseInt(req.query.days as string) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const performanceTrends = await TournamentResult.aggregate([
            { $match: { createdAt: { $gte: startDate } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    avgWpm: { $avg: '$wpm' },
                    avgAccuracy: { $avg: '$accuracy' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json(performanceTrends);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
