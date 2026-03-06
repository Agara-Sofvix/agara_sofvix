
import React, { useState, useEffect } from 'react';
import { UserStats } from '../App';

interface TournamentArenaProps {
  onNavigate: (view: string) => void;
  stats: UserStats;
  activeTournament?: any;
}

import { getTournamentLeaderboard, getActiveTournament, getRegistrationStatus, joinTournament } from '@/src/services/api';

interface LeaderboardEntry {
  wpm: number;
  accuracy: number;
  user: {
    username: string;
    name: string;
  };
}

const TournamentArena: React.FC<TournamentArenaProps> = ({ onNavigate, stats, activeTournament: propTournament }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [userRank, setUserRank] = useState<number>(-1);
  const [activeTournament, setActiveTournament] = useState<any>(propTournament || null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [competitorCount, setCompetitorCount] = useState<number>(0);

  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        let currentTournament = propTournament;
        if (!currentTournament) {
          currentTournament = await getActiveTournament();
          setActiveTournament(currentTournament);
        } else {
          setActiveTournament(propTournament);
        }

        if (currentTournament?._id) {
          const tournamentId = String(currentTournament._id);
          const token = localStorage.getItem('token');
          const response = await getTournamentLeaderboard(tournamentId, token || undefined);

          // Handle new object structure { leaderboard, userEntry, userRank, totalParticipants }
          setLeaderboard(response.leaderboard || []);
          setUserEntry(response.userEntry || null);
          setUserRank(response.userRank ?? -1);
          setCompetitorCount(response.totalParticipants || 0);

          // Check registration status if token exists
          if (token) {
            const registered = await getRegistrationStatus(currentTournament._id, token);
            setIsRegistered(registered);
          }
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch arena data", err);
        setIsLoading(false);
      }
    };

    fetchArenaData();
  }, [propTournament]);

  const handleRegister = async () => {
    if (!activeTournament?._id) return;
    const token = localStorage.getItem('token');
    if (!token) {
      onNavigate('Login');
      return;
    }

    setIsRegistering(true);
    try {
      await joinTournament(activeTournament._id, token);
      setIsRegistered(true);
      setCompetitorCount(prev => prev + 1);

      // Locally update user entry for immediate feedback
      const newUserEntryRow: LeaderboardEntry = {
        wpm: 0,
        accuracy: 0,
        user: {
          username: stats.displayName,
          name: stats.displayName
        }
      };

      setUserEntry(newUserEntryRow);
      setUserRank(0); // Registered but no score

      setLeaderboard(prev => {
        // Only add to Top 50 if it's empty or has space (simplification for UI feedback)
        const alreadyIn = prev.some(e => e.user.username === stats.displayName || e.user.name === stats.displayName);
        if (!alreadyIn && prev.length < 50) {
          return [...prev, newUserEntryRow];
        }
        return prev;
      });
    } catch (err: any) {
      console.error("Failed to register for tournament", err);
      alert(err.message || "Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-1000">
      <style dangerouslySetInnerHTML={{
        __html: `
        .organic-core {
            position: relative;
            width: 100%;
            max-width: 550px;
            min-height: 520px;
            background: rgba(255, 251, 235, 0.5);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 45% 55% 70% 30% / 30% 40% 60% 70%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2.5rem 3rem;
            text-align: center;
            box-shadow: inset 0 0 60px rgba(255,255,255,0.4), 0 25px 50px -12px rgba(0,0,0,0.1);
            margin-bottom: 3rem;
            transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
        }
        .organic-core:hover {
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.5);
        }
        .pill-stat {
            background: rgba(255, 251, 235, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 9999px;
            padding: 0.8rem 2rem;
            display: flex;
            align-items: center;
            gap: 1.25rem;
            width: auto;
            min-width: 220px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        .pill-stat:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.7);
        }
        .pulse-live {
            animation: pulse-live 2s infinite;
        }
        @keyframes pulse-live {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.5); opacity: 0.5; }
            100% { transform: scale(1); opacity: 1; }
        }
        .guideline-tile {
            background: rgba(255, 251, 235, 0.4);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.5);
            border-radius: 2rem;
            padding: 1.75rem 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            aspect-ratio: 1 / 1.2;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        .standing-card {
            width: 100%;
            max-width: 300px;
            aspect-ratio: 1.5 / 1;
            border: 2px dashed rgba(0,0,0,0.1);
            border-radius: 2.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            text-align: center;
            background: rgba(0,0,0,0.02);
        }
        .rank-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            width: 100%;
        }
        .arena-asymmetric-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 3rem;
            align-items: start;
            width: 100%;
        }
        @media (min-width: 1024px) and (max-width: 1279px) {
            .arena-asymmetric-grid {
                grid-template-columns: 280px 1fr 300px;
                gap: 2rem;
            }
        }
        @media (min-width: 1280px) {
            .arena-asymmetric-grid {
                grid-template-columns: 1fr;
                gap: 4rem;
                max-width: 800px;
                margin: 0 auto;
            }
        }
      `}} />

      {!isLoading && !activeTournament ? (
        <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-700">
          <div className="organic-core max-w-[550px] w-full mb-12">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#92450f]/5 to-transparent pointer-events-none"></div>
            <div className="flex items-center gap-3 mb-6 bg-slate-600/10 border border-slate-600/20 px-4 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
                Arena Closed
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 leading-tight">
              No Active Tournaments
            </h1>
            <p className="text-xs font-bold opacity-70 max-w-[280px] mb-8 leading-relaxed text-center mx-auto text-slate-600">
              There are currently no tournaments scheduled. Please check back later for upcoming events.
            </p>
            <button
              onClick={() => onNavigate('Home')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#92450f] hover:opacity-60 transition-all group"
            >
              <span className="material-symbols-outlined text-xs transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Home
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="arena-asymmetric-grid py-8">

            {/* Left Column: GLOBAL LEADERBOARD + PERSONAL STANDING (lg+) */}
            <section className="flex flex-col gap-12 animate-in slide-in-from-left-8 duration-700 order-2 xl:order-2">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-black opacity-60">Tournament Leaderboard</h2>
                  <div className="bg-black/5 px-2 py-1 rounded text-[8px] font-black tracking-widest uppercase opacity-40">
                    {competitorCount} Registered
                  </div>
                </div>
                <div className="space-y-1">
                  {isLoading ? (
                    <p className="text-xs opacity-50">Loading leaderboard...</p>
                  ) : leaderboard.length > 0 ? (
                    <>
                      {leaderboard.slice(0, 3).map((entry, i) => (
                        <div key={i} className={`rank-item ${(entry.user.username === stats.displayName || entry.user.name === stats.displayName) ? 'bg-primary/5 rounded-xl px-2 border-l-2 border-primary' : ''}`}>
                          <div className="flex items-center gap-4">
                            <span className="text-xl font-black italic text-slate-400">0{i + 1}</span>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{entry.user.username || entry.user.name} {(entry.user.username === stats.displayName || entry.user.name === stats.displayName) && '(You)'}</span>
                              <span className="text-[8px] opacity-60 uppercase tracking-wider">{entry.accuracy}% Accuracy</span>
                            </div>
                          </div>
                          <span className="text-lg font-black text-primary">{entry.wpm} WPM</span>
                        </div>
                      ))}

                      {/* Show current user if not in Top 3 or if registered but no score yet */}
                      {(() => {
                        const isNoScore = userRank === 0 && userEntry;
                        const isNotInTop3 = userRank > 3 && userEntry;

                        if (isNoScore || isNotInTop3) {
                          return (
                            <>
                              <div className="py-2 flex justify-center opacity-30">
                                <span className="text-xs font-black tracking-[0.3em]">•••</span>
                              </div>
                              <div className="rank-item border-2 border-dashed border-primary/20 bg-primary/5 rounded-xl px-2">
                                <div className="flex items-center gap-4">
                                  <span className="text-xl font-black italic text-primary/40">
                                    {userRank > 0 ? userRank.toString().padStart(2, '0') : '--'}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold">{userEntry.user.username || userEntry.user.name} (You)</span>
                                    <span className="text-[8px] opacity-60 uppercase tracking-wider">
                                      {isNoScore ? 'Registered' : `${userEntry.accuracy}% Accuracy`}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-lg font-black text-primary">{userEntry.wpm} WPM</span>
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}
                    </>
                  ) : (
                    <div className="text-center py-4 opacity-50 text-xs">No entries yet. Be the first!</div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-black opacity-60">Personal Standing</h2>
                <div className="standing-card">
                  <span className="material-symbols-outlined text-4xl mb-3 opacity-20">leaderboard</span>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1">Ranking</p>
                  <p className="text-xl font-black">
                    {isLoading ? '...' : (userRank > 0 ? `#${userRank}` : (isRegistered ? 'Registered' : 'Not Ranked'))}
                  </p>
                  {!isLoading && isRegistered && (
                    <p className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-30 mt-2">
                      Out of {competitorCount} Registered Users
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Center Column: LIVE ACTIVE (lg+) */}
            <section className="flex flex-col items-center animate-in zoom-in duration-700 order-1 xl:order-1">
              <div className="organic-core max-w-[550px] w-full mb-12">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#92450f]/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-6 bg-red-600/10 border border-red-600/20 px-4 py-1.5 rounded-full">
                  <span className={`w-2 h-2 rounded-full pulse-live ${activeTournament ? 'bg-red-600' : 'bg-slate-400'}`}></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">
                    {activeTournament ? 'Live Tournament Active' : 'Arena Closed'}
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4 leading-tight">
                  {activeTournament ? activeTournament.name : 'Elite Sprint'}
                </h1>
                <p className="text-xs font-bold opacity-70 max-w-[280px] mb-8 leading-relaxed text-center mx-auto text-slate-600">
                  {activeTournament ? (activeTournament.subheading || activeTournament.description) : 'The pinnacle of Tamil typing proficiency. Prove your digital legacy.'}
                </p>
                {isRegistered ? (
                  <button
                    className="group relative w-64 h-16 rounded-full bg-[#92450f] text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl"
                    onClick={() => onNavigate('TournamentStart')}
                  >
                    <span className="relative z-10 text-lg font-black tracking-widest uppercase">Start</span>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                ) : (
                  <button
                    className={`group relative w-64 h-16 rounded-full ${isRegistering ? 'bg-slate-400' : 'bg-red-600'} text-white overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl`}
                    onClick={handleRegister}
                    disabled={isRegistering}
                  >
                    <span className="relative z-10 text-sm font-black tracking-widest uppercase">
                      {isRegistering ? 'Registering...' : 'Register to Compete'}
                    </span>
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
                )}
                <div className="mt-6 flex items-center gap-2 opacity-40">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Secure Protocol Enabled</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-6 w-full">
                <div className="pill-stat">
                  <div className="w-10 h-10 rounded-full bg-[#92450f]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#92450f]">groups</span>
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{competitorCount.toLocaleString()}</p>
                    <p className="text-[10px] font-bold uppercase opacity-50">Competitors</p>
                  </div>
                </div>

                <div className="pill-stat">
                  <div className="w-10 h-10 rounded-full bg-[#92450f]/10 flex items-center justify-center overflow-hidden">
                    <img
                      alt="Top User"
                      className="w-full h-full object-cover"
                      src={leaderboard[0] ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${leaderboard[0].user.username || leaderboard[0].user.name}` : "https://api.dicebear.com/7.x/avataaars/svg?seed=Kathir"}
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-black leading-none">{leaderboard[0] ? (leaderboard[0].user.username || leaderboard[0].user.name) : 'No Leader'}</p>
                    <p className="text-[10px] font-bold uppercase opacity-50">Current Leader</p>
                  </div>
                </div>

              </div>
            </section>

            {/* Right Column: SYSTEM GUIDELINES (lg+) */}
            <section className="flex flex-col items-center animate-in slide-in-from-right-8 duration-700 order-3 xl:order-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-black opacity-60">System Guidelines</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 w-full">
                <div className="guideline-tile">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">cake</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">16+ Age<br />Requirement</p>
                </div>
                <div className="guideline-tile mt-8">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">history_edu</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">Multiple<br />Attempts</p>
                </div>
                <div className="guideline-tile">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">refresh</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">No Page<br />Reload</p>
                </div>
                <div className="guideline-tile mt-8">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">extension_off</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">Anti-Cheat<br />Active</p>
                </div>
                <div className="guideline-tile">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">precision_manufacturing</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">95% Acc<br />Minimum</p>
                </div>
                <div className="guideline-tile mt-8">
                  <span className="material-symbols-outlined text-3xl mb-4 opacity-70">shield_lock</span>
                  <p className="text-[10px] font-black uppercase leading-tight tracking-widest">Permanent<br />Entry</p>
                </div>
              </div>
            </section>

          </div>

          <div className="mt-16 flex justify-center pb-12">
            <button
              onClick={() => onNavigate('Home')}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:opacity-60 transition-all group"
            >
              <span className="material-symbols-outlined text-xs transition-transform group-hover:-translate-x-1">arrow_back</span>
              Back to Home
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TournamentArena;
