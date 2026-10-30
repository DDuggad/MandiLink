import express from 'express';
import mongoose from 'mongoose';
import { Mandi } from '../models/Mandi.js';
import { SEED_MANDIS } from '../seed/data.js';
import { calculateDistanceKm } from '../utils/geo.js';

const router = express.Router();

// GET /api/mandis/nearby?lat=&lng=&radiusKm=&limit=
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radiusKm) || 50; // default 50km
    const limit = parseInt(req.query.limit) || 5; // default top 5

    // Check if MongoDB is connected and has data
    if (mongoose.connection.readyState === 1) {
      if (!isNaN(lat) && !isNaN(lng)) {
        // GeoJSON near query in meters
        const mandis = await Mandi.aggregate([
          {
            $geoNear: {
              near: { type: 'Point', coordinates: [lng, lat] },
              distanceField: 'distanceMeters',
              maxDistance: radiusKm * 1000,
              spherical: true,
              query: { isActive: true, isDeleted: false },
            },
          },
          { $limit: limit },
        ]);

        const mapped = mandis.map((m) => ({
          ...m,
          distanceKm: Math.round((m.distanceMeters / 1000) * 10) / 10,
        }));
        return res.json({ success: true, count: mapped.length, data: mapped });
      }

      const all = await Mandi.find({ isActive: true, isDeleted: false }).limit(limit);
      return res.json({ success: true, count: all.length, data: all });
    }

    // In-memory fallback
    let results = SEED_MANDIS.map((m, idx) => {
      const [mLng, mLat] = m.location.coordinates;
      const distanceKm =
        !isNaN(lat) && !isNaN(lng) ? calculateDistanceKm(lng, lat, mLng, mLat) : null;
      return {
        _id: `mandi-seed-${idx + 1}`,
        ...m,
        distanceKm,
      };
    });

    if (!isNaN(lat) && !isNaN(lng)) {
      results = results
        .filter((m) => m.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, limit);
    } else {
      results = results.slice(0, limit);
    }

    res.json({
      success: true,
      source: 'in-memory-seed',
      count: results.length,
      data: results,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/mandis
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mandis = await Mandi.find({ isActive: true, isDeleted: false });
      return res.json({ success: true, count: mandis.length, data: mandis });
    }

    res.json({
      success: true,
      source: 'in-memory-seed',
      count: SEED_MANDIS.length,
      data: SEED_MANDIS.map((m, idx) => ({ _id: `mandi-seed-${idx + 1}`, ...m })),
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
