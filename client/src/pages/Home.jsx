import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, TrendingUp, Store, Truck, ArrowRight, RefreshCw } from 'lucide-react';
import { fetchLiveStatus } from '../services/api';

export default function Home({
  mandis,
  prices,
  onSelectCommodity,
  onSelectMandi,
  onNavigateTab,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';
  const [liveStatus, setLiveStatus] = useState(null);

  useEffect(() => {
    async function checkStatus() {
      const res = await fetchLiveStatus();
      if (res && res.success) {
        setLiveStatus(res);
      }
    }
    checkStatus();
  }, []);

  const getLocalizedName = (namesObj, fallback = '') => {
    if (!namesObj) return fallback;
    return namesObj[lang] || namesObj.en || fallback;
  };

  return (
    <div className="space-y-4">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-agri-700 via-agri-800 to-agri-900 text-white p-5 rounded-3xl shadow-md relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-[11px] font-semibold tracking-wide border border-white/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live APMC AGMARKNET Feed</span>
          </div>

          <h2 className="text-lg font-black leading-snug tracking-tight text-white">
            {t('app.tagline')}
          </h2>

          <p className="text-xs text-agri-100 leading-relaxed max-w-sm">
            Instant price discovery, 180-day price trends, explainable forecasts, and
            verified rural transporters.
          </p>

          <div className="pt-1.5 flex flex-wrap gap-2 text-[11px]">
            <span className="bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10 font-medium text-agri-50">
              🏛️ {mandis.length} Monitored Mandis
            </span>
            <span className="bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10 font-medium text-agri-50">
              📈 4,500+ Verified Records
            </span>
            <span className="bg-black/20 backdrop-blur-sm px-2.5 py-1 rounded-xl border border-white/10 font-medium text-agri-50">
              ⚡ Offline Delta-Sync
            </span>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Action Navigation Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigateTab && onNavigateTab('prices')}
          className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-xs hover:border-agri-300 hover:shadow-sm active:scale-[0.98] transition-all text-left flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-agri-50 text-agri-700 flex items-center justify-center flex-shrink-0 group-hover:bg-agri-100 transition-colors">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 truncate">Price Trends</div>
            <div className="text-[10px] text-gray-500 truncate">Forecasts & rates</div>
          </div>
        </button>

        <button
          onClick={() => onNavigateTab && onNavigateTab('transporters')}
          className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-xs hover:border-agri-300 hover:shadow-sm active:scale-[0.98] transition-all text-left flex items-center space-x-3 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
            <Truck className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-gray-900 truncate">Transporters</div>
            <div className="text-[10px] text-gray-500 truncate">Tap-to-call drivers</div>
          </div>
        </button>
      </div>

      {/* Nearby APMC Mandis Section */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
            <Store className="w-4 h-4 text-agri-700 flex-shrink-0" />
            <span>{t('home.nearbyMandis')}</span>
          </h3>
          <span className="text-[11px] bg-agri-100 text-agri-800 px-2 py-0.5 rounded-full font-bold">
            {mandis.length} Active
          </span>
        </div>

        <div className="grid gap-2">
          {mandis.length === 0 ? (
            <div className="bg-white p-4 rounded-2xl text-center text-xs text-gray-500 border border-gray-100 shadow-xs">
              {t('home.noMandis')}
            </div>
          ) : (
            mandis.map((mandi) => (
              <div
                key={mandi._id || mandi.code}
                onClick={() => onSelectMandi && onSelectMandi(mandi)}
                className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-xs hover:border-agri-300 hover:shadow-sm active:scale-[0.99] transition-all flex justify-between items-center gap-2 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight truncate">
                    {getLocalizedName(mandi.names, mandi.code)}
                  </h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-agri-600 flex-shrink-0" />
                    <span className="truncate">
                      {mandi.district}, {mandi.state}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {mandi.distanceKm != null && (
                    <span className="text-[11px] font-bold text-agri-800 bg-agri-50 px-2 py-0.5 rounded-full border border-agri-200 whitespace-nowrap">
                      {t('home.distance', { km: mandi.distanceKm })}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Top Commodity Rates Grid */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-gray-900 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-agri-700 flex-shrink-0" />
            <span>{t('home.topCommodities')}</span>
          </h3>
          <span className="text-[11px] text-gray-500 font-medium">{t('home.unit')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {prices.slice(0, 6).map((price) => {
            const commName = getLocalizedName(
              price.commodity?.names,
              price.commodityCode || 'Produce'
            );
            const mandiName = getLocalizedName(
              price.mandi?.names,
              price.mandiCode || 'Market'
            );

            return (
              <div
                key={price._id}
                onClick={() => onSelectCommodity && onSelectCommodity(price)}
                className="bg-white p-3 rounded-2xl border border-gray-200/90 shadow-xs hover:border-agri-300 hover:shadow-sm active:scale-[0.98] transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start gap-1">
                    <span
                      className="text-[11px] font-medium text-gray-500 truncate min-w-0 flex-1"
                      title={mandiName}
                    >
                      {mandiName}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      {price.variety || 'Local'}
                    </span>
                  </div>
                  <h4
                    className="text-xs sm:text-sm font-bold text-gray-900 mt-1 truncate"
                    title={commName}
                  >
                    {commName}
                  </h4>
                </div>

                <div className="mt-2.5 pt-2 border-t border-gray-100">
                  <div className="text-base sm:text-lg font-black text-agri-700 leading-tight">
                    ₹{price.modalPrice?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    ₹{price.minPrice} – ₹{price.maxPrice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
