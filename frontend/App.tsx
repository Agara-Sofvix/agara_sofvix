import React, { useState, useEffect } from 'react';
import { saveResult, submitTournamentResult, getActiveTournament } from './src/services/api';
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
import ForgotPassword from './components/ForgotPassword';
import VerifyOTP from './components/VerifyOTP';
import ResetPassword from './components/ResetPassword';
import Dashboard from './components/Dashboard';
import TournamentArena from './components/TournamentArena';
import Footer from './components/Footer';
import RulesModal from './components/RulesModal';
import NotificationPanel from './components/NotificationPanel';
import LoginRequiredModal from './components/LoginRequiredModal';
import AdminApp from './AdminApp';
import { SettingsProvider, useSettings, updatePageTitle, applyPageSeo } from './src/context/SettingsContext';
import { useNotifications } from './hooks/useNotifications';
import Maintenance from './components/Maintenance';
import SideAds from './components/SideAds';
import TrophyEarnedModal from './components/TrophyEarnedModal';

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
  'ForgotPassword': '/forgot-password',
  'VerifyOTP': '/verify-otp',
  'ResetPassword': '/reset-password',
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
  tournamentBest: number;
  dob?: string;
  profilePic?: string;
  trophies: Array<{
    id: string;
    type: 'Test' | 'Tournament' | 'Accuracy';
    tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
    label: string;
    value: number | string;
    icon: string;
  }>;
  history: Array<{
    id: string;
    date: string;
    type: string;
    wpm: number;
    accuracy: number;
    label: string;
    rank?: number;
    tournamentName?: string;
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
  const [currentView, setCurrentView] = useState(() => PATH_TO_VIEW[window.location.pathname] || 'Home');
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [isTournamentActive, setIsTournamentActive] = useState(false);
  const [lastTournamentScore, setLastTournamentScore] = useState<TournamentScore | null>(null);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const handleOpenNotificationPanel = () => {
    setIsNotificationPanelOpen(true);
    handleMarkNotificationsAsRead();
  };
  const [testConfig, setTestConfig] = useState<{ duration: number, module: string } | null>(null);
  const [activeTournament, setActiveTournament] = useState<any | null>(null);
  const [isLoginRequiredModalOpen, setIsLoginRequiredModalOpen] = useState(false);
  const [pendingView, setPendingView] = useState<string | null>(null);
  const [latestEarnedTrophy, setLatestEarnedTrophy] = useState<any | null>(null);
  const [resetEmail, setResetEmail] = useState<string>('');

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
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        trophies: parsed.trophies || []
      };
    }
    return {
      displayName: '',
      bestWpm: 0,
      avgWpm: 0,
      accuracy: 0,
      streak: 0,
      tournamentBest: 0,
      dob: undefined,
      profilePic: undefined,
      trophies: [],
      history: []
    };
  });

  // Notifications
  const [lastNotificationReadAt, setLastNotificationReadAt] = useState<string | undefined>(undefined);
  const { unreadCount, markAsRead, refresh: refreshNotifications } = useNotifications(isLoggedIn);

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

  // Dynamic Per-Page SEO on navigation
  useEffect(() => {
    if (globalSettings) {
      const path = VIEW_TO_PATH[currentView] || '/';
      const pagesSeo = (globalSettings as any).pagesSeo || [];
      applyPageSeo(path, pagesSeo, globalSettings.seo);
    }
  }, [currentView, globalSettings]);

  // Reset scroll when test starts (transition from selection to live)
  useEffect(() => {
    if (testConfig) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [testConfig]);

  useEffect(() => {
    // Only persist if we have a valid logged-in session to avoid overwriting with defaults
    if (isLoggedIn && userStats.displayName) {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(userStats));
    }
  }, [userStats, isLoggedIn]);

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
    // Fetch active tournament
    getActiveTournament()
      .then(t => setActiveTournament(t))
      .catch(err => console.error("No active tournament found", err));
  }, []);

  // Handle URL change without page refresh and Session Restoration
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const state = e.state;
      const path = window.location.pathname;
      const view = state?.view || PATH_TO_VIEW[path] || 'Home';
      setCurrentView(view);

      // Handle tournament active state on back/forward
      if (view === 'TournamentLive' || view === 'TournamentArena' || view === 'TournamentResult') {
        setIsTournamentActive(true);
      } else {
        setIsTournamentActive(false);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial load logic
    const path = window.location.pathname;
    const initialView = PATH_TO_VIEW[path] || 'Home';
    const token = localStorage.getItem('token');

    // Enforce authentication for restricted views on initial load
    if (!token && restrictedViews.includes(initialView)) {
      setCurrentView('Home');
      setPendingView(initialView);
      setIsLoginRequiredModalOpen(true);
      window.history.replaceState({ view: 'Home' }, '', '/');
    }

    if (token) {
      const restoreSession = async () => {
        try {
          const { getProfile, getUserHistory } = await import('./src/services/api');
          const profile = await getProfile(token);
          const historyData = await getUserHistory(token);

          setIsLoggedIn(true);
          const restoredStats = calculateStats(historyData, profile.name || 'User');

          setUserStats(prev => ({
            ...prev,
            ...restoredStats,
            dob: profile.dob,
            profilePic: profile.profilePic
          }));

          if (profile.lastNotificationReadAt) {
            setLastNotificationReadAt(profile.lastNotificationReadAt);
          }

          // If user refreshes while on /login or /signup, redirect them to dashboard
          const authOnlyViews = ['Login', 'Signup'];
          if (authOnlyViews.includes(initialView)) {
            setCurrentView('Dashboard');
            window.history.replaceState({ view: 'Dashboard' }, '', '/dashboard');
          }
        } catch (err: any) {
          console.error("Failed to restore session", err);
          // ONLY logout if it's a definitive auth failure (401 or 403)
          if (err.status === 401 || err.status === 403) {
            console.warn("Invalid session token - logging out");
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            if (restrictedViews.includes(initialView)) {
              setCurrentView('Home');
              window.history.replaceState({ view: 'Home' }, '', '/');
            }
          } else {
            console.warn("Session restore failed due to network/server issue. Retaining session state.");
          }
        }
      };
      restoreSession();
    }

    return () => window.removeEventListener('popstate', handlePopState);
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
      localStorage.removeItem('token');
      localStorage.removeItem(STORAGE_KEY_STATS);
      setUserStats({
        displayName: '',
        bestWpm: 0,
        avgWpm: 0,
        accuracy: 0,
        streak: 0,
        tournamentBest: 0,
        dob: undefined,
        profilePic: undefined,
        trophies: [],
        history: []
      });
      setCurrentView('Home');
      setIsTournamentActive(false);
      window.history.replaceState({ view: 'Home' }, '', '/');
    } else if (view === 'TournamentStart' || view === 'TournamentLive') {
      setIsTournamentActive(true);
      setCurrentView('TournamentLive');
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
        sessionStorage.removeItem('ezhuthidu_custom_target');
        sessionStorage.removeItem('ezhuthidu_custom_setup');
        sessionStorage.removeItem('ezhuthidu_custom_duration');
      }

      setCurrentView(view);
      const path = VIEW_TO_PATH[view] || '/';
      if (window.location.pathname !== path) {
        window.history.pushState({ view }, '', path);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const calculateStats = (history: any[], displayName: string) => {
    const baseStats = {
      displayName,
      bestWpm: 0,
      avgWpm: 0,
      accuracy: 0,
      streak: 0,
      tournamentBest: 0,
      trophies: [] as any[],
      history: [] as any[]
    };

    if (!history || history.length === 0) {
      return baseStats;
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


    // Trophy Calculation
    const trophies = [];

    // Test Milestones
    const testCount = history.filter(h => h.type === 'Test').length;
    if (testCount >= 50) {
      trophies.push({ id: 'test_50', type: 'Test', tier: 'Bronze', label: 'First 50', value: '50 Tests', icon: 'military_tech' });
    }
    if (testCount >= 100) {
      trophies.push({ id: 'test_100', type: 'Test', tier: 'Silver', label: 'Century Club', value: '100 Tests', icon: 'military_tech' });
    }
    if (testCount >= 150) {
      trophies.push({ id: 'test_150', type: 'Test', tier: 'Gold', label: 'Century & Half', value: '150 Tests', icon: 'military_tech' });
    }

    // Tournament Ranks
    const top3Finishes = history.filter(h => h.type === 'Tournament' && h.rank >= 1 && h.rank <= 3);
    const tournamentWins = top3Finishes.filter(h => h.rank === 1).length;
    if (tournamentWins > 0) {
      trophies.push({ id: 'tourney_win', type: 'Tournament', tier: 'Diamond', label: 'Grand Champion', value: `${tournamentWins} Wins`, icon: 'trophy' });
    }
    if (top3Finishes.length > tournamentWins) {
      trophies.push({ id: 'tourney_podium', type: 'Tournament', tier: 'Gold', label: 'Podium Finisher', value: `${top3Finishes.length} Podiums`, icon: 'workspace_premium' });
    }

    // Accuracy Milestones
    const accuracies = history.map(h => h.accuracy || 0);
    const has95 = accuracies.some(a => a >= 95);
    const has98 = accuracies.some(a => a >= 98);
    const has100 = accuracies.some(a => a === 100);

    if (has95) trophies.push({ id: 'acc_95', type: 'Accuracy', tier: 'Silver', label: 'Precise Gamer', value: '95%+ Acc', icon: 'stars' });
    if (has98) trophies.push({ id: 'acc_98', type: 'Accuracy', tier: 'Gold', label: 'Eagle Eye', value: '98%+ Acc', icon: 'stars' });
    if (has100) trophies.push({ id: 'acc_100', type: 'Accuracy', tier: 'Diamond', label: 'Perfectionist', value: '100% Acc', icon: 'stars' });

    return {
      displayName,
      bestWpm,
      avgWpm,
      accuracy: Math.min(100, Math.max(0, avgAccuracy)),
      streak,
      tournamentBest,
      trophies,
      history: history.slice(0, 20).map(item => ({
        id: item._id || item.id,
        date: new Date(item.createdAt || item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: item.type || 'Test',
        wpm: item.wpm,
        accuracy: item.accuracy || 0,
        rank: item.rank,
        tournamentName: item.tournamentName,
        label: item.wpm >= bestWpm ? 'PB REACHED' : 'COMPLETED'
      }))
    };
  };

  const handleLogin = async (user: { name: string, token?: string, lastNotificationReadAt?: string, dob?: string, profilePic?: string }) => {
    // 1. Immediate data persistence
    const token = user.token || localStorage.getItem('token');
    if (user.token) {
      localStorage.setItem('token', user.token);
    }

    // 2. Set authenticated state
    setIsLoggedIn(true);

    if (user.lastNotificationReadAt) {
      setLastNotificationReadAt(user.lastNotificationReadAt);
    }

    // 3. Initialize user stats
    const initialStats: UserStats = {
      displayName: user.name || 'User',
      bestWpm: 0,
      avgWpm: 0,
      accuracy: 0,
      streak: 0,
      tournamentBest: 0,
      dob: user.dob,
      profilePic: user.profilePic,
      trophies: [],
      history: []
    };
    setUserStats(initialStats);

    // 4. FORCED Navigation - Bypass all checks and go to Dashboard (or pending view)
    // We explicitly avoid 'Login' or 'Signup' as target views after login
    let target: string = 'Dashboard';
    if (pendingView && !['Login', 'Signup', 'ForgotPassword'].includes(pendingView)) {
      target = pendingView;
    }

    setPendingView(null);
    setCurrentView(target);

    const targetPath = VIEW_TO_PATH[target] || '/dashboard';
    // Use replaceState to clear the login entry from history if preferred, or pushState for standard nav
    window.history.pushState({ view: target }, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5. Background data fetching
    if (token) {
      try {
        const { getUserHistory } = await import('./src/services/api');
        const historyData = await getUserHistory(token!);
        const updatedStats = calculateStats(historyData, user.name || 'User');

        setUserStats(prev => ({
          ...prev,
          ...updatedStats,
          dob: user.dob || prev.dob,
          profilePic: user.profilePic || prev.profilePic
        }));
      } catch (err) {
        console.error("Failed to load user history in background", err);
      }
    }
  };

  const recordSession = async (
    wpm: number,
    accuracy: number,
    type: string,
    extra?: {
      errors?: number;
      totalChars?: number;
      correctChars?: number;
      wrongChars?: number;
      timeTaken?: string;
      submissionType?: string;
      rawTypedText?: string;
      durationMs?: number;
      testSessionId?: string;
      textId?: string;
    }
  ) => {
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
        accuracy,
        label: wpm >= (isTournament ? prev.tournamentBest : prev.bestWpm) ? 'PB REACHED' : 'COMPLETED'
      };

      const newHistory = [newHistoryItem, ...prev.history].slice(0, 20);
      const updatedStats = calculateStats(newHistory, prev.displayName);

      // Check for newly earned trophies
      const oldTrophyIds = new Set(prev.trophies.map(t => t.id));
      const newTrophiesDetected = updatedStats.trophies.filter(t => !oldTrophyIds.has(t.id));

      if (newTrophiesDetected.length > 0) {
        setLatestEarnedTrophy(newTrophiesDetected[0]);
      }

      return {
        ...prev,
        ...updatedStats,
        dob: prev.dob,
        profilePic: prev.profilePic,
        history: newHistory
      };
    });

    try {
      if (token && extra?.testSessionId && extra?.rawTypedText && extra?.durationMs) {
        if (isTournament) {
          let tId = activeTournament?._id;
          if (!tId) {
            try {
              const t = await getActiveTournament();
              tId = t._id;
              setActiveTournament(t);
            } catch (err) {
              console.error("Could not fetch active tournament even during submission", err);
            }
          }

          if (tId) {
            await submitTournamentResult(tId, {
              typedText: extra.rawTypedText,
              durationMs: extra.durationMs,
              testSessionId: extra.testSessionId
            }, token);
          }
        } else if (type === 'Test' || type === 'Practice') {
          await saveResult({
            typedText: extra.rawTypedText,
            durationMs: extra.durationMs,
            testSessionId: extra.testSessionId,
            textId: extra.textId,
            originalText: type === 'Practice' ? extra.rawTypedText : undefined
          }, token);
        }

        // Fetch official updated stats from backend for accuracy
        const { getUserHistory } = await import('./src/services/api');
        const historyData = await getUserHistory(token);
        const updatedStats = calculateStats(historyData, userStats.displayName);

        setUserStats(prev => ({
          ...prev, // Preserve identity (profilePic, dob, displayName)
          ...updatedStats
        }));
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

  const updateUserStats = (newStats: Partial<UserStats>) => {
    setUserStats(prev => ({ ...prev, ...newStats }));
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
          profilePic={userStats.profilePic}
          onOpenNotifications={handleOpenNotificationPanel}
          unreadCount={unreadCount ?? 0}
        />
      )}

      <main className={`
        ${(isTournamentLive || isTournamentResult) ? 'pt-0' : 'pt-12 xs:pt-14'} 
        ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-screen overflow-hidden pb-0' : 'pb-8 xs:pb-12 flex-grow'}
      `}>
        <div className={`
          grid w-full mx-auto
          ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-full' : 'min-h-full'} 
          max-w-screen-4xl
          grid-cols-1 md:grid-cols-1 lg:grid-cols-1
          ${currentView !== 'TournamentArena' ? 'xl:grid-cols-[15%_70%_15%]' : 'grid-cols-1'}
        `}>
          {currentView !== 'TournamentArena' && (
            <div className="hidden xl:block sticky top-[72px] h-[calc(100vh-72px)] overflow-hidden border-r border-slate-100/50 z-[45]">
              <SideAds position="left" />
            </div>
          )}

          <div className={`
            w-full flex flex-col
            ${isTournamentResult || currentView === 'TournamentArena' ? 'xl:col-span-3' : 'px-2 xs:px-4 md:px-6 lg:px-10'}
            ${(currentView === 'Practice') ? 'flex flex-col' : ''}
            ${(currentView === 'Ezhuthidu' || isTournamentLive) ? 'h-full !px-0 !max-w-none' : `${currentView === 'Ezhuthidu' ? 'gap-1' : 'gap-4 xs:gap-6'} shrink-0 overflow-x-hidden`}
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
                onUpdateStats={updateUserStats}
              />
            ) : currentView === 'TournamentArena' ? (
              <TournamentArena onNavigate={handleNavigate} stats={userStats} activeTournament={activeTournament} />
            ) : currentView === 'TournamentLive' ? (
              <TournamentLive
                onComplete={(wpm, acc, extra) => recordSession(wpm, acc, 'Tournament', extra)}
                displayName={userStats.displayName}
                activeKeys={activeKeys}
                settings={appUiSettings}
                activeTournament={activeTournament}
              />
            ) : currentView === 'TournamentResult' ? (
              <TournamentResult
                score={lastTournamentScore}
                displayName={userStats.displayName}
                onNavigate={handleNavigate}
              />
            ) : currentView === 'Login' ? (
              <Login onNavigate={(user) => handleLogin(user)} onSignupNavigate={() => handleNavigate('Signup')} onForgotPasswordNavigate={() => handleNavigate('ForgotPassword')} />
            ) : currentView === 'Signup' ? (
              <Signup onNavigate={(user) => handleLogin(user)} onLoginNavigate={() => handleNavigate('Login')} />
            ) : currentView === 'ForgotPassword' ? (
              <ForgotPassword onOTPNavigate={(email) => { setResetEmail(email); handleNavigate('VerifyOTP'); }} onLoginNavigate={() => handleNavigate('Login')} />
            ) : currentView === 'VerifyOTP' ? (
              <VerifyOTP email={resetEmail} onResetNavigate={() => handleNavigate('ResetPassword')} onLoginNavigate={() => handleNavigate('Login')} />
            ) : currentView === 'ResetPassword' ? (
              <ResetPassword email={resetEmail} onLoginNavigate={() => handleNavigate('Login')} />
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

          {currentView !== 'TournamentArena' && (
            <div className="hidden xl:block sticky top-[72px] h-[calc(100vh-72px)] overflow-hidden border-l border-slate-100/50 z-[45]">
              <SideAds position="right" />
            </div>
          )}
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
      <TrophyEarnedModal
        trophy={latestEarnedTrophy}
        onClose={() => setLatestEarnedTrophy(null)}
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
