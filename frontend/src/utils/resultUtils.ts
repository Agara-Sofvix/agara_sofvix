export interface CalculationInput {
    totalEntries: number; // Total keystrokes or chars (standard is 5 chars = 1 word)
    correctEntries: number;
    errors: number;
    timeInMinutes: number;
}

export interface CalculationResult {
    grossWpm: number;
    netWpm: number;
    accuracy: number;
}

/**
 * Calculates typing test results based on standard formulas.
 * Standard Word = 5 characters (including spaces/punctuation).
 * 
 * Gross WPM = (Total Entries / 5) / Time (min)
 * Net WPM = Gross WPM - (Uncorrected Errors / Time (min))
 * Accuracy = ((Total Entries - Errors) / Total Entries) * 100
 */
export const calculateResult = (input: CalculationInput): CalculationResult => {
    const { totalEntries, errors, timeInMinutes } = input;

    if (timeInMinutes <= 0) {
        return { grossWpm: 0, netWpm: 0, accuracy: 0 };
    }

    const grossWpm = (totalEntries / 5) / timeInMinutes;
    const netWpm = Math.max(0, grossWpm - (errors / timeInMinutes)); // Penalty often just subtraction of error rate or errors per min

    // Alternative Net WPM often used: Gross WPM * (Accuracy / 100)
    // But commonly: Net WPM = Gross WPM - (Errors / Time) 

    const accuracy = totalEntries > 0
        ? ((totalEntries - errors) / totalEntries) * 100
        : 100;

    return {
        grossWpm: Math.round(grossWpm),
        netWpm: Math.round(netWpm),
        accuracy: Math.round(accuracy)
    };
};
