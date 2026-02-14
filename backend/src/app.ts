import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import path from 'path';
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

dotenv.config();

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
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (Increased for dev)
    standardHeaders: true,
    legacyHeaders: false,
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
const resolveUploads = () => {
    const paths = [
        path.join(process.cwd(), 'public/uploads'),
        path.join(process.cwd(), 'backend/public/uploads'),
        path.join(__dirname, '../public/uploads'),
        path.join(__dirname, '../../public/uploads')
    ];
    for (const p of paths) {
        if (require('fs').existsSync(p)) return p;
    }
    return paths[0];
};

app.use('/uploads', express.static(resolveUploads()));

app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
