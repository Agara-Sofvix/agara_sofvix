
import React from 'react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose, onNavigate }) => {
  if (!isOpen) return null;

  const rules = [
    {
      icon: 'cake',
      title: 'Age Requirement',
      desc: 'Participants must be 16 years or older. Date of birth verification is required during registration.'
    },
    {
      icon: 'keyboard',
      title: 'Hardware',
      desc: 'External keyboard is highly recommended. Mobile typing is permitted but may affect competitive timing.'
    },
    {
      icon: 'security',
      title: 'Fair Play',
      desc: 'Automatic anti-cheat protocols are active. Switching tabs or loss of window focus results in immediate submission.'
    },
    {
      icon: 'login',
      title: 'Authentication',
      desc: 'Registration is permanent and tied to your verified profile. Guest sessions are ineligible for global ranking.'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container - Using themed warm background (mobile-friendly) */}
      <div className="relative w-full max-w-full sm:max-w-3xl bg-cream-light/50 backdrop-blur-xl border border-slate-200 rounded-[1.5rem] sm:rounded-[3rem] shadow-inner overflow-hidden max-h-[calc(100vh-3.5rem)] sm:max-h-none animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">

        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-header-brown"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors text-slate-800"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="p-4 sm:p-8 md:p-12 overflow-auto max-h-[calc(100vh-7rem)] sm:max-h-none">
          <header className="mb-6 text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-header-brown mb-2 font-display">Tournament Protocols</h2>
            <p className="text-[10px] sm:text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Eligibility & Competitive Rules</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex gap-4 group">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-header-brown/10 flex items-center justify-center text-header-brown transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-2xl">{rule.icon}</span>
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900 mb-1">{rule.title}</h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 border-t border-slate-100 pt-10">
            <button
              onClick={() => { onClose(); onNavigate('Tournament'); }}
              className="w-full sm:w-auto px-10 py-4 bg-header-brown text-white rounded-2xl font-black text-sm tracking-widest uppercase shadow-lg hover:scale-105 active:scale-95 transition-all"
            >
              Enter Tournament
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-10 py-4 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl font-black text-sm tracking-widest uppercase hover:bg-slate-200 transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
