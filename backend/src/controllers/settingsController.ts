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
                siteName: 'Ezhuthidu',
                marqueeText: '🏆 Tamil Typing Tournament – Registration Open | ⏳ Tournament Starts in 2 Days',
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
                        organizationEnabled: true
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

        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching settings', error: error.message });
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

        // Update fields individually to avoid overwriting nested objects
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
            // Merge branding instead of overwriting
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

        settings.updatedAt = new Date();
        settings.updatedBy = (req as any).admin._id;

        await settings.save();

        // Invalidate maintenance cache if it changed
        if (maintenanceMode !== undefined && wasMaintenanceMode !== maintenanceMode) {
            console.log(`Maintenance mode changed to ${maintenanceMode}. Invalidating cache and emitting toggle.`);
            invalidateMaintenanceCache();
            try {
                const io = getIo();
                io.emit('MAINTENANCE_TOGGLE', { enabled: !!maintenanceMode });
            } catch (err) {
                console.error('Failed to emit maintenance toggle:', err);
            }
        }

        // Trigger settings update event
        await createEvent(
            'SETTINGS_UPDATE',
            'System Settings Updated',
            `System settings updated by ${(req as any).admin.name}.`,
            { adminId: (req as any).admin._id, adminName: (req as any).admin.name }
        );

        res.json({ message: 'Settings updated successfully', settings });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating settings', error: error.message });
    }
};

// Generate API key
export const generateApiKey = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name } = req.body;

        if (!name) {
            res.status(400).json({ message: 'API key name is required' });
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

        res.json({ message: 'API key generated successfully', key, name });
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
            res.status(404).json({ message: 'Settings not found' });
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

        res.json({ message: 'API key revoked successfully' });
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
                siteName: 'Ezhuthidu',
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
                        organizationEnabled: true
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
                primaryColor: settings.branding.primaryColor || '#135bec'
            },
            seo: settings.seo || {}
        };

        res.json(responseData);
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

// Get sitemap.xml (Basic implementation)
export const getSitemapXml = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await Settings.findOne();
        if (!settings?.seo?.sitemapEnabled) {
            res.status(404).send('Sitemap disabled');
            return;
        }

        const baseUrl = process.env.FRONTEND_URL || 'https://ezhuthidu.com';

        // Basic sitemap with home page - can be expanded to include all dynamic routes
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

        res.type('application/xml');
        res.send(sitemap);
    } catch (error: any) {
        res.status(500).send('Error generating sitemap');
    }
};
