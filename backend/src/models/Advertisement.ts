import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
    title: string;
    description?: string;
    ctaText?: string;
    imageUrl?: string;
    linkUrl: string;
    position: 'left-side' | 'right-side';
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    themeIndex: number;
    createdAt: Date;
    updatedAt: Date;
}

const AdvertisementSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    ctaText: { type: String },
    imageUrl: { type: String },
    linkUrl: { type: String, required: true },
    position: {
        type: String,
        enum: ['left-side', 'right-side'],
        default: 'left-side'
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    themeIndex: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
