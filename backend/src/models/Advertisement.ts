import mongoose, { Schema, Document } from 'mongoose';

export interface IAdvertisement extends Document {
    title: string;
    imageUrl: string;
    linkUrl: string;
    position: 'left-side' | 'right-side';
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const AdvertisementSchema: Schema = new Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    linkUrl: { type: String, required: true },
    position: {
        type: String,
        enum: ['left-side', 'right-side'],
        default: 'left-side'
    },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

export default mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
