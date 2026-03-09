
import React from 'react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-8 overflow-y-auto text-slate-700 leading-relaxed legal-content custom-scrollbar">
                    {content}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-header-brown text-white font-black rounded-xl hover:bg-header-brown/90 transition-all uppercase tracking-widest text-xs shadow-md"
                    >
                        Got it
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .legal-content h1 { font-size: 1.5rem; font-weight: 900; margin-bottom: 1.5rem; color: #0f172a; text-transform: uppercase; letter-spacing: -0.025em; }
        .legal-content h2 { font-size: 1.1rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; color: #1e293b; text-transform: uppercase; }
        .legal-content p { margin-bottom: 1rem; font-size: 0.95rem; }
        .legal-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .legal-content li { margin-bottom: 0.5rem; font-size: 0.95rem; }
        .legal-content strong { font-weight: 800; color: #334155; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
        </div>
    );
};

export default LegalModal;
