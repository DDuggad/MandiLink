import express from 'express';
import mongoose from 'mongoose';
import { Transporter } from '../models/Transporter.js';
import { SEED_TRANSPORTERS } from '../seed/data.js';
import { calculateDistanceKm } from '../utils/geo.js';

const router = express.Router();

// GET /api/transporters/nearby?lat=&lng=&radiusKm=&limit=
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radiusKm) || 80;
    const limit = parseInt(req.query.limit) || 10;

    if (mongoose.connection.readyState === 1) {
      if (!isNaN(lat) && !isNaN(lng)) {
        const transporters = await Transporter.aggregate([
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

        const mapped = transporters.map((t) => ({
          ...t,
          distanceKm: Math.round((t.distanceMeters / 1000) * 10) / 10,
        }));
        return res.json({ success: true, count: mapped.length, data: mapped });
      }

      const all = await Transporter.find({ isActive: true, isDeleted: false }).limit(
        limit
      );
      return res.json({ success: true, count: all.length, data: all });
    }

    // In-memory fallback
    let results = SEED_TRANSPORTERS.map((t, idx) => {
      const [tLng, tLat] = t.baseLocation.coordinates;
      const distanceKm =
        !isNaN(lat) && !isNaN(lng) ? calculateDistanceKm(lng, lat, tLng, tLat) : null;
      return { _id: `transporter-seed-${idx + 1}`, ...t, distanceKm };
    });

    if (!isNaN(lat) && !isNaN(lng)) {
      results = results
        .filter((t) => t.distanceKm <= radiusKm)
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

export default router;
