import { Request, Response } from 'express';
import PDFDocumentModel from '../models/PDFDocument';
import { generatePDFFromText } from '../services/pdfService';
import path from 'path';
import fs from 'fs';
// import { v4 as uuidv4 } from 'uuid';

// @desc    Generate PDF from text
// @route   POST /api/pdf/generate
// @access  Private
export const generatePDFController = async (req: Request, res: Response): Promise<void> => {
    const { text } = req.body;

    if (!text) {
        res.status(400).json({ message: 'Text is required' });
        return;
    }

    try {
        const filename = `typing_result_${Date.now()}_${Math.round(Math.random() * 1E9)}.pdf`;
        const uploadsDir = path.join(__dirname, '../../public/uploads'); // Ensure this dir exists

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const filePath = path.join(uploadsDir, filename);

        await generatePDFFromText(text, filePath);

        const pdfUrl = `/uploads/${filename}`;

        const pdfDoc = await PDFDocumentModel.create({
            user: (req as any).user._id,
            content: text,
            pdfUrl,
        });

        res.status(201).json({
            success: true,
            message: 'PDF generated successfully',
            data: {
                pdfUrl,
                id: pdfDoc._id
            }
        });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'PDF generation failed' });
    }
};
