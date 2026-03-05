import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import TournamentResult from './src/models/TournamentResult';

dotenv.config({ path: path.join(__dirname, '../.env') });

const testDatabaseFeatures = async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ezhuthidu';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const session = await mongoose.startSession();

    try {
        console.log('\n--- Testing Unique Constraint Rejection ---');
        const testUser = new mongoose.Types.ObjectId();
        const testTournament = new mongoose.Types.ObjectId();

        // First insertion
        await TournamentResult.create({
            user: testUser,
            tournament: testTournament,
            wpm: 50,
            accuracy: 95,
            score: 500,
            timestamp: new Date()
        });
        console.log('✅ First entry created');

        // Second insertion (duplicate)
        try {
            await TournamentResult.create({
                user: testUser,
                tournament: testTournament,
                wpm: 60,
                accuracy: 98,
                score: 600,
                timestamp: new Date()
            });
            console.log('❌ Error: Duplicate entry was NOT rejected!');
        } catch (error: any) {
            if (error.code === 11000) {
                console.log('✅ Success: Duplicate entry correctly rejected by unique index');
            } else {
                console.log('❌ Unexpected error during duplicate test:', error.message);
            }
        }

        // Cleanup test data
        await TournamentResult.deleteOne({ user: testUser, tournament: testTournament });

        console.log('\n--- Testing Transaction Atomicity ---');
        // This test requires a replica set or Atlas. Standalone might fail session start.
        try {
            session.startTransaction();
            const txnUser = new mongoose.Types.ObjectId();
            const txnTournament = new mongoose.Types.ObjectId();

            await TournamentResult.create([{
                user: txnUser,
                tournament: txnTournament,
                wpm: 40,
                accuracy: 90,
                score: 400,
                timestamp: new Date()
            }], { session });

            console.log('Inserted doc within transaction');

            // Deliberately abort
            await session.abortTransaction();
            console.log('Aborted transaction');

            const docExists = await TournamentResult.findOne({ user: txnUser, tournament: txnTournament });
            if (!docExists) {
                console.log('✅ Success: Transaction correctly rolled back. Document does not exist.');
            } else {
                console.log('❌ Error: Transaction failed to roll back! Document exists.');
                await TournamentResult.deleteOne({ user: txnUser, tournament: txnTournament });
            }
        } catch (txnError: any) {
            if (txnError.message.includes('replica set') || txnError.message.includes('transactions')) {
                console.log('⚠️ Transaction test skipped: Environment does not support transactions (Standalone MongoDB)');
            } else {
                console.log('❌ Transaction test failed with error:', txnError.message);
            }
        }

    } catch (error) {
        console.error('Test suite failed:', error);
    } finally {
        session.endSession();
        await mongoose.disconnect();
        console.log('\nTesting Complete.');
    }
};

testDatabaseFeatures();
