import { Request, Response } from 'express';
import TypingResult from '../models/TypingResult';
import Joi from 'joi';
import { getIo } from '../socket';
import { createEvent } from '../services/eventService';
import { calculateScore } from '../utils/scoreCalculator';
import TamilText from '../models/TamilText';

// @desc    Save typing result
// @route   POST /api/typing/save
// @access  Private
export const saveTypingResult = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        textId: Joi.string().optional(),
        originalText: Joi.string().optional(), // Fallback if no textId
        typedText: Joi.string().required(),
        durationMs: Joi.number().required(),
        testSessionId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }

    const { textId, originalText, typedText, durationMs, testSessionId } = req.body;

    try {
        // Idempotency check
        const existingResult = await TypingResult.findOne({ testSessionId });
        if (existingResult) {
            res.status(200).json(existingResult); // Return existing result for repeats
            return;
        }

        let targetText = originalText || "";
        if (textId) {
            const tamilText = await TamilText.findById(textId);
            if (tamilText) {
                targetText = tamilText.content;
            }
        }

        if (!targetText) {
            res.status(400).json({ message: 'Target text required for score calculation' });
            return;
        }

        // Server-side calculation
        const { wpm, accuracy, score, mistakes } = calculateScore({
            targetText,
            typedText,
            durationMs
        });

        const result = await TypingResult.create({
            user: (req as any).user._id,
            wpm,
            accuracy,
            mistakes,
            text: typedText.slice(0, 500), // Store snippet
            duration: Math.round(durationMs / 1000),
            testSessionId,
        });

        // Trigger user test result event
        await createEvent(
            'TEST_RESULT',
            'User Test Result',
            `User ${(req as any).user.name} scored ${wpm} WPM.`,
            { userId: (req as any).user._id, wpm, accuracy, mistakes }
        );

        res.status(201).json({
            success: true,
            data: result
        });
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
            success: true,
            data: {
                history,
                page,
                pages: Math.ceil(count / pageSize),
            }
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

        res.json({
            success: true,
            data: leaderboard
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
