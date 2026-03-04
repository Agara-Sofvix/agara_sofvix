import axios from 'axios';
import { ADMIN_API_URL } from '../config/apiConfig';

const API_URL = ADMIN_API_URL;

// Get auth token from localStorage
const getAuthToken = () => {
    const adminUser = localStorage.getItem('adminUser');
    if (adminUser) {
        try {
            const user = JSON.parse(adminUser);
            return user.token;
        } catch (error) {
            console.error('Failed to parse adminUser:', error);
            return null;
        }
    }
    return null;
};

// Create axios instance with auth header
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface Settings {
    siteName: string;
    contactEmail: string;
    maintenanceMode: boolean;
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    webhookUrl: string;
    marqueeText?: string;
    apiKeys: Array<{
        key: string;
        name: string;
        createdAt: Date;
        lastUsed?: Date;
    }>;
    notifications: {
        newRegistration: boolean;
        tournamentReports: boolean;
        securityAlerts: boolean;
    };
    branding: {
        logoUrl?: string;
        primaryColor: string;
    };
    seo: {
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        twitterHandle: string;
        googleAnalyticsId: string;
        googleSearchConsoleId: string;
        robotsTxt: string;
        sitemapEnabled: boolean;
        schemaSettings: {
            faqEnabled: boolean;
            breadcrumbEnabled: boolean;
            organizationEnabled: boolean;
        };
        linkedin: string;
        youtube: string;
        faqItems: Array<{ question: string; answer: string }>;
    };
    primaryKeywords: string[];
    longTailKeywords: string[];
}

export const fetchSettings = async (): Promise<Settings> => {
    const response = await api.get('/settings');
    return response.data;
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
    const response = await api.put('/settings', settings);
    return response.data.settings;
};

export const generateApiKey = async (name: string): Promise<{ key: string; name: string }> => {
    const response = await api.post('/settings/api-keys', { name });
    return response.data;
};

export const revokeApiKey = async (key: string): Promise<void> => {
    await api.delete(`/settings/api-keys/${key}`);
};

export const uploadLogo = async (file: File): Promise<{ logoUrl: string }> => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await api.post('/settings/logo', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};
