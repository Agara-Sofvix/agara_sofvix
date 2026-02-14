import { Request, Response } from 'express';
import User from '../models/User';
import generateToken from '../utils/generateToken';
import Joi from 'joi';
import { createEvent } from '../services/eventService';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const schema = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        dob: Joi.date().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.details[0].message });
        return;
    }

    const { name, username, email, password, dob } = req.body;

    try {
        const userExists = await User.findOne({ username });

        if (userExists) {
            res.status(400).json({ message: 'Username already exists' });
            return;
        }

        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400).json({ message: 'Email already exists' });
            return;
        }

        const user = await User.create({
            name,
            username,
            email,
            password,
            dob,
        });

        if (user) {
            // Trigger user signup event
            await createEvent(
                'USER_SIGNUP',
                'New User Registration',
                `User ${user.name} (${user.username}) has registered.`,
                { userId: user._id, name: user.name, username: user.username }
            );

            res.status(201).json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                dob: user.dob,
                lastNotificationReadAt: user.lastNotificationReadAt,
                token: generateToken(user._id as any),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            res.status(404).json({ message: 'User does not exist' });
            return;
        }

        if (await user.matchPassword(password)) {
            res.json({
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                dob: user.dob,
                lastNotificationReadAt: user.lastNotificationReadAt,
                token: generateToken(user._id as any),
            });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
    const user = await User.findById((req as any).user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            dob: user.dob,
            lastNotificationReadAt: user.lastNotificationReadAt,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};
