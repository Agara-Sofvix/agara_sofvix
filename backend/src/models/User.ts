import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    isBanned: boolean;
    dob: Date;
    lastNotificationReadAt: Date;
    profilePic?: string;
    resetOTP?: number;
    resetOTPExpire?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    tokenVersion: number;
    matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    dob: {
        type: Date,
        required: true,
    },
    isBanned: {
        type: Boolean,
        default: false,
    },
    lastNotificationReadAt: {
        type: Date,
        default: Date.now,
    },
    profilePic: {
        type: String,
        default: '',
    },
    resetOTP: {
        type: Number,
    },
    resetOTPExpire: {
        type: Date,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
    tokenVersion: {
        type: Number,
        default: 1,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.password;
            delete ret.resetOTP;
            delete ret.resetOTPExpire;
            delete ret.tokenVersion;
            delete ret.__v;
            return ret;
        }
    }
});

UserSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
