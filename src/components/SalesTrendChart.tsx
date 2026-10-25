import React, { useState } from 'react';
import { TrendingUp, Award, Calendar, DollarSign, Printer } from 'lucide-react';
import { DailySalesSummary, formatRupiah } from '../utils/reportLogic';

interface SalesTrendChartProps {
  days: DailySalesSummary[];
  monthName: string;
  isPrintMode?: boolean;
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({
  days,
  monthName,
  isPrintMode = false,
}) => {
  const [metric, setMetric] = useState<'income' | 'prints'>('income');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!days || days.length === 0) {
    return <div className="p-4 text-center text-rose-300/50">Tidak ada data untuk grafik.</div>;
  }

  // Calculate scales
  const maxIncome = Math.max(...days.map((d) => d.totalIncome), 100000);
  const maxPrints = Math.max(...days.map((d) => d.totalPrints), 10);
  const maxValue = metric === 'income' ? maxIncome : maxPrints;

  // Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 260;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  // Points mapping
  const points = days.map((d, i) => {
    const val = metric === 'income' ? d.totalIncome : d.totalPrints;
    const x = paddingX + (i / (days.length - 1)) * chartWidth;
    const y = svgHeight - paddingY - (val / maxValue) * chartHeight;
    return { x, y, data: d, value: val };
  });

  // SVG Path generator (smooth curve)
  const pathD = points.reduce((acc, curr, idx) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[idx - 1];
    const cX = (prev.x + curr.x) / 2;
    return `${acc} C ${cX} ${prev.y}, ${cX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  // Area under path
  const areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;

  // Highest day index
  const highestIdx = days.reduce(
    (maxIdx, curr, idx, arr) =>
      curr.totalIncome > arr[maxIdx].totalIncome ? idx : maxIdx,
    0
  );

  return (
    <div className={`glass-maroon-card rounded-3xl p-5 shadow-xl border border-rose-500/25 flex flex-col ${isPrintMode ? 'border-none p-0 shadow-none bg-white text-slate-900' : ''}`}>
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1b0308] border border-rose-500/30 text-rose-300 flex items-center justify-center shadow-inner">
              <TrendingUp className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Grafik Naik Turun Penjualan
              </h3>
              <p className="text-xs text-rose-300/60">Tren performa harian {monthName}</p>
            </div>
          </div>
        </div>

        {/* Metric Switcher */}
        {!isPrintMode && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#150206]/90 border border-rose-500/25 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setMetric('income')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                metric === 'income'
                  ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-md border border-emerald-500/40'
                  : 'text-rose-300/70 hover:text-white'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Pemasukan (Rp)</span>
            </button>
            <button
              type="button"
              onClick={() => setMetric('prints')}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                metric === 'prints'
                  ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white shadow-md border border-rose-400/40'
                  : 'text-rose-300/70 hover:text-white'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Biji (Print)</span>
            </button>
          </div>
        )}
      </div>

      {/* SVG Canvas Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '190px' }}
        >
          <defs>
            <linearGradient id="chartGradientMaroon" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metric === 'income' ? '#10b981' : '#e11d48'} stopOpacity="0.4" />
              <stop offset="100%" stopColor={metric === 'income' ? '#10b981' : '#e11d48'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = svgHeight - paddingY - pct * chartHeight;
            const gridVal = maxValue * pct;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="rgba(244, 63, 94, 0.12)"
                  strokeWidth="1.5"
                  strokeDasharray={idx === 0 ? 'none' : '4 4'}
                />
                <text
                  x={paddingX - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#fda4af"
                  fillOpacity="0.6"
                  fontWeight="600"
                >
                  {metric === 'income'
                    ? gridVal >= 1000000
                      ? `${(gridVal / 1000000).toFixed(1)}jt`
                      : gridVal >= 1000
                      ? `${Math.round(gridVal / 1000)}k`
                      : gridVal
                    : Math.round(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#chartGradientMaroon)" />

          {/* Trend line */}
          <path
            d={pathD}
            fill="none"
            stroke={metric === 'income' ? '#34d399' : '#fb7185'}
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isPeak = idx === highestIdx && pt.value > 0;
            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={svgHeight - paddingY}
                    stroke="rgba(251, 113, 133, 0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 6 : isPeak ? 5 : 3.5}
                  fill={isPeak ? '#fbbf24' : metric === 'income' ? '#10b981' : '#f43f5e'}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />

                {/* Date Label on X Axis */}
                {(idx % (days.length > 20 ? 3 : 2) === 0 || idx === days.length - 1) && (
                  <text
                    x={pt.x}
                    y={svgHeight - paddingY + 16}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="#fda4af"
                    fillOpacity="0.75"
                    fontWeight="700"
                  >
                    {pt.data.dayNumber}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover / Active Tooltip */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1b0308]/95 backdrop-blur-md text-white px-3.5 py-1.5 rounded-2xl shadow-2xl border border-rose-500/40 text-xs pointer-events-none flex items-center gap-3 animate-in fade-in"
          >
            <div>
              <span className="text-rose-300 font-semibold">{points[hoveredIndex].data.dayLabel} ({points[hoveredIndex].data.dayOfWeek}):</span>{' '}
              <strong className="text-emerald-400">{formatRupiah(points[hoveredIndex].data.totalIncome)}</strong>
            </div>
            <span className="text-rose-500/50">•</span>
            <div>
              <span className="text-rose-300 font-bold">{points[hoveredIndex].data.totalPrints} print</span>
              <span className="text-rose-300/60 text-[10px]"> ({points[hoveredIndex].data.ordersCount} order)</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info / Key stats for chart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3.5 mt-2 border-t border-rose-500/20 text-xs">
        <div className="flex items-center gap-2 p-2.5 bg-[#1b0308]/80 border border-rose-500/20 rounded-2xl">
          <Calendar className="w-4 h-4 text-rose-400 shrink-0" />
          <div className="truncate">
            <p className="text-[10px] text-rose-300/60 uppercase font-bold">Periode</p>
            <p className="font-bold text-white truncate">{monthName}</p>
          </div>
        </div>

        {days[highestIdx] && days[highestIdx].totalIncome > 0 && (
          <div className="flex items-center gap-2 p-2.5 bg-amber-950/60 border border-amber-600/30 rounded-2xl">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-amber-300 uppercase font-bold">Penjualan Puncak</p>
              <p className="font-bold text-amber-200 truncate">
                {days[highestIdx].dayLabel} ({formatRupiah(days[highestIdx].totalIncome)})
              </p>
            </div>
          </div>
        )}

        <div className="col-span-2 sm:col-span-1 flex items-center gap-2 p-2.5 bg-emerald-950/60 border border-emerald-600/30 rounded-2xl">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="truncate">
            <p className="text-[10px] text-emerald-300 uppercase font-bold">Total Bulan Ini</p>
            <p className="font-bold text-emerald-200 truncate">
              {formatRupiah(days.reduce((sum, d) => sum + d.totalIncome, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
