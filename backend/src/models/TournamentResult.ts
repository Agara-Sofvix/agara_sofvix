import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentResult extends Document {
    user: mongoose.Schema.Types.ObjectId;
    tournament: mongoose.Schema.Types.ObjectId;
    wpm: number;
    accuracy: number;
    score: number; // Could be same as WPM or a derived score
    timestamp: Date;
    testSessionId?: string; // For idempotency
    createdAt: Date;
    updatedAt: Date;
}

const TournamentResultSchema: Schema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    tournament: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tournament',
        required: true,
    },
    wpm: {
        type: Number,
        required: true,
    },
    accuracy: {
        type: Number,
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    testSessionId: {
        type: String,
        unique: true,
        sparse: true,
    },
}, {
    timestamps: true,
});

// Index for efficient leaderboard queries (rankings)
TournamentResultSchema.index({ tournament: 1, score: -1 });

// Index for created_at as requested
TournamentResultSchema.index({ createdAt: 1 });

// Index for efficient user history lookup
TournamentResultSchema.index({ user: 1, createdAt: -1 });

// Unique compound index to prevent multiple entries per user per tournament
// Note: testSessionId already has a unique index for secondary idempotency
TournamentResultSchema.index({ user: 1, tournament: 1 }, { unique: true });

const TournamentResult = mongoose.model<ITournamentResult>('TournamentResult', TournamentResultSchema);

export default TournamentResult;
