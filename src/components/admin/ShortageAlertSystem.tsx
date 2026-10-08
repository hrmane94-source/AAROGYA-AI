import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Share2,
  FileDown,
  Filter,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Building2
} from 'lucide-react';
import { ShortageAlert, AlertSeverity } from '../../types';

interface ShortageAlertSystemProps {
  alerts: ShortageAlert[];
  onAlertAction: (alertId: string, action: 'REVIEW' | 'ASSIGN' | 'RESOLVE', staffName?: string, note?: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const ShortageAlertSystem: React.FC<ShortageAlertSystemProps> = ({
  alerts,
  onAlertAction,
  onNavigateTab,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [assigningAlertId, setAssigningAlertId] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string>('Dr. Vikram Malhotra (Cardiology / CMO)');
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const filteredAlerts = filterSeverity === 'ALL'
    ? alerts
    : alerts.filter(a => a.severity === filterSeverity);

  const handleAssign = (alertId: string) => {
    onAlertAction(alertId, 'ASSIGN', selectedStaff);
    setAssigningAlertId(null);
  };

  const handleExportIncidentReport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-rose-300 bg-rose-50/40',
          badge: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
        };
      case 'HIGH':
        return {
          border: 'border-amber-300 bg-amber-50/40',
          badge: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
        };
      case 'MEDIUM':
        return {
          border: 'border-sky-300 bg-sky-50/40',
          badge: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-600',
        };
      case 'INFO':
        return {
          border: 'border-emerald-300 bg-emerald-50/40',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-700 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Proactive Risk Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
            Bed Shortage Alert System
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated machine-learning capacity surveillance detecting impending bed saturations and positive discharge inflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportIncidentReport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            <span>{exportSuccess ? 'Report Exported (PDF/CSV)!' : 'Export Incident Report'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'INFO'].map(sev => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterSeverity === sev
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev === 'ALL' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredAlerts.length}</strong> active alerts
        </div>
      </div>

      {/* Alert Cards List */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => {
          const style = getSeverityStyle(alert.severity);

          return (
            <div
              key={alert.id}
              className={`rounded-2xl p-5 sm:p-6 border transition-all shadow-xs ${style.border}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  {/* Badge & Timestamp */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1.5 ${style.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {alert.severity} ALERT
                    </span>
                    <span className="text-xs font-bold text-slate-900">{alert.department}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-mono">{alert.timestamp}</span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-600">
                      Timeframe: <strong>{alert.predictedTimeframe}</strong>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-black text-slate-900">
                    {alert.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {alert.description}
                  </p>

                  {/* Status & Assigned Staff info */}
                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1">
                      Status:
                      <strong className={`font-mono px-2 py-0.5 rounded-md ${
                        alert.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : alert.status === 'ASSIGNED'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {alert.status}
                      </strong>
                    </span>

                    {alert.assignedStaff && (
                      <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold">
                        <UserCheck className="w-3.5 h-3.5" />
                        Assigned: {alert.assignedStaff}
                      </span>
                    )}

                    <span className="font-mono text-slate-500">
                      Current Occupancy: <strong>{alert.currentOccupancyPercent}%</strong> → Predicted: <strong>{alert.predictedOccupancyPercent}%</strong>
                    </span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {alert.status === 'UNREVIEWED' && (
                    <button
                      onClick={() => onAlertAction(alert.id, 'REVIEW')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Reviewed</span>
                    </button>
                  )}

                  <button
                    onClick={() => setAssigningAlertId(alert.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition flex items-center gap-1"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign Staff</span>
                  </button>

                  <button
                    onClick={() => onNavigateTab('what-if')}
                    className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Simulate Mitigation</span>
                  </button>
                </div>
              </div>

              {/* Assignment Form Popup inline */}
              {assigningAlertId === alert.id && (
                <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl">
                  <div className="w-full sm:w-auto">
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Assign Incident Response To:
                    </label>
                    <select
                      value={selectedStaff}
                      onChange={e => setSelectedStaff(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800"
                    >
                      <option>Dr. Vikram Malhotra (Cardiology / CMO)</option>
                      <option>Dr. Shweta Kulkarni (Lead Intensivist ICU)</option>
                      <option>Dr. Farhan Siddiqui (Emergency Physician)</option>
                      <option>Nurse Supervisor Anjali Nair (General Ward)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAssigningAlertId(null)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleAssign(alert.id)}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs"
                    >
                      Confirm Assignment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
