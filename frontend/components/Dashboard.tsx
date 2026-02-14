import React from 'react';
import { UserStats, AppSettings } from '../App';

interface DashboardProps {
  onNavigate: (view: string) => void;
  stats: UserStats;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats, settings, setSettings }) => {
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const isEmpty = stats.history.length === 0;

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="xs:text-xs text-sm sm:text-base flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-10">
      {/* Background Blobs for Organic Feel - Removed background blobs for cleaner look */}

      {/* Profile Section */}
      <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="relative">
          <div className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 lg:w-80 bg-cream-light/50 border border-slate-200 rounded-[30px] sm:rounded-[50px] md:rounded-[60px] p-2 sm:p-4 transition-all duration-700 shadow-inner overflow-visible z-10">
            <img
              alt="User Avatar"
              className="w-full h-full object-cover rounded-[24px] sm:rounded-[48px]"
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${stats.displayName}`}
            />
          </div>

          {/* Mobile compact stats row (equal boxes) */}
          <div className="mt-4 sm:hidden flex w-full gap-3 justify-between px-2">
            <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-3 text-center">
              <div className="xs:text-[9px] text-[10px] font-black uppercase opacity-60">Best WPM</div>
              <div className="xs:text-base text-lg font-black mt-1">{stats.bestWpm}</div>
            </div>
            <div className="flex-1 bg-black text-white rounded-2xl p-3 text-center">
              <div className="xs:text-[9px] text-[10px] font-black uppercase opacity-70">Accuracy</div>
              <div className="xs:text-base text-lg font-black mt-1">{stats.accuracy}%</div>
            </div>
            <div className="flex-1 bg-primary text-white rounded-2xl p-3 text-center">
              <p className="text-[10px] font-black uppercase opacity-60">Success Rate</p>
              <p className="text-xl font-black">{stats.accuracy}%</p>
            </div>
          </div>

          {/* Floating Stats Badges (mobile: inside avatar; sm+: outside) */}
          <div className="hidden sm:flex absolute top-2 right-2 sm:-top-4 sm:-right-4 w-9 h-9 sm:w-20 sm:h-20 rounded-full bg-cream-light border border-slate-200 flex-col items-center justify-center shadow-lg animate-bounce z-30" style={{ animationDuration: '4s' }}>
            <span className="text-[8px] sm:text-[10px] font-black uppercase opacity-40 text-slate-900">Best WPM</span>
            <span className="text-sm sm:text-3xl font-black text-slate-900">{stats.bestWpm}</span>
          </div>
          <div className="hidden sm:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 sm:top-1/2 sm:left-0 sm:-left-8 sm:-translate-y-1/2 w-14 h-14 sm:w-18 sm:h-18 md:w-24 md:h-24 rounded-full bg-header-brown text-white flex-col items-center justify-center shadow-2xl z-30">
            <span className="text-[9px] sm:text-[10px] md:text-sm font-black uppercase opacity-70">Accuracy</span>
            <span className="text-base sm:text-xl md:text-2xl font-black">{stats.accuracy}%</span>
          </div>
          <div className="hidden sm:flex absolute bottom-2 right-2 sm:-bottom-2 sm:right-6 w-9 h-9 sm:w-16 sm:h-16 rounded-full bg-primary text-white flex-col items-center justify-center shadow-2xl z-30">
            <span className="text-[8px] sm:text-[9px] font-black uppercase opacity-80 leading-none">Streak</span>
            <span className="text-sm sm:text-xl font-black">{stats.streak}d</span>
          </div>
        </div>

        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div>
            <span className="text-xs font-black uppercase tracking-[0.5em] text-primary">Elite Member</span>
            <h1 className="xs:text-xl text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter leading-[1.1] mt-2 text-slate-900 break-words">
              {stats.displayName}
            </h1>
            <p className="xs:text-sm text-base sm:text-lg font-bold opacity-60 mt-4 max-w-xs mx-auto lg:mx-0 text-slate-800">
              {isEmpty
                ? "Welcome to எழுத்திடு! Take your first test or practice session to start building your performance dashboard."
                : "Sculpting the future of Tamil digital communication, one keystroke at a time."
              }
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
            <div className="px-10 py-4 bg-black text-white rounded-full font-black text-sm tracking-widest uppercase shadow-xl hover:scale-105 transition-transform cursor-default">
              Level {stats.level}
            </div>
            {stats.tournamentBest > 0 && (
              <div className="px-8 py-4 bg-primary text-white rounded-full font-black text-sm tracking-widest uppercase shadow-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-lg">emoji_events</span>
                Tournament PB: {stats.tournamentBest} WPM
              </div>
            )}
            <button
              onClick={() => onNavigate('TournamentArena')}
              className="px-8 py-4 bg-primary text-white rounded-full font-black text-sm tracking-widest uppercase shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">sports_esports</span>
              Enter Arena
            </button>
            {isEmpty && (
              <button
                onClick={() => onNavigate('Test')}
                className="px-8 py-4 bg-primary text-white rounded-full font-black text-sm tracking-widest uppercase shadow-xl hover:scale-105 transition-transform"
              >
                Start First Test
              </button>
            )}
            <button
              onClick={() => onNavigate('Logout')}
              className="px-8 py-4 bg-red-600 text-white rounded-full font-black text-sm tracking-widest uppercase shadow-xl hover:scale-105 transition-transform flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* Analytics Chart Section */}
      <section className="relative bg-cream-light/50 border border-slate-200 rounded-[20px] sm:rounded-[30px] md:rounded-[50px] p-3 sm:p-6 md:p-8 lg:p-12 overflow-hidden h-[180px] sm:h-[280px] md:h-[400px] shadow-inner group">
        <div className="relative z-20 flex justify-between items-start">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2 text-slate-900">Performance Analytics</h3>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">Speed Trajectory</h2>
          </div>
          <div className="flex gap-12">
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-40 text-slate-900">Recent Session Avg</p>
              <p className="text-2xl font-black text-slate-900">{stats.avgWpm} <span className="text-xs opacity-40">WPM</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase opacity-40 text-slate-900">Top Speed</p>
              <p className="text-2xl font-black text-slate-900">{stats.bestWpm} <span className="text-xs opacity-40">WPM</span></p>
            </div>
          </div>
        </div>

        {/* Empty State Overlay */}
        {isEmpty && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/20 backdrop-blur-[2px]">
            <span className="material-symbols-outlined text-slate-300 text-4xl mb-2">signal_cellular_nodata</span>
            <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No performance data yet</p>
          </div>
        )}

        {/* SVG Chart Visualization */}
        {!isEmpty && (
          <div className="absolute inset-0 z-10 opacity-80 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
              <defs>
                <linearGradient id="neonGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#135bec" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#135bec" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,250 C100,240 200,260 300,180 C400,100 500,220 600,160 C700,100 800,80 900,120 L1000,100 L1000,300 L0,300 Z"
                fill="url(#neonGradient)"
              />
              <path
                className="drop-shadow-[0_0_8px_rgba(19,91,236,0.2)]"
                d="M0,250 C100,240 200,260 300,180 C400,100 500,220 600,160 C700,100 800,80 900,120 L1000,100"
                fill="none"
                stroke="#135bec"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <circle cx="300" cy="180" fill="white" r="6" stroke="#135bec" strokeWidth="3" />
              <circle cx="600" cy="160" fill="white" r="6" stroke="#135bec" strokeWidth="3" />
              <circle cx="900" cy="120" fill="white" r="6" stroke="#135bec" strokeWidth="3" />
            </svg>
          </div>
        )}
      </section>

      {/* Bottom Grid: Timeline + Config + Trophies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 xs:gap-8 md:gap-10">
        {/* Evolution Timeline */}
        <div className="space-y-8 relative pl-4">
          <h3 className="text-2xl font-black tracking-tighter mb-8 text-slate-900">Evolution Timeline</h3>
          <div className="absolute left-6 top-16 bottom-0 w-px bg-slate-200"></div>

          <div className="space-y-6">
            {isEmpty ? (
              <div className="relative pl-12 py-10 text-slate-400 font-bold italic">
                No activity recorded...
              </div>
            ) : (
              stats.history.slice(-4).reverse().map((item) => (
                <div key={item.id} className="relative pl-12">
                  <div className={`absolute left-1 top-4 w-4 h-4 rounded-full border-4 border-white z-10 ${item.type === 'Tournament' ? 'bg-primary' : 'bg-header-brown'}`}></div>
                  <div className={`bg-cream-light/50 border border-slate-200 p-6 rounded-3xl flex items-center justify-between hover:scale-[1.01] transition-transform shadow-inner group ${item.type === 'Tournament' ? 'ring-2 ring-primary/20' : ''}`}>
                    <div className="flex flex-col gap-1">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${item.type === 'Tournament' ? 'text-primary' : 'opacity-40 text-slate-900'}`}>
                        {item.date} • {item.type}
                      </p>
                      <h4 className="font-black text-lg text-slate-900">
                        {item.type === 'Tournament' ? 'Tournament Sprint' : `${item.type} Session`}
                      </h4>
                    </div>
                    <div className="flex items-center gap-8">
                      <p className="font-black text-xl text-slate-900">{item.wpm} <span className="text-[10px] opacity-40">WPM</span></p>
                      <span className={`px-4 py-1.5 ${item.label === 'PB REACHED' ? (item.type === 'Tournament' ? 'bg-primary text-white' : 'bg-cyan-400 text-black') : 'bg-slate-200 text-black'} text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Config and Trophies */}
        <div className="flex flex-col gap-4 xs:gap-6">


          {/* Trophy Shelf */}
          <div className="flex-1 bg-cream-light/50 border border-slate-200 p-4 sm:p-8 rounded-[40px] flex flex-col justify-between shadow-inner">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-6 text-center text-slate-900">Trophy Shelf</h3>
              <div className="grid grid-cols-2 gap-x-3 gap-y-16">
                <div className={`flex flex-col items-center group ${stats.bestWpm < 40 ? 'opacity-20 grayscale' : ''}`}>
                  <div className={`w-16 h-20 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform ${stats.bestWpm >= 40 ? 'bg-primary' : 'bg-white/40 border-2 border-dashed border-black/20'}`} style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                    <span className="material-symbols-outlined text-white text-3xl">offline_bolt</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Velocity Rank</h4>
                    <p className="text-lg font-black text-slate-900 uppercase">Supersonic</p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 group ${stats.accuracy < 95 ? 'opacity-20 grayscale' : ''}`}>
                  <div className={`w-16 h-20 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform ${stats.accuracy >= 95 ? 'bg-slate-900' : 'bg-white/40 border-2 border-dashed border-black/20'}`} style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                    <span className={`material-symbols-outlined text-2xl ${stats.accuracy >= 95 ? 'text-white' : 'text-black'}`}>{stats.accuracy >= 95 ? 'verified' : 'lock'}</span>
                  </div>
                  <div className="text-left">
                    <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40">Precision Master</h4>
                    <p className="text-lg font-black text-slate-900 uppercase">Flawless</p>
                  </div>
                </div>
                <div className={`flex flex-col items-center group ${stats.tournamentBest < 40 ? 'opacity-20 grayscale' : ''}`}>
                  <div className={`w-16 h-20 flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform ${stats.tournamentBest >= 40 ? 'bg-primary' : 'bg-white/40 border-2 border-dashed border-black/20'}`} style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                    <span className={`material-symbols-outlined text-2xl ${stats.tournamentBest >= 40 ? 'military_tech' : 'lock'}`}>{stats.tournamentBest >= 40 ? 'military_tech' : 'lock'}</span>
                  </div>
                  <p className="text-[8px] font-black mt-2 uppercase tracking-tighter text-slate-900">Tournament (40+)</p>
                </div>
                <div className="flex flex-col items-center group opacity-20 grayscale">
                  <div className="w-16 h-20 bg-white/40 flex items-center justify-center border-2 border-dashed border-black/20" style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}>
                    <span className="material-symbols-outlined text-black text-2xl">workspace_premium</span>
                  </div>
                  <p className="text-[8px] font-black mt-2 uppercase tracking-tighter text-slate-900">Master</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="w-full mt-6 py-3 bg-primary text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-primary/90 transition-all active:scale-95 shadow-lg"
            >
              View Gallery
            </button>
          </div>
        </div>
      </div>

      {/* 5x5 Gallery Popup */}
      {isGalleryOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-cream-light border border-slate-200 w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-8 sm:p-10 border-bottom border-slate-200 flex justify-between items-center bg-white/50">
              <div>
                <h2 className="text-3xl font-black tracking-tighter text-slate-900">Achievement Gallery</h2>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Showcase of your Tamil typing milestones</p>
              </div>
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-slate-600">close</span>
              </button>
            </div>

            {/* 5x5 Grid */}
            <div className="p-8 sm:p-10 max-h-[70vh] overflow-y-auto no-scrollbar">
              <div className="grid grid-cols-5 gap-4 lg:gap-6">
                {Array.from({ length: 25 }).map((_, i) => {
                  const isUnlocked = i < 2; // Mocking first 2 as unlocked for demo
                  return (
                    <div key={i} className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group relative ${isUnlocked ? 'bg-white shadow-xl scale-100' : 'bg-slate-100 opacity-30 grayscale'}`}>
                      {/* Hexagon Shape */}
                      <div
                        className={`w-12 h-16 sm:w-16 sm:h-20 flex items-center justify-center transition-transform group-hover:-translate-y-1 ${isUnlocked ? 'bg-primary' : 'bg-slate-300'}`}
                        style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
                      >
                        <span className="material-symbols-outlined text-white text-xl sm:text-2xl">
                          {isUnlocked ? (i === 0 ? 'offline_bolt' : 'verified') : 'lock'}
                        </span>
                      </div>
                      <div className="mt-3 text-center">
                        <p className="text-[7px] font-black uppercase tracking-tighter opacity-40">Badge {i + 1}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Text */}
            <div className="p-6 bg-slate-50 text-center border-t border-slate-200">
              <p className="text-[10px] font-bold opacity-30 italic">Complete more tests and tournaments to unlock the full collection.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
