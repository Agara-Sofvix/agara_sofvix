import React from 'react';
import { TAMIL_PHONETIC_MAP } from '../tamilEngine';

type KeySpec =
  | { kind: 'char'; label: string; phonetic: string; shiftLabel?: string; shiftPhonetic?: string; colSpan?: number }
  | { kind: 'icon'; icon: string; ariaLabel: string; colSpan?: number; action: string };

const tamilRows: KeySpec[][] = [
  // Row 1 (Numbers)
  [
    { kind: 'char', label: '1', phonetic: '1', shiftLabel: '!', shiftPhonetic: '!' },
    { kind: 'char', label: '2', phonetic: '2', shiftLabel: '@', shiftPhonetic: '@' },
    { kind: 'char', label: '3', phonetic: '3', shiftLabel: '#', shiftPhonetic: '#' },
    { kind: 'char', label: '4', phonetic: '4', shiftLabel: '$', shiftPhonetic: '$' },
    { kind: 'char', label: '5', phonetic: '5', shiftLabel: '%', shiftPhonetic: '%' },
    { kind: 'char', label: '6', phonetic: '6', shiftLabel: '^', shiftPhonetic: '^' },
    { kind: 'char', label: '7', phonetic: '7', shiftLabel: '&', shiftPhonetic: '&' },
    { kind: 'char', label: '8', phonetic: '8', shiftLabel: '*', shiftPhonetic: '*' },
    { kind: 'char', label: '9', phonetic: '9', shiftLabel: '(', shiftPhonetic: '(' },
    { kind: 'char', label: '0', phonetic: '0', shiftLabel: ')', shiftPhonetic: ')' },
  ],
  // Row 2
  [
    { kind: 'char', label: 'ஔ', phonetic: 'q' },
    { kind: 'char', label: 'ஐ', phonetic: 'w' },
    { kind: 'char', label: 'எ', phonetic: 'e', shiftLabel: 'ஏ', shiftPhonetic: 'E' },
    { kind: 'char', label: 'ர', phonetic: 'r', shiftLabel: 'ற்', shiftPhonetic: 'R' },
    { kind: 'char', label: 'த்', phonetic: 't' },
    { kind: 'char', label: 'ய்', phonetic: 'y' },
    { kind: 'char', label: 'உ', phonetic: 'u', shiftLabel: 'ஊ', shiftPhonetic: 'U' },
    { kind: 'char', label: 'இ', phonetic: 'i', shiftLabel: 'ஈ', shiftPhonetic: 'I' },
    { kind: 'char', label: 'ஒ', phonetic: 'o', shiftLabel: 'ஓ', shiftPhonetic: 'O' },
    { kind: 'char', label: 'ப்', phonetic: 'p' },
  ],
  // Row 3
  [
    { kind: 'char', label: 'அ', phonetic: 'a', shiftLabel: 'ஆ', shiftPhonetic: 'A' },
    { kind: 'char', label: 'ஸ்', phonetic: 's', shiftLabel: 'ஷ்', shiftPhonetic: 'S' },
    { kind: 'char', label: 'ட்', phonetic: 'd' },
    { kind: 'char', label: 'ஃ', phonetic: 'f' },
    { kind: 'char', label: 'ங்', phonetic: 'g' },
    { kind: 'char', label: 'ஹ்', phonetic: 'h' },
    { kind: 'char', label: 'ஞ', phonetic: 'j', shiftLabel: 'ஜ்', shiftPhonetic: 'J' },
    { kind: 'char', label: 'க்', phonetic: 'k', shiftLabel: 'க்ஷ்', shiftPhonetic: 'K' },
    { kind: 'char', label: 'ல்', phonetic: 'l', shiftLabel: 'ள்', shiftPhonetic: 'L' },
    { kind: 'icon', icon: 'backspace', ariaLabel: 'Backspace', action: 'backspace' },
  ],
  // Row 4
  [
    { kind: 'icon', icon: 'shift', ariaLabel: 'Shift', action: 'shift' },
    { kind: 'char', label: 'ழ்', phonetic: 'z' },
    { kind: 'char', label: 'ஶ்', phonetic: 'x', shiftLabel: 'ஸ்ரீ', shiftPhonetic: 'X' },
    { kind: 'char', label: 'ச்', phonetic: 'c' },
    { kind: 'char', label: 'வ்', phonetic: 'v' },
    { kind: 'char', label: 'ந்', phonetic: 'b' },
    { kind: 'char', label: 'ன்', phonetic: 'n', shiftLabel: 'ண்', shiftPhonetic: 'N' },
    { kind: 'char', label: 'ம்', phonetic: 'm' },
    { kind: 'char', label: ',', phonetic: ',', shiftLabel: '<', shiftPhonetic: '<' },
    { kind: 'char', label: '.', phonetic: '.', shiftLabel: '>', shiftPhonetic: '>' },
  ],
];

