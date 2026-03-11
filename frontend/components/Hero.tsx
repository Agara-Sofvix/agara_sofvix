
import React from 'react';

interface HeroProps {
  onNavigate: (view: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  const cards = [
    {
      title: "Practice Tamil Typing",
      desc: "Improve your skills through basic to advanced typing lessons designed for speed and accuracy.",
      icon: "keyboard",
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      view: "Practice"
    },
    {
      title: "Take Speed Test",
      desc: "Test and track your typing speed (WPM) and accuracy in real-time on our official platform.",
      icon: "speed",
      iconColor: "text-orange-600",
      bgColor: "bg-orange-100",
      view: "Test"
    },
    {
      title: "Learn Keyboard Layout",
      desc: "Master the authentic Tamil keyboard mapping and finger placement for maximum efficiency.",
      icon: "grid_view",
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      view: "Keyboard Layout"
    }
  ];

  return (
    <section className="bg-cream-light/50 border border-slate-200 rounded-xl xs:rounded-2xl md:rounded-[2rem] p-3 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 shadow-inner flex flex-col gap-4 xs:gap-6 md:gap-8 relative overflow-hidden">
      {/* Decorative Blob - Removed for cleaner look */}

      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 xs:gap-6 md:gap-8 text-center">
        <div className="flex flex-col gap-3 xs:gap-4 md:gap-6">
          <h1 className="text-[#0d141b] text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-black leading-[1.3] tracking-tight flex flex-col items-center gap-1">
            <span className="block whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">Every Character Tells a Story.</span>
            <span className="text-primary block whitespace-nowrap overflow-hidden text-ellipsis sm:whitespace-normal text-sm xs:text-base sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl">The Official Competition Awaits</span>
          </h1>
          <p className="text-slate-600 text-xs xs:text-sm sm:text-base md:text-lg lg:text-xl font-semibold leading-relaxed max-w-3xl mx-auto px-2">
            Participation is restricted to logged-in users only.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-5 mt-2 sm:mt-4 w-full px-2">
          <button
            onClick={() => onNavigate('TournamentArena')}
            className="w-full sm:w-[260px] sm:min-w-[260px] cursor-pointer flex items-center justify-center rounded-full sm:rounded-2xl h-12 sm:h-12 md:h-14 px-4 sm:px-8 md:px-10 bg-primary text-white text-base sm:text-base md:text-lg font-black transition-all hover:bg-primary/90 shadow-[0_10px_20px_-5px_rgba(19,127,236,0.4)] hover:scale-105 active:scale-95"
          >
            Enter Arena
          </button>
          <button
            onClick={() => onNavigate('Leaderboard')}
            className="w-full sm:w-[260px] sm:min-w-[260px] cursor-pointer flex items-center justify-center rounded-full sm:rounded-2xl h-12 sm:h-12 md:h-14 px-4 sm:px-8 md:px-10 bg-slate-100 text-[#0d141b] text-base sm:text-base md:text-lg font-black transition-all hover:bg-slate-200 shadow-sm border border-slate-200 hover:scale-105 active:scale-95"
          >
            Leaderboard
          </button>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 xs:gap-6 md:gap-8 mt-6 xs:mt-8 md:mt-12">
          {cards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => onNavigate(card.view)}
              className="bg-cream-light/50 p-4 xs:p-6 md:p-8 rounded-xl xs:rounded-2xl md:rounded-[2.5rem] flex flex-col items-center text-center gap-3 xs:gap-4 border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 cursor-pointer shadow-inner"
            >
              <div className={`w-12 h-12 xs:w-14 xs:h-14 md:w-16 md:h-16 rounded-lg xs:rounded-xl md:rounded-[1.25rem] ${card.bgColor} flex items-center justify-center transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110`}>
                <span className={`material-symbols-outlined ${card.iconColor} text-2xl xs:text-3xl md:text-4xl`}>{card.icon}</span>
              </div>
              <div>
                <h3 className="font-black text-base xs:text-lg md:text-xl text-slate-900">{card.title}</h3>
                <p className="text-xs xs:text-sm md:text-base text-slate-600 mt-1 xs:mt-2 leading-relaxed font-medium">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;

