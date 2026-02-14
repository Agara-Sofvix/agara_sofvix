import express from 'express';
import { createTournament, getTournaments, joinTournament, submitResult, getLeaderboard, getRegistrationStatus, getActiveTournament } from '../controllers/tournamentController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, createTournament);
router.get('/active', getActiveTournament);
router.get('/', getTournaments);
router.post('/:id/join', protect, joinTournament);
router.get('/:id/registration-status', protect, getRegistrationStatus);
router.post('/:id/submit', protect, submitResult);
router.get('/:id/leaderboard', getLeaderboard);

export default router;
