import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { Admin } from '../models/Admin.js';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { Price } from '../models/Price.js';
import { Transporter } from '../models/Transporter.js';
import { ImportLog } from '../models/ImportLog.js';
import { SEED_MANDIS, SEED_COMMODITIES, SEED_TRANSPORTERS } from '../seed/data.js';
import { runAgmarknetImport } from '../services/agmarknetImporter.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

// In-memory mutable state for mock/fallback mode
let memoryMandis = SEED_MANDIS.map((m, idx) => ({ _id: `mandi-mem-${idx + 1}`, ...m }));
let memoryCommodities = SEED_COMMODITIES.map((c, idx) => ({
  _id: `comm-mem-${idx + 1}`,
  ...c,
}));
let memoryTransporters = SEED_TRANSPORTERS.map((t, idx) => ({
  _id: `trans-mem-${idx + 1}`,
  ...t,
}));
let memoryLogs = [
  {
    _id: 'mock-log-1',
    source: 'data.gov.in (agmarknet)',
    status: 'completed',
    recordsFetched: 150,
    recordsInserted: 150,
    recordsUpdated: 0,
    errors: [],
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    finishedAt: new Date(Date.now() - 3550000).toISOString(),
    triggeredBy: 'admin',
  },
];

// Simple JWT auth middleware
export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: { code: 'UNAUTHORIZED', message: 'Missing Bearer token' } });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res
      .status(401)
      .json({ error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
  }
}

