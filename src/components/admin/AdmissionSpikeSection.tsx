import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  ListFilter,
  CheckSquare,
  Square,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  Info,
  Calendar
} from 'lucide-react';
import { AdmissionSpike } from '../../types';

interface AdmissionSpikeSectionProps {
  spike: AdmissionSpike;
  onNavigateTab: (tab: string) => void;
}

export const AdmissionSpikeSection: React.FC<AdmissionSpikeSectionProps> = ({ spike, onNavigateTab }) => {
  const [completedActions, setCompletedActions] = useState<number[]>([]);

  const toggleAction = (index: number) => {
    setCompletedActions(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      {/* Alert Header Box */}
      <div className="bg-linear-to-r from-rose-900 via-rose-800 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full bg-rose-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              CRITICAL ML SPIKE DETECTOR
            </span>
            <span className="text-xs text-rose-200 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Detected for: {spike.expectedDate}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white mt-4 flex items-center gap-3">
            <span>🚨 Potential Admission Spike Detected</span>
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Unusual statistical surge detected in expected patient admissions across <strong>{spike.department}</strong>.
            Early proactive resource allocation and bed diversion protocols are strongly recommended.
          </p>

          {/* Metric Comparison Ribbon */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md border border-white/15">
            <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:pr-4">
              <div className="text-xs text-slate-300 font-medium">Expected Daily Baseline</div>
              <div className="text-3xl font-black text-white font-mono mt-1">
                {spike.expectedDailyAdmissions} <span className="text-xs text-slate-300 font-normal">pts/day</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">30-day moving average</div>
            </div>

            <div className="border-b sm:border-b-0 sm:border-r border-white/10 pb-3 sm:pb-0 sm:px-4">
              <div className="text-xs text-rose-200 font-medium">Predicted Tomorrow</div>
              <div className="text-3xl font-black text-rose-300 font-mono mt-1">
                {spike.predictedTomorrow} <span className="text-xs text-rose-200 font-normal">pts</span>
              </div>
              <div className="text-[11px] text-rose-200 mt-0.5">
                90% Range: <strong>{spike.confidenceRange[0]} - {spike.confidenceRange[1]}</strong>
              </div>
            </div>

            <div className="sm:pl-4">
              <div className="text-xs text-amber-200 font-medium">Expected Surge Increase</div>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">
                +{spike.percentIncrease}%
              </div>
              <div className="text-[11px] text-amber-200/90 mt-0.5">+23 patients above threshold</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Primary Drivers + Suggested Operational Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Primary Drivers & Root Causes */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Underlying Drivers
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Statistical & Clinical Surge Causes</span>
            </h3>
          </div>

          <div className="space-y-3">
            {spike.primaryDrivers.map((driver, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  {driver}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
            <strong>Confidence Calibration:</strong> 90% probabilistic prediction window. Does not imply absolute certainty.
          </div>
        </div>

        {/* Suggested Operational Actions Checklist */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Action Protocol
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Suggested Operational Actions</span>
              </h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {completedActions.length} of {spike.suggestedActions.length} initiated
            </span>
          </div>

          <div className="space-y-2.5">
            {spike.suggestedActions.map((action, idx) => {
              const isChecked = completedActions.includes(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleAction(idx)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                  }`}
                >
                  <button className="mt-0.5 text-slate-400 shrink-0">
                    {isChecked ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>
                  <span className={`text-xs font-medium leading-relaxed ${isChecked ? 'line-through text-slate-500' : ''}`}>
                    {action}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('what-if')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Simulate Mitigation Scenarios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Uncertainty & Safety Disclaimer */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong>Operational Guideline:</strong> Machine learning forecasts identify potential risk vectors with quantifiable uncertainty bounds. Hospital administrators should combine algorithmic projections with on-ground clinical judgment.
        </div>
      </div>
    </div>
  );
};
