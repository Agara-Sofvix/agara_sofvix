import mongoose, { Schema, Document } from 'mongoose';

export interface ITamilText extends Document {
    category: string;
    content: string;
    difficulty?: 'easy' | 'medium' | 'hard';
    tags?: string[];
    createdAt: Date;
}

const TamilTextSchema: Schema = new Schema({
    category: { type: String, required: true, index: true },
    content: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITamilText>('TamilText', TamilTextSchema);
