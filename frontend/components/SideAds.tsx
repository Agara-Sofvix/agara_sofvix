import React, { useEffect, useState } from 'react';
import { getActiveAdvertisements } from '../src/services/api';

interface Advertisement {
    _id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    position: 'left-side' | 'right-side';
}

interface SideAdsProps {
    position: 'left' | 'right';
}

const SideAds: React.FC<SideAdsProps> = ({ position }) => {
    const [ads, setAds] = useState<Advertisement[]>([]);
    const [loading, setLoading] = useState(true);

    const colors = [
        'bg-rose-500',
        'bg-amber-500',
        'bg-emerald-500',
        'bg-sky-500',
        'bg-violet-500'
    ];

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

    return (
        <aside className="w-full h-full border-x border-slate-100/50 bg-slate-50/10">
            {(!loading && ads.length > 0) && (
                <div className="sticky top-24 pt-8 pb-4 px-3 flex flex-col gap-10 items-center">
                    {ads.map((ad, idx) => (
                        <div
                            key={ad._id}
                            className="bg-white border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 w-full group"
                        >
                            {/* Magazine Style Header Strip */}
                            <div className={`h-2 w-full ${colors[idx % colors.length]}`}></div>

                            <div className="px-3 py-2 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Advertisement</span>
                                <span className="material-symbols-outlined text-[14px] text-slate-300">open_in_new</span>
                            </div>

                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block">
                                <div className="p-1">
                                    <div className="overflow-hidden rounded-lg">
                                        <img
                                            src={ad.imageUrl}
                                            alt={ad.title}
                                            className="w-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-500 grayscale-[20%] group-hover:grayscale-0"
                                        />
                                    </div>
                                </div>
                                <div className="px-3 py-3 border-t border-slate-100">
                                    <h4 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-2">
                                        {ad.title}
                                    </h4>
                                    <div className="mt-2 flex items-center gap-1">
                                        <span className="text-[10px] font-bold text-primary uppercase">Read More</span>
                                        <div className="h-[1px] flex-grow bg-slate-100"></div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
};

export default SideAds;
