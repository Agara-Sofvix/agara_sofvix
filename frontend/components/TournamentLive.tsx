import React, { useState, useEffect, useRef } from 'react';
import Keyboard from './Keyboard';
import { processTamilInput, handleTamilBackspace, getTamilGraphemes } from '../tamilEngine';
import { AppSettings } from '../App';
import { useTextStore } from '../src/store/useTextStore';

interface TournamentLiveProps {
  onComplete: (wpm: number, accuracy: number, extra: {
    errors: number;
    totalChars: number;
    correctChars: number;
    wrongChars: number;
    timeTaken: string;
    submissionType: 'Manual' | 'Auto';
    rawTypedText: string;
    durationMs: number;
    testSessionId: string;
  }) => void;
  displayName: string;
  activeKeys?: Set<string>;
  settings?: AppSettings;
  activeTournament?: any;
}

const TournamentLive: React.FC<TournamentLiveProps> = ({ onComplete, displayName, activeKeys, settings, activeTournament }) => {
  const [inputText, setInputText] = useState("");
  const [targetText, setTargetText] = useState("");
  const [originalTargetText, setOriginalTargetText] = useState("");
  const [timeLeft, setTimeLeft] = useState(300);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [violations, setViolations] = useState(0);
  const [testSessionId] = useState(() => crypto.randomUUID());

  const { fetchTexts, getRandomText, isLoading } = useTextStore();
  const [isFetchingText, setIsFetchingText] = useState(false);

  useEffect(() => {
    const loadTournamentText = async () => {
      if (activeTournament?.textContent) {
        setIsFetchingText(true);
        try {
          const { getTamilTextById } = await import('../src/services/api');
          const textObj = await getTamilTextById(activeTournament.textContent);

          if (textObj && textObj.content) {
            setTargetText(textObj.content);
            setOriginalTargetText(textObj.content);
          } else {
            console.error("Fetched text object is invalid or empty");
            setTargetText("");
          }
        } catch (err) {
          console.error("Failed to fetch tournament text by ID", err);
          setTargetText("");
        } finally {
          setIsFetchingText(false);
        }
      } else {
        // No explicit textContent, leave as empty which will show the "No Content" state
        setTargetText("");
      }
    };

    loadTournamentText();
  }, [activeTournament]);

  // NO LONGER falling back to random tournament texts below


  const inputRef = useRef<HTMLTextAreaElement>(null);
  const targetDisplayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMobileInput = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { type, value } = customEvent.detail;
      const start = inputRef.current?.selectionStart || inputText.length;

      if (!isStarted) setIsStarted(true);
      if (!startTime) setStartTime(Date.now());

      let newText = inputText;

      if (type === 'char') {
        const char = value;
        newText = inputText.slice(0, start) + char + inputText.slice(start);
        setInputText(newText);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = start + char.length;
          }
        }, 0);
      } else if (type === 'replace') {
        const char = value;
        const graphemes = getTamilGraphemes(inputText.slice(0, start));
        const lastGrapheme = graphemes[graphemes.length - 1];
        newText = inputText.slice(0, start - (lastGrapheme?.length || 0)) + char + inputText.slice(start);
        setInputText(newText);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = start - (lastGrapheme?.length || 0) + char.length;
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
      } else if (type === 'backspace') {
        const result = handleTamilBackspace(inputText, start, start);
        newText = result.text;
        setInputText(newText);
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = result.newCursorPos;
          }
        }, 0);
      }

      // Check for next paragraph
      const inputGraphemesCount = getTamilGraphemes(newText).length;
      const targetGraphemesCount = getTamilGraphemes(targetText).length;

      if (inputGraphemesCount >= targetGraphemesCount) {
        setTargetText(prev => {
          const currentTargetGraphemes = getTamilGraphemes(prev);
          if (inputGraphemesCount >= currentTargetGraphemes.length) {
            // Loop the original text continuously until time ends
            return prev.trimEnd() + " " + originalTargetText.trim();
          }
          return prev;
        });
      }
    };

    window.addEventListener('mobile-keyboard-input', handleMobileInput);
    return () => window.removeEventListener('mobile-keyboard-input', handleMobileInput);
  }, [inputText, isStarted, startTime, isFinished, targetText]);

  const maskedId = displayName ? `${displayName[0]}${'*'.repeat(Math.max(0, displayName.length - 1))}` : "USR_****";

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isStarted && !isFinished) {
        setViolations(prev => {
          const next = prev + 1;
          if (next >= 2) {
            handleFinish('Auto');
          } else {
            alert("Security Alert: Tournament focus lost. One more violation will result in automatic submission.");
          }
          return next;
        });
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStarted && !isFinished) {
        e.preventDefault();
        e.returnValue = "Tournament in progress. Leaving will count as automatic submission.";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isStarted, isFinished]);

  useEffect(() => {
    let timer: number;
    if (isStarted && !isFinished && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinish('Auto');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isStarted, isFinished, timeLeft]);

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

  const handleFinish = (subType: 'Manual' | 'Auto' = 'Manual') => {
    if (isFinished) return;
    setIsFinished(true);

    const inputGraphemes = getTamilGraphemes(inputText);
    const targetGraphemes = getTamilGraphemes(targetText);

    const timeTakenValue = 300 - timeLeft;
    const minutes = Math.max(timeTakenValue / 60, 0.1);

    let correctCount = 0;
    const length = Math.min(inputGraphemes.length, targetGraphemes.length);
    for (let i = 0; i < length; i++) {
      if (inputGraphemes[i] === targetGraphemes[i]) correctCount++;
    }

    const totalChars = inputGraphemes.length;
    const errors = totalChars - correctCount;

    // Accuracy as a decimal (0 to 1)
    const accuracyRatio = totalChars > 0 ? (correctCount / totalChars) : 1;
    const accuracyPercent = Math.round(accuracyRatio * 100);

    // Score = (Correct Characters / Time Seconds * 60) * (Correct Characters / Total Typed Characters)
    // Using timeTakenValue (seconds), if 0, use 1 to avoid division by zero
    const effectiveTime = Math.max(timeTakenValue, 1);
    const finalScore = Math.round((correctCount / effectiveTime * 60) * accuracyRatio);

    // We'll treat this finalScore as the "WPM" (Result) as requested
    const displayWPM = finalScore;

    onComplete(displayWPM, accuracyPercent, {
      errors: errors,
      totalChars: totalChars,
      correctChars: correctCount,
      wrongChars: errors,
      timeTaken: formatTime(timeTakenValue),
      submissionType: subType,
      rawTypedText: inputText,
      durationMs: timeTakenValue * 1000,
      testSessionId: testSessionId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isFinished) return;
    if (!isStarted) setIsStarted(true);
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
            // Loop the original text continuously until time ends
            return prev.trimEnd() + " " + originalTargetText.trim();
          }
          return prev;
        });
      }
    }
  };

  const targetGraphemes = getTamilGraphemes(targetText);
  const inputGraphemes = getTamilGraphemes(inputText);

  const currentStats = (() => {
    let correctCount = 0;
    const length = Math.min(inputGraphemes.length, targetGraphemes.length);
    for (let i = 0; i < length; i++) {
      if (inputGraphemes[i] === targetGraphemes[i]) correctCount++;
    }
    const total = inputGraphemes.length;
    const acc = total > 0 ? Math.round((correctCount / total) * 100) : 100;
    return { accuracy: acc, errors: total - correctCount, chars: total };
  })();

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="xs:text-xs min-h-screen bg-warm-bg text-slate-900 flex flex-col animate-in fade-in duration-1000 select-none font-tamil"
      onContextMenu={(e) => e.preventDefault()}
    >
      <header className="bg-header-brown border-b border-black/5 xs:px-4 px-6 sm:px-12 py-2 sm:py-4 flex items-center justify-between sticky top-0 z-50 shadow-md rounded-t-3xl transition-all">
        <div className="flex flex-col">
          <h1 className="xs:text-[9px] text-xs sm:text-lg lg:text-xl font-black text-white uppercase tracking-widest leading-none">{activeTournament?.name || "Elite Championship"}</h1>
          <span className="xs:text-[8px] text-[10px] sm:text-xs lg:text-sm font-bold text-white/50 uppercase mt-1">{activeTournament?.subheading || "Official Competition Sprint"}</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className={`xs:text-base text-2xl sm:text-3xl lg:text-5xl font-black tabular-nums transition-colors duration-300 text-white ${timeLeft < 20 ? 'text-red-300' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          {isStarted && !isFinished && (
            <button
              onClick={() => handleFinish('Manual')}
              className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 no-print"
            >
              Finish & Submit
            </button>
          )}
        </div>

        <div className="flex items-center gap-6 text-right text-white">
          <div className="flex flex-col text-right">
            <span className="xs:text-[8px] text-[9px] sm:text-xs lg:text-xs font-black uppercase tracking-tighter opacity-40">Attempt</span>
            <span className="xs:text-xs text-sm sm:text-base lg:text-lg font-bold">1 / 1</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="xs:text-[8px] text-[9px] sm:text-xs lg:text-xs font-black uppercase tracking-tighter opacity-40">User Identity</span>
            <span className="xs:text-xs text-sm sm:text-base lg:text-lg font-bold font-mono">{maskedId}</span>
          </div>
        </div>
      </header>

      <div className="flex-grow w-full flex flex-col items-center xs:py-2 py-8 overflow-y-auto">
        <div className="w-full xl:w-[76%] 2xl:w-[70%] 3xl:w-[76%] mx-auto flex flex-col items-center xs:gap-2 gap-8 px-4 sm:px-0">
          <div
            ref={targetDisplayRef}
            className="w-full bg-cream-light rounded-[1.5rem] sm:rounded-[2.5rem] p-3 sm:p-4 md:p-5 paper-shadow border border-slate-100 font-tamil h-[80px] md:h-[110px] overflow-y-auto scroll-smooth animate-in slide-in-from-top-4 duration-700"
          >
            <p className="text-lg sm:text-xl md:text-2xl font-tamil leading-relaxed sm:leading-[1.6] md:leading-[2.0] tracking-wide text-justify">
              {!targetText && !isFetchingText ? (
                <span className="text-slate-400 font-bold opacity-60">No tournament content provided by admin. Please wait for an update.</span>
              ) : (
                targetGraphemes.map((char, i) => {
                  if (char === '\n') return <br key={i} />;
                  let className = "inline ";
                  if (i < inputGraphemes.length) {
                    className += inputGraphemes[i] === char ? "text-[#15803d]" : "text-[#b91c1c] bg-[#fee2e2] rounded-[2px]";
                  } else if (i === inputGraphemes.length) {
                    className += "char-current bg-header-brown/10 border-b-2 border-header-brown";
                  }
                  return <span key={i} className={className}>{char}</span>;
                })
              )}
            </p>
          </div>

          {/* Typing Area - Paper Style */}
          <div className="w-full">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-200/50 shadow-xl sm:shadow-2xl relative overflow-hidden h-[120px] sm:h-[150px] md:h-[180px]">
              <div className="absolute top-0 left-0 right-0 h-1 sm:h-1.5 bg-gradient-to-r from-header-brown to-primary opacity-60"></div>
              <textarea
                ref={inputRef}
                autoFocus
                spellCheck={false}
                onPaste={(e) => e.preventDefault()}
                onContextMenu={(e) => e.preventDefault()}
                onKeyDown={handleKeyDown}
                readOnly={isFinished || !targetText}
                value={inputText}
                placeholder={isStarted ? "" : !targetText ? "Waiting for content..." : "Start typing to begin the tournament..."}
                className="w-full h-full border-none focus:ring-0 p-0 text-xl sm:text-2xl md:text-3xl font-tamil text-left resize-none bg-transparent text-slate-800 placeholder-slate-200 selection:bg-primary/10"
              />
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] pointer-events-none transition-opacity opacity-50">Continuous typing mode active</div>
              {isFinished && (
                <div className="absolute inset-0 bg-white/95 flex items-center justify-center rounded-2xl sm:rounded-3xl z-20 border border-header-brown/20">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-header-brown mb-2 animate-spin">sync</span>
                    <h2 className="text-2xl font-black uppercase tracking-widest text-slate-900">Processing Result</h2>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full bg-cream-light/50 py-2 sm:py-4 px-4 sm:px-10 rounded-xl sm:rounded-2xl border border-slate-100 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-black">Accuracy</span>
                <span className="xs:text-xs text-xl font-black text-green-600">{currentStats.accuracy}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-black">Errors</span>
                <span className="xs:text-xs text-xl font-black text-red-600">{currentStats.errors}</span>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1 text-black">Total Typed</span>
              <span className="xs:text-xs text-xl font-black text-black">{currentStats.chars}</span>
            </div>
          </div>
        </div>

        {/* Standardized Keyboard Container */}
        <div className="w-full bg-transparent flex flex-col items-center pt-2 sm:pt-4 pb-4 sm:pb-8 px-2 sm:px-4 no-print">
          <div className="w-full xl:w-[76%] 2xl:w-[70%] 3xl:w-[76%] max-w-[2400px] transition-all duration-300">
            <Keyboard activeKeys={activeKeys || new Set()} settings={settings} />
          </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 xs:px-2 px-4 xs:py-1 py-1.5 rounded-full bg-red-600/10 border border-red-600/20 xs:text-[8px] text-[9px] font-black uppercase tracking-widest text-red-600">
        <span className="material-symbols-outlined text-xs">shield_lock</span>
        Secure Protocol Active • Violations: {violations}/2
      </div>
    </div>
  );
};

export default TournamentLive;