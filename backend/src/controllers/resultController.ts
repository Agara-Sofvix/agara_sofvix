import { Request, Response } from 'express';
import TypingResult from '../models/TypingResult';
import TournamentResult from '../models/TournamentResult';
import Joi from 'joi';

// @desc    Save typing test result
// @route   POST /api/results
// @access  Private
export const saveResult = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        wpm: Joi.number().required(),
        accuracy: Joi.number().required(),
        mistakes: Joi.number().required(),
        text: Joi.string().required(),
        duration: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }

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

        res.status(201).json({
            success: true,
            data: result
        });
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

            // Find rank by counting how many users have a better score or same score with faster WPM
            const rank = await TournamentResult.countDocuments({
                tournament: tournamentId,
                $or: [
                    { score: { $gt: r.score } },
                    { score: r.score, wpm: { $gt: r.wpm } },
                    { score: r.score, wpm: r.wpm, accuracy: { $gt: r.accuracy } },
                    // For ties, we could add createdAt or just treat as same rank
                ]
            }) + 1;

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

        res.json({
            success: true,
            data: history
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
