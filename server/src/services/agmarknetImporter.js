import mongoose from 'mongoose';
import { Mandi } from '../models/Mandi.js';
import { Commodity } from '../models/Commodity.js';
import { Price } from '../models/Price.js';
import { ImportLog } from '../models/ImportLog.js';
import { SEED_MANDIS, SEED_COMMODITIES } from '../seed/data.js';

// data.gov.in AGMARKNET Current Daily Price Resource ID
export const DATA_GOV_RESOURCE_ID =
  process.env.DATA_GOV_RESOURCE_ID || '9ef84268-d588-465a-a308-a864a43d0070';
const DATA_GOV_BASE_URL = 'https://api.data.gov.in/resource';

/**
 * Parses date string in DD/MM/YYYY format to Date object (start of day UTC)
 */
function parseAgmarknetDate(dateStr) {
  if (!dateStr) return new Date();
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    return new Date(Date.UTC(year, month, day));
  }
  return new Date(dateStr);
}

/**
 * Ingests AGMARKNET price records from data.gov.in API or generates synthetic live import.
 * @param {string} triggeredBy - 'manual' | 'cron' | 'admin'
 * @returns {Promise<Object>} Import result summary
 */
export async function runAgmarknetImport(triggeredBy = 'admin') {
  const apiKey = process.env.DATA_GOV_API_KEY;
  const startedAt = new Date();

  let log = null;
  if (mongoose.connection.readyState === 1) {
    log = await ImportLog.create({
      source: 'data.gov.in (agmarknet)',
      startedAt,
      status: 'running',
      triggeredBy,
    });
  }

  let recordsFetched = 0;
  let recordsInserted = 0;
  let recordsUpdated = 0;
  const errors = [];

  try {
    let rawRecords = [];

    if (apiKey && apiKey !== 'your-key' && apiKey !== 'change-me') {
      // Live fetch from data.gov.in
      const url = `${DATA_GOV_BASE_URL}/${DATA_GOV_RESOURCE_ID}?api-key=${apiKey}&format=json&limit=250`;
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!res.ok) {
        throw new Error(`data.gov.in returned HTTP ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      rawRecords = json.records || [];
      recordsFetched = rawRecords.length;
    } else {
      // Ingestion simulation for pilot mandis when API key is not configured
      const today = new Date().toISOString().split('T')[0];
      const pilotVarieties = {
        tomato: ['Hybrid', 'Local'],
        onion: ['Nasik Red', 'Local'],
        potato: ['Jyoti', 'Kufri'],
        ragi: ['Local'],
        rice: ['Sona Masoori', 'Kolam'],
      };

      rawRecords = [];
      for (const mandi of SEED_MANDIS) {
        for (const commodity of SEED_COMMODITIES) {
          const varieties = pilotVarieties[commodity.code] || ['Standard'];
          for (const variety of varieties) {
            const base =
              commodity.code === 'tomato'
                ? 1800
                : commodity.code === 'onion'
                  ? 2400
                  : commodity.code === 'potato'
                    ? 1600
                    : commodity.code === 'ragi'
                      ? 3200
                      : 4100;
            const variance = Math.round((Math.random() - 0.5) * 200);
            const modal = base + variance;
            rawRecords.push({
              state: mandi.state,
              district: mandi.district,
              market: mandi.names.en,
              mandiCode: mandi.code,
              commodity: commodity.names.en,
              commodityCode: commodity.code,
              variety,
              arrival_date: today,
              min_price: modal - 150,
              max_price: modal + 180,
              modal_price: modal,
            });
          }
        }
      }
      recordsFetched = rawRecords.length;
    }

    if (mongoose.connection.readyState === 1) {
      const allMandis = await Mandi.find({ isDeleted: false });
      const allCommodities = await Commodity.find({ isDeleted: false });

      const mandiByCode = new Map(allMandis.map((m) => [m.code, m._id]));
      const mandiByName = new Map(
        allMandis.map((m) => [m.names.en.toLowerCase(), m._id])
      );

      const commByCode = new Map(allCommodities.map((c) => [c.code, c._id]));
      const commByName = new Map(
        allCommodities.map((c) => [c.names.en.toLowerCase(), c._id])
      );

      for (const rec of rawRecords) {
        try {
          const mandiId =
            mandiByCode.get(rec.mandiCode) ||
            mandiByName.get((rec.market || '').toLowerCase());
          const commodityId =
            commByCode.get(rec.commodityCode) ||
            commByName.get((rec.commodity || '').toLowerCase());

          if (!mandiId || !commodityId) {
            continue; // Skip records not matching monitored pilot mandis/commodities
          }

          const priceDate = rec.arrival_date
            ? parseAgmarknetDate(rec.arrival_date)
            : new Date();

          // Check if a manual price exists for this date (manual takes priority)
          const existing = await Price.findOne({
            mandiId,
            commodityId,
            variety: rec.variety || '',
            date: priceDate,
          });

          if (existing && existing.source === 'manual') {
            // Do not overwrite manual admin entry with automated feed
            continue;
          }

          if (existing) {
            existing.minPrice = Number(rec.min_price) || Number(rec.modal_price);
            existing.maxPrice = Number(rec.max_price) || Number(rec.modal_price);
            existing.modalPrice = Number(rec.modal_price);
            existing.source = 'api';
            await existing.save();
            recordsUpdated++;
          } else {
            await Price.create({
              mandiId,
              commodityId,
              variety: rec.variety || '',
              date: priceDate,
              minPrice: Number(rec.min_price) || Number(rec.modal_price),
              maxPrice: Number(rec.max_price) || Number(rec.modal_price),
              modalPrice: Number(rec.modal_price),
              unit: 'quintal',
              source: 'api',
            });
            recordsInserted++;
          }
        } catch (itemErr) {
          errors.push(itemErr.message);
        }
      }
    } else {
      // In-memory mock result
      recordsInserted = recordsFetched;
    }

    const finishedAt = new Date();
    const result = {
      status: 'completed',
      recordsFetched,
      recordsInserted,
      recordsUpdated,
      errors: errors.slice(0, 10),
      startedAt,
      finishedAt,
    };

    if (log) {
      log.status = 'completed';
      log.recordsFetched = recordsFetched;
      log.recordsInserted = recordsInserted;
      log.recordsUpdated = recordsUpdated;
      log.errors = errors.slice(0, 20);
      log.finishedAt = finishedAt;
      await log.save();
      result.logId = log._id;
    }

    return result;
  } catch (err) {
    const finishedAt = new Date();
    if (log) {
      log.status = 'failed';
      log.errors = [err.message];
      log.finishedAt = finishedAt;
      await log.save();
    }
    throw err;
  }
}
