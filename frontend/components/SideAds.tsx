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

interface GeneratedPosterProps {
    title: string;
    description?: string;
    ctaText?: string;
}

const GeneratedPoster: React.FC<GeneratedPosterProps> = ({ title, description, ctaText }) => (
    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 flex flex-col items-center justify-between p-8 text-center relative overflow-hidden">
        {/* Abstract shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

        <div className="z-10 mt-10">
            <div className="flex items-center gap-2 justify-center mb-8 opacity-60">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
                    <span className="text-[10px] text-white font-black">EZH</span>
                </div>
                <span className="text-[9px] text-white font-black uppercase tracking-[0.3em]">Tamil Typing</span>
            </div>
        </div>

        <div className="z-10 flex flex-col items-center gap-6 px-4">
            <h3 className="text-white text-3xl md:text-4xl font-black leading-[1.1] tracking-tight drop-shadow-lg uppercase">
                {title}
            </h3>
            {description && (
                <p className="text-white/80 text-sm font-medium leading-relaxed max-w-[200px] line-clamp-4">
                    {description}
                </p>
            )}
        </div>

        <div className="z-10 mb-12 w-full px-6">
            <div className="bg-white text-emerald-700 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">
                {ctaText || 'Start Now'}
            </div>
            <div className="mt-4 text-[8px] text-white/40 font-black uppercase tracking-[0.4em]">Advertisement</div>
        </div>
    </div>
);

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
                            {currentAd.imageUrl ? (
                                <img
                                    key={currentAd._id}
                                    src={currentAd.imageUrl}
                                    alt={currentAd.title}
                                    className="w-full h-full object-cover transition-opacity duration-1000 animate-in fade-in"
                                />
                            ) : (
                                <GeneratedPoster
                                    title={currentAd.title}
                                    description={currentAd.description}
                                    ctaText={currentAd.ctaText}
                                />
                            )}
                        </div>

                        {/* Subtle Ad Overlay for Image Ads */}
                        {currentAd.imageUrl && (
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <h4 className="text-white font-black text-sm leading-tight mb-1">
                                    {currentAd.title}
                                </h4>
                                {currentAd.description && (
                                    <p className="text-white/80 text-[10px] font-medium line-clamp-2">
                                        {currentAd.description}
                                    </p>
                                )}
                                <div className="mt-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Advertisement</div>
                            </div>
                        )}
                    </a>

                    {/* Rotation Progress Indicator */}
                    {ads.length > 1 && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-black/5 z-20">
                            <div
                                key={currentIndex}
                                className="h-full bg-primary/40 origin-left"
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
