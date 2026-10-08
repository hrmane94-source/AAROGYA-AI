import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Brain,
  Shield,
  User,
  Stethoscope,
  Building,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Smartphone,
  Database,
  Check,
  Activity,
  Heart,
  Landmark,
  Sparkles,
  Zap,
  FileText,
  Volume2,
  UploadCloud
} from 'lucide-react';
import hospitalCampusImg from '../../assets/images/hospital_campus_bg_1791432957328.jpg';
import { UserRole, AuthUser, Hospital } from '../../types';

interface ArogyaLoginLandingPageProps {
  hospitals?: Hospital[];
  onLoginSuccess: (user: AuthUser) => void;
  onExploreDemo?: () => void;
  onOpenReportAssistant?: () => void;
}

export const ArogyaLoginLandingPage: React.FC<ArogyaLoginLandingPageProps> = ({
  hospitals = [],
  onLoginSuccess,
  onExploreDemo,
  onOpenReportAssistant,
}) => {
  // Role selection state (Patient selected by default per prompt specification)
  const [selectedRole, setSelectedRole] = useState<'patient' | 'doctor' | 'staff'>('patient');

  // Login method toggle: 'login' | 'otp'
  const [loginMethod, setLoginMethod] = useState<'login' | 'otp'>('login');

  // Form states
  const [identifier, setIdentifier] = useState<string>('patient.demo@arogya.gov.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [otpPhone, setOtpPhone] = useState<string>('+91 98201 44552');
  const [otpCode, setOtpCode] = useState<string>('884210');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showOtpSentBanner, setShowOtpSentBanner] = useState<boolean>(false);

  // When role changes, pre-fill representative credentials for smooth demo
  const handleRoleSelect = (role: 'patient' | 'doctor' | 'staff') => {
    setSelectedRole(role);
    if (role === 'patient') {
      setIdentifier('patient.demo@arogya.gov.in');
      setPassword('Patient@Arogya2026');
      setOtpPhone('+91 98201 44552');
    } else if (role === 'doctor') {
      setIdentifier('dr.malhotra@arogya.gov.in');
      setPassword('Doctor@Arogya2026');
      setOtpPhone('+91 98201 88000');
    } else {
      setIdentifier('staff.opd@arogya.gov.in');
      setPassword('Staff@Arogya2026');
      setOtpPhone('+91 98112 44331');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const targetRole: UserRole =
        selectedRole === 'doctor'
          ? 'admin'
          : selectedRole === 'staff'
          ? 'hospital_staff'
          : 'patient';

      const userName =
        selectedRole === 'doctor'
          ? 'Dr. Vikram Malhotra (Senior Consultant)'
          : selectedRole === 'staff'
          ? 'Anjali Nair (Hospital Queue Staff)'
          : 'Suhani Shambwani (Patient)';

      const user: AuthUser = {
        id: `user-${selectedRole}-${Date.now()}`,
        name: userName,
        email: identifier.includes('@') ? identifier : `${identifier}@arogya.gov.in`,
        phone: otpPhone,
        role: targetRole,
        hospitalId: hospitals[0]?.id || 'hosp-1',
        hospitalName: hospitals[0]?.name || 'Government District Hospital & Medical College',
        department:
          selectedRole === 'doctor'
            ? 'Cardiology & Outpatient Medicine'
            : selectedRole === 'staff'
            ? 'OPD Central Registration & Bed Triage'
            : 'Outpatient Care',
        designation:
          selectedRole === 'doctor'
            ? 'Senior Medical Officer'
            : selectedRole === 'staff'
            ? 'OPD & Bed Allocation Staff'
            : 'Ayushman Registered Citizen',
        badgeNumber: selectedRole !== 'patient' ? `GOV-MED-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
        abhaId: selectedRole === 'patient' ? '91-4421-8890-1234' : undefined,
        isLoggedIn: true,
      };

      onLoginSuccess(user);
    }, 500);
  };

  return (
    <div className="relative min-h-screen w-full bg-linear-to-b from-slate-50 via-sky-50/40 to-indigo-50/30 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* BACKGROUND DECORATIVE ELEMENTS: Translucent soft sky/cyan curves, glowing highlights, soft medical lines */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large translucent sky curved shape top-left */}
        <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full bg-linear-to-br from-sky-200/35 via-cyan-100/25 to-transparent blur-3xl" />

        {/* Large translucent indigo curved shape center */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-linear-to-tr from-indigo-200/20 via-sky-100/15 to-transparent blur-3xl" />

        {/* Soft glowing cyan/sky highlight behind login panel */}
        <div className="absolute top-20 right-10 w-[550px] h-[650px] rounded-full bg-linear-to-bl from-sky-200/40 via-cyan-100/30 to-transparent blur-2xl" />

        {/* Botanical leaf silhouette corner top-right */}
        <svg
          className="absolute top-0 right-0 w-64 h-64 text-sky-600/5 -translate-y-12 translate-x-12 rotate-45"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 0 C20 30, 0 60, 20 90 C50 70, 70 50, 50 0 Z" />
          <path d="M50 0 C70 30, 90 60, 70 90 C50 70, 30 50, 50 0 Z" />
        </svg>

        {/* Botanical leaf silhouette corner bottom-left */}
        <svg
          className="absolute bottom-16 left-0 w-80 h-80 text-sky-600/5 -translate-x-20 translate-y-10"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M0 50 C30 20, 60 0, 90 20 C70 50, 50 70, 0 50 Z" />
          <path d="M0 50 C30 70, 60 90, 90 70 C70 50, 50 30, 0 50 Z" />
        </svg>

        {/* Soft background medical ECG lines */}
        <svg
          className="absolute top-1/2 left-0 w-full h-32 opacity-20 stroke-sky-500 fill-none"
          viewBox="0 0 1200 120"
        >
          <path
            d="M0,60 L280,60 L295,45 L310,75 L325,10 L340,110 L355,50 L370,68 L385,60 L780,60 L795,45 L810,75 L825,10 L840,110 L855,50 L870,68 L885,60 L1200,60"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* MAIN CONTAINER (16:9 Widescreen Desktop Proportion Friendly ~1536px Canvas) */}
      <div className="relative z-10 w-full max-w-[1536px] mx-auto px-6 sm:px-10 lg:px-12 pt-5 pb-8 flex-1 flex flex-col justify-between">
        {/* ============================================================== */}
        {/* HEADER                                                         */}
        {/* ============================================================== */}
        <header className="w-full flex items-center justify-between pb-4 border-b border-slate-200">
          {/* Top-left: Arogya AI logo with heart outline containing ECG heartbeat line */}
          <div className="flex items-center gap-3.5">
            {/* Heart outline with ECG line inside */}
            <div className="relative w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md border border-sky-300 shadow-sm shadow-sky-500/15 flex items-center justify-center p-2 text-sky-600 transition hover:scale-105">
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-sky-600 stroke-current fill-none stroke-[2]"
              >
                {/* Heart outline */}
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* ECG Heartbeat line passing through center */}
                <path
                  d="M3 11 h4 l2 -3 l2 6 l2 -4 l1.5 2 h6.5"
                  className="stroke-cyan-500 stroke-[2]"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Subtle cyan pulse glow */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-cyan-200/60 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  Arogya AI
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 text-[10px] font-extrabold uppercase tracking-wider border border-sky-300/60">
                  National Health Portal
                </span>
              </div>
              <p className="text-[11px] font-semibold tracking-wide text-sky-700">
                Smart Care | Smarter Tomorrow
              </p>
            </div>
          </div>

          {/* Top-right: Government-style building icon & text */}
          <div className="flex items-center gap-3 sm:gap-4 text-right">
            <div className="hidden sm:block">
              <div className="text-xs font-black text-slate-900 tracking-tight">
                Government Hospital
              </div>
              <div className="text-[11px] font-semibold text-sky-800">
                Smart Appointment & Queue System
              </div>
              <div className="w-full h-px bg-sky-200/80 my-0.5" />
              <div className="text-[10px] font-medium text-slate-500 italic">
                For a Healthier Tomorrow
              </div>
            </div>

            {/* Government-style building icon */}
            <div className="w-11 h-11 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-center text-sky-700">
              <Landmark className="w-6 h-6 stroke-[1.8]" />
            </div>

            {onOpenReportAssistant && (
              <button
                type="button"
                onClick={onOpenReportAssistant}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 text-xs font-bold border border-sky-200 transition hover:scale-105 active:scale-95"
                title="Open AI Report Assistant (Voice & Vision OCR)"
              >
                <FileText className="w-3.5 h-3.5 text-sky-600" />
                <span>AI Report Assistant</span>
              </button>
            )}

            {onExploreDemo && (
              <button
                type="button"
                onClick={onExploreDemo}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/10 transition hover:scale-105 active:scale-95"
                title="Explore Hospital Management System Directly"
              >
                <span>Live System Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* ============================================================== */}
        {/* MAIN BODY: LEFT HERO SECTION + RIGHT LOGIN PANEL               */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center my-6 lg:my-8">
          {/* ------------------------------------------------------------ */}
          {/* LEFT HERO SECTION (Approx 55% Width on Desktop)              */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-7 relative">
            {/* Large Headline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100/80 text-sky-900 text-xs font-bold border border-sky-300/60 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Next-Gen Smart Healthcare Infrastructure</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Better Healthcare <br />
                with <span className="text-sky-600 underline decoration-sky-300 decoration-wavy decoration-2">AI</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed pt-1">
                Book appointments, manage queues, <br className="hidden sm:inline" />
                and get quality care — faster and easier.
              </p>
            </div>

            {/* Four Feature Cards / Icons Horizontally */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  Online Appointments
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Book & manage your visits
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  Live Queue Tracking
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Know your turn in real-time
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-2.5 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                  <Brain className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  AI Assisted Routing
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Right care, right time
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 rounded-2xl bg-white/85 backdrop-blur-md border border-slate-200/80 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  Secure & Safe
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-snug">
                  Your health data is protected
                </div>
              </div>
            </div>

            {/* REALISTIC MODERN GOVERNMENT HOSPITAL CAMPUS WITH ATMOSPHERIC GRADIENT & FLOATING LIVE QUEUE CARD */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-md min-h-[220px] sm:min-h-[250px] flex flex-col justify-end p-5 group">
              {/* Hospital Campus Image (Contemporary architecture, trees, greenery, large entrance, medical cross) */}
              <img
                src={hospitalCampusImg}
                alt="Modern Government Hospital Campus with greenery and medical cross"
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Soft atmospheric gradient overlay over hospital image for readability */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-50/95 via-sky-50/75 to-slate-50/35 backdrop-blur-[1px]" />
              <div className="absolute inset-0 bg-linear-to-r from-white/80 via-transparent to-transparent" />

              {/* FLOATING GLASSMORPHISM "LIVE QUEUE" CARD NEAR BOTTOM CENTER-LEFT */}
              <div className="relative z-10 max-w-sm rounded-2xl bg-white/90 backdrop-blur-md p-4 border border-sky-300/80 shadow-lg shadow-sky-950/10 transition-all hover:scale-[1.02]">
                {/* Subtle glowing ECG heartbeat line around queue card */}
                <div className="absolute -inset-0.5 rounded-2xl bg-linear-to-r from-cyan-400 via-sky-400 to-indigo-500 opacity-25 blur-xs pointer-events-none" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>Live Queue</span>
                        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                      </div>
                      <div className="text-sm font-extrabold text-sky-700 font-mono">
                        Token No. A034
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase">
                      Est. Waiting Time
                    </div>
                    <div className="text-base font-black text-slate-900 font-mono">
                      18 mins
                    </div>
                  </div>
                </div>

                {/* Bed Management Tag with glowing ECG mini line */}
                <div className="relative mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md border border-sky-200">
                    Bed management
                  </span>

                  {/* Subtle glowing mini ECG heartbeat line */}
                  <svg className="w-24 h-4 stroke-sky-600 fill-none" viewBox="0 0 100 20">
                    <path
                      d="M0,10 L30,10 L35,4 L40,16 L45,2 L50,18 L55,10 L100,10"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Lower-left handwritten text & government initiative badge */}
              <div className="relative z-10 mt-4 flex flex-wrap items-end justify-between gap-3">
                {/* Elegant handwritten text */}
                <div className="font-['Caveat',cursive] text-2xl sm:text-3xl font-bold text-sky-900 leading-tight tracking-wide drop-shadow-xs">
                  “Healthy People <br />
                  Stronger Communities”
                </div>

                {/* Bottom-left: Heart/ECG icon, Powered by AI | Government Initiative */}
                <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 text-xs shadow-xs font-semibold text-slate-700">
                  <Heart className="w-3.5 h-3.5 text-sky-600 fill-sky-100" />
                  <span className="text-slate-900 font-bold">Powered by AI</span>
                  <span className="h-3 w-px bg-slate-300" />
                  <span className="text-sky-700">Government Initiative</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT LOGIN PANEL (Approx 45% Width on Desktop)             */}
          {/* Large white/off-white rounded rectangle card                */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[28px] p-6 sm:p-8 border border-slate-200/90 shadow-2xl shadow-slate-950/10 space-y-5 relative">
              {/* Subtle top inner glow */}
              <div className="absolute top-0 left-10 right-10 h-1 bg-linear-to-r from-transparent via-sky-400 to-transparent rounded-full opacity-60" />

              {/* Top of Card: Arogya AI heart + ECG logo, Arogya AI, Welcome Back, Choose your role... */}
              <div className="text-center space-y-1">
                {/* Heart + ECG logo icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-50 border border-sky-300/80 shadow-xs mb-1">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-7 h-7 text-sky-600 stroke-current fill-none stroke-[2]"
                  >
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M3 11 h4 l2 -3 l2 6 l2 -4 l1.5 2 h6.5"
                      className="stroke-cyan-600 stroke-[2.2]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="text-sm font-extrabold uppercase tracking-wider text-sky-700">
                  Arogya AI
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Choose your role and login to continue
                </p>
              </div>

              {/* ROLE SELECTION: Three horizontally arranged rounded cards (Patient selected by default) */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Role
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {/* 1. Patient */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('patient')}
                    className={`p-2.5 rounded-2xl text-left transition flex flex-col justify-between ${
                      selectedRole === 'patient'
                        ? 'bg-sky-50/90 border-2 border-sky-600 shadow-md shadow-sky-500/20 ring-2 ring-sky-300/40'
                        : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      {selectedRole === 'patient' && (
                        <span className="w-2 h-2 rounded-full bg-sky-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        Patient
                      </div>
                      <div className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                        Book, track and manage your appointments
                      </div>
                    </div>
                  </button>

                  {/* 2. Doctor */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('doctor')}
                    className={`p-2.5 rounded-2xl text-left transition flex flex-col justify-between ${
                      selectedRole === 'doctor'
                        ? 'bg-indigo-50/90 border-2 border-indigo-600 shadow-md shadow-indigo-500/20 ring-2 ring-indigo-300/40'
                        : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                        <Stethoscope className="w-4 h-4" />
                      </div>
                      {selectedRole === 'doctor' && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        Doctor
                      </div>
                      <div className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                        View patients, manage appointments & records
                      </div>
                    </div>
                  </button>

                  {/* 3. Hospital Staff */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('staff')}
                    className={`p-2.5 rounded-2xl text-left transition flex flex-col justify-between ${
                      selectedRole === 'staff'
                        ? 'bg-cyan-50/90 border-2 border-cyan-600 shadow-md shadow-cyan-500/20 ring-2 ring-cyan-300/40'
                        : 'bg-slate-50/80 hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      {selectedRole === 'staff' && (
                        <span className="w-2 h-2 rounded-full bg-cyan-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 leading-tight">
                        Hospital Staff
                      </div>
                      <div className="text-[9px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                        Handle queues, OPD & hospital operations
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* LOGIN METHOD TOGGLE: Two-section pill toggle (Login vs OTP Login) */}
              <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center">
                <button
                  type="button"
                  onClick={() => setLoginMethod('login')}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    loginMethod === 'login'
                      ? 'bg-linear-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('otp');
                    setShowOtpSentBanner(true);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    loginMethod === 'otp'
                      ? 'bg-linear-to-r from-cyan-600 via-sky-600 to-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>OTP Login</span>
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                {loginMethod === 'login' ? (
                  <>
                    {/* Input 1: Envelope icon, Mobile Number / Email, small helper text */}
                    <div>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Mobile Number / Email"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-1">
                        Enter your registered mobile number or email ID
                      </p>
                    </div>

                    {/* Input 2: Lock icon, Password, Eye visibility icon */}
                    <div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Password"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* OTP Login Alternative View */
                  <div className="space-y-3">
                    <div>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={otpPhone}
                          onChange={(e) => setOtpPhone(e.target.value)}
                          placeholder="Mobile Number (10 digits)"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 pl-1">
                        6-digit one-time code will be sent via government SMS gateway
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit OTP (Demo: 884210)"
                        className="w-full px-4 py-2.5 bg-slate-50/90 border border-slate-200 rounded-2xl text-xs font-mono font-bold tracking-widest text-slate-900 text-center focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Below: Checkbox Remember me | Forgot password? */}
                <div className="flex items-center justify-between pt-0.5 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 accent-sky-600"
                    />
                    <span className="font-medium text-[11px]">Remember me</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => alert('Password reset verification link has been sent to your registered email.')}
                    className="text-[11px] font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* PRIMARY BUTTON: Large rounded button: Arrow icon “Login” */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl bg-linear-to-r from-cyan-600 via-sky-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700 active:scale-[0.99] text-white font-extrabold text-sm shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? 'Authenticating...' : 'Login'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Below: small “OR” divider */}
                <div className="relative flex items-center justify-center my-2">
                  <div className="w-full border-t border-slate-200" />
                  <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                {/* SECONDARY BUTTON: Outlined button: OTP/phone icon “Login with OTP” */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(loginMethod === 'login' ? 'otp' : 'login');
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-sky-50/60 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Smartphone className="w-4 h-4 text-sky-600" />
                  <span>{loginMethod === 'login' ? 'Login with OTP' : 'Login with Password'}</span>
                </button>

                {/* BOTTOM OF LOGIN CARD: “New here?” “Create an account →” */}
                <div className="text-center pt-2 text-xs text-slate-500">
                  <span>New here? </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleRoleSelect('patient');
                      handleLoginSubmit({ preventDefault: () => {} } as any);
                    }}
                    className="font-bold text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    Create an account →
                  </button>
                </div>

                {/* Quick 1-Click Evaluation Logins */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>⚡ Quick Demo Logins</span>
                    <span className="text-[9px] text-sky-600 font-medium">Instant Access</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('patient');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 50);
                      }}
                      className="py-1 px-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200 transition truncate"
                      title="Login immediately as Patient (Suhani Shambwani)"
                    >
                      👤 Patient
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('doctor');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 50);
                      }}
                      className="py-1 px-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200 transition truncate"
                      title="Login immediately as Doctor (Dr. Vikram Malhotra)"
                    >
                      🩺 Doctor
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRoleSelect('staff');
                        setTimeout(() => handleLoginSubmit({ preventDefault: () => {} } as any), 50);
                      }}
                      className="py-1 px-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-300 transition truncate"
                      title="Login immediately as Hospital Staff (Anjali Nair)"
                    >
                      🏥 Staff
                    </button>
                  </div>
                </div>

                {/* AI Health Report Assistant Spotlight */}
                {onOpenReportAssistant && (
                  <div className="mt-3 p-2.5 rounded-xl bg-linear-to-r from-sky-50 to-indigo-50/60 border border-sky-200/80 flex items-center justify-between gap-2 text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[11px] font-extrabold text-slate-900 flex items-center gap-1">
                          <span>AI Report Assistant</span>
                          <span className="text-[9px] px-1 rounded bg-sky-200 text-sky-800 font-bold">New</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Upload report • Voice narration & short summary
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenReportAssistant}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-sky-600 hover:text-white border border-sky-300 text-sky-800 text-[10px] font-bold transition shadow-xs shrink-0 flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Try Voice</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* BOTTOM FOOTER: Deep Navy/Slate horizontal strip matching theme */}
      {/* ============================================================== */}
      <footer className="w-full bg-slate-950 text-slate-300 py-3.5 px-6 sm:px-10 lg:px-12 z-20 border-t border-slate-800 shadow-inner">
        <div className="max-w-[1536px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          {/* Left: Lock icon Encrypted Healthcare Data | Divider | Shield icon Role-based Access | Divider | Database icon Secure & Reliable */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-300 font-medium">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Encrypted Healthcare Data</span>
            </div>

            <span className="hidden sm:inline w-px h-3.5 bg-slate-800" />

            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Role-based Access</span>
            </div>

            <span className="hidden sm:inline w-px h-3.5 bg-slate-800" />

            <div className="flex items-center gap-1.5">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Secure & Reliable</span>
            </div>
          </div>

          {/* Bottom-right handwritten-style text: “Arogya AI — Care Beyond Technology” with small ECG line */}
          <div className="flex items-center gap-2 text-slate-200">
            <span className="font-['Caveat',cursive] text-lg sm:text-xl font-bold tracking-wide text-white drop-shadow-xs">
              Arogya AI — Care Beyond Technology
            </span>

            {/* Small ECG line */}
            <svg className="w-12 h-3.5 stroke-cyan-400 fill-none" viewBox="0 0 60 20">
              <path
                d="M0,10 L18,10 L22,4 L26,16 L30,2 L34,18 L38,10 L60,10"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </footer>
    </div>
  );
};
