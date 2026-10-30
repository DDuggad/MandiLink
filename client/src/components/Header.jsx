import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, RefreshCw, MapPin } from 'lucide-react';
import { SUPPORTED_LANGUAGES, setLanguage } from '../i18n';

export default function Header({ isOnline, onSync, isSyncing, userLocation }) {
  const { t, i18n } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header className="sticky top-0 z-30 bg-agri-700 text-white shadow-md">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20">
              🌾
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-tight">
                {t('app.name')}
              </h1>
              <div className="flex items-center space-x-1 text-xs text-agri-100">
                <MapPin className="w-3 h-3" />
                <span>{userLocation || 'Bengaluru / Kolar'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sync button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
              title="Sync latest data"
            >
              <RefreshCw
                className={`w-4 h-4 text-white ${isSyncing ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Language Switcher pill */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold border border-white/20 active:scale-95 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.native}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {t('settings.language')}
              </h3>
              <button
                onClick={() => setShowLangModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLangModal(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    i18n.language === lang.code
                      ? 'border-agri-600 bg-agri-50 text-agri-900 font-bold shadow-sm'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-base font-semibold">{lang.native}</div>
                  <div className="text-xs text-gray-500">{lang.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
