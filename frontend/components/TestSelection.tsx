import React, { useState } from 'react';
import { useTextStore } from '../src/store/useTextStore';
import AdSenseBlock from './AdSenseBlock';

interface TestSelectionProps {
    onStart: (config: { duration: number; module: string }) => void;
    defaultDuration?: string;
    isLoggedIn?: boolean;
    onOpenLoginRequired?: () => void;
}

const MODULE_METADATA: Record<string, { label: string; icon: string; color: string; bg: string; desc: string }> = {
    'literature': { label: 'Literature', icon: 'auto_stories', color: 'text-purple-500', bg: 'bg-purple-50', desc: 'Classical and modern Tamil literary excerpts.' },
    'general': { label: 'General', icon: 'public', color: 'text-blue-600', bg: 'bg-blue-50', desc: 'General knowledge and miscellaneous Tamil content.' },
    'news': { label: 'News', icon: 'newspaper', color: 'text-cyan-600', bg: 'bg-cyan-50', desc: 'Stay updated while improving your typing with latest news.' },
    'social': { label: 'Social', icon: 'forum', color: 'text-rose-500', bg: 'bg-rose-50', desc: 'Current affairs and social commentary in Tamil.' },
    'election': { label: 'Election', icon: 'how_to_vote', color: 'text-red-600', bg: 'bg-red-50', desc: 'Political discourse and election-related Tamil content.' },
};

const TestSelection: React.FC<TestSelectionProps> = ({ onStart, defaultDuration = '1m', isLoggedIn, onOpenLoginRequired }) => {
    const { getCategories, fetchTexts, isLoading } = useTextStore();
    const [selectedModule, setSelectedModule] = useState('');
    const [duration, setDuration] = useState(defaultDuration);

    const categories = getCategories();

    React.useEffect(() => {
        fetchTexts();
    }, [fetchTexts]);

    React.useEffect(() => {
        if (categories.length > 0 && !selectedModule) {
            setSelectedModule(categories[0]);
        }
    }, [categories, selectedModule]);

    const displayModules = categories
        .filter(cat => Object.keys(MODULE_METADATA).includes(cat))
        .map(cat => ({
            id: cat,
            ...MODULE_METADATA[cat]
        }));

    const handleStart = () => {
        if (!isLoggedIn) {
            onOpenLoginRequired?.();
            return;
        }
        if (!selectedModule) return;

        const mins = parseInt(duration) || 1;
        onStart({
            duration: mins * 60,
            module: selectedModule
        });
    };

    if (isLoading && categories.length === 0) {
        return (
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 font-bold opacity-60">Loading modules...</p>
            </div>
        );
    }

    if (!isLoading && categories.length === 0) {
        return (
            <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-20">
                <div className="text-center space-y-4">
                    <span className="material-symbols-outlined text-6xl text-slate-300">block</span>
                    <h2 className="text-2xl font-black">No Content Available</h2>
                    <p className="text-slate-500">Wait for the admin to provide content in the admin panel.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center py-8 animate-in fade-in zoom-in duration-700">
            <div className="mb-8 w-full flex justify-center">
                <AdSenseBlock adSlot="4455667788" adFormat="auto" />
            </div>
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-tight text-slate-900">
                    Configure Your <span className="text-primary">Typing Mission</span>
                </h1>
                <p className="mt-6 text-lg font-bold opacity-60 max-w-2xl mx-auto">
                    Select your testing module and duration to begin your official performance evaluation. Precision and speed are your primary objectives.
                </p>
            </div>

            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Module Selection */}
                <div className="space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] ml-2 text-slate-500">01. Select Topic Module</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {displayModules.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedModule(m.id)}
                                className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all text-left ${selectedModule === m.id
                                    ? 'bg-cream-light/70 border-primary shadow-2xl scale-[1.02]'
                                    : 'bg-cream-light/50 border-black/5 hover:bg-cream-light/60 shadow-inner'
                                    }`}
                            >
                                <div className={`w-16 h-16 rounded-2xl ${m.bg} flex items-center justify-center`}>
                                    <span className={`material-symbols-outlined text-3xl ${m.color}`}>{m.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-xl text-slate-900">{m.label}</h3>
                                    <p className="text-sm font-medium opacity-60 leading-relaxed">{m.desc}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedModule === m.id ? 'border-primary bg-primary' : 'border-slate-300'}`}>
                                    {selectedModule === m.id && <span className="material-symbols-outlined text-white text-base">check</span>}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Configuration Panel */}
                <div className="lg:sticky lg:top-24 space-y-8">
                    <div className="bg-cream-light/50 border border-slate-100 rounded-[50px] p-8 md:p-12 shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none"></div>

                        <div className="space-y-10">
                            <h2 className="text-2xl font-black flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">settings</span>
                                Session Config
                            </h2>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-500">Mission Duration</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {['1m', '2m', '5m'].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setDuration(d)}
                                            className={`py-4 rounded-2xl font-black transition-all ${duration === d
                                                ? 'bg-header-brown text-white shadow-xl scale-105'
                                                : 'bg-cream-light/40 border border-slate-100 text-slate-600 hover:border-primary/30 transition-all'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-4 mb-3">
                                    <span className="material-symbols-outlined text-primary">info</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Mission Summary</span>
                                </div>
                                <p className="text-sm font-bold opacity-80 text-slate-600">
                                    You are about to start a <span className="text-primary">{duration}</span> test on <span className="text-primary">{displayModules.find(m => m.id === selectedModule)?.label}</span>.
                                    Your performance will be logged to your elite dashboard.
                                </p>
                            </div>

                            <button
                                onClick={handleStart}
                                className="w-full h-20 bg-primary text-white rounded-[2rem] font-black text-xl uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group"
                            >
                                Initiate Test
                                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">bolt</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <AdSenseBlock adSlot="9988776655" adFormat="rectangle" />
                    </div>

                    <div className="flex items-center justify-center gap-6 opacity-40">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Anti-Cheat Active</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">history</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Auto-Save Enabled</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestSelection;
