import React from 'react';
import { UserStats, AppSettings } from '../App';
import { updateProfilePic, setAvatar } from '../src/services/api';
import { getUploadBaseUrl } from '../src/config/apiConfig';

interface DashboardProps {
  onNavigate: (view: string) => void;
  stats: UserStats;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onUpdateStats?: (stats: Partial<UserStats>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, stats, settings, setSettings, onUpdateStats }) => {
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const isEmpty = stats.history.length === 0;

  const toggleSetting = (key: keyof AppSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const result = await updateProfilePic(formData, token);
      if (onUpdateStats) {
        onUpdateStats({ profilePic: result.profilePic });
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectAvatar = async (path: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsUploading(true);
      const result = await setAvatar(path, token);
      if (onUpdateStats) {
        onUpdateStats({ profilePic: result.profilePic });
      } else {
        window.location.reload();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update avatar');
    } finally {
      setIsUploading(false);
      setShowAvatarPicker(false);
    }
  };

  const predefinedAvatars = [
    { gender: 'Male', items: ['/avatars/male_1.png', '/avatars/male_2.png', '/avatars/male_3.png'] },
    { gender: 'Female', items: ['/avatars/female_1.png', '/avatars/female_2.png', '/avatars/female_3.png'] },
  ];

  const getFullUrl = (path: string) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const base = getUploadBaseUrl().replace(/\/$/, '');

    // Fallback for old records that missing the /avatars/ or /uploads/ prefix
    let cleanPath = path;
    if (!path.startsWith('/') && !path.includes('/')) {
      // If it's just a filename like male_1.png, it's an avatar
      if (path.includes('male') || path.includes('female')) {
        cleanPath = `/avatars/${path}`;
      } else {
        cleanPath = `/uploads/${path}`;
      }
    } else {
      cleanPath = path.startsWith('/') ? path : `/${path}`;
    }

    return `${base}${cleanPath}`;
  };

  const avatarUrl = stats.profilePic ? getFullUrl(stats.profilePic) : null;

  return (
    <div className="xs:text-xs text-sm sm:text-base flex flex-col gap-16 animate-in fade-in slide-in-from-bottom-4 duration-700 relative pb-10">
      {/* Background Blobs for Organic Feel - Removed background blobs for cleaner look */}

      {/* Profile Section */}
      <section className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
        <div className="relative group/avatar cursor-pointer">
          <div
            className="w-40 h-40 sm:w-56 sm:h-56 md:w-72 lg:w-80 bg-cream-light/50 border border-slate-200 rounded-[30px] sm:rounded-[50px] md:rounded-[60px] p-2 sm:p-4 transition-all duration-700 shadow-inner overflow-visible z-10 relative flex items-center justify-center overflow-hidden"
            onClick={() => setShowAvatarPicker(true)}
          >
            {avatarUrl ? (
              <img
                alt="User Avatar"
                className="w-full h-full object-cover rounded-[24px] sm:rounded-[48px]"
                src={avatarUrl}
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                <span className="material-symbols-outlined text-5xl sm:text-7xl">person</span>
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">No Avatar</span>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-black/40 rounded-[24px] sm:rounded-[48px] flex items-center justify-center z-20">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="absolute inset-2 sm:inset-4 bg-black/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity rounded-[24px] sm:rounded-[48px] flex flex-col items-center justify-center z-20 gap-2">
              <span className="material-symbols-outlined text-white text-3xl sm:text-5xl">edit</span>
              <span className="text-white text-[10px] font-black uppercase tracking-tighter">Change Avatar</span>
            </div>
          </div>

          {/* Avatar Picker Modal */}
          {showAvatarPicker && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div
                className="bg-white rounded-[2.5rem] p-6 xs:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 leading-tight">CHOOSE AVATAR</h2>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Select from predefined or upload custom</p>
                  </div>
                  <button
                    onClick={() => setShowAvatarPicker(false)}
                    className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                  >
                    <span className="material-symbols-outlined text-slate-900">close</span>
                  </button>
                </div>

                <div className="space-y-8">
                  {predefinedAvatars.map((group) => (
                    <div key={group.gender}>
                      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                        {group.gender} MODELS
                        <div className="h-px flex-1 bg-slate-100"></div>
                      </h3>
                      <div className="grid grid-cols-3 gap-4 sm:gap-6">
                        {group.items.map((img) => (
                          <button
                            key={img}
                            onClick={() => handleSelectAvatar(`/avatars/${img}`)}
                            className="aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-header-brown transition-all hover:scale-105 active:scale-95 group/item relative"
                          >
                            <img
                              src={getFullUrl(`/avatars/${img}`) || ''}
                              alt={img}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-header-brown/0 group-hover/item:bg-header-brown/10 transition-colors"></div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="pt-6 border-t border-slate-100">
                    <button
                      onClick={handleAvatarClick}
                      className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors group/btn"
                    >
                      <span className="material-symbols-outlined text-slate-400 group-hover/btn:text-header-brown">upload</span>
                      <span className="text-sm font-black text-slate-600 group-hover/btn:text-slate-900 uppercase tracking-widest">Upload Custom Photo</span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 -z-10" onClick={() => setShowAvatarPicker(false)}></div>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />

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

      {/* Bottom Grid: Timeline Left + Trophy Shelf Right */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 xs:gap-8 md:gap-10 items-start">

        {/* Evolution Timeline */}
        <div className="space-y-8 relative pl-4">
          <div className="flex justify-between items-center mb-8 pr-4 sm:pr-8">
            <h3 className="text-2xl font-black tracking-tighter text-slate-900">Evolution Timeline</h3>
          </div>
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

        {/* Trophy Shelf Card */}
        <div className="bg-cream-light border border-slate-200/80 rounded-[28px] shadow-inner overflow-hidden flex flex-col">
          {/* Header */}
          <div className="pt-6 pb-4 px-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Trophy Shelf</p>
          </div>

          {/* 2x2 Trophy Grid */}
          <div className="px-4 pb-2 grid grid-cols-2 gap-3 flex-1">
            {(() => {
              const allTrophySlots = [
                { category: 'TROPHY RACE', locked: false },
                { category: 'PRECISION MASTER', locked: false },
                { category: 'TOURNAMENT GAME', locked: true },
                { category: 'MASTER', locked: true },
              ];

              const earnedTrophies = stats.trophies || [];

              return allTrophySlots.map((slot, i) => {
                const trophy = earnedTrophies[i];

                if (trophy) {
                  // Earned trophy
                  const iconBg =
                    trophy.tier === 'Diamond' ? 'bg-cyan-400' :
                      trophy.tier === 'Gold' ? 'bg-amber-400' :
                        trophy.tier === 'Silver' ? 'bg-slate-300' :
                          'bg-orange-400';

                  return (
                    <div key={trophy.id} className="bg-white/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2 hover:bg-white/90 transition-colors">
                      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shadow-sm`}>
                        <span className="material-symbols-outlined text-white text-2xl">{trophy.icon}</span>
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight">{trophy.type} Race</p>
                      <p className="text-xs font-black uppercase tracking-wider text-slate-800 leading-tight">{trophy.label}</p>
                    </div>
                  );
                } else {
                  // Locked slot
                  return (
                    <div key={`locked-${i}`} className="bg-white/30 rounded-2xl p-4 flex flex-col items-center text-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-slate-200/60 flex items-center justify-center">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">lock</span>
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-tight mt-1">{slot.category}</p>
                    </div>
                  );
                }
              });
            })()}
          </div>

          {/* VIEW GALLERY Button */}
          <div className="p-4 pt-3">
            <button
              onClick={() => setIsGalleryOpen(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-md"
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
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
                {(() => {
                  const earnedTrophies = stats.trophies || [];
                  const totalSlots = 25;
                  const slots = [];

                  // Render earned trophies
                  earnedTrophies.forEach((trophy) => {
                    slots.push(
                      <div key={trophy.id} className="bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col items-center text-center group hover:shadow-xl transition-all hover:-translate-y-1">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${trophy.tier === 'Diamond' ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)]' :
                          trophy.tier === 'Gold' ? 'bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]' :
                            trophy.tier === 'Silver' ? 'bg-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.4)]' :
                              'bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.4)]'
                          }`}>
                          <span className="material-symbols-outlined text-white text-3xl">{trophy.icon}</span>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{trophy.label}</h4>
                        <p className="text-sm font-black text-slate-900">{trophy.value}</p>
                        <div className={`mt-3 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${trophy.tier === 'Diamond' ? 'bg-cyan-100 text-cyan-600' :
                          trophy.tier === 'Gold' ? 'bg-amber-100 text-amber-600' :
                            trophy.tier === 'Silver' ? 'bg-slate-100 text-slate-600' :
                              'bg-orange-100 text-orange-600'
                          }`}>
                          {trophy.tier} Tier
                        </div>
                      </div>
                    );
                  });

                  // Render locked placeholders
                  for (let i = slots.length; i < totalSlots; i++) {
                    slots.push(
                      <div key={`locked-${i}`} className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-6 flex flex-col items-center justify-center text-center opacity-40 group hover:opacity-60 transition-opacity">
                        <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-slate-400 text-3xl">lock</span>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Locked</h4>
                        <p className="text-[10px] font-bold text-slate-300">Milestone Pending</p>
                      </div>
                    );
                  }

                  return slots;
                })()}
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
