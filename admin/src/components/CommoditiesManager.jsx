import React, { useState } from 'react';
import { Apple, Plus, Edit2, Trash2, X } from 'lucide-react';
import { createCommodity, updateCommodity, deleteCommodity } from '../services/api';

export default function CommoditiesManager({ commodities, onCommoditiesUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCommodity, setEditingCommodity] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    enName: '',
    knName: '',
    hiName: '',
    mrName: '',
    category: 'vegetable',
    defaultUnit: 'quintal',
    varieties: '',
  });

  const openAddModal = () => {
    setEditingCommodity(null);
    setFormData({
      code: '',
      enName: '',
      knName: '',
      hiName: '',
      mrName: '',
      category: 'vegetable',
      defaultUnit: 'quintal',
      varieties: 'Standard, Local, Hybrid',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (comm) => {
    setEditingCommodity(comm);
    setFormData({
      code: comm.code || '',
      enName: comm.names?.en || '',
      knName: comm.names?.kn || '',
      hiName: comm.names?.hi || '',
      mrName: comm.names?.mr || '',
      category: comm.category || 'vegetable',
      defaultUnit: comm.defaultUnit || 'quintal',
      varieties: comm.varieties?.join(', ') || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this commodity?')) return;
    const res = await deleteCommodity(id);
    if (res.success && onCommoditiesUpdated) onCommoditiesUpdated();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      code: formData.code.toLowerCase().trim(),
      names: {
        en: formData.enName,
        kn: formData.knName || formData.enName,
        hi: formData.hiName || formData.enName,
        mr: formData.mrName || formData.enName,
      },
      category: formData.category,
      defaultUnit: formData.defaultUnit,
      varieties: formData.varieties
        ? formData.varieties
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
        : [],
    };

    let res;
    if (editingCommodity) {
      res = await updateCommodity(editingCommodity._id || editingCommodity.code, payload);
    } else {
      res = await createCommodity(payload);
    }

    if (res.success) {
      setIsModalOpen(false);
      if (onCommoditiesUpdated) onCommoditiesUpdated();
    } else {
      alert(`Error saving commodity: ${res.error?.message || 'Check fields'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Agricultural Commodities</h2>
          <p className="text-xs text-slate-500">
            Define commodities with multilingual labels (en, kn, hi, mr) and category
            groupings
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Commodity</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commodities.map((c) => (
          <div
            key={c._id || c.code}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                    {c.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                    {c.names?.en || c.code}
                  </h3>
                  <div className="text-xs text-slate-500 mt-0.5 space-x-1">
                    <span>{c.names?.kn}</span> • <span>{c.names?.hi}</span> •{' '}
                    <span>{c.names?.mr}</span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id || c.code)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-600 pt-2 border-t border-slate-100 flex justify-between items-center">
                <span>Unit: {c.defaultUnit || 'quintal'}</span>
                <span className="text-[10px] text-slate-400">
                  {c.varieties?.length || 0} varieties
                </span>
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
                {editingCommodity ? 'Edit Commodity' : 'Register New Commodity'}
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
                    Code Slug
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. tomato"
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
                    placeholder="e.g. Tomato"
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
                    placeholder="ಟೊಮೆಟೊ"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hindi</label>
                  <input
                    type="text"
                    value={formData.hiName}
                    onChange={(e) => setFormData({ ...formData, hiName: e.target.value })}
                    placeholder="टमाटर"
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
                    placeholder="टोमॅटो"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="vegetable">Vegetable</option>
                    <option value="cereal">Cereal</option>
                    <option value="pulse">Pulse</option>
                    <option value="fruit">Fruit</option>
                    <option value="oilseed">Oilseed</option>
                    <option value="spice">Spice</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Unit
                  </label>
                  <input
                    type="text"
                    value={formData.defaultUnit}
                    onChange={(e) =>
                      setFormData({ ...formData, defaultUnit: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Varieties (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.varieties}
                  onChange={(e) =>
                    setFormData({ ...formData, varieties: e.target.value })
                  }
                  placeholder="Local, Hybrid, Nasik Special"
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
                  Save Commodity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
