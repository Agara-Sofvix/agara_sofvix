import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Webhook,
    Bell,
    Palette,
    Save,
    Upload,
    History,
    Check,
    Loader2,
    CheckCircle,
    XCircle,
    Trash2
} from 'lucide-react';
import { fetchSettings, updateSettings, generateApiKey, revokeApiKey, uploadLogo, uploadFavicon } from '../services/settingsApi';
import { getUploadBaseUrl } from '../config/apiConfig';

const Settings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [email, setEmail] = useState('admin@tamilspeedsters.com');
    const [siteName, setSiteName] = useState('Tamil Speedsters 2024');
    const [marqueeText, setMarqueeText] = useState('');
    const [sessionTimeout, setSessionTimeout] = useState('60');
    const [webhookUrl, setWebhookUrl] = useState('https://api.tamilspeedsters.com/v1/sync');
    const [primaryColor, setPrimaryColor] = useState('#135bec');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
    const [apiKeys, setApiKeys] = useState<Array<{ key: string; name: string; createdAt: Date }>>([]);

    // Notification State
    const [notifyRegister, setNotifyRegister] = useState(true);
    const [notifyReports, setNotifyReports] = useState(true);
    const [notifySecurity, setNotifySecurity] = useState(true);

    const getFullImageUrl = (path?: string | null) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = getUploadBaseUrl().replace(/\/$/, '');
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${baseUrl}${cleanPath}`;
    };

    // Apply theme color real-time
    useEffect(() => {
        document.documentElement.style.setProperty('--primary-color', primaryColor);
    }, [primaryColor]);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await fetchSettings();

            setSiteName(settings.siteName);
            setMarqueeText(settings.marqueeText || '');
            setEmail(settings.contactEmail);
            setMaintenanceMode(settings.maintenanceMode);
            setSessionTimeout(settings.sessionTimeout.toString());
            setWebhookUrl(settings.webhookUrl);
            setPrimaryColor(settings.branding.primaryColor);
            setLogoUrl(settings.branding.logoUrl || null);
            setFaviconUrl(settings.branding.faviconUrl || null);
            setApiKeys(settings.apiKeys);
            setNotifyRegister(settings.notifications.newRegistration);
            setNotifyReports(settings.notifications.tournamentReports);
            setNotifySecurity(settings.notifications.securityAlerts);
        } catch (error: any) {
            showNotification('error', 'Failed to load settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            showNotification('error', 'File size exceeds 2MB limit');
            return;
        }

        try {
            setUploading(true);
            const { logoUrl } = await uploadLogo(file);
            setLogoUrl(logoUrl);
            showNotification('success', 'Logo uploaded successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to upload logo: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveLogo = () => {
        setLogoUrl(null);
        showNotification('success', 'Logo marked for removal. Click Save to confirm.');
    };

    const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (1MB for favicon)
        if (file.size > 1 * 1024 * 1024) {
            showNotification('error', 'Favicon size exceeds 1MB limit');
            return;
        }

        try {
            setUploading(true);
            const { faviconUrl } = await uploadFavicon(file);
            setFaviconUrl(faviconUrl);
            showNotification('success', 'Favicon uploaded successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to upload favicon: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFavicon = () => {
        setFaviconUrl(null);
        showNotification('success', 'Favicon marked for removal. Click Save to confirm.');
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await updateSettings({
                siteName,
                marqueeText,
                contactEmail: email,
                maintenanceMode,
                sessionTimeout: parseInt(sessionTimeout),
                webhookUrl,
                notifications: {
                    newRegistration: notifyRegister,
                    tournamentReports: notifyReports,
                    securityAlerts: notifySecurity
                },
                branding: {
                    primaryColor,
                    logoUrl: logoUrl || "", // Explicitly pass empty string if null to clear in DB
                    faviconUrl: faviconUrl || ""
                }
            });
            showNotification('success', 'Settings saved successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to save settings: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateApiKey = async () => {
        const name = prompt('Enter a name for this API key:');
        if (!name) return;

        try {
            const newKey = await generateApiKey(name);
            setApiKeys([...apiKeys, { ...newKey, createdAt: new Date() }]);
            showNotification('success', 'API key generated successfully!');

            // Show the key to user (only shown once)
            alert(`Your new API key:\n\n${newKey.key}\n\nPlease save this key securely. You won't be able to see it again.`);
        } catch (error: any) {
            showNotification('error', 'Failed to generate API key: ' + error.message);
        }
    };

    const handleRevokeApiKey = async (key: string) => {
        if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
            return;
        }

        try {
            await revokeApiKey(key);
            setApiKeys(apiKeys.filter(k => k.key !== key));
            showNotification('success', 'API key revoked successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to revoke API key: ' + error.message);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const colorOptions = [
        '#135bec', // Blue (Current)
        '#10b981', // Emerald
        '#f43f5e', // Rose
        '#8b5cf6', // Violet
        '#92450f', // Brown
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 relative">
            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <XCircle size={20} />
                    )}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            {/* Internal Sidebar Navigation for Settings */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="lg:sticky lg:top-4 space-y-1">
                    <h3 className="px-4 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-6">Settings Navigation</h3>
                    <div className="space-y-1">
                        <a href="#general" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
                            <SettingsIcon size={20} className="shrink-0 text-slate-500 group-hover:text-white transition-colors" /> General Settings
                        </a>
                        <a href="#security" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
                            <Shield size={20} className="shrink-0 text-slate-500 group-hover:text-white transition-colors" /> Security & Auth
                        </a>
                        <a href="#api" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
                            <Webhook size={20} className="shrink-0 text-slate-500 group-hover:text-white transition-colors" /> API & Webhooks
                        </a>
                        <a href="#notifications" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
                            <Bell size={20} className="shrink-0 text-slate-500 group-hover:text-white transition-colors" /> Notifications
                        </a>
                        <a href="#branding" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all text-sm font-medium group">
                            <Palette size={20} className="shrink-0 text-slate-500 group-hover:text-white transition-colors" /> Branding & Identity
                        </a>
                    </div>

                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg py-3 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin shrink-0" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="shrink-0" /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 min-w-0 space-y-12 pb-20">
                <div className="mb-10 lg:mt-4">
                    <h1 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white">System Configuration</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage all platform-wide settings from a single unified control center.</p>
                </div>

                {/* General Settings */}
                <section id="general" className="bg-[#1a1d21] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <SettingsIcon className="text-primary" />
                            <h2 className="text-lg font-bold text-white">General Settings</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300">Site Name</label>
                                <input
                                    type="text"
                                    value={siteName}
                                    onChange={(e) => setSiteName(e.target.value)}
                                    className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300">Contact Support Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                />
                            </div>
                            <div className="flex flex-col gap-2 md:col-span-2">
                                <label className="text-sm font-medium text-slate-300">Marquee Announcement Text</label>
                                <textarea
                                    value={marqueeText}
                                    onChange={(e) => setMarqueeText(e.target.value)}
                                    rows={2}
                                    className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none resize-none"
                                    placeholder="Enter announcement text to scroll at the top of the site..."
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[#0f1214]/50 rounded-lg border border-slate-800">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-orange-500">
                                    <SettingsIcon size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Maintenance Mode</h4>
                                    <p className="text-xs text-slate-400">Disable front-end access for regular users during updates.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={maintenanceMode}
                                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Security Settings */}
                <section id="security" className="bg-[#1a1d21] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <Shield className="text-emerald-500" />
                            <h2 className="text-lg font-bold text-white">Security & Authentication</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                            <div className="flex items-start gap-4">
                                <Shield className="text-emerald-500" />
                                <div>
                                    <h4 className="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h4>
                                    <p className="text-xs text-slate-400">Mandatory for all administrator accounts.</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">ENABLED</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-slate-300">Session Timeout (Minutes)</label>
                                <input
                                    type="number"
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* API Settings */}
                <section id="api" className="bg-[#1a1d21] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <Webhook className="text-blue-500" />
                            <h2 className="text-lg font-bold text-white">API & Webhooks</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-slate-300">Access Keys</h4>
                                <button onClick={handleGenerateApiKey} className="text-xs text-primary font-bold hover:underline">+ Generate New Key</button>
                            </div>
                            {apiKeys.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No API keys generated yet</p>
                            ) : (
                                apiKeys.map((apiKey) => (
                                    <div key={apiKey.key} className="bg-[#0f1214] border border-slate-800 rounded-lg p-3 flex items-center justify-between group">
                                        <div className="flex flex-col gap-1">
                                            <code className="text-xs font-mono text-slate-400">{apiKey.key.substring(0, 20)}...{apiKey.key.substring(apiKey.key.length - 6)}</code>
                                            <span className="text-[10px] text-slate-500">{apiKey.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(apiKey.key);
                                                    showNotification('success', 'API key copied to clipboard');
                                                }}
                                                className="p-1 hover:text-white text-slate-400 transition-colors"
                                            >
                                                <div className="text-xs">Copy</div>
                                            </button>
                                            <button
                                                onClick={() => handleRevokeApiKey(apiKey.key)}
                                                className="p-1 hover:text-red-500 text-slate-400 transition-colors"
                                            >
                                                <div className="text-xs">Revoke</div>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-300">Webhook URL</label>
                            <input
                                type="url"
                                value={webhookUrl}
                                onChange={(e) => setWebhookUrl(e.target.value)}
                                className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                            />
                            <p className="text-[11px] text-slate-500">Payload events will be sent to this endpoint via POST.</p>
                        </div>
                    </div>
                </section>

                {/* Notification Preferences */}
                <section id="notifications" className="bg-[#1a1d21] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <Bell className="text-purple-500" />
                            <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <div>
                                    <p className="text-sm font-medium text-white">New Participant Registration</p>
                                    <p className="text-xs text-slate-400">Email admin when a new user signs up.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifyRegister}
                                        onChange={(e) => setNotifyRegister(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/50">
                                <div>
                                    <p className="text-sm font-medium text-white">Tournament Completion Reports</p>
                                    <p className="text-xs text-slate-400">Weekly summaries of leaderboard results.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifyReports}
                                        onChange={(e) => setNotifyReports(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="text-sm font-medium text-white">Security Alerts</p>
                                    <p className="text-xs text-slate-400">Immediate alerts for failed login attempts.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notifySecurity}
                                        onChange={(e) => setNotifySecurity(e.target.checked)}
                                    />
                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Branding Settings */}
                <section id="branding" className="bg-[#1a1d21] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-slate-800 bg-slate-800/20">
                        <div className="flex items-center gap-3">
                            <Palette className="text-pink-500" />
                            <h2 className="text-lg font-bold text-white">Branding & Identity</h2>
                        </div>
                    </div>
                    <div className="p-6 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-slate-300">Site Logo</h4>
                                    {logoUrl && (
                                        <button
                                            onClick={handleRemoveLogo}
                                            className="text-[10px] flex items-center gap-1.5 text-red-500 hover:text-red-400 font-black uppercase tracking-wider transition-colors bg-red-500/10 px-2 py-1 rounded"
                                        >
                                            <Trash2 size={14} className="shrink-0" /> Remove Logo
                                        </button>
                                    )}
                                </div>
                                <label className="border-2 border-dashed border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center gap-3 bg-[#0f1214]/30 hover:bg-[#0f1214]/50 transition-colors cursor-pointer group relative overflow-hidden">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={uploading}
                                    />
                                    {logoUrl ? (
                                        <img
                                            src={getFullImageUrl(logoUrl)}
                                            alt="Site Logo"
                                            className="w-full h-full object-contain p-4"
                                            onError={(e) => {
                                                console.error('Logo failed to load:', e.currentTarget.src);
                                                e.currentTarget.style.opacity = '0.5';
                                            }}
                                        />
                                    ) : (
                                        <>
                                            <div className="size-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {uploading ? (
                                                    <Loader2 size={24} className="animate-spin" />
                                                ) : (
                                                    <Upload size={24} />
                                                )}
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-semibold text-white">Click to upload logo</p>
                                                <p className="text-[10px] text-slate-500">SVG, PNG, or JPG (max 2MB)</p>
                                            </div>
                                        </>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 size={32} className="animate-spin text-white" />
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-slate-300">Site Favicon</h4>
                                    {faviconUrl && (
                                        <button
                                            onClick={handleRemoveFavicon}
                                            className="text-[10px] flex items-center gap-1.5 text-red-500 hover:text-red-400 font-black uppercase tracking-wider transition-colors bg-red-500/10 px-2 py-1 rounded"
                                        >
                                            <Trash2 size={14} className="shrink-0" /> Remove Favicon
                                        </button>
                                    )}
                                </div>
                                <label className="border-2 border-dashed border-slate-700 rounded-xl h-40 flex flex-col items-center justify-center gap-3 bg-[#0f1214]/30 hover:bg-[#0f1214]/50 transition-colors cursor-pointer group relative overflow-hidden">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".ico,.png,.jpg,.jpeg,.svg"
                                        onChange={handleFaviconChange}
                                        disabled={uploading}
                                    />
                                    {faviconUrl ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <img
                                                src={getFullImageUrl(faviconUrl)}
                                                alt="Site Favicon"
                                                className="size-16 object-contain"
                                                onError={(e) => {
                                                    console.error('Favicon failed to load:', e.currentTarget.src);
                                                    e.currentTarget.style.opacity = '0.5';
                                                }}
                                            />
                                            <p className="text-[10px] text-slate-500 font-mono">{faviconUrl.split('/').pop()}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="size-14 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {uploading ? (
                                                    <Loader2 size={24} className="animate-spin" />
                                                ) : (
                                                    <Upload size={24} />
                                                )}
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-xs font-semibold text-white">Click to upload favicon</p>
                                                <p className="text-[10px] text-slate-500">ICO, PNG, or SVG (max 1MB)</p>
                                            </div>
                                        </>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <Loader2 size={32} className="animate-spin text-white" />
                                        </div>
                                    )}
                                </label>
                            </div>
                            <div className="col-span-full border-t border-slate-800/50 pt-8 mt-4">
                                <h4 className="text-sm font-semibold text-slate-300 mb-4">Primary Theme Color</h4>
                                <div className="grid grid-cols-5 gap-3">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setPrimaryColor(color)}
                                            className={`size-10 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-card-dark transition-all ${primaryColor === color ? 'ring-2 ring-slate-400' : ''}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {primaryColor === color && <Check className="text-white mx-auto" size={16} />}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-slate-300">Color Wheel Selection</label>
                                        <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-mono font-bold uppercase ring-1 ring-primary/30">
                                            {primaryColor}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 bg-[#0f1214]/50 p-4 rounded-xl border border-slate-800 group hover:border-primary/50 transition-all shadow-lg">
                                        <div className="relative size-14 flex-shrink-0">
                                            <input
                                                type="color"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div
                                                className="w-full h-full rounded-full border-2 border-white/10 shadow-xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105"
                                                style={{ background: `conic-gradient(from 0deg, red, yellow, lime, aqua, blue, magenta, red)` }}
                                            >
                                                <div className="size-8 rounded-full border-2 border-white shadow-md pointer-events-none" style={{ backgroundColor: primaryColor }} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs font-black text-white uppercase tracking-wider mb-1">Pick Theme Color</p>
                                            <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Click the wheel to choose a custom primary color for the website.</p>
                                        </div>
                                        <div className="h-10 w-[1px] bg-slate-800 mx-2"></div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Hex Code</span>
                                            <input
                                                type="text"
                                                value={primaryColor}
                                                onChange={(e) => setPrimaryColor(e.target.value)}
                                                className="bg-transparent border-none text-sm font-mono text-primary focus:ring-0 w-20 uppercase font-black text-right p-0"
                                                placeholder="#135BEC"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mb-12">
                    <div className="flex items-center gap-2 text-slate-500 italic">
                        <History size={14} />
                        <span className="text-xs">Last configuration update was 4 hours ago by karthik_admin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="px-6 py-2.5 rounded-lg text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all">Discard Changes</button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-10 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" /> Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="font-bold" /> Save All Settings
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
