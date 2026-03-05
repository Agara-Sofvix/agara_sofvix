import { API_BASE as API_ROOT } from '../config/apiConfig';
const API_BASE = `${API_ROOT}/admin`;

const getAuthHeaders = () => {
    const admin = localStorage.getItem('admin');
    if (!admin) return {};

    const { token } = JSON.parse(admin);
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
};

// Dashboard
export const getDashboardStats = async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

// Users
export const getUsers = async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${query}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const deleteUser = async (id: string) => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const toggleUserBan = async (id: string) => {
    const res = await fetch(`${API_BASE}/users/${id}/ban`, {
        method: 'PUT',
        headers: getAuthHeaders(),
    });
    return res.json();
};

// Tournaments
export const deleteTournament = async (id: string) => {
    const res = await fetch(`${API_BASE}/tournaments/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
};

export const updateTournamentStatus = async (id: string, status: string) => {
    const res = await fetch(`${API_BASE}/tournaments/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return res.json();
};

// Texts
export const getTexts = async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/texts?${query}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const addText = async (data: any) => {
    const res = await fetch(`${API_BASE}/texts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteText = async (id: string) => {
    const res = await fetch(`${API_BASE}/texts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
};

// Analytics
export const getUserAnalytics = async (days = 30) => {
    const res = await fetch(`${API_BASE}/analytics/users?days=${days}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const getPerformanceAnalytics = async (days = 30) => {
    const res = await fetch(`${API_BASE}/analytics/performance?days=${days}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

// Logs
export const getAuditLogs = async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/logs?${query}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

// System Events
export const getSystemEvents = async () => {
    const res = await fetch(`${API_BASE}/events`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

// Notifications
export const getNotifications = async () => {
    const res = await fetch(`${API_BASE}/notifications`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const createNotification = async (data: any) => {
    const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateNotification = async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteNotification = async (id: string) => {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
};

// Advertisements
export const getAdvertisements = async (params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/advertisements?${query}`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const addAdvertisement = async (data: any) => {
    const res = await fetch(`${API_BASE}/advertisements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const updateAdvertisement = async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/advertisements/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const deleteAdvertisement = async (id: string) => {
    const res = await fetch(`${API_BASE}/advertisements/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    return res.json();
};

// Settings
export const getSettings = async () => {
    const res = await fetch(`${API_BASE}/settings`, {
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return data.data;
};

export const updateSettings = async (data: any) => {
    const res = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
    });
    return res.json();
};

export const uploadLogo = async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);

    const admin = localStorage.getItem('admin');
    const token = admin ? JSON.parse(admin).token : '';

    const res = await fetch(`${API_BASE}/settings/logo`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.message || 'Failed to upload logo');
    }
    if (!data.logoUrl) {
        throw new Error('Server did not return logo URL');
    }
    return { logoUrl: data.logoUrl };
};

/** Fetch logo image via API (same origin as other admin requests) and return a blob URL for display. */
export const fetchLogoBlobUrl = async (): Promise<string | null> => {
    const res = await fetch(`${API_BASE}/settings/logo`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
};
