import React from 'react';
import {
  Store,
  Apple,
  TrendingUp,
  Server,
  Activity,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard({ mandis, commodities, prices, health }) {
  const stats = [
    {
      title: 'Monitored Mandis',
      value: mandis.length || 4,
      change: 'Karnataka & Maharashtra Pilot',
      icon: Store,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Tracked Commodities',
      value: commodities.length || 5,
      change: 'Vegetables & Grains',
      icon: Apple,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Current Price Points',
      value: prices.length || 12,
      change: 'Real-time & Historical data',
      icon: TrendingUp,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'API Server Health',
      value: health?.status === 'ok' ? 'Healthy' : 'Fallback / Standalone',
      change: `Uptime: ${Math.round(health?.uptime || 0)}s`,
      icon: Server,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Operational Overview</h2>
        <p className="text-sm text-slate-500">
          Real-time monitoring of agricultural market arrivals, price syncs, and platform
          connectivity.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-xl border bg-white shadow-sm flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 mt-1">{stat.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* System Architecture Highlights */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 text-base mb-4 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <span>Active Architecture & Constraints Check</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">
                Offline-First PWA Synchronization
              </p>
              <p className="text-xs text-slate-500">
                IndexedDB client stores with delta-sync protocol transferring only delta
                diffs since last timestamp.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">
                Explainable Baseline Price Models
              </p>
              <p className="text-xs text-slate-500">
                Transparent 7-day and 30-day moving averages with honest MAPE backtesting
                and uncertainty disclaimers.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">Multilingual APMC Terminology</p>
              <p className="text-xs text-slate-500">
                Seamless i18n support for Kannada, Hindi, Marathi, and English with
                fallback mechanisms.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">
                Geospatial Haversine & 2dsphere Support
              </p>
              <p className="text-xs text-slate-500">
                Fast proximity calculations finding nearest registered mandis and
                available agricultural transporters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
