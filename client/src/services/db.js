import { openDB } from 'idb';

const DB_NAME = 'mandilink_db';
const DB_VERSION = 1;

export async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Mandis store
      if (!db.objectStoreNames.contains('mandis')) {
        const store = db.createObjectStore('mandis', { keyPath: '_id' });
        store.createIndex('state', 'state', { unique: false });
        store.createIndex('district', 'district', { unique: false });
      }

      // Commodities store
      if (!db.objectStoreNames.contains('commodities')) {
        db.createObjectStore('commodities', { keyPath: '_id' });
      }

      // Prices store
      if (!db.objectStoreNames.contains('prices')) {
        const store = db.createObjectStore('prices', { keyPath: '_id' });
        store.createIndex('mandiId', 'mandiId', { unique: false });
        store.createIndex('commodityId', 'commodityId', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }

      // Transporters store
      if (!db.objectStoreNames.contains('transporters')) {
        db.createObjectStore('transporters', { keyPath: '_id' });
      }

      // Metadata & Settings store
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    },
  });
}

// Bulk cache items in an object store
export async function cacheItems(storeName, items) {
  if (!items || items.length === 0) return;
  const db = await getDB();
  const tx = db.transaction(storeName, 'readwrite');
  await Promise.all(items.map((item) => tx.store.put(item)));
  await tx.done;
}

// Get all items from an object store
export async function getCachedItems(storeName) {
  const db = await getDB();
  return db.getAll(storeName);
}

// Save lastSyncedAt timestamp
export async function setLastSynced(timestamp) {
  const db = await getDB();
  await db.put('meta', { key: 'lastSyncedAt', value: timestamp });
}

export async function getLastSynced() {
  const db = await getDB();
  const rec = await db.get('meta', 'lastSyncedAt');
  return rec ? rec.value : null;
}

// Clear all local cache
export async function clearLocalCache() {
  const db = await getDB();
  await Promise.all([
    db.clear('mandis'),
    db.clear('commodities'),
    db.clear('prices'),
    db.clear('transporters'),
    db.clear('meta'),
  ]);
}
