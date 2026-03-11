
export type TamilCharType = 'uyir' | 'mei' | 'other';

export interface TamilMapEntry {
  main: string;
  type: TamilCharType;
}

export const TAMIL_PHONETIC_MAP: Record<string, TamilMapEntry> = {
  'a': { main: 'அ', type: 'uyir' },
  'A': { main: 'ஆ', type: 'uyir' },
  'b': { main: 'ந்', type: 'mei' },
  'B': { main: 'ந்', type: 'mei' },
  'c': { main: 'ச்', type: 'mei' },
  'C': { main: 'ச்', type: 'mei' },
  'd': { main: 'ட்', type: 'mei' },
  'D': { main: 'ட்', type: 'mei' },
  'e': { main: 'எ', type: 'uyir' },
  'E': { main: 'ஏ', type: 'uyir' },
  'f': { main: 'ஃ', type: 'other' },
  'F': { main: 'ஃ', type: 'other' },
  'g': { main: 'ங்', type: 'mei' },
  'G': { main: 'ங்', type: 'mei' },
  'h': { main: 'ஹ்', type: 'mei' },
  'H': { main: 'ஹ்', type: 'mei' },
  'i': { main: 'இ', type: 'uyir' },
  'I': { main: 'ஈ', type: 'uyir' },
  'j': { main: 'ஞ்', type: 'mei' },
  'J': { main: 'ஜ்', type: 'mei' },
  'k': { main: 'க்', type: 'mei' },
  'K': { main: 'க்ஷ்', type: 'mei' },
  'l': { main: 'ல்', type: 'mei' },
  'L': { main: 'ள்', type: 'mei' },
  'm': { main: 'ம்', type: 'mei' },
  'M': { main: 'ம்', type: 'mei' },
  'n': { main: 'ன்', type: 'mei' },
  'N': { main: 'ண்', type: 'mei' },
  'o': { main: 'ஒ', type: 'uyir' },
  'O': { main: 'ஓ', type: 'uyir' },
  'p': { main: 'ப்', type: 'mei' },
  'P': { main: 'ப்', type: 'mei' },
  'q': { main: 'ஔ', type: 'uyir' },
  'Q': { main: 'ஔ', type: 'uyir' },
  'r': { main: 'ர்', type: 'mei' },
  'R': { main: 'ற்', type: 'mei' },
  's': { main: 'ஸ்', type: 'mei' },
  'S': { main: 'ஷ்', type: 'mei' },
  't': { main: 'த்', type: 'mei' },
  'T': { main: 'த்', type: 'mei' },
  'u': { main: 'உ', type: 'uyir' },
  'U': { main: 'ஊ', type: 'uyir' },
  'v': { main: 'வ்', type: 'mei' },
  'V': { main: 'வ்', type: 'mei' },
  'w': { main: 'ஐ', type: 'uyir' },
  'W': { main: 'ஐ', type: 'uyir' },
  'x': { main: 'ஶ்', type: 'mei' },
  'X': { main: 'ஸ்ரீ', type: 'other' },
  'y': { main: 'ய்', type: 'mei' },
  'Y': { main: 'ய்', type: 'mei' },
  'z': { main: 'ழ்', type: 'mei' },
  'Z': { main: 'ழ்', type: 'mei' },
};

const PULLI = '்';

const STANDALONE_VOWEL_UPGRADES: Record<string, Record<string, string>> = {
  'அ': { 'a': 'ஆ', 'A': 'ஆ' },
  'இ': { 'i': 'ஈ', 'I': 'ஈ' },
  'உ': { 'u': 'ஊ', 'U': 'ஊ' },
  'எ': { 'e': 'ஏ', 'E': 'ஏ' },
  'ஒ': { 'o': 'ஓ', 'O': 'ஓ' },
};

