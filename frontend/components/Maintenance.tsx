import React from 'react';

interface MaintenanceProps {
    contactEmail?: string;
}

const Maintenance: React.FC<MaintenanceProps> = ({ contactEmail }) => {
    return (
        <div className="min-h-screen bg-[#0f1214] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse delay-700"></div>

            <div className="max-w-xl w-full relative z-10">
                <div className="bg-[#1a1d21]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 md:p-16 shadow-2xl shadow-black/50 text-center">
                    {/* Animated Icon Container */}
                    <div className="relative mb-10 group">
                        <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="size-24 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto transform rotate-12 group-hover:rotate-0 transition-transform duration-500 shadow-xl shadow-blue-500/20">
                            <span className="material-symbols-outlined text-white text-5xl">
                                engineering
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Powering Up<span className="text-blue-500">.</span>
                    </h1>

                    <div className="space-y-4 mb-10">
                        <p className="text-lg text-slate-400 font-medium leading-relaxed">
                            <span className="text-white">எழுத்திடு</span> is currently undergoing scheduled maintenance to bring you a smoother typing experience.
                        </p>
                        <p className="text-sm text-slate-500">
                            We're fine-tuning the engines and will be back online in a few moments. Thank you for your patience!
                        </p>
                    </div>

                    {/* Progress indicator (visual only) */}
                    <div className="w-full h-1.5 bg-white/5 rounded-full mb-10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 w-[60%] rounded-full animate-[shimmer_2s_infinite]"></div>
                    </div>

                    {contactEmail && (
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 text-sm font-semibold text-slate-300 hover:bg-white/10 transition-colors">
                            <span className="material-symbols-outlined text-sm">mail</span>
                            <a href={`mailto:${contactEmail}`} className="hover:text-white">{contactEmail}</a>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-white/5">
                        <div className="flex items-center justify-center gap-3">
                            <div className="size-2 bg-emerald-500 rounded-full animate-ping"></div>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500">
                                Ezhuthidu Admin Team
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="mt-8 flex justify-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Database Offline</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="size-1.5 bg-emerald-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin Control Active</span>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
            `}</style>
        </div>
    );
};

export default Maintenance;

