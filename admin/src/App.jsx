import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PriceEntry from './components/PriceEntry';
import BulkPriceImport from './components/BulkPriceImport';
import MandisManager from './components/MandisManager';
import CommoditiesManager from './components/CommoditiesManager';
import TransportersManager from './components/TransportersManager';
import Login from './components/Login';
import {
  getAuthToken,
  setAuthToken,
  fetchHealth,
  fetchMandis,
  fetchCommodities,
  fetchTransporters,
  fetchLatestPrices,
  fetchSyncStatus,
  fetchImportLogs,
} from './services/api';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [health, setHealth] = useState(null);
  const [mandis, setMandis] = useState([]);
  const [commodities, setCommodities] = useState([]);
  const [transporters, setTransporters] = useState([]);
  const [prices, setPrices] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [importLogs, setImportLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    const [h, m, c, t, p, s, logs] = await Promise.all([
      fetchHealth(),
      fetchMandis(),
      fetchCommodities(),
      fetchTransporters(),
      fetchLatestPrices(),
      fetchSyncStatus(),
      fetchImportLogs(),
    ]);

    setHealth(h);
    setMandis(m.data || []);
    setCommodities(c.data || []);
    setTransporters(t.data || []);
    setPrices(p.data || []);
    setSyncStatus(s);
    setImportLogs(logs.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated, loadAdminData]);

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
  };

  const handlePriceAdded = (newPrice) => {
    setPrices((prev) => [newPrice, ...prev]);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'prices' && 'Price Observation Entry'}
              {activeTab === 'bulk' && 'Bulk CSV & AGMARKNET Ingestion'}
              {activeTab === 'mandis' && 'APMC Mandis Directory'}
              {activeTab === 'commodities' && 'Commodity Registry'}
              {activeTab === 'transporters' && 'Agricultural Transporters'}
              {activeTab === 'sync' && 'Synchronization & Data Ingestion Logs'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-slate-600">
              API: {health?.status === 'ok' ? 'Online' : 'Fallback / Standalone'}
            </span>
          </div>
        </header>

        <main className="p-8 flex-1 space-y-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              mandis={mandis}
              commodities={commodities}
              prices={prices}
              health={health}
            />
          )}

          {activeTab === 'prices' && (
            <div className="space-y-6">
              <PriceEntry
                mandis={mandis}
                commodities={commodities}
                onPriceAdded={handlePriceAdded}
              />

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <h3 className="font-semibold text-sm text-slate-700">
                    Latest Price Observations
                  </h3>
                  <span className="text-xs text-slate-400">Total: {prices.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Mandi</th>
                        <th className="px-4 py-3">Commodity</th>
                        <th className="px-4 py-3">Variety</th>
                        <th className="px-4 py-3">Modal Price</th>
                        <th className="px-4 py-3">Range (Min - Max)</th>
                        <th className="px-4 py-3">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {prices.slice(0, 10).map((p, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {p.mandi?.names?.en ||
                              p.mandi?.name?.en ||
                              p.mandiCode ||
                              p.mandiId ||
                              'APMC'}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {p.commodity?.names?.en ||
                              p.commodity?.name?.en ||
                              p.commodityCode ||
                              p.commodityId ||
                              'Produce'}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            {p.variety || 'Standard'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            ₹{p.modalPrice}
                          </td>
                          <td className="px-4 py-3 text-slate-500">
                            ₹{p.minPrice} - ₹{p.maxPrice}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                p.source === 'manual'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {p.source || 'agmarknet'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <BulkPriceImport
              mandis={mandis}
              commodities={commodities}
              onPricesImported={loadAdminData}
              onTriggerSync={loadAdminData}
            />
          )}

          {activeTab === 'mandis' && (
            <MandisManager mandis={mandis} onMandisUpdated={loadAdminData} />
          )}

          {activeTab === 'commodities' && (
            <CommoditiesManager
              commodities={commodities}
              onCommoditiesUpdated={loadAdminData}
            />
          )}

          {activeTab === 'transporters' && (
            <TransportersManager
              transporters={transporters}
              onTransportersUpdated={loadAdminData}
            />
          )}

          {activeTab === 'sync' && (
            <div className="space-y-6">
              {/* AGMARKNET Ingestion Logs */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      AGMARKNET Data Ingestion Logs
                    </h3>
                    <p className="text-xs text-slate-400">
                      Audit trail of government market price synchronizations
                    </p>
                  </div>
                  <button
                    onClick={loadAdminData}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    Refresh Logs
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Source</th>
                        <th className="px-4 py-3">Triggered By</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Fetched</th>
                        <th className="px-4 py-3">Inserted</th>
                        <th className="px-4 py-3">Updated</th>
                        <th className="px-4 py-3">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {importLogs.length === 0 ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="px-4 py-6 text-center text-slate-400"
                          >
                            No ingestion logs recorded yet.
                          </td>
                        </tr>
                      ) : (
                        importLogs.map((l, i) => (
                          <tr key={l._id || i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-semibold text-slate-800">
                              {l.source}
                            </td>
                            <td className="px-4 py-3 text-slate-600">
                              {l.triggeredBy || 'admin'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  l.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : l.status === 'running'
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {l.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              {l.recordsFetched || 0}
                            </td>
                            <td className="px-4 py-3 font-mono text-emerald-700 font-semibold">
                              {l.recordsInserted || 0}
                            </td>
                            <td className="px-4 py-3 font-mono text-blue-700">
                              {l.recordsUpdated || 0}
                            </td>
                            <td className="px-4 py-3 text-slate-400">
                              {new Date(l.startedAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Delta Sync Status Payload */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-base mb-2">
                  Delta Sync Protocol Payload
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Farmers pull delta payloads via{' '}
                  <code className="bg-slate-100 px-1 py-0.5 rounded">
                    /api/sync?since=&lt;timestamp&gt;
                  </code>{' '}
                  to save data on 2G/3G networks.
                </p>
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-xs overflow-x-auto max-h-60">
                  <pre>{JSON.stringify(syncStatus, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
