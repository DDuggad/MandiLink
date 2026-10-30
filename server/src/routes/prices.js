import express from 'express';
import mongoose from 'mongoose';
import { Price } from '../models/Price.js';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { SEED_MANDIS, SEED_COMMODITIES, generatePriceHistory } from '../seed/data.js';

const router = express.Router();

// Lazy-loaded in-memory seed prices (only computed once when needed)
let _seedPrices = null;
function getSeedPrices() {
  if (!_seedPrices) _seedPrices = generatePriceHistory();
  return _seedPrices;
}

// GET /api/prices/latest?mandiIds=&commodityIds=
router.get('/latest', async (req, res) => {
  try {
    const { mandiIds, commodityIds } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { isDeleted: false };
      if (mandiIds) query.mandiId = { $in: mandiIds.split(',') };
      if (commodityIds) query.commodityId = { $in: commodityIds.split(',') };

      // Fetch the latest price per (mandi, commodity) combination
      const prices = await Price.aggregate([
        { $match: query },
        { $sort: { date: -1 } },
        {
          $group: {
            _id: {
              mandiId: '$mandiId',
              commodityId: '$commodityId',
              variety: '$variety',
            },
            latestPrice: { $first: '$$ROOT' },
          },
        },
        { $replaceRoot: { newRoot: '$latestPrice' } },
        {
          $lookup: {
            from: 'mandis',
            localField: 'mandiId',
            foreignField: '_id',
            as: 'mandi',
          },
        },
        {
          $lookup: {
            from: 'commodities',
            localField: 'commodityId',
            foreignField: '_id',
            as: 'commodity',
          },
        },
        { $unwind: '$mandi' },
        { $unwind: '$commodity' },
      ]);

      return res.json({ success: true, count: prices.length, data: prices });
    }

    // In-memory fallback: latest by date per (mandiCode, commodityCode)
    const seedPrices = getSeedPrices();
    const latestMap = new Map();
    seedPrices.forEach((p) => {
      const key = `${p.mandiCode}:${p.commodityCode}:${p.variety}`;
      if (!latestMap.has(key) || p.date > latestMap.get(key).date) {
        latestMap.set(key, p);
      }
    });

    const results = Array.from(latestMap.values()).map((p, idx) => {
      const mandi = SEED_MANDIS.find((m) => m.code === p.mandiCode);
      const commodity = SEED_COMMODITIES.find((c) => c.code === p.commodityCode);
      return {
        _id: `price-latest-seed-${idx}`,
        ...p,
        mandi: { ...mandi },
        commodity: { ...commodity },
      };
    });

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

// GET /api/prices?mandiIds=&commodityId=&from=&to=
router.get('/', async (req, res) => {
  try {
    const { mandiIds, commodityId, from, to } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { isDeleted: false };
      if (mandiIds) query.mandiId = { $in: mandiIds.split(',') };
      if (commodityId) query.commodityId = commodityId;
      if (from || to) {
        query.date = {};
        if (from) query.date.$gte = new Date(from);
        if (to) query.date.$lte = new Date(to);
      }

      const prices = await Price.find(query)
        .sort({ date: -1 })
        .populate('mandiId', 'names state district')
        .populate('commodityId', 'names defaultUnit')
        .limit(2000);

      return res.json({ success: true, count: prices.length, data: prices });
    }

    // In-memory fallback with filtering
    let prices = getSeedPrices();
    if (mandiIds) {
      const ids = mandiIds.split(',');
      prices = prices.filter((p) => ids.includes(p.mandiCode));
    }
    if (commodityId) prices = prices.filter((p) => p.commodityCode === commodityId);
    if (from) prices = prices.filter((p) => p.date >= from);
    if (to) prices = prices.filter((p) => p.date <= to);

    prices = prices.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 500);
    res.json({
      success: true,
      source: 'in-memory-seed',
      count: prices.length,
      data: prices,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// GET /api/prices/forecast?commodityId=&mandiId=&horizonDays=
// Server-side simple statistical forecast: naive, 7-day and 30-day moving average.
// Picks the method with the lowest MAPE on backtest and returns both it and the naive baseline.
router.get('/forecast', async (req, res) => {
  try {
    const { commodityId, mandiId, horizonDays = 7 } = req.query;
    const horizon = parseInt(horizonDays) || 7;
    const MIN_HISTORY = 30; // refuse to forecast with less than this many data points

    let series = []; // sorted ascending by date: { date, modalPrice }

    if (mongoose.connection.readyState === 1 && commodityId && mandiId) {
      const prices = await Price.find({
        commodityId,
        mandiId,
        isDeleted: false,
      })
        .sort({ date: 1 })
        .select('date modalPrice -_id');

      series = prices.map((p) => ({
        date: p.date.toISOString().split('T')[0],
        value: p.modalPrice,
      }));
    } else {
      // Use in-memory seed data (best-effort match by code fragment in the query)
      const seedPrices = getSeedPrices();
      const matched = seedPrices
        .filter(
          (p) =>
            (!commodityId || p.commodityCode.includes(commodityId)) &&
            (!mandiId || p.mandiCode.includes(mandiId))
        )
        .sort((a, b) => a.date.localeCompare(b.date));
      series = matched.map((p) => ({ date: p.date, value: p.modalPrice }));
    }

    if (series.length < MIN_HISTORY) {
      return res.json({
        success: false,
        error: {
          code: 'INSUFFICIENT_DATA',
          message: `Not enough data. Need at least ${MIN_HISTORY} days of prices; have ${series.length}.`,
        },
      });
    }

    const values = series.map((s) => s.value);

    // Naive forecast: repeat last known value
    const lastValue = values[values.length - 1];
    const naiveForecast = Array(horizon).fill(lastValue);

    // 7-day moving average forecast
    const ma7 = values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
    const ma7Forecast = Array(horizon).fill(Math.round(ma7));

    // 30-day moving average forecast
    const ma30 =
      values.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, values.length);
    const ma30Forecast = Array(horizon).fill(Math.round(ma30));

    // Compute MAPE on held-out last 14 days to pick best method
    function mape(actuals, predicted) {
      const n = actuals.length;
      if (n === 0) return Infinity;
      return actuals.reduce((sum, a, i) => sum + Math.abs((a - predicted[i]) / a), 0) / n;
    }

    const holdout = values.slice(-14);
    const naiveMape = mape(
      holdout,
      Array(holdout.length).fill(values[values.length - 14 - 1])
    );
    const ma7Mape = mape(holdout, Array(holdout.length).fill(ma7));
    const ma30Mape = mape(holdout, Array(holdout.length).fill(ma30));

    const methods = [
      { name: 'naive', mape: naiveMape, forecast: naiveForecast },
      { name: 'ma7', mape: ma7Mape, forecast: ma7Forecast },
      { name: 'ma30', mape: ma30Mape, forecast: ma30Forecast },
    ];
    const best = methods.sort((a, b) => a.mape - b.mape)[0];

    // Generate future dates for the forecast
    const lastDate = new Date(series[series.length - 1].date);
    const forecastDates = Array.from({ length: horizon }, (_, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);
      return d.toISOString().split('T')[0];
    });

    res.json({
      success: true,
      disclaimer:
        'Estimate based on past prices only (statistical method). Actual prices may differ. Not financial advice.',
      bestMethod: best.name,
      naiveBaseline: { method: 'naive', forecast: naiveForecast },
      recommendation: {
        method: best.name,
        forecast: best.forecast.map((v, i) => ({
          date: forecastDates[i],
          predictedModalPrice: v,
        })),
      },
      historySummary: {
        totalDays: series.length,
        lastKnownDate: series[series.length - 1].date,
        lastKnownModalPrice: lastValue,
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/prices (Direct price entry / admin bridge)
router.post('/', async (req, res) => {
  try {
    const {
      mandiId,
      commodityId,
      variety,
      date,
      minPrice,
      maxPrice,
      modalPrice,
      arrivals,
    } = req.body;

    if (!mandiId || !commodityId || !date || modalPrice == null) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'mandiId, commodityId, date, and modalPrice are required',
        },
      });
    }

    if (mongoose.connection.readyState === 1) {
      const priceDoc = await Price.findOneAndUpdate(
        { mandiId, commodityId, variety: variety || '', date: new Date(date) },
        {
          minPrice: Number(minPrice) || Number(modalPrice),
          maxPrice: Number(maxPrice) || Number(modalPrice),
          modalPrice: Number(modalPrice),
          arrivals: Number(arrivals) || 0,
          source: 'manual',
        },
        { upsert: true, new: true }
      );
      return res.status(201).json({ success: true, data: priceDoc });
    }

    // In-memory mock response
    const newRecord = {
      _id: `price-manual-${Date.now()}`,
      mandiId,
      commodityId,
      variety: variety || 'Standard',
      date,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      modalPrice: Number(modalPrice),
      source: 'manual',
      updatedAt: new Date().toISOString(),
    };

    res.status(201).json({ success: true, source: 'in-memory-mock', data: newRecord });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
