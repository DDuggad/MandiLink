import React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, TrendingUp, Truck, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  const tabs = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'prices', label: t('nav.prices'), icon: TrendingUp },
    { id: 'transporters', label: t('nav.transporters'), icon: Truck },
    { id: 'settings', label: t('nav.settings'), icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 select-none ${
                isActive
                  ? 'text-agri-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
              aria-label={tab.label}
            >
              <div
                className={`p-1.5 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-agri-100/90 text-agri-700 shadow-sm scale-105'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] leading-tight mt-0.5 tracking-tight px-0.5 truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
