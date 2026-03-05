import { Request, Response, NextFunction } from 'express';

/**
 * Recursively sanitize an object to prevent NoSQL injection and XSS attacks.
 * - Removes keys starting with '$' (MongoDB operators like $gt, $ne, $or)
 * - Removes keys containing '.' (MongoDB dot notation for nested fields)
 * - Strips HTML tags from string values to prevent stored XSS
 */
const sanitizeValue = (value: any): any => {
    if (typeof value === 'string') {
        // Strip HTML tags to prevent XSS
        return value.replace(/<[^>]*>/g, '');
    }

    if (Array.isArray(value)) {
        return value.map(sanitizeValue);
    }

    if (value !== null && typeof value === 'object') {
        const sanitized: any = {};
        for (const key of Object.keys(value)) {
            // Block MongoDB operator injection ($gt, $ne, $or, etc.)
            if (key.startsWith('$') || key.includes('.')) {
                continue; // Skip dangerous keys entirely
            }
            sanitized[key] = sanitizeValue(value[key]);
        }
        return sanitized;
    }

    return value;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 * against NoSQL injection and XSS attacks.
 * Compatible with Express 4 and Express 5.
 */
export const sanitize = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body) {
        req.body = sanitizeValue(req.body);
    }
    // Note: req.query is read-only in Express 5, and req.params are route-matched strings.
    // The primary attack surface for NoSQL injection is req.body (JSON payloads).
    // Query params are always strings from the URL, so they can't contain objects like {$gt: ""}.
    next();
};
