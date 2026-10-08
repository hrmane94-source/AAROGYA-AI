import React from 'react';
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Bed,
  ArrowRight,
  Info,
  Sparkles,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { DischargeForecast } from '../../types';

interface DischargeForecastSectionProps {
  forecast: DischargeForecast;
  onNavigateTab: (tab: string) => void;
}

export const DischargeForecastSection: React.FC<DischargeForecastSectionProps> = ({
  forecast,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-teal-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Discharge Forecasting Engine</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Expected Patient Discharges
          </h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Forecasting discharge timelines based on department ALOS, clinical recovery milestones,
            doctor discharge order habits, and weekend velocity curves. Directly feeds positive net bed capacity into the availability model.
          </p>

          {/* Top 3 Summary Cards */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Expected Today</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {forecast.expectedToday} <span className="text-xs text-emerald-200 font-normal">Patients</span>
              </div>
              <div className="text-[11px] text-emerald-200/90 mt-1">
                21 already confirmed by morning rounds
              </div>
            </div>

            <div className="bg-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md border border-emerald-400/30 shadow-md">
              <div className="text-xs text-cyan-200 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Expected Tomorrow</span>
              </div>
              <div className="text-4xl font-black text-white font-mono mt-1">
                {forecast.expectedTomorrow} <span className="text-xs text-cyan-200 font-normal">Patients</span>
              </div>
              <div className="text-[11px] text-cyan-200/90 mt-1">
                Peak turnaround window: {forecast.peakDischargeHour}
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md border border-white/10">
              <div className="text-xs text-emerald-200 font-medium">Expected This Week</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {forecast.expectedThisWeek} <span className="text-xs text-emerald-200 font-normal">Patients</span>
              </div>
              <div className="text-[11px] text-emerald-200/90 mt-1">
                Discharge velocity index: <strong>{forecast.dischargeVelocityIndex}x</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by Department Table */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Department Allocation
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Tomorrow&apos;s Discharges Breakdown by Department (Total: {forecast.expectedTomorrow})
            </h3>
          </div>
          <div className="text-xs text-slate-500">
            Confidence Calibration: <strong className="text-emerald-700 font-mono">{forecast.confidenceScore}%</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forecast.departmentBreakdown.map((dept, idx) => {
            const percentOfTotal = Math.round((dept.count / forecast.expectedTomorrow) * 100);

            return (
              <div
                key={idx}
                className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 border border-slate-200/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{dept.department}</h4>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg">
                      {dept.count} Beds
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Avg Length of Stay (ALOS):</span>
                      <strong className="font-mono text-slate-800">{dept.alosDays} days</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Est. Turnaround Time:</span>
                      <strong className="font-mono text-slate-800">{dept.expectedTurnaroundHours} hrs</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Share of Total Discharges:</span>
                      <strong className="font-mono text-slate-800">{percentOfTotal}%</strong>
                    </div>
                  </div>

                  {/* Visual Bar */}
                  <div className="mt-3 w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${percentOfTotal}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Bed Turnover Stage: Pre-Cleared</span>
                  <span className="text-emerald-600 font-semibold">Ready by 1 PM</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pipeline Integration Note */}
        <div className="mt-6 p-4 bg-teal-50 rounded-2xl border border-teal-200/80 flex items-start justify-between gap-4 text-xs text-teal-950">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <strong>Forecasting Integration:</strong> These 32 anticipated discharges provide immediate bed turnover that offsets the predicted 38 general and critical arrivals tomorrow, preventing immediate ward saturation.
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('forecast-graph')}
            className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition flex items-center gap-1.5 shrink-0"
          >
            <span>View Full Net Bed Curve</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
