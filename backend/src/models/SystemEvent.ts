import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemEvent extends Document {
    type: 'USER_SIGNUP' | 'TOURNAMENT_REGISTER' | 'TOURNAMENT_END' | 'DAILY_LEADERBOARD' | 'TEST_RESULT' | 'TOURNAMENT_LEADERBOARD_UPDATE' | 'SETTINGS_UPDATE' | 'TOURNAMENT_CREATE' | 'PASSWORD_RESET_REQUESTED' | 'PASSWORD_RESET_SUCCESS';
    title: string;
    description: string;
    metadata?: any;
    read: boolean;
    createdAt: Date;
}

const SystemEventSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: ['USER_SIGNUP', 'TOURNAMENT_REGISTER', 'TOURNAMENT_END', 'DAILY_LEADERBOARD', 'TEST_RESULT', 'TOURNAMENT_LEADERBOARD_UPDATE', 'SETTINGS_UPDATE', 'TOURNAMENT_CREATE', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_SUCCESS']
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    read: { type: Boolean, default: false },
}, { timestamps: true });

const SystemEvent = mongoose.model<ISystemEvent>('SystemEvent', SystemEventSchema);

export default SystemEvent;
