import React, { useState, useMemo } from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function PriceTrendChart({
  prices,
  days = 30,
  onDaysChange,
  forecastPoints = null,
}) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Filter and sort historical points by date
  const sortedPoints = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const valid = prices
      .filter((p) => p.date && p.date >= cutoffStr && p.modalPrice != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Consolidate single price per date
    const byDate = new Map();
    valid.forEach((p) => {
      const dateKey = p.date.split('T')[0];
      if (!byDate.has(dateKey)) {
        byDate.set(dateKey, { total: 0, count: 0, date: dateKey });
      }
      const entry = byDate.get(dateKey);
      entry.total += Number(p.modalPrice);
      entry.count += 1;
    });

    return Array.from(byDate.values())
      .map((e) => ({
        date: e.date,
        price: Math.round(e.total / e.count),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [prices, days]);

  const stats = useMemo(() => {
    if (sortedPoints.length === 0) return { min: 0, max: 0, change: 0, current: 0 };
    const values = sortedPoints.map((p) => p.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const first = values[0];
    const current = values[values.length - 1];
    const change = first > 0 ? Math.round(((current - first) / first) * 100) : 0;
    return { min, max, change, current };
  }, [sortedPoints]);

  if (sortedPoints.length < 2) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-200 text-center text-xs text-gray-500 py-8 shadow-xs">
        Not enough historical records to plot trend for this period.
      </div>
    );
  }

  // Chart layout dimensions (SVG coordinate space)
  // padLeft: 54 provides full clearance for 5-6 digit values (e.g. ₹1,20,000)
  const width = 360;
  const height = 160;
  const padLeft = 54;
  const padRight = 16;
  const padTop = 18;
  const padBottom = 26;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minVal = Math.max(
    0,
    stats.min - (stats.max - stats.min) * 0.15 || stats.min * 0.9
  );
  const maxVal = stats.max + (stats.max - stats.min) * 0.15 || stats.max * 1.1;
  const range = maxVal - minVal || 1;

  // Convert historical points to SVG coordinates
  const coords = sortedPoints.map((pt, i) => {
    const x = padLeft + (i / (sortedPoints.length - 1)) * chartW;
    const y = padTop + chartH - ((pt.price - minVal) / range) * chartH;
    return { x, y, ...pt };
  });

  const pathD = coords.reduce(
    (acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${padTop + chartH} L ${coords[0].x} ${padTop + chartH} Z`;

  const activePoint =
    hoverIndex !== null ? coords[hoverIndex] : coords[coords.length - 1];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/90 shadow-xs space-y-3.5">
      {/* Header and timeframe toggle with responsive wrap */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs text-gray-500 font-semibold flex items-center space-x-1.5">
            <Calendar className="w-3.5 h-3.5 text-agri-600 flex-shrink-0" />
            <span>Mandi Price Trend ({days} Days)</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-lg font-black text-gray-900 leading-tight">
              ₹{activePoint.price?.toLocaleString('en-IN')}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">/ quintal</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center ${
                stats.change > 0
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : stats.change < 0
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {stats.change > 0 ? (
                <ArrowUpRight className="w-3 h-3 inline mr-0.5" />
              ) : stats.change < 0 ? (
                <ArrowDownRight className="w-3 h-3 inline mr-0.5" />
              ) : (
                <Minus className="w-3 h-3 inline mr-0.5" />
              )}
              {stats.change > 0 ? `+${stats.change}%` : `${stats.change}%`}
            </span>
          </div>
        </div>

        {/* Timeframe Chips */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold flex-shrink-0">
          {[7, 30, 90, 180].map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange && onDaysChange(d)}
              className={`px-2.5 py-1 rounded-xl text-[11px] transition-all cursor-pointer ${
                days === d
                  ? 'bg-white text-agri-800 shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#15803d" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#15803d" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels with WCAG AA compliant #64748b fill */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft + chartW}
            y2={padTop}
            stroke="#f1f5f9"
            strokeDasharray="3 3"
          />
          <text
            x={padLeft - 8}
            y={padTop + 3}
            textAnchor="end"
            fontSize="9"
            fill="#64748b"
            className="font-mono font-medium"
          >
            ₹{Math.round(maxVal)}
          </text>

          <line
            x1={padLeft}
            y1={padTop + chartH / 2}
            x2={padLeft + chartW}
            y2={padTop + chartH / 2}
            stroke="#f1f5f9"
            strokeDasharray="3 3"
          />
          <text
            x={padLeft - 8}
            y={padTop + chartH / 2 + 3}
            textAnchor="end"
            fontSize="9"
            fill="#64748b"
            className="font-mono font-medium"
          >
            ₹{Math.round((minVal + maxVal) / 2)}
          </text>

          <line
            x1={padLeft}
            y1={padTop + chartH}
            x2={padLeft + chartW}
            y2={padTop + chartH}
            stroke="#e2e8f0"
          />
          <text
            x={padLeft - 8}
            y={padTop + chartH + 3}
            textAnchor="end"
            fontSize="9"
            fill="#64748b"
            className="font-mono font-medium"
          >
            ₹{Math.round(minVal)}
          </text>

          {/* Fill and Main Line */}
          <path d={fillD} fill="url(#chartGradient)" />
          <path
            d={pathD}
            fill="none"
            stroke="#15803d"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Active hover crosshair and circle */}
          {activePoint && (
            <g>
              <line
                x1={activePoint.x}
                y1={padTop}
                x2={activePoint.x}
                y2={padTop + chartH}
                stroke="#64748b"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#15803d"
                stroke="#ffffff"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Invisible hover zones */}
          {coords.map((pt, i) => (
            <rect
              key={i}
              x={pt.x - chartW / coords.length / 2}
              y={padTop}
              width={chartW / coords.length}
              height={chartH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
              onTouchStart={() => setHoverIndex(i)}
            />
          ))}

          {/* X Axis dates */}
          <text x={padLeft} y={height - 6} textAnchor="start" fontSize="9" fill="#64748b">
            {sortedPoints[0]?.date}
          </text>
          <text
            x={padLeft + chartW}
            y={height - 6}
            textAnchor="end"
            fontSize="9"
            fill="#64748b"
          >
            {sortedPoints[sortedPoints.length - 1]?.date}
          </text>
        </svg>
      </div>

      {/* Bottom Summary Chips */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-center">
        <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-2xl">
          <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wider">
            Low Rate
          </span>
          <span className="text-xs font-black text-gray-900 mt-0.5 block">
            ₹{stats.min}
          </span>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-100 p-2.5 rounded-2xl">
          <span className="text-[10px] text-emerald-800 block font-bold uppercase tracking-wider">
            Peak Rate
          </span>
          <span className="text-xs font-black text-gray-900 mt-0.5 block">
            ₹{stats.max}
          </span>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-2xl">
          <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">
            Active Date
          </span>
          <span className="text-xs font-black text-agri-800 mt-0.5 block truncate">
            {activePoint.date}
          </span>
        </div>
      </div>
    </div>
  );
}
