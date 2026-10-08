import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  Bed,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Building2
} from 'lucide-react';
import { MLForecastEngine } from '../../services/mlForecastEngine';
import { WhatIfScenario } from '../../types';

export const WhatIfSimulator: React.FC = () => {
  const [deltaAdmissions, setDeltaAdmissions] = useState<number>(20);
  const [deltaDischarges, setDeltaDischarges] = useState<number>(0);
  const [addedBeds, setAddedBeds] = useState<number>(0);
  const [emergencySurge, setEmergencySurge] = useState<number>(1.0);

  // Run simulation calculation
  const currentSim = MLForecastEngine.runWhatIfSimulation(
    deltaAdmissions,
    deltaDischarges,
    addedBeds,
    emergencySurge
  );

  const handleReset = () => {
    setDeltaAdmissions(0);
    setDeltaDischarges(0);
    setAddedBeds(0);
    setEmergencySurge(1.0);
  };

  const applyPreset = (preset: {
    adm: number;
    dis: number;
    beds: number;
    surge: number;
  }) => {
    setDeltaAdmissions(preset.adm);
    setDeltaDischarges(preset.dis);
    setAddedBeds(preset.beds);
    setEmergencySurge(preset.surge);
  };

  const isHighRisk = currentSim.simulatedRisk === 'HIGH' || currentSim.simulatedRisk === 'CRITICAL';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-sky-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Operational Capacity Sandbox</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            What-If Scenario Simulator
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Test hypothetical emergency surges, seasonal spikes, discharge bottlenecks, and temporary ward expansions
            to evaluate bed risk and formulate contingency response plans before real-world stress occurs.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Note: These are scenario simulations for planning purposes, not actual baseline ML forecasts.</span>
          </div>
        </div>
      </div>

      {/* Quick Scenario Preset Buttons */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Quick Preset Scenarios
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset({ adm: 20, dis: 0, beds: 0, surge: 1.0 })}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              deltaAdmissions === 20 && addedBeds === 0
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            📈 +20% Admissions Surge
          </button>

          <button
            onClick={() => applyPreset({ adm: 0, dis: 0, beds: 15, surge: 1.0 })}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              addedBeds === 15 && deltaAdmissions === 0
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            🛏️ +15 Surge Beds Added
          </button>

          <button
            onClick={() => applyPreset({ adm: 40, dis: -20, beds: 0, surge: 1.8 })}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              emergencySurge === 1.8
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            🚨 Mass Casualty Emergency (+40% Adm, 1.8x ER)
          </button>

          <button
            onClick={() => applyPreset({ adm: 0, dis: -35, beds: 0, surge: 1.0 })}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              deltaDischarges === -35
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            📉 Weekend Discharge Lull (-35% Discharges)
          </button>

          <button
            onClick={handleReset}
            className="ml-auto px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        </div>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Simulation Parameters
            </h3>
            <p className="text-xs text-slate-500">
              Adjust variables to immediately observe downstream strain on total available beds and department bottlenecks.
            </p>
          </div>

          {/* Slider 1: Admissions Surge */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-rose-500" />
                Change in Patient Admissions:
              </span>
              <span className="font-mono font-black text-sm text-slate-900">
                {deltaAdmissions > 0 ? `+${deltaAdmissions}%` : `${deltaAdmissions}%`}
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="80"
              step="5"
              value={deltaAdmissions}
              onChange={e => setDeltaAdmissions(Number(e.target.value))}
              className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-30% (Low Season)</span>
              <span>0% (Normal Baseline)</span>
              <span>+80% (Severe Epidemic)</span>
            </div>
          </div>

          {/* Slider 2: Discharges Delta */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                Change in Patient Discharges:
              </span>
              <span className="font-mono font-black text-sm text-slate-900">
                {deltaDischarges > 0 ? `+${deltaDischarges}%` : `${deltaDischarges}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={deltaDischarges}
              onChange={e => setDeltaDischarges(Number(e.target.value))}
              className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>-50% (Severe Discharge Delay)</span>
              <span>0% (Standard Flow)</span>
              <span>+50% (Expedited Rounds)</span>
            </div>
          </div>

          {/* Slider 3: Additional Surge Beds */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-sky-600" />
                Additional Surge Beds Added:
              </span>
              <span className="font-mono font-black text-sm text-sky-700">
                +{addedBeds} Beds
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={addedBeds}
              onChange={e => setAddedBeds(Number(e.target.value))}
              className="w-full accent-sky-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>0 Beds (Standard 500)</span>
              <span>+30 (Converted Wards)</span>
              <span>+60 (Field Expansion)</span>
            </div>
          </div>

          {/* Slider 4: Emergency Surge Multiplier */}
          <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Emergency & Trauma Multiplier:
              </span>
              <span className="font-mono font-black text-sm text-amber-700">
                {emergencySurge.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={emergencySurge}
              onChange={e => setEmergencySurge(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>1.0x (Normal)</span>
              <span>1.5x (Busy Shift)</span>
              <span>2.5x (Mass Casualty / Disaster)</span>
            </div>
          </div>
        </div>

        {/* Results / Simulated Impact Column (Prompt Examples Matching) */}
        <div className="lg:col-span-5 bg-linear-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                Simulated 48h Outcome
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  isHighRisk
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-emerald-500 text-white'
                }`}
              >
                {currentSim.simulatedRisk} RISK
              </span>
            </div>

            {/* Scenario Impact Cards (Prompt Example: What if admissions increase by 20%? -> Available: 3, Risk: HIGH) */}
            <div className="space-y-3 bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/15">
              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-300">Baseline Available Beds:</span>
                <span className="font-mono font-bold text-white text-sm">88 beds (ICU: 4)</span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-cyan-200 font-semibold">After Applied Scenario:</span>
                <span className="font-mono font-black text-2xl text-cyan-300">
                  {currentSim.simulatedAvailable} beds
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                <span className="text-slate-300">Simulated Occupancy:</span>
                <span className="font-mono font-bold text-white text-base">
                  {currentSim.simulatedOccupancy}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-amber-200">Critical Bottleneck:</span>
                <span className="font-semibold text-white">
                  {currentSim.bottleneckDepartment}
                </span>
              </div>
            </div>

            {/* Prompt Scenario Comparison Callout */}
            <div className="p-3.5 bg-indigo-950/70 rounded-xl border border-indigo-500/30 text-xs text-indigo-100 space-y-2">
              <div className="font-bold text-cyan-300">
                Strategic Impact Assessment:
              </div>
              <p className="leading-relaxed">
                {currentSim.simulatedAvailable <= 15 ? (
                  <span>
                    ⚠️ <strong>Capacity Shortage Triggered:</strong> Under this scenario, ICU and ER will exhaust available open beds within 24 hours. Preemptive transfer of stable patients to step-down wards or activation of 15 surge beds is required.
                  </span>
                ) : (
                  <span>
                    ✅ <strong>Capacity Stable:</strong> Under this scenario, the hospital maintains adequate buffer ({currentSim.simulatedAvailable} available beds) with low saturation risk.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Scenario ID: {currentSim.id.slice(-8)}</span>
            <span>Simulated at: {currentSim.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
