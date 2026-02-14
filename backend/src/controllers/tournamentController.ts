import { Request, Response } from 'express';
import Tournament from '../models/Tournament';
import TournamentResult from '../models/TournamentResult';
import { createEvent } from '../services/eventService';

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private
export const createTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, startTime, endTime } = req.body;

        const tournament = await Tournament.create({
            name,
            startTime,
            endTime,
            createdBy: (req as any).user._id,
        });

        // Trigger tournament creation event
        await createEvent(
            'TOURNAMENT_CREATE',
            'New Tournament Created',
            `New tournament "${name}" created.`,
            { tournamentId: tournament._id, name, createdBy: (req as any).user._id }
        );

        res.status(201).json(tournament);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tournaments
// @route   GET /api/tournaments
// @access  Public
export const getTournaments = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournaments = await Tournament.find()
            .populate('createdBy', 'name')
            .populate('textContent', 'category content');
        res.json(tournaments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Join a tournament
// @route   POST /api/tournaments/:id/join
// @access  Private
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const joinTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findById(req.params.id);

        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        const userId = (req as any).user._id;

        // Check if user already joined
        const isJoined = tournament.participants.some(p => p.toString() === userId.toString());
        if (isJoined) {
            res.status(400).json({ message: 'User already joined' });
            return;
        }

        tournament.participants.push(userId);
        await tournament.save();

        // Trigger tournament registration event
        await createEvent(
            'TOURNAMENT_REGISTER',
            'Tournament Registration',
            `User joined tournament "${tournament.name}".`,
            { tournamentId: tournament._id, tournamentName: tournament.name, userId }
        );

        res.json({ message: 'Joined tournament successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const submitResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tournamentId, wpm, accuracy, score } = req.body;
        const userId = (req as any).user._id;

        // Check for existing result for this user in this tournament
        let result = await TournamentResult.findOne({
            user: userId,
            tournament: tournamentId
        });

        if (result) {
            // Cumulative logic: Add new WPM/Score to existing
            // For accuracy, we'll take the average (or you could do weighted average)
            // Let's do a simple average for now or keep the best one? 
            // The user said "all results should be added together", implying score summation.
            result.wpm += wpm;
            result.score += (score || wpm);

            // Weighted accuracy could be better, but we don't store total characters here.
            // We'll take the average of current accuracy and new accuracy.
            result.accuracy = Math.round((result.accuracy + accuracy) / 2);
            result.timestamp = new Date();
            await result.save();
        } else {
            // Create a new entry if none exists for today
            result = await TournamentResult.create({
                user: userId,
                tournament: tournamentId,
                wpm,
                accuracy,
                score: score || wpm,
                timestamp: new Date(),
            });
        }

        // Trigger tournament leaderboard update event
        await createEvent(
            'TOURNAMENT_LEADERBOARD_UPDATE',
            'Tournament Leaderboard Update',
            `New result submitted for tournament. Score: ${result.score}`,
            { tournamentId, score: result.score, wpm: result.wpm, userId }
        );

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Tournament ID

        // Get all results for the tournament, sorted by performance
        const results = await TournamentResult.find({
            tournament: id
        })
            .sort({ wpm: -1, accuracy: -1 })
            .populate('user', 'name username');

        // Filter duplicates to ensure only one result per user is shown
        const uniqueLeaderboard: any[] = [];
        const seenUsers = new Set();

        for (const res of results) {
            const userId = res.user ? (res.user as any)._id.toString() : null;
            if (userId && !seenUsers.has(userId)) {
                uniqueLeaderboard.push(res);
                seenUsers.add(userId);
            }
            if (uniqueLeaderboard.length >= 50) break;
        }

        res.json(uniqueLeaderboard);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const getRegistrationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findById(req.params.id);
        if (!tournament) {
            res.status(404).json({ message: 'Tournament not found' });
            return;
        }

        const userId = (req as any).user._id;
        const isRegistered = tournament.participants.some(p => p.toString() === userId.toString());

        res.json({ isRegistered });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const getActiveTournament = async (req: Request, res: Response): Promise<void> => {
    try {
        const tournament = await Tournament.findOne({ status: 'live' }).sort({ createdAt: -1 });
        if (!tournament) {
            res.status(404).json({ message: 'No active tournament found' });
            return;
        }
        res.json(tournament);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
