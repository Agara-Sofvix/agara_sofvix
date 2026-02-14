import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
    admin: mongoose.Schema.Types.ObjectId;
    action: string;
    targetType: string;
    targetId?: mongoose.Schema.Types.ObjectId;
    metadata?: Record<string, any>;
    ipAddress?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
    },
    action: {
        type: String,
        required: true,
    },
    targetType: {
        type: String,
        required: true,
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
    ipAddress: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient log queries
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ admin: 1, timestamp: -1 });

const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
