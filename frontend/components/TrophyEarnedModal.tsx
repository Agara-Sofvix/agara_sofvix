
import React from 'react';

interface Trophy {
    id: string;
    type: string;
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    label: string;
    value: string | number;
    icon: string;
}

interface TrophyEarnedModalProps {
    trophy: Trophy | null;
    onClose: () => void;
}

const TrophyEarnedModal: React.FC<TrophyEarnedModalProps> = ({ trophy, onClose }) => {
    if (!trophy) return null;

    const bgColors = {
        Diamond: 'bg-cyan-500',
        Gold: 'bg-amber-400',
        Silver: 'bg-slate-300',
        Bronze: 'bg-orange-400'
    };

    const ringColors = {
        Diamond: 'ring-cyan-200',
        Gold: 'ring-amber-200',
        Silver: 'ring-slate-200',
        Bronze: 'ring-orange-200'
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white border-4 border-slate-900 w-full max-w-sm rounded-[40px] shadow-2xl p-8 relative animate-in zoom-in-95 duration-500 text-center">
                {/* Celebration Background Effect */}
                <div className="absolute inset-0 overflow-hidden rounded-[40px] pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-header-brown/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-2">New Achievement!</div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 mb-6">Trophy Earned</h2>

                    {/* Icon Badge */}
                    <div className={`w-24 h-24 mx-auto rounded-3xl ${bgColors[trophy.tier]} flex items-center justify-center shadow-xl ring-8 ${ringColors[trophy.tier]} transition-transform hover:scale-110 mb-6`}>
                        <span className="material-symbols-outlined text-white text-5xl">{trophy.icon}</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-1">{trophy.label}</h3>
                    <p className="text-sm font-bold text-slate-500 lowercase tracking-widest mb-6">Unlocked: {trophy.value}</p>

                    <div className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 ${trophy.tier === 'Diamond' ? 'bg-cyan-100 text-cyan-600' :
                            trophy.tier === 'Gold' ? 'bg-amber-100 text-amber-600' :
                                trophy.tier === 'Silver' ? 'bg-slate-100 text-slate-600' :
                                    'bg-orange-100 text-orange-600'
                        }`}>
                        {trophy.tier} Tier Trophy
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-black transition-all active:scale-95 shadow-lg"
                    >
                        Claim & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrophyEarnedModal;
