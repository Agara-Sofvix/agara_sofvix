import express from 'express';
import { getActiveAdvertisements } from '../controllers/advertisementController';

const router = express.Router();

// @desc    Get active advertisements for frontend
// @route   GET /api/advertisements/active
// @access  Public
router.get('/active', getActiveAdvertisements);

export default router;
