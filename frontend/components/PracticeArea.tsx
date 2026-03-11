import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Keyboard from './Keyboard';
import { AppSettings } from '../src/types';
import { processTamilInput, handleTamilBackspace, getTamilGraphemes, isPotentialMatch } from '../tamilEngine';
import { useTextStore } from '../src/store/useTextStore';
import { keyboardPracticeData, practiceSchedule, motivationTips, COMPOUND_SERIES } from '../src/data/keyboard_practice_data';
import { generateUUID } from '../src/utils/uuid';

type Mode = 'free' | 'lesson' | 'custom';

interface Lesson {
  id: string;
  char: string;
  text: string;
}

interface Category {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  lessons: Lesson[];
}

interface PracticeAreaProps {
  onComplete?: (wpm: number, accuracy: number, extra: {
    rawTypedText: string;
    durationMs: number;
    testSessionId: string;
    textId?: string;
  }) => void;
  settings?: AppSettings;
  activeKeys?: Set<string>;
  initialMode?: Mode;
}

const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'uyir',
    name: 'Vowels (உயிரெழுத்துக்கள்)',
    subtitle: 'LEVEL 01 • 12 CHARACTERS',
    icon: 'அ',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-700',
    lessons: [
      { id: '1', char: 'அ', text: 'அம்மா அப்பா அக்கா அண்ணன்.' },
      { id: '2', char: 'ஆ', text: 'ஆடு ஆமை ஆந்தை ஆரம்.' },
      { id: '3', char: 'இ', text: 'இலை இஞ்சி இட்லி இமயம்.' },
      { id: '4', char: 'ஈ', text: 'ஈசல் ஈட்டி ஈரம் ஈர்ப்பு.' },
      { id: '5', char: 'உ', text: 'உப்பு உணவு உலகம் உருளை.' },
      { id: '6', char: 'ஊ', text: 'ஊசி ஊர்தி ஊஞ்சல் ஊக்கம்.' },
      { id: '7', char: 'எ', text: 'எறும்பு எலி எட்டு எருது.' },
      { id: '8', char: 'ஏ', text: 'ஏணி ஏடு ஏரி ஏலக்காய்.' },
      { id: '9', char: 'ஐ', text: 'ஐந்து ஐம்பது ஐயம் ஐயப்பன்.' },
      { id: '10', char: 'ஒ', text: 'ஒட்டகம் ஒன்பது ஒன்று ஒமேகா.' },
      { id: '11', char: 'ஓ', text: 'ஓநாய் ஓட்டம் ஓலை ஓடு.' },
      { id: '12', char: 'ஔ', text: 'ஔவையார் ஔடதம் ஔவியம்.' },
    ]
  },
  {
    id: 'mei',
    name: 'Consonants (மெய்யெழுத்துக்கள்)',
    subtitle: 'LEVEL 02 • 26 CHARACTERS',
    icon: 'க்',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-700',
    lessons: [
      { id: 'mei-1', char: 'க்', text: 'பக்கம் சக்கரம் அக்கா மக்கள்.' },
      { id: 'mei-2', char: 'ங்', text: 'சிங்கம் தங்கம் சங்கம் மங்கை.' },
      { id: 'mei-3', char: 'ச்', text: 'பச்சை அச்சு இச்சை தச்சர்.' },
      { id: 'mei-4', char: 'ஞ்', text: 'பஞ்சு இஞ்சி மஞ்சள் கஞ்சு.' },
      { id: 'mei-5', char: 'ட்', text: 'பட்டம் கட்டம் சட்டம் நட்டம்.' },
      { id: 'mei-6', char: 'ண்', text: 'கண் மண் பெண் எண்.' },
      { id: 'mei-7', char: 'த்', text: 'பந்து ஐந்து தந்தை முந்து.' },
      { id: 'mei-8', char: 'ந்', text: 'நரி நாய் நகம் நட்பு.' },
      { id: 'mei-9', char: 'ப்', text: 'பந்து ஐந்து தந்தை முந்து.' },
      { id: 'mei-10', char: 'ம்', text: 'அம்மா தம்பி தும்பி கும்பி.' },
      { id: 'mei-11', char: 'ய்', text: 'நாய் பாய் வாய் காய்.' },
      { id: 'mei-12', char: 'ர்', text: 'யார் நார் பார் கார்.' },
      { id: 'mei-13', char: 'ல்', text: 'பால் கால் ஆல் மால்.' },
      { id: 'mei-14', char: 'வ்', text: 'வவ் நான்கு வவ் ஐந்து.' },
      { id: 'mei-15', char: 'ழ்', text: 'தமிழ் யாழ் பாழ் கூழ்.' },
      { id: 'mei-16', char: 'ள்', text: 'வாள் தாள் ஆள் கோள்.' },
      { id: 'mei-17', char: 'ற்', text: 'பற்று சுற்று கற்று முற்று.' },
      { id: 'mei-18', char: 'ன்', text: 'அவன் இவன் எவன் அவன்.' },
      { id: 'mei-19', char: 'ஃ', text: 'அஃது எஃகு பஃது.' },
      { id: 'mei-20', char: 'ஹ்', text: 'ஹ் சஹ்ர ஹ்.' },
      { id: 'mei-21', char: 'ஸ்', text: 'பஸ் கிளாஸ் மாஸ்.' },
      { id: 'mei-22', char: 'ஶ்', text: 'ஶ்ரீ ஶ்.' },
      { id: 'mei-23', char: 'ஜ்', text: 'ராஜ் ரோஜா ஜன்னல்.' },
      { id: 'mei-24', char: 'க்ஷ்', text: 'பக்ஷம் லக்ஷ்மி.' },
      { id: 'mei-25', char: 'ஷ்', text: 'புஷ்பம் விஷம் நஷ்டம்.' },
      { id: 'mei-26', char: 'ஸ்ரீ', text: 'ஸ்ரீ ஸ்ரீனிவாசன்.' },
    ]
  },
  {
    id: 'uyirmei',
    name: 'Compound (உயிர்மெய்)',
    subtitle: 'LEVEL 03 • KEY SERIES',
    icon: 'க',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
    lessons: [
      { id: 'um-1', char: 'க', text: 'கப்பல் கடல் கண் கவிதை.' },
      { id: 'um-2', char: 'கா', text: 'காடு காகம் காலம் காற்று.' },
      { id: 'um-3', char: 'கி', text: 'கிளி கிண்ணம் கிளை கிழக்கு.' },
      { id: 'um-4', char: 'கீ', text: 'கீரை கீதம் கீழ் கீரி.' },
      { id: 'um-5', char: 'கு', text: 'குடை குளம் குதிரை குரங்கு.' },
      { id: 'um-6', char: 'கூ', text: 'கூடை கூராய் கூடம் கூட்டம்.' },
      { id: 'um-7', char: 'த', text: 'தம்பி தங்கம் தரை தவம்.' },
      { id: 'um-8', char: 'தா', text: 'தாய் தாரை தாமரை தாரமி.' },
      { id: 'um-9', char: 'தி', text: 'திரை திடம் திங்கள் திதி.' },
      { id: 'um-10', char: 'தீ', text: 'தீரம் தீர்ப்பு தீபம் தீவு.' },
    ]
  }
];

