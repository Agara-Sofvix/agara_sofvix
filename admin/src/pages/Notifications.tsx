import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus,
    Edit,
    Trash2,
    Bell,
    Save,
    CheckCircle,
    AlertCircle,
    Megaphone
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL } from '../config/apiConfig';

interface Notification {
    _id: string;
    title: string;
    description: string;
    tag: 'Update' | 'Exam' | 'New' | 'Notice';
    isActive: boolean;
    createdAt: string;
}

const Notifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tag, setTag] = useState<'Update' | 'Exam' | 'New' | 'Notice'>('Notice');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            const response = await axios.get(`${ADMIN_API_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(response.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
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

            if (isEditing && editId) {
                await axios.put(`${ADMIN_API_URL}/notifications/${editId}`, {
                    title,
                    description,
                    tag
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Notification updated successfully!');
            } else {
                await axios.post(`${ADMIN_API_URL}/notifications`, {
                    title,
                    description,
                    tag
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Notification created successfully!');
            }

            // Reset form
            setTitle('');
            setDescription('');
            setTag('Notice');
            setIsEditing(false);
            setEditId(null);
            fetchNotifications();
        } catch (error) {
            console.error('Error saving notification:', error);
            alert('Failed to save notification.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (n: Notification) => {
        setTitle(n.title);
        setDescription(n.description);
        setTag(n.tag);
        setIsEditing(true);
        setEditId(n._id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.delete(`${ADMIN_API_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            alert('Failed to delete notification.');
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.put(`${ADMIN_API_URL}/notifications/${id}`, {
                isActive: !currentStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'New': return 'text-blue-500 bg-blue-500/10';
            case 'Exam': return 'text-orange-500 bg-orange-500/10';
            case 'Update': return 'text-green-500 bg-green-500/10';
            case 'Notice': return 'text-red-500 bg-red-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight">Public Announcements</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Create and manage notifications that players see on the main website.</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {loading ? (
                                <div className="text-center py-12 text-slate-500">Loading notifications...</div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-12 text-slate-500 bg-[#1a1d21] rounded-2xl border border-slate-800 border-dashed">
                                    <Megaphone size={40} className="mx-auto mb-4 opacity-20" />
                                    No notifications created yet.
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n._id} className={`bg-[#1a1d21] border ${n.isActive ? 'border-slate-800' : 'border-slate-800/50 opacity-60'} rounded-xl p-6 transition-all group`}>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getTagColor(n.tag)}`}>
                                                    {n.tag}
                                                </span>
                                                <h3 className="font-bold text-white">{n.title}</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => toggleStatus(n._id, n.isActive)}
                                                    className={`p-1.5 rounded-lg transition-all ${n.isActive ? 'text-green-500 hover:bg-green-500/10' : 'text-slate-500 hover:bg-slate-800'}`}
                                                    title={n.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {n.isActive ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(n)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(n._id)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-4">
                                            {n.description}
                                        </p>
                                        <div className="text-[10px] text-slate-500 font-medium">
                                            Created on {format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <aside className="w-80 bg-[#1a1d21] border-l border-slate-800 p-6 overflow-y-auto custom-scrollbar">
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                        {isEditing ? <Edit size={16} /> : <Plus size={16} />}
                        {isEditing ? 'Edit Notification' : 'New Notification'}
                    </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Title</label>
                        <input
                            type="text"
                            className="w-full bg-[#0f1214] border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Announcing..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Message</label>
                        <textarea
                            className="w-full h-32 bg-[#0f1214] border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Write the notification content here..."
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tag Type</label>
                        <select
                            className="w-full bg-[#0f1214] border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                            value={tag}
                            onChange={(e) => setTag(e.target.value as any)}
                        >
                            <option value="Notice">Notice (Red)</option>
                            <option value="Update">Update (Green)</option>
                            <option value="New">New (Blue)</option>
                            <option value="Exam">Exam (Orange)</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <Save size={16} />
                            {isEditing ? 'Update' : 'Publish'}
                        </button>
                        {isEditing && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setTitle('');
                                    setDescription('');
                                    setEditId(null);
                                }}
                                className="px-4 py-3 bg-slate-800 text-slate-400 font-bold text-xs uppercase rounded-lg hover:text-white transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                </form>
            </aside>
        </div>
    );
};

export default Notifications;
