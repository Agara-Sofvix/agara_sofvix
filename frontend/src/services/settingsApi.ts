import axios from 'axios';

import { API_BASE } from '../config/apiConfig';
const API_URL = API_BASE;

export interface PublicSettings {
    siteName: string;
    contactEmail: string;
    maintenanceMode: boolean;
    branding: {
        logoUrl?: string;
        faviconUrl?: string;
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
        googleAnalyticsId?: string;
        googleSearchConsoleId?: string;
        robotsTxt?: string;
        sitemapEnabled: boolean;
        schemaSettings: {
            faqEnabled: boolean;
            breadcrumbEnabled: boolean;
            organizationEnabled: boolean;
        };
        socialLinks: {
            facebook?: string;
            instagram?: string;
            linkedin?: string;
            youtube?: string;
        };
    };
}

export const fetchPublicSettings = async (): Promise<PublicSettings> => {
    const response = await axios.get(`${API_URL}/settings/public`);
    return response.data?.data;
};
