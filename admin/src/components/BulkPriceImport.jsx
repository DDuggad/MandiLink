import React, { useState } from 'react';
import {
  Upload,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Play,
} from 'lucide-react';
import { submitBulkPrices, triggerAgmarknetImport } from '../services/api';

const SAMPLE_CSV = `mandiId,commodityId,variety,date,modalPrice,minPrice,maxPrice,arrivals
KA-BLR-01,tomato,Hybrid,2026-10-30,2100,1950,2250,15
KA-BLR-02,onion,Nasik Red,2026-10-30,2600,2450,2800,22
MH-PUN-01,potato,Jyoti,2026-10-30,1750,1600,1900,18`;

export default function BulkPriceImport({
  mandis,
  commodities,
  onPricesImported,
  onTriggerSync,
}) {
  const [csvText, setCsvText] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isImportingAgmarknet, setIsImportingAgmarknet] = useState(false);

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    setLoading(true);
    setStatus(null);

    const res = await submitBulkPrices(csvText);
    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: `Successfully processed ${res.imported} rows (${res.inserted} inserted, ${res.updated} updated).`,
      });
      setCsvText('');
      if (onPricesImported) onPricesImported();
    } else {
      setStatus({
        type: 'error',
        message: res.error?.message || 'Failed to parse CSV.',
      });
    }
  };

  const handleAgmarknetTrigger = async () => {
    setIsImportingAgmarknet(true);
    setStatus(null);
    try {
      const res = await triggerAgmarknetImport();
      if (res.success) {
        setStatus({
          type: 'success',
          message: `AGMARKNET API ingestion completed! Fetched: ${res.data?.recordsFetched}, Inserted: ${res.data?.recordsInserted}, Updated: ${res.data?.recordsUpdated}`,
        });
        if (onPricesImported) onPricesImported();
        if (onTriggerSync) onTriggerSync();
      } else {
        setStatus({
          type: 'error',
          message: res.error?.message || 'Ingestion failed.',
        });
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message });
    }
    setIsImportingAgmarknet(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCsvText(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* AGMARKNET Ingestion Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">
              AGMARKNET (data.gov.in) Live Ingestion
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Pull latest daily wholesale arrivals and prices directly from Government of
            India's Open Data API (resource ID{' '}
            <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-300">
              9ef84268...
            </code>
            ) or simulated pilot feed.
          </p>
        </div>

        <button
          onClick={handleAgmarknetTrigger}
          disabled={isImportingAgmarknet}
          className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 ${isImportingAgmarknet ? 'animate-spin' : ''}`} />
          <span>
            {isImportingAgmarknet ? 'Ingesting Feeds...' : 'Trigger AGMARKNET Import'}
          </span>
        </button>
      </div>

      {status && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center space-x-2 ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* CSV Bulk Upload Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Bulk Price Observation Upload
            </h3>
            <p className="text-xs text-slate-500">
              Paste CSV or upload a spreadsheet file with columns:{' '}
              <code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">
                mandiId, commodityId, variety, date, modalPrice, minPrice, maxPrice,
                arrivals
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCsvText(SAMPLE_CSV)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline"
          >
            Insert Sample CSV
          </button>
        </div>

        <form onSubmit={handleBulkSubmit} className="space-y-4">
          <textarea
            rows="6"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="mandiId,commodityId,variety,date,modalPrice,minPrice,maxPrice,arrivals"
            className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl border border-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>Choose CSV File</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !csvText.trim()}
              className="bg-slate-900 hover:bg-slate-800 active:scale-95 text-white px-5 py-2 rounded-xl font-bold text-xs shadow transition-all disabled:opacity-40"
            >
              {loading ? 'Processing Upload...' : 'Ingest Price Rows'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
