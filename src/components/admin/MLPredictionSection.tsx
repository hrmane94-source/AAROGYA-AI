import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  TrendingUp,
  Filter,
  ChevronRight,
  Info
} from 'lucide-react';

interface MLPredictionSectionProps {
  onNavigateTab: (tab: string) => void;
}

type Horizon = '24h' | '3d' | '7d' | '30d';

type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

interface ForecastSummary {
  horizon: string;
  bedType: string;
  department: string;
  currentAvailable: number;
  predictedAdmissions: number;
  predictedDischarges: number;
  expectedAvailable: number;
  predictedOccupancy: number;
  riskLevel: RiskLevel;
  confidenceLower: number | null;
  confidenceUpper: number | null;
  lastUpdated: string;
  notes: string;
}

interface ForecastSummaries {
  '24h': ForecastSummary[];
  '3d': ForecastSummary[];
  '7d': ForecastSummary[];
  '30d': ForecastSummary[];
}

interface PredictionApiResponse {
  success: boolean;
  source?: string;
  summaries: ForecastSummaries;
  error?: string;
}

async function fetchPredictionSummaries(): Promise<ForecastSummaries> {
  const response = await fetch('/api/predictions');

  if (!response.ok) {
    throw new Error(
      `Prediction API failed: ${response.status}`
    );
  }

  const data: PredictionApiResponse =
    await response.json();

  if (!data.success) {
    throw new Error(
      data.error || 'Failed to load predictions'
    );
  }

  return data.summaries;
}

export const MLPredictionSection: React.FC<
  MLPredictionSectionProps
