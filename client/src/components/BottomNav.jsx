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
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                isActive
                  ? 'text-agri-700 font-semibold'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-agri-100' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs leading-none">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
