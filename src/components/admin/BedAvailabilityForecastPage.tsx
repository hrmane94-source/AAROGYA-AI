import React, { useState } from 'react';
import {
  TrendingUp,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  Download,
  Info,
  SlidersHorizontal,
  RefreshCw,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Hospital, ForecastTimePoint } from '../../types';
import { ForecastLineChart } from '../common/ChartComponents';
import { MLForecastEngine } from '../../services/mlForecastEngine';

interface BedAvailabilityForecastPageProps {
  hospital: Hospital;
  hospitals: Hospital[];
  onNavigateTab: (tab: string) => void;
}

export const BedAvailabilityForecastPage: React.FC<BedAvailabilityForecastPageProps> = ({
  hospital,
  hospitals,
  onNavigateTab,
}) => {
  const [selectedHorizon, setSelectedHorizon] = useState<number>(7);
  const [selectedBedCategory, setSelectedBedCategory] = useState<string>('ICU');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [showConfidenceCone, setShowConfidenceCone] = useState<boolean>(true);

  // Generate time series data
  const timeSeries = MLForecastEngine.generateTimeSeries(
    selectedHorizon,
    selectedBedCategory,
    selectedDepartment
  );

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-sky-600" />
            <span>Time-Series Visualizer</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Future Bed Availability Forecast
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualizing historical bed availability, real-time baseline, and machine-learning predicted availability trajectory with confidence envelope.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('what-if')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Simulate Scenarios</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Control Panel */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Bed Category Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Bed Category
            </label>
            <select
              value={selectedBedCategory}
              onChange={e => setSelectedBedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">Hospital-Wide (All Beds)</option>
              <option value="ICU">ICU / Critical Care</option>
              <option value="Emergency">Emergency & Trauma</option>
              <option value="General">General Ward</option>
              <option value="Pediatric">Pediatrics & NICU</option>
            </select>
          </div>

          {/* Department Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Clinical Department
            </label>
            <select
              value={selectedDepartment}
              onChange={e => setSelectedDepartment(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-sky-500"
            >
              <option value="All">All Departments</option>
              <option value="dept-icu">ICU / Critical Care</option>
              <option value="dept-er">Emergency & Trauma</option>
              <option value="dept-gen">General Ward</option>
              <option value="dept-cardio">Cardiology</option>
              <option value="dept-surg">General Surgery</option>
            </select>
          </div>

          {/* Horizon Window */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Forecast Horizon
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setSelectedHorizon(days)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedHorizon === days
                      ? 'bg-white text-sky-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {days} Days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confidence Cone Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 select-none">
            <input
              type="checkbox"
              checked={showConfidenceCone}
              onChange={e => setShowConfidenceCone(e.target.checked)}
              className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
            />
            <span>Show 90% Uncertainty Envelope</span>
          </label>
        </div>
      </div>

      {/* Main Graph Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>{selectedBedCategory} Bed Availability Curve</span>
              <span className="text-xs font-medium text-slate-500 font-mono">
                ({selectedHorizon} Day Horizon • {hospital.name})
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Interactive curve: Hover any time node to see exact forecasted admissions, discharges, and risk categorization.
            </p>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span className="w-3 h-0.5 bg-slate-500 border-dashed" /> Historical Data
            </span>
            <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Today (Anchor)
            </span>
            <span className="flex items-center gap-1.5 text-sky-600 font-bold">
              <span className="w-3 h-1 bg-sky-500 rounded-full" /> Predicted Trajectory
            </span>
            {showConfidenceCone && (
              <span className="flex items-center gap-1.5 text-cyan-700 font-medium">
                <span className="w-3 h-3 bg-sky-200/60 rounded-sm border border-sky-400" /> Confidence Cone
              </span>
            )}
          </div>
        </div>

        {/* SVG Time-Series Chart */}
        <div className="py-2">
          <ForecastLineChart
            data={timeSeries}
            height={340}
            showConfidence={showConfidenceCone}
          />
        </div>

        {/* Day-by-Day Forecast Breakdown (Prompt Example: Today -> 8, Tomorrow -> 5, Day 2 -> 3, Day 3 -> 6, Day 4 -> 9) */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Day-by-Day Trajectory Breakdown
            </span>
            <span className="text-xs text-slate-500">Predicted Open Beds & Risk</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {timeSeries.slice(5, 12).map((pt, idx) => {
              const isToday = pt.dayName.includes('Today');
              const isCrit = pt.riskLevel === 'CRITICAL' || pt.riskLevel === 'HIGH';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-center transition ${
                    isToday
                      ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                      : isCrit
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="text-[10px] font-bold text-slate-500">
                    {pt.dayName.split(' ')[0]}
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono">
                    {pt.date.slice(5)}
                  </div>
                  <div
                    className={`text-xl font-black font-mono my-1 ${
                      isCrit ? 'text-rose-600' : isToday ? 'text-indigo-600' : 'text-slate-900'
                    }`}
                  >
                    {pt.predictedAvailable}
                  </div>
                  <div className="text-[10px] text-slate-500">beds open</div>
                  <div className="mt-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        isCrit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {pt.riskLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
