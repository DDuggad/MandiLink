import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, MapPin, Sliders, Trash2 } from 'lucide-react';
import { SUPPORTED_LANGUAGES, setLanguage } from '../i18n';
import { clearLocalCache } from '../services/db';

export default function Settings({
  radiusKm,
  setRadiusKm,
  userLocation,
  setUserLocation,
  onGpsRequest,
}) {
  const { t, i18n } = useTranslation();
  const [clearing, setClearing] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [message, setMessage] = useState('');

  const handleClearCache = async () => {
    if (
      !window.confirm(
        'Clear cached mandi and price data? It will be re-downloaded when online.'
      )
    )
      return;
    setClearing(true);
    await clearLocalCache();
    setMessage('Cache cleared successfully.');
    setClearing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-gray-900">{t('settings.title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">App preferences & offline storage</p>
      </div>

      {message && (
        <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs p-3.5 rounded-2xl font-bold animate-slide-up">
          {message}
        </div>
      )}

      {/* Language Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-agri-700 flex-shrink-0" />
          <h3 className="text-sm font-extrabold text-gray-900">
            {t('settings.language')}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = i18n.language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-agri-600 bg-agri-50 text-agri-950 font-bold shadow-xs ring-2 ring-agri-500/20'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-bold leading-tight">{lang.native}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{lang.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Radius Slider */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-agri-700 flex-shrink-0" />
            <h3 className="text-sm font-extrabold text-gray-900">Nearby Mandi Radius</h3>
          </div>
          <span className="text-xs font-bold text-agri-800 bg-agri-50 px-2.5 py-1 rounded-full border border-agri-200">
            {radiusKm} km
          </span>
        </div>

        <input
          type="range"
          min="10"
          max="150"
          step="5"
          value={radiusKm}
          onChange={(e) => setRadiusKm(Number(e.target.value))}
          className="w-full accent-agri-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>10 km</span>
          <span>50 km (Default)</span>
          <span>150 km</span>
        </div>
      </div>

      {/* Manual Location Selection & GPS */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-agri-700 flex-shrink-0" />
            <h3 className="text-sm font-extrabold text-gray-900">
              {t('settings.location')}
            </h3>
          </div>
          {onGpsRequest && (
            <button
              onClick={onGpsRequest}
              className="text-[11px] font-bold text-agri-800 bg-agri-50 hover:bg-agri-100 active:scale-95 border border-agri-200 px-3 py-1.5 rounded-xl transition-all"
            >
              📍 Use GPS
            </button>
          )}
        </div>

        <select
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-agri-500 font-medium cursor-pointer"
        >
          <option value="Bengaluru Urban">Bengaluru Urban, Karnataka</option>
          <option value="Kolar">Kolar, Karnataka</option>
          <option value="Pune">Pune, Maharashtra</option>
          <option value="Nashik">Nashik, Maharashtra</option>
          <option value="Current GPS Location">Current GPS Location</option>
        </select>
      </div>

      {/* Low-Data / Data Saver Mode */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-gray-900">Data-Saver Mode (2G/3G)</div>
          <div className="text-[11px] text-gray-500">
            Only sync delta diffs on user tap
          </div>
        </div>
        <button
          onClick={() => setDataSaver(!dataSaver)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors flex-shrink-0 cursor-pointer ${
            dataSaver ? 'bg-agri-600' : 'bg-gray-200'
          }`}
          aria-label="Toggle data saver"
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              dataSaver ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Clear Cache */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-gray-900 truncate">
            {t('settings.clearCache')}
          </div>
          <div className="text-[11px] text-gray-500">IndexedDB local database</div>
        </div>
        <button
          onClick={handleClearCache}
          disabled={clearing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 text-xs font-bold transition-all flex-shrink-0 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
