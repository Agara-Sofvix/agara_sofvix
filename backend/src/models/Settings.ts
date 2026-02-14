import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey {
    key: string;
    name: string;
    createdAt: Date;
    lastUsed?: Date;
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
        primaryColor: string;
    };
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
        primaryColor: { type: String, default: '#135bec' }
    },
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' }
});

// Ensure only one settings document exists
SettingsSchema.index({}, { unique: true });

const Settings = mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
