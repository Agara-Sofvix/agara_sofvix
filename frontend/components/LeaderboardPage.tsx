import React, { useState, useEffect } from 'react';
import { UserStats, LeaderboardEntry, LeaderboardPageProps } from '../src/types';
import { getTournamentLeaderboard, getActiveTournament } from '../src/services/api';
import { getUploadBaseUrl, getFullProfileUrl } from '../src/config/apiConfig';
import AdSenseBlock from './AdSenseBlock';

const LeaderboardPage: React.FC<LeaderboardPageProps> = ({ onNavigate, stats }) => {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [activeTournament, setActiveTournament] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [competitorCount, setCompetitorCount] = useState(0);
    const [userRank, setUserRank] = useState(-1);
    const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const tournament = await getActiveTournament();
                setActiveTournament(tournament);

                if (tournament?._id) {
                    const token = localStorage.getItem('token');
                    const lbData = await getTournamentLeaderboard(tournament._id, token || undefined);

                    setLeaderboard(lbData.leaderboard || []);
                    setUserEntry(lbData.userEntry || null);
                    setUserRank(lbData.userRank ?? -1);
                    setCompetitorCount(lbData.totalParticipants || 0);
                }
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch leaderboard page data", err);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-warm-bg">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#92450f]"></div>
            </div>
        );
    }

    if (!activeTournament) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-warm-bg min-h-screen">
                <h2 className="text-3xl font-black text-header-brown mb-4 uppercase tracking-tighter">Arena Closed</h2>
                <button onClick={() => onNavigate('Home')} className="text-[#f59e0b] font-bold hover:underline font-display uppercase tracking-widest text-xs">Return Home</button>
            </div>
        );
    }

    const topThree = [leaderboard[1], leaderboard[0], leaderboard[2]]; // 2nd, 1st, 3rd for podium
    const restOfLeaderboard = leaderboard.slice(3, 5); // STRICTLY Positions 4-5

    return (
        <div className="min-h-screen bg-warm-bg font-display text-header-brown p-4 md:p-8 animate-in fade-in duration-1000">

            <style dangerouslySetInnerHTML={{
                __html: `
                .podium-card {
                    background: white;
                    border: 1px solid #92450f15;
                    border-radius: 2.5rem;
                    box-shadow: 0 10px 30px -10px rgba(146, 69, 15, 0.1);
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    position: relative;
                }
                .podium-card:hover { 
                    transform: translateY(-8px); 
                    box-shadow: 0 20px 40px -15px rgba(146, 69, 15, 0.15);
                    border-color: #f59e0b40;
                }
                
                .podium-rank-1 { min-height: 320px; z-index: 10; border-color: #f59e0b40; }
                .podium-rank-2 { min-height: 280px; margin-top: 40px; }
                .podium-rank-3 { min-height: 260px; margin-top: 60px; }

                .list-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border: 1px solid #92450f10;
                    border-radius: 2.5rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                }

                @media (max-width: 1024px) {
                    .podium-rank-1, .podium-rank-2, .podium-rank-3 { height: auto; margin-top: 0; }
                }
            `}} />

            <div className="max-w-4xl mx-auto flex flex-col gap-8 h-full">

                {/* Header Nav */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col">
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-header-brown">{activeTournament.name}</h1>
                    </div>
                    <button
                        onClick={() => onNavigate('Home')}
                        className="flex items-center gap-2 group px-6 py-3 bg-white rounded-full border border-[#92450f20] shadow-sm hover:shadow-md transition-all active:scale-95 text-[#92450f]"
                    >
                        <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
                        <span className="text-[11px] font-black uppercase tracking-widest">Exit Arena</span>
                    </button>
                </div>

                <div className="flex flex-col gap-10">

                    {/* Podium Section */}
                    <div className="grid grid-cols-3 gap-4 items-end">
                        {topThree.map((entry, i) => {
                            const rank = i === 0 ? 2 : i === 1 ? 1 : 3;
                            const isRank1 = rank === 1;
                            const isEmpty = !entry;

                            return (
                                <div key={rank} className={`podium-card p-6 flex flex-col items-center justify-center text-center podium-rank-${rank} ${isEmpty ? 'opacity-30' : ''}`}>
                                    <div className="relative mb-4">
                                        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[2rem] overflow-hidden border-2 flex items-center justify-center ${rank === 1 ? 'border-[#f59e0b] scale-110 shadow-lg' :
                                            rank === 2 ? 'border-slate-300' :
                                                'border-amber-700/30'
                                            }`}>
                                            {!isEmpty && (
                                                (() => {
                                                    const avatarUrl = getFullProfileUrl(entry.user.profilePic);
                                                    if (avatarUrl) {
                                                        return (
                                                            <img
                                                                src={avatarUrl}
                                                                alt={entry.user.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        );
                                                    }
                                                    return (
                                                        <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center text-slate-300">
                                                            <span className="material-symbols-outlined text-xl">person</span>
                                                            <span className="text-[6px] font-black uppercase tracking-tighter opacity-40">Empty</span>
                                                        </div>
                                                    );
                                                })()
                                            )}
                                            {isEmpty && <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs opacity-20 italic">-</div>}
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-xl transition-transform hover:scale-110 ${rank === 1 ? 'bg-[#f59e0b] ring-4 ring-[#f59e0b20]' :
                                            rank === 2 ? 'bg-[#94a3b8] ring-4 ring-[#94a3b820]' :
                                                rank === 3 ? 'bg-[#b45309] ring-4 ring-[#b4530920]' :
                                                    'bg-slate-400'
                                            }`}>
                                            <span className="material-symbols-outlined text-[18px]">
                                                {rank === 1 ? 'trophy' : rank === 2 ? 'military_tech' : rank === 3 ? 'workspace_premium' : 'person'}
                                            </span>
                                        </div>
                                    </div>
                                    {!isEmpty && (
                                        <div className="truncate w-full px-2">
                                            <div className="flex flex-col items-center">
                                                <p className={`font-black tracking-[0.2em] uppercase text-[8px] mb-1 ${rank === 1 ? 'text-[#f59e0b]' :
                                                    rank === 2 ? 'text-slate-400' :
                                                        'text-amber-800'
                                                    }`}>
                                                    {rank === 1 ? 'Gold Trophy' : rank === 2 ? 'Silver Trophy' : 'Bronze Trophy'}
                                                </p>
                                                <p className={`font-black tracking-tight leading-tight ${isRank1 ? 'text-lg text-[#92450f]' : 'text-sm text-[#92450f]/60'}`}>
                                                    {entry.user.name || entry.user.username}
                                                </p>
                                            </div>
                                            <div className="mt-2 flex flex-col items-center">
                                                <p className={`font-black ${isRank1 ? 'text-5xl' : 'text-3xl'} text-[#92450f]`}>{entry.score || 0}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Match Score</p>
                                                <div className="flex items-center gap-2 mt-1 opacity-40">
                                                    <span className="text-[10px] font-bold">{entry.wpm} WPM</span>
                                                    <span className="w-1 h-1 rounded-full bg-current"></span>
                                                    <span className="text-[10px] font-bold">{entry.accuracy}% ACC</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="my-8 flex justify-center">
                        <AdSenseBlock adSlot="9900112233" adFormat="auto" />
                    </div>

                    {/* Top 5 List Section (Ranks 4-5) */}
                    <div className="list-card overflow-hidden max-w-2xl mx-auto w-full">
                        <div className="p-6 border-b border-[#92450f08] bg-white/40 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-40">Standing Ranks 4-5</h3>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#f59e0b]">Elite Top 5</span>
                            </div>
                        </div>
                        <div className="p-2">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-[#92450f05]">
                                    {restOfLeaderboard.length > 0 ? (
                                        restOfLeaderboard.map((entry, i) => {
                                            const rank = i + 4;
                                            const isMe = entry.user.username === stats.displayName || entry.user.name === stats.displayName;
                                            return (
                                                <tr key={i} className={`hover:bg-white/40 transition-colors group ${isMe ? 'bg-[#f59e0b08]' : ''}`}>
                                                    <td className="px-6 py-4 text-xs font-black opacity-30 w-12">{rank.toString().padStart(2, '0')}</td>
                                                    <td className="px-2 py-4 flex items-center gap-4">
                                                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-[#92450f10] bg-white opacity-40 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            {(() => {
                                                                const avatarUrl = getFullProfileUrl(entry.user.profilePic);
                                                                if (avatarUrl) {
                                                                    return (
                                                                        <img
                                                                            src={avatarUrl}
                                                                            alt={entry.user.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    );
                                                                }
                                                                return <span className="material-symbols-outlined text-slate-200 text-sm">person</span>;
                                                            })()}
                                                        </div>
                                                        <p className={`text-sm font-bold tracking-tight ${isMe ? 'text-[#92450f]' : 'opacity-80'}`}>
                                                            {entry.user.name || entry.user.username}
                                                            {isMe && <span className="ml-2 text-[8px] italic text-[#92450f]/60">(You)</span>}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl font-black text-[#92450f]">{entry.score || 0}</span>
                                                                <span className="text-[9px] font-black uppercase tracking-widest opacity-30">PTS</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 opacity-40">
                                                                <span className="text-[9px] font-bold">{entry.wpm} WPM</span>
                                                                <span className="text-[9px] font-bold">|</span>
                                                                <span className="text-[9px] font-bold">{entry.accuracy}%</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center text-[10px] font-black uppercase tracking-[0.5em] opacity-10">Awaiting Rankings...</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Personal Standing Card (Always shows if Rank > 5) */}
                        {userEntry && userRank > 5 && (
                            <div className="p-8 bg-[#92450f]/5 border-t border-[#92450f10] flex items-center justify-between animate-in slide-in-from-bottom-2 duration-700">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-[#92450f] flex items-center justify-center text-white font-black text-xs shadow-lg shadow-amber-900/20">
                                        #{userRank}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#92450f]/60 mb-1">Your Standing</p>
                                        <p className="text-lg font-black text-header-brown">{stats.displayName}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-2">
                                            <p className="text-4xl font-black text-[#92450f]">{userEntry.score || 0}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-[#92450f]/40">Score</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-[#92450f]/60">{userEntry.wpm} WPM • {userEntry.accuracy}% Accuracy</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-center">
                        <AdSenseBlock adSlot="1112223334" adFormat="auto" />
                    </div>
                </div>

                {/* Footer Credits */}
                <footer className="mt-12 py-8 border-t border-[#92450f08] flex items-center justify-between gap-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-20">Ezhuthidu Arena System © 2026</p>
                    <div className="flex gap-8 opacity-40">
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase tracking-widest mb-1">Global Participants</p>
                            <p className="text-xs font-black">{competitorCount}</p>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default LeaderboardPage;
