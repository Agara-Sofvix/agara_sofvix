import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token && req.query.token !== 'undefined') {
        token = req.query.token as string;
    }

    if (!token || token === 'undefined') {
        res.status(401).json({ message: 'Not authorized - no token provided' });
        return;
    }

    try {
        // DEV MODE BYPASS
        if (token === 'mock-token') {
            const admin = await Admin.findOne();
            if (admin) {
                (req as any).admin = admin;
                next();
                return;
            }
        }

        // Verify token
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');

        // Get admin from token
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin) {
            res.status(401).json({ message: 'Not authorized - admin not found' });
            return;
        }

        if (!admin.isActive) {
            res.status(403).json({ message: 'Admin account is deactivated' });
            return;
        }

        // Attach admin to request
        (req as any).admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized - token failed' });
        return;
    }
};
