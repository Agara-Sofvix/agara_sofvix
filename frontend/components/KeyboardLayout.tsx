
import React, { useState } from 'react';
import Keyboard from './Keyboard';
import { TAMIL_PHONETIC_MAP, processTamilInput, handleTamilBackspace } from '../tamilEngine';

const KeyboardLayout: React.FC = () => {
  const [demoInput, setDemoInput] = useState("");

  const handleDemoKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const key = e.key;
    const target = e.currentTarget;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;

    if (key === 'Backspace') {
      e.preventDefault();
      const result = handleTamilBackspace(demoInput, start, end);
      setDemoInput(result.text);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = result.newCursorPos;
      }, 0);
      return;
    }

    if (key.length === 1) {
      e.preventDefault();
      let newText = demoInput;
      let newCursor = start;

      if (/^[a-zA-Z]$/.test(key)) {
        const result = processTamilInput(demoInput, key, start);
        newText = result.text;
        newCursor = result.newCursorPos;
      } else {
        newText = demoInput.slice(0, start) + key + demoInput.slice(end);
        newCursor = start + 1;
      }

      setDemoInput(newText);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = newCursor;
      }, 0);
    }
  };

  const tableData = Object.keys(TAMIL_PHONETIC_MAP)
    .filter(k => k === k.toLowerCase())
    .map(key => ({
      key,
      base: TAMIL_PHONETIC_MAP[key].main,
      shift: TAMIL_PHONETIC_MAP[key.toUpperCase()]?.main || '-',
      type: TAMIL_PHONETIC_MAP[key].type
    }));

  const rules = [
    {
      title: "Vowel (Uyir) Rules",
      icon: "font_download",
      items: [
        { seq: "a", res: "அ", desc: "Standalone vowel input" },
        { seq: "Shift + a", res: "ஆ", desc: "Uppercase vowel input" },
        { seq: "a + a", res: "ஆ", desc: "Vowel doubling (Standalone only)" }
      ]
    },
    {
      title: "Consonant (Mei) Rules",
      icon: "Keyboard_alt",
      items: [
        { seq: "k", res: "க்", desc: "Mei entry with Pulli (்)" },
        { seq: "Consonants", res: "்", desc: "Pulli remains visible by default" },
        { seq: "Shift + k", res: "க்ஷ்", desc: "Grantha/Special consonants supported" }
      ]
    },
    {
      title: "Auto-Join Rules",
      icon: "join_full",
      items: [
        { seq: "k + a", res: "க", desc: "Mei + Uyir = Uyirmei" },
        { seq: "க + a", res: "கா", desc: "Uyirmei + Uyir = Upgrade" },
        { seq: "k + i", res: "கி", desc: "Sign logic handles all combinations" }
      ]
    },
    {
      title: "Editing Protocols",
      icon: "history_edu",
      items: [
        { seq: "கா + Bksp", res: "க", desc: "Uyirmei reverts to Base Mei" },
        { seq: "க + Bksp", res: "Removed", desc: "Base Mei is removed completely" },
        { seq: "Cursor", res: "Anywhere", desc: "Logic applied at any cursor position" }
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700 pb-20 text-sm sm:text-base">

      {/* Header Section */}
      <section className="bg-cream-light/50 border border-slate-200 rounded-[2.5rem] p-12 text-center relative overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-bl-full pointer-events-none"></div>
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-4xl text-primary">menu_book</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-4 text-slate-900">Typing Engine Manual</h1>
        <p className="text-sm sm:text-lg font-bold text-slate-600 max-w-2xl mx-auto">
          Ezhuthidu uses a deterministic, phonetic-first engine. Every keystroke follows the Definitive Rule Specification for maximum efficiency.
        </p>
      </section>

      {/* Logic Rules Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rules.map((section, idx) => (
          <div key={idx} className="bg-cream-light/50 rounded-[2rem] p-8 shadow-inner border border-slate-200">
            <h3 className="text-lg sm:text-xl font-black mb-6 flex items-center gap-3 text-primary">
              <span className="material-symbols-outlined">{section.icon}</span>
              {section.title}
            </h3>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{item.desc}</span>
                    <span className="text-sm font-bold text-slate-800 mt-1">{item.seq}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-slate-300 text-sm">arrow_forward</span>
                    <span className="text-lg sm:text-xl font-tamil font-black text-primary">{item.res}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Virtual Keyboard Preview */}
      <section className="space-y-6">
        <h2 className="text-xs font-black uppercase tracking-[0.4em] text-center opacity-40">Interactive Reference Layout</h2>
        <div className="w-full flex justify-center py-4">
          <Keyboard activeKeys={new Set()} />
        </div>
      </section>
      <section className="bg-cream-light/50 rounded-[2.5rem] p-10 shadow-inner flex flex-col md:flex-row gap-10 border border-slate-200">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-black mb-4 flex items-center gap-2 text-slate-800">
            <span className="material-symbols-outlined text-primary">edit_note</span>
            Logic Playground
          </h3>
          <textarea
            value={demoInput}
            onKeyDown={handleDemoKeyDown}
            inputMode="text"
            className="w-full h-28 sm:h-40 rounded-3xl bg-white border-2 border-slate-100 focus:border-primary focus:ring-0 p-4 sm:p-8 font-tamil text-lg sm:text-3xl shadow-inner transition-all text-center"
            placeholder="Type 'k + a' here to test auto-joining..."
          ></textarea>
        </div>
        <div className="md:w-72 flex flex-col justify-center gap-6">
          <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
            <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 opacity-60">Engine Guarantees</h4>
            <ul className="space-y-3">
              {[
                { icon: 'task_alt', text: 'Pulli (்) always visible' },
                { icon: 'task_alt', text: 'Grapheme-safe Bksp' },
                { icon: 'task_alt', text: 'Grantha fully mapped' },
                { icon: 'task_alt', text: '216 Uyirmei Support' }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="material-symbols-outlined text-xs text-green-600">{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setDemoInput("")}
            className="w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-sm"
          >
            Clear Playground
          </button>
        </div>
      </section>

      {/* Mapping Table */}
      <section className="bg-cream-light/50 rounded-[2.5rem] overflow-hidden shadow-inner border border-slate-200">
        <div className="p-8 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center bg-cream-light/30 gap-4">
          <div>
            <h3 className="font-black flex items-center gap-2 text-xl sm:text-2xl text-slate-900">
              <span className="material-symbols-outlined">table_chart</span>
              Key Map Reference
            </h3>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mt-1">Phonetic Logic Distribution</p>
          </div>
        </div>
        <div className="overflow-x-hidden">
          <table className="w-full table-auto text-sm">
            <colgroup>
              <col className="w-1/6" />
              <col className="w-1/6" />
              <col className="w-2/6" />
              <col className="w-2/6" />
            </colgroup>
            <thead>
              <tr className="bg-cream-light/40">
                <th className="text-left p-3 sm:p-6 font-black uppercase text-[9px] sm:text-[10px] text-slate-500 tracking-widest">Key</th>
                <th className="text-left p-3 sm:p-6 font-black uppercase text-[9px] sm:text-[10px] text-slate-500 tracking-widest">Type</th>
                <th className="text-left p-3 sm:p-6 font-black uppercase text-[9px] sm:text-[10px] text-slate-500 tracking-widest">Base (Normal)</th>
                <th className="text-left p-3 sm:p-6 font-black uppercase text-[9px] sm:text-[10px] text-slate-500 tracking-widest">Shift Logic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/50">
              {tableData.map((row, i) => (
                <tr key={i} className="hover:bg-cream-light/30 transition-colors">
                  <td className="p-3 sm:p-6 align-middle">
                    <span className="px-2 py-1 bg-black text-white rounded-md font-mono font-bold text-sm">{row.key}</span>
                  </td>
                  <td className="p-3 sm:p-6 align-middle">
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${row.type === 'uyir' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {row.type}
                    </span>
                  </td>
                  <td className="p-3 sm:p-6 text-lg sm:text-xl font-tamil font-black text-slate-900 break-words">{row.base}</td>
                  <td className="p-3 sm:p-6 text-lg sm:text-xl font-tamil font-black text-primary break-words">{row.shift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default KeyboardLayout;
