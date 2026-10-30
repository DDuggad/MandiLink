import React, { useState } from 'react';
import { Store, Plus, Edit2, Trash2, MapPin, X } from 'lucide-react';
import { createMandi, updateMandi, deleteMandi } from '../services/api';

export default function MandisManager({ mandis, onMandisUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMandi, setEditingMandi] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    enName: '',
    knName: '',
    hiName: '',
    mrName: '',
    state: 'Karnataka',
    district: '',
    lng: '77.5946',
    lat: '12.9716',
    address: '',
    phone: '',
  });

  const openAddModal = () => {
    setEditingMandi(null);
    setFormData({
      code: `KA-${Date.now().toString().slice(-4)}`,
      enName: '',
      knName: '',
      hiName: '',
      mrName: '',
      state: 'Karnataka',
      district: '',
      lng: '77.5946',
      lat: '12.9716',
      address: '',
      phone: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (mandi) => {
    setEditingMandi(mandi);
    setFormData({
      code: mandi.code || '',
      enName: mandi.names?.en || '',
      knName: mandi.names?.kn || '',
      hiName: mandi.names?.hi || '',
      mrName: mandi.names?.mr || '',
      state: mandi.state || 'Karnataka',
      district: mandi.district || '',
      lng: mandi.location?.coordinates?.[0]?.toString() || '77.5946',
      lat: mandi.location?.coordinates?.[1]?.toString() || '12.9716',
      address: mandi.address || '',
      phone: mandi.phone || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this mandi?')) return;
    const res = await deleteMandi(id);
    if (res.success && onMandisUpdated) onMandisUpdated();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code,
      names: {
        en: formData.enName,
        kn: formData.knName || formData.enName,
        hi: formData.hiName || formData.enName,
        mr: formData.mrName || formData.enName,
      },
      state: formData.state,
      district: formData.district,
      location: {
        type: 'Point',
        coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
      },
      address: formData.address,
      phone: formData.phone,
    };

    let res;
    if (editingMandi) {
      res = await updateMandi(editingMandi._id || editingMandi.id, payload);
    } else {
      res = await createMandi(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      if (onMandisUpdated) onMandisUpdated();
    } else {
      alert(`Error saving mandi: ${res.error?.message || 'Check fields'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">APMC Mandis Directory</h2>
          <p className="text-xs text-slate-500">
            Manage monitored agricultural markets with 2dsphere geospatial coordinates
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Mandi</span>
        </button>
      </div>

      {/* Grid of Mandis */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mandis.map((m) => (
          <div
            key={m._id || m.code}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    {m.code}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1">
                    {m.names?.en || m.code}
                  </h3>
                  <p className="text-xs text-slate-500">{m.names?.kn || m.names?.hi}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(m._id || m.code)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    {m.district}, {m.state}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Coordinates: [{m.location?.coordinates?.[0]?.toFixed(4)},{' '}
                  {m.location?.coordinates?.[1]?.toFixed(4)}]
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {editingMandi ? 'Edit APMC Mandi' : 'Register New Mandi'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mandi Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    English Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.enName}
                    onChange={(e) => setFormData({ ...formData, enName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kannada
                  </label>
                  <input
                    type="text"
                    value={formData.knName}
                    onChange={(e) => setFormData({ ...formData, knName: e.target.value })}
                    placeholder="ಹೆಸರು"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hindi</label>
                  <input
                    type="text"
                    value={formData.hiName}
                    onChange={(e) => setFormData({ ...formData, hiName: e.target.value })}
                    placeholder="नाम"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Marathi
                  </label>
                  <input
                    type="text"
                    value={formData.mrName}
                    onChange={(e) => setFormData({ ...formData, mrName: e.target.value })}
                    placeholder="नाव"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    placeholder="e.g. Kolar"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Longitude (GeoJSON)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lng}
                    onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Latitude (GeoJSON)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    required
                    value={formData.lat}
                    onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Office Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Market Yard..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
                >
                  Save Mandi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
