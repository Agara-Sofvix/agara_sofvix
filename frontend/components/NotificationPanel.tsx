
import React, { useEffect, useRef, useState } from 'react';
import { getNotifications } from '../src/services/api';

interface Notification {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  tag?: 'Update' | 'Exam' | 'New' | 'Notice';
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: () => void;
  onNavigate: (view: string, mode?: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, onMarkAsRead, onNavigate }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      // Small delay to allow fade-out/slide-out animation before unmounting
      const timer = setTimeout(() => setShouldRender(false), 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);


  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString();
    } catch (e) {
      return 'Recently';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getTagStyles = (tag?: string) => {
    switch (tag) {
      case 'New': return 'bg-blue-600 text-white shadow-blue-500/30';
      case 'Exam': return 'bg-amber-600 text-white shadow-amber-500/30';
      case 'Update': return 'bg-emerald-600 text-white shadow-emerald-500/30';
      case 'Notice': return 'bg-red-600 text-white shadow-red-500/30';
      default: return 'bg-slate-900 text-white shadow-slate-500/30';
    }
  };

  if (!shouldRender && !isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm sm:max-w-md z-[110] bg-cream-light border-l border-slate-200 shadow-2xl transform transition-transform duration-700 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-header-brown/5 rounded-bl-full pointer-events-none -z-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-tr-full pointer-events-none -z-10"></div>

        {/* Header */}
        <div className="p-8 sm:p-10 bg-white/50 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Announcements</h2>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 text-slate-800">Campus Updates & Notices</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100/50 hover:bg-slate-200/50 transition-all group"
            >
              <span className="material-symbols-outlined text-slate-600 group-hover:rotate-90 transition-transform">close</span>
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative z-10">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-6"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 opacity-40">
                <span className="material-symbols-outlined text-4xl text-slate-400">notifications_off</span>
              </div>
              <p className="text-sm font-bold text-slate-600 italic opacity-50">No active announcements</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif, i) => (
                <div
                  key={notif._id}
                  onClick={() => {
                    if (notif.tag === 'Exam' || notif.title?.toLowerCase().includes('tournament') || notif.description?.toLowerCase().includes('tournament')) {
                      onNavigate('TournamentArena');
                    } else if (notif.tag === 'New') {
                      onNavigate('Practice');
                    }
                    onClose();
                  }}
                  className="group relative p-6 bg-white border border-slate-200/60 rounded-[28px] hover:bg-white/80 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 animate-in fade-in slide-in-from-right-4 duration-500"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${getTagStyles(notif.tag)}`}>
                      {notif.tag || 'Notice'}
                    </span>
                    <span className="text-[10px] font-black font-mono opacity-30 text-slate-900">{formatTime(notif.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 leading-tight group-hover:text-primary transition-colors">
                    {notif.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-700/80 leading-relaxed">
                    {notif.description}
                  </p>

                  {/* Subtle arrow on hover */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                    <span className="material-symbols-outlined text-primary">arrow_forward_ios</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center pb-12">
            <button
              onClick={() => {
                onMarkAsRead();
                onClose();
              }}
              className="px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="p-6 bg-white/30 backdrop-blur-sm border-t border-slate-200/60 text-center">
          <p className="text-[9px] font-bold opacity-30 italic text-slate-900 tracking-wide">CloudSync Enabled • எழுத்திடு v2.0</p>
        </div>
      </div>
    </>
  );
};

export default NotificationPanel;
