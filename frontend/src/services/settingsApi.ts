import axios from 'axios';

import { API_BASE } from '../config/apiConfig';
const API_URL = API_BASE;

export interface PublicSettings {
    siteName: string;
    contactEmail: string;
    maintenanceMode: boolean;
    branding: {
        logoUrl?: string;
        primaryColor: string;
    };
}

export const fetchPublicSettings = async (): Promise<PublicSettings> => {
    const response = await axios.get(`${API_URL}/settings/public`);
    return response.data;
};
