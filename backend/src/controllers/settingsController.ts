import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import Settings from '../models/Settings';
import crypto from 'crypto';
import { createEvent } from '../services/eventService';

// Get settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({
                siteName: 'எழுத்திடு',
                marqueeText: '🏆 தமிழ் தட்டச்சுப் போட்டி – முன்பதிவு தொடங்கிவிட்டது | ⏳ போட்டி இன்னும் 2 நாட்களில் தொடங்கும்',
                contactEmail: 'admin@ezhuthidu.com',
                maintenanceMode: false,
                sessionTimeout: 60,
                twoFactorEnabled: true,
                webhookUrl: 'https://api.tamilspeedsters.com/v1/sync',
                apiKeys: [],
                notifications: {
                    newRegistration: true,
                    tournamentReports: true,
                    securityAlerts: true
                },
                branding: {
                    primaryColor: '#135bec'
                },
                seo: {
                    metaTitle: 'எழுத்திடு - Master Tamil Typing',
                    metaDescription: 'Learn and master Tamil typing with interactive lessons, tests, and tournaments.',
                    metaKeywords: 'tamil typing, learn tamil, typing test, tamil keyboard',
                    ogTitle: 'எழுத்திடு - Tamil Typing Platform',
                    ogDescription: 'Master Tamil typing through engagement and fun.',
                    ogImage: '',
                    twitterHandle: '@ezhuthidu',
                    googleAnalyticsId: '',
                    googleSearchConsoleId: '',
                    robotsTxt: 'User-agent: *\nAllow: /',
                    sitemapEnabled: true,
                    schemaSettings: {
                        faqEnabled: true,
                        breadcrumbEnabled: true,
                        organizationEnabled: true,
                        faqItems: [
                            { question: 'How to learn Tamil typing fast?', answer: '1. Learn the Tamil keyboard layout. 2. Practice daily. 3. Use online typing games. 4. Track your typing speed.' },
                            { question: 'What is the best Tamil typing game?', answer: 'Ezhuthidu is the best free Tamil typing game to practice Tamil keyboard typing online.' }
                        ]
                    },
                    socialLinks: {
                        facebook: '',
                        instagram: '',
                        linkedin: '',
                        youtube: ''
                    }
                }
            });
        }

        // Return settings (excluding sensitive apiKeys from general view if needed, 
        // but since this is usually called by admin panel, we keep it for now but picked fields later)
        const settingsObj = settings.toJSON() as any;
        delete settingsObj.apiKeys;

        res.json({
            success: true,
            data: settingsObj
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching settings', error: error.message });
    }
};

import { invalidateMaintenanceCache } from '../middlewares/maintenanceMiddleware';
import { getIo } from '../socket';

// Update settings
export const updateSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            siteName,
            contactEmail,
            marqueeText,
            maintenanceMode,
            sessionTimeout,
            webhookUrl,
            notifications,
            branding,
            seo
        } = req.body;

        let settings = await Settings.findOne();

        if (!settings) {
            settings = new Settings();
        }

        const wasMaintenanceMode = settings.maintenanceMode;

        if (siteName !== undefined) settings.siteName = siteName;
        if (marqueeText !== undefined) settings.marqueeText = marqueeText;
        if (contactEmail !== undefined) settings.contactEmail = contactEmail;
        if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode;
        if (sessionTimeout !== undefined) settings.sessionTimeout = sessionTimeout;
        if (webhookUrl !== undefined) settings.webhookUrl = webhookUrl;

        if (notifications !== undefined) {
            settings.notifications = { ...settings.notifications, ...notifications };
        }

        if (branding !== undefined) {
            settings.branding = {
                ...settings.branding,
                ...branding
            };
        }

        if (seo !== undefined) {
            settings.seo = {
                ...settings.seo,
                ...seo
            };
        }

        if (req.body.pagesSeo !== undefined) {
            settings.pagesSeo = req.body.pagesSeo;
        }

        settings.updatedAt = new Date();
        settings.updatedBy = (req as any).admin._id;

        await settings.save();

        // Trigger real-time settings update
        try {
            const io = getIo();
            io.emit('SETTINGS_UPDATE', settings);

            // Specifically signal maintenance toggle if changed
            if (maintenanceMode !== undefined && wasMaintenanceMode !== maintenanceMode) {
                invalidateMaintenanceCache();
                io.emit('MAINTENANCE_TOGGLE', { enabled: !!maintenanceMode });
            }

            console.log('[EZH-SETTINGS] Emitted SETTINGS_UPDATE via socket');
        } catch (err) {
            console.error('[EZH-SETTINGS] Failed to emit socket update:', err);
        }

        // Trigger settings update event
        await createEvent(
            'SETTINGS_UPDATE',
            'System Settings Updated',
            `System settings updated by ${(req as any).admin.name}.`,
            { adminId: (req as any).admin._id, adminName: (req as any).admin.name }
        );

        res.json({
            success: true,
            message: 'Settings updated successfully',
            data: settings
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error updating settings', error: error.message });
    }
};

