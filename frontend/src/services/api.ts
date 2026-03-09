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

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
    }
    return result.data;
};

export const loginUser = async (userData: { username: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Login failed');
    }
    return result.data;
};

export const saveResult = async (resultData: { textId?: string; originalText?: string; typedText: string; durationMs: number; testSessionId: string }, token: string) => {
    const response = await fetch(`${API_URL}/typing/save`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resultData),
    });

    const result = await response.json();
    return result.data;
};

export const submitTournamentResult = async (tournamentId: string, resultData: { typedText: string; durationMs: number; testSessionId: string }, token: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...resultData, tournamentId }),
    });

    const result = await response.json();
    return result.data;
};

export const getTournamentLeaderboard = async (tournamentId: string, token?: string) => {
    const headers: any = {};
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/leaderboard`, {
        headers
    });

    if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
    }

    const result = await response.json();
    return result.data;
};

export const joinTournament = async (tournamentId: string, token: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to join tournament');
    }

    return await response.json();
};

export const getRegistrationStatus = async (tournamentId: string, token: string) => {
    const response = await fetch(`${API_URL}/tournaments/${tournamentId}/registration-status`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch registration status');
    }

    const result = await response.json();
    return result.data.isRegistered;
};

export const getProfile = async (token: string) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err: any = new Error('Failed to fetch profile');
        err.status = response.status;
        throw err;
    }

    const result = await response.json();
    return result.data;
}

export const getUserHistory = async (token: string) => {
    const response = await fetch(`${API_URL}/results`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        const err: any = new Error('Failed to fetch user history');
        err.status = response.status;
        throw err;
    }

    const result = await response.json();
    return result.data;
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

    const result = await response.json();
    return result.data;
};

export const getActiveTournament = async () => {
    const response = await fetch(`${API_URL}/tournaments/active`);

    if (!response.ok) {
        throw new Error('Failed to fetch active tournament');
    }

    const result = await response.json();
    return result.data;
};


export const getTamilTexts = async (category?: string) => {
    const url = category ? `${API_URL}/texts?category=${category}` : `${API_URL}/texts`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch Tamil texts');
    }

    const result = await response.json();
    return result.data;
};

export const getTamilTextById = async (id: string) => {
    const response = await fetch(`${API_URL}/texts/${id}`);

    if (!response.ok) {
        throw new Error('Failed to fetch Tamil text');
    }

    const result = await response.json();
    return result.data;
};

export const getNotifications = async () => {
    const response = await fetch(`${API_URL}/notifications`);

    if (!response.ok) {
        throw new Error('Failed to fetch notifications');
    }

    const result = await response.json();
    return result.data;
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

    const result = await response.json();
    return result.data;
};

export const getUnreadNotificationCount = async (token: string) => {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch unread notification count');
    }

    const result = await response.json();
    return result.data?.count || 0;
};

export const getActiveAdvertisements = async () => {
    const response = await fetch(`${API_URL}/advertisements/active`);

    if (!response.ok) {
        throw new Error('Failed to fetch advertisements');
    }

    const result = await response.json();
    return result.data;
};
export const updateProfilePic = async (formData: FormData, token: string) => {
    const response = await fetch(`${API_URL}/auth/update-profile-pic`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData,
    });

    const result = await response.json();
    return result.data;
};

export const setAvatar = async (avatarPath: string, token: string) => {
    const response = await fetch(`${API_URL}/auth/set-avatar`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarPath }),
    });

    const result = await response.json();
    return result.data;
};

export const forgotPassword = async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to request reset code');
    }

    return response.json();
};

export const verifyOTP = async (email: string, otp: string) => {
    const response = await fetch(`${API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: parseInt(otp) }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Verification failed');
    }

    return response.json();
};

export const resetPassword = async (data: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reset password');
    }

    return response.json();
};

