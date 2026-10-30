import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, AlertCircle, Store } from 'lucide-react';
import { fetchPriceForecast, fetchPriceHistory } from '../services/api';
import PriceTrendChart from '../components/PriceTrendChart';
import MandiDetailModal from '../components/MandiDetailModal';

export default function Prices({ prices, mandis = [] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  const [selectedCommodity, setSelectedCommodity] = useState('tomato');
  const [trendDays, setTrendDays] = useState(30);
  const [historyPrices, setHistoryPrices] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [selectedMandi, setSelectedMandi] = useState(null);

  const getLocalizedName = (namesObj, fallback = '') => {
    if (!namesObj) return fallback;
    return namesObj[lang] || namesObj.en || fallback;
  };

  const commodities = [
    { code: 'tomato', en: 'Tomato', kn: 'ಟೊಮೆಟೊ', hi: 'टमाटर', mr: 'टोमॅटो' },
    { code: 'onion', en: 'Onion', kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज', mr: 'कांदा' },
    { code: 'potato', en: 'Potato', kn: 'ಆಲೂಗಡ್ಡೆ', hi: 'आलू', mr: 'ಬಟಾಟಾ' },
    { code: 'ragi', en: 'Ragi', kn: 'ರಾಗಿ', hi: 'रागी', mr: 'नाचणी' },
    { code: 'rice', en: 'Rice', kn: 'ಅಕ್ಕಿ', hi: 'चावल', mr: 'तांदूळ' },
  ];

  // Load trend history
  useEffect(() => {
    async function loadHistory() {
      const res = await fetchPriceHistory(selectedCommodity, null, trendDays);
      setHistoryPrices(res.data || []);
    }
    loadHistory();
  }, [selectedCommodity, trendDays]);

  // Load forecast
  useEffect(() => {
    async function loadForecast() {
      setLoadingForecast(true);
      const res = await fetchPriceForecast(selectedCommodity, 'BLR', 7);
      if (res.success) {
        setForecast(res);
      } else {
        setForecast(null);
      }
      setLoadingForecast(false);
    }
    loadForecast();
  }, [selectedCommodity]);

  const activePrices = prices.filter(
    (p) =>
      p.commodityCode === selectedCommodity ||
      p.commodity?.code === selectedCommodity ||
      p.commodityId === selectedCommodity
  );

  return (
    <div className="space-y-5 pb-20">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t('prices.title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{t('prices.selectCommodity')}</p>
      </div>

      {/* Commodity Selector Chips */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {commodities.map((c) => (
          <button
            key={c.code}
            onClick={() => setSelectedCommodity(c.code)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCommodity === c.code
                ? 'bg-agri-700 text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            {c[lang] || c.en}
          </button>
        ))}
      </div>

      {/* Historical Trend Chart Component (7/30/90 Days) */}
      <PriceTrendChart
        prices={historyPrices.length > 0 ? historyPrices : prices}
        days={trendDays}
        onDaysChange={setTrendDays}
      />

      {/* 7-Day Explainable Forecast Card */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-agri-700" />
            <h3 className="text-sm font-bold text-gray-900">{t('prices.forecast')}</h3>
          </div>
          {forecast && (
            <span className="text-[10px] bg-agri-50 text-agri-700 font-medium px-2 py-0.5 rounded-full border border-agri-200">
              Backtested: {forecast.bestMethod?.toUpperCase()} (vs. Naive Baseline)
            </span>
          )}
        </div>

        {loadingForecast ? (
          <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
            Calculating statistical forecast...
          </div>
        ) : forecast && forecast.recommendation ? (
          <div className="space-y-2.5">
            <div className="grid grid-cols-4 gap-2 pt-1">
              {forecast.recommendation.forecast.slice(0, 4).map((f) => {
                const dateStr = new Date(f.date).toLocaleDateString([], {
                  weekday: 'short',
                  day: 'numeric',
                });
                return (
                  <div
                    key={f.date}
                    className="bg-agri-50/70 p-2 rounded-xl text-center border border-agri-100"
                  >
                    <div className="text-[10px] text-gray-500 font-medium">{dateStr}</div>
                    <div className="text-xs font-bold text-agri-800 mt-1">
                      ₹{f.predictedModalPrice}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-start space-x-1.5 bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-tight">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{t('prices.disclaimer')}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-gray-400">
            Statistical forecast loaded from last synced data point.
          </div>
        )}
      </div>

      {/* Current Market Rates Per Mandi */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-gray-900">Current Market Rates</h3>
          <span className="text-[10px] text-gray-400">Tap for mandi info</span>
        </div>

        <div className="grid gap-2">
          {activePrices.length === 0 ? (
            <div className="bg-white p-4 rounded-xl text-center text-xs text-gray-400 border border-gray-200">
              No prices recorded for this commodity today.
            </div>
          ) : (
            activePrices.map((p, idx) => (
              <div
                key={p._id || idx}
                onClick={() => {
                  const matchingMandi = mandis.find(
                    (m) =>
                      m._id === p.mandiId ||
                      m.code === p.mandiCode ||
                      m.names?.en === p.mandi?.names?.en
                  );
                  setSelectedMandi(
                    matchingMandi ||
                      p.mandi || {
                        names: { en: p.mandiCode || 'Mandi' },
                        district: 'Local',
                        state: '',
                      }
                  );
                }}
                className="bg-white p-3.5 rounded-xl border border-gray-200/90 shadow-sm hover:border-agri-400 active:scale-[0.99] transition-all flex justify-between items-center cursor-pointer"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Store className="w-3.5 h-3.5 text-agri-600" />
                    <span className="text-xs font-bold text-gray-900">
                      {getLocalizedName(p.mandi?.names, p.mandiCode || 'APMC Market')}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    Variety: {p.variety || 'Standard'}{' '}
                    {p.arrivals ? `• Arrivals: ${p.arrivals}t` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-agri-700">₹{p.modalPrice}</div>
                  <div className="text-[10px] text-gray-400">
                    Range: ₹{p.minPrice} - ₹{p.maxPrice}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mandi Detail Modal */}
      <MandiDetailModal
        mandi={selectedMandi}
        prices={prices}
        isOpen={Boolean(selectedMandi)}
        onClose={() => setSelectedMandi(null)}
      />
    </div>
  );
}