// Generate API key
export const generateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ success: false, message: 'API key name is required' });
            return;
        }

        // Generate a secure random API key
        const key = 'sk_live_' + crypto.randomBytes(32).toString('hex');

        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings();
        }

        settings.apiKeys.push({
            key,
            name,
            createdAt: new Date()
        });

        settings.updatedAt = new Date();
        settings.updatedBy = (req as any).admin._id;

        await settings.save();

        res.json({
            success: true,
            message: 'API key generated successfully',
            data: { key, name }
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error generating API key', error: error.message });
    }
};

// Revoke API key
export const revokeApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { key } = req.params;

        let settings = await Settings.findOne();
        if (!settings) {
            res.status(404).json({ success: false, message: 'Settings not found' });
            return;
        }

        const initialLength = settings.apiKeys.length;
        settings.apiKeys = settings.apiKeys.filter(apiKey => apiKey.key !== key);

        if (settings.apiKeys.length === initialLength) {
            res.status(404).json({ message: 'API key not found' });
            return;
        }

        settings.updatedAt = new Date();
        settings.updatedBy = (req as any).admin._id;

        await settings.save();

        res.json({ success: true, message: 'API key revoked successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error revoking API key', error: error.message });
    }
};

// Resolve uploads root (same logic as app.ts so we find the file regardless of cwd)
const resolveUploadsRoot = () => {
    const paths = [
        path.join(process.cwd(), 'public/uploads'),
        path.join(process.cwd(), 'backend/public/uploads'),
        path.join(__dirname, '../public/uploads'),
        path.join(__dirname, '../../public/uploads')
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return paths[0];
};

// Serve logo image file (admin only - so admin panel can load logo via same API origin)
export const getLogoFile = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOne();
        const logoUrl = settings?.branding?.logoUrl;

        if (!logoUrl) {
            res.status(404).json({ message: 'No logo set' });
            return;
        }

        // If it's an upload path
        if (logoUrl.startsWith('/uploads/')) {
            const uploadsRoot = resolveUploadsRoot();
            const relativePath = logoUrl.replace(/^\/uploads\/?/, '');
            const filePath = path.join(uploadsRoot, relativePath);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.sendFile(path.resolve(filePath), { maxAge: '1h' });
                return;
            }

            // If file missing in uploads (volume reset?), return 404 so frontend shows fallback text/default
            console.warn(`Logo file missing at ${filePath}, usually due to volume reset.`);
            res.status(404).json({ message: 'Logo file not found in storage' });
            return;
        }

        // If it's an external URL, redirect to it
        if (logoUrl.startsWith('http')) {
            res.redirect(logoUrl);
            return;
        }

        res.status(404).json({ message: 'Invalid logo URL format' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error serving logo', error: error.message });
    }
};

