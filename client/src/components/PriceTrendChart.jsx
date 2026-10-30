import React, { useState, useMemo } from 'react';
import { Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function PriceTrendChart({ prices, days = 30, onDaysChange }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Filter and sort points by date
  const sortedPoints = useMemo(() => {
    if (!prices || prices.length === 0) return [];

    // Filter by days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const valid = prices
      .filter((p) => p.date && p.date >= cutoffStr && p.modalPrice != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    // Consolidate single price per date (if multiple mandis, compute average)
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
      <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center text-xs text-gray-400 py-8">
        Not enough historical records to plot trend for this period.
      </div>
    );
  }

  // Chart layout dimensions (SVG coordinate space)
  const width = 360;
  const height = 150;
  const padLeft = 42;
  const padRight = 16;
  const padTop = 16;
  const padBottom = 26;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const minVal = Math.max(
    0,
    stats.min - (stats.max - stats.min) * 0.15 || stats.min * 0.9
  );
  const maxVal = stats.max + (stats.max - stats.min) * 0.15 || stats.max * 1.1;
  const range = maxVal - minVal || 1;

  // Convert points to SVG coordinates
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
    <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm space-y-3">
      {/* Header and timeframe toggle */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 font-medium flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-agri-600" />
            <span>Price Trend ({days} Days)</span>
          </div>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-base font-bold text-gray-900">
              ₹{activePoint.price}
            </span>
            <span className="text-[10px] text-gray-400">/ quintal</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center ${
                stats.change > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : stats.change < 0
                    ? 'bg-red-50 text-red-600'
                    : 'bg-gray-100 text-gray-600'
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
        <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => onDaysChange && onDaysChange(d)}
              className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                days === d
                  ? 'bg-white text-agri-800 shadow-sm font-bold'
                  : 'text-gray-500 hover:text-gray-800'
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
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          <line
            x1={padLeft}
            y1={padTop}
            x2={padLeft + chartW}
            y2={padTop}
            stroke="#f1f5f9"
            strokeDasharray="3 3"
          />
          <text
            x={padLeft - 6}
            y={padTop + 3}
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
            className="font-mono"
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
            x={padLeft - 6}
            y={padTop + chartH / 2 + 3}
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
            className="font-mono"
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
            x={padLeft - 6}
            y={padTop + chartH + 3}
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
            className="font-mono"
          >
            ₹{Math.round(minVal)}
          </text>

          {/* Fill and Line */}
          <path d={fillD} fill="url(#chartGradient)" />
          <path
            d={pathD}
            fill="none"
            stroke="#047857"
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
                stroke="#cbd5e1"
                strokeDasharray="2 2"
              />
              <circle
                cx={activePoint.x}
                cy={activePoint.y}
                r="4.5"
                fill="#047857"
                stroke="#ffffff"
                strokeWidth="2"
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

          {/* X Axis dates (first and last) */}
          <text x={padLeft} y={height - 6} textAnchor="start" fontSize="9" fill="#94a3b8">
            {sortedPoints[0]?.date}
          </text>
          <text
            x={padLeft + chartW}
            y={height - 6}
            textAnchor="end"
            fontSize="9"
            fill="#94a3b8"
          >
            {sortedPoints[sortedPoints.length - 1]?.date}
          </text>
        </svg>
      </div>

      {/* Bottom Range Summary */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 text-center">
        <div className="bg-slate-50 p-1.5 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Min Price</span>
          <span className="text-xs font-bold text-gray-700">₹{stats.min}</span>
        </div>
        <div className="bg-slate-50 p-1.5 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Max Price</span>
          <span className="text-xs font-bold text-gray-700">₹{stats.max}</span>
        </div>
        <div className="bg-slate-50 p-1.5 rounded-xl">
          <span className="text-[10px] text-gray-400 block">Date</span>
          <span className="text-xs font-bold text-agri-800">{activePoint.date}</span>
        </div>
      </div>
    </div>
  );
}
