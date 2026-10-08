import React, { useState } from 'react';
import {
  FileText,
  BarChart3,
  TrendingUp,
  Download,
  Share2,
  Calendar,
  Building2,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info
} from 'lucide-react';
import { Hospital } from '../../types';

interface ReportsAnalyticsProps {
  hospital: Hospital;
}

export const ReportsAnalytics: React.FC<ReportsAnalyticsProps> = ({ hospital }) => {
  const [reportPeriod, setReportPeriod] = useState<'WEEK' | 'MONTH' | 'QUARTER'>('WEEK');
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapDepts = ['ICU', 'Emergency', 'General Ward', 'Pediatrics', 'Cardiology', 'Surgery'];

  // Synthetic utilization heatmap matrix
  const getHeatmapColor = (dIdx: number, dayIdx: number) => {
    const matrix = [
      [92, 95, 96, 94, 91, 86, 88], // ICU
      [84, 88, 91, 85, 82, 95, 94], // ER
      [86, 88, 89, 85, 80, 72, 74], // General
      [74, 76, 75, 78, 72, 68, 70], // Peds
      [88, 89, 92, 87, 84, 78, 80], // Cardio
      [90, 94, 95, 92, 88, 65, 60], // Surgery
    ];
    const val = matrix[dIdx][dayIdx];
    if (val >= 93) return { bg: 'bg-rose-500 text-white', val };
    if (val >= 85) return { bg: 'bg-amber-400 text-slate-900', val };
    if (val >= 75) return { bg: 'bg-sky-400 text-slate-900', val };
    return { bg: 'bg-emerald-400 text-slate-900', val };
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-sky-700 uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-sky-600" />
            <span>Executive Healthcare Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Analytics & Utilization Reports
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate bed occupancy velocity, department turnover heatmaps, and admission-discharge equilibrium audits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['WEEK', 'MONTH', 'QUARTER'] as const).map(p => (
              <button
                key={p}
                onClick={() => setReportPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  reportPeriod === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? 'Exporting PDF...' : 'Export Full Report'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Avg Bed Turnover Time</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">1.8 Hours</div>
          <div className="text-[11px] text-emerald-600 mt-0.5 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>-15 mins vs last week</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Weekly Admission Volume</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">294 Patients</div>
          <div className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18% seasonal increase</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Mean Hospital ALOS</span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">4.3 Days</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Benchmark: 4.5 days</div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Emergency Bed Absorption</span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-1">94.2%</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Critical stress threshold</div>
        </div>
      </div>

      {/* Heatmap: Day of Week vs Department Utilization */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Department Occupancy Heatmap (% Bed Utilization)
            </h3>
            <p className="text-xs text-slate-500">
              Identifying weekly peak demand bottlenecks and recurring weekend discharge deficits.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-emerald-400" /> &lt;75%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-sky-400" /> 75-84%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-amber-400" /> 85-92%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600">
              <span className="w-3 h-3 rounded-xs bg-rose-500" /> ≥93% (Critical)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead>
              <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200">
                <th className="py-2.5 px-3 text-left">Department</th>
                {heatmapDays.map(d => (
                  <th key={d} className="py-2.5 px-3">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {heatmapDepts.map((dept, dIdx) => (
                <tr key={dept}>
                  <td className="py-3 px-3 text-left font-bold text-slate-900">{dept}</td>
                  {heatmapDays.map((day, dayIdx) => {
                    const item = getHeatmapColor(dIdx, dayIdx);
                    return (
                      <td key={day} className="py-3 px-2">
                        <span
                          className={`inline-block w-12 py-1.5 rounded-lg font-mono font-bold text-xs shadow-xs ${item.bg}`}
                        >
                          {item.val}%
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
