import React, { useState, useEffect } from 'react';
import { saveResult, submitTournamentResult, getActiveTournament } from '@/src/services/api';
import Header from './components/Header';
import Marquee from './components/Marquee';
import Hero from './components/Hero';
import PracticeArea from './components/PracticeArea';
import TestArea from './components/TestArea';
import TestSelection from './components/TestSelection';
import TournamentLive from './components/TournamentLive';
import TournamentResult from './components/TournamentResult';
import KeyboardLayout from './components/KeyboardLayout';
import Keyboard from './components/Keyboard';
import About from './components/About';
import Ezhuthidu from './components/Ezhuthidu';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import TournamentArena from './components/TournamentArena';
import Footer from './components/Footer';
import RulesModal from './components/RulesModal';
import NotificationPanel from './components/NotificationPanel';
import LoginRequiredModal from './components/LoginRequiredModal';
import AdminApp from './AdminApp';
import { SettingsProvider, useSettings, updatePageTitle } from './src/context/SettingsContext';
import { useNotifications } from './hooks/useNotifications';
import Maintenance from './components/Maintenance';
import SideAds from './components/SideAds';

const VIEW_TO_PATH: Record<string, string> = {
  'Home': '/',
  'Practice': '/practice',
  'Test': '/test',
  'TournamentArena': '/tournament',
  'TournamentLive': '/tournament/live',
  'TournamentResult': '/tournament/result',
  'Dashboard': '/dashboard',
  'Login': '/login',
  'Signup': '/signup',
  'Ezhuthidu': '/ezhuthidu',
  'About': '/about',
  'Keyboard Layout': '/keyboard-layout',
  'Games': '/games',
  'Admin': '/admin/',
};

// Sections that require login
const restrictedViews = ['TournamentArena', 'TournamentLive', 'Dashboard'];

const PATH_TO_VIEW: Record<string, string> = Object.entries(VIEW_TO_PATH).reduce((acc, [view, path]) => {
  acc[path] = view;
  return acc;
}, {} as Record<string, string>);

export interface UserStats {
  displayName: string;
  bestWpm: number;
  avgWpm: number;
  accuracy: number;
  streak: number;
  level: number;
  tournamentBest: number;
  dob?: string;
  history: Array<{
    id: string;
    date: string;
    type: string;
    wpm: number;
    label: string;
  }>;
}

export interface AppSettings {
  keyboardSound: boolean;
  handGuidance: boolean;
  duration: string;
}

export interface TournamentScore {
  wpm: number;
  accuracy: number;
  errors: number;
  totalChars: number;
  correctChars: number;
  wrongChars: number;
  timeTaken: string;
  submissionType: 'Manual' | 'Auto';
  timestamp: string;
}

const STORAGE_KEY_STATS = 'ezhuthidu_user_stats';
const STORAGE_KEY_SETTINGS = 'ezhuthidu_settings';

