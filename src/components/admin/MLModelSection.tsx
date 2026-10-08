import React from 'react';
import {
  Cpu,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Layers,
  Activity,
  ShieldCheck,
  Zap,
  Info,
  SlidersHorizontal,
  RefreshCw,
  GitBranch,
  ArrowDown
} from 'lucide-react';
import { MLModelEvaluation } from '../../types';

interface MLModelSectionProps {
  metrics: MLModelEvaluation;
  onNavigateTab: (tab: string) => void;
}

export const MLModelSection: React.FC<MLModelSectionProps> = ({ metrics, onNavigateTab }) => {
  const pipelineFlow = [
    { title: 'Historical Hospital Data', sub: 'Admissions, discharges, triage records', icon: '💾' },
    { title: 'Data Cleaning & Imputation', sub: 'Anomaly scrubbing & normalization', icon: '🧹' },
    { title: 'Feature Engineering', sub: 'ALOS lags, seasonal Fourier terms, day-weights', icon: '⚙️' },
    { title: 'ML Forecasting Engine', sub: 'Hybrid Gradient Boosting + Bayesian Poisson', icon: '🧠' },
    { title: 'Admission & Discharge Prediction', sub: 'Concurrent net patient arrival vectors', icon: '📊' },
    { title: 'Bed Demand Forecast', sub: '24h, 3d, 7d, 30d trajectory distributions', icon: '🔮' },
    { title: 'Predicted Bed Availability', sub: 'Category & department open bed envelopes', icon: '🛏️' },
    { title: 'Shortage Risk & Spike Alert', sub: 'Automatic capacity breach notification', icon: '🚨' },
    { title: 'Hospital Admin Action', sub: 'Surge mitigation, bed transfers & planning', icon: '👨‍⚕️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Model Architecture & Validation</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Prediction Model Governance
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Transparent performance metrics, algorithmic feature importances, and complete mathematical pipeline audit for Arogya AI&apos;s predictive bed management core.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Explicit Notice: Prototype running in Demo Prediction Mode with calibrated synthetic validation benchmarks.</span>
          </div>
        </div>
      </div>

      {/* Top Model Status & Benchmark Metrics (Prompt Requirement 18) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
        {/* Model Status */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs col-span-2 sm:col-span-2 lg:col-span-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Model Status</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xl font-black text-slate-900 font-mono">{metrics.status}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
              v{metrics.version.split('-')[0]}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">
            {metrics.lastUpdated}
          </div>
        </div>

        {/* Training Data Horizon */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Training Data</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-2">12 Mos</div>
          <div className="text-[11px] text-slate-500 mt-1">146k Bed-Days</div>
        </div>

        {/* MAE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MAE (Mean Error)</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-2">{metrics.mae}</div>
          <div className="text-[11px] text-slate-500 mt-1">±2.14 beds error</div>
        </div>

        {/* RMSE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">RMSE</div>
          <div className="text-2xl font-black text-indigo-600 font-mono mt-2">{metrics.rmse}</div>
          <div className="text-[11px] text-slate-500 mt-1">Root Mean Sq Err</div>
        </div>

        {/* MAPE */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MAPE</div>
          <div className="text-2xl font-black text-emerald-600 font-mono mt-2">{metrics.mape}%</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">95.18% Accuracy</div>
        </div>

        {/* R² Score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">R² Coefficient</div>
          <div className="text-2xl font-black text-sky-600 font-mono mt-2">{metrics.r2Score}</div>
          <div className="text-[11px] text-sky-600 font-medium mt-1">Fit Quality</div>
        </div>
      </div>

      {/* Feature Importance & Algorithmic Weights (Prompt Requirement 18) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Feature Contribution
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <span>Predictive Feature Importance Weights</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Relative weight assigned by the Gradient Boosted Tree ensemble when projecting bed turnover.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {metrics.featureImportance.map((feat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{feat.feature}</span>
                  <span className="font-mono font-bold text-indigo-700">
                    {Math.round(feat.importance * 100)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${feat.importance * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">{feat.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Algorithm Approach & Backend Extensibility (Prompt Requirement 18) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Architecture & Extensibility
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-sky-600" />
              <span>Multi-Model Forecasting Methodology</span>
            </h3>

            <div className="mt-4 space-y-3 text-xs text-slate-700 leading-relaxed">
              <p>
                <strong>Algorithm Selection:</strong> Rather than relying on a single static model, Arogya AI dynamically selects the optimal model based on dataset volume and clinical volatility:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li><strong>Poisson Arrival Queueing:</strong> Accurately models non-stationary emergency surges.</li>
                <li><strong>SARIMAX & Prophet:</strong> Decomposes weekly scheduling cycles and holiday drops.</li>
                <li><strong>XGBoost / LightGBM:</strong> Captures multi-department cross-inflow and ALOS distributions.</li>
                <li><strong>LSTM Sequence Models:</strong> Optional neural backend for multi-hospital hospital networks.</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-900">Python / FastAPI Integration Hook:</div>
              <p className="text-slate-600 font-mono text-[11px] bg-slate-900 text-slate-100 p-3 rounded-xl overflow-x-auto">
                POST /api/v1/ml/predict_bed_demand<br />
                {JSON.stringify({ hospital_id: 'hosp-1', horizon_days: 7, ensemble_weights: [0.4, 0.35, 0.25] }, null, 2)}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab('hospital-data')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload New Training Dataset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Prediction Pipeline (Prompt Requirement 19) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Pipeline Architecture (PS #16 Central Flow)
          </span>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">
            End-to-End Predictive Bed Management Pipeline
          </h3>
          <p className="text-xs text-slate-500">
            Visual walkthrough from raw historical ingestion to automated clinical shortage warnings.
          </p>
        </div>

        {/* Step-by-Step Flow Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-2 pt-2">
          {pipelineFlow.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 text-center flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-1">{step.icon}</span>
                <span className="text-[10px] font-black text-indigo-700 uppercase block">Step {idx + 1}</span>
                <div className="font-bold text-slate-900 text-[11px] mt-1 leading-snug">{step.title}</div>
              </div>
              <div className="text-[9px] text-slate-500 mt-2">{step.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
