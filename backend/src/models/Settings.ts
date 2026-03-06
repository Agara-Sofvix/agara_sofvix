import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey {
    key: string;
    name: string;
    createdAt: Date;
    lastUsed?: Date;
}

export interface IFaqItem {
    question: string;
    answer: string;
}

export interface IPageSeo {
    path: string;
    title: string;
    description: string;
    keywords: string;
}

export interface ISettings extends Document {
    siteName: string;
    marqueeText: string;
    contactEmail: string;
    maintenanceMode: boolean;
    sessionTimeout: number;
    twoFactorEnabled: boolean;
    webhookUrl: string;
    apiKeys: IApiKey[];
    notifications: {
        newRegistration: boolean;
        tournamentReports: boolean;
        securityAlerts: boolean;
    };
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
            faqItems: IFaqItem[];
        };
        socialLinks: {
            facebook?: string;
            instagram?: string;
            linkedin?: string;
            youtube?: string;
        };
        primaryKeywords: string[];
        longTailKeywords: string[];
    };
    pagesSeo: IPageSeo[];
    updatedAt: Date;
    updatedBy?: mongoose.Types.ObjectId;
}

const ApiKeySchema = new Schema({
    key: { type: String, required: true },
    name: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date }
});

const SettingsSchema = new Schema({
    siteName: { type: String, required: true, default: 'Ezhuthidu' },
    marqueeText: { type: String, default: '🏆 Tamil Typing Tournament – Registration Open | ⏳ Tournament Starts in 2 Days' },
    contactEmail: { type: String, required: true, default: 'admin@ezhuthidu.com' },
    maintenanceMode: { type: Boolean, default: false },
    sessionTimeout: { type: Number, default: 60 }, // in minutes
    twoFactorEnabled: { type: Boolean, default: true },
    webhookUrl: { type: String, default: '' },
    apiKeys: [ApiKeySchema],
    notifications: {
        newRegistration: { type: Boolean, default: true },
        tournamentReports: { type: Boolean, default: true },
        securityAlerts: { type: Boolean, default: true }
    },
    branding: {
        logoUrl: { type: String },
        faviconUrl: { type: String },
        primaryColor: { type: String, default: '#135bec' }
    },
    seo: {
        metaTitle: { type: String, default: 'எழுத்திடு - Master Tamil Typing' },
        metaDescription: { type: String, default: 'Learn and master Tamil typing with interactive lessons, tests, and tournaments.' },
        metaKeywords: { type: String, default: 'tamil typing, learn tamil, typing test, tamil keyboard' },
        ogTitle: { type: String, default: 'எழுத்திடு - Tamil Typing Platform' },
        ogDescription: { type: String, default: 'Master Tamil typing through engagement and fun.' },
        ogImage: { type: String, default: '' },
        twitterHandle: { type: String, default: '@ezhuthidu' },
        googleAnalyticsId: { type: String, default: '' },
        googleSearchConsoleId: { type: String, default: '' },
        robotsTxt: { type: String, default: 'User-agent: *\nAllow: /' },
        sitemapEnabled: { type: Boolean, default: true },
        schemaSettings: {
            faqEnabled: { type: Boolean, default: true },
            breadcrumbEnabled: { type: Boolean, default: true },
            organizationEnabled: { type: Boolean, default: true },
            faqItems: [{
                question: { type: String, required: true },
                answer: { type: String, required: true }
            }]
        },
        socialLinks: {
            facebook: { type: String, default: '' },
            instagram: { type: String, default: '' },
            linkedin: { type: String, default: '' },
            youtube: { type: String, default: '' }
        },
        primaryKeywords: { type: [String], default: ['tamil typing game', 'tamil typing practice', 'tamil typing speed test', 'learn tamil typing online'] },
        longTailKeywords: { type: [String], default: ['how to learn tamil typing fast', 'tamil keyboard typing practice online', 'free tamil typing speed test', 'best tamil typing game online', 'tamil typing practice for beginners'] }
    },
    pagesSeo: [{
        path: { type: String, required: true },
        title: { type: String, default: '' },
        description: { type: String, default: '' },
        keywords: { type: String, default: '' },
    }],
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }
});

// Ensure only one settings document exists
SettingsSchema.index({}, { unique: true });

const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
