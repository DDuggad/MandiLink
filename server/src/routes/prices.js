import express from 'express';
import mongoose from 'mongoose';
import { Price } from '../models/Price.js';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { SEED_MANDIS, SEED_COMMODITIES, generatePriceHistory } from '../seed/data.js';
import { runAgmarknetImport, getLiveSyncStatus } from '../services/agmarknetImporter.js';

const router = express.Router();

// Lazy-loaded in-memory seed prices (only computed once when needed)
let _seedPrices = null;
function getSeedPrices() {
  if (!_seedPrices) _seedPrices = generatePriceHistory();
  return _seedPrices;
}

// GET /api/prices/live-status
router.get('/live-status', async (req, res) => {
  try {
    const status = await getLiveSyncStatus();
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/prices/sync-live (Triggers real-time AGMARKNET ingestion)
router.post('/sync-live', async (req, res) => {
  try {
    const result = await runAgmarknetImport('client-refresh');
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: { code: 'SYNC_ERROR', message: err.message } });
  }
});

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
// Server-side statistical forecasting: Naive baseline, 7-day MA, 30-day MA, Linear Trend, and Weekly Seasonal.
// Performs 14-day holdout backtesting to pick the lowest MAPE model, providing transparent naive-baseline comparison.
router.get('/forecast', async (req, res) => {
  try {
    const { commodityId, mandiId, horizonDays = 7 } = req.query;
    const horizon = parseInt(horizonDays, 10) || 7;
    const MIN_HISTORY = 30; // Require at least 30 observations for meaningful statistical estimation

    let series = []; // sorted ascending by date: { date, modalPrice }

    if (mongoose.connection.readyState === 1 && (commodityId || mandiId)) {
      let cId = commodityId;
      let mId = mandiId;
      if (commodityId && !mongoose.Types.ObjectId.isValid(commodityId)) {
        const commDoc = await Commodity.findOne({
          $or: [{ code: commodityId }, { 'names.en': new RegExp(commodityId, 'i') }],
          isDeleted: false,
        });
        if (commDoc) cId = commDoc._id;
      }
      if (mandiId && !mongoose.Types.ObjectId.isValid(mandiId)) {
        const mandiDoc = await Mandi.findOne({
          $or: [{ code: mandiId }, { code: new RegExp(mandiId, 'i') }],
          isDeleted: false,
        });
        if (mandiDoc) mId = mandiDoc._id;
      }

      const query = { isDeleted: false };
      if (cId) query.commodityId = cId;
      if (mId) query.mandiId = mId;

      const prices = await Price.find(query)
        .sort({ date: 1 })
        .select('date modalPrice -_id');

      if (prices.length >= MIN_HISTORY) {
        series = prices.map((p) => ({
          date: p.date.toISOString().split('T')[0],
          value: p.modalPrice,
        }));
      }
    }

    if (series.length < MIN_HISTORY) {
      // Use in-memory seed data (best-effort match by code or name fragment)
      const seedPrices = getSeedPrices();
      const matched = seedPrices
        .filter(
          (p) =>
            (!commodityId ||
              p.commodityCode.toLowerCase().includes(commodityId.toLowerCase())) &&
            (!mandiId || p.mandiCode.toLowerCase().includes(mandiId.toLowerCase()))
        )
        .sort((a, b) => a.date.localeCompare(b.date));
      if (matched.length > 0) {
        series = matched.map((p) => ({ date: p.date, value: p.modalPrice }));
      }
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
    const n = values.length;
    const lastValue = values[n - 1];

    // Holdout backtest split (last 14 days)
    const holdoutLength = Math.min(14, Math.floor(n * 0.2));
    const trainValues = values.slice(0, n - holdoutLength);
    const holdoutActuals = values.slice(n - holdoutLength);

    function calcMetrics(actuals, predicted) {
      const count = actuals.length;
      if (count === 0) return { mape: Infinity, rmse: Infinity };
      let sumPct = 0;
      let sumSq = 0;
      for (let i = 0; i < count; i++) {
        const diff = actuals[i] - predicted[i];
        sumPct += Math.abs(diff / actuals[i]);
        sumSq += diff * diff;
      }
      return {
        mape: Number(((sumPct / count) * 100).toFixed(2)),
        rmse: Number(Math.sqrt(sumSq / count).toFixed(2)),
      };
    }

    // 1. Naive Baseline (repeats last known train value)
    const trainLast = trainValues[trainValues.length - 1];
    const naiveBacktest = Array(holdoutLength).fill(trainLast);
    const naiveMetrics = calcMetrics(holdoutActuals, naiveBacktest);
    const naiveForecast = Array(horizon).fill(lastValue);

    // 2. 7-Day Moving Average
    const trainMa7 =
      trainValues.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, trainValues.length);
    const ma7Backtest = Array(holdoutLength).fill(Math.round(trainMa7));
    const ma7Metrics = calcMetrics(holdoutActuals, ma7Backtest);
    const ma7 = values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length);
    const ma7Forecast = Array(horizon).fill(Math.round(ma7));

    // 3. 30-Day Moving Average
    const trainMa30 =
      trainValues.slice(-30).reduce((a, b) => a + b, 0) /
      Math.min(30, trainValues.length);
    const ma30Backtest = Array(holdoutLength).fill(Math.round(trainMa30));
    const ma30Metrics = calcMetrics(holdoutActuals, ma30Backtest);
    const ma30 =
      values.slice(-30).reduce((a, b) => a + b, 0) / Math.min(30, values.length);
    const ma30Forecast = Array(horizon).fill(Math.round(ma30));

    // 4. Linear Trend Regression (y = mx + c) on last 30 observations
    function fitLinearTrend(data, stepsAhead) {
      const windowSize = Math.min(30, data.length);
      const slice = data.slice(-windowSize);
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumXX = 0;
      for (let i = 0; i < windowSize; i++) {
        sumX += i;
        sumY += slice[i];
        sumXY += i * slice[i];
        sumXX += i * i;
      }
      const slope =
        (windowSize * sumXY - sumX * sumY) / (windowSize * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / windowSize;

      const projections = [];
      for (let step = 1; step <= stepsAhead; step++) {
        const xVal = windowSize - 1 + step;
        projections.push(Math.round(Math.max(100, slope * xVal + intercept)));
      }
      return projections;
    }

    const linearBacktest = fitLinearTrend(trainValues, holdoutLength);
    const linearMetrics = calcMetrics(holdoutActuals, linearBacktest);
    const linearForecast = fitLinearTrend(values, horizon);

    // 5. Weekly Seasonal Naive (repeats day-of-week lag from prior week)
    const seasonalBacktest = [];
    for (let i = 0; i < holdoutLength; i++) {
      const lagIdx = trainValues.length - 7 + (i % 7);
      seasonalBacktest.push(lagIdx >= 0 ? trainValues[lagIdx] : trainLast);
    }
    const seasonalMetrics = calcMetrics(holdoutActuals, seasonalBacktest);
    const seasonalForecast = [];
    for (let i = 0; i < horizon; i++) {
      const lagIdx = values.length - 7 + (i % 7);
      seasonalForecast.push(lagIdx >= 0 ? values[lagIdx] : lastValue);
    }

    const candidateModels = [
      {
        id: 'naive',
        label: 'Naive Baseline (Last Recorded Price)',
        mape: naiveMetrics.mape,
        rmse: naiveMetrics.rmse,
        forecast: naiveForecast,
        description: 'Assumes current price continues forward unchanged.',
      },
      {
        id: 'ma7',
        label: '7-Day Moving Average',
        mape: ma7Metrics.mape,
        rmse: ma7Metrics.rmse,
        forecast: ma7Forecast,
        description:
          'Smooths out transient weekend and auction-spike noise over the last week.',
      },
      {
        id: 'ma30',
        label: '30-Day Moving Average',
        mape: ma30Metrics.mape,
        rmse: ma30Metrics.rmse,
        forecast: ma30Forecast,
        description: 'Captures mid-term monthly equilibrium price level.',
      },
      {
        id: 'linear_trend',
        label: 'Linear Trend Regression (OLS)',
        mape: linearMetrics.mape,
        rmse: linearMetrics.rmse,
        forecast: linearForecast,
        description: 'Models consistent price momentum and slope over the past 30 days.',
      },
      {
        id: 'seasonal_weekly',
        label: 'Weekly Day-of-Week Seasonal',
        mape: seasonalMetrics.mape,
        rmse: seasonalMetrics.rmse,
        forecast: seasonalForecast,
        description: 'Mirrors recurring weekly market-day cyclical patterns.',
      },
    ];

    // Pick best model by lowest MAPE on validation holdout
    const sorted = [...candidateModels].sort((a, b) => a.mape - b.mape);
    const best = sorted[0];

    // Calculate improvement percentage relative to naive baseline
    const naiveMape = naiveMetrics.mape;
    const improvementPercent =
      naiveMape > 0
        ? Number((((naiveMape - best.mape) / naiveMape) * 100).toFixed(1))
        : 0;

    // Approximate 90% confidence uncertainty interval (± 1.645 * residual RMSE)
    const uncertaintyBand = Math.round(1.645 * (best.rmse || lastValue * 0.05));

    // Generate projected calendar dates
    const lastDate = new Date(series[series.length - 1].date);
    const forecastDates = Array.from({ length: horizon }, (_, i) => {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i + 1);
      return d.toISOString().split('T')[0];
    });

    const detailedForecast = best.forecast.map((val, i) => ({
      date: forecastDates[i],
      predictedModalPrice: val,
      lowerBound: Math.max(0, val - uncertaintyBand),
      upperBound: val + uncertaintyBand,
      naiveBaselineValue: naiveForecast[i],
    }));

    // Explainable rationale
    let explanation = '';
    if (best.id === 'naive') {
      explanation = `The Naive Baseline achieved the lowest backtest error (${best.mape}% MAPE) on recent 14-day validation data. Consistent with agricultural economics literature, short-term mandi prices often follow a random-walk where today's price is the strongest predictor for tomorrow.`;
    } else {
      explanation = `${best.label} outperformed the Naive Baseline by achieving ${best.mape}% MAPE vs ${naiveMape}% MAPE (${improvementPercent}% error reduction) on a 14-day validation holdout. ${best.description}`;
    }

    res.json({
      success: true,
      disclaimer:
        'Statistical projection based on historical APMC arrivals and prices. Actual mandi prices depend on real-time arrivals and quality grades. Not financial advice.',
      selectedModel: {
        id: best.id,
        label: best.label,
        mape: best.mape,
        rmse: best.rmse,
        improvementPercent,
      },
      naiveBaseline: {
        id: 'naive',
        mape: naiveMape,
        rmse: naiveMetrics.rmse,
      },
      allModelsCompared: candidateModels.map((m) => ({
        id: m.id,
        label: m.label,
        mape: m.mape,
        rmse: m.rmse,
      })),
      explainability: {
        explanation,
        holdoutDays: holdoutLength,
        uncertaintyBandRupees: uncertaintyBand,
      },
      forecast: detailedForecast,
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
