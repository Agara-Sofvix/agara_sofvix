import mongoose from 'mongoose';
import Tournament from './models/Tournament';
import User from './models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const checkAndSeed = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ezhuthidu';
        await mongoose.connect(mongoUri);
        console.log('Connected to MongoDB');

        let tournament = await Tournament.findOne();
        if (!tournament) {
            console.log('No tournament found, creating a default one...');
            const admin = await User.findOne();
            if (!admin) {
                console.error('No users found in database! Please register a user first.');
                process.exit(1);
            }

            tournament = await Tournament.create({
                name: 'Elite Championship 2026',
                startTime: new Date(),
                endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                status: 'live',
                createdBy: admin._id,
                participants: []
            });
            console.log('Created default tournament:', tournament._id);
        } else {
            console.log('Existing tournament found:', tournament._id);
        }

        process.exit(0);
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    }
};

checkAndSeed();
