import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Tournament from '../models/Tournament';
import TournamentResult from '../models/TournamentResult';
import Joi from 'joi';
import { createEvent } from '../services/eventService';
import { calculateScore } from '../utils/scoreCalculator';
import { cache } from '../utils/cache';
import TamilText from '../models/TamilText';

// @desc    Create a new tournament
// @route   POST /api/tournaments
// @access  Private
export const createTournament = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        name: Joi.string().required(),
        startTime: Joi.date().required(),
        endTime: Joi.date().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ success: false, message: error.details[0].message });
        return;
    }

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

        res.status(201).json({
            success: true,
            data: tournament
        });
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
        res.json({
            success: true,
            data: tournaments
        });
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
            res.status(400).json({ success: false, message: 'User already joined' });
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

        res.json({ success: true, message: 'Joined tournament successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const submitResult = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        tournamentId: Joi.string().required(),
        typedText: Joi.string().required(),
        durationMs: Joi.number().required(),
        testSessionId: Joi.string().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tournamentId, typedText, durationMs, testSessionId } = req.body;
        const userId = (req as any).user._id;

        // Idempotency check inside transaction
        const existingSession = await TournamentResult.findOne({ testSessionId }).session(session);
        if (existingSession) {
            await session.abortTransaction();
            session.endSession();
            res.status(200).json({
                success: true,
                data: existingSession
            });
            return;
        }

        const tournament = await Tournament.findById(tournamentId).populate('textContent').session(session);
        if (!tournament) {
            await session.abortTransaction();
            session.endSession();
            res.status(404).json({ success: false, message: 'Tournament not found' });
            return;
        }

        const targetText = (tournament.textContent as any)?.content;
        if (!targetText) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ success: false, message: 'Tournament text content not found' });
            return;
        }

        // Server-side calculation
        const { wpm, accuracy, score } = calculateScore({
            targetText,
            typedText,
            durationMs
        });

        // Use findOneAndUpdate with $inc for atomicity and to handle cumulative scoring/upserting
        const result = await TournamentResult.findOneAndUpdate(
            { user: userId, tournament: tournamentId },
            {
                $inc: {
                    wpm: wpm,
                    score: score
                },
                $set: {
                    accuracy: accuracy, // We'll keep the latest accuracy or could do average logic if needed, but atomic average is harder without pre-calc
                    timestamp: new Date(),
                    testSessionId: testSessionId
                }
            },
            {
                upsert: true,
                new: true,
                session: session
            }
        );

        // Trigger tournament leaderboard update event
        await createEvent(
            'TOURNAMENT_LEADERBOARD_UPDATE',
            'Tournament Leaderboard Update',
            `New result submitted for tournament. Current Score: ${result.score}`,
            { tournamentId, score: result.score, wpm: result.wpm, userId },
            session
        );

        await session.commitTransaction();
        session.endSession();

        // Invalidate leaderboard cache so next fetch gets fresh data
        cache.invalidate(`leaderboard:${tournamentId}`);

        res.status(201).json({
            success: true,
            data: result
        });
    } catch (error: any) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Tournament ID
        const cacheKey = `leaderboard:${id}`;

        // Check cache first (30s TTL)
        const cached = cache.get(cacheKey);
        if (cached) {
            res.json({ success: true, data: cached });
            return;
        }

        // Get all results for the tournament, sorted by performance
        // Uniqueness is now guaranteed by the unique index on { user, tournament }
        const results = await TournamentResult.find({
            tournament: id
        })
            .sort({ score: -1, wpm: -1, accuracy: -1 })
            .populate('user', 'name username')
            .limit(50);

        // Cache for 30 seconds
        cache.set(cacheKey, results, 30);

        res.json({
            success: true,
            data: results
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
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

        res.json({ success: true, data: { isRegistered } });
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
        res.json({
            success: true,
            data: tournament
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
