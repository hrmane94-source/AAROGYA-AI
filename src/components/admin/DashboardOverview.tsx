import React, { useState } from 'react';
import {
  Bed,
  Users,
  AlertCircle,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  PlusCircle,
  MinusCircle,
  Stethoscope,
  Info
} from 'lucide-react';
import { Hospital, BedCategory, ShortageAlert, AdmissionSpike } from '../../types';
import { OccupancyProgressBar } from '../common/ChartComponents';

interface DashboardOverviewProps {
  hospital: Hospital;
  onUpdateBed: (bedCategoryId: string, occDelta: number, resDelta: number, availDelta?: number) => void;
  onNavigateTab: (tab: string) => void;
  spikeAlert: AdmissionSpike;
  alerts: ShortageAlert[];
  isStaffRole?: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  hospital,
  onUpdateBed,
  onNavigateTab,
  spikeAlert,
  alerts,
  isStaffRole = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<BedCategory | null>(null);
  const [editDeltaOcc, setEditDeltaOcc] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState(false);

  // Critical shortage alert count
  const criticalAlerts = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED');

  const handleOpenBedModal = (cat: BedCategory) => {
    setSelectedCategory(cat);
    setEditDeltaOcc(0);
    setShowEditModal(true);
  };

  const handleApplyBedChange = () => {
    if (!selectedCategory) return;
    onUpdateBed(selectedCategory.id, editDeltaOcc, 0);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Critical Spike or Shortage */}
      {criticalAlerts.length > 0 && (
        <div className="rounded-2xl bg-linear-to-r from-rose-900 via-rose-800 to-amber-900 text-white p-4 sm:p-5 shadow-lg shadow-rose-900/10 border border-rose-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-rose-500/30 rounded-xl border border-rose-400/30 text-rose-200 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold tracking-wider uppercase">
                  CRITICAL CAPACITY ALERT
                </span>
                <span className="text-xs text-rose-200 font-mono">Predicted in Next 24 Hours</span>
              </div>
              <h4 className="font-bold text-base text-white mt-1">
                ICU Occupancy Predicted to Exceed 95% • High Risk Surge
              </h4>
              <p className="text-xs text-rose-100/90 mt-0.5 max-w-2xl">
                Current ICU available: <strong>{hospital.bedCategories.find(c => c.name === 'ICU')?.available || 4} beds</strong>. Predicted admissions: 15 vs 10 discharges. Immediate bed redistribution required.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigateTab('what-if')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-semibold text-white transition flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Simulate +Beds</span>
            </button>
            <button
              onClick={() => onNavigateTab('alerts')}
              className="px-4 py-2 rounded-xl bg-white text-rose-900 hover:bg-rose-50 text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <span>View Action Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Title & Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 uppercase tracking-wider">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>Arogya AI Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            Today&apos;s Hospital Status
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time bed telemetry and AI-driven occupancy forecasting • {hospital.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('prediction')}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-600/20 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Bed Demand Forecast</span>
          </button>
          <button
            onClick={() => onNavigateTab('what-if')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>What-If Simulator</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Beds */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Beds</span>
            <Bed className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono">
            {hospital.totalBeds}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Commissioned capacity</span>
          </div>
        </div>

        {/* Occupied */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Occupied</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2 font-mono">
            {hospital.occupiedBeds}
          </div>
          <div className="text-[11px] text-rose-600/80 font-medium mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12 today</span>
          </div>
        </div>

        {/* Available */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Available</span>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-2 font-mono">
            {hospital.availableBeds}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>Ready for admission</span>
          </div>
        </div>

        {/* Reserved */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Reserved</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2 font-mono">
            {hospital.reservedBeds}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Elective & transfers</span>
          </div>
        </div>

        {/* Emergency Beds */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Emergency Beds</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-2 font-mono">
            {hospital.emergencyBeds}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Buffer protocol</span>
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Occupancy Rate</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-700 mt-2 font-mono">
            {hospital.occupancyRate}%
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            <span>High strain zone</span>
          </div>
        </div>
      </div>

      {/* Live Bed Management & Categories Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Bed className="w-5 h-5 text-sky-600" />
              <span>Live Bed Availability by Category</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Dynamically updatable bed allocation states with visual occupancy thresholds
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Last updated: <strong className="text-slate-800 font-mono">{hospital.lastUpdated}</strong></span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Normal (&lt;80%)
              </span>
              <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Warning (80-89%)
              </span>
              <span className="inline-flex items-center gap-1 text-rose-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Danger (≥90%)
              </span>
            </div>
          </div>
        </div>

        {/* Responsive Table / Card View */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3">Bed Type</th>
                <th className="py-3 px-3 text-center">Total</th>
                <th className="py-3 px-3 text-center">Occupied</th>
                <th className="py-3 px-3 text-center">Reserved</th>
                <th className="py-3 px-3 text-center">Available</th>
                <th className="py-3 px-3 min-w-[180px]">Occupancy State</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {hospital.bedCategories.map(cat => {
                const isCritical = cat.status === 'Danger';
                const isWarning = cat.status === 'Warning';

                return (
                  <tr
                    key={cat.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isCritical ? 'bg-rose-50/30' : ''
                    }`}
                  >
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                      <div className="text-[11px] text-slate-500">{cat.departmentName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{cat.wing}</div>
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-slate-900 font-mono text-sm">
                      {cat.total}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-rose-600 font-mono text-sm">
                      {cat.occupied}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold text-amber-600 font-mono text-sm">
                      {cat.reserved}
                    </td>

                    <td className="py-3.5 px-3 text-center font-bold font-mono text-sm">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg font-black ${
                          cat.available <= 5
                            ? 'bg-rose-100 text-rose-700 border border-rose-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {cat.available}
                      </span>
                    </td>

                    <td className="py-3.5 px-3">
                      <OccupancyProgressBar
                        rate={cat.occupancyRate}
                        status={cat.status}
                        showLabel={true}
                      />
                    </td>

                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          isCritical
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : isWarning
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isCritical ? 'bg-rose-600 animate-ping' : isWarning ? 'bg-amber-600' : 'bg-emerald-600'
                          }`}
                        />
                        {cat.status === 'Danger' ? 'Danger' : cat.status === 'Warning' ? 'Warning' : 'Normal'}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onUpdateBed(cat.id, 1, 0)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition"
                          title="Admit 1 Patient (+Occupied)"
                        >
                          + Admit
                        </button>
                        <button
                          onClick={() => onUpdateBed(cat.id, -1, 0)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition"
                          title="Discharge 1 Patient (-Occupied)"
                        >
                          - Discharge
                        </button>
                        <button
                          onClick={() => handleOpenBedModal(cat)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                        >
                          Manage
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Demo Data Disclaimer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 text-amber-700 font-medium">
            <Info className="w-3.5 h-3.5" />
            Simulated Prototype Data: For testing and validation only. Never represent demo data as real clinical hospital records.
          </span>
          <span className="font-mono text-slate-400">Telemetry Refresh: Auto (5s)</span>
        </div>
      </div>

      {/* Quick Action & Forecasting Modules Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Admission Spike Module Preview */}
        <div className="bg-linear-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/30 border border-rose-500/40 text-rose-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              ML SPIKE DETECTION
            </span>
            <span className="text-xs text-slate-300 font-mono">Confidence: 91.2%</span>
          </div>

          <h3 className="text-xl font-black mt-3 flex items-center gap-2">
            <span>🚨 Potential Admission Spike Detected</span>
          </h3>

          <div className="grid grid-cols-3 gap-3 my-4 bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div>
              <div className="text-[11px] text-slate-300">Expected Daily</div>
              <div className="text-xl font-extrabold text-white font-mono mt-0.5">
                {spikeAlert.expectedDailyAdmissions}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-rose-300">Predicted Tomorrow</div>
              <div className="text-xl font-extrabold text-rose-400 font-mono mt-0.5">
                {spikeAlert.predictedTomorrow}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-amber-300">Expected Surge</div>
              <div className="text-xl font-extrabold text-amber-400 font-mono mt-0.5">
                +{spikeAlert.percentIncrease}%
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-200 line-clamp-2">
            Primary driver: <strong>{spikeAlert.primaryDrivers[0]}</strong>. Immediate bed buffer conversion recommended.
          </p>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('spike-detection')}
              className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
            >
              <span>View Full Spike Analysis & Mitigations</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('what-if')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition"
            >
              Simulate Surge
            </button>
          </div>
        </div>

        {/* Expected Discharges Preview */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Discharge Forecasting</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Turnaround Velocity: 1.18x</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Expected Discharges Tomorrow: <span className="text-indigo-600 font-mono text-xl">32 Patients</span>
            </h3>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>General Medicine</span>
                <span className="font-bold text-slate-900">14 discharges (11:00 AM)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>General Surgery</span>
                <span className="font-bold text-slate-900">8 discharges (01:00 PM)</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Orthopedics & Spine</span>
                <span className="font-bold text-slate-900">5 discharges</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Cardiology & CCU</span>
                <span className="font-bold text-slate-900">3 discharges</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Net capacity input to bed availability model
            </span>
            <button
              onClick={() => onNavigateTab('discharge-forecast')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
            >
              <span>Detailed Forecast</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bed Adjustment Modal for Staff/Admin */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">
              Update Bed Allotment • {selectedCategory.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {selectedCategory.departmentName} ({selectedCategory.wing})
            </p>

            <div className="my-5 p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span>Total Beds:</span>
                <strong className="font-mono">{selectedCategory.total}</strong>
              </div>
              <div className="flex justify-between">
                <span>Current Occupied:</span>
                <strong className="font-mono text-rose-600">{selectedCategory.occupied}</strong>
              </div>
              <div className="flex justify-between">
                <span>Current Available:</span>
                <strong className="font-mono text-emerald-600">{selectedCategory.available}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700 block">
                Adjust Patient Count (Admit / Discharge Delta):
              </label>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setEditDeltaOcc(prev => prev - 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <MinusCircle className="w-6 h-6" />
                </button>
                <span className="text-2xl font-bold font-mono text-slate-900 w-16 text-center">
                  {editDeltaOcc > 0 ? `+${editDeltaOcc}` : editDeltaOcc}
                </span>
                <button
                  type="button"
                  onClick={() => setEditDeltaOcc(prev => prev + 1)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  <PlusCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                New Occupied will be: {Math.max(0, Math.min(selectedCategory.total, selectedCategory.occupied + editDeltaOcc))} beds
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBedChange}
                className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
