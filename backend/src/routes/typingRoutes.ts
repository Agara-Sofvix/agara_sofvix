import express from 'express';
import { saveTypingResult, getTypingHistory, getLeaderboard } from '../controllers/typingController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/save', protect, saveTypingResult);
router.get('/history', protect, getTypingHistory);
router.get('/leaderboard', protect, getLeaderboard);

export default router;
