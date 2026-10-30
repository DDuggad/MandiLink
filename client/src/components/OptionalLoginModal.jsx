import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, Phone, User, ArrowRight, X } from 'lucide-react';

export default function OptionalLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const { t } = useTranslation();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const userData = {
      phone: phone || 'Anonymous',
      name: name || 'Farmer',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem('mandilink_farmer_user', JSON.stringify(userData));
    localStorage.setItem('mandilink_auth_dismissed', 'true');
    if (onLoginSuccess) onLoginSuccess(userData);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('mandilink_auth_dismissed', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 relative space-y-5">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
          aria-label="Skip login"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 bg-agri-100 text-agri-700 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{t('app.title')}</h2>
          <p className="text-xs text-gray-600 max-w-xs mx-auto">{t('app.tagline')}</p>
        </div>

        <div className="bg-agri-50 p-3 rounded-2xl border border-agri-200/70 text-xs text-agri-900 text-center">
          <span className="font-semibold">Login is completely optional.</span> You can use
          all market rates, forecasts, and transporters without an account.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Farmer Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Patil"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-agri-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-agri-700 hover:bg-agri-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <span>Save & Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-1">
          <button
            type="button"
            onClick={handleSkip}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            Skip for now (No account needed)
          </button>
        </div>
      </div>
    </div>
  );
}
