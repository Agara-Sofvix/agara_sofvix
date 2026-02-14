import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin';
import connectDB from './config/db';

dotenv.config();

export const seedAdmin = async () => {
    try {
        // connectDB is called in app.ts, so we might not need to call it here if running from app.ts
        // But for safety, check connection state or assume connected. 
        // If running as standalone script, we need to connect. 
        // For now, let's assume this is called after DB connection.

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@ezhuthidu.com' });

        if (existingAdmin) {
            console.log('Admin already exists.');
            // Optional: Update password if needed, but for auto-seed on restart, likely just skip
            return;
        }

        // Get password from env or default
        const password = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';

        // Create admin
        const admin = await Admin.create({
            name: 'Admin',
            email: 'admin@ezhuthidu.com',
            password,
            isActive: true,
        });

        console.log('Admin created successfully');
        console.log('Email: admin@ezhuthidu.com');
        console.log('Please change the password after first login');

    } catch (error) {
        console.error('Error seeding admin:', error);
    }
};

// Allow standalone execution if called directly
if (require.main === module) {
    connectDB().then(() => {
        seedAdmin().then(() => {
            process.exit(0);
        });
    });
}
