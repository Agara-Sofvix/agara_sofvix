
import React from 'react';

interface MarqueeProps {
  onClick?: () => void;
}

const Marquee: React.FC<MarqueeProps> = ({ onClick }) => {
  const [announcement, setAnnouncement] = React.useState("🏆 Tamil Typing Tournament – Registration Open | ⏳ Tournament Starts in 2 Days");

  React.useEffect(() => {
    const fetchMarquee = async () => {
      try {
        const response = await fetch('/api/settings/public');
        const data = await response.json();
        if (data.marqueeText) {
          setAnnouncement(data.marqueeText);
        }
      } catch (err) {
        console.error("Failed to fetch marquee text", err);
      }
    };
    fetchMarquee();
  }, []);

  return (
    <div
      onClick={onClick}
      className={`w-full overflow-hidden bg-cream-light/60 rounded-xl border border-white/20 shadow-sm py-2 ${onClick ? 'cursor-pointer hover:bg-cream-light/80 transition-colors' : ''}`}
    >
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="text-black text-xl font-bold px-4">{announcement}</span>
          <span className="text-black text-xl font-bold px-4">{announcement}</span>
          <span className="text-black text-xl font-bold px-4">{announcement}</span>
          <span className="text-black text-xl font-bold px-4">{announcement}</span>
        </div>
      </div>
    </div>
  );
};

export default Marquee;
