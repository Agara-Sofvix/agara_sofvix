import { Search, Bell, Moon, Plus, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

const Header = () => {
    const { settings } = useSettings();
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-background-dark border-b border-slate-200 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/50 dark:placeholder-slate-500 outline-none text-slate-900 dark:text-white"
                        placeholder="Search tournaments, players, or logs..."
                        type="text"
                    />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                    <Bell size={20} />
                </button>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:opacity-90 text-white rounded-lg transition-all duration-500 shadow-lg shadow-primary/20">
                    <Plus size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Tournament</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
