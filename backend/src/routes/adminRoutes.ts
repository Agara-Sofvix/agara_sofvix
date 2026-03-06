import express from 'express';
import {
    getDashboardStats,
    getUserAnalytics,
    getPerformanceAnalytics,
} from '../controllers/adminAnalyticsController';
import {
    updateTournamentStatus,
    deleteTournament,
    getTournamentParticipants,
    removeLeaderboardScore,
    resetLeaderboard,
    exportLeaderboard,
    getAuditLogs,
    createTournament,
    updateTournament,
    getLeaderboard,
    toggleSuspiciousScore
} from '../controllers/adminTournamentController';
import { getUsers, getUserDetails, deleteUser, toggleUserBan, getUserStats } from '../controllers/adminUserController';
import { getTexts, addText, updateText, deleteText } from '../controllers/adminContentController';
import {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification
} from '../controllers/adminNotificationController';
import {
    getAdvertisements,
    addAdvertisement,
    updateAdvertisement,
    deleteAdvertisement
} from '../controllers/advertisementController';
import { getSystemEvents, markEventsAsRead, getUnreadEventsCount } from '../controllers/adminEventController';
import { globalSearch } from '../controllers/adminSearchController';
import { adminAuth } from '../middlewares/adminMiddleware';

const router = express.Router();

// Dashboard & Analytics
router.get('/dashboard/stats', adminAuth, getDashboardStats);
router.get('/analytics/users', adminAuth, getUserAnalytics);
router.get('/analytics/performance', adminAuth, getPerformanceAnalytics);
router.get('/search', adminAuth, globalSearch);

// User Management
router.get('/users/stats', adminAuth, getUserStats);
router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUserDetails);
router.put('/users/:id/ban', adminAuth, toggleUserBan);
router.delete('/users/:id', adminAuth, deleteUser);

// Tournament Management
router.put('/tournaments/:id/status', adminAuth, updateTournamentStatus);
router.delete('/tournaments/:id', adminAuth, deleteTournament);
router.get('/tournaments/:id/participants', adminAuth, getTournamentParticipants);
router.post('/tournaments', adminAuth, createTournament);
router.put('/tournaments/:id', adminAuth, updateTournament);

// Leaderboard Management
router.delete('/leaderboards/:resultId', adminAuth, removeLeaderboardScore);
router.put('/leaderboards/:resultId/flag', adminAuth, toggleSuspiciousScore);
router.post('/leaderboards/:tournamentId/reset', adminAuth, resetLeaderboard);
router.get('/leaderboards/:tournamentId/export', adminAuth, exportLeaderboard);
router.get('/leaderboards', adminAuth, getLeaderboard);

// Content Management
router.get('/texts', adminAuth, getTexts);
router.post('/texts', adminAuth, addText);
router.put('/texts/:id', adminAuth, updateText);
router.delete('/texts/:id', adminAuth, deleteText);

// System Logs
router.get('/logs', adminAuth, getAuditLogs);

// Notification Management
router.get('/notifications', adminAuth, getNotifications);
router.post('/notifications', adminAuth, createNotification);
router.put('/notifications/:id', adminAuth, updateNotification);
router.delete('/notifications/:id', adminAuth, deleteNotification);

// System Events
router.get('/events', adminAuth, getSystemEvents);
router.get('/events/unread-count', adminAuth, getUnreadEventsCount);
router.put('/events/read', adminAuth, markEventsAsRead);

// Advertisement Management
router.get('/advertisements', adminAuth, getAdvertisements);
router.post('/advertisements', adminAuth, addAdvertisement);
router.put('/advertisements/:id', adminAuth, updateAdvertisement);
router.delete('/advertisements/:id', adminAuth, deleteAdvertisement);

export default router;
