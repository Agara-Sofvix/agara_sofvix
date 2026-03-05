import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin';

export const adminAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized - no token provided' });
        return;
    }

    try {
        // Verify token (Hardcoded JWT_SECRET safety removed for prod-ready secret)
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

        // Get admin from token
        const admin = await Admin.findById(decoded.id).select('-password');

        if (!admin || admin.tokenVersion !== decoded.tokenVersion) {
            res.status(401).json({ success: false, message: 'Not authorized - session invalidated' });
            return;
        }

        if (!admin.isActive) {
            res.status(403).json({ success: false, message: 'Admin account is deactivated' });
            return;
        }

        // Attach admin to request
        (req as any).admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized - token failed' });
        return;
    }
};
