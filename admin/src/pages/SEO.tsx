import { useState, useEffect } from 'react';
import {
    Globe,
    ExternalLink,
    Info,
    Save,
    CheckCircle,
    XCircle,
    Loader2,
    Settings,
    Search,
    BarChart3,
    Share2,
    ShieldCheck,
    ListChecks,
    Activity,
    FileText,
    Check
} from 'lucide-react';
import { fetchSettings, updateSettings } from '../services/settingsApi';

const SEO = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'technical' | 'tracking' | 'social' | 'advanced'>('content');

    // Content SEO State
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');

    // Technical SEO State
    const [robotsTxt, setRobotsTxt] = useState('');
    const [sitemapEnabled, setSitemapEnabled] = useState(true);

    // Tracking State
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState('');

    // Social SEO State
    const [ogTitle, setOgTitle] = useState('');
    const [ogDescription, setOgDescription] = useState('');
    const [ogImage, setOgImage] = useState('');
    const [twitterHandle, setTwitterHandle] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');

    // Advanced State
    const [faqEnabled, setFaqEnabled] = useState(true);
    const [breadcrumbEnabled, setBreadcrumbEnabled] = useState(true);
    const [organizationEnabled, setOrganizationEnabled] = useState(true);

    // Speed/Health Mock Data (For UI presentation)
    const healthMetrics = [
        { label: 'Mobile Friendly', status: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' },
        { label: 'SSL Protocol', status: 'Secure', icon: ShieldCheck, color: 'text-emerald-500' },
        { label: 'Load Time', status: '1.2s', icon: Activity, color: 'text-emerald-500' },
        { label: 'Indexability', status: 'Active', icon: Search, color: 'text-blue-500' }
    ];

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await fetchSettings();

            if (settings.seo) {
                // Content
                setMetaTitle(settings.seo.metaTitle || '');
                setMetaDescription(settings.seo.metaDescription || '');
                setMetaKeywords(settings.seo.metaKeywords || '');

                // Technical
                setRobotsTxt(settings.seo.robotsTxt || 'User-agent: *\nAllow: /');
                setSitemapEnabled(settings.seo.sitemapEnabled !== undefined ? settings.seo.sitemapEnabled : true);

                // Tracking
                setGoogleAnalyticsId(settings.seo.googleAnalyticsId || '');
                setGoogleSearchConsoleId(settings.seo.googleSearchConsoleId || '');

                // Social
                setOgTitle(settings.seo.ogTitle || '');
                setOgDescription(settings.seo.ogDescription || '');
                setOgImage(settings.seo.ogImage || '');
                setTwitterHandle(settings.seo.twitterHandle || '');
                setFacebookUrl(settings.seo.socialLinks?.facebook || '');
                setInstagramUrl(settings.seo.socialLinks?.instagram || '');
                setLinkedinUrl(settings.seo.socialLinks?.linkedin || '');
                setYoutubeUrl(settings.seo.socialLinks?.youtube || '');

                // Advanced
                if (settings.seo.schemaSettings) {
                    setFaqEnabled(settings.seo.schemaSettings.faqEnabled !== undefined ? settings.seo.schemaSettings.faqEnabled : true);
                    setBreadcrumbEnabled(settings.seo.schemaSettings.breadcrumbEnabled !== undefined ? settings.seo.schemaSettings.breadcrumbEnabled : true);
                    setOrganizationEnabled(settings.seo.schemaSettings.organizationEnabled !== undefined ? settings.seo.schemaSettings.organizationEnabled : true);
                }
            }
        } catch (error: any) {
            showNotification('error', 'Failed to load settings: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const currentSettings = await fetchSettings();

            await updateSettings({
                ...currentSettings,
                seo: {
                    ...currentSettings.seo,
                    metaTitle,
                    metaDescription,
                    metaKeywords,
                    robotsTxt,
                    sitemapEnabled,
                    googleAnalyticsId,
                    googleSearchConsoleId,
                    ogTitle,
                    ogDescription,
                    ogImage,
                    twitterHandle,
                    socialLinks: {
                        facebook: facebookUrl,
                        instagram: instagramUrl,
                        linkedin: linkedinUrl,
                        youtube: youtubeUrl
                    },
                    schemaSettings: {
                        faqEnabled,
                        breadcrumbEnabled,
                        organizationEnabled
                    }
                }
            });
            showNotification('success', 'Full SEO Suite settings saved successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to save settings: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const tabs = [
        { id: 'content', label: 'Content (On-Page)', icon: FileText },
        { id: 'technical', label: 'Technical SEO', icon: Settings },
        { id: 'tracking', label: 'Analytics & GSC', icon: BarChart3 },
        { id: 'social', label: 'Social & Share', icon: Share2 },
        { id: 'advanced', label: 'Advanced Schema', icon: ListChecks },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Notification Banner */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    <span className="font-medium">{notification.message}</span>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Globe className="text-blue-500" /> SEO Manager <span className="text-[10px] bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">PRO Suite</span>
                    </h1>
                    <p className="text-slate-400 mt-2">Manage everything from technical foundations to advanced schema markup.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save All Changes
                </button>
            </div>

            {/* Health Checklist Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {healthMetrics.map((m, i) => (
                    <div key={i} className="bg-[#1a1d21] border border-slate-800 p-4 rounded-xl flex items-center gap-3">
                        <div className={`p-2 bg-slate-800/50 rounded-lg ${m.color}`}>
                            <m.icon size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
                            <p className="text-sm font-bold text-white">{m.status}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Interface Layout */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Desktop Tab Sidebar */}
                <aside className="lg:w-64 flex-shrink-0">
                    <div className="bg-[#1a1d21] border border-slate-800 rounded-xl p-2 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-1 bg-[#1a1d21] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-8">
                        {/* Tab Content: Content (On-Page) */}
                        {activeTab === 'content' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Content Optimization</h3>
                                    <p className="text-sm text-slate-400">Optimize headings and meta data for organic search visibility.</p>
                                </div>

                                {/* Preview Card */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-6 shadow-inner relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-2 opacity-10">
                                        <Search size={80} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        Google Search Preview
                                    </div>
                                    <div className="max-w-xl relative">
                                        <div className="text-blue-400 text-xl font-medium hover:underline cursor-pointer truncate">
                                            {metaTitle || 'எழுத்திடு - Free Tamil & English Typing Test'}
                                        </div>
                                        <div className="text-emerald-700 text-sm mt-1">https://ezhuthidu.com</div>
                                        <div className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">
                                            {metaDescription || 'Master Tamil typing today. Start your free test on the most advanced platform.'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300 flex items-center gap-2">Meta Title</label>
                                        <input
                                            type="text"
                                            value={metaTitle}
                                            onChange={(e) => setMetaTitle(e.target.value)}
                                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="e.g. Free Tamil Typing Test | Master Typing Speed"
                                        />
                                        <div className="text-[10px] flex justify-between">
                                            <span className={metaTitle.length > 60 ? 'text-orange-500' : 'text-slate-500'}>{metaTitle.length} / 60 characters</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300">Meta Description</label>
                                        <textarea
                                            value={metaDescription}
                                            onChange={(e) => setMetaDescription(e.target.value)}
                                            rows={3}
                                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                            placeholder="Describe your platform in 160 characters..."
                                        />
                                        <div className="text-[10px] flex justify-between">
                                            <span className={metaDescription.length > 160 ? 'text-orange-500' : 'text-slate-500'}>{metaDescription.length} / 160 characters</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-300">Target Keywords (Comma-separated)</label>
                                        <input
                                            type="text"
                                            value={metaKeywords}
                                            onChange={(e) => setMetaKeywords(e.target.value)}
                                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="tamil typing, typing test, speed practice"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Technical */}
                        {activeTab === 'technical' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Technical Foundation</h3>
                                    <p className="text-sm text-slate-400">Control indexability and structure crawl instructions.</p>
                                </div>

                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-4">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Info size={20} />
                                    </div>
                                    <div className="text-xs text-slate-300 leading-relaxed">
                                        <strong>SSL (HTTPS)</strong> is active and verified. The platform uses <strong>Clean URL structure</strong> (/en/typing-test) which is optimal for search engine crawling.
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-[#0f1214] border border-slate-800 rounded-xl">
                                        <div>
                                            <p className="text-sm font-bold text-white">XML Sitemap</p>
                                            <p className="text-[10px] text-slate-500">Auto-generate sitemap.xml for search engines.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={sitemapEnabled} onChange={(e) => setSitemapEnabled(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-300">robots.txt Editor</label>
                                            <span className="text-[10px] text-slate-500 font-mono">/robots.txt</span>
                                        </div>
                                        <textarea
                                            value={robotsTxt}
                                            onChange={(e) => setRobotsTxt(e.target.value)}
                                            rows={6}
                                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Tracking */}
                        {activeTab === 'tracking' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Analytics & Performance</h3>
                                    <p className="text-sm text-slate-400">Connect to Google's powerful tracking & search tools.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-8">
                                    <div className="bg-[#0f1214] border border-slate-800 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-[#f97316]/10 rounded-lg text-[#f97316]">
                                                <BarChart3 size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Google Analytics (GA4)</h4>
                                                <p className="text-[10px] text-slate-500">Traffic tracking and user behavior insights.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Measurement ID</label>
                                            <input
                                                type="text"
                                                value={googleAnalyticsId}
                                                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                                                className="bg-slate-800/20 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-orange-500 outline-none"
                                                placeholder="G-XXXXXXXXXX"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#0f1214] border border-slate-800 rounded-2xl p-6 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                                <Search size={24} />
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold text-sm">Google Search Console</h4>
                                                <p className="text-[10px] text-slate-500">Verification and search performance indexing.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification ID</label>
                                            <input
                                                type="text"
                                                value={googleSearchConsoleId}
                                                onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
                                                className="bg-slate-800/20 border border-slate-800 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                                placeholder="Verification string from GSC"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Social */}
                        {activeTab === 'social' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Social Sharing & Presence</h3>
                                    <p className="text-sm text-slate-400">Manage how links appear on Facebook, Twitter, and LinkedIn.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase">OG Title</label>
                                            <input
                                                type="text"
                                                value={ogTitle}
                                                onChange={(e) => setOgTitle(e.target.value)}
                                                className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase">OG Image URL</label>
                                            <input
                                                type="text"
                                                value={ogImage}
                                                onChange={(e) => setOgImage(e.target.value)}
                                                className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase">Twitter Handle</label>
                                            <input
                                                type="text"
                                                value={twitterHandle}
                                                onChange={(e) => setTwitterHandle(e.target.value)}
                                                className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase">Facebook Page URL</label>
                                            <input
                                                type="text"
                                                value={facebookUrl}
                                                onChange={(e) => setFacebookUrl(e.target.value)}
                                                className="bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab Content: Advanced */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">Structured Data (Schema)</h3>
                                    <p className="text-sm text-slate-400">Generate rich snippets for FAQ and organization info.</p>
                                </div>

                                <div className="space-y-4">
                                    {[
                                        { id: 'faq', label: 'FAQ Schema', desc: 'Enable Question/Answer snippets in results.', state: faqEnabled, setter: setFaqEnabled },
                                        { id: 'bc', label: 'Breadcrumb Schema', desc: 'Display navigation path in Google results.', state: breadcrumbEnabled, setter: setBreadcrumbEnabled },
                                        { id: 'org', label: 'Organization Schema', desc: 'Detailed business/platform info snippets.', state: organizationEnabled, setter: setOrganizationEnabled }
                                    ].map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-5 bg-[#0f1214] border border-slate-800 rounded-2xl group hover:border-blue-500/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${item.state ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-600'}`}>
                                                    <Check size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.label}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{item.desc}</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={item.state} onChange={(e) => item.setter(e.target.checked)} />
                                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default SEO;