const VOWEL_TO_SIGN: Record<string, string> = {
  'அ': '',
  'ஆ': 'ா',
  'இ': 'ி',
  'ஈ': 'ீ',
  'உ': 'ு',
  'ஊ': 'ூ',
  'எ': 'ெ',
  'ஏ': 'ே',
  'ஐ': 'ை',
  'ஒ': 'ொ',
  'ஓ': 'ோ',
  'ஔ': 'ௌ',
};

const SIGN_UPGRADES: Record<string, Record<string, string>> = {
  'ி': { 'i': 'ீ', 'I': 'ீ' },
  'ு': { 'u': 'ூ', 'U': 'ூ' },
  'ெ': { 'e': 'ே', 'E': 'ே' },
  'ொ': { 'o': 'ோ', 'O': 'ோ' },
};

const ALL_SIGNS = Object.values(VOWEL_TO_SIGN).filter(s => s !== '');

/**
 * Split text into Tamil logical units (graphemes)
 */
export function getTamilGraphemes(text: string): string[] {
  const normalized = text.normalize('NFC');
  // Use type casting to any for Intl to avoid TS errors when Intl.Segmenter is not in the environment's lib definitions
  const IntlAny = Intl as any;
  if (typeof IntlAny !== 'undefined' && IntlAny.Segmenter) {
    const segmenter = new IntlAny.Segmenter('ta', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(normalized)).map((s: any) => s.segment);
  }
  // Fallback regex for Tamil graphemes if Segmenter is unavailable
  const tamilRegex = /[\u0B80-\u0BFF][\u0BBE-\u0BCD\u0BD7]*|./g;
  return normalized.match(tamilRegex) || [];
}

const isBaseConsonant = (char: string): boolean => {
  return Object.values(TAMIL_PHONETIC_MAP).some(e => e.type === 'mei' && e.main.replace(PULLI, '') === char);
};

/**
 * processTamilInput implements the Definitive Rule Specification:
 * - k -> க் (Mei with pulli)
 * - க் + a -> க (Join)
 * - க + a -> கா (Upgrade)
 */
export function processTamilInput(
  text: string,
  key: string,
  cursorPos: number
): { text: string; newCursorPos: number } {
  if (!/^[a-zA-Z]$/.test(key)) {
    const newText = text.slice(0, cursorPos) + key + text.slice(cursorPos);
    return { text: newText, newCursorPos: cursorPos + 1 };
  }

  const entry = TAMIL_PHONETIC_MAP[key];
  if (!entry) {
    // Allow unmapped keys to pass through (e.g. for error tracking)
    const newText = text.slice(0, cursorPos) + key + text.slice(cursorPos);
    return { text: newText, newCursorPos: cursorPos + 1 };
  }

  const leftPart = text.slice(0, cursorPos);
  const rightPart = text.slice(cursorPos);
  const lastChar = leftPart.slice(-1);

  // Rule 5.1: Mei (க்) + Uyir (a) -> Uyirmei (க)
  if (lastChar === PULLI && entry.type === 'uyir') {
    const base = leftPart.slice(0, -1);
    const sign = VOWEL_TO_SIGN[entry.main];
    const updatedLeft = base + sign;
    return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
  }

  // Rule 5.2: Uyirmei (க) + Uyir (a) -> Updated Uyirmei (கா)
  if (isBaseConsonant(lastChar) && entry.type === 'uyir') {
    if (!key) return null;
    if (key && key.toLowerCase() === 'a') {
      const updatedLeft = leftPart + 'ா';
      return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
    } else {
      const sign = VOWEL_TO_SIGN[entry.main];
      const updatedLeft = leftPart + sign;
      return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
    }
  }

  // Rule 5.2: Existing Sign upgrade
  if (SIGN_UPGRADES[lastChar]?.[key]) {
    const updatedLeft = leftPart.slice(0, -1) + SIGN_UPGRADES[lastChar][key];
    return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
  }

  // Rule 3.2: Standalone Vowel Doubling (அ + a -> ஆ)
  // Only happens if NO Mei or Uyirmei exists immediately before
  const isMeiStored = lastChar === PULLI || isBaseConsonant(lastChar) || ALL_SIGNS.includes(lastChar);
  if (!isMeiStored && STANDALONE_VOWEL_UPGRADES[lastChar]?.[key]) {
    const updatedLeft = leftPart.slice(0, -1) + STANDALONE_VOWEL_UPGRADES[lastChar][key];
    return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
  }

  // Normal Entry: Consonants produce Mei with Pulli by default (Rule 4.1)
  const updatedLeft = leftPart + entry.main;
  return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
}

