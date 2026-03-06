import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit,
    Trash2,
    Megaphone,
    Search,
    Save,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Calendar,
    Layout
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL } from '../config/apiConfig';

interface Advertisement {
    _id: string;
    title: string;
    description?: string;
    ctaText?: string;
    imageUrl?: string;
    linkUrl: string;
    position: 'left-side' | 'right-side';
    isActive: boolean;
    startDate?: string;
    endDate?: string;
    createdAt: string;
}

const PREVIEW_THEMES = [
    { name: 'Emerald', bg: 'from-[#064e3b] via-[#065f46] to-[#0f172a]', accent: 'bg-emerald-500', glow: 'bg-emerald-500/20', button: 'bg-emerald-600' },
    { name: 'Indigo', bg: 'from-[#1e1b4b] via-[#312e81] to-[#0f172a]', accent: 'bg-indigo-500', glow: 'bg-indigo-500/20', button: 'bg-indigo-600' },
    { name: 'Rose', bg: 'from-[#4c0519] via-[#881337] to-[#0f172a]', accent: 'bg-rose-500', glow: 'bg-rose-500/20', button: 'bg-rose-600' },
    { name: 'Cyan', bg: 'from-[#083344] via-[#155e75] to-[#0f172a]', accent: 'bg-cyan-500', glow: 'bg-cyan-500/20', button: 'bg-cyan-600' }
];

const PosterPreview = ({ formData }: { formData: any }) => {
    const [themeIdx, setThemeIdx] = useState(0);
    const theme = PREVIEW_THEMES[themeIdx];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live Preview</label>
                <div className="flex gap-1">
                    {PREVIEW_THEMES.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => setThemeIdx(i)}
                            className={`w-3 h-3 rounded-full border border-white/20 transition-all ${PREVIEW_THEMES[i].accent} ${themeIdx === i ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a1d21] scale-125' : 'opacity-40 hover:opacity-100'}`}
                        />
                    ))}
                </div>
            </div>

            <div className={`aspect-[9/16] w-full rounded-2xl bg-gradient-to-br ${theme.bg} overflow-hidden relative flex flex-col items-center justify-between p-6 text-center shadow-2xl transition-all duration-500 border border-slate-800`}>
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>

                <div className="z-10 mt-2 opacity-30 flex items-center gap-1.5 justify-center">
                    <div className="w-3.5 h-3.5 bg-white/20 rounded-sm" />
                    <span className="text-[7px] text-white font-black uppercase tracking-[0.3em]">Tamil Typing</span>
                </div>

                <div className="z-10 flex flex-col items-center gap-4 py-4 w-full h-full justify-center">
                    <h4 className="text-white text-xl font-black leading-tight uppercase drop-shadow-xl line-clamp-3">
                        {formData.title || 'Your Campaign Title'}
                    </h4>

                    {formData.imageUrl && (
                        <div className="w-full aspect-square max-w-[140px] relative">
                            <div className={`absolute inset-0 ${theme.glow} rounded-2xl blur-xl`}></div>
                            <div className="relative w-full h-full bg-[#0f172a]/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 overflow-hidden shadow-xl flex items-center justify-center">
                                <img
                                    src={formData.imageUrl}
                                    className="max-w-full max-h-full object-contain drop-shadow-lg"
                                    alt="Preview"
                                    onError={(e) => (e.currentTarget.style.display = 'none')}
                                />
                            </div>
                        </div>
                    )}

                    {formData.description && (
                        <p className="text-white/50 text-[10px] font-medium leading-relaxed line-clamp-3 px-2">
                            {formData.description}
                        </p>
                    )}
                </div>

                <div className="z-10 mb-4 w-full px-4">
                    <div className={`w-full ${theme.button} text-white py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg border border-white/10`}>
                        {formData.ctaText || 'Learn More'}
                    </div>
                </div>
            </div>
            <p className="text-[9px] text-slate-500 italic text-center">Actual billboard will scale to full sidebar height.</p>
        </div>
    );
};

