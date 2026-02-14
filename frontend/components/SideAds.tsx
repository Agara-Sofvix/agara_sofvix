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

    useEffect(() => {
        const fetchAds = async () => {
            try {
                const allAds = await getActiveAdvertisements();
                // Filter ads based on the specific side requested
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

    // Always maintain the 15% wide container in the layout to preserve structure
    return (
        <aside className="hidden xl:block xl:w-[15%] shrink-0 h-full relative">
            {(!loading && ads.length > 0) && (
                <div className={`fixed top-20 bottom-0 ${position === 'left' ? 'left-0 pl-1 pr-6' : 'right-0 pr-1 pl-6'} w-[15%] flex flex-col items-center justify-start py-8 gap-6 overflow-y-auto no-scrollbar z-10`}>
                    {ads.map((ad) => (
                        <div key={ad._id} className="relative group cursor-pointer w-full flex-shrink-0">
                            <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <img
                                    src={ad.imageUrl}
                                    alt={ad.title}
                                    className="w-full shadow-lg border-y border-slate-200 transition-transform group-hover:scale-[1.01]"
                                />
                                <div className="mt-2 text-center px-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Advertisement</p>
                                    <p className="text-xs font-bold text-slate-600 truncate mt-1">{ad.title}</p>
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
