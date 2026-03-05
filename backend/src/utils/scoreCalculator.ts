
/**
 * Split text into Tamil logical units (graphemes)
 */
export function getTamilGraphemes(text: string): string[] {
    // Use Intl.Segmenter if available (Node.js 16.0.0+)
    const IntlAny = Intl as any;
    if (typeof IntlAny !== 'undefined' && IntlAny.Segmenter) {
        const segmenter = new IntlAny.Segmenter('ta', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(text)).map((s: any) => s.segment);
    }
    // Fallback regex for Tamil graphemes
    const tamilRegex = /[\u0B80-\u0BFF][\u0BBE-\u0BCD\u0BD7]*|./g;
    return text.match(tamilRegex) || [];
}

interface ScoreInput {
    targetText: string;
    typedText: string;
    durationMs: number;
}

interface ScoreResult {
    wpm: number;
    accuracy: number;
    score: number;
    mistakes: number;
}

export function calculateScore(input: ScoreInput): ScoreResult {
    const { targetText, typedText, durationMs } = input;

    const targetGraphemes = getTamilGraphemes(targetText);
    const typedGraphemes = getTamilGraphemes(typedText);

    let correctChars = 0;
    const length = Math.min(typedGraphemes.length, targetGraphemes.length);

    for (let i = 0; i < length; i++) {
        if (typedGraphemes[i] === targetGraphemes[i]) {
            correctChars++;
        }
    }

    const totalTyped = typedGraphemes.length;
    const mistakes = Math.max(0, totalTyped - correctChars);

    const accuracyRatio = totalTyped > 0 ? (correctChars / totalTyped) : 1;
    const accuracy = Math.round(accuracyRatio * 100);

    // WPM = (Correct Characters / Duration in Minutes) / 5
    // But our frontend uses a slightly different "Score" formula:
    // (Correct Characters / Time Seconds × 60) × (Accuracy ratio)

    const timeInSeconds = Math.max(durationMs / 1000, 1);
    const wpm = Math.round((correctChars / timeInSeconds * 60) / 5); // Standard 5-char word

    // The frontend seems to use Score = (Correct Characters / Time Seconds * 60) * AccuracyRatio
    // Let's match that "Score" for tournaments if needed, but WPM is usually what people see.
    const score = Math.round((correctChars / timeInSeconds * 60) * accuracyRatio);

    return {
        wpm,
        accuracy,
        score,
        mistakes
    };
}
