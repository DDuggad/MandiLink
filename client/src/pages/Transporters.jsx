import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Phone, CheckCircle2, MapPin, MessageCircle } from 'lucide-react';

export default function Transporters({ transporters }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-extrabold text-gray-900">
          {t('transporters.title')}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Verified rural logistics, transparent per-km rates, and tap-to-call
        </p>
      </div>

      <div className="grid gap-3">
        {transporters.length === 0 ? (
          <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center text-xs text-gray-400 shadow-xs">
            No transporters registered in this radius. Try increasing search radius in
            Settings.
          </div>
        ) : (
          transporters.map((tItem) => {
            const cleanPhone = (tItem.phone || '').replace(/[^0-9]/g, '');

            return (
              <div
                key={tItem._id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3.5 hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                      <h3 className="font-extrabold text-sm text-gray-900 truncate">
                        {tItem.name}
                      </h3>
                      {tItem.isVerified && (
                        <span className="inline-flex items-center space-x-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-agri-600 flex-shrink-0" />
                      <span className="truncate">
                        {tItem.serviceDistricts?.join(', ') || 'Regional'}
                      </span>
                    </div>
                  </div>

                  {tItem.distanceKm != null && (
                    <span className="text-[11px] font-bold text-agri-800 bg-agri-50 px-2.5 py-1 rounded-full border border-agri-200 flex-shrink-0 whitespace-nowrap">
                      {tItem.distanceKm} km away
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                    <span className="text-gray-500 block text-[10px] font-semibold uppercase tracking-wider">
                      Vehicles & Payload
                    </span>
                    <span className="font-bold text-gray-800 text-xs block mt-0.5 truncate">
                      {tItem.vehicleTypes?.join(', ') || 'Tractor / Mini Truck'}
                    </span>
                    {tItem.capacityKg && (
                      <span className="text-[11px] text-emerald-800 font-bold block mt-0.5">
                        Up to {tItem.capacityKg} kg
                      </span>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
                    <span className="text-gray-500 block text-[10px] font-semibold uppercase tracking-wider">
                      Standard Rate
                    </span>
                    <span className="font-black text-agri-700 text-sm block mt-0.5">
                      {t('transporters.rate', { rate: tItem.ratePerKm || 28 })}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Negotiable on bulk
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <span
                    className="text-xs text-gray-600 min-w-0 flex-1 truncate"
                    title={tItem.languages?.join(', ')}
                  >
                    🗣️ {tItem.languages?.join(', ') || 'Local'}
                  </span>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {/* WhatsApp button */}
                    {cleanPhone && (
                      <a
                        href={`https://wa.me/${cleanPhone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 px-3 py-1.5 rounded-xl font-bold text-xs border border-emerald-200 transition-all"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Chat</span>
                      </a>
                    )}

                    {/* Tap to Call button */}
                    <a
                      href={`tel:${tItem.phone}`}
                      className="flex items-center space-x-1.5 bg-agri-700 hover:bg-agri-800 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{t('transporters.call')}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
