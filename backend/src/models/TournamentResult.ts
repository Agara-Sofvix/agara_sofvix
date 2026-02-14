import mongoose, { Document, Schema } from 'mongoose';

export interface ITournamentResult extends Document {
    user: mongoose.Schema.Types.ObjectId;
    tournament: mongoose.Schema.Types.ObjectId;
    wpm: number;
    accuracy: number;
    score: number; // Could be same as WPM or a derived score
    timestamp: Date;
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
}, {
    timestamps: true,
});

// Index for efficient leaderboard queries
TournamentResultSchema.index({ tournament: 1, wpm: -1 });

const TournamentResult = mongoose.model<ITournamentResult>('TournamentResult', TournamentResultSchema);

export default TournamentResult;
