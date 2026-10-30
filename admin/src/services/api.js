const API_BASE = '/api';

// Token helpers
export function getAuthToken() {
  return localStorage.getItem('mandilink_admin_token');
}

export function setAuthToken(token) {
  if (token) localStorage.setItem('mandilink_admin_token', token);
  else localStorage.removeItem('mandilink_admin_token');
}

function authHeaders() {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// Admin login
export async function adminLogin(username, password) {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  } catch (err) {
    return { error: { message: err.message } };
  }
}

// Health check
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'offline', error: err.message };
  }
}

// ===================================
// MANDIS
// ===================================
export async function fetchMandis() {
  try {
    const res = await fetch(`${API_BASE}/mandis`);
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function createMandi(mandiData) {
  try {
    const res = await fetch(`${API_BASE}/admin/mandis`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(mandiData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateMandi(id, mandiData) {
  try {
    const res = await fetch(`${API_BASE}/admin/mandis/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(mandiData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteMandi(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/mandis/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ===================================
// COMMODITIES
// ===================================
export async function fetchCommodities() {
  try {
    const res = await fetch(`${API_BASE}/commodities`);
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function createCommodity(commodityData) {
  try {
    const res = await fetch(`${API_BASE}/admin/commodities`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(commodityData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateCommodity(id, commodityData) {
  try {
    const res = await fetch(`${API_BASE}/admin/commodities/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(commodityData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteCommodity(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/commodities/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ===================================
// TRANSPORTERS
// ===================================
export async function fetchTransporters() {
  try {
    const res = await fetch(`${API_BASE}/transporters`);
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function createTransporter(transporterData) {
  try {
    const res = await fetch(`${API_BASE}/admin/transporters`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(transporterData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function updateTransporter(id, transporterData) {
  try {
    const res = await fetch(`${API_BASE}/admin/transporters/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(transporterData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function deleteTransporter(id) {
  try {
    const res = await fetch(`${API_BASE}/admin/transporters/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ===================================
// PRICES & BULK CSV
// ===================================
export async function fetchLatestPrices() {
  try {
    const res = await fetch(`${API_BASE}/prices/latest`);
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function submitManualPrice(priceData) {
  try {
    const res = await fetch(`${API_BASE}/admin/prices`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(priceData),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function submitBulkPrices(csvText) {
  try {
    const res = await fetch(`${API_BASE}/admin/prices/bulk`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ csv: csvText }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// ===================================
// AGMARKNET & SYNC LOGS
// ===================================
export async function triggerAgmarknetImport() {
  try {
    const res = await fetch(`${API_BASE}/admin/import/agmarknet`, {
      method: 'POST',
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchImportLogs() {
  try {
    const res = await fetch(`${API_BASE}/admin/import/logs`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function fetchSyncStatus() {
  try {
    const res = await fetch(`${API_BASE}/sync?since=1970-01-01T00:00:00.000Z`);
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}
