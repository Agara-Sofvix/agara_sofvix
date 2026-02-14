import { API_BASE } from '../config/apiConfig';
const API_URL = API_BASE;

export const registerUser = async (userData: { name: string; username: string; email: string; password: string; dob: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
    }

    return response.json();
};

export const loginUser = async (userData: { username: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
    }

    return response.json();
};

export const saveResult = async (resultData: { wpm: number; accuracy: number; mistakes: number; text?: string; duration: number }, token: string) => {
    const response = await fetch(`${API_URL}/results`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultData),
    });

    if (!response.ok) {
        throw new Error('Failed to save result');
    }

    return response.json();
};

export const submitTournamentResult = async (tournamentId: string, resultData: { wpm: number; accuracy: number; score?: number }, token: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...resultData, tournamentId }),
    });

    if (!response.ok) {
        throw new Error('Failed to submit tournament result');
    }

    return response.json();
};

export const getTournamentLeaderboard = async (tournamentId: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/leaderboard`);

    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }

    return response.json();
};

export const getProfile = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }

    return response.json();
}

export const getUserHistory = async (token: string) => {
    const response = await fetch(`${API_URL}/results`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch user history');
    }

    return response.json();
};

export const checkTournamentRegistration = async (tournamentId: string, token: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/registration-status`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to check registration status');
    }

    return response.json();
};

export const getActiveTournament = async () => {
    const response = await fetch(`${API_URL}/tournaments/active`);

    if (!response.ok) {
        throw new Error('Failed to fetch active tournament');
    }

    return response.json();
};


export const getTamilTexts = async (category?: string) => {
    const url = category ? `${API_URL}/texts?category=${category}` : `${API_URL}/texts`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch Tamil texts');
    }

    return response.json();
};

export const getNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications`);

    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }

    return response.json();
};

export const markNotificationsAsRead = async (token: string) => {
    const response = await fetch(`${API_URL}/notifications/read`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to mark notifications as read');
    }

    return response.json();
};

export const getActiveAdvertisements = async () => {
    const response = await fetch(`${API_URL}/advertisements/active`);

    if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
    }

    return response.json();
};
