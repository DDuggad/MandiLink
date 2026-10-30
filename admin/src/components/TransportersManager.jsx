import React, { useState } from 'react';
import { Truck, Plus, Edit2, Trash2, Phone, CheckCircle, X } from 'lucide-react';
import { createTransporter, updateTransporter, deleteTransporter } from '../services/api';

export default function TransportersManager({ transporters, onTransportersUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransporter, setEditingTransporter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    languages: 'Kannada, English, Hindi',
    vehicleTypes: 'mini truck, tempo',
    ratePerKm: '25',
    capacityKg: '1500',
    serviceDistricts: 'Bengaluru Urban, Kolar',
    lng: '77.5946',
    lat: '12.9716',
  });

  const openAddModal = () => {
    setEditingTransporter(null);
    setFormData({
      name: '',
      phone: '',
      languages: 'Kannada, English, Hindi',
      vehicleTypes: 'mini truck, tempo',
      ratePerKm: '25',
      capacityKg: '1500',
      serviceDistricts: 'Bengaluru Urban, Kolar',
      lng: '77.5946',
      lat: '12.9716',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTransporter(t);
    setFormData({
      name: t.name || '',
      phone: t.phone || '',
      languages: t.languages?.join(', ') || '',
      vehicleTypes: t.vehicleTypes?.join(', ') || '',
      ratePerKm: t.ratePerKm?.toString() || '25',
      capacityKg: t.capacityKg?.toString() || '1500',
      serviceDistricts: t.serviceDistricts?.join(', ') || '',
      lng: t.baseLocation?.coordinates?.[0]?.toString() || '77.5946',
      lat: t.baseLocation?.coordinates?.[1]?.toString() || '12.9716',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this transporter registration?')) return;
    const res = await deleteTransporter(id);
    if (res.success && onTransportersUpdated) onTransportersUpdated();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      phone: formData.phone,
      languages: formData.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean),
      vehicleTypes: formData.vehicleTypes
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
      ratePerKm: Number(formData.ratePerKm) || 25,
      capacityKg: Number(formData.capacityKg) || 1500,
      serviceDistricts: formData.serviceDistricts
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
      baseLocation: {
        type: 'Point',
        coordinates: [parseFloat(formData.lng), parseFloat(formData.lat)],
      },
    };

    let res;
    if (editingTransporter) {
      res = await updateTransporter(
        editingTransporter._id || editingTransporter.id,
        payload
      );
    } else {
      res = await createTransporter(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      if (onTransportersUpdated) onTransportersUpdated();
    } else {
      alert(`Error saving transporter: ${res.error?.message || 'Check fields'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Registered Local Transporters
          </h2>
          <p className="text-xs text-slate-500">
            Maintain local vehicle operators, rates per km, and operating districts for
            farmers
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Transporter</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transporters.map((t) => (
          <div
            key={t._id}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                    {t.isVerified && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-slate-500 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{t.phone}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(t)}
                    className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(t._id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicles:</span>
                  <span className="font-semibold text-slate-700">
                    {t.vehicleTypes?.join(', ') || 'Truck'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rate / Km:</span>
                  <span className="font-bold text-emerald-700">₹{t.ratePerKm || 25}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Districts:</span>
                  <span className="truncate max-w-[150px]">
                    {t.serviceDistricts?.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">
                {editingTransporter ? 'Edit Transporter' : 'Register New Transporter'}
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
                    Driver/Business Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Suresh Logistics"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Mobile Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98..."
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rate per Km (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.ratePerKm}
                    onChange={(e) =>
                      setFormData({ ...formData, ratePerKm: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Capacity (Kg)
                  </label>
                  <input
                    type="number"
                    value={formData.capacityKg}
                    onChange={(e) =>
                      setFormData({ ...formData, capacityKg: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Vehicles (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.vehicleTypes}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleTypes: e.target.value })
                  }
                  placeholder="mini truck, tempo, tractor trolley"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.languages}
                  onChange={(e) =>
                    setFormData({ ...formData, languages: e.target.value })
                  }
                  placeholder="Kannada, Hindi, English"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Districts (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.serviceDistricts}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceDistricts: e.target.value })
                  }
                  placeholder="Bengaluru Urban, Kolar, Mandya"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
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
                  Save Transporter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
