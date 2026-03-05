import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import TournamentResult from './src/models/TournamentResult';
import TypingResult from './src/models/TypingResult';

dotenv.config({ path: path.join(__dirname, '../.env') });

const verifyDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ezhuthidu';
        console.log(`Connecting to ${mongoUri}`);
        await mongoose.connect(mongoUri);

        const db: any = mongoose.connection.db;

        console.log('\n--- TournamentResult Indexes ---');
        const trIndexes = await db.collection('tournamentresults').indexes();
        console.log(JSON.stringify(trIndexes, null, 2));

        console.log('\n--- TypingResult Indexes ---');
        const tyIndexes = await db.collection('typingresults').indexes();
        console.log(JSON.stringify(tyIndexes, null, 2));

        // Check for specific required indexes
        const trIndexKeys = trIndexes.map((idx: any) => Object.keys(idx.key).join('_'));
        const trUnique = trIndexes.filter((idx: any) => idx.unique).map((idx: any) => Object.keys(idx.key).join('_'));

        const tyIndexKeys = tyIndexes.map((idx: any) => Object.keys(idx.key).join('_'));

        console.log('\nVerification Summary:');

        // TournamentResult checks
        if (trIndexKeys.includes('tournament_score')) {
            console.log('✅ Tournament Leaderboard Index (tournament_score) exists');
        } else {
            console.log('❌ Tournament Leaderboard Index (tournament_score) MISSING');
        }

        if (trUnique.includes('user_tournament')) {
            console.log('✅ Unique User/Tournament Constraint exists');
        } else {
            console.log('❌ Unique User/Tournament Constraint MISSING');
        }

        if (trIndexKeys.includes('createdAt')) {
            console.log('✅ TournamentResult CreatedAt Index exists');
        } else {
            console.log('❌ TournamentResult CreatedAt Index MISSING');
        }

        // TypingResult checks
        if (tyIndexKeys.includes('user_createdAt')) {
            console.log('✅ TypingResult History Index (user_createdAt) exists');
        } else {
            console.log('❌ TypingResult History Index (user_createdAt) MISSING');
        }

        if (tyIndexKeys.includes('wpm')) {
            console.log('✅ TypingResult WPM Index exists');
        } else {
            console.log('❌ TypingResult WPM Index MISSING');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Verification failed:', error);
        process.exit(1);
    }
};

verifyDatabase();
