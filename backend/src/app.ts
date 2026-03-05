import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { sanitize } from './middlewares/sanitizeMiddleware';
import { createServer } from 'http';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import typingRoutes from './routes/typingRoutes';
import tournamentRoutes from './routes/tournamentRoutes';
import pdfRoutes from './routes/pdfRoutes';
import resultRoutes from './routes/resultRoutes';
import textRoutes from './routes/textRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminUserRoutes from './routes/adminUserRoutes';
import adminRoutes from './routes/adminRoutes';
import settingsRoutes from './routes/settingsRoutes';
import notificationRoutes from './routes/notificationRoutes';
import advertisementRoutes from './routes/advertisementRoutes';
import { initSocket } from './socket';
import { maintenanceMode } from './middlewares/maintenanceMiddleware';
import { seedAdmin } from './seedAdmin';
import { getRobotsTxt, getSitemapXml } from './controllers/settingsController';
import { seoMiddleware } from './middlewares/seoMiddleware';
import { notFound, errorHandler } from './middlewares/errorMiddleware';

dotenv.config({ override: true });

connectDB().then(() => {
    seedAdmin();
});

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Initialize Cron Jobs
import { initCronJobs } from './services/cronService';
initCronJobs();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (process.env.ALLOWED_ORIGINS === '*') return callback(null, true);
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(sanitize);
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
app.use(limiter);

// Maintenance Mode Check (before routes)
app.use(maintenanceMode);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/typing', typingRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/texts', textRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
// Redundant adminUserRoutes removed as its functionality is in adminRoutes
// app.use('/api/admin/users', adminUserRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/admin', adminRoutes);

// Serve Static Uploads
const resolvePublicPath = (targetSubPath: string) => {
    const root = process.cwd();
    const candidates = [
        path.join(root, targetSubPath),
        path.join(root, 'public', targetSubPath.split('/').pop() || ''),
        path.join(root, 'backend', targetSubPath),
        path.join(__dirname, '..', '..', targetSubPath)
    ];

    for (const p of candidates) {
        if (fs.existsSync(p)) return p;
    }
    // Final fallback: if in backend folder, try public/
    const simplePublic = path.join(root, targetSubPath.replace('public/', ''));
    if (fs.existsSync(simplePublic)) return simplePublic;

    return candidates[0];
};

app.use('/uploads', express.static(resolvePublicPath('public/uploads')));
app.use('/avatars', express.static(resolvePublicPath('public/avatars')));

app.get('/robots.txt', getRobotsTxt);
app.get('/sitemap.xml', getSitemapXml);

// Serve built frontend static assets (JS, CSS, images, fonts)
const cwd = process.cwd();
const frontendDist = fs.existsSync(path.join(cwd, 'frontend', 'dist'))
    ? path.join(cwd, 'frontend', 'dist')
    : path.join(cwd, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist, { index: false })); // index:false so SEO middleware handles HTML
}

// SSR meta-injection
app.get(/.*/, seoMiddleware);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown — ensures port is released before nodemon restarts
const shutdown = () => {
    httpServer.close(() => {
        console.log('Server closed. Port released.');
        process.exit(0);
    });
    // Force exit if close takes too long
    setTimeout(() => process.exit(1), 3000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

