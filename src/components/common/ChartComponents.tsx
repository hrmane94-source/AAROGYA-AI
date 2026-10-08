import React, { useState } from 'react';
import { ForecastTimePoint } from '../../types';

interface ForecastChartProps {
  data: ForecastTimePoint[];
  height?: number;
  showConfidence?: boolean;
}

export const ForecastLineChart: React.FC<ForecastChartProps> = ({
  data,
  height = 320,
  showConfidence = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="p-8 text-center text-slate-400">No time series data available</div>;
  }

  const padding = { top: 30, right: 40, bottom: 45, left: 55 };
  const chartWidth = 800;
  const chartHeight = height;

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Max and min calculation
  const allValues = data.flatMap(d => [
    d.predictedAvailable,
    d.historicalAvailable ?? d.predictedAvailable,
    d.upperConfidence ?? d.predictedAvailable,
    d.lowerConfidence ?? d.predictedAvailable,
  ]);
  const minY = Math.max(0, Math.floor(Math.min(...allValues) * 0.8));
  const maxY = Math.ceil(Math.max(...allValues, 10) * 1.15);

  const getX = (index: number) => padding.left + (index / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minY) / (maxY - minY || 1)) * innerHeight;

  // Confidence area path (upper to lower)
  let confidencePath = '';
  if (showConfidence) {
    const upperPoints = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.upperConfidence)}`).join(' ');
    const lowerPoints = data.slice().reverse().map((d, i) => `L ${getX(data.length - 1 - i)} ${getY(d.lowerConfidence)}`).join(' ');
    confidencePath = `${upperPoints} ${lowerPoints} Z`;
  }

  // Predicted line
  const predictedPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.predictedAvailable)}`).join(' ');

  // Historical line (up to Today)
  const todayIdx = data.findIndex(d => d.dayName.includes('Today'));
  const histCutoff = todayIdx !== -1 ? todayIdx + 1 : 0;
  const histData = data.slice(0, histCutoff);
  const historicalPath = histData.length > 1
    ? histData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.historicalAvailable ?? d.predictedAvailable)}`).join(' ')
    : '';

  const yTicks = [minY, Math.round((minY + maxY) / 2), maxY];

  return (
    <div className="relative w-full overflow-x-auto select-none">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full min-w-[650px] overflow-visible"
      >
        <defs>
          <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="predictedLineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {yTicks.map(t => (
          <g key={t}>
            <line
              x1={padding.left}
              y1={getY(t)}
              x2={chartWidth - padding.right}
              y2={getY(t)}
              stroke="#e2e8f0"
              strokeDasharray="4 4"
            />
            <text
              x={padding.left - 10}
              y={getY(t) + 4}
              textAnchor="end"
              className="text-[11px] fill-slate-400 font-mono"
            >
              {t} beds
            </text>
          </g>
        ))}

        {/* Today Marker Line */}
        {todayIdx !== -1 && (
          <g>
            <line
              x1={getX(todayIdx)}
              y1={padding.top}
              x2={getX(todayIdx)}
              y2={padding.top + innerHeight}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <text
              x={getX(todayIdx)}
              y={padding.top - 8}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-indigo-600 tracking-wide"
            >
              TODAY (NOW)
            </text>
          </g>
        )}

        {/* Confidence Area */}
        {showConfidence && (
          <path d={confidencePath} fill="url(#confidenceGrad)" />
        )}

        {/* Predicted Line */}
        <path
          d={predictedPath}
          fill="none"
          stroke="url(#predictedLineGrad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Historical Line */}
        {historicalPath && (
          <path
            d={historicalPath}
            fill="none"
            stroke="#64748b"
            strokeWidth="3"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {data.map((d, i) => {
          const isToday = i === todayIdx;
          const isPast = todayIdx !== -1 && i < todayIdx;
          const cx = getX(i);
          const cy = getY(d.predictedAvailable);
          const isHovered = hoveredIdx === i;

          return (
            <g
              key={d.date}
              className="cursor-pointer transition-all duration-150"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible touch target */}
              <circle cx={cx} cy={cy} r="16" fill="transparent" />

              {/* Point ring */}
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 7 : isToday ? 6 : 4.5}
                fill={isToday ? '#6366f1' : isPast ? '#64748b' : d.riskLevel === 'HIGH' || d.riskLevel === 'CRITICAL' ? '#ef4444' : '#0284c7'}
                stroke="#ffffff"
                strokeWidth={isHovered ? 3 : 2}
                className="drop-shadow-sm transition-all"
              />

              {/* X-axis label */}
              <text
                x={cx}
                y={chartHeight - 12}
                textAnchor="middle"
                className={`text-[10px] ${isToday ? 'fill-indigo-600 font-bold' : 'fill-slate-500 font-medium'}`}
              >
                {d.dayName.split(' ')[0]}
              </text>
              <text
                x={cx}
                y={chartHeight - 2}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {d.date.slice(5)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute z-20 pointer-events-none bg-slate-900/95 text-white p-3 rounded-xl shadow-xl backdrop-blur-md border border-slate-700/60 text-xs transition-all -translate-x-1/2 -translate-y-full"
          style={{
            left: `${(getX(hoveredIdx) / chartWidth) * 100}%`,
            top: `${(getY(data[hoveredIdx].predictedAvailable) / chartHeight) * 100}%`,
            marginTop: '-16px',
          }}
        >
          <div className="font-semibold text-cyan-300 flex items-center justify-between gap-3 border-b border-slate-700 pb-1 mb-1.5">
            <span>{data[hoveredIdx].dayName} ({data[hoveredIdx].date})</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                data[hoveredIdx].riskLevel === 'CRITICAL' || data[hoveredIdx].riskLevel === 'HIGH'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {data[hoveredIdx].riskLevel} RISK
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-300">
            <div>Available Beds: <strong className="text-white">{data[hoveredIdx].predictedAvailable}</strong></div>
            <div>Occupancy: <strong className="text-white">{data[hoveredIdx].occupancyPercent}%</strong></div>
            <div>Expected Admissions: <strong className="text-emerald-400">+{data[hoveredIdx].admissions}</strong></div>
            <div>Expected Discharges: <strong className="text-amber-400">-{data[hoveredIdx].discharges}</strong></div>
            {showConfidence && (
              <div className="col-span-2 text-[10px] text-slate-400 mt-1">
                90% Confidence Interval: {data[hoveredIdx].lowerConfidence} - {data[hoveredIdx].upperConfidence} beds
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const OccupancyProgressBar: React.FC<{
  rate: number;
  status?: string;
  showLabel?: boolean;
}> = ({ rate, status, showLabel = true }) => {
  let color = 'bg-emerald-500';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let statusText = status || 'Normal';

  if (rate >= 90) {
    color = 'bg-rose-500';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    statusText = 'Critical';
  } else if (rate >= 80) {
    color = 'bg-amber-500';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'High Occupancy';
  }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-600">Occupancy: <strong>{rate}%</strong></span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
            {statusText}
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className={`h-full rounded-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(100, Math.max(2, rate))}%` }}
        />
      </div>
    </div>
  );
};
