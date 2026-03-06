import express from 'express';
import { adminAuth } from '../middlewares/adminMiddleware';
import {
    getSettings,
    updateSettings,
    generateApiKey,
    revokeApiKey,
    getPublicSettings,
    getLogoFile
} from '../controllers/settingsController';
import { logoUpload } from '../middlewares/uploadMiddleware';
import Settings from '../models/Settings';

const router = express.Router();

// Public route (no authentication required)
router.get('/public', getPublicSettings);

// Logo upload endpoint (multer adds req.file)
router.post('/logo', adminAuth, logoUpload.single('logo'), async (req, res) => {
    try {
        const file = (req as express.Request & { file?: { filename: string } }).file;
        if (!file) {
            res.status(400).json({ message: 'No file uploaded' });
            return;
        }

        const logoUrl = `/uploads/branding/${file.filename}`;

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.branding.logoUrl = logoUrl;
        settings.updatedAt = new Date();
        settings.updatedBy = (req as any).admin._id;

        await settings.save();

        // Trigger real-time settings update
        try {
            const { getIo } = await import('../socket');
            const io = getIo();
            io.emit('SETTINGS_UPDATE', settings);
            console.log('[EZH-LOGO] Emitted SETTINGS_UPDATE via socket');
        } catch (err) {
            console.error('[EZH-LOGO] Failed to emit socket update:', err);
        }

        res.json({
            success: true,
            message: 'Logo uploaded successfully',
            data: { logoUrl }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error uploading logo', error: error.message });
    }
});

// Serve logo image (admin auth so admin panel can fetch with token)
router.get('/logo', adminAuth, getLogoFile);

// All other routes require admin authentication
router.get('/', adminAuth, getSettings);
router.put('/', adminAuth, updateSettings);
router.post('/api-keys', adminAuth, generateApiKey);
router.delete('/api-keys/:key', adminAuth, revokeApiKey);

export default router;