const PracticeArea: React.FC<PracticeAreaProps> = ({ onComplete, settings, activeKeys, initialMode }) => {
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);

  useEffect(() => {
    const newCategories = INITIAL_CATEGORIES.map(cat => {
      if (cat.id === 'uyir') {
        // Vowels: 12 base + 4 random repeats = 16 total
        const baseLessons = [...cat.lessons];

        // Pick 4 random extras to reach 16
        const extras = [...baseLessons].sort(() => Math.random() - 0.5).slice(0, 4).map((l, i) => ({
          ...l,
          id: `${l.id}-extra-${i}` // Ensure unique ID for React keys
        }));

        let finalLessons = [...baseLessons, ...extras];

        // Shuffle and ensure no adjacent duplicates
        // With 12 unique and 16 total (max frequency 2), simple retry works 99.9% of time
        for (let attempt = 0; attempt < 20; attempt++) {
          finalLessons.sort(() => Math.random() - 0.5);
          let hasAdjacent = false;
          for (let i = 0; i < finalLessons.length - 1; i++) {
            if (finalLessons[i].char === finalLessons[i + 1].char) {
              hasAdjacent = true;
              break;
            }
          }
          if (!hasAdjacent) break;
        }

        return { ...cat, subtitle: 'LEVEL 01 • 16 CHARACTERS', lessons: finalLessons };
      } else if (cat.id === 'mei') {
        // Shuffle Consonants and take 16
        const shuffled = [...cat.lessons].sort(() => Math.random() - 0.5).slice(0, 16);
        return { ...cat, subtitle: 'LEVEL 02 • 16 CHARACTERS', lessons: shuffled };
      }
      return cat;
    });
    setCategories(newCategories);
  }, []);

  // Mode-to-hash mapping for URL navigation
  const MODE_TO_HASH: Record<Mode, string> = {
    'lesson': '#lesson',
    'free': '#free',
    'custom': '#custom'
  };

  const HASH_TO_MODE: Record<string, Mode> = {
    '#lesson': 'lesson',
    '#free': 'free',
    '#custom': 'custom'
  };

  // Initialize mode from URL hash or initialMode or default
  const getInitialMode = (): Mode => {
    if (initialMode) return initialMode;
    const hash = window.location.hash;
    return HASH_TO_MODE[hash] || 'lesson';
  };

  const [mode, setMode] = useState<Mode>(getInitialMode());

  // Sync mode with initialMode prop changes
  useEffect(() => {
    if (initialMode && initialMode !== mode) {
      updateModeWithHistory(initialMode);
    }
  }, [initialMode]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const newMode = HASH_TO_MODE[hash];
      if (newMode && newMode !== mode) {
        setMode(newMode);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [mode]);

  // Set initial hash on mount if not present
  useEffect(() => {
    const currentHash = window.location.hash;
    const expectedHash = MODE_TO_HASH[mode];

    // If there's no hash or it doesn't match the current mode, set it
    if (currentHash !== expectedHash) {
      window.history.replaceState({ mode }, '', window.location.pathname + expectedHash);
    }
  }, []); // Run only on mount

  // Update URL hash when mode changes (but not on initial mount)
  const updateModeWithHistory = (newMode: Mode) => {
    setMode(newMode);
    const hash = MODE_TO_HASH[newMode];
    if (window.location.hash !== hash) {
      window.history.pushState({ mode: newMode }, '', window.location.pathname + hash);
    }

    if (newMode === 'custom') {
      // Internal switch to custom: start fresh
      setTargetText("");
      setIsCustomSetup(true);
      sessionStorage.removeItem('ezhuthidu_custom_target');
      sessionStorage.removeItem('ezhuthidu_custom_setup');
      sessionStorage.removeItem('ezhuthidu_custom_duration');
    }
  };
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0].id);
  const [selectedCompoundVowel, setSelectedCompoundVowel] = useState('அ'); // New state for vowel selection
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // Track which page of 8 lessons to show
  const LESSONS_PER_PAGE = 8;
  const [targetText, setTargetText] = useState("");
  const [currentTextId, setCurrentTextId] = useState<string | undefined>(undefined);
  const [inputText, setInputText] = useState("");
  const [inputHistory, setInputHistory] = useState(""); // Full history for tape calculation
  const [partialInput, setPartialInput] = useState(""); // Tracks intermediate typing (e.g. 'க்' for 'கா')
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isCustomSetup, setIsCustomSetup] = useState(() => {
    const saved = sessionStorage.getItem('ezhuthidu_custom_setup');
    return saved ? saved === 'true' : false;
  });
  const [feedbackStatus, setFeedbackStatus] = useState<'neutral' | 'success' | 'error'>('neutral');
  const [stats, setStats] = useState({
    characters: 0,
    errors: 0,
    accuracy: 100,
    grossWpm: 0,
    netWpm: 0
  });
  const [practiceDuration, setPracticeDuration] = useState<number | null>(() => {
    const saved = sessionStorage.getItem('ezhuthidu_custom_duration');
    return saved ? parseInt(saved) : null;
  }); // in seconds, null means no limit
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [testSessionId, setTestSessionId] = useState(() => generateUUID());
  const onCompleteCalled = useRef(false);
  const { getCategories, fetchTexts, getRandomText, getRandomTextObject, isLoading } = useTextStore();
  const [selectedFreeCategory, setSelectedFreeCategory] = useState('free-typing');
  const [showKeyboard, setShowKeyboard] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const targetDisplayRef = useRef<HTMLDivElement>(null);
  // const [showLessonGrid, setShowLessonGrid] = useState(true);

  // Persistence for Custom Text
  useEffect(() => {
    if (mode === 'custom') {
      sessionStorage.setItem('ezhuthidu_custom_target', targetText);
      sessionStorage.setItem('ezhuthidu_custom_setup', isCustomSetup.toString());
      sessionStorage.setItem('ezhuthidu_custom_duration', practiceDuration?.toString() || "");
    }
  }, [targetText, isCustomSetup, practiceDuration, mode]);

  // Update Uyirmei lessons when vowel selection changes
  useEffect(() => {
    if (selectedCategoryId === 'uyirmei') {
      const fullSeries = COMPOUND_SERIES[selectedCompoundVowel] || [];
      // Shuffle and pick 16 random characters
      const shuffledSeries = [...fullSeries].sort(() => Math.random() - 0.5).slice(0, 16);

      const newLessons = shuffledSeries.map((char, idx) => ({
        id: `um-${selectedCompoundVowel}-${idx}`,
        char: char,
        text: `${char} ${char} ${char}` // Placeholder text
      }));

      setCategories(prev => prev.map(cat =>
        cat.id === 'uyirmei'
          ? { ...cat, subtitle: `SERIES: ${selectedCompoundVowel} + Consonants (Random 16)`, lessons: newLessons }
          : cat
      ));

      // Auto-select the first lesson of the new series (only if in lesson mode)
      if (mode === 'lesson' && newLessons.length > 0) {
        setTargetText(newLessons[0].char);
        setInputText("");
        setInputHistory("");
        setPartialInput("");
        setFeedbackStatus('neutral');
      }
    }
  }, [selectedCompoundVowel, selectedCategoryId, mode]);

  // Sync target text when grid changes
  useEffect(() => {
    if (mode === 'lesson' && categories.length > 0) {
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category && category.lessons.length > 0 && !targetText) {
        setTargetText(category.lessons[0].char);
        setInputText("");
        setInputHistory("");
        setPartialInput("");
        setFeedbackStatus('neutral');
      }
    }
  }, [categories, selectedCategoryId, mode]);

  // Sync target text display scroll with current progress
  useEffect(() => {
    if (targetDisplayRef.current) {
      const activeChar = targetDisplayRef.current.querySelector('.char-current');
      if (activeChar) {
        activeChar.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      }
    }
  }, [inputText, mode]);

  // Handle textarea auto-scroll to keep cursor visible
  useEffect(() => {
    if (mode !== 'lesson' && inputRef.current) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      // If cursor is at or near the end, auto-scroll to bottom
      const isAtEnd = textarea.selectionStart >= inputText.length - 1;
      if (isAtEnd) {
        textarea.scrollTop = textarea.scrollHeight;
      }
    }
  }, [inputText, mode]);

  // Ref for the infinite tape container
  const drillContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the infinite tape to keep current position in view
  useEffect(() => {
    if (selectedCategoryId === 'keyboard_practice' && drillContainerRef.current) {
      const activeEl = document.getElementById('active-tape-char');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [inputText, selectedCategoryId]);


  const resetPractice = () => {
    setInputText("");
    setInputHistory("");
    setPartialInput("");
    setStartTime(null);
    setElapsedTime(0);
    setTimeLeft(practiceDuration);
    setFeedbackStatus('neutral'); // Force neutral on reset to prevent stale success state
    setIsFinished(false);
    setTestSessionId(generateUUID());
    onCompleteCalled.current = false;
    // Intentional focus after reset
    setTimeout(() => {
      inputRef.current?.focus({ preventScroll: true });
    }, 0);
  };

  const currentCategory = categories.find(c => c.id === selectedCategoryId) || categories[0];

  const selectLesson = (index: number) => {
    const category = categories.find(c => c.id === selectedCategoryId);
    if (category && index >= 0 && index < category.lessons.length) {
      setCurrentLessonIndex(index);
      setTargetText(category.lessons[index].char);
      // Set the correct page based on the selected lesson
      setCurrentPage(Math.floor(index / LESSONS_PER_PAGE));
      resetPractice();
    }
  };

  // Reset page when category changes
  useEffect(() => {
    if (mode !== 'lesson') return;

    setCurrentPage(0);
    setCurrentLessonIndex(0);

    if (selectedCategoryId === 'keyboard_practice') {
      const firstDrill = keyboardPracticeData[0]?.lessons[0]?.content || "";
      setTargetText(firstDrill);
      resetPractice();
      return;
    }

    const category = categories.find(c => c.id === selectedCategoryId);
    if (category && category.lessons.length > 0) {
      setTargetText(category.lessons[0].char);
      resetPractice();
    }
  }, [selectedCategoryId, selectedCompoundVowel, categories, mode]);

  const advanceLesson = () => {
    const category = categories.find(c => c.id === selectedCategoryId);
    if (category) {
      const nextIndex = currentLessonIndex + 1;
      const currentPageEnd = (currentPage + 1) * LESSONS_PER_PAGE;
      const isPageComplete = nextIndex === currentPageEnd && nextIndex < category.lessons.length;

      if (nextIndex < category.lessons.length) {
        setCurrentLessonIndex(nextIndex);
        setTargetText(category.lessons[nextIndex].char);
        setInputText("");
        setFeedbackStatus('neutral');

        if (isPageComplete) {
          setCurrentPage(currentPage + 1);
        }
      } else {
        if (onComplete) onComplete(stats.netWpm, stats.accuracy, {
          rawTypedText: inputHistory + inputText,
          durationMs: elapsedTime * 1000,
          testSessionId: testSessionId,
          textId: currentTextId
        });
        setCurrentLessonIndex(0);
        setCurrentPage(0);
        setTargetText(category.lessons[0].char);
        setInputText("");
        setFeedbackStatus('neutral');
      }
    }
  };

  const selectPracticeLesson = (text: string) => {
    setTargetText(text);
    resetPractice();
  };

  useEffect(() => {
    if (mode === 'free') {
      fetchTexts(selectedFreeCategory);
    }
  }, [mode, fetchTexts, selectedFreeCategory]);

  // showLessonGrid removed - grid is always visible now

  useEffect(() => {
    if (isLoading) return;

    if (mode === 'lesson') {
      setIsCustomSetup(false);
      if (selectedCategoryId === 'keyboard_practice') {
        const firstDrill = keyboardPracticeData[0]?.lessons[0]?.content || "";
        setTargetText(firstDrill);
        setCurrentTextId(undefined); // No DB ID for local practice data
        resetPractice();
      } else {
        const category = categories.find(c => c.id === selectedCategoryId);
        if (category) {
          // Start with the first lesson's first char
          setCurrentLessonIndex(0);
          const firstChar = category.lessons[0].char;
          setTargetText(firstChar);
          setCurrentTextId(undefined); // No DB ID
          resetPractice();
        }
      }
    } else if (mode === 'free') {
      setIsCustomSetup(false);
      const textObj = getRandomTextObject(selectedFreeCategory);
      setTargetText(textObj?.content || "");
      setCurrentTextId(textObj?._id);
      resetPractice();
    } else if (mode === 'custom') {
      // Only set to setup mode if we don't have a persisted target text
      if (!sessionStorage.getItem('ezhuthidu_custom_target')) {
        setTargetText("");
        setIsCustomSetup(true);
      }
    }
  }, [selectedCategoryId, mode, isLoading]);

  const targetGraphemes = getTamilGraphemes(targetText);
  const inputGraphemes = getTamilGraphemes(selectedCategoryId === 'keyboard_practice' ? inputHistory + inputText : inputText);

  // Robust Highlight Logic for Free/Custom Typing
  const { alignmentStatuses, activeCharIndex } = React.useMemo(() => {
    const statuses: ('success' | 'error' | 'current' | 'neutral')[] = new Array(targetGraphemes.length).fill('neutral');
    let t = 0;
    let i = 0;
    const iG = inputGraphemes;
    const tG = targetGraphemes;

    while (i < iG.length && t < tG.length) {
      const inp = iG[i];
      const tgt = tG[t];

      if (inp === tgt) {
        statuses[t] = 'success';
        t++;
        i++;
      } else if (tgt === ' ' && inp !== ' ') {
        // Missing space in input? Mark space as error and move on
        statuses[t] = 'error';
        t++;
      } else if (inp === ' ' && tgt !== ' ') {
        // Extra space in input? Greedy skip it to stay in sync
        i++;
      } else if (isPotentialMatch(inp, tgt) && i === iG.length - 1) {
        // Composition state: hold position
        break;
      } else {
        statuses[t] = 'error';
        t++;
        i++;
      }
    }

    if (t < tG.length) statuses[t] = 'current';
    return { alignmentStatuses: statuses, activeCharIndex: t };
  }, [inputGraphemes, targetGraphemes]);

  useEffect(() => {
    let interval: number;
    if (startTime) {
      interval = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);

        if (practiceDuration) {
          const remaining = Math.max(practiceDuration - elapsed, 0);
          setTimeLeft(remaining);
          if (remaining === 0) {
            setStartTime(null); // Stop practice
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, practiceDuration]);

  useEffect(() => {
    const handleMobileInput = (e: Event) => {
      try {
        const customEvent = e as CustomEvent;
        const { type, value, activeBase: isActiveBaseDelete } = customEvent.detail;
        const start = inputRef.current?.selectionStart || inputText.length;
        const end = inputRef.current?.selectionEnd || inputText.length;

        if (!startTime) setStartTime(Date.now());

        if (mode === 'lesson' && !isCustomSetup) {
          // LESSON MODE HANDLING
          if (type === 'backspace') {
            const result = handleTamilBackspace(inputText + partialInput, start, end);
            setInputText(result.text);
            setPartialInput("");
            if (selectedCategoryId === 'keyboard_practice') {
              const { lastInputStatus } = calculateDynamicTape(targetText, result.text, inputHistory);
              setFeedbackStatus(lastInputStatus);
            } else if (result.text === '' || targetText.startsWith(result.text)) {
              setFeedbackStatus('neutral');
            }
          } else if (value === ' ') {
            if (selectedCategoryId === 'keyboard_practice') {
              setInputHistory(inputHistory + inputText + ' ');
              setInputText('');
              setFeedbackStatus('neutral');
            } else if (inputText.length > 0 || feedbackStatus === 'success') {
              advanceLesson();
            }
          } else if (type === 'char' || type === 'phonetic' || type === 'replace') {
            const result = processTamilInput(partialInput, value, partialInput.length);
            const produced = result.text;

            if (selectedCategoryId === 'keyboard_practice') {
              const newDisplayInput = inputText + produced;
              const { lastInputStatus } = calculateDynamicTape(targetText, newDisplayInput, inputHistory);
              setInputText(newDisplayInput);
              setPartialInput("");
              setFeedbackStatus(lastInputStatus);
            } else {
              // Rule: Success for full match, neutral for partial progress
              if (produced === targetText) {
                setFeedbackStatus('success');
                setInputText(inputText + targetText);
                setPartialInput("");
              } else if (isPotentialMatch(produced, targetText)) {
                setFeedbackStatus('neutral'); // Neutral for progress
                setPartialInput(produced);
              } else {
                setFeedbackStatus('error');
                setPartialInput("");
                setInputText(inputText + produced);
              }
            }
          }
        } else {
          // FREE / CUSTOM MODE HANDLING
          let newText = inputText;
          let newCursor = start;

          if (type === 'backspace') {
            const result = handleTamilBackspace(inputText + partialInput, start, end);
            newText = result.text;
            newCursor = result.newCursorPos;
            setPartialInput("");
          } else if (type === 'phonetic') {
            const result = processTamilInput(inputText, value, start);
            newText = result.text;
            newCursor = result.newCursorPos;
          } else if (type === 'char') {
            newText = inputText.slice(0, start) + value + inputText.slice(end);
            newCursor = start + value.length;
          } else if (type === 'replace') {
            const graphemes = getTamilGraphemes(inputText.slice(0, start));
            const lastGrapheme = graphemes[graphemes.length - 1] || "";
            const replaceLen = lastGrapheme.length;
            newText = inputText.slice(0, start - replaceLen) + value + inputText.slice(end);
            newCursor = start - replaceLen + value.length;
          }

          setInputText(newText);
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = newCursor;
            }
          }, 0);

          if (mode === 'free' && activeCharIndex >= targetGraphemes.length) {
            setTargetText(prev => {
              const nextPara = getRandomText('free-typing', prev.split(' ').pop() || "");
              return prev.trimEnd() + " " + nextPara;
            });
          }
        }
      } catch (err) {
        console.warn('Mobile input handler error:', err);
      }
    };

    window.addEventListener('mobile-keyboard-input', handleMobileInput);
    return () => window.removeEventListener('mobile-keyboard-input', handleMobileInput);
  }, [inputText, startTime, mode, targetText, currentLessonIndex, selectedCategoryId, categories]);

  const handleWordClick = (clickedIdxInPage: number) => {
    if (selectedCategoryId !== 'keyboard_practice') return;

    // We use exactly 8 words per set
    const WORDS_PER_PAGE = 8;

    // Calculate current completed words to find the current page
    const inputGraphemes = getTamilGraphemes(inputHistory);
    let totalCompleted = 0;
    for (const g of inputGraphemes) if (g === ' ') totalCompleted++;

    const currentPage = Math.floor(totalCompleted / WORDS_PER_PAGE);
    const absoluteTargetWordIdx = currentPage * WORDS_PER_PAGE + clickedIdxInPage;

    // Jump strategy: Set history to 'N' spaces to move the tape highlight
    setInputHistory(" ".repeat(absoluteTargetWordIdx));
    setInputText("");
    setPartialInput("");
    setFeedbackStatus('neutral');

    // Focus the input area
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const key = e.key;
    const target = e.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;

    if (key === 'Backspace') {
      e.preventDefault();
      const result = handleTamilBackspace(inputText + partialInput, start || 0, end || 0);
      setInputText(result.text);
      setPartialInput("");

      const newPos = result.newCursorPos;
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.selectionStart = inputRef.current.selectionEnd = newPos;
        }
      }, 0);

      // Reset feedback in lesson mode if backspace clears the error
      if (mode === 'lesson') {
        if (selectedCategoryId === 'keyboard_practice') {
          const { lastInputStatus } = calculateDynamicTape(targetText, result.text, inputHistory);
          setFeedbackStatus(lastInputStatus);
        } else if (result.text === '' || targetText.startsWith(result.text)) {
          setFeedbackStatus('neutral');
        }
      }
      return;
    }

    // Strict Input Logic for physical keyboard
    if (mode === 'lesson') {
      if (key === ' ') {
        e.preventDefault();

        // For Keyboard Practice, space is part of the drill if it matches the next target character
        // For Keyboard Practice, space is ALWAYS allowed to advance the drill (Infinite Space-Driven Mode)
        if (selectedCategoryId === 'keyboard_practice') {
          if (!startTime) setStartTime(Date.now());
          // Append space to history for tape calculation, but clear display input
          setInputHistory(inputHistory + inputText + ' ');
          setInputText(''); // Clear display for next word
          setFeedbackStatus('neutral');
          return;
        }

        // Strict Space Logic: Must have typed correctly to advance
        // Disable space-to-advance for Keyboard Practice to allow infinite typing
        if (selectedCategoryId !== 'keyboard_practice' && (inputText.length > 0 || feedbackStatus === 'success')) {
          advanceLesson();
        }
        return;
      }

      // Use a generalized matching logic that handles multi-key sequences
      if (key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();

        if (!startTime) setStartTime(Date.now());

        // Manual Reset: removed to allow continuous typing

        const targetGraphemes = getTamilGraphemes(targetText);
        const inputGraphemes = getTamilGraphemes(inputText);

        const result = processTamilInput(partialInput, key, partialInput.length);
        const produced = result.text;

        // If this is Keyboard Practice, we match using the dynamic Space-Driven logic
        if (selectedCategoryId === 'keyboard_practice') {
          // Update only display input. inputHistory only updates on Space.
          const { lastInputStatus } = calculateDynamicTape(targetText, inputText + produced, inputHistory);

          const newDisplayInput = inputText + produced;
          setInputText(newDisplayInput);
          setPartialInput("");
          setFeedbackStatus(lastInputStatus);

          const newPos = newDisplayInput.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = newPos;
            }
          }, 0);
          return;
        }

        // ORIGINAL LESSON LOGIC: For single-character lessons (Uyir, Mei, etc.)
        if (produced === targetText) {
          // COMPLETE SUCCESS
          setFeedbackStatus('success');
          const newLessonInp = inputText + targetText;
          setInputText(newLessonInp);
          setPartialInput("");

          const newPosLesson = newLessonInp.length;
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = inputRef.current.selectionEnd = newPosLesson;
            }
          }, 0);
          return;
        }

        if (isPotentialMatch(produced, targetText)) {
          // PARTIAL MATCH - show as error (red) until complete
          setFeedbackStatus('error');
          setPartialInput(produced);
          return;
        }

        // WRONG INPUT - Allow all characters but mark as error
        setFeedbackStatus('error');
        setPartialInput("");
        const newInp = inputText + produced;
        setInputText(newInp);

        const newPosEnd = newInp.length;
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.selectionStart = inputRef.current.selectionEnd = newPosEnd;
          }
        }, 0);
        return;
      }
    }

    if (key.length === 1) {
      e.preventDefault();
      if (!startTime) setStartTime(Date.now());

      let newText = inputText;
      let newCursor = start || 0;

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

      // Check for next paragraph
      if (mode === 'free') {
        if (activeCharIndex >= targetGraphemes.length) {
          setTargetText(prev => {
            const nextPara = getRandomText('free-typing', prev.split(' ').pop() || "");
            return prev.trimEnd() + " " + nextPara;
          });
        }
      }
    }
  };

  useEffect(() => {
    const targetGraphemes = getTamilGraphemes(targetText);
    const inputGraphemes = getTamilGraphemes(selectedCategoryId === 'keyboard_practice' ? inputHistory + inputText : inputText);

    let correctChars = 0;
    let errors = 0;

    if (mode === 'lesson') {
      // In lesson mode, we allow users to type the target character/text multiple times.
      // We calculate stats by checking each input grapheme against the target pattern.
      inputGraphemes.forEach((inp, idx) => {
        const tgt = targetGraphemes[idx % targetGraphemes.length];
        if (inp === tgt) {
          correctChars++;
        } else {
          // Only count as error if it's not a potential phonetic match in progress
          if (!isPotentialMatch(inp, tgt) || idx < inputGraphemes.length - 1) {
            errors++;
          }
        }
      });
    } else {
      // Use alignmentStatuses for consistent statistics in Free/Custom modes
      alignmentStatuses.forEach(status => {
        if (status === 'success') correctChars++;
        else if (status === 'error') errors++;
      });

      // Handle characters typed beyond target length as errors for non-lesson modes
      if (inputGraphemes.length > targetGraphemes.length) {
        errors += (inputGraphemes.length - targetGraphemes.length);
      }
    }

    const totalChars = inputGraphemes.length;
    const minutes = Math.max(elapsedTime / 60, 0.01);

    const accuracyRatio = totalChars > 0 ? (correctChars / totalChars) : 1;
    const accuracy = Math.round(accuracyRatio * 100);
    const grossWpm = Math.round((totalChars / 5) / minutes);

    // Final Score = (Correct Characters / Time Seconds × 60) × (Accuracy ratio)
    const effectiveTime = Math.max(elapsedTime, 1);
    const finalScore = Math.round((correctChars / effectiveTime * 60) * accuracyRatio);

    if (mode === 'lesson' && inputText === targetText && inputText.length > 0 && !onCompleteCalled.current) {
      onCompleteCalled.current = true;
      setIsFinished(true);
      if (onComplete) onComplete(finalScore, accuracy, {
        rawTypedText: inputText,
        durationMs: (300 - (timeLeft || 300)) * 1000, // Estimate based on 300s default if no duration
        testSessionId: testSessionId,
        textId: currentTextId
      });
    }

    setStats({
      characters: totalChars,
      errors,
      accuracy,
      grossWpm,
      netWpm: finalScore
    });
  }, [inputText, targetText, elapsedTime, mode, onComplete]);

  // useLayoutEffect removed

  const nextUnprocessedGraphemeIndex = activeCharIndex;
  const nextTargetGrapheme = targetGraphemes[nextUnprocessedGraphemeIndex] || "";
  const activeKeysWithGuide = new Set(activeKeys);
  if (nextTargetGrapheme && isLetter(nextTargetGrapheme)) {
    activeKeysWithGuide.add(nextTargetGrapheme);
  }

  function isLetter(str: string) { return str.length === 1 && str.match(/[a-z]/i); }

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate dynamic tape based on input history - MEMOIZED for performance
  function calculateDynamicTape(tgt: string, inp: string, history: string) {
    const tape: { char: string; status: 'success' | 'error' | 'neutral' | 'current'; isActive?: boolean }[] = [];
    let lastInputStatus: 'success' | 'error' | 'neutral' = 'neutral';

    if (selectedCategoryId !== 'keyboard_practice') return { tape, tIdx: 0, lastInputStatus };

    const tGraphemes = getTamilGraphemes(tgt);
    const iGraphemes = getTamilGraphemes(history + inp); // Merge history and current input

    if (tGraphemes.length === 0) return { tape, tIdx: 0, lastInputStatus };

    // Pagination: Show exactly 8 words per set
    const WORDS_PER_PAGE = 8;

    // 1. Identify all tokens (characters) in the target text
    const allTokens = tGraphemes.filter(g => g !== ' ');

    if (allTokens.length === 0) return { tape, tIdx: 0, lastInputStatus };

    // 2. Count completed boxes in input history
    let completedUnits = 0;
    let activeUnitStatus: 'success' | 'error' | 'neutral' = 'neutral';

    for (const char of inputGraphemes) {
      if (char === ' ') {
        completedUnits++;
        activeUnitStatus = 'neutral';
      } else {
        const targetChar = allTokens[completedUnits % allTokens.length] || "";
        if (targetChar === char) {
          activeUnitStatus = 'success';
        } else if (isPotentialMatch(char, targetChar)) {
          activeUnitStatus = 'neutral';
        } else {
          activeUnitStatus = 'error';
        }
      }
    }

    lastInputStatus = activeUnitStatus;

    // 3. Determine Page
    const currentPage = Math.floor(completedUnits / WORDS_PER_PAGE);
    const boxIndexInPage = completedUnits % WORDS_PER_PAGE;

    // 4. Generate Exactly 8 Boxes for this Page
    for (let i = 0; i < WORDS_PER_PAGE; i++) {
      const absoluteIdx = currentPage * WORDS_PER_PAGE + i;
      const char = allTokens[absoluteIdx % allTokens.length];

      if (i < boxIndexInPage) {
        // COMPLETED on this page: Show as neutral (no highlight)
        tape.push({ char: char, status: 'neutral' });
      } else if (i === boxIndexInPage) {
        // CURRENT ACTIVE: Show as current (highlighted)
        tape.push({ char: char, status: 'current', isActive: true });
      } else {
        // UPCOMING: Show as neutral
        tape.push({ char: char, status: 'neutral' });
      }
    }

    return { tape, tIdx: completedUnits, lastInputStatus };
  };

  const { tape: dynamicTape, tIdx: currentDrillIndex, lastInputStatus: lastInputStatusFromTape } = React.useMemo(() => calculateDynamicTape(targetText, inputText, inputHistory), [inputText, inputHistory, targetText, selectedCategoryId]);

  const activeChar = dynamicTape.find(item => item.isActive)?.char || "";

  return (
    <div className="w-full flex flex-col items-center justify-start pt-0 pb-2 sm:pb-4 md:pb-6 font-tamil">
      <div className="w-full mx-auto space-y-3 md:space-y-4 pb-4 sm:pb-6 md:pb-8">
        <div className="flex items-center justify-center gap-4 xs:gap-8 mb-2">
          {(['lesson', 'free', 'custom'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => updateModeWithHistory(m)}
              className={`pb-3 text-xl font-bold capitalize transition-all relative ${mode === m ? 'text-primary' : 'text-black/60 hover:text-black'}`}
            >
              {m === 'free' ? 'Free Typing' : m === 'lesson' ? 'Lesson Practice' : 'Custom Text'}
              {mode === m && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
            </button>
          ))}
        </div>

        {isCustomSetup ? (
          <div className="w-full max-w-2xl mx-auto bg-cream-light/50 p-8 rounded-3xl shadow-inner border border-slate-100 animate-in fade-in zoom-in duration-300 mt-8">
            <h2 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">edit_note</span> Custom Practice Setup
            </h2>
            <textarea
              autoFocus
              className="w-full h-72 bg-slate-50 rounded-2xl border-2 border-slate-200 p-6 text-xl font-tamil focus:border-primary focus:ring-0 transition-all paper-shadow"
              placeholder="Paste your Tamil text here..."
              value={targetText}
              onChange={(e) => setTargetText(e.target.value)}
            ></textarea>
            <div className="mt-6">
              <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 block">Practice Duration</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'No Limit', value: null },
                  { label: '1 Min', value: 60 },
                  { label: '2 Mins', value: 120 },
                  { label: '3 Mins', value: 180 },
                  { label: '5 Mins', value: 300 }
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => setPracticeDuration(opt.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${practiceDuration === opt.value
                      ? 'bg-header-brown text-white border-header-brown shadow-lg scale-105'
                      : 'bg-cream-light/40 text-slate-600 border-slate-100 hover:border-primary/30'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setIsCustomSetup(false); resetPractice(); }}
                className="flex-grow-[2] bg-primary text-white py-3 rounded-xl font-black uppercase tracking-widest hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Start
              </button>
              <button
                onClick={() => {
                  setTargetText("");
                  sessionStorage.removeItem('ezhuthidu_custom_target');
                  sessionStorage.removeItem('ezhuthidu_custom_setup');
                  sessionStorage.removeItem('ezhuthidu_custom_duration');
                }}
                className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-red-100 transition-all border-2 border-red-100 flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                Clear
              </button>
              <button
                onClick={() => {
                  setIsCustomSetup(false);
                  sessionStorage.removeItem('ezhuthidu_custom_target');
                  sessionStorage.removeItem('ezhuthidu_custom_setup');
                  sessionStorage.removeItem('ezhuthidu_custom_duration');
                  updateModeWithHistory('free');
                }}
                className="flex-1 bg-slate-100 text-slate-800 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all border-2 border-slate-200 flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Free Typing mode is now a completely clean experience with no header */}
            {mode === 'lesson' && (
              <div className="shrink-0 w-full animate-in fade-in duration-500">
                <div className="bg-cream-light/50 rounded-2xl p-6 shadow-even border border-slate-100 flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative group min-w-[200px] w-full max-w-[280px]">
                      <span className="absolute -top-2 left-3 px-1 bg-cream-light text-[9px] font-black text-primary uppercase tracking-tighter rounded border border-primary/20 z-10">Select Category</span>
                      <div className="relative">
                        <select
                          value={selectedCategoryId}
                          onChange={(e) => setSelectedCategoryId(e.target.value)}
                          className="w-full bg-[#f5e6d3] border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:border-primary focus:ring-0 transition-all cursor-pointer appearance-none shadow-sm pr-10"
                        >
                          <option value="keyboard_practice">Keyboard Practice</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          arrow_drop_down
                        </span>
                      </div>
                    </div>

                    {selectedCategoryId === 'keyboard_practice' && (
                      <div className="relative group min-w-[200px] w-full max-w-[280px]">
                        <span className="absolute -top-2 left-3 px-1 bg-cream-light text-[9px] font-black text-primary uppercase tracking-tighter rounded border border-primary/20 z-10">Select Drill</span>
                        <div className="relative">
                          <select
                            value={targetText}
                            onChange={(e) => selectPracticeLesson(e.target.value)}
                            className="w-full bg-[#f5e6d3] border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:border-primary focus:ring-0 transition-all cursor-pointer appearance-none shadow-sm pr-10"
                          >
                            {keyboardPracticeData.map(section => (
                              <optgroup key={section.id} label={section.title}>
                                {section.lessons.map(lesson => (
                                  <option key={lesson.id} value={lesson.content}>{lesson.title}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            arrow_drop_down
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedCategoryId !== 'keyboard_practice' && currentCategory.id === 'uyirmei' && (
                      <div className="relative group min-w-[200px] w-full max-w-[280px]">
                        <span className="absolute -top-2 left-3 px-1 bg-cream-light text-[9px] font-black text-primary uppercase tracking-tighter rounded border border-primary/20 z-10">Select Series</span>
                        <div className="relative">
                          <select
                            value={selectedCompoundVowel}
                            onChange={(e) => setSelectedCompoundVowel(e.target.value)}
                            className="w-full bg-[#f5e6d3] border-2 border-slate-100 rounded-xl px-4 py-2 text-sm font-bold text-slate-800 focus:border-primary focus:ring-0 transition-all cursor-pointer appearance-none shadow-sm pr-10"
                          >
                            {['அ', 'ஆ', 'இ', 'ஈ', 'உ', 'ஊ', 'எ', 'ஏ', 'ஐ', 'ஒ', 'ஓ', 'ஔ'].map(vowel => (
                              <option key={vowel} value={vowel}>{vowel} Series</option>
                            ))}
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            arrow_drop_down
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    ref={drillContainerRef}
                    className="grid grid-cols-4 sm:grid-cols-8 gap-2 xs:gap-3 py-4 px-2 animate-in fade-in zoom-in-95 duration-300"
                  >
                    {selectedCategoryId === 'keyboard_practice' ? (
                      dynamicTape.map((item, i) => {
                        const isActive = item.isActive;

                        let boxClass = "flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer hover:shadow-md ";

                        if (item.status === 'success') {
                          boxClass += "bg-green-500 text-white border-green-500";
                        } else if (item.status === 'error') {
                          boxClass += "bg-red-500 text-white border-red-500";
                        } else if (item.status === 'current') {
                          if (feedbackStatus === 'success') boxClass += "bg-green-500 text-white border-green-500 shadow-md scale-105";
                          else if (feedbackStatus === 'error') boxClass += "bg-red-500 text-white border-red-500 shadow-md scale-105";
                          else boxClass += "bg-white border-2 border-primary shadow-md scale-105";
                        } else {
                          boxClass += "bg-white/40 border-white/60 hover:bg-white/60";
                        }

                        return (
                          <div
                            key={i}
                            id={isActive ? "active-tape-char" : undefined}
                            className={boxClass}
                            onClick={() => handleWordClick(i)}
                          >
                            <span className={`text-xl font-black transition-colors ${item.status === 'success' || item.status === 'error' ? 'text-white' :
                              item.status === 'current' ? (feedbackStatus === 'neutral' ? 'text-slate-900' : 'text-white') : 'text-slate-800'
                              }`}>{item.char}</span>
                          </div>
                        );
                      })
                    ) : (
                      currentCategory.lessons
                        .slice(currentPage * LESSONS_PER_PAGE, (currentPage + 1) * LESSONS_PER_PAGE)
                        .map((lesson, displayIndex) => {
                          const lessonIndex = currentPage * LESSONS_PER_PAGE + displayIndex;
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => selectLesson(lessonIndex)}
                              className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer ${lessonIndex === currentLessonIndex
                                ? feedbackStatus === 'success'
                                  ? 'bg-green-500 text-white border-green-500 shadow-md scale-105'
                                  : feedbackStatus === 'error'
                                    ? 'bg-red-500 text-white border-red-500 shadow-md scale-105'
                                    : 'bg-white border-2 border-primary shadow-md scale-105'
                                : 'bg-white/40 border-white/60'
                                }`}
                            >
                              <span className={`text-xl font-black transition-colors ${lessonIndex === currentLessonIndex
                                ? feedbackStatus === 'neutral' ? 'text-slate-900' : 'text-white'
                                : 'text-slate-800'
                                }`}>{lesson.char}</span>
                            </button>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={inputAreaRef} className="flex flex-col gap-4 w-full shrink-0 scroll-mt-24">
              {mode !== 'lesson' && (
                <div
                  ref={targetDisplayRef}
                  className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-3 sm:p-4 md:p-5 paper-shadow border border-black/5 font-tamil w-full h-[80px] md:h-[110px] overflow-y-auto scroll-smooth"
                >
                  <p className="text-lg sm:text-xl md:text-2xl font-tamil leading-relaxed sm:leading-[1.6] md:leading-[2.0] tracking-wide text-justify">
                    {targetGraphemes.map((char, i) => {
                      if (char === '\n') return <br key={i} />;
                      const status = alignmentStatuses[i];
                      let className = "inline ";
                      if (status === 'success') {
                        className += "text-[#15803d]";
                      } else if (status === 'error') {
                        className += "text-[#b91c1c] bg-[#fee2e2] rounded-[2px]";
                      } else if (status === 'current') {
                        className += "char-current bg-blue-100 border-b-2 border-blue-600";
                      }
                      return <span key={i} className={className}>{char}</span>;
                    })}
                  </p>
                </div>
              )}

              <div className={`relative group overflow-hidden rounded-[1.5rem] md:rounded-[2.5rem] w-full ${mode === 'lesson' ? 'h-[60px] md:h-[80px]' : 'h-[105px] md:h-[135px]'}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none group-focus-within:opacity-100 opacity-0 transition-opacity"></div>
                {mode === 'lesson' ? (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    value={inputText + partialInput}
                    onChange={() => { }}
                    onKeyDown={handleKeyDown}
                    type="text"
                    readOnly={isFinished}
                    className={`w-full h-full bg-white/95 rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 focus:ring-0 px-6 text-xl sm:text-2xl md:text-3xl font-tamil text-center tracking-[0.2em] overflow-x-auto whitespace-nowrap transition-all shadow-inner ${feedbackStatus === 'error'
                      ? 'border-red-500 text-red-600 focus:border-red-600 bg-red-50'
                      : 'border-primary/10 focus:border-primary'
                      }`}
                    placeholder={selectedCategoryId === 'keyboard_practice' ? `${activeChar} ... Press Space to Next.` : `${targetText}... Press Space to Next`}
                  />
                ) : (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={inputText}
                    onChange={() => { }}
                    onKeyDown={handleKeyDown}
                    onPaste={(e) => e.preventDefault()}
                    onDrop={(e) => e.preventDefault()}
                    inputMode="text"
                    readOnly={isFinished}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-lpignore="true"
                    aria-autocomplete="none"
                    className={`w-full h-full bg-white/95 rounded-[1.5rem] md:rounded-[2.5rem] border-2 md:border-4 border-primary/10 focus:border-primary focus:ring-0 ${mode === 'lesson' ? 'p-4' : 'p-3 sm:p-5'} text-xl sm:text-2xl md:text-3xl font-tamil ${mode === 'lesson' ? 'text-center' : 'text-left'} resize-none transition-all shadow-inner overflow-y-auto`}
                    placeholder={selectedCategoryId === 'keyboard_practice' ? `${activeChar} ... Press Space to Next.` : (mode === 'free' ? "Start typing to match the text above..." : "Start writing here...")}
                    autoFocus
                  ></textarea>
                )}
              </div>
            </div>

            <div className="w-full flex justify-end px-4 -mb-2">
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                title={showKeyboard ? "Hide Keyboard" : "Show Keyboard"}
              >
                <span className="material-symbols-outlined text-sm">{showKeyboard ? 'keyboard_arrow_down' : 'keyboard'}</span>
                {showKeyboard ? 'Hide Keyboard' : 'Show Keyboard'}
              </button>
            </div>

            {showKeyboard && (
              <div className="w-full bg-slate-900/5 rounded-2xl p-2 flex items-center justify-center shrink-0">
                <div className="w-full flex justify-center py-2">
                  <Keyboard activeKeys={activeKeysWithGuide} settings={settings} />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 xs:gap-3 md:gap-4 w-full">
              {[
                { label: "Gross WPM", value: stats.grossWpm, color: "text-blue-600" },
                { label: "Performance Score", value: stats.netWpm, color: "text-black" },
                ...(practiceDuration ? [{ label: "Time Left", value: formatTime(timeLeft || 0), color: timeLeft && timeLeft < 10 ? "text-red-600 animate-pulse" : "text-orange-600" }] : []),
                { label: "Accuracy", value: `${stats.accuracy}%`, color: "text-green-700" },
                { label: "Errors", value: stats.errors, color: "text-red-600" }
              ].map((stat, i) => (
                <div key={i} className="bg-cream-light/50 rounded-lg xs:rounded-xl p-2 xs:p-3 md:p-4 flex flex-col items-center shadow-inner border border-slate-200">
                  <span className="text-[8px] xs:text-[10px] font-bold uppercase text-black/50 tracking-widest mb-0.5 xs:mb-1">{stat.label}</span>
                  <span className={`text-lg xs:text-xl md:text-2xl font-black ${stat.color}`}>{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <button
                onClick={() => {
                  resetPractice();
                  if (mode === 'custom') {
                    setTargetText("");
                    setIsCustomSetup(true);
                    sessionStorage.removeItem('ezhuthidu_custom_target');
                    sessionStorage.removeItem('ezhuthidu_custom_setup');
                    sessionStorage.removeItem('ezhuthidu_custom_duration');
                  }
                }}
                className="group flex items-center justify-center gap-2 w-auto min-w-[160px] px-6 py-2 bg-cream-light/50 text-slate-800 border-2 border-slate-200 rounded-xl font-bold hover:bg-cream-light/70 hover:shadow-lg transition-all active:scale-95 shadow-inner text-sm"
              >
                <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">restart_alt</span>
                Reset Practice
              </button>

              {mode === 'custom' && (
                <button
                  onClick={() => setIsCustomSetup(true)}
                  className="group flex items-center justify-center gap-2 w-auto min-w-[160px] px-6 py-2 bg-cream-light/50 text-slate-800 border-2 border-slate-200 rounded-xl font-bold hover:bg-cream-light/70 hover:shadow-lg transition-all active:scale-95 shadow-inner text-sm"
                >
                  <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">edit_square</span> Edit
                </button>
              )}
              <button
                onClick={() => setInputText("")}
                className="group flex items-center justify-center gap-2 w-auto min-w-[160px] px-6 py-2 bg-red-50 text-red-600 border-2 border-red-100 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95 shadow-sm text-sm"
              >
                <span className="material-symbols-outlined text-sm group-hover:shake-y">delete_outline</span> Clear
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PracticeArea;