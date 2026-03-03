import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { io } from 'socket.io-client';
import { fetchPublicSettings, PublicSettings } from '../services/settingsApi';
import { SOCKET_ORIGIN } from '../config/apiConfig';

interface SettingsContextType {
    settings: PublicSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const applySeoSettings = (seo: any) => {
    if (!seo) return;

    // Title
    if (seo.metaTitle) {
        document.title = seo.metaTitle;
    }

    // Update Meta Tags helper
    const updateMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
        if (!content) return;
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, name);
            document.head.appendChild(el);
        }
        el.setAttribute('content', content);
    };

    updateMeta('description', seo.metaDescription);
    updateMeta('keywords', seo.metaKeywords);

    // Google Search Console Verification
    if (seo.googleSearchConsoleId) {
        updateMeta('google-site-verification', seo.googleSearchConsoleId);
    }

    // Google Analytics (GA4) Injection
    if (seo.googleAnalyticsId && typeof window !== 'undefined') {
        const gaId = seo.googleAnalyticsId;
        const scriptId = 'google-analytics-script';

        if (!document.getElementById(scriptId)) {
            // Load the gtag.js script
            const script = document.createElement('script');
            script.id = scriptId;
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
            document.head.appendChild(script);

            // Initialize dataLayer and gtag function
            const inlineScript = document.createElement('script');
            inlineScript.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
            `;
            document.head.appendChild(inlineScript);
        }
    }

    // OpenGraph
    updateMeta('og:title', seo.ogTitle || seo.metaTitle, 'property');
    updateMeta('og:description', seo.ogDescription || seo.metaDescription, 'property');
    updateMeta('og:image', seo.ogImage, 'property');
    updateMeta('og:type', 'website', 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', seo.ogTitle || seo.metaTitle);
    updateMeta('twitter:description', seo.ogDescription || seo.metaDescription);
    updateMeta('twitter:image', seo.ogImage);
    if (seo.twitterHandle) {
        updateMeta('twitter:site', seo.twitterHandle);
    }
};

export const updatePageTitle = (pageTitle: string, siteName?: string) => {
    const name = siteName || 'Ezhuthidu';
    document.title = pageTitle ? `${pageTitle} | ${name}` : name;
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<PublicSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            console.log('Fetching public settings...');
            const data = await fetchPublicSettings();
            console.log('Public settings loaded:', data);
            setSettings(data);
            setLoading(false);

            // Apply theme color
            if (data.branding.primaryColor) {
                document.documentElement.style.setProperty('--primary-color', data.branding.primaryColor);
            }

            // Update SEO settings
            if (data.seo) {
                applySeoSettings(data.seo);
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();

        // Socket.io connection for real-time updates
        const socket = io(SOCKET_ORIGIN, {
            transports: ['websocket', 'polling']
        });

        socket.on('MAINTENANCE_TOGGLE', (data: { enabled: boolean }) => {
            console.log('Maintenance mode socket event received:', data.enabled);
            setSettings(prev => {
                const updated = prev ? { ...prev, maintenanceMode: !!data.enabled } : {
                    // Fallback in case settings weren't loaded yet
                    siteName: document.title || 'エழத்திடு',
                    contactEmail: '',
                    maintenanceMode: !!data.enabled,
                    branding: { primaryColor: '#135bec' },
                    seo: {
                        metaTitle: document.title,
                        metaDescription: '',
                        metaKeywords: '',
                        ogTitle: document.title,
                        ogDescription: '',
                        ogImage: '',
                        twitterHandle: '',
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
                };
                console.log('Updated settings state:', updated);
                return updated;
            });
        });

        socket.on('SETTINGS_UPDATE', (data: any) => {
            console.log('Settings updated via socket:', data);
            if (data.seo) {
                applySeoSettings(data.seo);
            }
            loadSettings();
        });

        // Refresh settings every 5 minutes as a fallback
        const interval = setInterval(loadSettings, 5 * 60 * 1000);
        return () => {
            clearInterval(interval);
            socket.disconnect();
        };
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: loadSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
