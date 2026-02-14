import React, { useEffect, useState } from 'react';
import { getTexts, addText, deleteText } from '../../src/services/adminApi';

const AdminContent: React.FC = () => {
    const [texts, setTexts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newText, setNewText] = useState({ content: '', category: 'general', difficulty: 'medium' });

    const fetchTexts = async () => {
        try {
            const data = await getTexts({ limit: 20 });
            setTexts(data.texts);
        } catch (error) {
            console.error('Failed to fetch texts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTexts();
    }, []);

    const handleAdd = async () => {
        if (!newText.content.trim()) {
            alert('Please enter text content');
            return;
        }

        try {
            await addText(newText);
            setShowAddModal(false);
            setNewText({ content: '', category: 'general', difficulty: 'medium' });
            fetchTexts();
        } catch (error) {
            alert('Failed to add text');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this text?')) return;

        try {
            await deleteText(id);
            fetchTexts();
        } catch (error) {
            alert('Failed to delete text');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-black">Tamil Typing Texts</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark"
                >
                    + Add New Text
                </button>
            </div>

            <div className="space-y-4">
                {texts.map((text) => (
                    <div key={text._id} className="bg-white rounded-2xl shadow p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <div className="flex gap-2 mb-3">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-bold">
                                        {text.category || 'general'}
                                    </span>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">
                                        {text.difficulty || 'medium'}
                                    </span>
                                </div>
                                <p className="text-lg leading-relaxed">{text.content}</p>
                            </div>
                            <button
                                onClick={() => handleDelete(text._id)}
                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 ml-4"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Text Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4">
                        <h3 className="text-2xl font-black mb-6">Add New Text</h3>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Text Content (Tamil)</label>
                            <textarea
                                value={newText.content}
                                onChange={(e) => setNewText({ ...newText, content: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none h-40"
                                placeholder="Enter Tamil text..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold mb-2">Category</label>
                                <select
                                    value={newText.category}
                                    onChange={(e) => setNewText({ ...newText, category: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                >
                                    <option value="general">General</option>
                                    <option value="literature">Literature</option>
                                    <option value="news">News</option>
                                    <option value="technical">Technical</option>
                                    <option value="free-typing">Free Typing</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">Difficulty</label>
                                <select
                                    value={newText.difficulty}
                                    onChange={(e) => setNewText({ ...newText, difficulty: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleAdd}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark"
                            >
                                Add Text
                            </button>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminContent;
