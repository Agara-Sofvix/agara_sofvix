import React from 'react';
import { useAdmin } from '../../src/context/AdminContext';
import AdminHeader from './AdminHeader';

interface AdminLayoutProps {
    children: React.ReactNode;
    currentPage?: string;
    onNavigate?: (page: string) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage = 'dashboard', onNavigate }) => {
    const { admin, logout } = useAdmin();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-black">Admin Panel</h1>
                    <p className="text-xs opacity-60 mt-1">Ezhuthidu</p>
                </div>

                <nav className="p-4">
                    <button
                        onClick={() => onNavigate?.('dashboard')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'dashboard' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => onNavigate?.('users')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'users' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        👥 Users
                    </button>
                    <button
                        onClick={() => onNavigate?.('tournaments')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'tournaments' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        🏆 Tournaments
                    </button>
                    <button
                        onClick={() => onNavigate?.('leaderboards')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'leaderboards' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        🎯 Leaderboards
                    </button>
                    <button
                        onClick={() => onNavigate?.('content')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'content' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        📝 Content
                    </button>
                    <button
                        onClick={() => onNavigate?.('analytics')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'analytics' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        📈 Analytics
                    </button>
                    <button
                        onClick={() => onNavigate?.('advertisements')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'advertisements' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        📢 Advertisements
                    </button>
                    <button
                        onClick={() => onNavigate?.('logs')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'logs' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        📋 Audit Logs
                    </button>
                    <button
                        onClick={() => onNavigate?.('settings')}
                        className={`w-full text-left px-4 py-3 rounded-lg mb-2 font-bold text-sm transition-all ${currentPage === 'settings' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
                    >
                        ⚙️ Settings
                    </button>
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold">{admin?.name}</p>
                            <p className="text-xs opacity-60">{admin?.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminHeader title={currentPage || 'Dashboard'} />
                <main className="flex-1 overflow-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
