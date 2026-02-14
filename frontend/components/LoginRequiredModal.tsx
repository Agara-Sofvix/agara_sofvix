
import React from 'react';

interface LoginRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: () => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ isOpen, onClose, onLogin }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-cream-light/50 backdrop-blur-md rounded-3xl shadow-inner max-w-sm w-full p-8 text-center border border-slate-200 animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="w-16 h-16 bg-header-brown/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-3xl text-header-brown font-bold">lock</span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 mb-3">Login Required</h2>

                <p className="text-slate-600 font-medium mb-8">
                    You need to be logged in to access the Leaderboard and participate in tournaments.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => {
                            onLogin();
                            onClose();
                        }}
                        className="w-full py-3 bg-header-brown text-white rounded-xl font-bold hover:bg-header-brown/90 active:scale-[0.98] transition-all shadow-md"
                    >
                        Go to Login
                    </button>

                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                        Maybe Later
                    </button>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose} />
        </div>
    );
};

export default LoginRequiredModal;
