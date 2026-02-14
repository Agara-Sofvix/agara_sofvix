import { Request, Response } from 'express';
import Advertisement from '../models/Advertisement';
import AuditLog from '../models/AuditLog';

// @desc    Get all advertisements
// @route   GET /api/admin/advertisements
// @access  Private (Admin)
export const getAdvertisements = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const advertisements = await Advertisement.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Advertisement.countDocuments();

        res.json({
            advertisements,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add new advertisement
// @route   POST /api/admin/advertisements
// @access  Private (Admin)
export const addAdvertisement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, imageUrl, linkUrl, position, isActive, startDate, endDate } = req.body;

        const advertisement = await Advertisement.create({
            title,
            imageUrl,
            linkUrl,
            position,
            isActive,
            startDate: startDate || undefined,
            endDate: endDate || undefined
        });

        // Log the action
        if ((req as any).admin) {
            await AuditLog.create({
                admin: (req as any).admin._id,
                action: 'ADD_ADVERTISEMENT',
                targetType: 'Advertisement',
                targetId: advertisement._id,
                metadata: { title, position },
                ipAddress: req.ip,
            });
        }

        res.status(201).json(advertisement);
    } catch (error: any) {
        console.error('Add Advertisement Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update advertisement
// @route   PUT /api/admin/advertisements/:id
// @access  Private (Admin)
export const updateAdvertisement = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, imageUrl, linkUrl, position, isActive, startDate, endDate } = req.body;

        const advertisement = await Advertisement.findByIdAndUpdate(
            req.params.id,
            {
                title,
                imageUrl,
                linkUrl,
                position,
                isActive,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            },
            { new: true, runValidators: true }
        );

        if (!advertisement) {
            res.status(404).json({ message: 'Advertisement not found' });
            return;
        }

        // Log the action
        if ((req as any).admin) {
            await AuditLog.create({
                admin: (req as any).admin._id,
                action: 'UPDATE_ADVERTISEMENT',
                targetType: 'Advertisement',
                targetId: req.params.id,
                ipAddress: req.ip,
            });
        }

        res.json(advertisement);
    } catch (error: any) {
        console.error('Update Advertisement Error:', error);
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete advertisement
// @route   DELETE /api/admin/advertisements/:id
// @access  Private (Admin)
export const deleteAdvertisement = async (req: Request, res: Response): Promise<void> => {
    try {
        const advertisement = await Advertisement.findById(req.params.id);

        if (!advertisement) {
            res.status(404).json({ message: 'Advertisement not found' });
            return;
        }

        await Advertisement.findByIdAndDelete(req.params.id);

        // Log the action
        if ((req as any).admin) {
            await AuditLog.create({
                admin: (req as any).admin._id,
                action: 'DELETE_ADVERTISEMENT',
                targetType: 'Advertisement',
                targetId: req.params.id,
                ipAddress: req.ip,
            });
        }

        res.json({ message: 'Advertisement deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active advertisements for frontend
// @route   GET /api/advertisements/active
// @access  Public
export const getActiveAdvertisements = async (req: Request, res: Response): Promise<void> => {
    try {
        const now = new Date();
        const advertisements = await Advertisement.find({
            isActive: true,
            $and: [
                {
                    $or: [
                        { startDate: { $exists: false } },
                        { startDate: { $lte: now } }
                    ]
                },
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: { $gte: now } }
                    ]
                }
            ]
        }).sort({ createdAt: -1 });

        res.json(advertisements);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
