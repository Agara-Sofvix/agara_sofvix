import { Request, Response } from 'express';
import Admin from '../models/Admin';
import AuditLog from '../models/AuditLog';
import generateToken from '../utils/generateToken';

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Find admin by email
        const admin = await Admin.findOne({ email });

        if (!admin) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Check if admin is active
        if (!admin.isActive) {
            res.status(403).json({ message: 'Account is deactivated' });
            return;
        }

        // Verify password
        const isMatch = await admin.matchPassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // Update last login
        admin.lastLogin = new Date();
        await admin.save();

        // Log the login action
        await AuditLog.create({
            admin: admin._id,
            action: 'ADMIN_LOGIN',
            targetType: 'Admin',
            targetId: admin._id,
            ipAddress: req.ip,
        });

        // Generate token
        const token = generateToken(admin._id as any);

        res.json({
            _id: admin._id,
            name: admin.name,
            email: admin.email,
            token,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admin)
export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin = await Admin.findById((req as any).admin._id).select('-password');

        if (!admin) {
            res.status(404).json({ message: 'Admin not found' });
            return;
        }

        res.json(admin);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
// @access  Private (Admin)
export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const admin: any = await Admin.findById((req as any).admin._id);

        if (admin) {
            admin.name = req.body.name || admin.name;
            admin.email = req.body.email || admin.email;

            if (req.body.password) {
                admin.password = req.body.password;
            }

            const updatedAdmin = await admin.save();

            res.json({
                _id: updatedAdmin._id,
                name: updatedAdmin.name,
                email: updatedAdmin.email,
                token: generateToken(updatedAdmin._id),
            });
        } else {
            res.status(404);
            throw new Error('Admin not found');
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Change admin password
// @route   PUT /api/admin/password
// @access  Private (Admin)
export const changeAdminPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { currentPassword, newPassword } = req.body;
        const admin: any = await Admin.findById((req as any).admin._id);

        if (admin && (await admin.matchPassword(currentPassword))) {
            admin.password = newPassword;
            await admin.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(401);
            throw new Error('Invalid current password');
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


// @desc    Admin logout (optional - mainly for audit logging)
// @route   POST /api/admin/logout
// @access  Private (Admin)
export const adminLogout = async (req: Request, res: Response): Promise<void> => {
    try {
        // Log the logout action
        await AuditLog.create({
            admin: (req as any).admin._id,
            action: 'ADMIN_LOGOUT',
            targetType: 'Admin',
            targetId: (req as any).admin._id,
            ipAddress: req.ip,
        });

        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
