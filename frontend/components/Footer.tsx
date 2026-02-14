
import React from 'react';

interface FooterProps {
  onNavigate?: (view: string, mode?: string) => void;
  isLoggedIn?: boolean;
  onOpenRules?: () => void;
  onOpenLoginRequired?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, isLoggedIn, onOpenRules, onOpenLoginRequired }) => {
  return (
    <footer className="bg-header-brown border-t border-slate-200 py-8 xs:py-10 md:py-12 text-white transition-colors duration-200 w-full">
      <div className="w-full px-4 xs:px-6 md:px-10 lg:px-16 max-w-screen-4xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 xs:gap-10 md:gap-16">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl xs:text-2xl sm:text-4xl font-black">எழுத்திடு</span>
            </div>
            <p className="text-white/80 text-base font-medium">Empowering users to master Tamil typing through modern technology and proven learning methods.</p>
          </div>

          <div>
            <h5 className="text-xl font-bold mb-6">Practice</h5>
            <ul className="flex flex-col gap-3 text-xl font-bold text-white/70">
              <li><a className="hover:text-white" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('Practice', 'free'); }}>Free Typing</a></li>
              <li><a className="hover:text-white" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('Practice', 'lesson'); }}>Lesson Practice</a></li>
              <li><a className="hover:text-white" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('Practice', 'custom'); }}>Custom Text</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xl font-bold mb-6">Tournament</h5>
            <ul className="flex flex-col gap-3 text-xl font-bold text-white/70">
              <li><a className="hover:text-white" href="#" onClick={(e) => {
                e.preventDefault();
                if (isLoggedIn) {
                  onNavigate?.('TournamentArena');
                } else {
                  onOpenLoginRequired?.();
                }
              }}>Enter Arena</a></li>
              <li><a className="hover:text-white" href="#" onClick={(e) => { e.preventDefault(); onOpenRules?.(); }}>Eligibility & Rules</a></li>
              <li><a className="hover:text-white" href="#" onClick={(e) => {
                e.preventDefault();
                if (isLoggedIn) {
                  onNavigate?.('TournamentArena');
                } else {
                  onOpenLoginRequired?.();
                }
              }}>Leaderboard</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-xl font-bold mb-6">Platform</h5>
            <ul className="flex flex-col gap-6 text-xl font-bold text-white/70">
              <li className="flex gap-6 items-center">
                <a href="https://wa.me/919498069292" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="WhatsApp">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
                <a href="https://www.instagram.com/agara_sofvix/?hl=en" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Instagram">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                </a>
                <a href="https://share.google/HpbHM5YjplPZ128M2" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform" title="Google Maps">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current"><path d="M12 0C7.802 0 4.409 3.393 4.409 7.591c0 2.704 1.43 5.483 3.593 8.356l4.012 5.567c.28.388.852.388 1.132 0l4.012-5.567c2.163-2.873 3.593-5.652 3.593-8.356C20.8 3.393 17.407 0 13.209 0H12zm0 11.231c-2.007 0-3.636-1.629-3.636-3.636s1.629-3.636 3.636-3.636 3.636 1.629 3.636 3.636-1.629 3.636-3.636 3.636z" /></svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 xs:mt-16 pt-8 border-t border-white/10 flex flex-col items-center gap-6 text-xl font-bold text-white text-center">
          <p>© 2026 எழுத்திடு. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
