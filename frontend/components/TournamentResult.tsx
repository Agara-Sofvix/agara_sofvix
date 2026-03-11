
import React from 'react';
import { TournamentScore } from '../src/types';
import AdSenseBlock from './AdSenseBlock';

interface TournamentResultProps {
  score: TournamentScore | null;
  displayName: string;
  onNavigate: (view: string) => void;
}

const TournamentResult: React.FC<TournamentResultProps> = ({ score, displayName, onNavigate }) => {
  if (!score) {
    return (
      <div className="min-h-screen bg-warm-bg text-slate-900 flex flex-col items-center justify-center p-10">
        <p className="text-xl font-black uppercase opacity-60">Result processing error...</p>
        <button onClick={() => onNavigate('Home')} className="mt-10 px-8 py-3 bg-header-brown text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg">Back to Home</button>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    try {
      const element = document.createElement('div');
      element.style.padding = '50px';
      element.style.width = '800px';
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#1a1a1a';
      element.style.fontFamily = 'Lexend, sans-serif';

      element.innerHTML = `
        <div style="border-bottom: 3px solid #92450f; padding-bottom: 20px; margin-bottom: 40px;">
          <h1 style="margin: 0; color: #92450f; text-transform: uppercase; letter-spacing: 2px;">Elite Championship Certificate</h1>
          <p style="margin: 5px 0 0; opacity: 0.6; font-size: 12px;">Official Performance Verification Result</p>
        </div>
        <div style="margin-bottom: 40px;">
          <p style="font-size: 14px; text-transform: uppercase; font-weight: 800; margin-bottom: 5px; opacity: 0.5;">Participant Identity</p>
          <h2 style="margin: 0; font-size: 28px;">${displayName}</h2>
          <p style="opacity: 0.4; font-size: 10px; margin-top: 5px;">Timestamp: ${score.timestamp}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
          <thead>
            <tr style="background: #fdf6e3; text-align: left;">
              <th style="padding: 15px; border-bottom: 2px solid #92450f;">Metric</th>
              <th style="padding: 15px; border-bottom: 2px solid #92450f;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Performance Score</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.wpm} PTS</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Final Accuracy</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.accuracy}%</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Total Errors</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.errors}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Total Characters</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.totalChars}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Correct Strokes</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.correctChars}</td></tr>
            <tr><td style="padding: 12px; border-bottom: 1px solid #eee;">Submission Mode</td><td style="padding: 12px; border-bottom: 1px solid #eee;">${score.submissionType}</td></tr>
          </tbody>
        </table>
        <div style="text-align: center; margin-top: 60px; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 10px; opacity: 0.3; text-transform: uppercase;">எழுத்திடு Competitive Typing System • Digital Signature Verified</p>
        </div>
      `;

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5] as [number, number, number, number],
        filename: `tournament-result-${displayName}.pdf`,
        image: { type: 'jpeg' as const, quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
      };

      // @ts-ignore
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed', error);
      alert("PDF download failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg text-slate-900 flex flex-col items-center py-16 px-6 animate-in fade-in duration-700">
      <div className="w-full max-w-4xl space-y-12">

        {/* Result Summary Card */}
        <section className="bg-cream-light border border-slate-200 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-header-brown"></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] opacity-40 mb-2">Performance Record</h2>
          <h1 className="text-5xl font-black mb-10 tracking-tight text-slate-900">Your Result</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-b border-black/5 py-12">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-slate-700">Accuracy</p>
              <p className="text-4xl font-black text-green-600 font-sans">{score.accuracy}%</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-slate-700">Errors</p>
              <p className="text-4xl font-black text-red-600 font-sans">{score.errors}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 text-slate-700">Time Taken</p>
              <p className="text-4xl font-black text-slate-900 font-sans">{score.timeTaken}</p>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2">
            <p className="text-xs font-bold opacity-60">Submitted via {score.submissionType} trigger</p>
            <p className="text-[9px] font-mono opacity-20 uppercase tracking-tighter">REF: {Date.now()}</p>
          </div>
        </section>

        <div className="my-8 flex justify-center">
          <AdSenseBlock adSlot="7788990011" adFormat="auto" />
        </div>

        {/* Breakdown Table */}
        <section className="space-y-6">
          <h3 className="text-xs font-black uppercase tracking-widest opacity-60 ml-2">Detailed Breakdown</h3>
          <div className="bg-cream-light border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-black/5">
                {[
                  { label: "Total Characters Typed", value: score.totalChars },
                  { label: "Correct Characters", value: score.correctChars },
                  { label: "Wrong Characters", value: score.wrongChars },
                  { label: "Submission Type", value: score.submissionType },
                  { label: "Final Performance Score", value: `${score.wpm} PTS` },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="p-6 font-bold opacity-60 text-slate-700">{row.label}</td>
                    <td className="p-6 text-right font-black text-slate-900">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ranking Info */}
        <section className="bg-header-brown/10 border border-header-brown/20 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8">
          <span className="material-symbols-outlined text-5xl text-header-brown">info</span>
          <div className="text-center md:text-left flex-grow">
            <h4 className="text-lg font-black uppercase tracking-widest mb-2 text-slate-900">Ranking Protocol</h4>
            <p className="text-sm font-medium opacity-60 leading-relaxed text-slate-800">
              Official rankings are currently under internal processing. Final standing will be available on the global leaderboard once the tournament window closes.
            </p>
          </div>
        </section>

        {/* Navigation & Download */}
        <div className="flex flex-col sm:flex-row gap-6 pt-10">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 h-16 bg-header-brown text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition-all outline-none border-none"
          >
            <span className="material-symbols-outlined">picture_as_pdf</span>
            Download Result PDF
          </button>

          <div className="flex gap-4 flex-1">
            <button
              onClick={() => onNavigate('TournamentArena')}
              className="flex-1 h-16 bg-cream-light border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-cream-light/80 transition-all text-slate-900 shadow-md"
            >
              Leaderboard
            </button>
            <button
              onClick={() => onNavigate('Home')}
              className="flex-1 h-16 bg-cream-light border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-cream-light/80 transition-all text-slate-900 shadow-md"
            >
              Home
            </button>
          </div>
        </div>

        <div className="text-center pt-12">
          <div className="mb-8 flex justify-center">
            <AdSenseBlock adSlot="8899001122" adFormat="auto" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-20">No re-attempts allowed for this session ID</p>
        </div>
      </div>
    </div>
  );
};

export default TournamentResult;
