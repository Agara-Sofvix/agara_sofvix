import React, { useState, useEffect, useRef } from 'react';
import { processTamilInput, handleTamilBackspace, getTamilGraphemes } from '../tamilEngine';
import { useTextStore } from '../src/store/useTextStore';
import { generateUUID } from '../src/utils/uuid';
import Keyboard from './Keyboard';
import { AppSettings } from '../App';

interface TestAreaProps {
  onComplete: (wpm: number, accuracy: number, stats?: any) => void;
  onReturn?: () => void;
  config?: {
    duration: number;
    module: string;
  };
  activeKeys: Set<string>;
  settings?: AppSettings;
}

const testModules: Record<string, { label: string; category: string }> = {
  'free-typing': { label: 'Free Typing', category: 'free-typing' },
  general: { label: 'General Knowledge', category: 'general' },
  literature: { label: 'Literature', category: 'literature' },
  history: { label: 'History', category: 'history' },
  science: { label: 'Science', category: 'science' },
  social: { label: 'Social Issues', category: 'social' },
  tournament: { label: 'Tournament', category: 'tournament' },
  news: { label: 'News', category: 'news' },
  cinema: { label: 'Cinema', category: 'cinema' },
  election: { label: 'Election', category: 'election' },
};

const TestArea: React.FC<TestAreaProps> = ({ onComplete, onReturn, config, activeKeys, settings }) => {
  const testConfig = config || { duration: 60, module: 'general' };
  const [inputText, setInputText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [currentTextId, setCurrentTextId] = useState<string | undefined>(undefined);
  const [timeLeft, setTimeLeft] = useState(testConfig.duration);
  const [isTestActive, setIsTestActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [lastResult, setLastResult] = useState<{ wpm: number; accuracy: number; errors: number; totalChars: number } | null>(null);
  const [testSessionId] = useState(() => generateUUID());
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const targetDisplayRef = useRef<HTMLDivElement>(null);

  const { fetchTexts, getRandomText, getRandomTextObject, isLoading } = useTextStore();

  useEffect(() => {
    fetchTexts();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      startTest();
    }
  }, [testConfig.module, isLoading]);

  const startTest = () => {
    const moduleId = testConfig.module;
    const category = testModules[moduleId]?.category || moduleId;
    const textObj = getRandomTextObject(category);

    setTargetText(textObj?.content || "");
    setCurrentTextId(textObj?._id);
    setInputText("");
    setTimeLeft(testConfig.duration);
    setIsTestActive(true);
    setStartTime(null);
    setIsGameOver(false);
    setLastResult(null);
  };

  useEffect(() => {
    if (isTestActive && !isGameOver && targetText && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  }, [isTestActive, isGameOver, targetText]);

  // Bug 32: Pause timer when user switches tabs
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTestActive && !isGameOver) {
        setIsPaused(true);
      } else {
        setIsPaused(false);
        // Re-focus input when returning
        if (inputRef.current) inputRef.current.focus({ preventScroll: true });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTestActive, isGameOver]);

  // Bug 31: Auto-save progress to sessionStorage for network disconnect recovery
  useEffect(() => {
    if (isTestActive && inputText.length > 0) {
      sessionStorage.setItem('ezhuthidu_test_progress', JSON.stringify({
        inputText,
        targetText,
        timeLeft,
        testSessionId,
        currentTextId,
        module: testConfig.module,
        savedAt: Date.now()
      }));
    }
  }, [inputText, timeLeft]);

  // Clear saved progress on test completion
  useEffect(() => {
    if (isGameOver) {
      sessionStorage.removeItem('ezhuthidu_test_progress');
    }
  }, [isGameOver]);

  useEffect(() => {
    let timer: number;
    if (isTestActive && !isPaused && timeLeft > 0 && targetText) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestActive, isPaused, timeLeft, targetText]);

  // Sync target text display scroll with current progress
  useEffect(() => {
    if (targetDisplayRef.current) {
      const activeChar = targetDisplayRef.current.querySelector('.char-current');
      if (activeChar) {
        activeChar.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [inputText]);

  // Handle textarea auto-scroll to keep cursor visible
  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      const isAtEnd = textarea.selectionStart >= inputText.length - 1;
      if (isAtEnd) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [inputText]);

  useEffect(() => {
    const handleMobileInput = (e: Event) => {
      // Bug 33: try-catch guard to prevent crash from rapid mobile input
      try {
        if (!isTestActive || isGameOver || isPaused) return;

        const customEvent = e as CustomEvent;
        const { type, value, activeBase: isActiveBaseDelete } = customEvent.detail;

        const start = inputRef.current?.selectionStart || inputText.length;
        const end = inputRef.current?.selectionEnd || inputText.length;

        if (!startTime) setStartTime(Date.now());

        let newText = inputText;

        if (type === 'char') {
          const char = value;
          newText = inputText.slice(0, start) + char + inputText.slice(start);
          setInputText(newText);
          const newPos = start + char.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = newPos;
            }
          }, 0);
        } else if (type === 'phonetic') {
          const key = value;
          const result = processTamilInput(inputText, key, start);
          newText = result.text;
          setInputText(newText);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = result.newCursorPos;
            }
          }, 0);
        } else if (type === 'replace') {
          const char = value;
          const graphemes = getTamilGraphemes(inputText.slice(0, start));
          const lastGrapheme = graphemes[graphemes.length - 1] || "";
          const replaceLen = lastGrapheme.length;

          newText = inputText.slice(0, start - replaceLen) + char + inputText.slice(start);
          setInputText(newText);
          const newPos = start - replaceLen + char.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = newPos;
            }
          }, 0);
        } else if (type === 'backspace') {
          if (isActiveBaseDelete) {
            newText = inputText.slice(0, start - 1) + inputText.slice(start);
            setInputText(newText);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.selectionStart = inputRef.current.selectionEnd = start - 1;
              }
            }, 0);
          } else {
            const result = handleTamilBackspace(inputText, start, end);
            newText = result.text;
            setInputText(newText);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.selectionStart = inputRef.current.selectionEnd = result.newCursorPos;
              }
            }, 0);
          }
        }

        // Check for next paragraph
        const inputGraphemesCount = getTamilGraphemes(newText).length;
        const targetGraphemesCount = getTamilGraphemes(targetText).length;

        if (inputGraphemesCount >= targetGraphemesCount) {
          setTargetText(prev => {
            const currentTargetGraphemesCount = getTamilGraphemes(prev).length;
            if (inputGraphemesCount >= currentTargetGraphemesCount) {
              const nextPara = getRandomText(testModules[testConfig.module].category, prev.split(' ').pop() || "");
              return prev.trimEnd() + " " + nextPara;
            }
            return prev;
          });
        }
      } catch (err) {
        console.warn('Mobile input handler error:', err);
      }
    };

    window.addEventListener('mobile-keyboard-input', handleMobileInput);
    return () => window.removeEventListener('mobile-keyboard-input', handleMobileInput);
  }, [inputText, startTime, isTestActive, isGameOver, isPaused, targetText, testConfig.module]);

  const endTest = () => {
    setIsTestActive(false);
    setIsGameOver(true);

    const inputGraphemes = getTamilGraphemes(inputText);
    const targetGraphemes = getTamilGraphemes(targetText);

    let correctChars = 0;
    const length = Math.min(inputGraphemes.length, targetGraphemes.length);
    for (let i = 0; i < length; i++) {
      if (inputGraphemes[i] === targetGraphemes[i]) correctChars++;
    }

    const totalChars = inputGraphemes.length;
    const errors = totalChars - correctChars;
    const timeInSeconds = testConfig.duration;

    const { finalScore, accuracy } = calculateResult({
      totalChars: totalChars,
      correctChars: correctChars,
      timeInSeconds: timeInSeconds
    });

    setLastResult({
      wpm: finalScore,
      accuracy,
      errors,
      totalChars
    });

    onComplete(finalScore, accuracy, {
      totalChars,
      correctChars,
      wrongChars: errors,
      errors,
      wpm: finalScore,
      accuracy,
      rawTypedText: inputText,
      durationMs: timeInSeconds * 1000,
      testSessionId: testSessionId,
      textId: currentTextId
    });
  };

  const calculateResult = ({ totalChars, correctChars, timeInSeconds }: any) => {
    const accuracyRatio = totalChars > 0 ? (correctChars / totalChars) : 1;
    const accuracy = Math.round(accuracyRatio * 100);

    // Final Score = (Correct Characters / Time Seconds × 60) × (Accuracy ratio)
    const effectiveTime = Math.max(timeInSeconds, 1);
    const finalScore = Math.round((correctChars / effectiveTime * 60) * accuracyRatio);

    return { finalScore, accuracy };
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isTestActive || isGameOver) return;
    if (!startTime) setStartTime(Date.now());

    const key = e.key;
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (key === 'Backspace') {
      e.preventDefault();
      const result = handleTamilBackspace(inputText, start, end);
      setInputText(result.text);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = result.newCursorPos;
        }
      }, 0);
      return;
    }

    if (key.length === 1) {
      e.preventDefault();
      let newText = inputText;
      let newCursor = (start || 0);

      if (/^[a-zA-Z]$/.test(key)) {
        const result = processTamilInput(inputText, key, start || 0);
        newText = result.text;
        newCursor = result.newCursorPos;
      } else {
        newText = inputText.slice(0, start || 0) + key + inputText.slice(end || 0);
        newCursor = (start || 0) + 1;
      }

      setInputText(newText);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = newCursor;
        }
      }, 0);

      // check for next paragraph
      const inputGraphemesCount = getTamilGraphemes(newText).length;
      const targetGraphemesCount = getTamilGraphemes(targetText).length;

      if (inputGraphemesCount >= targetGraphemesCount) {
        setTargetText(prev => {
          const currentTargetGraphemesCount = getTamilGraphemes(prev).length;
          if (inputGraphemesCount >= currentTargetGraphemesCount) {
            const nextPara = getRandomText(testModules[testConfig.module].category, prev.split(' ').pop() || "");
            return prev.trimEnd() + " " + nextPara;
          }
          return prev;
        });
      }
    }
  };

  const targetGraphemes = getTamilGraphemes(targetText);
  const inputGraphemes = getTamilGraphemes(inputText);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver && lastResult) {
    return (
      <div className="w-full max-w-4xl mx-auto py-12 animate-in fade-in zoom-in duration-500">
        <div className="bg-cream-light/50 border-4 border-slate-100 rounded-[50px] p-12 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-header-brown/5 rounded-bl-full pointer-events-none"></div>

          <div className="mb-10">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
              <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Mission Accomplished!</h2>
            <p className="text-slate-600 font-bold mt-2">Your official typing evaluation is complete.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-cream-light/50 rounded-[2.5rem] p-8 shadow-inner border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block text-slate-800">Performance Score</span>
              <div className="text-4xl font-black text-header-brown">{lastResult.wpm} <span className="text-xs opacity-40">PTS</span></div>
            </div>
            <div className="bg-cream-light/50 rounded-[2.5rem] p-8 shadow-inner border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block text-slate-800">Overall Accuracy</span>
              <div className="text-4xl font-black text-green-600">{lastResult.accuracy}%</div>
            </div>
            <div className="bg-cream-light/50 rounded-[2.5rem] p-8 shadow-inner border border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 block text-slate-800">Precision Errors</span>
              <div className="text-4xl font-black text-red-600">{lastResult.errors}</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={startTest}
              className="w-full sm:w-[260px] h-16 bg-header-brown text-white rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined">refresh</span>
              Try New Mission
            </button>
            <button
              onClick={() => {
                if (onReturn) {
                  onReturn();
                } else {
                  window.location.reload();
                }
              }}
              className="w-full sm:w-[260px] h-16 bg-warm-bg text-header-brown rounded-2xl font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border border-header-brown/20"
            >
              <span className="material-symbols-outlined">dashboard</span>
              Return to Base
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !targetText && isTestActive) {
    return (
      <div className="w-full max-w-2xl mx-auto py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-sm border-2 border-slate-100 rounded-[40px] p-12 shadow-xl">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-amber-500">error_outline</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">No Content Available</h2>
          <p className="text-slate-600 mb-8 font-tamil">இந்தத் தலைப்பில் இன்னும் உள்ளடக்கங்கள் இல்லை. விரைவில் சேர்க்கப்படும்!</p>
          <button
            onClick={onReturn}
            className="px-8 py-3 bg-header-brown text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Choose Another Topic
          </button>
        </div>
      </div>
    );
  }

  const moduleInfo = testModules[testConfig.module];
  const moduleLabel = moduleInfo ? moduleInfo.label : testConfig.module.charAt(0).toUpperCase() + testConfig.module.slice(1);

  return (
    <div className="w-full mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 font-tamil">
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-header-brown animate-pulse text-base">timer</span>
            <h2 className="text-xl font-black text-header-brown uppercase tracking-tight">Active Test</h2>
          </div>
          <p className="text-[10px] font-bold text-header-brown/60 uppercase tracking-widest ml-7">Section: {moduleLabel}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-1.5 rounded-xl flex items-center gap-3 shadow-lg transition-all duration-300 ${timeLeft < 10 ? 'bg-red-500 text-white animate-bounce' : 'bg-header-brown text-white'}`}>
            <span className="material-symbols-outlined text-base">schedule</span>
            <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      <div
        ref={targetDisplayRef}
        className="bg-cream-light rounded-[1.5rem] md:rounded-[2.5rem] p-3 sm:p-4 md:p-5 paper-shadow border border-slate-100 font-tamil w-full h-[80px] md:h-[110px] overflow-y-auto scroll-smooth"
      >
        <p className="text-lg sm:text-xl md:text-2xl font-tamil leading-relaxed sm:leading-[1.6] md:leading-[2.0] tracking-wide text-justify">
          {targetGraphemes.map((char, i) => {
            if (char === '\n') return <br key={i} />;
            let className = "inline ";
            if (i < inputGraphemes.length) {
              className += inputGraphemes[i] === char ? "text-[#15803d]" : "text-[#b91c1c] bg-[#fee2e2] rounded-[2px]";
            } else if (i === inputGraphemes.length) {
              className += "char-current bg-blue-50 border-b-2 border-blue-600";
            }
            return <span key={i} className={className}>{char}</span>;
          })}
        </p>
      </div>

      {/* Typing Area - Paper Style */}
      <div className="max-w-full mx-auto w-full">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/50 shadow-xl sm:shadow-2xl relative overflow-hidden h-[120px] sm:h-[150px] md:h-[180px]">
          <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-header-brown to-primary opacity-60"></div>
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={() => { }}
            onKeyDown={handleKeyDown}
            onPaste={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            placeholder={isTestActive ? (isPaused ? "⏸ Paused — return to this tab to continue" : "") : "Starting mission..."}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-form-type="other"
            data-lpignore="true"
            aria-autocomplete="none"
            className="w-full h-full border-none focus:ring-0 p-0 text-xl sm:text-2xl md:text-3xl font-tamil text-left resize-none bg-transparent text-slate-800 placeholder-slate-200 selection:bg-primary/10"
          // autoFocus handled by useEffect with preventScroll: true
          />
          <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pointer-events-none transition-opacity opacity-50">Continuous flow enabled</div>
        </div>
      </div>

      {/* Standardized Keyboard Container */}
      <div className="w-full bg-transparent flex flex-col items-center pt-2 sm:pt-4 pb-4 sm:pb-8 px-2 sm:px-4 no-print">
        <div className="w-full transition-all duration-300">
          <Keyboard activeKeys={activeKeys} settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default TestArea;