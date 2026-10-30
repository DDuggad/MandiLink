import React from 'react';
import {
  LayoutDashboard,
  Store,
  DollarSign,
  RefreshCw,
  Apple,
  Truck,
  UploadCloud,
  LogOut,
  ExternalLink,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'prices', label: 'Price Entry', icon: DollarSign },
    { id: 'bulk', label: 'Bulk & AGMARKNET', icon: UploadCloud },
    { id: 'mandis', label: 'APMC Mandis', icon: Store },
    { id: 'commodities', label: 'Commodities', icon: Apple },
    { id: 'transporters', label: 'Transporters', icon: Truck },
    { id: 'sync', label: 'Sync & Ingestion Logs', icon: RefreshCw },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 shadow-lg select-none">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🏛️</span>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight">MandiLink</h1>
            <p className="text-xs text-emerald-400 font-medium">APMC Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <a
          href="http://localhost:5173"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-md transition-colors"
        >
          <span>Farmer PWA App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-slate-800/80 rounded-md transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        )}

        <div className="pt-2 text-[11px] text-slate-500 text-center">
          MandiLink SIH 2026 • v1.0.0
        </div>
      </div>
    </aside>
  );
}
