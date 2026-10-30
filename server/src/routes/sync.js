import express from 'express';
import mongoose from 'mongoose';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { Price } from '../models/Price.js';
import { Transporter } from '../models/Transporter.js';
import {
  SEED_MANDIS,
  SEED_COMMODITIES,
  SEED_TRANSPORTERS,
  generatePriceHistory,
} from '../seed/data.js';

const router = express.Router();

// GET /api/sync?since=<ISOString>&lat=&lng=&radiusKm=
// Returns only changes since the client's lastSyncedAt timestamp, minimizing payload size on slow 2G/3G connections.
router.get('/', async (req, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since) : new Date(0);
    const serverTime = new Date().toISOString();

    if (mongoose.connection.readyState === 1) {
      // Pull only records updated after `since`
      const [mandis, commodities, prices, transporters] = await Promise.all([
        Mandi.find({ updatedAt: { $gt: since } }).limit(500),
        Commodity.find({ updatedAt: { $gt: since } }),
        Price.find({ updatedAt: { $gt: since } })
          .sort({ date: -1 })
          .limit(1000),
        Transporter.find({ updatedAt: { $gt: since } }).limit(200),
      ]);

      return res.json({
        serverTime,
        isDelta: since.getTime() > 0,
        counts: {
          mandis: mandis.length,
          commodities: commodities.length,
          prices: prices.length,
          transporters: transporters.length,
        },
        data: { mandis, commodities, prices, transporters, deletedIds: [] },
      });
    }

    // In-memory fallback
    const seedPrices = generatePriceHistory();
    res.json({
      serverTime,
      isDelta: false,
      counts: {
        mandis: SEED_MANDIS.length,
        commodities: SEED_COMMODITIES.length,
        prices: seedPrices.length,
        transporters: SEED_TRANSPORTERS.length,
      },
      data: {
        mandis: SEED_MANDIS.map((m, idx) => ({ _id: `mandi-seed-${idx + 1}`, ...m })),
        commodities: SEED_COMMODITIES.map((c, idx) => ({
          _id: `comm-seed-${idx + 1}`,
          ...c,
        })),
        prices: seedPrices.map((p, idx) => ({ _id: `price-seed-${idx + 1}`, ...p })),
        transporters: SEED_TRANSPORTERS.map((t, idx) => ({
          _id: `transporter-seed-${idx + 1}`,
          ...t,
        })),
        deletedIds: [],
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