> = ({ onNavigateTab }) => {

  // =========================================================
  // STATE
  // =========================================================

  const [horizon, setHorizon] =
    useState<Horizon>('24h');

  const [filterCategory, setFilterCategory] =
    useState<string>('ALL');

  const [summariesMap, setSummariesMap] =
    useState<ForecastSummaries>({
      '24h': [],
      '3d': [],
      '7d': [],
      '30d': [],
    });

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);


  // =========================================================
  // LOAD REAL ML FORECASTS
  // =========================================================

  useEffect(() => {
    let isMounted = true;

    const loadForecasts = async () => {
      try {
        setLoading(true);
        setError(null);

        const summaries =
          await fetchPredictionSummaries();

        if (isMounted) {
          setSummariesMap(summaries);
        }

      } catch (err) {
        console.error(
          'Failed to load ML forecasts:',
          err
        );

        if (isMounted) {
          setError(
            'Unable to load the latest ML forecast.'
          );
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadForecasts();

    return () => {
      isMounted = false;
    };
  }, []);


  // =========================================================
  // CURRENT HORIZON DATA
  // =========================================================

  const currentSummaries =
    summariesMap[horizon] || [];

  const filteredSummaries =
    filterCategory === 'ALL'
      ? currentSummaries
      : currentSummaries.filter(
          summary =>
            summary.bedType
              .toLowerCase()
              .includes(
                filterCategory.toLowerCase()
              )
        );


  // =========================================================
  // HORIZON LABELS
  // =========================================================

  const horizonLabels: Record<
    Horizon,
    {
      title: string;
      subtitle: string;
      icon: string;
    }
  > = {
    '24h': {
      title: 'Next 24 Hours',
      subtitle:
        'Short-term immediate shift & emergency absorption',
      icon: '⚡'
    },

    '3d': {
      title: 'Next 3 Days',
      subtitle:
        'Mid-week operational planning & elective scheduling',
      icon: '📅'
    },

    '7d': {
      title: 'Next 7 Days',
      subtitle:
        'Weekly cyclical demand & weekend discharge curves',
      icon: '📊'
    },

    '30d': {
      title: 'Next 30 Days',
      subtitle:
        'Macro seasonal trend & staff resource planning',
      icon: '🔮'
    }
  };


  // =========================================================
  // RISK BADGE
  // =========================================================

  const getRiskBadge = (
    risk: RiskLevel
  ) => {
    switch (risk) {

      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';

      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';

      case 'MEDIUM':
        return 'bg-sky-100 text-sky-800 border-sky-300';

      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';

      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER BANNER
      ====================================================== */}

      <div className="bg-linear-to-r from-sky-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">

        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-3">

            <Sparkles className="w-3.5 h-3.5" />

            <span>
              AI Bed Demand Prediction Engine
            </span>

          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Predictive Bed Demand Forecasting
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Continuously analyzing 12 months of historical admissions,
            discharges, emergency ratios, ALOS, day-of-week seasonality,
            and demand patterns to forecast bed availability before
            capacity becomes critical.
          </p>


          {/* Historical Features */}

          <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-slate-300">

            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              📊 Daily Admissions & Discharges
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              🚑 Emergency Admissions
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              ⏱️ Dept Average Length of Stay (ALOS)
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              🗓️ Day-of-Week Seasonality
            </span>

            <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              📈 Historical Occupancy
            </span>

          </div>

        </div>
      </div>


      {/* =====================================================
          CONTROL BAR
      ====================================================== */}

      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        {/* Horizon Tabs */}

        <div>

          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Prediction Horizon
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">

            {(
              ['24h', '3d', '7d', '30d'] as const
            ).map(h => (

              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  horizon === h
                    ? 'bg-white text-sky-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >

                <span>
                  {horizonLabels[h].icon}
                </span>

                <span>
                  {horizonLabels[h].title}
                </span>

              </button>

            ))}

          </div>

        </div>


        {/* Filter */}

        <div className="flex items-center gap-3 w-full md:w-auto">

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs w-full md:w-auto">

            <Filter className="w-3.5 h-3.5 text-slate-400" />

            <select
              value={filterCategory}
              onChange={e =>
                setFilterCategory(e.target.value)
              }
              className="bg-transparent border-none text-slate-700 font-semibold focus:outline-hidden"
            >

              <option value="ALL">
                All Bed Types
              </option>

              <option value="ICU">
                ICU Only
              </option>

              <option value="Emergency">
                Emergency Only
              </option>

              <option value="General">
                General Ward
              </option>

              <option value="Pediatric">
                Pediatric
              </option>

            </select>

          </div>


          <button
            onClick={() =>
              onNavigateTab('forecast-graph')
            }
            className="px-3.5 py-2 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold transition flex items-center gap-1.5 shrink-0 border border-sky-200"
          >

            <span>
              View Graph Curve
            </span>

            <ChevronRight className="w-3.5 h-3.5" />

          </button>

        </div>

      </div>


      {/* =====================================================
          ACTIVE HORIZON
      ====================================================== */}

      <div className="flex items-center justify-between text-xs text-slate-600 px-1">

        <div>
          Showing ML Forecast for:{' '}

          <strong className="text-slate-900">
            {horizonLabels[horizon].title}
          </strong>

          {' '}—{' '}

          {horizonLabels[horizon].subtitle}
        </div>

        <div className="text-[11px] text-slate-400">

          Model:{' '}

          <span className="font-mono text-slate-600">
            XGBoost-v1
          </span>

          {' '}• Real ML Forecast

        </div>

      </div>


      {/* =====================================================
          LOADING
      ====================================================== */}

      {loading && (

        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">

          <div className="text-sm font-semibold text-slate-700">
            Loading latest ML forecasts...
          </div>

          <div className="text-xs text-slate-400 mt-1">
            Reading predictions from Arogya AI backend
          </div>

        </div>

      )}


      {/* =====================================================
          ERROR
      ====================================================== */}

      {!loading && error && (

        <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200 text-center">

          <div className="text-sm font-semibold text-rose-700">
            Forecast unavailable
          </div>

          <div className="text-xs text-rose-600 mt-1">
            {error}
          </div>

        </div>

      )}


      {/* =====================================================
          EMPTY / NO FORECAST
      ====================================================== */}

      {!loading &&
        !error &&
        filteredSummaries.length === 0 && (

          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">

            <div className="text-sm font-semibold text-slate-700">
              No forecast data available
            </div>

            <div className="text-xs text-slate-400 mt-1">
              No ML forecast is currently available for
              this horizon or filter.
            </div>

          </div>

        )}


      {/* =====================================================
          PREDICTION CARDS
      ====================================================== */}

      {!loading &&
        !error &&
        filteredSummaries.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredSummaries.map(
              (item, idx) => {

                const isHighRisk =
                  item.riskLevel === 'HIGH' ||
                  item.riskLevel === 'CRITICAL';

                return (

                  <div
                    key={`${item.bedType}-${idx}`}
                    className={`bg-white rounded-2xl p-5 sm:p-6 border transition-all duration-200 shadow-xs hover:shadow-md flex flex-col justify-between ${
                      isHighRisk
                        ? 'border-rose-200 bg-rose-50/10'
                        : 'border-slate-200/80'
                    }`}
                  >

                    <div>

                      {/* Top Card Bar */}

                      <div className="flex items-start justify-between gap-2 mb-3">

                        <div>

                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {item.department}
                          </span>

                          <h3 className="text-xl font-black text-slate-900 mt-0.5">
                            {item.bedType}
                          </h3>

                        </div>


                        <div className="text-right">

                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getRiskBadge(
                              item.riskLevel
                            )}`}
                          >
                            {item.riskLevel} RISK
                          </span>

                        </div>

                      </div>


                      {/* Core Metrics */}

                      <div className="my-4 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/60 space-y-2.5 text-xs">

                        <div className="flex items-center justify-between text-slate-600">

                          <span>
                            Current Available:
                          </span>

                          <strong className="font-mono text-sm text-slate-900">
                            {item.currentAvailable} beds
                          </strong>

                        </div>


                        <div className="flex items-center justify-between text-emerald-700 bg-emerald-50/60 px-2 py-1 rounded-lg">

                          <span className="flex items-center gap-1">

                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />

                            Predicted Admissions:

                          </span>

                          <strong className="font-mono text-sm">
                            +{item.predictedAdmissions}
                          </strong>

                        </div>


                        <div className="flex items-center justify-between text-amber-700 bg-amber-50/60 px-2 py-1 rounded-lg">

                          <span className="flex items-center gap-1">

                            <TrendingDown className="w-3.5 h-3.5 text-amber-600" />

                            Predicted Discharges:

                          </span>

                          <strong className="font-mono text-sm">
                            -{item.predictedDischarges}
                          </strong>

                        </div>


                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between">

                          <span className="font-bold text-slate-800">
                            Expected Available Beds:
                          </span>

                          <span
                            className={`font-black font-mono text-base px-2.5 py-0.5 rounded-lg ${
                              item.expectedAvailable <= 3
                                ? 'bg-rose-600 text-white'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {item.expectedAvailable}
                          </span>

                        </div>


                        <div className="flex items-center justify-between text-slate-700 pt-1">

                          <span>
                            Predicted Occupancy:
                          </span>

                          <strong className="font-mono font-bold text-slate-900">
                            {item.predictedOccupancy}%
                          </strong>

                        </div>

                      </div>


                      {/* Confidence */}

                      <div className="text-[11px] text-slate-500 flex items-center justify-between px-1">

                        <span>
                          Forecast Confidence:
                        </span>

                        <span className="font-mono font-semibold text-slate-700">

                          {item.confidenceLower !== null &&
                          item.confidenceUpper !== null
                            ? `[${item.confidenceLower} - ${item.confidenceUpper} beds]`
                            : 'Not calculated'}

                        </span>

                      </div>


                      {/* Notes */}

                      <p className="text-xs text-slate-600 mt-3 italic bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">

                        &ldquo;
                        {item.notes}
                        &rdquo;

                      </p>

                    </div>


                    {/* Bottom Action */}

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">

                      <span className="text-[10px] text-slate-400">

                        Updated:{' '}
                        {item.lastUpdated}

                      </span>


                      <button
                        onClick={() =>
                          onNavigateTab('what-if')
                        }
                        className="text-xs text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1"
                      >

                        <span>
                          Simulate Buffer
                        </span>

                        <ChevronRight className="w-3.5 h-3.5" />

                      </button>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}


      {/* =====================================================
          METHODOLOGY & SAFETY NOTE
      ====================================================== */}

      <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-200/80 flex items-start gap-3 text-xs text-sky-900">

        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />

        <div className="leading-relaxed">

          <strong>
            ML Forecasting Principle:
          </strong>{' '}

          Predictions are generated using the trained
          XGBoost forecasting models over historical
          hospital-flow data. Forecasts support
          preemptive hospital resource planning and
          should not be treated as autonomous clinical
          decisions.

        </div>

      </div>

    </div>
  );
};