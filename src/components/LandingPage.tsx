import React from 'react';
import {
  Activity,
  Bed,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Cpu,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  FileText
} from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onSelectRoleAndTab: (role: UserRole, tab: string) => void;
  onEmergencyClick: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectRoleAndTab,
  onEmergencyClick,
}) => {
  return (
    <div className="space-y-12 py-4 sm:py-8">
      {/* Hero Section (Prompt Requirement 24) */}
      <div className="bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-8 sm:p-14 shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto border border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-500/15 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem Statement #16 • Predictive Bed Management</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            Arogya AI
          </h1>

          <div className="text-2xl sm:text-3xl font-extrabold bg-linear-to-r from-cyan-300 via-sky-200 to-indigo-200 bg-clip-text text-transparent">
            Predict. Prepare. Provide.
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            AI-powered hospital bed management that helps healthcare teams anticipate demand before capacity becomes a problem.
          </p>

          {/* Central Workflow Graphic: Historical Data → AI Prediction → Future Bed Availability */}
          <div className="my-8 p-5 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-[11px] font-bold text-cyan-300 uppercase tracking-widest mb-3">
              Core ML Decision Loop
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center text-xs font-bold">
              <div className="p-3 bg-white/10 rounded-xl border border-white/10">
                <span className="text-xl block mb-1">💾</span>
                <span className="text-slate-200">Historical Hospital Data</span>
                <span className="text-[10px] text-slate-400 font-normal block">EHR, ALOS, Seasonality</span>
              </div>

              <div className="p-3 bg-cyan-500/20 rounded-xl border border-cyan-400/40 text-cyan-200">
                <span className="text-xl block mb-1">🧠</span>
                <span>AI Prediction Engine</span>
                <span className="text-[10px] text-cyan-300/80 font-normal block">Poisson Arrivals + XGBoost</span>
              </div>

              <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/40 text-emerald-200">
                <span className="text-xl block mb-1">🛏️</span>
                <span>Future Bed Availability</span>
                <span className="text-[10px] text-emerald-300/80 font-normal block">Early Warning & Mitigation</span>
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectRoleAndTab('admin', 'dashboard')}
              className="px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 text-xs font-black shadow-lg shadow-sky-500/30 transition flex items-center gap-2"
            >
              <Activity className="w-4 h-4" />
              <span>Explore Admin Dashboard</span>
            </button>

            <button
              onClick={() => onSelectRoleAndTab('patient', 'report-assistant')}
              className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 active:scale-95 text-slate-950 text-xs font-black shadow-lg shadow-teal-500/30 transition flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>AI Report Assistant & Voice</span>
            </button>

            <button
              onClick={() => onSelectRoleAndTab('patient', 'find-beds')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Bed className="w-4 h-4" />
              <span>Find Hospital Beds</span>
            </button>

            <button
              onClick={() => onSelectRoleAndTab('admin', 'login')}
              className="px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/30 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <span>🔑 Sign In / Switch Account</span>
            </button>

            <button
              onClick={onEmergencyClick}
              className="px-5 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-2 animate-pulse"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Emergency SOS</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Interactive Demo Persona Launchers for Evaluators */}
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-sky-700 uppercase tracking-widest">
            Prototype Evaluation Sandbox
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Select Your Perspective to Explore
          </h2>
          <p className="text-xs text-slate-500">
            Test the complete end-to-end bed demand forecasting and healthcare triage workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Persona 1: Hospital Administrator */}
          <div
            onClick={() => onSelectRoleAndTab('admin', 'dashboard')}
            className="bg-white hover:bg-sky-50/50 p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Command Center
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">
                Hospital Administrator
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Full predictive analytics, ICU shortage alerts, admission spike detection, and What-If simulator.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
              <span>Launch Admin Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Persona 2: Hospital Staff / Bed Manager */}
          <div
            onClick={() => onSelectRoleAndTab('hospital_staff', 'dashboard')}
            className="bg-white hover:bg-teal-50/50 p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                Live Operations
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">
                Hospital Staff / Bed Manager
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Live bed status updates, admit/discharge triggers, ward occupancy buffers, and OPD tokens.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-600 group-hover:text-teal-800">
              <span>Launch Staff View</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Persona 3: Patient Portal */}
          <div
            onClick={() => onSelectRoleAndTab('patient', 'find-beds')}
            className="bg-white hover:bg-cyan-50/50 p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bed className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-cyan-700 uppercase tracking-wider">
                Patient Services
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">
                Patient & Attendant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Find available beds, submit bed requests, reserve digital OPD tokens, and talk to AI Assistant.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-700 group-hover:text-cyan-900">
              <span>Launch Patient Portal</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Persona 4: AI Report Assistant */}
          <div
            onClick={() => onSelectRoleAndTab('patient', 'report-assistant')}
            className="bg-white hover:bg-teal-50/50 p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                Vision & Voice AI
              </span>
              <h3 className="font-extrabold text-slate-900 text-base mt-1">
                AI Report Assistant
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Scan medical documents, extract values with OCR, get plain summaries & listen in Hindi/Marathi/English.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-900">
              <span>Analyze Medical Report</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Persona 5: Emergency SOS */}
          <div
            onClick={onEmergencyClick}
            className="bg-linear-to-b from-rose-900 to-red-950 text-white p-6 rounded-3xl border border-rose-700 shadow-md cursor-pointer transition flex flex-col justify-between group"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform animate-pulse">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                Emergency Dispatch
              </span>
              <h3 className="font-extrabold text-white text-base mt-1">
                Emergency SOS & Triage
              </h3>
              <p className="text-xs text-rose-100/80 mt-1.5 leading-relaxed">
                1-tap emergency dispatch, trauma bay readiness notification, and nearest bed routing.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-xs font-bold text-rose-300 group-hover:text-white">
              <span>Trigger Emergency Flow</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
