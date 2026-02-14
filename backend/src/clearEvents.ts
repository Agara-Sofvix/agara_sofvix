import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemEvent from './models/SystemEvent';
import connectDB from './config/db';

dotenv.config();

const clearEvents = async () => {
    try {
        await connectDB();
        await SystemEvent.deleteMany({});
        console.log('All system events cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error clearing events:', error);
        process.exit(1);
    }
};

clearEvents();
