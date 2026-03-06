import React, { useEffect, useState } from 'react';
import { getActiveAdvertisements } from '../src/services/api';

interface Advertisement {
    _id: string;
    title: string;
    description?: string;
    ctaText?: string;
    imageUrl?: string;
    linkUrl: string;
    position: 'left-side' | 'right-side';
}

interface SideAdsProps {
    position: 'left' | 'right';
}

interface GeneratedPosterProps {
    title: string;
    description?: string;
    ctaText?: string;
    imageUrl?: string;
    adId: string;
}

const THEMES = [
    {
        bg: 'from-[#064e3b] via-[#065f46] to-[#0f172a]',
        accent: 'bg-emerald-500',
        glow: 'bg-emerald-500/20',
        button: 'bg-emerald-600 hover:bg-emerald-500',
        buttonText: 'text-white'
    },
    {
        bg: 'from-[#1e1b4b] via-[#312e81] to-[#0f172a]',
        accent: 'bg-indigo-500',
        glow: 'bg-indigo-500/20',
        button: 'bg-indigo-600 hover:bg-indigo-500',
        buttonText: 'text-white'
    },
    {
        bg: 'from-[#4c0519] via-[#881337] to-[#0f172a]',
        accent: 'bg-rose-500',
        glow: 'bg-rose-500/20',
        button: 'bg-rose-600 hover:bg-rose-500',
        buttonText: 'text-white'
    },
    {
        bg: 'from-[#083344] via-[#155e75] to-[#0f172a]',
        accent: 'bg-cyan-500',
        glow: 'bg-cyan-500/20',
        button: 'bg-cyan-600 hover:bg-cyan-500',
        buttonText: 'text-white'
    }
];

const GeneratedPoster: React.FC<GeneratedPosterProps> = ({ title, description, ctaText, imageUrl, adId }) => {
    // Deterministically pick a theme based on adId
    const themeIndex = adId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % THEMES.length;
    const theme = THEMES[themeIndex];

    return (
        <div className={`w-full h-full bg-gradient-to-br ${theme.bg} flex flex-col items-center justify-between p-10 text-center relative overflow-hidden group`}>
            {/* Abstract tech background elements */}
            <div className={`absolute top-[-10%] left-[-10%] w-64 h-64 ${theme.accent}/10 rounded-full blur-[100px] animate-pulse`}></div>
            <div className={`absolute bottom-[-5%] right-[-5%] w-56 h-56 ${theme.accent}/5 rounded-full blur-[80px]`}></div>
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="z-10 mt-6">
                <div className="flex items-center gap-2 justify-center mb-6 opacity-40">
                    <div className="w-5 h-5 bg-white/20 rounded-md flex items-center justify-center">
                        <span className="text-[9px] text-white font-black">EZH</span>
                    </div>
                    <span className="text-[9px] text-white font-black uppercase tracking-[0.4em]">Tamil Typing</span>
                </div>
            </div>

            <div className="z-10 flex flex-col items-center gap-8 w-full h-full justify-center py-6">
                <h3 className="text-white text-3xl md:text-4xl font-black leading-tight tracking-tight uppercase px-4 drop-shadow-2xl">
                    {title}
                </h3>

                {imageUrl && (
                    <div className="w-full aspect-square max-w-[220px] relative">
                        <div className={`absolute inset-0 ${theme.glow} rounded-3xl blur-2xl animate-pulse`}></div>
                        <div className="relative w-full h-full bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 overflow-hidden shadow-2xl flex items-center justify-center group-hover:border-white/20 transition-colors duration-500">
                            <img 
                                src={imageUrl} 
                                alt={title} 
                                className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                    </div>
                )}
                
                {description && (
                    <p className="text-white/60 text-sm font-medium leading-relaxed max-w-[240px] line-clamp-4 px-4 mt-2">
                        {description}
                    </p>
                )}
            </div>

            <div className="z-10 mb-10 w-full px-8 flex flex-col items-center gap-5">
                <div className={`w-full ${theme.button} ${theme.buttonText} py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/10`}>
                    {ctaText || 'Start Now'}
                </div>
                <div className="text-[8px] text-white/20 font-black uppercase tracking-[0.6em] mt-3">Sponsored Content</div>
            </div>
        </div>
    );
};

const SideAds: React.FC<SideAdsProps> = ({ position }) => {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const allAds = await getActiveAdvertisements();
                const sideAds = allAds.filter((ad: Advertisement) => ad.position === `${position}-side`);
                setAds(sideAds);
            } catch (error) {
                console.error('Failed to fetch side advertisements:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAds();
    }, [position]);

    // Rotation Logic - Change ad every 20 seconds
    useEffect(() => {
        if (ads.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % ads.length);
        }, 20000);

        return () => clearInterval(interval);
    }, [ads.length]);

    const currentAd = ads[currentIndex];

    return (
        <aside className="w-full h-full bg-slate-50/10">
            {(!loading && currentAd) && (
                <div className="w-full h-full relative group">
                    <a
                        href={currentAd.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full h-full"
                    >
                        <div className="w-full h-full overflow-hidden">
                            <GeneratedPoster 
                                title={currentAd.title}
                                description={currentAd.description}
                                ctaText={currentAd.ctaText}
                                imageUrl={currentAd.imageUrl}
                                adId={currentAd._id}
                            />
                        </div>
                    </a>

                    {/* Rotation Progress Indicator */}
                    {ads.length > 1 && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-black/5 z-20">
                            <div
                                key={currentIndex}
                                className="h-full bg-white/20 origin-left"
                                style={{
                                    animation: `progress 20000ms linear`
                                }}
                            />
                        </div>
                    )}
                </div>
            )}

            <style sx>{`
                @keyframes progress {
                    from { transform: scaleX(0); }
                    to { transform: scaleX(1); }
                }
            `}</style>
        </aside>
    );
};

export default SideAds;
