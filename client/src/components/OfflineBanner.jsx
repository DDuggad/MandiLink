import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff, Clock } from 'lucide-react';

export default function OfflineBanner({ isOnline, lastSynced }) {
  const { t } = useTranslation();

  if (isOnline) return null;

  const formattedTime = lastSynced
    ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="bg-amber-500 text-amber-950 text-xs font-semibold shadow-inner transition-all animate-slide-up">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-1.5 min-w-0">
          <WifiOff className="w-3.5 h-3.5 text-amber-900 flex-shrink-0" />
          <span className="truncate">{t('status.offline')}</span>
        </div>
        {formattedTime && (
          <div className="flex items-center space-x-1 text-amber-900/90 text-[11px] font-medium flex-shrink-0">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              {t('status.lastUpdated')}: {formattedTime}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
