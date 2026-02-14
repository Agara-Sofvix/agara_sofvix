import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
    Trophy,
    Users,
    PlusCircle,
    Edit,
    Trash2,
    Save,
    List,
    X
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL, PUBLIC_API_URL } from '../config/apiConfig';

interface Tournament {
    _id: string;
    name: string;
    subheading?: string;
    startTime: string;
    endTime: string;
    status: 'upcoming' | 'live' | 'completed';
    participants: any[];
    textContent?: any; // Added text content ref
    difficulty?: 'easy' | 'medium' | 'hard';
}

interface TamilText {
    _id: string;
    category: string;
    content: string;
}

const Tournaments = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    // Form State
    const [name, setName] = useState('');
    const [subheading, setSubheading] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [textContent, setTextContent] = useState('');
    const [status, setStatus] = useState<'upcoming' | 'live' | 'completed'>('live');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [textContents, setTextContents] = useState<TamilText[]>([]);

    useEffect(() => {
        fetchTournaments();
        fetchTextContents();

        // Handle direct opening of modal via query param
        if (searchParams.get('create') === 'true') {
            setShowModal(true);
            setIsEditing(false);
            // Clear the param so it doesn't stay in URL forever
            setSearchParams({}, { replace: true });
        }
    }, [searchParams]);

    const fetchTextContents = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            const response = await axios.get(`${ADMIN_API_URL}/texts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Handle both direct array and paginated response
            const textsArray = Array.isArray(response.data) ? response.data : response.data.texts || [];
            setTextContents(textsArray);
        } catch (error) {
            console.error('Error fetching texts:', error);
        }
    };

    const fetchTournaments = async () => {
        try {
            const response = await axios.get(`${PUBLIC_API_URL}/tournaments`);
            setTournaments(response.data);
        } catch (error) {
            console.error('Error fetching tournaments:', error);
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

            const payload = {
                name,
                subheading,
                startTime,
                endTime,
                textContent: textContent || undefined,
                status
            };

            if (isEditing && editId) {
                await axios.put(`${ADMIN_API_URL}/tournaments/${editId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post(`${ADMIN_API_URL}/tournaments`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Reset form
            setName('');
            setSubheading('');
            setStartTime('');
            setEndTime('');
            setTextContent('');
            setStatus('live');
            setIsEditing(false);
            setEditId(null);
            fetchTournaments();
        } catch (error) {
            console.error('Error saving tournament:', error);
            alert('Failed to save tournament. Ensure you are authenticated.');
        } finally {
            setIsSubmitting(false);
            setShowModal(false);
        }
    };

    const handleEditClick = (t: Tournament) => {
        setName(t.name);
        setSubheading(t.subheading || '');
        // Format dates for datetime-local input (YYYY-MM-DDTHH:mm)
        const formatForInput = (dateStr: string) => {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return '';
            try {
                return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            } catch (e) {
                return '';
            }
        };
        setStartTime(formatForInput(t.startTime));
        setEndTime(formatForInput(t.endTime));
        setTextContent(t.textContent?._id || t.textContent || '');
        setStatus(t.status || 'live');
        setEditId(t._id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this tournament?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.delete(`${ADMIN_API_URL}/tournaments/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTournaments();
        } catch (error) {
            console.error('Error deleting tournament:', error);
            alert('Failed to delete tournament.');
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tournament Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage active contests and create new typing challenges.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-all shadow-lg shadow-accent-red/20"
                >
                    <PlusCircle size={18} />
                    <span className="text-sm font-bold uppercase tracking-wider">Create Tournament</span>
                </button>
            </div>

            <div className="bg-[#1a1d21] rounded-lg border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e2227]">
                    <h4 className="font-bold text-lg flex items-center gap-2 text-white">
                        <List className="text-orange-500" size={20} />
                        Upcoming & Active Tournaments
                    </h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#1e2227] border-b border-slate-800">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Tournament Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Participants</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">Loading...</td></tr>
                            ) : tournaments.length === 0 ? (
                                <tr><td colSpan={5} className="p-6 text-center text-slate-500">No tournaments found.</td></tr>
                            ) : (
                                tournaments.map((t) => (
                                    <tr key={t._id} className="hover:bg-[#1e293b] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                                    <Trophy className="text-blue-500" size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200">{t.name}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">Difficulty: Medium</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                                            {t.startTime ? (
                                                (() => {
                                                    try {
                                                        return format(new Date(t.startTime), 'MMM d, yyyy • hh:mm a');
                                                    } catch (e) {
                                                        return 'Invalid Date';
                                                    }
                                                })()
                                            ) : 'No Date Set'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <Users size={16} className="text-slate-500" />
                                                {t.participants?.length || 0}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={t.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleEditClick(t)}
                                                className="text-slate-500 hover:text-blue-500 transition-colors p-1"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t._id)}
                                                className="text-slate-500 hover:text-red-500 ml-2 transition-colors p-1"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Create Tournament Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-[#1a1d21] w-full max-w-2xl rounded-2xl border border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#1e2227]">
                            <h4 className="font-bold text-lg flex items-center gap-2 text-white">
                                {isEditing ? <Edit className="text-blue-500" size={20} /> : <PlusCircle className="text-blue-500" size={20} />}
                                {isEditing ? 'Edit Tournament' : 'Create New Tournament'}
                            </h4>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setIsEditing(false);
                                    setEditId(null);
                                    setName('');
                                    setStartTime('');
                                    setEndTime('');
                                    setTextContent('');
                                    setStatus('live');
                                }}
                                className="text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="title">Tournament Title</label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300 placeholder-slate-600"
                                        placeholder="Enter tournament name..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="subheading">Tournament Subheading</label>
                                    <input
                                        id="subheading"
                                        type="text"
                                        value={subheading}
                                        onChange={(e) => setSubheading(e.target.value)}
                                        className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300 placeholder-slate-600"
                                        placeholder="Enter tournament subheading (optional)..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="startDate">Start Date & Time</label>
                                        <input
                                            id="startDate"
                                            type="datetime-local"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="endDate">End Date & Time</label>
                                        <input
                                            id="endDate"
                                            type="datetime-local"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="textContent">Tournament Content (Tamil Text)</label>
                                    <select
                                        id="textContent"
                                        value={textContent}
                                        onChange={(e) => setTextContent(e.target.value)}
                                        className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300"
                                        required
                                    >
                                        <option value="">Select a text content...</option>
                                        {Array.isArray(textContents) && textContents
                                            .filter(text => text.category === 'tournament')
                                            .map((text) => (
                                                <option key={text._id} value={text._id}>
                                                    [{text.category || 'N/A'}] {text.content?.substring(0, 50) || 'No content'}...
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-wider" htmlFor="status">Tournament Status</label>
                                    <select
                                        id="status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as any)}
                                        className="w-full bg-[#0f1214] border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-blue-500 transition-all outline-none text-slate-300"
                                        required
                                    >
                                        <option value="upcoming">Upcoming</option>
                                        <option value="live">Live (Active)</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-blue-500/5 rounded-lg border border-blue-500/10">
                                    <p className="text-[11px] leading-relaxed text-blue-400">
                                        Tip: You can manage Tamil texts in the Content section. Select a text here to be used for this tournament.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-800 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditing(false);
                                        setEditId(null);
                                        setName('');
                                        setSubheading('');
                                        setStartTime('');
                                        setEndTime('');
                                        setTextContent('');
                                        setStatus('live');
                                    }}
                                    className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    <Save size={18} />
                                    {isSubmitting ? 'Saving...' : 'Save Tournament'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
        upcoming: "bg-accent-orange/10 text-accent-orange",
        live: "bg-green-500/10 text-green-500",
        completed: "bg-slate-500/10 text-slate-500",
    };

    return (
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${styles[status as keyof typeof styles] || styles.completed}`}>
            {status}
        </span>
    );
};

export default Tournaments;
