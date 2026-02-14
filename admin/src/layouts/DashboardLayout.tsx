import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import {
    LayoutDashboard,
    Trophy,
    Users,
    BarChart2,
    FileText,
    Settings,
    Search,
    Bell,
    Sun,
    Moon,
    LogOut,
    Plus,
    Megaphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useAdminNotifications } from '../hooks/useAdminNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ADMIN_API_URL } from '../config/apiConfig';

interface SearchResults {
    users: Array<{
        _id: string;
        name: string;
        username: string;
        email: string;
        createdAt: string;
    }>;
    tournaments: Array<{
        _id: string;
        name: string;
        status: string;
        startDate: string;
        endDate: string;
    }>;
    logs: Array<{
        _id: string;
        action: string;
        targetType: string;
        createdAt: string;
        metadata?: {
            username?: string;
        };
    }>;
}

const DashboardLayout = () => {
    const { logout, user } = useAuth();
    const { settings } = useSettings();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    // NEW: Use the notification hook
    const { events, unreadCount, markAsRead } = useAdminNotifications();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);

    // Debounced search effect
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const userString = localStorage.getItem('adminUser');
                    if (userString) {
                        const user = JSON.parse(userString);
                        const response = await axios.get(`${ADMIN_API_URL}/search?q=${searchQuery}`, {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });
                        setSearchResults(response.data);
                        setShowSearchResults(true);
                    }
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSearchResults(null);
                setShowSearchResults(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
        { icon: Users, label: 'User Management', path: '/users' },
        { icon: BarChart2, label: 'Leaderboards', path: '/leaderboards' },
        { icon: FileText, label: 'Content (Lyrics)', path: '/content' },
        { icon: Megaphone, label: 'Advertisements', path: '/advertisements' },
        { icon: Bell, label: 'Announcements', path: '/notifications' },
    ];

    const bottomMenuItems = [
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={`h-screen flex overflow-hidden ${isDarkMode ? 'bg-[#0f1214]' : 'bg-slate-50'}`}>
            {/* Sidebar */}
            <aside className="w-64 bg-[#1a1d21] flex flex-col border-r border-slate-800 shrink-0">
                {/* Logo Section */}
                <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: settings?.branding?.primaryColor || '#3b82f6' }}
                    >
                        <span className="text-white font-bold text-lg">⌨️</span>
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide">
                            {settings?.siteName || 'TAMIL ADMIN'}
                        </h1>
                        <p className="text-slate-500 text-[10px] font-medium">Tournament Engine</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-none">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group ${isActive
                                    ? 'bg-slate-800/80 text-white'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                                style={isActive ? {
                                    color: settings?.branding?.primaryColor || '#3b82f6',
                                } : {}}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ backgroundColor: settings?.branding?.primaryColor || '#3b82f6' }}
                                    />
                                )}

                                <item.icon size={18} className={isActive ? "animate-pulse" : ""} />
                                {item.label}
                            </button>
                        );
                    })}

                    <div className="pt-6 pb-2 px-3">
                    </div>

                    {bottomMenuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative ${isActive
                                    ? 'bg-[#1e293b] text-blue-500'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                {isActive && (
                                    <div
                                        className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                    />
                                )}
                                <item.icon size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                                {user?.name ? (
                                    user.name.charAt(0).toUpperCase()
                                ) : (
                                    <img src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                                )}
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate w-24">{user?.name || 'Admin User'}</p>
                                <p className="text-[10px] text-slate-500">Super Admin</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-slate-400 hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-[#1a1d21] border-b border-slate-800 flex items-center justify-between px-8">
                    {/* Search */}
                    <div className="relative w-96">
                        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-blue-500' : 'text-slate-500'}`} size={16} />
                        <input
                            type="text"
                            placeholder="Search tournaments, players, or logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSearchResults(!!searchResults)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setShowSearchResults(false);
                                }
                            }}
                            className="w-full bg-[#0f1214] border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1d21] border border-slate-800 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 min-w-[400px]">
                                <div className="max-h-[70vh] overflow-y-auto p-2 space-y-4 scrollbar-none">

                                    {/* Users Section */}
                                    {searchResults.users.length > 0 && (
                                        <div>
                                            <h5 className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Users size={12} /> Players
                                            </h5>
                                            <div className="mt-1 space-y-1">
                                                {searchResults.users.map(u => (
                                                    <button
                                                        key={u._id}
                                                        onClick={() => {
                                                            navigate(`/users?search=${u.username}`);
                                                            setShowSearchResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors group"
                                                    >
                                                        <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400">{u.name}</p>
                                                        <p className="text-[10px] text-slate-500">@{u.username} • {u.email}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tournaments Section */}
                                    {searchResults.tournaments.length > 0 && (
                                        <div>
                                            <h5 className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Trophy size={12} /> Tournaments
                                            </h5>
                                            <div className="mt-1 space-y-1">
                                                {searchResults.tournaments.map(t => (
                                                    <button
                                                        key={t._id}
                                                        onClick={() => {
                                                            navigate(`/tournaments`);
                                                            setShowSearchResults(false);
                                                            setSearchQuery('');
                                                        }}
                                                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors group"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-bold text-slate-200 group-hover:text-blue-400">{t.name}</p>
                                                            <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-black ${t.status === 'live' ? 'bg-green-500/10 text-green-500' :
                                                                t.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500' :
                                                                    'bg-slate-500/10 text-slate-500'
                                                                }`}>{t.status}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Logs Section */}
                                    {searchResults.logs.length > 0 && (
                                        <div>
                                            <h5 className="px-3 py-1 text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <FileText size={12} /> System Logs
                                            </h5>
                                            <div className="mt-1 space-y-1">
                                                {searchResults.logs.map(log => (
                                                    <div key={log._id} className="px-3 py-2 rounded-lg bg-slate-800/20 border border-slate-800/50">
                                                        <p className="text-[10px] font-bold text-slate-300">{log.action}</p>
                                                        <p className="text-[9px] text-slate-500 truncate">{log.targetType} • {new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results */}
                                    {searchResults.users.length === 0 && searchResults.tournaments.length === 0 && searchResults.logs.length === 0 && (
                                        <div className="py-8 text-center opacity-50">
                                            <Search size={24} className="mx-auto mb-2" />
                                            <p className="text-xs font-bold">No results found for "{searchQuery}"</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-2 bg-[#131619] border-t border-slate-800 text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">
                                    Press <span className="text-slate-300">Esc</span> to close
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800 ${showNotifications ? 'text-white bg-slate-800' : ''}`}
                            >
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1d21]"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-[#1a1d21] border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                        <h5 className="font-bold text-sm text-white">Notifications</h5>
                                        {unreadCount > 0 && (
                                            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-bold">New</span>
                                        )}
                                    </div>
                                    <div className="max-h-64 overflow-auto py-2 scrollbar-none">
                                        {events.length === 0 ? (
                                            <div className="p-8 text-center opacity-50">
                                                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs font-bold">No new notifications</p>
                                            </div>
                                        ) : (
                                            events.map((event) => (
                                                <div key={event._id} className={`px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0 cursor-pointer ${!event.read ? 'bg-slate-800/20' : ''}`}>
                                                    <p className="text-xs text-slate-200 font-medium">{event.title}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{event.description}</p>
                                                    <p className="text-[9px] text-slate-500 mt-1">
                                                        {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className="p-3 bg-[#131619] text-center border-t border-slate-800">
                                        <button
                                            onClick={markAsRead}
                                            className="text-[10px] font-bold text-slate-500 hover:text-blue-500 uppercase tracking-widest transition-colors"
                                        >
                                            Mark all as read
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleDarkMode}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <button
                            onClick={() => navigate('/tournaments?create=true')}
                            className="hover:opacity-90 text-white px-4 py-2 rounded text-xs font-bold flex items-center gap-2 transition-all shadow-lg"
                            style={{
                                backgroundColor: settings?.branding?.primaryColor || '#ef4444',
                                boxShadow: `0 4px 12px ${(settings?.branding?.primaryColor || '#ef4444')}40`
                            }}
                        >
                            <Plus size={14} />
                            TOURNAMENT
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-8 bg-[#0f1214] text-slate-300 scrollbar-none relative">
                    {settings?.maintenanceMode && (
                        <div className="absolute top-0 left-0 right-0 z-20 bg-amber-500/10 border-b border-amber-500/20 px-8 py-2 flex items-center justify-between backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-2 bg-amber-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Maintenance Mode Active</span>
                                <span className="text-[10px] text-amber-500/60">— The public website is currently offline for users.</span>
                            </div>
                            <button
                                onClick={() => navigate('/settings#general')}
                                className="text-[10px] font-bold text-amber-500 hover:text-amber-400 underline transition-colors"
                            >
                                Settings
                            </button>
                        </div>
                    )}
                    <div className={settings?.maintenanceMode ? "pt-10" : ""}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
