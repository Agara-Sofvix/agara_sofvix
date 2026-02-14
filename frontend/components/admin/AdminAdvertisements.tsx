import React, { useEffect, useState } from 'react';
import { getAdvertisements, addAdvertisement, updateAdvertisement, deleteAdvertisement } from '../../src/services/adminApi';

const AdminAdvertisements: React.FC = () => {
    const [advertisements, setAdvertisements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAd, setEditingAd] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        linkUrl: '',
        position: 'left-side',
        isActive: true,
        startDate: '',
        endDate: ''
    });

    const fetchAds = async () => {
        try {
            const data = await getAdvertisements();
            setAdvertisements(data.advertisements);
        } catch (error) {
            console.error('Failed to fetch advertisements:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAds();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAd) {
                await updateAdvertisement(editingAd._id, formData);
            } else {
                await addAdvertisement(formData);
            }
            setShowModal(false);
            resetForm();
            fetchAds();
        } catch (error) {
            alert('Failed to save advertisement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this ad?')) return;
        try {
            await deleteAdvertisement(id);
            fetchAds();
        } catch (error) {
            alert('Failed to delete ad');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            imageUrl: '',
            linkUrl: '',
            position: 'left-side',
            isActive: true,
            startDate: '',
            endDate: ''
        });
        setEditingAd(null);
    };

    const openEditModal = (ad: any) => {
        setEditingAd(ad);
        setFormData({
            title: ad.title,
            imageUrl: ad.imageUrl,
            linkUrl: ad.linkUrl,
            position: ad.position,
            isActive: ad.isActive,
            startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
            endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : ''
        });
        setShowModal(true);
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-black">Advertisement Management</h2>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark"
                >
                    + Add New Ad
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {advertisements.map((ad) => (
                    <div key={ad._id} className="bg-white rounded-2xl shadow p-6 border-l-4 border-primary">
                        <div className="flex gap-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-lg truncate">{ad.title}</h3>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${ad.isActive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {ad.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-500 truncate mb-2">{ad.linkUrl}</p>
                                <div className="flex gap-2 mb-4">
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">
                                        {ad.position}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(ad)}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ad._id)}
                                        className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-2xl w-full mx-4 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-2xl font-black mb-6">{editingAd ? 'Edit Ad' : 'Add New Advertisement'}</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-2">Link URL</label>
                                <input
                                    type="text"
                                    value={formData.linkUrl}
                                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Position</label>
                                    <select
                                        value={formData.position}
                                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    >
                                        <option value="left-side">Left Side</option>
                                        <option value="right-side">Right Side</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-2">Start Date</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-2">End Date</label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    id="isActive"
                                />
                                <label htmlFor="isActive" className="text-sm font-bold">Active</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark"
                                >
                                    {editingAd ? 'Update Ad' : 'Add Ad'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAdvertisements;
