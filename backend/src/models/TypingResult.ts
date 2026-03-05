import mongoose, { Document, Schema } from 'mongoose';

export interface ITypingResult extends Document {
    user: mongoose.Schema.Types.ObjectId;
    wpm: number;
    accuracy: number;
    mistakes: number;
    text: string; // The text that was typed (optional or clipped)
    duration: number; // in seconds
    testSessionId?: string; // For idempotency
    createdAt: Date;
    updatedAt: Date;
}

const TypingResultSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    wpm: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    mistakes: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
    },
    duration: {
        type: Number,
        required: true,
    },
    testSessionId: {
        type: String,
        unique: true,
        sparse: true, // Allow existing records without it, but new ones must be unique if present
    },
}, {
    timestamps: true,
});

// Index for efficient user history lookup
TypingResultSchema.index({ user: 1, createdAt: -1 });

// Index for performance on WPM queries/rankings
TypingResultSchema.index({ wpm: -1 });

const TypingResult = mongoose.model<ITypingResult>('TypingResult', TypingResultSchema);

export default TypingResult;
