import mongoose from 'mongoose';
import Advertisement from './src/models/Advertisement';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tamil_typing';

async function updateAds() {
    try {
        await mongoose.connect(dbUri);
        const result = await Advertisement.updateMany(
            { position: { $nin: ['left-side', 'right-side'] } },
            { $set: { position: 'left-side' } }
        );
        console.log(`Updated ${result.modifiedCount} advertisements to 'left-side' position.`);

        const ads = await Advertisement.find({});
        console.log('Current Advertisements:');
        ads.forEach(ad => {
            console.log(`- Title: ${ad.title}, Position: ${ad.position}, Active: ${ad.isActive}`);
        });
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

updateAds();
