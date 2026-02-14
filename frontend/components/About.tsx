
import React from 'react';

interface AboutProps {
  onNavigate: (view: string) => void;
}

const About: React.FC<AboutProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700 pb-20 text-sm sm:text-base">
      {/* Hero Section */}
      <section className="w-full min-h-[auto] sm:min-h-[60vh] lg:min-h-[85vh] 5xl:min-h-[70vh] flex items-center bg-cream-light/30 border border-slate-200 rounded-[2rem] sm:rounded-[3rem] 5xl:rounded-[6rem] p-4 sm:p-10 md:p-16 lg:p-16 2xl:p-20 4xl:p-32 5xl:p-48 shadow-inner overflow-hidden relative">
        <div className="content-area flex flex-col lg:flex-row items-center gap-8 sm:gap-20 lg:gap-14 xl:gap-24 5xl:gap-32 w-full max-w-6xl mx-auto">
          <div className="flex-1 space-y-8 4xl:space-y-16 5xl:space-y-24 flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="inline-block px-4 py-1.5 5xl:px-10 5xl:py-4 bg-black text-white text-[10px] sm:text-xs 5xl:text-2xl font-black uppercase tracking-widest rounded-full">Explore Our Mission</div>
            <h1 className="text-3xl xs:text-4xl sm:text-7xl lg:text-5xl xl:text-6xl 3xl:text-8xl 5xl:text-9xl font-black leading-[1.1] text-slate-900 tracking-tighter">
              About This <br /><span className="text-[#92450f]">Platform</span>
            </h1>
            <p className="text-base sm:text-lg 3xl:text-xl 5xl:text-4xl font-medium text-black/80 leading-relaxed max-w-xl 4xl:max-w-3xl 5xl:max-w-5xl">
              Ezhuthidu is a dedicated Tamil typing ecosystem designed specifically for students, job seekers, and professionals. We empower the next generation with tools to master digital Tamil communication.
            </p>
            <div className="pt-4 flex flex-wrap justify-center lg:justify-start gap-4 sm:gap-6 5xl:gap-12">
              <button
                onClick={() => onNavigate('Practice')}
                className="w-full xs:w-52 h-14 sm:w-56 sm:h-16 5xl:w-96 5xl:h-28 bg-black text-white rounded-xl sm:rounded-2xl 5xl:rounded-[3rem] font-black text-sm 5xl:text-3xl hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center"
              >
                Start Practicing
              </button>
              <button
                onClick={() => document.getElementById('core-purpose')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full xs:w-52 h-14 sm:w-56 sm:h-16 5xl:w-96 5xl:h-28 bg-transparent border-2 border-black rounded-xl sm:rounded-2xl 5xl:rounded-[3rem] font-black text-sm 5xl:text-3xl hover:bg-black/5 transition-all flex items-center justify-center"
              >
                Our Vision
              </button>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 relative justify-center items-center">
            <div className="relative w-[320px] h-[320px] sm:w-[450px] sm:h-[450px] lg:w-[400px] lg:h-[400px] xl:w-[380px] xl:h-[380px] 4xl:w-[600px] 4xl:h-[600px] 5xl:w-[900px] 5xl:h-[900px]">
              <div className="absolute inset-0 bg-[#92450f]/10 rounded-full animate-pulse"></div>
              <div className="absolute inset-8 4xl:inset-12 5xl:inset-20 border-4 5xl:border-8 border-dashed border-[#92450f]/30 rounded-full"></div>
              <div className="absolute inset-16 4xl:inset-24 5xl:inset-40 bg-[#92450f] rounded-full shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-500">
                <span className="material-symbols-outlined text-white text-[80px] sm:text-[120px] lg:text-[100px] xl:text-[100px] 4xl:text-[160px] 5xl:text-[240px]">keyboard_alt</span>
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-20 sm:h-20 5xl:w-40 5xl:h-40 bg-white rounded-full shadow-xl flex items-center justify-center text-2xl sm:text-3xl 5xl:text-7xl font-black text-[#92450f]">அ</div>
              <div className="absolute top-1/2 -left-12 w-14 h-14 sm:w-16 sm:h-16 5xl:w-32 5xl:h-32 bg-white/90 rounded-full shadow-lg flex items-center justify-center text-xl sm:text-2xl 5xl:text-5xl font-black text-[#92450f]">க்</div>
              <div className="absolute bottom-4 right-10 w-12 h-12 sm:w-14 sm:h-14 5xl:w-28 5xl:h-28 bg-white/80 rounded-full shadow-md flex items-center justify-center text-lg sm:text-xl 5xl:text-4xl font-black text-[#92450f]">தி</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="core-purpose" className="bg-cream-light/50 rounded-[2rem] sm:rounded-[60px] 5xl:rounded-[100px] p-6 sm:p-10 md:p-16 4xl:p-32 5xl:p-48 flex flex-col items-center text-center shadow-inner mt-6 sm:mt-12">
        <div className="inline-block px-4 py-1.5 5xl:px-10 5xl:py-4 bg-header-brown text-white text-[9px] sm:text-[10px] 5xl:text-2xl font-black uppercase tracking-widest rounded-full mb-6 sm:mb-10">Our Core Purpose</div>
        <div className="max-w-5xl 5xl:max-w-6xl space-y-10 sm:space-y-12 5xl:space-y-24">
          <div>
            <h2 className="text-base sm:text-xl 5xl:text-5xl font-black uppercase tracking-tighter mb-4 opacity-40">The Mission</h2>
            <p className="text-lg sm:text-3xl md:text-4xl 5xl:text-7xl font-bold text-black leading-snug">
              To bridge the digital linguistic gap by providing a world-class, intuitive Tamil typing experience for everyone.
            </p>
          </div>
          <div className="w-16 sm:w-24 h-px 5xl:h-1 bg-black/20 mx-auto"></div>
          <div>
            <h2 className="text-base sm:text-xl 5xl:text-5xl font-black uppercase tracking-tighter mb-4 opacity-40">The Vision</h2>
            <p className="text-lg sm:text-3xl md:text-4xl 5xl:text-7xl font-bold text-header-brown leading-snug">
              To ensure the world's oldest language leads the modern era through technological innovation and digital mastery.
            </p>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="p-4 sm:p-10 4xl:p-20 5xl:p-32 max-w-6xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-center sm:items-end mb-10 sm:mb-16 gap-6">
          <div className="max-w-xl 4xl:max-w-3xl 5xl:max-w-5xl text-center md:text-left">
            <h2 className="text-2xl sm:text-4xl md:text-5xl 5xl:text-8xl font-black md:mb-6 tracking-tight">What Makes <br />Us Different</h2>
            <p className="text-sm sm:text-lg 5xl:text-4xl font-bold opacity-80 mt-2">We've built a logic-first engine that prioritizes the user's natural typing rhythm.</p>
          </div>
          <div className="h-px 5xl:h-1 bg-black/20 flex-grow mx-8 mb-4 hidden md:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 5xl:gap-16">
          {[
            { title: "Real Keyboard Logic", desc: "Phonetic mapping that aligns with natural linguistic patterns for instant muscle memory.", icon: "keyboard_double_arrow_right" },
            { title: "Intelligent Auto-joining", desc: "Our engine handles complex Mei and Uyir-Mei combinations seamlessly as you type.", icon: "join_inner" },
            { title: "Practice/Games", desc: "Seamlessly switch between Practice and Games in one unified interface designed for consistent growth.", icon: "dashboard_customize" }
          ].map((item, idx) => (
            <div key={idx} className="p-6 sm:p-10 5xl:p-24 rounded-[2rem] sm:rounded-[40px] 5xl:rounded-[6rem] border border-slate-200 hover:border-header-brown/40 transition-all group bg-cream-light/50 shadow-inner cursor-default">
              <span className="material-symbols-outlined text-4xl sm:text-6xl 5xl:text-[10rem] text-header-brown mb-4 sm:mb-6 block group-hover:scale-105 transition-transform">{item.icon}</span>
              <h3 className="text-lg sm:text-2xl 5xl:text-6xl font-black mb-2 sm:mb-4">{item.title}</h3>
              <p className="text-sm sm:text-base 5xl:text-4xl font-bold opacity-70 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stages of Learning */}
      <section className="bg-cream-light/30 rounded-[2rem] sm:rounded-[3.5rem] 5xl:rounded-[8rem] p-6 sm:p-10 md:p-16 4xl:p-32 5xl:p-48 border border-black/5 shadow-inner mb-20 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl md:text-5xl 5xl:text-8xl font-black mb-4 sm:mb-6 text-slate-900 leading-[1.1] tracking-tight">Designed for Every Stage of Learning</h2>
          <p className="text-sm sm:text-xl 5xl:text-4xl font-bold text-slate-800/80">A structured path from your first letter to professional speed.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10 5xl:gap-20">
          {[
            { id: "01", title: "Beginner", desc: "Focus on mastering the fundamentals of Uyir (vowels) and Mei (consonants) characters through visual mapping.", focus: "FOUNDATIONS" },
            { id: "02", title: "Intermediate", desc: "Progress to sentence building and common word patterns to improve flow and decrease cognitive load.", focus: "FLUENCY" },
            { id: "03", title: "Expert", desc: "High-speed drills and exam-style simulations designed for competitive prep and professional accuracy.", focus: "SPEED & ACCURACY" }
          ].map((stage, idx) => (
            <div key={idx} className="bg-[#ecdfcc] border border-black/5 rounded-[2.5rem] sm:rounded-[3.5rem] 5xl:rounded-[6rem] p-6 sm:p-8 5xl:p-24 flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all cursor-default relative overflow-hidden min-h-[200px] sm:min-h-[210px] 5xl:min-h-[800px]">
              <div className="text-[40px] sm:text-[64px] 5xl:text-[12rem] font-black text-black/5 mb-1 sm:mb-2 leading-none">{stage.id}</div>
              <h4 className="font-black text-2xl sm:text-4xl 5xl:text-7xl mb-3 sm:mb-6 text-slate-900 leading-tight">{stage.title}</h4>
              <p className="text-sm sm:text-[1.1rem] 5xl:text-4xl font-bold leading-relaxed text-slate-800 mb-6 sm:mb-10">{stage.desc}</p>
              <div className="mt-auto pt-4 sm:pt-8 5xl:pt-16 border-t border-black/10">
                <span className="text-[10px] sm:text-xs 5xl:text-3xl font-black uppercase tracking-[0.2em] text-[#92450f]">CORE FOCUS: {stage.focus}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
