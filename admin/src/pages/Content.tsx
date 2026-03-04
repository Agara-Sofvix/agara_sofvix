import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Search,
    Plus,
    Edit,
    Trash2,
    BookOpen,
    Film,
    Newspaper,
    Layers,
    Info,
    Save
} from 'lucide-react';
import { format } from 'date-fns';
import { ADMIN_API_URL } from '../config/apiConfig';

interface TextContent {
    _id: string;
    content: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: string;
}

const Content = () => {
    const [texts, setTexts] = useState<TextContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');

    // Form State
    const [newContent, setNewContent] = useState('');
    const [newCategory, setNewCategory] = useState('tournament');
    const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTexts();
    }, []);

    const fetchTexts = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            // Fetch all texts. Pagination can be added later if needed.
            const response = await axios.get(`${ADMIN_API_URL}/texts?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTexts(response.data.texts);
        } catch (error) {
            console.error('Error fetching texts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newContent.trim()) return;

        setIsSubmitting(true);
        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;

            await axios.post(`${ADMIN_API_URL}/texts`, {
                content: newContent,
                category: newCategory,
                difficulty: newDifficulty
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Reset form and refresh list
            setNewContent('');
            setNewCategory('tournament');
            setNewDifficulty('medium');
            fetchTexts();
            alert('Content added successfully!');
        } catch (error) {
            console.error('Error adding content:', error);
            alert('Failed to add content.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this content?')) return;

        try {
            const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
            const token = user.token;
            await axios.delete(`${ADMIN_API_URL}/texts/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTexts();
        } catch (error) {
            console.error('Error deleting content:', error);
            alert('Failed to delete content.');
        }
    };

    const getDifficultyColor = (diff: string) => {
        switch (diff) {
            case 'easy': return 'text-emerald-500 bg-emerald-500/10';
            case 'medium': return 'text-orange-500 bg-orange-500/10';
            case 'hard': return 'text-red-500 bg-red-500/10';
            default: return 'text-slate-500 bg-slate-500/10';
        }
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat.toLowerCase()) {
            case 'literature': return <BookOpen size={16} />;
            case 'cinema': return <Film size={16} />;
            case 'news': return <Newspaper size={16} />;
            case 'free-typing': return <Layers size={16} />;
            case 'tournament': return <Layers size={16} />;
            case 'general': return <Info size={16} />;
            case 'history': return <BookOpen size={16} />;
            case 'science': return <Info size={16} />;
            case 'social': return <Newspaper size={16} />;
            case 'election': return <Newspaper size={16} />;
            default: return <Layers size={16} />;
        }
    };

    const filteredTexts = texts.filter(text => {
        const matchesSearch = text.content.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All Categories' || text.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-8">

                        {/* Header & Filter */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Content Library</h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">Manage Tamil typing paragraphs, literature snippets, and news clips.</p>
                            </div>
                            <div className="flex items-center gap-2 bg-[#1a1d21] p-1 rounded-lg border border-slate-800">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">Filter:</span>
                                <select
                                    className="bg-[#1a1d21] border-none text-xs font-semibold py-1.5 px-3 focus:ring-0 text-slate-300 outline-none cursor-pointer"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                >
                                    <option>All Categories</option>
                                    <option value="free-typing">Free Typing</option>
                                    <option value="general">General Knowledge</option>
                                    <option value="literature">Literature</option>
                                    <option value="history">History</option>
                                    <option value="science">Science</option>
                                    <option value="social">Social Issues</option>
                                    <option value="tournament">Tournament</option>
                                    <option value="news">News</option>
                                    <option value="cinema">Cinema</option>
                                    <option value="election">Election</option>
                                </select>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search lyrics or content..."
                                className="w-full pl-10 pr-4 py-3 bg-[#1a1d21] border border-slate-800 rounded-xl text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm text-slate-300 placeholder-slate-600"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {loading ? (
                                <div className="col-span-2 text-center py-12 text-slate-500">Loading content...</div>
                            ) : filteredTexts.length === 0 ? (
                                <div className="col-span-2 text-center py-12 text-slate-500">No content found matching your filters.</div>
                            ) : (
                                filteredTexts.map((text) => (
                                    <div key={text._id} className="bg-[#1a1d21] border border-slate-800 rounded-xl p-5 hover:border-blue-500/50 transition-all group shadow-sm hover:shadow-md">
                                        <div className="flex items-start justify-between mb-4">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[#0f1214] text-slate-400`}>
                                                {getCategoryIcon(text.category)}
                                                {text.category}
                                            </span>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Edit functionality can be added later */}
                                                <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-blue-500 transition-all">
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(text._id)}
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3 font-tamil">
                                            {text.content}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Difficulty</span>
                                                    <span className={`text-xs font-bold uppercase ${getDifficultyColor(text.difficulty).split(' ')[0]}`}>
                                                        {text.difficulty}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Length</span>
                                                    <span className="text-xs font-semibold text-slate-300">
                                                        {text.content.split(' ').length} Words
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-medium">
                                                {(() => {
                                                    try {
                                                        return format(new Date(text.createdAt), 'MMM d, yyyy');
                                                    } catch (e) {
                                                        return 'Unknown Date';
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar for Adding Content */}
            <aside className="w-80 bg-[#1a1d21] border-l border-slate-800 p-6 overflow-y-auto custom-scrollbar shadow-xl z-10">
                <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-500 flex items-center gap-2">
                        <Plus size={16} />
                        Quick Add
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Paste new Tamil content below to add it to the library.</p>
                </div>

                <form onSubmit={handleAddContent} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tamil Text Content</label>
                        <textarea
                            className="w-full h-48 bg-[#0f1214] border-slate-800 rounded-lg text-sm text-slate-300 placeholder-slate-600 focus:ring-1 focus:ring-blue-500 outline-none p-3 resize-none font-tamil transition-all"
                            placeholder="தமிழ் உரை இங்கே..."
                            value={newContent}
                            onChange={(e) => setNewContent(e.target.value)}
                            required
                        ></textarea>
                        <div className="mt-1 flex justify-between">
                            <span className="text-[10px] text-slate-500">Chars: {newContent.length}</span>
                            <span className="text-[10px] text-slate-500">Words: {newContent.trim() ? newContent.trim().split(/\s+/).length : 0}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Category</label>
                        <select
                            className="w-full bg-[#0f1214] border-slate-800 rounded-lg text-sm text-slate-300 p-2.5 outline-none focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                        >
                            <option value="free-typing">Free Typing</option>
                            <option value="general">General Knowledge</option>
                            <option value="literature">Literature</option>
                            <option value="history">History</option>
                            <option value="science">Science</option>
                            <option value="social">Social Issues</option>
                            <option value="tournament">Tournament</option>
                            <option value="news">News</option>
                            <option value="cinema">Cinema</option>
                            <option value="election">Election</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Difficulty Level</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['easy', 'medium', 'hard'].map((level) => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setNewDifficulty(level as any)}
                                    className={`py-2 text-[10px] font-bold uppercase rounded-lg border transition-all ${newDifficulty === level
                                        ? getDifficultyColor(level).replace('text-', 'border-').replace('bg-', 'bg-opacity-20 bg-') + ' ring-1 ring-current'
                                        : 'border-slate-800 text-slate-500 hover:bg-slate-800'
                                        }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : (
                            <>
                                <Save size={16} />
                                Save to Library
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-800">
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info size={16} className="text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500">Optimization Tip</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                            Use paragraphs between 30-80 words for the best competitive experience. Ensure there are no complex special characters that aren't common in Tamil typing.
                        </p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default Content;
