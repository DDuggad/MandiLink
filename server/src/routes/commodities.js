import express from 'express';
import mongoose from 'mongoose';
import { Commodity } from '../models/Commodity.js';
import { SEED_COMMODITIES } from '../seed/data.js';

const router = express.Router();

// GET /api/commodities
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const commodities = await Commodity.find({ isDeleted: false });
      return res.json({ success: true, count: commodities.length, data: commodities });
    }

    res.json({
      success: true,
      source: 'in-memory-seed',
      count: SEED_COMMODITIES.length,
      data: SEED_COMMODITIES.map((c, idx) => ({ _id: `comm-seed-${idx + 1}`, ...c })),
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