// Get public settings (no authentication required)
export const getPublicSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        let settings = await Settings.findOne();

        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({
                siteName: 'எழுத்திடு',
                contactEmail: 'admin@ezhuthidu.com',
                maintenanceMode: false,
                sessionTimeout: 60,
                twoFactorEnabled: true,
                webhookUrl: 'https://api.tamilspeedsters.com/v1/sync',
                apiKeys: [],
                notifications: {
                    newRegistration: true,
                    tournamentReports: true,
                    securityAlerts: true
                },
                branding: {
                    primaryColor: '#135bec'
                },
                seo: {
                    metaTitle: 'எழுத்திடு - Master Tamil Typing',
                    metaDescription: 'Learn and master Tamil typing with interactive lessons, tests, and tournaments.',
                    metaKeywords: 'tamil typing, learn tamil, typing test, tamil keyboard',
                    ogTitle: 'எழுத்திடு - Tamil Typing Platform',
                    ogDescription: 'Master Tamil typing through engagement and fun.',
                    ogImage: '',
                    twitterHandle: '@ezhuthidu',
                    googleAnalyticsId: '',
                    googleSearchConsoleId: '',
                    robotsTxt: 'User-agent: *\nAllow: /',
                    sitemapEnabled: true,
                    schemaSettings: {
                        faqEnabled: true,
                        breadcrumbEnabled: true,
                        organizationEnabled: true,
                        faqItems: [
                            { question: 'How to learn Tamil typing fast?', answer: '1. Learn the Tamil keyboard layout. 2. Practice daily. 3. Use online typing games. 4. Track your typing speed.' },
                            { question: 'What is the best Tamil typing game?', answer: 'Ezhuthidu is the best free Tamil typing game to practice Tamil keyboard typing online.' }
                        ]
                    },
                    socialLinks: {
                        facebook: '',
                        instagram: '',
                        linkedin: '',
                        youtube: ''
                    }
                }
            });
        }

        // Return only public-facing settings (no sensitive data)
        const responseData = {
            siteName: settings.siteName,
            marqueeText: settings.marqueeText || '',
            contactEmail: settings.contactEmail,
            maintenanceMode: !!settings.maintenanceMode,
            branding: {
                logoUrl: settings.branding.logoUrl || '',
                faviconUrl: settings.branding.faviconUrl || '',
                primaryColor: settings.branding.primaryColor || '#135bec'
            },
            seo: settings.seo || {},
            pagesSeo: settings.pagesSeo || []
        };

        res.json({
            success: true,
            data: responseData
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching public settings', error: error.message });
    }
};

// Get robots.txt
export const getRobotsTxt = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOne();
        const robotsTxt = settings?.seo?.robotsTxt || 'User-agent: *\nAllow: /';
        res.type('text/plain');
        res.send(robotsTxt);
    } catch (error: any) {
        res.status(500).send('User-agent: *\nAllow: /');
    }
};

// Get sitemap.xml — All important routes
export const getSitemapXml = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOne();
        if (!settings?.seo?.sitemapEnabled) {
            res.status(404).send('Sitemap disabled');
            return;
        }

        const baseUrl = process.env.SITE_URL || process.env.FRONTEND_URL || 'https://ezhuthidu.com';
        const today = new Date().toISOString().split('T')[0];

        // Core pages
        const corePages = [
            { loc: '/', changefreq: 'daily', priority: '1.0' },
            { loc: '/practice', changefreq: 'weekly', priority: '0.9' },
            { loc: '/test', changefreq: 'weekly', priority: '0.9' },
            { loc: '/ezhuthidu', changefreq: 'weekly', priority: '0.9' },
            { loc: '/keyboard-layout', changefreq: 'monthly', priority: '0.8' },
            { loc: '/tournament', changefreq: 'weekly', priority: '0.8' },
            { loc: '/about', changefreq: 'monthly', priority: '0.7' },
        ];

        // Custom pages from SEO Manager
        const customPages = (settings.pagesSeo || [])
            .filter(p => p.path && p.path !== '/' && !corePages.some(cp => cp.loc === p.path))
            .map(p => ({
                loc: p.path,
                changefreq: 'weekly',
                priority: '0.8'
            }));

        const allPages = [...corePages, ...customPages];

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

        res.type('application/xml');
        res.send(sitemap);
    } catch (error: any) {
        res.status(500).send('Error generating sitemap');
    }
};
