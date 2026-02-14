import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    title: string;
    description: string;
    tag: 'Update' | 'Exam' | 'New' | 'Notice';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tag: {
        type: String,
        enum: ['Update', 'Exam', 'New', 'Notice'],
        default: 'Notice'
    },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
