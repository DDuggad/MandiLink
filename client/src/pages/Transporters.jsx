import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, Phone, CheckCircle2, MapPin } from 'lucide-react';

export default function Transporters({ transporters }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-lg font-bold text-gray-900">{t('transporters.title')}</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Verified local drivers with rates and vehicle capacity
        </p>
      </div>

      <div className="grid gap-3">
        {transporters.map((tItem) => (
          <div
            key={tItem._id}
            className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-bold text-sm text-gray-900">{tItem.name}</h3>
                  {tItem.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center space-x-1 text-xs text-gray-500 mt-0.5">
                  <MapPin className="w-3 h-3 text-agri-600" />
                  <span>{tItem.serviceDistricts?.join(', ') || 'Local region'}</span>
                </div>
              </div>

              {tItem.distanceKm != null && (
                <span className="text-xs font-semibold text-agri-700 bg-agri-50 px-2 py-0.5 rounded-full border border-agri-200">
                  {tItem.distanceKm} km
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Vehicles</span>
                <span className="font-semibold text-gray-800">
                  {tItem.vehicleTypes?.join(', ') || 'Truck'}
                </span>
              </div>
              <div className="bg-gray-50 p-2 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Est. Rate</span>
                <span className="font-semibold text-agri-700">
                  {t('transporters.rate', { rate: tItem.ratePerKm || 25 })}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100">
              <span className="text-[11px] text-gray-500">
                {t('transporters.languages', {
                  langs: tItem.languages?.join(', ') || 'Local',
                })}
              </span>

              {/* Tap to Call button */}
              <a
                href={`tel:${tItem.phone}`}
                className="flex items-center space-x-1.5 bg-agri-600 hover:bg-agri-700 active:scale-95 text-white px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-sm transition-all"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{t('transporters.call')}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
