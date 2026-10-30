import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, TrendingUp, Store } from 'lucide-react';

export default function Home({ mandis, prices, onSelectCommodity, onSelectMandi }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const getLocalizedName = (namesObj, fallback = '') => {
    if (!namesObj) return fallback;
    return namesObj[lang] || namesObj.en || fallback;
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-agri-700 to-agri-800 text-white p-4 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold">{t('app.tagline')}</h2>
        <p className="text-xs text-agri-100 mt-1">
          {t('home.unit')} · Real-time and offline accessible
        </p>
      </div>

      {/* Nearby Mandis Section */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
            <Store className="w-4 h-4 text-agri-700" />
            <span>{t('home.nearbyMandis')}</span>
          </h3>
          <span className="text-xs bg-agri-100 text-agri-800 px-2 py-0.5 rounded-full font-semibold">
            {mandis.length} Mandis
          </span>
        </div>

        <div className="grid gap-2.5">
          {mandis.length === 0 ? (
            <div className="bg-white p-4 rounded-xl text-center text-sm text-gray-500 border border-gray-100">
              {t('home.noMandis')}
            </div>
          ) : (
            mandis.map((mandi) => (
              <div
                key={mandi._id || mandi.code}
                onClick={() => onSelectMandi && onSelectMandi(mandi)}
                className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-sm hover:border-agri-400 active:scale-[0.99] transition-all flex justify-between items-center"
              >
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {getLocalizedName(mandi.names, mandi.code)}
                  </h4>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                    <MapPin className="w-3 h-3 text-agri-600" />
                    <span>
                      {mandi.district}, {mandi.state}
                    </span>
                  </div>
                </div>
                {mandi.distanceKm != null && (
                  <div className="text-right">
                    <span className="text-xs font-bold text-agri-700 bg-agri-50 px-2.5 py-1 rounded-full border border-agri-200">
                      {t('home.distance', { km: mandi.distanceKm })}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* Commodity Prices Grid */}
      <section className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-base font-bold text-gray-900 flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-agri-700" />
            <span>{t('home.topCommodities')}</span>
          </h3>
          <span className="text-xs text-gray-500">{t('home.unit')}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {prices.map((price) => {
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
                className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-sm hover:border-agri-400 active:scale-[0.98] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-500 truncate max-w-[100px]">
                      {mandiName}
                    </span>
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {price.variety || 'Local'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mt-1">{commName}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-100">
                  <div className="text-lg font-extrabold text-agri-700 leading-tight">
                    ₹{price.modalPrice?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Min: ₹{price.minPrice} · Max: ₹{price.maxPrice}
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
