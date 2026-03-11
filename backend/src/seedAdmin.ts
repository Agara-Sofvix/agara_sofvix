import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin';
import connectDB from './config/db';

dotenv.config();

export const seedAdmin = async () => {
    try {
        const email = 'admin@ezhuthidu.com';
        const password = process.env.ADMIN_DEFAULT_PASSWORD || 'Admin@123';
        const forceReset = process.env.FORCE_RESET_ADMIN === 'true';

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            if (forceReset) {
                console.log('FORCE_RESET_ADMIN is true. Updating admin credentials...');
                existingAdmin.password = password;
                existingAdmin.isActive = true;
                // Optional: reset token version to force logout everywhere
                existingAdmin.tokenVersion = (existingAdmin.tokenVersion || 1) + 1;
                await existingAdmin.save();
                console.log('Admin credentials updated successfully.');
            } else {
                console.log('Admin already exists. Use FORCE_RESET_ADMIN=true to reset credentials.');
            }
            return;
        }

        // Create admin
        await Admin.create({
            name: 'Admin',
            email,
            password,
            isActive: true,
        });

        console.log('Admin created successfully');
        console.log(`Email: ${email}`);
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
