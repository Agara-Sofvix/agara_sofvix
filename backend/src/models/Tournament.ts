import mongoose, { Document, Schema } from 'mongoose';

export interface ITournament extends Document {
    name: string;
    subheading?: string;
    startTime: Date;
    endTime: Date;
    textContent?: mongoose.Schema.Types.ObjectId; // Reference to TamilText
    participants: mongoose.Schema.Types.ObjectId[];
    status: 'upcoming' | 'live' | 'completed';
    createdBy: mongoose.Schema.Types.ObjectId;
    creatorModel: 'User' | 'Admin';
}

const TournamentSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    subheading: {
        type: String,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    textContent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TamilText',
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed'],
        default: 'upcoming',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'creatorModel',
    },
    creatorModel: {
        type: String,
        required: true,
        enum: ['User', 'Admin'],
        default: 'User',
    },
}, {
    timestamps: true,
});

const Tournament = mongoose.model<ITournament>('Tournament', TournamentSchema);

export default Tournament;
