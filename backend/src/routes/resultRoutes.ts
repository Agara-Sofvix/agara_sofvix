import express from 'express';
import { saveResult, getUserResults } from '../controllers/resultController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.route('/').post(protect, saveResult).get(protect, getUserResults);

export default router;
