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

        // Combine and format them for the frontend
        const history = [
            ...typingResults.map(r => ({
                _id: r._id,
                wpm: r.wpm,
                accuracy: r.accuracy,
                type: 'Test',
                createdAt: r.createdAt
            })),
            ...tournamentResults.map(r => ({
                _id: r._id,
                wpm: r.wpm,
                accuracy: r.accuracy,
                type: 'Tournament',
                createdAt: r.createdAt
            }))
        ].sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());

        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
