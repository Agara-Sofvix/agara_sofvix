import React, { useState, useRef, useEffect } from 'react';
import { useSettings } from '../src/context/SettingsContext';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  isLoggedIn: boolean;
  displayName: string;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onNavigate, isLoggedIn, displayName, onOpenNotifications, unreadCount = 0 }) => {
  const { settings } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    'Home', 'Ezhuthidu', 'Practice', 'Test', 'Games', 'Keyboard Layout', 'About'
  ];

  /** Resolve logo URL (relative so dev proxy and same-origin prod both work). */
  const slashToUrl = (url?: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };

  const isAuthPage = activeTab === 'Login' || activeTab === 'Signup';

  const handleNavClick = (e: React.MouseEvent, item: string) => {
    e.preventDefault();
    onNavigate(item);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-header-brown px-2 xs:px-4 md:px-6 lg:px-10 py-4 xs:py-6 shadow-lg transition-colors duration-200">
      <div className="flex items-center justify-between whitespace-nowrap max-w-screen-4xl mx-auto overflow-hidden">
        <div className="flex items-center gap-2 xs:gap-3">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
          >
            <span className="material-symbols-outlined text-white text-xl xs:text-2xl">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <a
            href="/"
            onClick={(e) => handleNavClick(e, 'Home')}
            className="flex items-center gap-2 text-xl xs:text-2xl sm:text-4xl font-black leading-tight tracking-tighter text-white cursor-pointer"
          >
            {settings?.branding?.logoUrl ? (
              <img
                src={slashToUrl(settings.branding.logoUrl)}
                alt="Logo"
                className="h-8 xs:h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            <span>{settings?.siteName || 'எழுத்திடு'}</span>
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-3 xl:gap-6 2xl:gap-8">
          {navItems.map((item) => (
            <a
              key={item}
              className={`text-xl font-bold transition-all relative py-1 ${activeTab === item
                ? 'text-white border-b-2 border-white'
                : 'text-white/70 hover:text-white'
                }`}
              href="#"
              onClick={(e) => handleNavClick(e, item)}
            >
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-end gap-3 xs:gap-4 md:gap-6">
          <button
            onClick={onOpenNotifications}
            className="material-symbols-outlined text-white text-2xl xs:text-3xl hover:scale-110 transition-transform relative"
          >
            notifications
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 xs:w-2.5 h-2 xs:h-2.5 bg-red-500 rounded-full border border-header-brown"></span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">


              <button
                onClick={() => onNavigate('Dashboard')}
                className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-white/20 border border-white/20 overflow-hidden hover:scale-110 transition-transform shadow-lg ring-2 ring-white/10"
                title="Go to Dashboard"
              >
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`}
                />
              </button>
            </div>
          ) : !isAuthPage ? (
            <button
              onClick={() => onNavigate('Login')}
              className="px-3 xs:px-4 md:px-6 py-1.5 xs:py-2 rounded-lg text-xl font-bold transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-md active:scale-95"
            >
              Login
            </button>
          ) : null}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden absolute top-full left-0 right-0 bg-header-brown border-t border-white/10 shadow-2xl animate-in slide-in-from-top-2 duration-200"
        >
          <nav className="flex flex-col py-2">
            {navItems.map((item) => (
              <a
                key={item}
                className={`px-4 py-3 text-sm font-bold transition-all ${activeTab === item
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                href="#"
                onClick={(e) => handleNavClick(e, item)}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;

