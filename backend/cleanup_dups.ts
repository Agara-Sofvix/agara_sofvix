import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupDuplicates = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Ezhuthidu';
        await mongoose.connect(mongoUri);
        const db = mongoose.connection.db;
        const collection = db.collection('tournamentresults');

        console.log('Searching for duplicates...');
        const duplicates = await collection.aggregate([
            {
                $group: {
                    _id: { user: '$user', tournament: '$tournament' },
                    count: { $sum: 1 },
                    ids: { $push: '$_id' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]).toArray();

        console.log(`Found ${duplicates.length} sets of duplicates.`);

        for (const dup of duplicates) {
            const [keepId, ...deleteIds] = dup.ids;
            console.log(`Keeping ${keepId}, deleting ${deleteIds.length} duplicates for user ${dup._id.user} in tournament ${dup._id.tournament}`);
            await collection.deleteMany({ _id: { $in: deleteIds } });
        }

        console.log('Cleanup complete. Attempting to force index creation...');
        try {
            await collection.createIndex({ user: 1, tournament: 1 }, { unique: true });
            console.log('✅ Unique index created successfully!');
        } catch (idxError) {
            console.error('❌ Failed to create unique index:', idxError);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Cleanup failed:', error);
        process.exit(1);
    }
};

cleanupDuplicates();
