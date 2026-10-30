import React, { useState } from 'react';
import { PlusCircle, Check, AlertCircle } from 'lucide-react';
import { submitManualPrice } from '../services/api';

export default function PriceEntry({ mandis, commodities, onPriceAdded }) {
  const [formData, setFormData] = useState({
    mandiId: mandis[0]?._id || mandis[0]?.id || '',
    commodityId: commodities[0]?._id || commodities[0]?.id || '',
    variety: 'Standard / Local',
    minPrice: '',
    modalPrice: '',
    maxPrice: '',
    unit: '₹/kg',
    date: new Date().toISOString().split('T')[0],
  });

  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!formData.minPrice || !formData.modalPrice || !formData.maxPrice) {
      setStatus({
        type: 'error',
        message: 'Please fill in all price values (Min, Modal, Max).',
      });
      return;
    }

    const min = Number(formData.minPrice);
    const modal = Number(formData.modalPrice);
    const max = Number(formData.maxPrice);

    if (min > modal || modal > max) {
      setStatus({
        type: 'error',
        message:
          'Invalid price range: Min Price ≤ Modal Price ≤ Max Price must hold true.',
      });
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...formData,
      minPrice: min,
      modalPrice: modal,
      maxPrice: max,
      source: 'manual',
    };

    const res = await submitManualPrice(payload);
    setIsSubmitting(false);

    if (res.success || res.status === 201) {
      setStatus({
        type: 'success',
        message: 'Price record recorded and published successfully!',
      });
      if (onPriceAdded) onPriceAdded(res.data || payload);
      // Reset inputs
      setFormData((prev) => ({
        ...prev,
        minPrice: '',
        modalPrice: '',
        maxPrice: '',
      }));
    } else {
      setStatus({
        type: 'error',
        message: res.error || 'Failed to submit price record.',
      });
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-800">Manual Price Entry</h2>
        <p className="text-sm text-slate-500">
          Enter verified mandi prices for today. Manual entries take precedence over
          automated scraping feeds.
        </p>
      </div>

      {status.message && (
        <div
          className={`mb-5 p-4 rounded-lg flex items-center space-x-2 text-sm ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Select Mandi
            </label>
            <select
              name="mandiId"
              value={formData.mandiId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {mandis.map((m) => (
                <option key={m._id || m.id || m.code} value={m._id || m.id || m.code}>
                  {m.names?.en || m.name?.en || m.code} ({m.district})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Commodity
            </label>
            <select
              name="commodityId"
              value={formData.commodityId}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {commodities.map((c) => (
                <option key={c._id || c.id || c.code} value={c._id || c.id || c.code}>
                  {c.names?.en || c.name?.en || c.code} ({c.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Variety / Grade
            </label>
            <input
              type="text"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              placeholder="e.g. Desi, Hybrid, Local"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Price Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Min Price (₹)
            </label>
            <input
              type="number"
              step="0.1"
              name="minPrice"
              value={formData.minPrice}
              onChange={handleChange}
              placeholder="20.0"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Modal Price (₹)
            </label>
            <input
              type="number"
              step="0.1"
              name="modalPrice"
              value={formData.modalPrice}
              onChange={handleChange}
              placeholder="26.5"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Max Price (₹)
            </label>
            <input
              type="number"
              step="0.1"
              name="maxPrice"
              value={formData.maxPrice}
              onChange={handleChange}
              placeholder="32.0"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors disabled:opacity-60"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Record Price'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
