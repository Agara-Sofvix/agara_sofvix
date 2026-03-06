import { NavLink } from 'react-router-dom';
import {
    Keyboard,
    LayoutDashboard,
    Trophy,
    Users,
    BarChart2,
    FileText,
    Settings,
    LogOut,
    Megaphone
} from 'lucide-react';
import clsx from 'clsx';
import { useSettings } from '../context/SettingsContext';

const Sidebar = () => {
    const { settings } = useSettings();
    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Trophy, label: 'Tournaments', path: '/tournaments' },
        { icon: Users, label: 'User Management', path: '/users' },
        { icon: BarChart2, label: 'Leaderboards', path: '/leaderboards' },
        { icon: FileText, label: 'Content (Lyrics)', path: '/content' },
        { icon: Megaphone, label: 'Advertisements', path: '/advertisements' },
    ];

    return (
        <aside className="w-64 flex-shrink-0 flex flex-col bg-white dark:bg-card-dark border-r border-slate-200 dark:border-slate-800">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg overflow-hidden transition-all duration-500">
                    {settings?.branding?.logoUrl ? (
                        <img 
                           src={settings.branding.logoUrl} 
                           alt="Logo" 
                           className="w-full h-full object-cover" 
                           onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                    ) : (
                        <div className="w-full h-full bg-primary flex items-center justify-center">
                            <Keyboard className="text-white w-6 h-6" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-sm font-bold tracking-tight uppercase text-primary transition-colors duration-500">
                        {settings?.siteName || 'Ezhuthidu'} Admin
                    </h1>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Tournament Engine</p>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => clsx(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            isActive
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                        )}
                    >
                        <item.icon size={22} />
                        <span className="text-sm">{item.label}</span>
                    </NavLink>
                ))}

                <div className="pt-8 pb-4">
                </div>

                <NavLink
                    to="/settings"
                    className={({ isActive }) => clsx(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                        isActive
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white font-medium"
                    )}
                >
                    <Settings size={22} />
                    <span className="text-sm">Settings</span>
                </NavLink>
            </nav>

            <div className="p-4 mt-auto">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center ring-2 ring-primary/20"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCXxatELPrjOw5hR-oU9M2Ae_-APMjJNVPuWW_du1TuLJtswpW2MpdoUbzBI067ILaKtk0gKkCTF9hBAHECO0AmaObxDB3uBTYAwg4fTekAayU9HnxxwAzWGnp7Zr9s9XQcYuVedn3S08ryoeAiXnnWvZ7FfikRnJHhBZjNUUu60_1_wjDfM5p08DnD7-cpfR59zv6LfmPKMxRB9bitocrJYrF05mF8RjZECkgL8vhX2grCF1I1641qRIdA82aF2D6ozhUoiH2-aQ')" }}
                        ></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Arun Kumar</p>
                            <p className="text-[10px] text-slate-500 truncate">Super Admin</p>
                        </div>
                        <button className="text-slate-400 hover:text-primary transition-colors">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
