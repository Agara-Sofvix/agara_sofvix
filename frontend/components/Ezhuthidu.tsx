
import React, { useState, useRef, useEffect } from 'react';
import Keyboard from './Keyboard';
import { AppSettings } from '../App';
import { processTamilInput, handleTamilBackspace, getTamilGraphemes } from '../tamilEngine';

interface EzhuthiduProps {
  settings?: AppSettings;
  activeKeys?: Set<string>;
}

const Ezhuthidu: React.FC<EzhuthiduProps> = ({ settings, activeKeys }) => {
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [keyboardExtraOffset, setKeyboardExtraOffset] = useState(0);

  useEffect(() => {
    const handleMobileInput = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, value } = customEvent.detail;
      const start = textareaRef.current?.selectionStart || content.length;

      if (type === 'char') {
        const char = value;
        const newText = content.slice(0, start) + char + content.slice(start);
        setContent(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + char.length;
          }
        }, 0);
      } else if (type === 'replace') {
        const char = value;
        const graphemes = getTamilGraphemes(content.slice(0, start));
        const lastGrapheme = graphemes[graphemes.length - 1];
        const newText = content.slice(0, start - (lastGrapheme?.length || 0)) + char + content.slice(start);
        setContent(newText);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start - (lastGrapheme?.length || 0) + char.length;
          }
        }, 0);
      } else if (type === 'phonetic') {
        const key = value;
        const result = processTamilInput(content, key, start);
        setContent(result.text);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = result.newCursorPos;
          }
        }, 0);
      } else if (type === 'backspace') {
        const result = handleTamilBackspace(content, start, start);
        setContent(result.text);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = result.newCursorPos;
          }
        }, 0);
      }
    };

    window.addEventListener('mobile-keyboard-input', handleMobileInput);
    return () => window.removeEventListener('mobile-keyboard-input', handleMobileInput);
  }, [content]);

  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const key = e.key;
    const target = e.currentTarget;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;

    // Handle Backspace
    if (key === 'Backspace') {
      e.preventDefault();
      const result = handleTamilBackspace(content, start, end);
      setContent(result.text);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = result.newCursorPos;
        }
      }, 0);
      return;
    }

    // Handle Enter/New Line
    if (key === 'Enter') {
      e.preventDefault();
      const newText = content.slice(0, start) + '\n' + content.slice(end);
      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 1;
        }
      }, 0);
      return;
    }

    // Handle character input
    if (key.length === 1) {
      e.preventDefault();
      let newText = content;
      let newCursor = start;

      if (/^[a-zA-Z]$/.test(key)) {
        const result = processTamilInput(content, key, start);
        newText = result.text;
        newCursor = result.newCursorPos;
      } else {
        newText = content.slice(0, start) + key + content.slice(end);
        newCursor = start + 1;
      }

      setContent(newText);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = newCursor;
        }
      }, 0);
    }
  };

  const handleDownloadPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      const element = document.createElement('div');
      element.style.padding = '50px';
      element.style.width = '800px';
      element.style.backgroundColor = '#ffffff';
      element.style.color = '#1a1a1a';
      element.style.fontFamily = 'Tamil-Regular, Lexend, sans-serif';

      const header = document.createElement('div');
      header.style.marginBottom = '30px';
      header.style.borderBottom = '1px solid #e2e8f0';
      header.style.paddingBottom = '15px';

      const h1 = document.createElement('h1');
      h1.innerText = title || 'எழுத்திடு ஆவணம்';
      h1.style.fontSize = '32px';
      h1.style.fontWeight = '900';
      h1.style.margin = '0';
      h1.style.color = '#92450f';

      const meta = document.createElement('p');
      meta.innerText = `எழுத்திடு மூலம் உருவாக்கப்பட்டது - ${new Date().toLocaleDateString()}`;
      meta.style.fontSize = '10px';
      meta.style.marginTop = '8px';
      meta.style.textTransform = 'uppercase';
      meta.style.letterSpacing = '1px';
      meta.style.opacity = '0.5';

      header.appendChild(h1);
      header.appendChild(meta);

      const body = document.createElement('div');
      body.style.whiteSpace = 'pre-wrap';
      body.style.fontSize = '18px';
      body.style.lineHeight = '1.8';
      body.style.color = '#2d3748';
      body.innerText = content;

      element.appendChild(header);
      element.appendChild(body);

      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${title.trim().replace(/\s+/g, '-') || 'ezhuthidu-doc'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      const html2pdfModule = await import('https://esm.sh/html2pdf.js');
      const html2pdf = html2pdfModule.default;

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      window.print();
    } finally {
      setIsExporting(false);
    }
  };


  // Simplified Auto-scroll logic: ensures the line being typed is always visible in the bounded viewport
  useEffect(() => {
    if (textareaRef.current && scrollContainerRef.current) {
      const textarea = textareaRef.current;
      const container = scrollContainerRef.current;

      const { selectionStart } = textarea;
      const textBeforeCursor = content.substring(0, selectionStart);
      const linesBeforeCursor = textBeforeCursor.split('\n').length;
      const lineHeight = 32;
      const cursorY = linesBeforeCursor * lineHeight;

      const containerHeight = container.clientHeight;
      const scrollY = container.scrollTop;

      // Ensure cursor stays in middle view
      if (cursorY > scrollY + containerHeight - 80 || cursorY < scrollY + 80) {
        container.scrollTo({
          top: cursorY - (containerHeight / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [content]);

  const wordCount = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;

  return (
    <div className="flex-1 flex flex-col bg-warm-bg overflow-hidden font-display relative min-w-[300px]">
      {/* TOOLBELT PILL CONTAINER - Responsive for all screen sizes */}
      <div className="flex-none flex justify-center px-2 xs:px-3 sm:px-4 pt-2 xs:pt-3 sm:pt-4 pb-1 xs:pb-2 no-print z-10">
        <div className="flex items-center gap-1 xs:gap-2 sm:gap-3 bg-cream-light/50 backdrop-blur-md px-2 xs:px-3 sm:px-4 md:px-6 py-1.5 xs:py-2 rounded-full border border-slate-200 shadow-inner max-w-full overflow-x-auto scrollbar-hide">
          {/* PDF & Keyboard Controls */}
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 px-1 xs:px-2 text-slate-400">
            <button onClick={handleDownloadPDF} disabled={isExporting} className="p-0.5 xs:p-1 hover:text-slate-800 transition-colors disabled:opacity-50" title="Export PDF">
              <span className="material-symbols-outlined text-base xs:text-lg sm:text-xl leading-none">picture_as_pdf</span>
            </button>
            <button
              onClick={() => setShowKeyboard(!showKeyboard)}
              className={`p-0.5 xs:p-1 transition-colors ${showKeyboard ? 'text-header-brown' : 'hover:text-slate-800'}`}
              title={showKeyboard ? "Hide Keyboard" : "Show Keyboard"}
            >
              <span className="material-symbols-outlined text-base xs:text-lg sm:text-xl leading-none">{showKeyboard ? 'keyboard_hide' : 'keyboard'}</span>
            </button>
          </div>

          {/* Document Title Input - Hidden on very small screens */}
          <div className="hidden xs:flex items-center gap-2 px-1 xs:px-2 sm:px-3">
            <input
              type="text"
              className="bg-transparent border-none focus:ring-0 p-0 text-[9px] xs:text-[10px] sm:text-[11px] font-black text-slate-500 uppercase tracking-widest placeholder-slate-300 w-20 xs:w-24 sm:w-32"
              placeholder="தலைப்பில்லாத ஆவணம்"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* SCROLLABLE PAPER AREA - Responsive padding and sizing */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-transparent scroll-smooth px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 4xl:px-20 5xl:px-24 pb-4 xs:pb-8 sm:pb-12 md:pb-16 lg:pb-20 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-full xs:max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl 4xl:max-w-8xl 5xl:max-w-9xl mx-auto py-1 xs:py-2">
          <div className="bg-white rounded-xl xs:rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 2xl:p-16 3xl:p-20 4xl:p-24 5xl:p-28 min-h-[400px] xs:min-h-[500px] sm:min-h-[600px] md:min-h-[800px] lg:min-h-[1000px] xl:min-h-[1100px] 2xl:min-h-[1200px] 3xl:min-h-[1400px] 4xl:min-h-[1600px] 5xl:min-h-[1800px] border border-slate-200/50 shadow-xl xs:shadow-2xl sm:shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 xs:h-1.5 2xl:h-2 bg-gradient-to-r from-header-brown to-primary opacity-60"></div>
            <textarea
              ref={textareaRef}
              autoFocus
              className="w-full min-h-[350px] xs:min-h-[450px] sm:min-h-[550px] md:min-h-[750px] lg:min-h-[950px] xl:min-h-[1050px] 2xl:min-h-[1100px] 3xl:min-h-[1300px] 4xl:min-h-[1500px] 5xl:min-h-[1700px] border-none focus:ring-0 p-0 text-base xs:text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-3xl 3xl:text-4xl 4xl:text-5xl 5xl:text-6xl leading-relaxed font-tamil resize-none text-slate-800 placeholder-slate-200 selection:bg-primary/10 bg-transparent"
              placeholder="இங்கே எழுதத் தொடங்குங்கள்..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleEditorKeyDown}
            />
          </div>
        </div>
      </div>

      {/* KEYBOARD CONTAINER - Responsive width and padding */}
      {showKeyboard && (
        <div className="flex-none w-full bg-slate-900/5 rounded-2xl p-2 flex items-center justify-center no-print mt-2">
          <div className="w-full flex justify-center py-2 transition-all duration-300">
            <Keyboard activeKeys={activeKeys} settings={settings} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Ezhuthidu;
