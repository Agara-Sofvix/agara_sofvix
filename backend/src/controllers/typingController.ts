import { Request, Response } from 'express';
import TypingResult from '../models/TypingResult';
import Joi from 'joi';
import { getIo } from '../socket';
import { createEvent } from '../services/eventService';

// @desc    Save typing result
// @route   POST /api/typing/save
// @access  Private
export const saveTypingResult = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        wpm: Joi.number().required(),
        accuracy: Joi.number().required(),
        mistakes: Joi.number().required(),
        text: Joi.string().allow('').optional(),
        duration: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const { wpm, accuracy, mistakes, text, duration } = req.body;

    try {
        const result = await TypingResult.create({
            user: (req as any).user._id,
            wpm,
            accuracy,
            mistakes,
            text,
            duration,
        });

        // Emit new score event
        // This catch block was misplaced, it should be part of the main try-catch for the function.
        // The original code had an inner try-catch that was not correctly structured.

        // Trigger user test result event
        await createEvent(
            'TEST_RESULT',
            'User Test Result',
            `User ${(req as any).user.name} scored ${wpm} WPM.`,
            { userId: (req as any).user._id, wpm, accuracy, mistakes }
        );

        res.status(201).json(result);
    } catch (error: any) {
        console.error("Error saving typing result or emitting event:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user typing history
// @route   GET /api/typing/history
// @access  Private
export const getTypingHistory = async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    try {
        const count = await TypingResult.countDocuments({ user: (req as any).user._id });
        const history = await TypingResult.find({ user: (req as any).user._id })
            .sort({ createdAt: -1 })
            .limit(pageSize)
            .skip(pageSize * (page - 1));

        res.json({
            history,
            page,
            pages: Math.ceil(count / pageSize),
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get global leaderboard
// @route   GET /api/typing/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        // Aggregation to get max WPM per user or average?
        // Usually leaderboard shows top WPM records or Top Users by Avg WPM.
        // Let's show Top 10 Best WPM records for now, populating user name.

        const leaderboard = await TypingResult.find({})
            .sort({ wpm: -1, accuracy: -1 })
            .limit(20)
            .populate('user', 'name');

        res.json(leaderboard);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
