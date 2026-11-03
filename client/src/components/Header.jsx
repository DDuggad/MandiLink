import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, RefreshCw, MapPin, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, setLanguage } from '../i18n';

export default function Header({ isOnline, onSync, isSyncing, userLocation }) {
  const { t, i18n } = useTranslation();
  const [showLangModal, setShowLangModal] = useState(false);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header className="sticky top-0 z-30 bg-agri-700 text-white shadow-md pt-safe">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
          {/* Logo & App title with location */}
          <div className="flex items-center space-x-2.5 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-lg border border-white/20 shadow-inner flex-shrink-0">
              🌾
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-1.5">
                <h1 className="text-base font-extrabold tracking-tight leading-none text-white truncate">
                  {t('app.name')}
                </h1>
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    isOnline
                      ? 'bg-emerald-300 ring-2 ring-emerald-300/40 animate-pulse'
                      : 'bg-amber-300 ring-2 ring-amber-300/40'
                  }`}
                  title={isOnline ? 'Online' : 'Offline Mode'}
                />
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-agri-100 mt-1">
                <MapPin className="w-3 h-3 text-agri-300 flex-shrink-0" />
                <span className="truncate" title={userLocation || 'Bengaluru / Kolar'}>
                  {userLocation || 'Bengaluru / Kolar'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons cluster */}
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {/* Sync button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/10 text-white"
              title="Sync latest live prices"
              aria-label="Sync prices"
            >
              <RefreshCw
                className={`w-4 h-4 ${isSyncing ? 'animate-spin text-agri-200' : 'text-white'}`}
              />
            </button>

            {/* Language Switcher pill */}
            <button
              onClick={() => setShowLangModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold border border-white/20 active:scale-95 transition-all shadow-sm"
              aria-label="Change language"
            >
              <Globe className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="leading-tight">{currentLang.native}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-gray-100 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-agri-700" />
                <span>{t('settings.language')}</span>
              </h3>
              <button
                onClick={() => setShowLangModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-lg leading-none transition-colors"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangModal(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'border-agri-600 bg-agri-50 text-agri-900 font-bold shadow-sm ring-2 ring-agri-500/30'
                        : 'border-gray-200 hover:border-agri-300 hover:bg-slate-50 text-gray-700'
                    }`}
                  >
                    <div className="text-sm font-bold text-gray-900">{lang.native}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{lang.label}</div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-agri-700 absolute top-3 right-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
