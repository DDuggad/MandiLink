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
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-xs font-medium flex items-center justify-between shadow-inner">
      <div className="flex items-center space-x-1.5">
        <WifiOff className="w-3.5 h-3.5 text-amber-900" />
        <span>{t('status.offline')}</span>
      </div>
      {formattedTime && (
        <div className="flex items-center space-x-1 text-amber-900/80">
          <Clock className="w-3 h-3" />
          <span>
            {t('status.lastUpdated')}: {formattedTime}
          </span>
        </div>
      )}
    </div>
  );
}
