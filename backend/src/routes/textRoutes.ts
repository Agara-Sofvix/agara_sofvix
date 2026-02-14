import express from 'express';
import TamilText from '../models/TamilText';

const router = express.Router();

// Get all texts or filter by category
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        const query = category ? { category: category as string } : {};
        const texts = await TamilText.find(query);
        res.json(texts);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// Seed initial data
router.post('/seed', async (req, res) => {
    try {
        const { texts } = req.body;
        if (!texts || !Array.isArray(texts)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        await TamilText.deleteMany({}); // Optional: clear existing
        const result = await TamilText.insertMany(texts);
        res.status(201).json({ message: 'Seeded successfully', count: result.length });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
