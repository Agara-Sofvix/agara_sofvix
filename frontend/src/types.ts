
export interface UserStats {
    displayName: string;
    bestWpm: number;
    avgWpm: number;
    accuracy: number;
    streak: number;
    tournamentBest: number;
    dob?: string;
    profilePic?: string;
    trophies: Array<{
        id: string;
        type: 'Test' | 'Tournament' | 'Accuracy';
        tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
        label: string;
        value: number | string;
        icon: string;
    }>;
    history: Array<{
        id: string;
        date: string;
        type: string;
        wpm: number;
        accuracy: number;
        label: string;
        rank?: number;
        tournamentName?: string;
    }>;
}

export interface AppSettings {
    keyboardSound: boolean;
    handGuidance: boolean;
    duration: string;
}

export interface TournamentScore {
    wpm: number;
    accuracy: number;
    score: number;
    errors: number;
    totalChars: number;
    correctChars: number;
    wrongChars: number;
    timeTaken: string;
    submissionType: 'Manual' | 'Auto';
    timestamp: string;
}

export interface LeaderboardEntry {
    wpm: number;
    accuracy: number;
    score: number;
    user: {
        _id: string;
        username: string;
        name: string;
        profilePic?: string;
    };
}

export interface LeaderboardPageProps {
    onNavigate: (view: string) => void;
    stats: UserStats;
}
