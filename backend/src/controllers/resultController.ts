import { Request, Response } from 'express';
import TypingResult from '../models/TypingResult';
import TournamentResult from '../models/TournamentResult';

// @desc    Save typing test result
// @route   POST /api/results
// @access  Private
export const saveResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { wpm, accuracy, mistakes, text, duration } = req.body;

        const result = await TypingResult.create({
            user: (req as any).user._id,
            wpm,
            accuracy,
            mistakes,
            text,
            duration,
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }

};

// @desc    Get user results
// @route   GET /api/results
// @access  Private
export const getUserResults = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user._id;

        // Fetch both regular and tournament results
        const typingResults = await TypingResult.find({ user: userId });
        const tournamentResults = await TournamentResult.find({ user: userId }).populate('tournament', 'name');

        // Calculate rank for each tournament result
        const tournamentResultsWithRank = await Promise.all(tournamentResults.map(async (r) => {
            // Find all results for this tournament to determine rank
            if (!r.tournament) return null;

            const tournamentId = (r.tournament as any)._id || r.tournament;
            const allTournamentResults = await TournamentResult.find({ tournament: tournamentId }).sort({ wpm: -1, accuracy: -1 });
            const rank = allTournamentResults.findIndex(entry => entry.user.toString() === userId.toString()) + 1;

            return {
                _id: r._id,
                wpm: r.wpm,
                accuracy: r.accuracy,
                type: 'Tournament',
                createdAt: r.createdAt,
                tournamentName: (r.tournament as any).name || 'Unknown Tournament',
                rank: rank
            };
        }));

        // Filter out nulls from missing tournaments
        const validTournamentResults = tournamentResultsWithRank.filter(r => r !== null);

        // Combine and format them for the frontend
        const history = [
            ...typingResults.map(r => ({
                _id: r._id,
                wpm: r.wpm,
                accuracy: r.accuracy,
                type: 'Test',
                createdAt: r.createdAt
            })),
            ...validTournamentResults
        ].sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());

        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
