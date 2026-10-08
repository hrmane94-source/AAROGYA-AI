import React from 'react';
import {
  Building2,
  Bed,
  Users,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { Hospital, RiskLevel } from '../../types';
import { OccupancyProgressBar } from '../common/ChartComponents';

interface HospitalMapViewProps {
  hospital: Hospital;
  onNavigateTab: (tab: string) => void;
}

export const HospitalMapView: React.FC<HospitalMapViewProps> = ({ hospital, onNavigateTab }) => {
  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'CRITICAL':
        return 'border-rose-300 bg-rose-50/50 text-rose-800';
      case 'HIGH':
        return 'border-amber-300 bg-amber-50/50 text-amber-800';
      case 'MEDIUM':
        return 'border-sky-300 bg-sky-50/50 text-sky-800';
      case 'LOW':
        return 'border-emerald-300 bg-emerald-50/50 text-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Clinical Floor Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Hospital-Wide Department Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Department-by-department capacity grid, telemetry status, real-time occupancy, and machine-learning predicted demand index.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('what-if')}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <span>Simulate Surge Allocation</span>
        </button>
      </div>

      {/* Hospital Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {hospital.departments.map(dept => {
          const isHighRisk = dept.riskLevel === 'HIGH' || dept.riskLevel === 'CRITICAL';

          return (
            <div
              key={dept.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                isHighRisk ? 'border-rose-200 ring-2 ring-rose-500/10' : 'border-slate-200/80'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl p-2 rounded-2xl bg-slate-100">{dept.icon}</span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {dept.name}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Avg Stay (ALOS): <strong className="font-mono text-slate-700">{dept.avgStayDays} days</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${getRiskColor(dept.riskLevel)}`}>
                    {dept.riskLevel} RISK
                  </span>
                </div>

                {/* KPI Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-200/60 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Total</span>
                    <strong className="font-mono text-slate-900 text-base">{dept.totalBeds}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-500 font-bold block">Occupied</span>
                    <strong className="font-mono text-rose-600 text-base">{dept.occupiedBeds}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 font-bold block">Available</span>
                    <strong className="font-mono text-emerald-700 text-base">{dept.availableBeds}</strong>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <OccupancyProgressBar rate={dept.occupancyRate} />
                </div>

                {/* ML Demand Projection */}
                <div className="mt-4 p-3 bg-sky-50/70 rounded-xl border border-sky-200/60 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sky-900 font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Predicted 24h Demand:
                  </span>
                  <span className="font-mono font-black text-sky-800 text-sm">
                    {dept.predictedDemand} beds
                  </span>
                </div>
              </div>

              {/* Floor Bed Matrix Visualizer (Mini Dot Matrix) */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                  <span>Floor Bed Matrix ({dept.totalBeds} Beds)</span>
                  <span className="text-slate-500 font-mono font-normal">
                    {dept.availableBeds} open
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                  {Array.from({ length: Math.min(32, dept.totalBeds) }).map((_, i) => {
                    const isOccupied = i < Math.floor((dept.occupiedBeds / dept.totalBeds) * Math.min(32, dept.totalBeds));
                    return (
                      <div
                        key={i}
                        className={`w-2.5 h-2.5 rounded-xs transition-colors ${
                          isOccupied ? 'bg-rose-500' : 'bg-emerald-400 animate-pulse'
                        }`}
                        title={isOccupied ? `Bed #${i + 1}: Occupied` : `Bed #${i + 1}: Available`}
                      />
                    );
                  })}
                  {dept.totalBeds > 32 && (
                    <span className="text-[9px] text-slate-400 self-center pl-1 font-mono">
                      +{dept.totalBeds - 32} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
