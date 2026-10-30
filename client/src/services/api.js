import { getCachedItems, cacheItems, getLastSynced, setLastSynced } from './db.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Perform delta sync: fetch changed records since lastSyncedAt, update IndexedDB
export async function performDeltaSync() {
  const lastSync = await getLastSynced();
  const url = `${API_BASE}/sync${lastSync ? `?since=${encodeURIComponent(lastSync)}` : ''}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const { mandis, commodities, prices, transporters } = json.data;
    await Promise.all([
      cacheItems('mandis', mandis),
      cacheItems('commodities', commodities),
      cacheItems('prices', prices),
      cacheItems('transporters', transporters),
    ]);

    await setLastSynced(json.serverTime);
    return { success: true, updated: json.counts, isDelta: json.isDelta };
  } catch (err) {
    console.warn('Delta sync failed (offline or network error):', err.message);
    return { success: false, error: err.message };
  }
}

// Nearby mandis with offline cache fallback
export async function fetchNearbyMandis(lat, lng, radiusKm = 50, limit = 5) {
  try {
    const query = new URLSearchParams();
    if (lat) query.append('lat', lat);
    if (lng) query.append('lng', lng);
    query.append('radiusKm', radiusKm);
    query.append('limit', limit);

    const res = await fetch(`${API_BASE}/mandis/nearby?${query}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      await cacheItems('mandis', json.data);
      return { data: json.data, isOnline: true };
    }
  } catch (err) {
    console.warn('Using cached mandis:', err.message);
  }

  // Fallback to local IndexedDB cache
  const cached = await getCachedItems('mandis');
  return { data: cached, isOnline: false };
}

// Latest commodity prices
export async function fetchLatestPrices() {
  try {
    const res = await fetch(`${API_BASE}/prices/latest`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      await cacheItems('prices', json.data);
      return { data: json.data, isOnline: true };
    }
  } catch (err) {
    console.warn('Using cached prices:', err.message);
  }

  const cached = await getCachedItems('prices');
  return { data: cached, isOnline: false };
}

// Price forecast
export async function fetchPriceForecast(commodityId, mandiId, horizonDays = 7) {
  try {
    const query = new URLSearchParams();
    if (commodityId) query.append('commodityId', commodityId);
    if (mandiId) query.append('mandiId', mandiId);
    query.append('horizonDays', horizonDays);

    const res = await fetch(`${API_BASE}/prices/forecast?${query}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: { code: 'OFFLINE', message: 'Forecast requires internet connection' },
    };
  }
}

// Nearby transporters
export async function fetchTransporters(lat, lng, radiusKm = 80) {
  try {
    const query = new URLSearchParams();
    if (lat) query.append('lat', lat);
    if (lng) query.append('lng', lng);
    query.append('radiusKm', radiusKm);

    const res = await fetch(`${API_BASE}/transporters/nearby?${query}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      await cacheItems('transporters', json.data);
      return { data: json.data, isOnline: true };
    }
  } catch (err) {
    console.warn('Using cached transporters:', err.message);
  }

  const cached = await getCachedItems('transporters');
  return { data: cached, isOnline: false };
}

// Price history (7/30/90 days) for trends
export async function fetchPriceHistory(commodityCode, mandiCode, days = 30) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  const fromStr = fromDate.toISOString().split('T')[0];

  try {
    const query = new URLSearchParams();
    if (commodityCode) query.append('commodityId', commodityCode);
    if (mandiCode) query.append('mandiIds', mandiCode);
    query.append('from', fromStr);

    const res = await fetch(`${API_BASE}/prices?${query}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.data && json.data.length > 0) {
      return { data: json.data, isOnline: true };
    }
  } catch (err) {
    console.warn('Using cached price history:', err.message);
  }

  // Fallback to local IndexedDB
  const cached = await getCachedItems('prices');
  const filtered = cached
    .filter(
      (p) =>
        (!commodityCode ||
          p.commodityCode === commodityCode ||
          p.commodityId === commodityCode) &&
        (!fromStr || (p.date && p.date >= fromStr))
    )
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  return { data: filtered, isOnline: false };
}
