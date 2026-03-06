import { Request, Response, NextFunction } from 'express';
import Settings from '../models/Settings';

// Cache settings to avoid database query on every request
let cachedSettings: any = null;
let lastFetch = 0;
const CACHE_DURATION = 60000; // 1 minute

export const invalidateMaintenanceCache = () => {
    cachedSettings = null;
    lastFetch = 0;
};

export const maintenanceMode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Skip maintenance check for admin routes, uploads, and public settings
        // Note: Check both /api/admin and the specific routes if needed
        if (req.path.startsWith('/api/admin') ||
            req.path.startsWith('/api/settings/public') ||
            req.path.startsWith('/uploads') ||
            req.path.startsWith('/avatars')) {
            return next();
        }

        // Use cached settings if available and fresh
        const now = Date.now();
        if (!cachedSettings || (now - lastFetch) > CACHE_DURATION) {
            cachedSettings = await Settings.findOne();
            lastFetch = now;
        }

        // If maintenance mode is enabled, block the request
        if (cachedSettings?.maintenanceMode) {
            res.status(503).json({
                message: 'Site is currently under maintenance. Please check back later.',
                maintenanceMode: true,
                contactEmail: cachedSettings.contactEmail
            });
            return;
        }

        next();
    } catch (error) {
        // If there's an error checking maintenance mode, allow the request through
        console.error('Error checking maintenance mode:', error);
        next();
    }
};