const MobileKeyboard: React.FC = () => {
  const [isShifted, setIsShifted] = React.useState(false);
  const [layout, setLayout] = React.useState<'tamil' | 'numbers' | 'symbols'>('tamil');

  const getDynamicColor = (k: KeySpec) => {
    if (k.kind !== 'char' || !k.phonetic) return 'bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1]';
    const char = (isShifted && k.shiftPhonetic) ? k.shiftPhonetic : k.phonetic;
    if (!char) return 'bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1]';
    const entry = TAMIL_PHONETIC_MAP[char.toLowerCase()];
    if (!entry) return 'bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1]';

    // UI Accents (Matching laptop .vowel-zone and .consonant-zone)
    if (entry.type === 'uyir') return 'bg-gradient-to-b from-[#eff6ff] to-[#dbeafe] border-[#bfdbfe]';
    if (entry.type === 'mei') return 'bg-gradient-to-b from-[#f0fdf4] to-[#dcfce7] border-[#bbf7d0]';

    return 'bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1]';
  };

  const dispatchInput = (type: string, value: string) => {
    const event = new CustomEvent('mobile-keyboard-input', { detail: { type, value } });
    window.dispatchEvent(event);
  };

  const onKeyClick = (k: KeySpec) => {
    if (k.kind === 'icon') {
      if (k.action === 'backspace') {
        window.dispatchEvent(new CustomEvent('mobile-keyboard-input', { detail: { type: 'backspace' } }));
      } else if (k.action === 'shift') {
        setIsShifted(!isShifted);
      }
      return;
    }

    if (k.label === '▢▢') return;

    const char = (isShifted && k.shiftPhonetic) ? k.shiftPhonetic : k.phonetic;
    if (!char) return;

    if (/^[a-zA-Z]$/.test(char)) {
      dispatchInput('phonetic', char);
    } else {
      dispatchInput('char', char);
    }

    if (isShifted) setIsShifted(false);
  };

  return (
    <div className="w-full flex justify-center bg-gradient-to-br from-[#d1d5db] to-[#9ca3af] p-1.5 pb-8 rounded-t-2xl shadow-2xl font-display select-none transition-all duration-300 border-t border-white/30">
      <div className="w-full xs:w-[98%] sm:w-[95%] max-w-[480px] flex flex-col gap-1.5 min-w-[300px]">
        {tamilRows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
            {row.map((k, i) => {
              const displayLabel = (isShifted && k.kind === 'char' && k.shiftLabel) ? k.shiftLabel : (k.kind === 'char' ? k.label : '');
              const secondaryLabel = (isShifted && k.kind === 'char' && k.shiftLabel) ? k.label : (k.kind === 'char' ? k.shiftLabel : '');
              const customColor = getDynamicColor(k);

              const keyBase = `
                flex flex-col h-[clamp(42px,12.5vw,52px)] items-center justify-center rounded-lg relative overflow-hidden transition-all 
                active:translate-y-0.5 active:shadow-none select-none border-[0.5px]
                shadow-[0_clamp(1.5px,0.5vw,3px)_0_0_#a8a29e]
                ${customColor}
                ${k.kind === 'icon' && k.action === 'shift' && isShifted ? 'ring-2 ring-primary ring-inset' : ''}
              `;

              if (k.kind === 'icon') {
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => onKeyClick(k)}
                    className={`${keyBase} bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1] text-header-brown/80`}
                  >
                    <span className="material-symbols-outlined text-[clamp(1.1rem,4vw,1.4rem)]">{k.icon}</span>
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onKeyClick(k)}
                  className={keyBase}
                >
                  <div className="flex flex-col items-center justify-center gap-[0.1rem] sm:gap-[0.2rem] w-full">
                    {secondaryLabel && (
                      <span className="text-[clamp(0.55rem,2.2vw,0.7rem)] font-bold text-header-brown/60 leading-none">
                        {secondaryLabel}
                      </span>
                    )}
                    <span className={`text-[clamp(0.85rem,3.8vw,1.1rem)] font-extrabold leading-none text-slate-900 ${secondaryLabel ? '' : 'mt-1'}`}>
                      {displayLabel === '▢▢' ? '' : displayLabel}
                    </span>
                    {displayLabel === '▢▢' && (
                      <div className="flex gap-0.5 opacity-20">
                        <div className="w-2 h-2 border border-black rounded-[1px]"></div>
                        <div className="w-2 h-2 border border-black rounded-[1px]"></div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}

        {/* Bottom row matches laptop greyish system keys */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full pt-1">
          <button
            type="button"
            className="flex h-[48px] items-center justify-center rounded-lg bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1] text-header-brown/80 text-[clamp(0.7rem,3vw,0.85rem)] font-bold shadow-[0_2px_0_0_#a8a29e] active:translate-y-0.5 active:shadow-none"
          >
            123
          </button>

          <button
            type="button"
            className="flex h-[48px] items-center justify-center rounded-lg bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1] text-header-brown/80 shadow-[0_2px_0_0_#a8a29e] active:translate-y-0.5 active:shadow-none"
          >
            <span className="material-symbols-outlined text-[clamp(1.1rem,4vw,1.3rem)]">mic</span>
          </button>

          <button
            type="button"
            onClick={() => dispatchInput('char', ' ')}
            style={{ gridColumn: 'span 3' }}
            className="flex h-[48px] items-center justify-center rounded-lg bg-gradient-to-b from-[#fafaf9] to-[#e7e5e4] border-[#d6d3d1] text-header-brown/80 text-[clamp(0.8rem,3.5vw,1rem)] font-medium shadow-[0_2px_0_0_#a8a29e] active:translate-y-0.5 active:shadow-none transition-all"
          >
            இடைவெளி
          </button>

          <button
            type="button"
            aria-label="Enter"
            onClick={() => dispatchInput('char', '\n')}
            style={{ gridColumn: 'span 4' }}
            className="flex h-[48px] items-center justify-center rounded-lg bg-header-brown text-white shadow-[0_2px_0_0_#5a2b0a] active:translate-y-0.5 active:shadow-none"
          >
            <span className="material-symbols-outlined text-[clamp(1.3rem,5vw,1.6rem)]">keyboard_return</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileKeyboard;
