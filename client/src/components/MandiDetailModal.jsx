import React from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, X, Store, CheckCircle, Navigation } from 'lucide-react';

export default function MandiDetailModal({ mandi, prices, isOpen, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'en';

  if (!isOpen || !mandi) return null;

  const getLocalizedName = (namesObj, fallback = '') => {
    if (!namesObj) return fallback;
    return namesObj[lang] || namesObj.en || fallback;
  };

  const mandiPrices = prices.filter(
    (p) =>
      p.mandiId === mandi._id ||
      p.mandiCode === mandi.code ||
      p.mandi?._id === mandi._id ||
      p.mandi?.code === mandi.code
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 max-h-[85vh] overflow-y-auto space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-agri-100 text-agri-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">
                {getLocalizedName(mandi.names, mandi.code)}
              </h3>
              <p className="text-xs text-gray-500">
                {mandi.district}, {mandi.state}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address and details */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          {mandi.address && (
            <div className="flex items-start space-x-2 text-gray-600">
              <MapPin className="w-4 h-4 text-agri-600 flex-shrink-0 mt-0.5" />
              <span>{mandi.address}</span>
            </div>
          )}

          {mandi.distanceKm != null && (
            <div className="flex items-center space-x-2 text-agri-800 font-semibold">
              <Navigation className="w-4 h-4 text-agri-600" />
              <span>Distance: ~{mandi.distanceKm} km from your location</span>
            </div>
          )}

          {mandi.phone && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div className="flex items-center space-x-1.5 text-gray-600">
                <Phone className="w-4 h-4 text-agri-600" />
                <span>Office: {mandi.phone}</span>
              </div>
              <a
                href={`tel:${mandi.phone}`}
                className="bg-agri-700 hover:bg-agri-800 text-white px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
              >
                <span>Call Mandi</span>
              </a>
            </div>
          )}
        </div>

        {/* Today's Arrivals & Prices */}
        <div className="space-y-2 pt-1">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Today's Market Rates at this APMC
            </h4>
            <span className="text-[10px] text-gray-400">₹ per quintal</span>
          </div>

          {mandiPrices.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 bg-gray-50 rounded-xl">
              No prices recorded today for this mandi yet.
            </div>
          ) : (
            <div className="space-y-2">
              {mandiPrices.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 p-3 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-xs text-gray-800">
                      {getLocalizedName(
                        p.commodity?.names,
                        p.commodityCode || 'Commodity'
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {p.variety || 'Standard'}{' '}
                      {p.arrivals ? `• ${p.arrivals} tonnes` : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-agri-700">
                      ₹{p.modalPrice}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Range: ₹{p.minPrice} - ₹{p.maxPrice}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl text-xs transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
