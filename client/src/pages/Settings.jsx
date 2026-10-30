import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, MapPin, Database, Sliders, Trash2 } from 'lucide-react';
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
    <div className="space-y-5 pb-20">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t('settings.title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">App preferences & offline storage</p>
      </div>

      {message && (
        <div className="bg-green-50 text-green-800 border border-green-200 text-xs p-3 rounded-xl">
          {message}
        </div>
      )}

      {/* Language Section */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <Globe className="w-4 h-4 text-agri-700" />
          <h3 className="text-sm font-bold text-gray-900">{t('settings.language')}</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`p-3 rounded-xl border text-left transition-all ${
                i18n.language === lang.code
                  ? 'border-agri-600 bg-agri-50 text-agri-900 font-bold'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-semibold">{lang.native}</div>
              <div className="text-[10px] text-gray-500">{lang.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Radius Slider */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-agri-700" />
            <h3 className="text-sm font-bold text-gray-900">Nearby Mandi Radius</h3>
          </div>
          <span className="text-xs font-bold text-agri-700 bg-agri-50 px-2.5 py-0.5 rounded-full border border-agri-200">
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
          className="w-full accent-agri-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400">
          <span>10 km</span>
          <span>50 km (Default)</span>
          <span>150 km</span>
        </div>
      </div>

      {/* Manual Location Selection & GPS */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-agri-700" />
            <h3 className="text-sm font-bold text-gray-900">{t('settings.location')}</h3>
          </div>
          {onGpsRequest && (
            <button
              onClick={onGpsRequest}
              className="text-[11px] font-bold text-agri-700 bg-agri-50 hover:bg-agri-100 border border-agri-200 px-2.5 py-1 rounded-xl transition-all"
            >
              📍 Use GPS
            </button>
          )}
        </div>

        <select
          value={userLocation}
          onChange={(e) => setUserLocation(e.target.value)}
          className="w-full p-2.5 text-xs rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-agri-500"
        >
          <option value="Bengaluru Urban">Bengaluru Urban, Karnataka</option>
          <option value="Kolar">Kolar, Karnataka</option>
          <option value="Pune">Pune, Maharashtra</option>
          <option value="Nashik">Nashik, Maharashtra</option>
          <option value="Current GPS Location">Current GPS Location</option>
        </select>
      </div>

      {/* Low-Data / Data Saver Mode */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-900">Data-Saver Mode (2G/3G)</div>
          <div className="text-[10px] text-gray-500">
            Only sync delta diffs on user tap
          </div>
        </div>
        <button
          onClick={() => setDataSaver(!dataSaver)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
            dataSaver ? 'bg-agri-600' : 'bg-gray-200'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              dataSaver ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Clear Cache */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-gray-900">
            {t('settings.clearCache')}
          </div>
          <div className="text-[10px] text-gray-500">IndexedDB local database</div>
        </div>
        <button
          onClick={handleClearCache}
          disabled={clearing}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