const Advertisements = () => {
    const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        ctaText: '',
        imageUrl: '',
        linkUrl: '',
        position: 'left-side' as const,
        isActive: true,
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        fetchAdvertisements();
    }, []);

    const fetchAdvertisements = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            const response = await axios.get(`${ADMIN_API_URL}/advertisements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAdvertisements(response.data?.data?.advertisements || []);
        } catch (error) {
            console.error('Error fetching advertisements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;

            if (editingId) {
                await axios.put(`${ADMIN_API_URL}/advertisements/${editingId}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Advertisement updated successfully!');
            } else {
                await axios.post(`${ADMIN_API_URL}/advertisements`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Advertisement added successfully!');
            }

            resetForm();
            fetchAdvertisements();
        } catch (error) {
            console.error('Error saving advertisement:', error);
            alert('Failed to save advertisement.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this advertisement?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.delete(`${ADMIN_API_URL}/advertisements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAdvertisements();
        } catch (error) {
            console.error('Error deleting advertisement:', error);
            alert('Failed to delete advertisement.');
        }
    };

    const handleEdit = (ad: Advertisement) => {
        setEditingId(ad._id);
        setFormData({
            title: ad.title,
            description: ad.description || '',
            ctaText: ad.ctaText || '',
            imageUrl: ad.imageUrl || '',
            linkUrl: ad.linkUrl,
            position: ad.position as any,
            isActive: ad.isActive,
            startDate: ad.startDate ? format(new Date(ad.startDate), 'yyyy-MM-dd') : '',
            endDate: ad.endDate ? format(new Date(ad.endDate), 'yyyy-MM-dd') : '',
        });
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            title: '',
            description: '',
            ctaText: '',
            imageUrl: '',
            linkUrl: '',
            position: 'left-side',
            isActive: true,
            startDate: '',
            endDate: '',
        });
    };

    const filteredAds = advertisements.filter(ad =>
        ad.title.toLowerCase().includes(search.toLowerCase())
    );

    const getPositionBadge = (pos: string) => {
        const colors: any = {
            'left-side': 'text-emerald-500 bg-emerald-500/10',
            'right-side': 'text-blue-500 bg-blue-500/10',
        };
        return colors[pos] || 'text-slate-500 bg-slate-500/10';
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-xl">
                                    <Megaphone className="text-blue-500" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Advertisement Management</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage display advertisements across the platform.</p>
                                </div>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search advertisements by title..."
                                className="w-full pl-10 pr-4 py-3 bg-[#1a1d21] border border-slate-800 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-slate-300 placeholder-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Ads List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12 text-slate-500">Loading advertisements...</div>
                            ) : filteredAds.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">No advertisements found.</div>
                            ) : (
                                filteredAds.map((ad) => (
                                    <div key={ad._id} className="bg-[#1a1d21] border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-all group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            {/* Preview */}
                                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#0f1214] border border-slate-800 flex-shrink-0">
                                                <img
                                                    src={ad.imageUrl}
                                                    alt={ad.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=Ad+Preview')}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-slate-200 truncate">{ad.title}</h3>
                                                        <a
                                                            href={ad.linkUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-0.5"
                                                        >
                                                            {ad.linkUrl} <ExternalLink size={10} />
                                                        </a>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleEdit(ad)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(ad._id)}
                                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 mt-3">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPositionBadge(ad.position)}`}>
                                                        {ad.position}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold uppercase">
                                                        {ad.isActive ? (
                                                            <><CheckCircle2 size={12} className="text-emerald-500" /> Active</>
                                                        ) : (
                                                            <><XCircle size={12} className="text-red-500" /> Inactive</>
                                                        )}
                                                    </div>
                                                    {ad.startDate && (
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                            <Calendar size={12} /> {format(new Date(ad.startDate), 'MMM d')} - {ad.endDate ? format(new Date(ad.endDate), 'MMM d, yyyy') : 'Indefinite'}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Sidebar */}
            <aside className="w-80 bg-[#1a1d21] border-l border-slate-800 p-6 overflow-y-auto custom-scrollbar shadow-xl z-10">
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                        {editingId ? <Edit size={16} /> : <Plus size={16} />}
                        {editingId ? 'Edit Ad' : 'New Advertisement'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        {editingId ? 'Modify existing advertisement details.' : 'Fill in the details to create a new ad.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Title</label>
                        <input
                            type="text"
                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="Ad Campaign Name"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
                        <textarea
                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all min-h-[80px]"
                            placeholder="Ad textual content..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">CTA Text</label>
                        <input
                            type="text"
                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Start Now, Learn More"
                            value={formData.ctaText}
                            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-1.5">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                            <span className="text-[10px] text-blue-500 font-medium">Optional</span>
                        </div>
                        <input
                            type="text"
                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://... (leave empty for auto-generated poster)"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        />
                        <p className="mt-1.5 text-[10px] text-slate-500 italic leading-snug">
                            If empty, a professional poster will be auto-generated from Title & CTA.
                        </p>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Click URL</label>
                        <input
                            type="text"
                            className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="https://..."
                            value={formData.linkUrl}
                            onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Position</label>
                            <select
                                className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                                value={formData.position}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                            >
                                <option value="left-side">Left Side</option>
                                <option value="right-side">Right Side</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
                            <input
                                type="date"
                                className="w-full bg-[#0f1214] border border-slate-800 rounded-lg text-xs text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 py-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            />
                            <div className="w-9 h-5 bg-[#0f1214] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-500 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                        </label>
                        <span className="text-xs font-semibold text-slate-400">Mark as Active</span>
                    </div>

                    <div className="py-2 border-t border-slate-800/50 mt-4">
                        <PosterPreview formData={formData} />
                    </div>

                    <div className="flex gap-3 pt-4">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`${editingId ? 'flex-[2]' : 'w-full'} py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50`}
                        >
                            {isSubmitting ? 'Saving...' : (
                                <>
                                    <Save size={14} />
                                    {editingId ? 'Update Ad' : 'Create Ad'}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-800">
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout size={16} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Placement Info</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            <strong>Left Side:</strong> Banner appears in the left 15% space.<br />
                            <strong>Right Side:</strong> Banner appears in the right 15% space.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Advertisements;