const AppInner: React.FC = () => {
  const [currentView, setCurrentView] = useState('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isTournamentActive, setIsTournamentActive] = useState(false);
  const [lastTournamentScore, setLastTournamentScore] = useState<TournamentScore | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [testConfig, setTestConfig] = useState<{ duration: number, module: string } | null>(null);
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);

  const [appUiSettings, setAppUiSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
    return saved ? JSON.parse(saved) : {
      keyboardSound: true,
      handGuidance: true,
      duration: '1m'
    };
  });

  const [userStats, setUserStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STATS);
    return saved ? JSON.parse(saved) : {
      displayName: '',
      bestWpm: 0,
      avgWpm: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
      tournamentBest: 0,
      dob: undefined,
      history: []
    };
  });

  // Notifications
  const [lastNotificationReadAt, setLastNotificationReadAt] = useState<string | undefined>(undefined);
  const { unreadCount, markAsRead, refresh: refreshNotifications } = useNotifications(isLoggedIn, lastNotificationReadAt);

  const handleMarkNotificationsAsRead = async () => {
    const newReadTime = await markAsRead();
    if (newReadTime) {
      setLastNotificationReadAt(newReadTime);
    }
    refreshNotifications();
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(appUiSettings));
    document.documentElement.classList.remove('dark');
  }, [appUiSettings]);

  const { settings: globalSettings, loading: settingsLoading } = useSettings();

  // Dynamic Page Titles for SEO
  useEffect(() => {
    if (globalSettings) {
      const siteName = globalSettings.siteName || 'Ezhuthidu';
      if (currentView === 'Home') {
        document.title = globalSettings.seo?.metaTitle || siteName;
      } else {
        updatePageTitle(currentView, siteName);
      }
    }
  }, [currentView, globalSettings]);

  // Reset scroll when test starts (transition from selection to live)
  useEffect(() => {
    if (testConfig) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [testConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(userStats));
  }, [userStats]);

  // Check if accessing admin panel
  if (currentView === 'Admin' && !window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.add(e.key.toLowerCase());
        return next;
      });
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys(prev => {
        const next = new Set(prev);
        next.delete(e.key.toLowerCase());
        return next;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Clear legacy localStorage data
    if (localStorage.getItem('ezhuthidu_signed_up_user')) {
      localStorage.removeItem('ezhuthidu_signed_up_user');
      console.log('Legacy local storage user data cleared.');
    }
  }, []);
  useEffect(() => {
    // Fetch active tournament ID
    getActiveTournament()
      .then(t => setActiveTournamentId(t._id))
      .catch(err => console.error("No active tournament found", err));
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const view = PATH_TO_VIEW[path] || 'Home';
      setCurrentView(view);

      // Handle tournament active state on back/forward
      if (view === 'TournamentLive' || view === 'TournamentArena' || view === 'TournamentResult') {
        setIsTournamentActive(true);
      } else {
        setIsTournamentActive(false);
      }

      // Enforce authentication for restricted views
      if (!isLoggedIn && restrictedViews.includes(view)) {
        setCurrentView('Home');
        setPendingView(view);
        setIsLoginRequiredModalOpen(true);
        // Correct the URL to home
        window.history.replaceState({ view: 'Home' }, '', '/');
      } else {
        setCurrentView(view);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    let initialView = PATH_TO_VIEW[path] || 'Home';

    // Auto-login if token exists
    const token = localStorage.getItem('token');

    // Enforce authentication for restricted views on initial load
    // If there is a token, we defer the decision until restoreSession completes
    if (!token && restrictedViews.includes(initialView)) {
      initialView = 'Home';
      setPendingView(PATH_TO_VIEW[path]);
      setIsLoginRequiredModalOpen(true);
      window.history.replaceState({ view: 'Home' }, '', '/');
    }

    if (initialView !== currentView) {
      setCurrentView(initialView);
    }
    if (token) {
      const restoreSession = async () => {
        try {
          const { getProfile, getUserHistory } = await import('@/src/services/api');
          const profile = await getProfile(token);
          const historyData = await getUserHistory(token);

          setIsLoggedIn(true);
          const restoredStats = calculateStats(historyData, profile.name || 'User');
          restoredStats.dob = profile.dob;
          setUserStats(restoredStats);

          if (profile.lastNotificationReadAt) {
            setLastNotificationReadAt(profile.lastNotificationReadAt);
          }
        } catch (err) {
          console.error("Failed to restore session", err);
          localStorage.removeItem('token'); // Clear invalid token
          setIsLoggedIn(false);
        }
      };
      restoreSession();
    }
  }, []);

  const [practiceInitialMode, setPracticeInitialMode] = useState<'free' | 'lesson' | 'custom' | undefined>(undefined);

  const handleNavigate = (view: string, mode?: string) => {

    if (!isLoggedIn && restrictedViews.includes(view)) {
      setPendingView(view);
      setIsLoginRequiredModalOpen(true);
      return;
    }

    if (isLoggedIn && userStats.dob && restrictedViews.includes(view)) {
      const birthDate = new Date(userStats.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 16) {
        alert("You must be at least 16 years old to participate in tournaments.");
        setCurrentView('Dashboard');
        return;
      }
    }

    if (view === 'Logout') {
      setIsLoggedIn(false);
      localStorage.removeItem('token'); // Clear token
      setUserStats(prev => ({
        ...prev,
        displayName: '',
        bestWpm: 0,
        avgWpm: 0,
        accuracy: 0,
        streak: 0,
        level: 1,
        tournamentBest: 0,
        dob: undefined,
        history: []
      }));
      setCurrentView('Home');
      setIsTournamentActive(false);
    } else if (view === 'TournamentStart' || view === 'TournamentLive') {
      setIsTournamentActive(true);
      setCurrentView('TournamentLive');
      // Sync with History API
      const path = '/tournament/live';
      if (window.location.pathname !== path) {
        window.history.pushState({ view: 'TournamentLive' }, '', path);
      }
    } else {
      if (view !== 'TournamentLive' && view !== 'TournamentArena' && view !== 'TournamentResult') {
        setIsTournamentActive(false);
      }
      if (view === 'Test') {
        setTestConfig(null);
      }

      if (view === 'Practice' && mode) {
        setPracticeInitialMode(mode as any);
      } else if (view === 'Practice') {
        setPracticeInitialMode(undefined);
      } else {
        // Clear custom practice storage when navigating away from Practice page
        sessionStorage.removeItem('ezhuthidu_custom_target');
        sessionStorage.removeItem('ezhuthidu_custom_setup');
        sessionStorage.removeItem('ezhuthidu_custom_duration');
      }

      setCurrentView(view);

      // Sync with History API
      const path = VIEW_TO_PATH[view] || '/';
      if (window.location.pathname !== path) {
        window.history.pushState({ view }, '', path);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const calculateStats = (history: any[], displayName: string) => {
    if (!history || history.length === 0) {
      return {
        displayName,
        bestWpm: 0,
        avgWpm: 0,
        accuracy: 0,
        streak: 0,
        level: 1,
        tournamentBest: 0,
        dob: undefined,
        history: []
      };
    }

    const totalWpm = history.reduce((acc, curr) => acc + (curr.wpm || 0), 0);
    const avgWpm = Math.round(totalWpm / history.length);
    const bestWpm = Math.max(...history.map(h => h.wpm || 0));

    // Specifically calculate Tournament Best
    const tournamentResults = history.filter(h => h.type === 'Tournament');
    const tournamentBest = tournamentResults.length > 0
      ? Math.max(...tournamentResults.map(h => h.wpm || 0))
      : 0;

    // Average accuracy
    const avgAccuracy = Math.round(history.reduce((acc, curr) => acc + (curr.accuracy || 0), 0) / history.length);

    // Streak calculation (Consecutive Days)
    const dates = history.map(h => {
      const d = new Date(h.createdAt || h.timestamp || Date.now());
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    });
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b - a);

    let streak = 0;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterday = today - 86400000;

    if (uniqueDates.length > 0) {
      let current = uniqueDates[0];
      if (current === today || current === yesterday) {
        streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          if (uniqueDates[i] === current - 86400000) {
            streak++;
            current = uniqueDates[i];
          } else {
            break;
          }
        }
      }
    }

    // Level calculation: based on skill (Best WPM)
    const level = Math.floor(bestWpm / 10) + 1;

    return {
      displayName,
      bestWpm,
      avgWpm,
      accuracy: Math.min(100, Math.max(0, avgAccuracy)),
      streak,
      level,
      tournamentBest,
      history: history.slice(0, 20).map(item => ({
        id: item._id || item.id,
        date: new Date(item.createdAt || item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: item.type || 'Test',
        wpm: item.wpm,
        label: item.wpm >= bestWpm ? 'PB REACHED' : 'COMPLETED'
      })),
      dob: history.length > 0 ? history[0].user?.dob : undefined // Note: historical data might need mapping
    };
  };

  const handleLogin = async (user: { name: string, token?: string, lastNotificationReadAt?: string, dob?: string }) => {
    if (user.lastNotificationReadAt) {
      setLastNotificationReadAt(user.lastNotificationReadAt);
    }
    setIsLoggedIn(true);
    let token = user.token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      token = localStorage.getItem('token') || undefined;
    }

    // Default stats
    let newStats: UserStats = {
      displayName: user.name || 'User',
      bestWpm: 0,
      avgWpm: 0,
      accuracy: 0,
      streak: 0,
      level: 1,
      tournamentBest: 0,
      dob: user.dob,
      history: []
    };

    if (token) {
      try {
        const { getUserHistory } = await import('@/src/services/api');
        const historyData = await getUserHistory(token!);
        const { dob } = await import('@/src/services/api').then(m => m.getProfile(token!));
        newStats = calculateStats(historyData, user.name || 'User');
        newStats.dob = dob;
      } catch (err) {
        console.error("Failed to load user history", err);
      }
    }

    setUserStats(newStats);

    if (pendingView) {
      setCurrentView(pendingView);
      setPendingView(null);
    } else {
      setCurrentView('Dashboard');
    }
  };

  const recordSession = async (wpm: number, accuracy: number, type: string, extra?: Partial<TournamentScore>) => {
    const isTournament = isTournamentActive || type === 'Tournament';
    const finalType = isTournament ? 'Tournament' : type;
    const token = localStorage.getItem('token');

    // Optimistically update local state for immediate feedback
    setUserStats(prev => {
      const newHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: finalType,
        wpm,
        label: wpm >= (isTournament ? prev.tournamentBest : prev.bestWpm) ? 'PB REACHED' : 'COMPLETED'
      };

      const newHistory = [newHistoryItem, ...prev.history].slice(0, 20);
      const totalWpm = newHistory.reduce((acc, curr) => acc + (curr.wpm || 0), 0);
      const avgWpm = Math.round(totalWpm / newHistory.length);
      const bestWpm = Math.max(prev.bestWpm, wpm);

      return {
        ...prev,
        bestWpm,
        tournamentBest: isTournament ? Math.max(prev.tournamentBest, wpm) : prev.tournamentBest,
        avgWpm,
        level: Math.floor(bestWpm / 10) + 1,
        history: newHistory
      };
    });

    try {
      if (token) {
        if (isTournament && activeTournamentId) {
          await submitTournamentResult(activeTournamentId, {
            wpm,
            accuracy,
            score: wpm
          }, token);
        } else if (type === 'Test' || type === 'Practice') {
          await saveResult({
            wpm,
            accuracy,
            mistakes: extra?.errors || 0,
            duration: 60
          }, token);
        }

        // Fetch official updated stats from backend for accuracy
        const { getUserHistory } = await import('@/src/services/api');
        const historyData = await getUserHistory(token);
        const updatedStats = calculateStats(historyData, userStats.displayName);
        setUserStats(updatedStats);
      }
    } catch (err) {
      console.error("Failed to save result or update stats", err);
    }

    if (isTournament && extra) {
      setLastTournamentScore({
        wpm,
        accuracy,
        errors: extra.errors || 0,
        totalChars: extra.totalChars || 0,
        correctChars: extra.correctChars || 0,
        wrongChars: extra.wrongChars || 0,
        timeTaken: extra.timeTaken || '01:00',
        submissionType: extra.submissionType || 'Manual',
        timestamp: new Date().toLocaleString(),
      });
      setCurrentView('TournamentResult');
    } else if (isTournamentActive) {
      setTimeout(() => {
        handleNavigate('TournamentArena');
      }, 5000);
    }
  };

  const isTournamentLive = currentView === 'TournamentLive';
  const isTournamentResult = currentView === 'TournamentResult';

  if (!settingsLoading && globalSettings?.maintenanceMode && currentView !== 'Admin') {
    return <Maintenance contactEmail={globalSettings.contactEmail} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-warm-bg">
      {!isTournamentLive && !isTournamentResult && (
        <Header
          activeTab={currentView}
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          displayName={userStats.displayName}
          onOpenNotifications={() => setIsNotificationPanelOpen(true)}
          unreadCount={unreadCount ?? 0}
        />
      )}

      <main className={`
        ${(isTournamentLive || isTournamentResult) ? 'pt-0' : 'pt-16 xs:pt-20'} 
        ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-screen overflow-hidden pb-0' : 'pb-8 xs:pb-12 flex-grow overflow-x-hidden'}
      `}>
        <div className={`flex flex-row w-full ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-full justify-center' : 'min-h-full justify-center'} max-w-screen-4xl mx-auto`}>
          <SideAds position="left" />

          <div className={`
            ${isTournamentResult ? 'w-full' : 'w-full xl:w-[70%] px-2 xs:px-4 md:px-6 lg:px-10'}
            ${(currentView === 'Practice') ? 'flex flex-col' : ''}
            ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-full flex flex-col !px-0 !max-w-none' : `flex flex-col ${currentView === 'Ezhuthidu' ? 'gap-1' : 'gap-4 xs:gap-6'} shrink-0`}
          `}>
            {!isTournamentLive && !isTournamentResult && (
              <div className="w-full mx-auto px-4 xs:px-6 lg:px-10">
                <Marquee onClick={() => handleNavigate('TournamentArena')} />
              </div>
            )}

            {currentView === 'Home' ? (
              <>
                <Hero onNavigate={handleNavigate} onOpenRules={() => setIsRulesModalOpen(true)} />
                <section className="bg-cream-light/50 border border-slate-200 rounded-3xl p-3 md:p-8 shadow-inner">
                  <div className="flex flex-col items-center gap-6">
                    <div className="text-center">
                      <h2 className="text-[#0d141b] text-2xl font-bold mb-1">Keyboard Preview</h2>
                    </div>
                    <div className="w-full bg-slate-900/5 rounded-2xl p-4 flex items-center justify-center">
                      <div className="w-full flex justify-center py-4">
                        <Keyboard activeKeys={activeKeys} settings={appUiSettings} />
                      </div>
                    </div>
                    <button
                      onClick={() => handleNavigate('Practice')}
                      className="px-8 py-2.5 rounded-xl border-2 border-primary text-primary text-sm font-bold hover:bg-primary hover:text-white transition-all bg-white/20"
                    >
                      Start Practice Now
                    </button>
                  </div>
                </section>
              </>
            ) : currentView === 'Dashboard' ? (
              <Dashboard
                onNavigate={handleNavigate}
                stats={userStats}
                settings={appUiSettings}
                setSettings={setAppUiSettings}
              />
            ) : currentView === 'TournamentArena' ? (
              <TournamentArena onNavigate={handleNavigate} stats={userStats} />
            ) : currentView === 'TournamentLive' ? (
              <TournamentLive
                onComplete={(wpm, acc, extra) => recordSession(wpm, acc, 'Tournament', extra)}
                displayName={userStats.displayName}
                activeKeys={activeKeys}
                settings={appUiSettings}
              />
            ) : currentView === 'TournamentResult' ? (
              <TournamentResult
                score={lastTournamentScore}
                displayName={userStats.displayName}
                onNavigate={handleNavigate}
              />
            ) : currentView === 'Login' ? (
              <Login onNavigate={(name) => handleLogin(name)} onSignupNavigate={() => handleNavigate('Signup')} />
            ) : currentView === 'Signup' ? (
              <Signup onNavigate={(name) => handleLogin(name)} onLoginNavigate={() => handleNavigate('Login')} />
            ) : currentView === 'Ezhuthidu' ? (
              <Ezhuthidu settings={appUiSettings} activeKeys={activeKeys} />
            ) : currentView === 'Practice' ? (
              <PracticeArea onComplete={(wpm, acc) => recordSession(wpm, acc, 'Practice')} settings={appUiSettings} activeKeys={activeKeys} initialMode={practiceInitialMode} />
            ) : currentView === 'Test' ? (
              testConfig ? (
                <TestArea
                  onComplete={(wpm, acc, stats) => recordSession(wpm, acc, 'Test', stats)}
                  onReturn={() => setTestConfig(null)}
                  config={testConfig}
                  settings={appUiSettings}
                  activeKeys={activeKeys}
                />
              ) : (
                <TestSelection
                  onStart={setTestConfig}
                  defaultDuration={appUiSettings.duration}
                  isLoggedIn={isLoggedIn}
                  onOpenLoginRequired={() => setIsLoginRequiredModalOpen(true)}
                />
              )
            ) : currentView === 'Keyboard Layout' ? (
              <KeyboardLayout />
            ) : currentView === 'About' ? (
              <About onNavigate={handleNavigate} />
            ) : currentView === 'Games' ? (
              <div className="bg-cream-light/50 border border-slate-200 rounded-3xl p-8 sm:p-12 md:p-20 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-header-brown/5 rounded-bl-full pointer-events-none"></div>
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary">sports_esports</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0d141b]">Tamil Typing Games</h2>
                <p className="mt-2 text-slate-600 font-bold uppercase tracking-widest text-[10px] sm:text-xs">Coming Soon to Ezhuthidu</p>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-slate-800 font-medium max-w-md mx-auto">We are building interactive games to help you master Tamil typing through fun and engagement. Stay tuned!</p>
                <button onClick={() => handleNavigate('Home')} className="mt-6 sm:mt-8 px-6 sm:px-8 py-2 sm:py-3 bg-black text-white rounded-xl font-bold hover:bg-neutral-800 transition-all shadow-lg">Return to Home</button>
              </div>
            ) : (
              <div className="bg-cream-light/50 border border-slate-200 rounded-3xl p-20 text-center shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-header-brown/5 rounded-bl-full pointer-events-none"></div>
                <h2 className="text-3xl font-black text-[#0d141b]">The {currentView} section is coming soon!</h2>
                <button onClick={() => handleNavigate('Home')} className="mt-6 text-primary font-bold hover:underline">Return to Home</button>
              </div>
            )}
          </div>

          <SideAds position="right" />
        </div>
      </main>
      {!isTournamentLive && !isTournamentResult && (
        <Footer
          onNavigate={handleNavigate}
          isLoggedIn={isLoggedIn}
          onOpenRules={() => setIsRulesModalOpen(true)}
          onOpenLoginRequired={() => setIsLoginRequiredModalOpen(true)}
        />
      )}
      <RulesModal isOpen={isRulesModalOpen} onClose={() => setIsRulesModalOpen(false)} onNavigate={handleNavigate} />
      <NotificationPanel
        isOpen={isNotificationPanelOpen}
        onClose={() => setIsNotificationPanelOpen(false)}
        onMarkAsRead={handleMarkNotificationsAsRead}
        onNavigate={handleNavigate}
      />
      <LoginRequiredModal
        isOpen={isLoginRequiredModalOpen}
        onClose={() => setIsLoginRequiredModalOpen(false)}
        onLogin={() => handleNavigate('Login')}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
};

export default App;
