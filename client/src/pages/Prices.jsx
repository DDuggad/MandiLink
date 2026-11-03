import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, AlertCircle, Store, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const [showModelComparison, setShowModelComparison] = useState(false);

  const getLocalizedName = (namesObj, fallback = '') => {
    if (!namesObj) return fallback;
    return namesObj[lang] || namesObj.en || fallback;
  };

  const commodities = [
    { code: 'tomato', en: 'Tomato', kn: 'ಟೊಮೆಟೊ', hi: 'टमाटर', mr: 'टोमॅटो' },
    { code: 'onion', en: 'Onion', kn: 'ಈರುಳ್ಳಿ', hi: 'प्याज', mr: 'कांदा' },
    { code: 'potato', en: 'Potato', kn: 'ಆಲೂಗಡ್ಡೆ', hi: 'आलू', mr: 'बटाटा' },
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

  // Load statistical explainable forecast
  useEffect(() => {
    async function loadForecast() {
      setLoadingForecast(true);
      const res = await fetchPriceForecast(selectedCommodity, 'BLR', 7);
      if (res && res.success) {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-gray-900">{t('prices.title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">{t('prices.selectCommodity')}</p>
      </div>

      {/* Commodity Selector Chips */}
      <div className="flex space-x-2 overflow-x-auto py-1 no-scrollbar">
        {commodities.map((c) => {
          const isSelected = selectedCommodity === c.code;
          return (
            <button
              key={c.code}
              onClick={() => setSelectedCommodity(c.code)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                isSelected
                  ? 'bg-agri-700 text-white shadow-sm ring-2 ring-agri-600/30'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {c[lang] || c.en}
            </button>
          );
        })}
      </div>

      {/* Historical Trend Chart Component (7/30/90/180 Days) */}
      <PriceTrendChart
        prices={historyPrices.length > 0 ? historyPrices : prices}
        days={trendDays}
        onDaysChange={setTrendDays}
      />

      {/* Statistical Explainable Forecast Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-agri-50 text-agri-700">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-900 leading-tight">
                {t('prices.forecast')}
              </h3>
              <span className="text-[10px] text-gray-400 font-medium">
                7-Day Statistical Projection
              </span>
            </div>
          </div>

          {forecast?.selectedModel && (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200 whitespace-nowrap">
              {forecast.selectedModel.label}
            </span>
          )}
        </div>

        {loadingForecast ? (
          <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
            Calculating backtested statistical price projections...
          </div>
        ) : forecast && forecast.forecast ? (
          <div className="space-y-3">
            {/* 7-Day Forecast Horizontal Swipeable Track */}
            <div className="flex space-x-2 overflow-x-auto py-1 no-scrollbar snap-x snap-mandatory">
              {forecast.forecast.map((f, i) => {
                const dateObj = new Date(f.date);
                const dayName = dateObj.toLocaleDateString([], { weekday: 'short' });
                const dateNum = dateObj.toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={f.date}
                    className={`flex-shrink-0 w-24 snap-start p-2.5 rounded-2xl text-center border transition-all ${
                      i === 0
                        ? 'bg-agri-50 border-agri-300 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-gray-700">{dayName}</div>
                    <div className="text-[10px] text-gray-400">{dateNum}</div>
                    <div className="text-sm font-black text-agri-800 mt-1 leading-tight">
                      ₹{f.predictedModalPrice}
                    </div>
                    {f.lowerBound && f.upperBound && (
                      <div className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">
                        ₹{f.lowerBound}–{f.upperBound}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explainability Breakdown Card */}
            {forecast.explainability && (
              <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-emerald-950 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
                    <span>Explainable Model Insights</span>
                  </div>
                  {forecast.selectedModel?.improvementPercent > 0 && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                      +{forecast.selectedModel.improvementPercent}% vs Naive
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-900 leading-relaxed">
                  {forecast.explainability.explanation}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-emerald-100 text-[11px] text-emerald-900">
                  <span>
                    Backtest Error: <strong>{forecast.selectedModel?.mape}% MAPE</strong>{' '}
                    (Holdout: {forecast.explainability.holdoutDays} days)
                  </span>
                  <button
                    onClick={() => setShowModelComparison(!showModelComparison)}
                    className="underline text-emerald-800 font-bold hover:text-emerald-950 cursor-pointer"
                  >
                    {showModelComparison ? 'Hide model details' : 'Compare 5 models'}
                  </button>
                </div>

                {/* Model Comparison Table Dropdown */}
                {showModelComparison && forecast.allModelsCompared && (
                  <div className="mt-2 bg-white rounded-xl p-3 border border-emerald-200 shadow-xs space-y-2 animate-fade-in">
                    <div className="text-[10px] font-bold text-gray-700 uppercase tracking-wide">
                      14-Day Validation Backtest Results
                    </div>
                    <div className="grid gap-1.5">
                      {forecast.allModelsCompared.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs ${
                            m.id === forecast.selectedModel?.id
                              ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-200'
                              : 'text-gray-600 bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0 flex-1 mr-2">
                            {m.id === forecast.selectedModel?.id && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            )}
                            <span className="truncate">{m.label}</span>
                          </div>
                          <span className="font-mono text-[11px] flex-shrink-0">
                            {m.mape}% MAPE · ₹{m.rmse}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Honest Uncertainty Disclaimer */}
            <div className="flex items-start space-x-1.5 bg-amber-50/70 p-3 rounded-2xl border border-amber-200 text-amber-950 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>{forecast.disclaimer || t('prices.disclaimer')}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-gray-400">
            Statistical forecast loaded from last synced data point.
          </div>
        )}
      </div>

      {/* Current Market Rates Per Mandi */}
      <div className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-extrabold text-gray-900">Current Mandi Rates</h3>
          <span className="text-[10px] text-gray-500 font-medium">
            Tap for mandi info
          </span>
        </div>

        <div className="grid gap-2">
          {activePrices.length === 0 ? (
            <div className="bg-white p-4 rounded-2xl text-center text-xs text-gray-400 border border-gray-200">
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
                className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-xs hover:border-agri-300 hover:shadow-sm active:scale-[0.99] transition-all flex justify-between items-center gap-3 cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1.5">
                    <Store className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {getLocalizedName(p.mandi?.names, p.mandiCode || 'APMC Market')}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                    Variety: {p.variety || 'Standard'}{' '}
                    {p.arrivals ? `• Arrivals: ${p.arrivals}t` : ''}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-black text-agri-700">
                    ₹{p.modalPrice?.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    ₹{p.minPrice} – ₹{p.maxPrice}
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
