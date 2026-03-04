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
    Check,
    Target,
    Copy,
    Lightbulb,
    Link2,
    Youtube,
    Instagram,
    Linkedin,
    Facebook,
    Twitter,
    Code2,
    ChevronRight,
    HelpCircle,
} from 'lucide-react';
import { fetchSettings, updateSettings } from '../services/settingsApi';

// ─── Reusable Toggle ────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
    </label>
);

// ─── Copy Helper ─────────────────────────────────────────────────────────────
const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="ml-2 p-1 rounded text-slate-500 hover:text-white hover:bg-slate-700 transition-all">
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
        </button>
    );
};

// ─── Input / Textarea ────────────────────────────────────────────────────────
const Input = ({ value, onChange, placeholder = '', type = 'text' }: any) => (
    <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
    />
);
const TextArea = ({ value, onChange, placeholder = '', rows = 3, mono = false }: any) => (
    <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className={`w-full bg-[#0f1214] border border-slate-800 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none ${mono ? 'font-mono' : ''}`}
    />
);

// ─── Label ───────────────────────────────────────────────────────────────────
const Label = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
    <div className="mb-1.5">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-widest">{children}</label>
        {hint && <p className="text-[10px] text-slate-500 mt-0.5">{hint}</p>}
    </div>
);

const SEO = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'technical' | 'tracking' | 'social' | 'advanced' | 'keywords' | 'pages'>('content');

    // Content
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [metaKeywords, setMetaKeywords] = useState('');

    // Technical
    const [robotsTxt, setRobotsTxt] = useState('User-agent: *\nAllow: /');
    const [sitemapEnabled, setSitemapEnabled] = useState(true);

    // Tracking
    const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
    const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState('');

    // Social
    const [ogTitle, setOgTitle] = useState('');
    const [ogDescription, setOgDescription] = useState('');
    const [ogImage, setOgImage] = useState('');
    const [twitterHandle, setTwitterHandle] = useState('');
    const [facebookUrl, setFacebookUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [linkedinUrl, setLinkedinUrl] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [primaryKeywords, setPrimaryKeywords] = useState<string[]>([]);
    const [longTailKeywords, setLongTailKeywords] = useState<string[]>([]);
    const [newPrimaryKeyword, setNewPrimaryKeyword] = useState('');
    const [newLongTailKeyword, setNewLongTailKeyword] = useState('');

    // Advanced
    const [faqEnabled, setFaqEnabled] = useState(true);
    const [breadcrumbEnabled, setBreadcrumbEnabled] = useState(true);
    const [organizationEnabled, setOrganizationEnabled] = useState(true);
    const [faqItems, setFaqItems] = useState<Array<{ question: string; answer: string }>>([]);
    const [newFaqQuestion, setNewFaqQuestion] = useState('');
    const [newFaqAnswer, setNewFaqAnswer] = useState('');

    // Per-Page SEO
    const PAGE_DEFINITIONS = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/practice', label: 'Practice', icon: '⌨️' },
        { path: '/test', label: 'Speed Test', icon: '⏱️' },
        { path: '/ezhuthidu', label: 'Ezhuthidu', icon: '🎮' },
        { path: '/keyboard-layout', label: 'Keyboard Layout', icon: '🗝️' },
        { path: '/about', label: 'About', icon: 'ℹ️' },
        { path: '/tournament', label: 'Tournament', icon: '🏆' },
    ];
    const [pagesSeo, setPagesSeo] = useState<Array<{ path: string; title: string; description: string; keywords: string }>>(
        PAGE_DEFINITIONS.map(p => ({ path: p.path, title: '', description: '', keywords: '' }))
    );
    const updatePageSeo = (path: string, field: 'title' | 'description' | 'keywords', value: string) => {
        setPagesSeo(prev => prev.map(p => p.path === path ? { ...p, [field]: value } : p));
    };
    const getPageSeo = (path: string) => pagesSeo.find(p => p.path === path) || { path, title: '', description: '', keywords: '' };

    useEffect(() => { loadSettings(); }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await fetchSettings();
            if (settings.seo) {
                const s = settings.seo;
                setMetaTitle(s.metaTitle || '');
                setMetaDescription(s.metaDescription || '');
                setMetaKeywords(s.metaKeywords || '');
                setRobotsTxt(s.robotsTxt || 'User-agent: *\nAllow: /');
                setSitemapEnabled(s.sitemapEnabled !== undefined ? s.sitemapEnabled : true);
                setGoogleAnalyticsId(s.googleAnalyticsId || '');
                setGoogleSearchConsoleId(s.googleSearchConsoleId || '');
                setOgTitle(s.ogTitle || '');
                setOgDescription(s.ogDescription || '');
                setOgImage(s.ogImage || '');
                setTwitterHandle(s.twitterHandle || '');
                setFacebookUrl(s.socialLinks?.facebook || '');
                setInstagramUrl(s.socialLinks?.instagram || '');
                setLinkedinUrl(s.socialLinks?.linkedin || '');
                setYoutubeUrl(s.socialLinks?.youtube || '');
                setPrimaryKeywords(s.primaryKeywords || []);
                setLongTailKeywords(s.longTailKeywords || []);
                if (s.schemaSettings) {
                    setFaqEnabled(s.schemaSettings.faqEnabled !== undefined ? s.schemaSettings.faqEnabled : true);
                    setBreadcrumbEnabled(s.schemaSettings.breadcrumbEnabled !== undefined ? s.schemaSettings.breadcrumbEnabled : true);
                    setOrganizationEnabled(s.schemaSettings.organizationEnabled !== undefined ? s.schemaSettings.organizationEnabled : true);
                    setFaqItems(s.schemaSettings.faqItems || []);
                }
            }
            if ((settings as any).pagesSeo?.length) {
                setPagesSeo(prev => prev.map(p => {
                    const saved = (settings as any).pagesSeo.find((s: any) => s.path === p.path);
                    return saved ? { ...p, ...saved } : p;
                }));
            }
        } catch (error: any) {
            showNotification('error', 'Failed to load settings: ' + error.message);
        } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const currentSettings = await fetchSettings();
            await updateSettings({
                ...currentSettings,
                seo: {
                    ...currentSettings.seo,
                    metaTitle, metaDescription, metaKeywords,
                    robotsTxt, sitemapEnabled,
                    googleAnalyticsId, googleSearchConsoleId,
                    ogTitle, ogDescription, ogImage, twitterHandle,
                    socialLinks: { facebook: facebookUrl, instagram: instagramUrl, linkedin: linkedinUrl, youtube: youtubeUrl },
                    schemaSettings: {
                        faqEnabled,
                        breadcrumbEnabled,
                        organizationEnabled,
                        faqItems
                    },
                    primaryKeywords,
                    longTailKeywords
                },
                pagesSeo
            });
            showNotification('success', 'SEO settings saved successfully!');
        } catch (error: any) {
            showNotification('error', 'Failed to save: ' + error.message);
        } finally { setSaving(false); }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

    // ── Schema JSON-LD preview ────────────────────────────────────────────────
    const schemaPreview = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            organizationEnabled && {
                '@type': 'Organization',
                name: metaTitle?.split('–')[0]?.trim() || 'எழுத்திடு',
                url: 'https://ezhuthidu.com',
                logo: ogImage || 'https://ezhuthidu.com/logo.png',
                sameAs: [facebookUrl, instagramUrl, linkedinUrl, youtubeUrl].filter(Boolean)
            },
            breadcrumbEnabled && {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://ezhuthidu.com' },
                    { '@type': 'ListItem', position: 2, name: 'Practice', item: 'https://ezhuthidu.com/practice' }
                ]
            },
            faqEnabled && faqItems.length > 0 && {
                '@type': 'FAQPage',
                mainEntity: faqItems.map(item => ({
                    '@type': 'Question',
                    name: item.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: item.answer
                    }
                }))
            }
        ].filter(Boolean)
    }, null, 2);

    // const primaryKeywords = ['tamil typing game', 'tamil typing practice', 'tamil typing speed test', 'learn tamil typing online'];
    // const longTailKeywords = ['how to learn tamil typing fast', 'tamil keyboard typing practice online', 'free tamil typing speed test', 'best tamil typing game online', 'tamil typing practice for beginners'];
    const urlSlugs = ['/learn-tamil-typing', '/tamil-typing-practice', '/tamil-typing-speed-test', '/tamil-keyboard-layout', '/tamil-typing-game'];

    // Generic SEO strength scoring
    const getSEOStrength = (type: 'title' | 'description' | 'keywords', value: string): { label: string; score: 'weak' | 'medium' | 'strong'; bar: number } => {
        const len = value.trim().length;
        if (type === 'title') {
            if (len >= 50 && len <= 60) return { label: 'Strong', score: 'strong', bar: 100 };
            if (len >= 30 && len <= 70) return { label: 'Medium', score: 'medium', bar: 65 };
            return { label: 'Weak', score: 'weak', bar: 30 };
        }
        if (type === 'description') {
            if (len >= 120 && len <= 160) return { label: 'Strong', score: 'strong', bar: 100 };
            if (len >= 60 && len <= 180) return { label: 'Medium', score: 'medium', bar: 65 };
            return { label: 'Weak', score: 'weak', bar: 30 };
        }
        // Keywords
        const words = value.trim().split(/\s+/).filter(Boolean).length;
        if (words >= 4 && len >= 25) return { label: 'Strong', score: 'strong', bar: 100 };
        if (words >= 3 || len >= 18) return { label: 'Medium', score: 'medium', bar: 65 };
        return { label: 'Weak', score: 'weak', bar: 30 };
    };

    const strengthStyles = {
        weak: { badge: 'bg-red-500/20 text-red-400', bar: 'bg-red-500', dot: 'bg-red-500' },
        medium: { badge: 'bg-yellow-500/20 text-yellow-400', bar: 'bg-yellow-500', dot: 'bg-yellow-500' },
        strong: { badge: 'bg-emerald-500/20 text-emerald-400', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
    };

    const tabs = [
        { id: 'content', label: 'Content', icon: FileText },
        { id: 'technical', label: 'Technical', icon: Settings },
        { id: 'tracking', label: 'Analytics', icon: BarChart3 },
        { id: 'social', label: 'Social', icon: Share2 },
        { id: 'advanced', label: 'Schema', icon: ListChecks },
        { id: 'pages', label: 'Pages', icon: Globe },
        { id: 'keywords', label: 'Keywords', icon: Target },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'} text-white`}>
                    {notification.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                        <Globe className="text-blue-500" size={24} /> SEO Manager
                        <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">PRO Suite</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Manage metadata, schema, keywords, analytics, and social signals.</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg text-sm font-bold shadow transition-all flex items-center gap-2">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                    Save All
                </button>
            </div>

            {/* Health Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Mobile Friendly', status: 'Optimal', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'SSL Protocol', status: 'Secure', icon: ShieldCheck, color: 'text-emerald-500' },
                    { label: 'Title Length', status: metaTitle.length > 0 ? (metaTitle.length <= 60 ? 'Good' : 'Too Long') : 'Not Set', icon: Activity, color: metaTitle.length > 60 ? 'text-orange-500' : 'text-emerald-500' },
                    { label: 'Indexability', status: sitemapEnabled ? 'Sitemap Active' : 'Sitemap Off', icon: Search, color: sitemapEnabled ? 'text-blue-500' : 'text-orange-500' },
                ].map((m, i) => (
                    <div key={i} className="bg-[#1a1d21] border border-slate-800 p-3 rounded-xl flex items-center gap-3">
                        <div className={`p-2 bg-slate-800/50 rounded-lg ${m.color}`}><m.icon size={16} /></div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</p>
                            <p className="text-xs font-bold text-white">{m.status}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <aside className="lg:w-52 flex-shrink-0">
                    <div className="bg-[#1a1d21] border border-slate-800 rounded-xl p-2 space-y-1">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white shadow' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <main className="flex-1 bg-[#1a1d21] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="p-6 md:p-8">

                        {/* ── TAB: Content ─────────────────────────────── */}
                        {activeTab === 'content' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Content Optimization</h3>
                                    <p className="text-xs text-slate-400">Optimize your homepage metadata for organic search visibility.</p>
                                </div>

                                {/* Google Preview */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-5">
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><Search size={11} /> Google Search Preview</p>
                                    <div className="text-blue-400 text-lg font-medium hover:underline cursor-pointer truncate">{metaTitle || 'Tamil Typing Game – Practice Tamil Typing Online & Improve Speed'}</div>
                                    <div className="text-emerald-700 text-xs mt-0.5">https://ezhuthidu.com</div>
                                    <div className="text-slate-400 text-sm mt-1 line-clamp-2 leading-relaxed">{metaDescription || 'Master Tamil typing today. Start your free test on the most advanced platform.'}</div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <Label hint="Keep under 60 characters for best results.">Meta Title</Label>
                                            {metaTitle && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('title', metaTitle).score].badge}`}>
                                                    {getSEOStrength('title', metaTitle).label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input value={metaTitle} onChange={setMetaTitle} placeholder="Tamil Typing Game – Practice Tamil Typing Online & Improve Speed" />
                                            {metaTitle && (
                                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('title', metaTitle).score].bar}`}
                                                        style={{ width: `${getSEOStrength('title', metaTitle).bar}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-[10px] mt-1 ${metaTitle.length > 60 ? 'text-orange-400' : 'text-slate-500'}`}>{metaTitle.length} / 60 chars</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <Label hint="Keep under 160 characters.">Meta Description</Label>
                                            {metaDescription && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('description', metaDescription).score].badge}`}>
                                                    {getSEOStrength('description', metaDescription).label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <TextArea value={metaDescription} onChange={setMetaDescription} rows={3} placeholder="Learn and master Tamil typing with interactive lessons, speed tests, and tournaments. Free online platform." />
                                            {metaDescription && (
                                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('description', metaDescription).score].bar}`}
                                                        style={{ width: `${getSEOStrength('description', metaDescription).bar}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <p className={`text-[10px] mt-1 ${metaDescription.length > 160 ? 'text-orange-400' : 'text-slate-500'}`}>{metaDescription.length} / 160 chars</p>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-end mb-1">
                                            <Label hint="Comma-separated. Focus on 3–5 primary keywords.">Target Keywords</Label>
                                            {metaKeywords && (
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('keywords', metaKeywords).score].badge}`}>
                                                    {getSEOStrength('keywords', metaKeywords).label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Input value={metaKeywords} onChange={setMetaKeywords} placeholder="tamil typing game, tamil typing practice, tamil typing speed test, learn tamil typing" />
                                            {metaKeywords && (
                                                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('keywords', metaKeywords).score].bar}`}
                                                        style={{ width: `${getSEOStrength('keywords', metaKeywords).bar}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Snippet Tip */}
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-bold"><Lightbulb size={14} /> Featured Snippet Optimizer (Position #0)</div>
                                    <p className="text-[11px] text-slate-400 mb-3">Format your content as a numbered list to appear above organic results. Include this in your page HTML:</p>
                                    <div className="bg-[#0f1214] rounded-lg p-3 font-mono text-[10px] text-emerald-400 relative">
                                        <div className="flex justify-between items-start">
                                            <pre className="whitespace-pre-wrap">{`<h2>How to learn Tamil typing fast?</h2>
<ol>
  <li>Learn Tamil keyboard layout</li>
  <li>Practice typing daily</li>
  <li>Use online typing games</li>
  <li>Track your typing speed</li>
</ol>`}</pre>
                                            <CopyButton text={`<h2>How to learn Tamil typing fast?</h2>\n<ol>\n  <li>Learn Tamil keyboard layout</li>\n  <li>Practice typing daily</li>\n  <li>Use online typing games</li>\n  <li>Track your typing speed</li>\n</ol>`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Technical ─────────────────────────── */}
                        {activeTab === 'technical' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Technical Foundation</h3>
                                    <p className="text-xs text-slate-400">Control crawl instructions and site indexability.</p>
                                </div>
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-slate-300">SSL (HTTPS) is active. The platform uses clean URL structures optimized for search engine crawling.</p>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-[#0f1214] border border-slate-800 rounded-xl">
                                    <div>
                                        <p className="text-sm font-bold text-white">XML Sitemap</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">Auto-generate sitemap.xml with all important routes.</p>
                                        <a href="/api/sitemap.xml" target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 flex items-center gap-1 mt-1 hover:underline"><ExternalLink size={10} /> View sitemap.xml</a>
                                    </div>
                                    <Toggle checked={sitemapEnabled} onChange={setSitemapEnabled} />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label>robots.txt Editor</Label>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500 font-mono">/robots.txt</span>
                                            <a href="/api/robots.txt" target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"><ExternalLink size={10} /> View</a>
                                        </div>
                                    </div>
                                    <TextArea value={robotsTxt} onChange={setRobotsTxt} rows={8} mono />
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Analytics ────────────────────────── */}
                        {activeTab === 'tracking' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Analytics & Performance</h3>
                                    <p className="text-xs text-slate-400">Connect Google's tracking and search tools.</p>
                                </div>

                                {/* GA4 Card */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><BarChart3 size={20} /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Google Analytics 4</h4>
                                            <p className="text-[10px] text-slate-500">Paste your GA4 Measurement ID to activate tracking.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label>Measurement ID</Label>
                                        <Input value={googleAnalyticsId} onChange={setGoogleAnalyticsId} placeholder="G-XXXXXXXXXX" />
                                    </div>
                                </div>

                                {/* GSC Card */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Search size={20} /></div>
                                        <div>
                                            <h4 className="text-white font-bold text-sm">Google Search Console</h4>
                                            <p className="text-[10px] text-slate-500">Verify your site with Google so it appears in search results.</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Label hint="Copy the content= value from the HTML tag in GSC and paste it here.">Verification ID</Label>
                                        <Input value={googleSearchConsoleId} onChange={setGoogleSearchConsoleId} placeholder="e.g. google1234abc5678def..." />
                                    </div>
                                    <a
                                        href="https://search.google.com/search-console/welcome"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-all shadow shadow-blue-600/30"
                                    >
                                        <Search size={15} />
                                        Connect to Google Search Console
                                        <ExternalLink size={13} />
                                    </a>
                                    <p className="text-[10px] text-slate-500 text-center">After connecting, paste your Verification ID above and click <strong className="text-slate-300">Save All</strong>.</p>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Social ───────────────────────────── */}
                        {activeTab === 'social' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Social Sharing & Presence</h3>
                                    <p className="text-xs text-slate-400">Manage Open Graph, Twitter cards, and social profile links.</p>
                                </div>

                                {/* OG Preview */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl overflow-hidden">
                                    <div className="bg-slate-800/50 h-24 flex items-center justify-center text-slate-600 text-xs">
                                        {ogImage ? <img src={ogImage} alt="OG Preview" className="h-full w-full object-cover" /> : 'OG Image Preview (paste URL below)'}
                                    </div>
                                    <div className="p-3 border-t border-slate-800">
                                        <p className="text-blue-400 text-sm font-bold">{ogTitle || metaTitle || 'எழுத்திடு – Tamil Typing Platform'}</p>
                                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-2">{ogDescription || metaDescription || 'Master Tamil typing through engagement and fun.'}</p>
                                        <p className="text-slate-600 text-[10px] mt-1">ezhuthidu.com</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>OG Title (Facebook / LinkedIn)</Label>
                                        <Input value={ogTitle} onChange={setOgTitle} placeholder="Tamil Typing Game – Practice Online" />
                                    </div>
                                    <div>
                                        <Label>OG Image URL</Label>
                                        <Input value={ogImage} onChange={setOgImage} placeholder="https://ezhuthidu.com/og-image.png" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <Label>OG Description</Label>
                                        <TextArea value={ogDescription} onChange={setOgDescription} rows={2} placeholder="Master Tamil typing with interactive tests and tournaments." />
                                    </div>
                                    <div>
                                        <Label>Twitter / X Handle</Label>
                                        <Input value={twitterHandle} onChange={setTwitterHandle} placeholder="@ezhuthidu" />
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2"><Link2 size={14} /> Social Profile Links</h4>
                                    <p className="text-[11px] text-slate-400 mb-3">These are embedded in your Schema markup and boost brand signals. Create pages on each platform linking back to your site.</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {[
                                            { icon: Youtube, label: 'YouTube Channel URL', value: youtubeUrl, set: setYoutubeUrl, placeholder: 'https://youtube.com/@ezhuthidu' },
                                            { icon: Instagram, label: 'Instagram Profile URL', value: instagramUrl, set: setInstagramUrl, placeholder: 'https://instagram.com/ezhuthidu' },
                                            { icon: Facebook, label: 'Facebook Page URL', value: facebookUrl, set: setFacebookUrl, placeholder: 'https://facebook.com/ezhuthidu' },
                                            { icon: Linkedin, label: 'LinkedIn Page URL', value: linkedinUrl, set: setLinkedinUrl, placeholder: 'https://linkedin.com/company/ezhuthidu' },
                                        ].map(({ icon: Icon, label, value, set, placeholder }) => (
                                            <div key={label} className="flex items-center gap-3 bg-[#0f1214] border border-slate-800 rounded-lg px-3 py-2">
                                                <Icon size={16} className="text-slate-500 flex-shrink-0" />
                                                <input value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
                                                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-600" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Advanced Schema ──────────────────── */}
                        {activeTab === 'advanced' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Structured Data (Schema)</h3>
                                    <p className="text-xs text-slate-400">Generate JSON-LD rich snippets for FAQ, Breadcrumbs, and Organization info.</p>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { id: 'org', label: 'WebApplication Schema', desc: 'Marks your site as a web app with sameAs social links.', state: organizationEnabled, setter: setOrganizationEnabled },
                                        { id: 'bc', label: 'Breadcrumb Schema', desc: 'Displays navigation path in Google results.', state: breadcrumbEnabled, setter: setBreadcrumbEnabled },
                                        { id: 'faq', label: 'FAQ Schema', desc: 'Enables Q&A snippets above organic results (Position #0).', state: faqEnabled, setter: setFaqEnabled },
                                    ].map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-[#0f1214] border border-slate-800 rounded-2xl hover:border-blue-500/40 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${item.state ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-600'}`}><Check size={16} /></div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{item.label}</p>
                                                    <p className="text-[10px] text-slate-500">{item.desc}</p>
                                                </div>
                                            </div>
                                            <Toggle checked={item.state} onChange={item.setter} />
                                        </div>
                                    ))}
                                </div>

                                {faqEnabled && (
                                    <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-white font-bold text-sm">FAQ Management</h4>
                                            <span className="text-[10px] text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full font-bold">Position #0 Strategy</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 gap-3 p-4 bg-slate-800/20 border border-slate-800 rounded-xl">
                                                <div>
                                                    <Label>Question</Label>
                                                    <Input
                                                        value={newFaqQuestion}
                                                        onChange={setNewFaqQuestion}
                                                        placeholder="e.g. How to learn Tamil typing fast?"
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Answer</Label>
                                                    <TextArea
                                                        value={newFaqAnswer}
                                                        onChange={setNewFaqAnswer}
                                                        rows={2}
                                                        placeholder="e.g. Practice daily using online games like Ezhuthidu..."
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (newFaqQuestion.trim() && newFaqAnswer.trim()) {
                                                            setFaqItems([...faqItems, { question: newFaqQuestion.trim(), answer: newFaqAnswer.trim() }]);
                                                            setNewFaqQuestion('');
                                                            setNewFaqAnswer('');
                                                        }
                                                    }}
                                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                                                >
                                                    Add Question to FAQ
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                {faqItems.map((item, idx) => (
                                                    <div key={idx} className="group relative bg-[#0f1214] border border-slate-800 rounded-xl p-4 transition-all hover:border-slate-700">
                                                        <button
                                                            onClick={() => setFaqItems(faqItems.filter((_, i) => i !== idx))}
                                                            className="absolute top-2 right-2 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <XCircle size={16} />
                                                        </button>
                                                        <h5 className="text-white text-sm font-bold flex items-center gap-2 pr-6">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            {item.question}
                                                        </h5>
                                                        <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.answer}</p>
                                                    </div>
                                                ))}
                                                {faqItems.length === 0 && (
                                                    <div className="text-center py-8 border border-dashed border-slate-800 rounded-xl">
                                                        <HelpCircle size={32} className="mx-auto text-slate-700 mb-2" />
                                                        <p className="text-xs text-slate-500 font-medium">No FAQ items yet.</p>
                                                        <p className="text-[10px] text-slate-600">Add questions above to generate FAQ schema.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* JSON-LD Live Preview */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><Code2 size={13} /> Live JSON-LD Preview</div>
                                        <CopyButton text={`<script type="application/ld+json">\n${schemaPreview}\n</script>`} />
                                    </div>
                                    <pre className="text-[10px] font-mono text-emerald-400 overflow-auto max-h-72 whitespace-pre-wrap">{schemaPreview}</pre>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Keywords & Strategy ──────────────── */}
                        {activeTab === 'keywords' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Keyword Strategy</h3>
                                    <p className="text-xs text-slate-400">Target low-competition keywords first, then move to competitive ones.</p>
                                </div>

                                {/* Primary Keywords */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Target size={14} className="text-blue-400" /> Primary Keywords (Homepage)</h4>
                                    <p className="text-[10px] text-slate-500 mb-3">Use these in your homepage title, meta description, and H1.</p>

                                    <div className="flex gap-2 mb-4">
                                        <input
                                            value={newPrimaryKeyword}
                                            onChange={e => setNewPrimaryKeyword(e.target.value)}
                                            placeholder="Add new primary keyword..."
                                            className="flex-1 bg-[#0f1214] border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && newPrimaryKeyword.trim()) {
                                                    setPrimaryKeywords([...primaryKeywords, newPrimaryKeyword.trim()]);
                                                    setNewPrimaryKeyword('');
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newPrimaryKeyword.trim()) {
                                                    setPrimaryKeywords([...primaryKeywords, newPrimaryKeyword.trim()]);
                                                    setNewPrimaryKeyword('');
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {primaryKeywords.map((kw, idx) => {
                                            const s = getSEOStrength('keywords', kw);
                                            const style = strengthStyles[s.score];
                                            return (
                                                <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                                                    <span className="text-sm text-blue-300 font-mono flex-1">{kw}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${s.bar}%` }} />
                                                        </div>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${style.badge}`}>{s.label}</span>
                                                        <CopyButton text={kw} />
                                                        <button onClick={() => setPrimaryKeywords(primaryKeywords.filter((_, i) => i !== idx))} className="p-1 text-slate-500 hover:text-red-400">
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Long-Tail */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Search size={14} className="text-purple-400" /> Long-Tail Keywords (Fast Ranking)</h4>
                                    <p className="text-[10px] text-slate-500 mb-3">Create separate pages for each. These rank faster and drive targeted traffic.</p>

                                    <div className="flex gap-2 mb-4">
                                        <input
                                            value={newLongTailKeyword}
                                            onChange={e => setNewLongTailKeyword(e.target.value)}
                                            placeholder="Add new long-tail keyword..."
                                            className="flex-1 bg-[#0f1214] border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-purple-500 outline-none"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && newLongTailKeyword.trim()) {
                                                    setLongTailKeywords([...longTailKeywords, newLongTailKeyword.trim()]);
                                                    setNewLongTailKeyword('');
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                if (newLongTailKeyword.trim()) {
                                                    setLongTailKeywords([...longTailKeywords, newLongTailKeyword.trim()]);
                                                    setNewLongTailKeyword('');
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-all"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {longTailKeywords.map((kw, idx) => {
                                            const s = getSEOStrength('keywords', kw);
                                            const style = strengthStyles[s.score];
                                            return (
                                                <div key={idx} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                                                    <span className="text-sm text-purple-300 font-mono flex-1">{kw}</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${s.bar}%` }} />
                                                        </div>
                                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${style.badge}`}>{s.label}</span>
                                                        <CopyButton text={kw} />
                                                        <button onClick={() => setLongTailKeywords(longTailKeywords.filter((_, i) => i !== idx))} className="p-1 text-slate-500 hover:text-red-400">
                                                            <XCircle size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* URL Slugs */}
                                <div className="bg-[#0f1214] border border-slate-800 rounded-xl p-5">
                                    <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2"><Link2 size={14} className="text-amber-400" /> Recommended Page URL Slugs</h4>
                                    <p className="text-[10px] text-slate-500 mb-3">Create these pages to build topical authority. Each page should have 800–1500 words.</p>
                                    <div className="space-y-2">
                                        {urlSlugs.map(slug => (
                                            <div key={slug} className="flex items-center justify-between bg-slate-800/50 rounded-lg px-3 py-2">
                                                <span className="text-sm font-mono text-amber-300">ezhuthidu.com{slug}</span>
                                                <CopyButton text={`https://ezhuthidu.com${slug}`} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Schedule */}
                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-blue-400 mb-2 flex items-center gap-2"><FileText size={14} /> Content Publishing Schedule</h4>
                                    <p className="text-[11px] text-slate-400 mb-3">Google prefers active websites. Publish 2 articles per week on these topics:</p>
                                    <div className="space-y-1.5">
                                        {['10 Tips to Improve Tamil Typing Speed', 'Best Tamil Typing Practice Methods', 'How to Type Tamil Faster with Keyboard Shortcuts', 'Tamil Keyboard Layout – Complete Beginner Guide', 'Tamil Typing Accuracy: How to Type Without Mistakes'].map(topic => (
                                            <div key={topic} className="flex items-center gap-2 text-xs text-slate-300">
                                                <ChevronRight size={12} className="text-blue-400 flex-shrink-0" />
                                                {topic}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Backlink Sources */}
                                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-emerald-400 mb-2 flex items-center gap-2"><ExternalLink size={14} /> Free High-Authority Backlink Sources</h4>
                                    <p className="text-[11px] text-slate-400 mb-3">Create articles on these platforms linking back to your site (do this 20–30 times):</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Medium', 'Dev.to', 'Hashnode', 'Quora', 'Reddit', 'Blogger', 'WordPress.com'].map(site => (
                                            <span key={site} className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full font-bold">{site}</span>
                                        ))}
                                    </div>
                                    <div className="mt-3 bg-[#0f1214] rounded-lg p-3 font-mono text-[10px] text-slate-400">
                                        <p className="text-emerald-400"># Example article title:</p>
                                        <p>"How to Learn Tamil Typing Fast (Complete Guide)"</p>
                                        <p className="mt-2 text-emerald-400"># Inside article:</p>
                                        <p>Practice Tamil typing online:</p>
                                        <p className="text-blue-400">https://ezhuthidu.com</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── TAB: Pages ───────────────────────────── */}
                        {activeTab === 'pages' && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Per-Page SEO</h3>
                                    <p className="text-xs text-slate-400">Set a unique title, description, and keywords for each page. These override the global homepage settings on the live site.</p>
                                </div>

                                {PAGE_DEFINITIONS.map(({ path, label, icon }) => {
                                    const seo = getPageSeo(path);
                                    const titleLen = seo.title.length;
                                    const descLen = seo.description.length;
                                    return (
                                        <div key={path} className="bg-[#0f1214] border border-slate-800 hover:border-blue-500/30 rounded-2xl p-5 space-y-4 transition-all">
                                            {/* Page header */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{icon}</span>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-white">{label}</p>
                                                    <p className="text-[10px] font-mono text-slate-500">ezhuthidu.com{path}</p>
                                                </div>
                                                {seo.title && (
                                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Configured</span>
                                                )}
                                            </div>

                                            {/* Google preview */}
                                            {(seo.title || seo.description) && (
                                                <div className="bg-slate-900 rounded-lg px-4 py-3">
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Search size={9} /> Preview</p>
                                                    <p className="text-blue-400 text-sm font-medium truncate">{seo.title || 'Page Title'}</p>
                                                    <p className="text-emerald-700 text-[10px]">https://ezhuthidu.com{path}</p>
                                                    <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{seo.description}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Page Title</span>
                                                        <div className="flex items-center gap-2">
                                                            {seo.title && (
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('title', seo.title).score].badge}`}>
                                                                    {getSEOStrength('title', seo.title).label}
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] ${titleLen > 60 ? 'text-orange-400' : 'text-slate-600'}`}>{titleLen}/60</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            value={seo.title}
                                                            onChange={e => updatePageSeo(path, 'title', e.target.value)}
                                                            placeholder={`${label} | Tamil Typing – Ezhuthidu`}
                                                            className="w-full bg-[#1a1d21] border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                        {seo.title && (
                                                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('title', seo.title).score].bar}`}
                                                                    style={{ width: `${getSEOStrength('title', seo.title).bar}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keywords</span>
                                                        {seo.keywords && (
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('keywords', seo.keywords).score].badge}`}>
                                                                {getSEOStrength('keywords', seo.keywords).label}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="relative">
                                                        <input
                                                            value={seo.keywords}
                                                            onChange={e => updatePageSeo(path, 'keywords', e.target.value)}
                                                            placeholder="online tamil typing, free practice..."
                                                            className="w-full bg-[#1a1d21] border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                        />
                                                        {seo.keywords && (
                                                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('keywords', seo.keywords).score].bar}`}
                                                                    style={{ width: `${getSEOStrength('keywords', seo.keywords).bar}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Meta Description</span>
                                                        <div className="flex items-center gap-2">
                                                            {seo.description && (
                                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${strengthStyles[getSEOStrength('description', seo.description).score].badge}`}>
                                                                    {getSEOStrength('description', seo.description).label}
                                                                </span>
                                                            )}
                                                            <span className={`text-[10px] ${descLen > 160 ? 'text-orange-400' : 'text-slate-600'}`}>{descLen}/160</span>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <textarea
                                                            value={seo.description}
                                                            onChange={e => updatePageSeo(path, 'description', e.target.value)}
                                                            rows={2}
                                                            placeholder={`Best ${label.toLowerCase()} platform for Tamil typing. Free, fast, and fun.`}
                                                            className="w-full bg-[#1a1d21] border border-slate-800 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                                        />
                                                        {seo.description && (
                                                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-slate-800 rounded-b-lg overflow-hidden pointer-events-none">
                                                                <div
                                                                    className={`h-full transition-all duration-500 ${strengthStyles[getSEOStrength('description', seo.description).score].bar}`}
                                                                    style={{ width: `${getSEOStrength('description', seo.description).bar}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <Info size={14} className="text-blue-400 flex-shrink-0" />
                                    <p className="text-[11px] text-slate-400">Leave a page blank to use the global SEO settings from the <strong className="text-white">Content</strong> tab.</p>
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
