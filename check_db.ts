import mongoose from 'mongoose';
import TamilText from './backend/src/models/TamilText';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const check = async () => {
    await mongoose.connect(process.env.MONGODB_URI || '');
    const texts = await TamilText.find({});
    console.log('Total texts:', texts.length);
    texts.forEach(t => console.log(`ID: ${t._id}, Cat: "${t.category}", Content: "${t.content.substring(0, 20)}..."`));
    process.exit();
};

check();
