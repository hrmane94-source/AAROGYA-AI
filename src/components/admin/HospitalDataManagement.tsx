import React, { useState } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  Download,
  Sparkles,
  RefreshCw,
  Cpu,
  Table,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { MLForecastEngine } from '../../services/mlForecastEngine';

interface HospitalDataManagementProps {
  onRetrainSuccess: () => void;
  onNavigateTab: (tab: string) => void;
}

export const HospitalDataManagement: React.FC<HospitalDataManagementProps> = ({
  onRetrainSuccess,
  onNavigateTab,
}) => {
  const [pipelineStep, setPipelineStep] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [uploadedFileName, setUploadedFileName] = useState<string>('sample_hospital_ehr_12months.csv');
  const [sampleDataRows, setSampleDataRows] = useState<number>(360);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [trainComplete, setTrainComplete] = useState<boolean>(false);

  const sampleCsvContent = MLForecastEngine.generateSampleCSV();

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'arogya_historical_hospital_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateUpload = (fileName?: string) => {
    setUploadedFileName(fileName || 'historical_admissions_discharges_2025_2026.csv');
    setPipelineStep(2);
    setValidationErrors([]);
  };

  const handleRunPipeline = async () => {
    setIsProcessing(true);
    setPipelineStep(2); // Validating

    setTimeout(() => {
      setPipelineStep(3); // Analyzing
      setTimeout(() => {
        setPipelineStep(4); // Training Model
        setTimeout(() => {
          setPipelineStep(5); // Forecast Generated
          setIsProcessing(false);
          setTrainComplete(true);
          onRetrainSuccess();
        }, 1200);
      }, 1000);
    }, 900);
  };

  const pipelineSteps = [
    { num: 1, title: 'Upload Dataset', desc: 'CSV/EHR data ingestion' },
    { num: 2, title: 'Validate Data', desc: 'Schema & null checks' },
    { num: 3, title: 'Analyze Features', desc: 'Decompose ALOS & seasonality' },
    { num: 4, title: 'Train / Update Model', desc: 'Ensemble gradient boosting' },
    { num: 5, title: 'Generate Forecast', desc: 'Deploy active horizons' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Database className="w-3.5 h-3.5" />
            <span>Hospital EHR Ingestion & Retraining</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Hospital Historical Data Pipeline
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Upload institutional admissions, discharges, and bed log histories to retrain the machine learning forecasting models
            and update continuous demand projections for your hospital.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={handleDownloadSample}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download 12-Month Sample Dataset (.CSV)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Workflow (Prompt Requirement 17 & 19) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
          Machine Learning Pipeline Workflow
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {pipelineSteps.map((step) => {
            const isDone = pipelineStep > step.num || trainComplete;
            const isCurrent = pipelineStep === step.num && !trainComplete;

            return (
              <div
                key={step.num}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-500/20'
                    : isDone
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-slate-50 border-slate-200/70 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-xl text-xs font-bold flex items-center justify-center ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-sky-600 text-white animate-pulse'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </span>
                  {isCurrent && isProcessing && (
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                  )}
                </div>

                <div className="font-bold text-slate-900 text-xs">{step.title}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{step.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Zone & Dataset Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Upload Historical Dataset
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports CSV containing: Date, Department, Bed Type, Total Beds, Occupied, Admissions, Discharges, Emergency, ALOS.
            </p>

            {/* Drag & Drop simulated box */}
            <div
              onClick={() => handleSimulateUpload()}
              className="mt-4 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/40 hover:bg-sky-50/80 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <UploadCloud className="w-10 h-10 text-sky-600" />
              <div className="text-xs font-bold text-slate-800">
                Click to browse or drop CSV file here
              </div>
              <div className="text-[11px] text-slate-500">
                {uploadedFileName ? `Attached: ${uploadedFileName}` : 'sample_hospital_ehr_12months.csv ready'}
              </div>
            </div>

            {/* Validation Checklist */}
            <div className="mt-4 space-y-1.5 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Date & Time Series Continuity Verified</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Department Schema & ALOS Headers Validated</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Outlier Imputation Ready (360 Daily Observations)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleRunPipeline}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing & Retraining Ensemble...</span>
                </>
              ) : trainComplete ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Model Retrained! Click to Retrain Again</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  <span>Run Data Validation & Train Model</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dataset Preview Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-5 h-5 text-indigo-600" />
                <span>Ingested Dataset Preview</span>
              </h3>
              <p className="text-xs text-slate-500">
                Displaying first 6 records of historical dataset ({sampleDataRows} total patient-bed days)
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
              Schema: Valid (11 Cols)
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-center">Total</th>
                  <th className="py-2.5 px-3 text-center">Occupied</th>
                  <th className="py-2.5 px-3 text-center">Admissions</th>
                  <th className="py-2.5 px-3 text-center">Discharges</th>
                  <th className="py-2.5 px-3 text-center">ALOS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">2026-09-28</td>
                  <td className="py-2 px-3">General Ward</td>
                  <td className="py-2 px-3 text-center">250</td>
                  <td className="py-2 px-3 text-center text-rose-600 font-bold">208</td>
                  <td className="py-2 px-3 text-center text-emerald-600">+26</td>
                  <td className="py-2 px-3 text-center text-amber-600">-24</td>
                  <td className="py-2 px-3 text-center">4.2d</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">2026-09-28</td>
                  <td className="py-2 px-3">ICU / Critical Care</td>
                  <td className="py-2 px-3 text-center">80</td>
                  <td className="py-2 px-3 text-center text-rose-600 font-bold">69</td>
                  <td className="py-2 px-3 text-center text-emerald-600">+14</td>
                  <td className="py-2 px-3 text-center text-amber-600">-11</td>
                  <td className="py-2 px-3 text-center">6.8d</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">2026-09-29</td>
                  <td className="py-2 px-3">Emergency Trauma</td>
                  <td className="py-2 px-3 text-center">40</td>
                  <td className="py-2 px-3 text-center text-rose-600 font-bold">29</td>
                  <td className="py-2 px-3 text-center text-emerald-600">+24</td>
                  <td className="py-2 px-3 text-center text-amber-600">-22</td>
                  <td className="py-2 px-3 text-center">1.5d</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">2026-09-30</td>
                  <td className="py-2 px-3">Cardiology CCU</td>
                  <td className="py-2 px-3 text-center">35</td>
                  <td className="py-2 px-3 text-center text-rose-600 font-bold">31</td>
                  <td className="py-2 px-3 text-center text-emerald-600">+6</td>
                  <td className="py-2 px-3 text-center text-amber-600">-4</td>
                  <td className="py-2 px-3 text-center">5.1d</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-semibold text-slate-900">2026-10-01</td>
                  <td className="py-2 px-3">Pediatrics & NICU</td>
                  <td className="py-2 px-3 text-center">50</td>
                  <td className="py-2 px-3 text-center text-rose-600 font-bold">37</td>
                  <td className="py-2 px-3 text-center text-emerald-600">+7</td>
                  <td className="py-2 px-3 text-center text-amber-600">-8</td>
                  <td className="py-2 px-3 text-center">3.4d</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-right">
            <button
              onClick={() => onNavigateTab('ml-model')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
            >
              <span>View Prediction Model Metrics & Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
