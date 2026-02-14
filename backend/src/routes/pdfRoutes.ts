import express from 'express';
import { generatePDFController } from '../controllers/pdfController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/generate', protect, generatePDFController);

export default router;
