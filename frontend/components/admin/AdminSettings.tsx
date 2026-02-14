import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../src/context/AdminContext';
import { API_BASE, getUploadBaseUrl, SOCKET_ORIGIN } from '../../src/config/apiConfig';
import { getSettings, updateSettings, uploadLogo, fetchLogoBlobUrl } from '../../src/services/adminApi';

const AdminSettings: React.FC = () => {
    const { admin } = useAdmin();
    const [name, setName] = useState(admin?.name || '');
    const [email, setEmail] = useState(admin?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [siteSettings, setSiteSettings] = useState<any>(null);
    const [logoBlobUrl, setLogoBlobUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (!siteSettings?.branding?.logoUrl) {
            setLogoBlobUrl(null);
            return;
        }
        setLogoBlobUrl(null);
        let blobUrl: string | null = null;
        let cancelled = false;
        fetchLogoBlobUrl()
            .then((url) => {
                if (!cancelled && url) {
                    blobUrl = url;
                    setLogoBlobUrl(url);
                }
            })
            .catch(() => { if (!cancelled) setLogoBlobUrl(null); });
        return () => {
            cancelled = true;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [siteSettings?.branding?.logoUrl]);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSiteSettings(data);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const res = await uploadLogo(file);
            setSiteSettings((prev: any) => ({
                ...prev,
                branding: { ...prev?.branding, logoUrl: res.logoUrl }
            }));
            setMessage({ type: 'success', text: 'Logo uploaded successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to upload logo' });
        }
    };

    const handleRemoveLogo = async () => {
        if (!confirm('Are you sure you want to remove the site logo?')) return;

        try {
            // Update settings with empty logoUrl
            await updateSettings({
                branding: {
                    ...siteSettings?.branding,
                    logoUrl: ''
                }
            });

            setSiteSettings((prev: any) => ({
                ...prev,
                branding: { ...prev?.branding, logoUrl: '' }
            }));
            setMessage({ type: 'success', text: 'Logo removed successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Failed to remove logo' });
        }
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        try {
            const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
            const tokenToUse = storedAdmin.token;

            const response = await fetch(`${API_BASE}/admin/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenToUse}`
                },
                body: JSON.stringify({ name, email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local context/storage if needed
            localStorage.setItem('admin', JSON.stringify({ ...storedAdmin, ...data }));
            // We might need to refresh the context here, but for now let's just show success
            // In a real app we'd expose a setUser method in context
            window.location.reload(); // Simple reload to reflect changes in context for now

            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            const storedAdmin = JSON.parse(localStorage.getItem('admin') || '{}');
            const tokenToUse = storedAdmin.token;

            const response = await fetch(`${API_BASE}/admin/auth/password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenToUse}`
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            setMessage({ type: 'success', text: 'Password updated successfully' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Settings</h2>

            {message && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Site Settings Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Site Logo</h3>
                    {siteSettings?.branding?.logoUrl && (
                        <button
                            onClick={handleRemoveLogo}
                            className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            REMOVE LOGO
                        </button>
                    )}
                </div>

                <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition-all relative overflow-hidden"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ minHeight: '200px' }}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                    />

                    {siteSettings?.branding?.logoUrl ? (
                        <div className="flex flex-col items-center">
                            {(() => {
                                const path = siteSettings.branding.logoUrl.startsWith('/') ? siteSettings.branding.logoUrl : `/${siteSettings.branding.logoUrl}`;
                                const directLogoUrl = `${getUploadBaseUrl()}${path}`;
                                const logoSrc = logoBlobUrl || directLogoUrl;
                                return (
                                    <img
                                        src={logoSrc}
                                        alt="Site Logo"
                                        className="max-h-32 object-contain mb-4"
                                        onError={(e) => {
                                            const el = e.currentTarget;
                                            if (el.src !== directLogoUrl) {
                                                el.src = directLogoUrl;
                                            } else {
                                                el.style.display = 'none';
                                            }
                                        }}
                                    />
                                );
                            })()}
                            <p className="text-sm text-gray-500 font-bold">Click to change logo</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                            <p className="font-bold text-gray-600">Upload Logo</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, SVG (Max 2MB)</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profile Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Profile Information</h3>
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Password Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Change Password</h3>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 transition-colors"
                        >
                            Update Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