/**
 * Helper to check if a produced character is a "correct progress" towards a target grapheme.
 * Used to prevent the cursor from jumping forward during vowel composition (e.g., 'ய்' -> 'யா').
 */
export function isPotentialMatch(produced: string, target: string): boolean {
  if (!produced || !target) return false;
  if (produced === target) return true;

  // 1. Direct sub-string match (Vowel Doubling sequence)
  const VOWEL_PAIRS: Record<string, string> = {
    'ஆ': 'அ', 'ஈ': 'இ', 'ஊ': 'உ', 'ஏ': 'எ', 'ஓ': 'ஒ'
  };
  if (VOWEL_PAIRS[target] === produced) return true;

  const getBase = (s: string) => s.replace(/[\u0BCD\u0BBE-\u0BCC\u0BD7]/g, '');
  const getSign = (s: string) => {
    const match = s.match(/[\u0BBE-\u0BCC\u0BD7]/);
    return match ? match[0] : '';
  };
  const hasPulli = (s: string) => s.includes(PULLI);

  const producedBase = getBase(produced.normalize('NFC'));
  const targetBase = getBase(target.normalize('NFC'));

  // If bases are different, no match (handled Vowel Doubling above)
  if (producedBase !== targetBase) return false;

  const producedSign = getSign(produced);
  const targetSign = getSign(target);
  const producedHasPulli = hasPulli(produced);
  const targetHasPulli = hasPulli(target);

  // If produced has a non-pulli sign, it MUST match the target's sign exactly
  if (producedSign && producedSign !== targetSign) return false;

  // If target has a pulli, produced should only match if it's base (progress to pulli)
  if (targetHasPulli && !producedHasPulli && !producedSign) return true;

  // If target has a sign, produced can be base or pulli-version
  if (targetSign && (producedHasPulli || !producedSign)) return true;

  // If target is base (e.g. 'க'), produced can be pulli-version ('க்')
  if (!targetSign && !targetHasPulli && producedHasPulli) return true;

  // Otherwise, fallback: if they share base and produced has no sign/pulli
  return !producedSign && !producedHasPulli;
}

export function handleTamilBackspace(
  text: string,
  cursorStart: number,
  cursorEnd: number
): { text: string; newCursorPos: number } {
  if (cursorStart !== cursorEnd) {
    const start = Math.min(cursorStart, cursorEnd);
    const end = Math.max(cursorStart, cursorEnd);
    return { text: text.slice(0, start) + text.slice(end), newCursorPos: start };
  }

  if (cursorStart === 0) return { text, newCursorPos: 0 };

  const leftPart = text.slice(0, cursorStart);
  const rightPart = text.slice(cursorStart);

  // Rule 7 Behavior:
  // We use grapheme splitting to ensure we remove exactly one logical block
  // This ensures that complex characters like "மூ" or "கா" are removed entirely
  // instead of leaving the base consonant behind.
  const graphemes = getTamilGraphemes(leftPart);
  graphemes.pop();
  const updatedLeft = graphemes.join("");
  return { text: updatedLeft + rightPart, newCursorPos: updatedLeft.length };
}

/**
 * Robust match helper for comparing multi-character sequences
 */
export function robustMatch(typed: string, target: string): boolean {
  return typed.normalize('NFC') === target.normalize('NFC');
}