// POST /api/admin/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'Username and password required' },
      });
    }

    let isValid = false;
    let adminRecord = null;

    if (mongoose.connection.readyState === 1) {
      adminRecord = await Admin.findOne({ username: username.toLowerCase() });
      if (adminRecord) {
        isValid = await bcrypt.compare(password, adminRecord.passwordHash);
      }
    } else {
      isValid = username === 'admin' && password === 'admin123';
      adminRecord = { _id: 'admin-dev-id', username: 'admin', role: 'admin' };
    }

    if (!isValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Incorrect username or password',
        },
      });
    }

    const token = jwt.sign(
      { adminId: adminRecord._id, username: adminRecord.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: { username: adminRecord.username, role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// MANDIS CRUD
// ==========================================

// GET /api/admin/mandis
router.get('/mandis', requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const mandis = await Mandi.find().sort({ state: 1, district: 1 });
      return res.json({ success: true, count: mandis.length, data: mandis });
    }
    res.json({ success: true, count: memoryMandis.length, data: memoryMandis });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/admin/mandis
router.post('/mandis', requireAdmin, async (req, res) => {
  try {
    const { code, names, state, district, location, address, phone } = req.body;
    if (!names?.en || !state || !district || !location?.coordinates) {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'names.en, state, district, and coordinates are required',
        },
      });
    }

    if (mongoose.connection.readyState === 1) {
      const mandi = await Mandi.create({
        code: code || `MANDI-${Date.now()}`,
        names,
        state,
        district,
        location: {
          type: 'Point',
          coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
        },
        address,
        phone,
      });
      return res.status(201).json({ success: true, data: mandi });
    }

    const newMandi = {
      _id: `mandi-mem-${Date.now()}`,
      code: code || `MANDI-${Date.now()}`,
      names,
      state,
      district,
      location: {
        type: 'Point',
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      },
      address,
      phone,
      isActive: true,
      isDeleted: false,
    };
    memoryMandis.push(newMandi);
    res.status(201).json({ success: true, data: newMandi });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PUT /api/admin/mandis/:id
router.put('/mandis/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const mandi = await Mandi.findByIdAndUpdate(id, req.body, { new: true });
      if (!mandi)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Mandi not found' } });
      return res.json({ success: true, data: mandi });
    }

    const idx = memoryMandis.findIndex((m) => m._id === id || m.code === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Mandi not found' } });
    memoryMandis[idx] = {
      ...memoryMandis[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: memoryMandis[idx] });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE /api/admin/mandis/:id (Soft-delete)
router.delete('/mandis/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const mandi = await Mandi.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      if (!mandi)
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Mandi not found' } });
      return res.json({ success: true, message: 'Mandi marked as deleted', data: mandi });
    }

    const idx = memoryMandis.findIndex((m) => m._id === id || m.code === id);
    if (idx === -1)
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Mandi not found' } });
    memoryMandis[idx].isDeleted = true;
    memoryMandis[idx].deletedAt = new Date().toISOString();
    res.json({
      success: true,
      message: 'Mandi marked as deleted',
      data: memoryMandis[idx],
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// COMMODITIES CRUD
// ==========================================

// GET /api/admin/commodities
router.get('/commodities', requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const commodities = await Commodity.find().sort({ 'names.en': 1 });
      return res.json({ success: true, count: commodities.length, data: commodities });
    }
    res.json({ success: true, count: memoryCommodities.length, data: memoryCommodities });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/admin/commodities
router.post('/commodities', requireAdmin, async (req, res) => {
  try {
    const { code, names, category, defaultUnit, varieties } = req.body;
    if (!code || !names?.en) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'code and names.en are required' },
      });
    }

    if (mongoose.connection.readyState === 1) {
      const commodity = await Commodity.create({
        code: code.toLowerCase().trim(),
        names,
        category: category || 'vegetable',
        defaultUnit: defaultUnit || 'quintal',
        varieties: varieties || [],
      });
      return res.status(201).json({ success: true, data: commodity });
    }

    const newCommodity = {
      _id: `comm-mem-${Date.now()}`,
      code: code.toLowerCase().trim(),
      names,
      category: category || 'vegetable',
      defaultUnit: defaultUnit || 'quintal',
      varieties: varieties || [],
      isDeleted: false,
    };
    memoryCommodities.push(newCommodity);
    res.status(201).json({ success: true, data: newCommodity });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PUT /api/admin/commodities/:id
router.put('/commodities/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const commodity = await Commodity.findByIdAndUpdate(id, req.body, { new: true });
      if (!commodity) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Commodity not found' } });
      }
      return res.json({ success: true, data: commodity });
    }

    const idx = memoryCommodities.findIndex((c) => c._id === id || c.code === id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Commodity not found' } });
    }
    memoryCommodities[idx] = {
      ...memoryCommodities[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: memoryCommodities[idx] });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE /api/admin/commodities/:id (Soft-delete)
router.delete('/commodities/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const commodity = await Commodity.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      if (!commodity) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Commodity not found' } });
      }
      return res.json({
        success: true,
        message: 'Commodity marked as deleted',
        data: commodity,
      });
    }

    const idx = memoryCommodities.findIndex((c) => c._id === id || c.code === id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Commodity not found' } });
    }
    memoryCommodities[idx].isDeleted = true;
    memoryCommodities[idx].deletedAt = new Date().toISOString();
    res.json({
      success: true,
      message: 'Commodity marked as deleted',
      data: memoryCommodities[idx],
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// TRANSPORTERS CRUD
// ==========================================

// GET /api/admin/transporters
router.get('/transporters', requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const transporters = await Transporter.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: transporters.length, data: transporters });
    }
    res.json({
      success: true,
      count: memoryTransporters.length,
      data: memoryTransporters,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/admin/transporters
router.post('/transporters', requireAdmin, async (req, res) => {
  try {
    const {
      name,
      phone,
      languages,
      vehicleTypes,
      ratePerKm,
      capacityKg,
      baseLocation,
      serviceDistricts,
    } = req.body;
    if (!name || !phone) {
      return res
        .status(400)
        .json({ error: { code: 'BAD_REQUEST', message: 'name and phone are required' } });
    }

    if (mongoose.connection.readyState === 1) {
      const transporter = await Transporter.create({
        name,
        phone,
        languages: languages || ['en'],
        vehicleTypes: vehicleTypes || ['truck'],
        ratePerKm: Number(ratePerKm) || 25,
        capacityKg: Number(capacityKg) || 1000,
        baseLocation: baseLocation || { type: 'Point', coordinates: [77.5946, 12.9716] },
        serviceDistricts: serviceDistricts || [],
        isVerified: true,
      });
      return res.status(201).json({ success: true, data: transporter });
    }

    const newTransporter = {
      _id: `trans-mem-${Date.now()}`,
      name,
      phone,
      languages: languages || ['en'],
      vehicleTypes: vehicleTypes || ['truck'],
      ratePerKm: Number(ratePerKm) || 25,
      capacityKg: Number(capacityKg) || 1000,
      baseLocation: baseLocation || { type: 'Point', coordinates: [77.5946, 12.9716] },
      serviceDistricts: serviceDistricts || [],
      isVerified: true,
      isActive: true,
      isDeleted: false,
    };
    memoryTransporters.push(newTransporter);
    res.status(201).json({ success: true, data: newTransporter });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// PUT /api/admin/transporters/:id
router.put('/transporters/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const transporter = await Transporter.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      if (!transporter) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Transporter not found' } });
      }
      return res.json({ success: true, data: transporter });
    }

    const idx = memoryTransporters.findIndex((t) => t._id === id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Transporter not found' } });
    }
    memoryTransporters[idx] = {
      ...memoryTransporters[idx],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json({ success: true, data: memoryTransporters[idx] });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// DELETE /api/admin/transporters/:id
router.delete('/transporters/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      const transporter = await Transporter.findByIdAndUpdate(
        id,
        { isDeleted: true, deletedAt: new Date() },
        { new: true }
      );
      if (!transporter) {
        return res
          .status(404)
          .json({ error: { code: 'NOT_FOUND', message: 'Transporter not found' } });
      }
      return res.json({
        success: true,
        message: 'Transporter marked as deleted',
        data: transporter,
      });
    }

    const idx = memoryTransporters.findIndex((t) => t._id === id);
    if (idx === -1) {
      return res
        .status(404)
        .json({ error: { code: 'NOT_FOUND', message: 'Transporter not found' } });
    }
    memoryTransporters[idx].isDeleted = true;
    memoryTransporters[idx].deletedAt = new Date().toISOString();
    res.json({
      success: true,
      message: 'Transporter marked as deleted',
      data: memoryTransporters[idx],
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// PRICES CRUD & BULK IMPORT
// ==========================================

// GET /api/admin/prices
router.get('/prices', requireAdmin, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    if (mongoose.connection.readyState === 1) {
      const prices = await Price.find({ isDeleted: false })
        .sort({ date: -1, createdAt: -1 })
        .populate('mandiId', 'names state district code')
        .populate('commodityId', 'names code defaultUnit')
        .limit(parseInt(limit, 10));
      return res.json({ success: true, count: prices.length, data: prices });
    }

    res.json({
      success: true,
      count: 0,
      data: [],
      note: 'Using mock mode. In memory price history is managed dynamically.',
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/admin/prices (Manual price entry)
router.post('/prices', requireAdmin, async (req, res) => {
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
          source: 'manual', // Manual price entries take precedence
          enteredBy: req.admin.adminId,
        },
        { upsert: true, new: true }
      );
      return res.json({ success: true, data: priceDoc });
    }

    res.json({
      success: true,
      note: 'Saved in mock-mode (database offline)',
      data: {
        _id: `price-manual-${Date.now()}`,
        mandiId,
        commodityId,
        variety,
        date,
        minPrice: Number(minPrice) || Number(modalPrice),
        maxPrice: Number(maxPrice) || Number(modalPrice),
        modalPrice: Number(modalPrice),
        source: 'manual',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// POST /api/admin/prices/bulk (Bulk CSV or JSON price import)
router.post('/prices/bulk', requireAdmin, async (req, res) => {
  try {
    let rows = [];
    if (typeof req.body === 'string' || req.body.csv) {
      // Parse CSV
      const csvContent = typeof req.body === 'string' ? req.body : req.body.csv;
      const lines = csvContent.trim().split(/\r?\n/);
      if (lines.length <= 1) {
        return res
          .status(400)
          .json({ error: { code: 'BAD_REQUEST', message: 'CSV has no data rows' } });
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 4) {
          const rowObj = {};
          headers.forEach((h, idx) => {
            rowObj[h] = parts[idx];
          });
          rows.push({
            mandiId: rowObj.mandiid || rowObj.mandi_id || rowObj.mandi,
            commodityId: rowObj.commodityid || rowObj.commodity_id || rowObj.commodity,
            variety: rowObj.variety || '',
            date: rowObj.date || new Date().toISOString().split('T')[0],
            minPrice: Number(rowObj.minprice || rowObj.min_price || rowObj.modalprice),
            maxPrice: Number(rowObj.maxprice || rowObj.max_price || rowObj.modalprice),
            modalPrice: Number(rowObj.modalprice || rowObj.modal_price || rowObj.price),
            arrivals: Number(rowObj.arrivals || 0),
          });
        }
      }
    } else if (Array.isArray(req.body.prices) || Array.isArray(req.body)) {
      rows = Array.isArray(req.body.prices) ? req.body.prices : req.body;
    } else {
      return res.status(400).json({
        error: {
          code: 'BAD_REQUEST',
          message: 'Expected { csv: "..." } or { prices: [...] } or JSON array of prices',
        },
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({
        error: { code: 'BAD_REQUEST', message: 'No valid rows found to import' },
      });
    }

    let inserted = 0;
    let updated = 0;
    const errors = [];

    if (mongoose.connection.readyState === 1) {
      for (const row of rows) {
        try {
          if (!row.mandiId || !row.commodityId || !row.date || row.modalPrice == null) {
            errors.push(
              'Row missing required field (mandiId, commodityId, date, modalPrice)'
            );
            continue;
          }

          const existing = await Price.findOne({
            mandiId: row.mandiId,
            commodityId: row.commodityId,
            variety: row.variety || '',
            date: new Date(row.date),
          });

          if (existing) {
            existing.minPrice = Number(row.minPrice) || Number(row.modalPrice);
            existing.maxPrice = Number(row.maxPrice) || Number(row.modalPrice);
            existing.modalPrice = Number(row.modalPrice);
            existing.source = 'manual';
            existing.enteredBy = req.admin.adminId;
            await existing.save();
            updated++;
          } else {
            await Price.create({
              mandiId: row.mandiId,
              commodityId: row.commodityId,
              variety: row.variety || '',
              date: new Date(row.date),
              minPrice: Number(row.minPrice) || Number(row.modalPrice),
              maxPrice: Number(row.maxPrice) || Number(row.modalPrice),
              modalPrice: Number(row.modalPrice),
              arrivals: Number(row.arrivals) || 0,
              source: 'manual',
              enteredBy: req.admin.adminId,
            });
            inserted++;
          }
        } catch (itemErr) {
          errors.push(itemErr.message);
        }
      }
    } else {
      inserted = rows.length;
    }

    res.json({
      success: true,
      imported: rows.length,
      inserted,
      updated,
      errors: errors.slice(0, 10),
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

// ==========================================
// AGMARKNET IMPORTER TRIGGER & LOGS
// ==========================================

// POST /api/admin/import/agmarknet (Trigger live or pilot data ingestion)
router.post('/import/agmarknet', requireAdmin, async (req, res) => {
  try {
    const summary = await runAgmarknetImport(req.admin?.username || 'admin');
    if (mongoose.connection.readyState !== 1) {
      memoryLogs.unshift({
        _id: `mem-log-${Date.now()}`,
        source: 'data.gov.in (agmarknet)',
        status: 'completed',
        recordsFetched: summary.recordsFetched,
        recordsInserted: summary.recordsInserted,
        recordsUpdated: summary.recordsUpdated,
        errors: summary.errors || [],
        startedAt: summary.startedAt,
        finishedAt: summary.finishedAt,
        triggeredBy: req.admin?.username || 'admin',
      });
    }
    res.json({
      success: true,
      message: 'AGMARKNET ingestion completed',
      data: summary,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'IMPORT_FAILED', message: err.message } });
  }
});

// GET /api/admin/import/logs
router.get('/import/logs', requireAdmin, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const logs = await ImportLog.find().sort({ startedAt: -1 }).limit(20);
      return res.json({ success: true, count: logs.length, data: logs });
    }
    res.json({
      success: true,
      count: memoryLogs.length,
      data: memoryLogs,
    });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

export default router;
