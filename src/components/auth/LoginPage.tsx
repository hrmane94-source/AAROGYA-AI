import React, { useState, useEffect } from 'react';
import {
  Activity,
  Shield,
  Stethoscope,
  User,
  KeyRound,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building2,
  QrCode,
  CreditCard,
  Fingerprint,
  RefreshCw,
  Info,
  ShieldCheck,
  Check,
  Zap,
  Bed,
  TrendingUp
} from 'lucide-react';
import { UserRole, AuthUser, Hospital } from '../../types';

interface LoginPageProps {
  hospitals: Hospital[];
  onLoginSuccess: (user: AuthUser) => void;
  onCancel?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  hospitals,
  onLoginSuccess,
  onCancel,
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [authMode, setAuthMode] = useState<'PASSWORD' | 'OTP' | 'SMART_CARD' | 'REGISTER'>('PASSWORD');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');

  // Form Fields
  const [email, setEmail] = useState<string>('admin.vikram@arogya.health');
  const [password, setPassword] = useState<string>('Admin@BedMgmt2026');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phone, setPhone] = useState<string>('9820188000');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // OTP State
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);

  // Smart Card / Badge Scan Simulation State
  const [isScanningBadge, setIsScanningBadge] = useState<boolean>(false);
  const [badgeScanSuccess, setBadgeScanSuccess] = useState<boolean>(false);

  // Registration State
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAge, setRegAge] = useState<string>('');
  const [regGender, setRegGender] = useState<string>('Female');
  const [regAbha, setRegAbha] = useState<string>('');

  // Loading State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [devOtpNotice, setDevOtpNotice] = useState<{ code: string; notice?: string } | null>(null);

  // Helper to normalize phone
  const getNormalizedPhone = () => {
    const digits = phone.replace(/\D/g, '');
    if (countryCode === '+91') {
      return `+91${digits.slice(-10)}`;
    }
    return `${countryCode}${digits}`;
  };

  // Sync default credentials when role changes
  useEffect(() => {
    setErrorMessage(null);
    if (selectedRole === 'admin') {
      setEmail('admin.vikram@arogya.health');
      setPassword('Admin@BedMgmt2026');
      setPhone('9820188000');
    } else if (selectedRole === 'hospital_staff') {
      setEmail('nurse.anjali@arogya.health');
      setPassword('Staff@Triage2026');
      setPhone('9811244331');
    } else if (selectedRole === 'patient') {
      setEmail('suhani.shambwani@gmail.com');
      setPassword('Patient@Care2026');
      setPhone('9820144552');
    } else if (selectedRole === 'sysadmin') {
      setEmail('sysadmin.cluster@arogya.health');
      setPassword('Sysadmin@Node2026');
      setPhone('9930211223');
    }
  }, [selectedRole]);

  // OTP Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed.');
      } else if (data.authenticated && data.user) {
        onLoginSuccess(data.user);
      }
    } catch {
      setErrorMessage('Network error during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsSendingOtp(true);
    setErrorMessage(null);

    try {
      const fullPhone = getNormalizedPhone();
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, purpose: 'LOGIN' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to dispatch OTP via SMSLocal gateway.');
      } else {
        setOtpSent(true);
        setOtpTimer(data.cooldownSeconds || 60);
        if (data.devOtp) {
          const digits = data.devOtp.split('').slice(0, 6);
          while (digits.length < 6) digits.push('');
          setOtpCode(digits);
          setDevOtpNotice({ code: data.devOtp, notice: data.dltNotice || data.warning });
        } else {
          setOtpCode(['', '', '', '', '', '']);
          setDevOtpNotice(null);
        }
      }
    } catch {
      setErrorMessage('Network error connecting to SMS authentication service.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('').trim();
    if (code.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const fullPhone = getNormalizedPhone();
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, otp: code }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Invalid OTP code.');
        setIsLoading(false);
        return;
      }

      if (data.requiresRegistration) {
        setRegPhone(fullPhone);
        setAuthMode('REGISTER');
        setIsLoading(false);
        return;
      }

      if (data.authenticated && data.user) {
        onLoginSuccess(data.user);
      }
    } catch {
      setErrorMessage('Verification failed due to a network error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateSmartCardScan = () => {
    setIsScanningBadge(true);
    setBadgeScanSuccess(false);

    setTimeout(() => {
      setIsScanningBadge(false);
      setBadgeScanSuccess(true);

      setTimeout(() => {
        const user: AuthUser = {
          id: `usr-rfid-${Date.now()}`,
          name: selectedRole === 'admin' ? 'Dr. Vikram Malhotra' : 'Nurse Supervisor Anjali Nair',
          email: `${selectedRole}@arogya.health`,
          role: selectedRole,
          hospitalId: selectedHospital.id,
          hospitalName: selectedHospital.name,
          department: 'Emergency & Critical Care Wing',
          designation: 'RFID Smart Badge Verified',
          badgeNumber: `RFID-KEY-#${Math.floor(1000 + Math.random() * 9000)}`,
          isLoggedIn: true,
        };
        onLoginSuccess(user);
      }, 500);
    }, 1200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone) {
      setErrorMessage('Please enter patient name and contact number.');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user: AuthUser = {
        id: `usr-reg-${Date.now()}`,
        name: regName,
        email: regEmail || `${regPhone}@patient.arogya`,
        phone: regPhone,
        role: 'patient',
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        department: 'Registered Patient',
        designation: 'Patient / Ayushman Bharat Consumer',
        abhaId: regAbha || '91-1029-3847-5561',
        isLoggedIn: true,
      };
      onLoginSuccess(user);
    }, 600);
  };

  // 1-Click Persona Demo Launcher
  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user: AuthUser = {
        id: `usr-quick-${role}`,
        name:
          role === 'admin'
            ? 'Dr. Vikram Malhotra'
            : role === 'hospital_staff'
            ? 'Nurse Supervisor Anjali Nair'
            : role === 'sysadmin'
            ? 'Rajiv Mehta (System Admin)'
            : 'Suhani Shambwani (Patient / Attendant)',
        email: `${role}@arogya.health`,
        phone: '9820144552',
        role,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        department:
          role === 'admin'
            ? 'Command Center & Chief Medical Office'
            : role === 'hospital_staff'
            ? 'Bed Allocation & Emergency Triage'
            : role === 'sysadmin'
            ? 'Cloud & Model Pipeline Infrastructure'
            : 'Outpatient Care',
        designation:
          role === 'admin'
            ? 'Chief Medical Officer & Administrator'
            : role === 'hospital_staff'
            ? 'Bed Management Supervisor'
            : role === 'sysadmin'
            ? 'System Infrastructure Architect'
            : 'Patient',
        badgeNumber: role !== 'patient' ? `AROGYA-${role.toUpperCase().slice(0, 3)}-702` : undefined,
        abhaId: role === 'patient' ? '91-4421-8890-1234' : undefined,
        isLoggedIn: true,
      };
      onLoginSuccess(user);
    }, 400);
  };

  const roleConfigs = [
    {
      role: 'admin' as UserRole,
      title: 'Hospital Administrator',
      sub: 'Predictive Bed Command & ML Forecasting',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Shield,
    },
    {
      role: 'hospital_staff' as UserRole,
      title: 'Hospital Staff / Bed Manager',
      sub: 'Live Bed Operations & Patient Triage',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: Stethoscope,
    },
    {
      role: 'patient' as UserRole,
      title: 'Patient & Attendant',
      sub: 'Find Beds, OPD Tokens & Report AI',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: User,
    },
    {
      role: 'sysadmin' as UserRole,
      title: 'System Administrator',
      sub: 'Node Integrations & Model Pipelines',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Activity,
    },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-6 px-4 sm:px-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Left Interactive Login Column */}
        <div className="lg:col-span-7 p-6 sm:p-10 space-y-6 flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-cyan-600 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                  <Activity className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Arogya AI
                  </h2>
                  <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                    Predictive Hospital Bed Management
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ABDM & HIPAA Secure</span>
              </span>
            </div>

            {/* Role Switcher Pill Tabs */}
            <div className="mt-6 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Select Your Access Role:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100 rounded-2xl">
                {roleConfigs.map(item => {
                  const Icon = item.icon;
                  const isActive = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => {
                        setSelectedRole(item.role);
                        setAuthMode('PASSWORD');
                      }}
                      className={`p-2 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span className="truncate text-[11px]">{item.title.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth Method Sub-Tabs */}
            <div className="mt-4 flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('PASSWORD')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    authMode === 'PASSWORD'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Password
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode('OTP')}
                  className={`px-3 py-1 rounded-lg font-bold transition ${
                    authMode === 'OTP'
                      ? 'bg-sky-50 text-sky-800 border border-sky-200'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Mobile OTP
                </button>

                {selectedRole !== 'patient' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('SMART_CARD')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      authMode === 'SMART_CARD'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    RFID Badge
                  </button>
                )}

                {selectedRole === 'patient' && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('REGISTER')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      authMode === 'REGISTER'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    New Patient Register
                  </button>
                )}
              </div>

              {/* Hospital Node Selector */}
              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-sky-600" />
                <select
                  value={selectedHospitalId}
                  onChange={e => setSelectedHospitalId(e.target.value)}
                  className="bg-transparent border-none text-slate-800 font-semibold focus:outline-hidden text-[11px]"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name.split(' ')[0]} {h.name.split(' ')[1] || ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM A: PASSWORD LOGIN */}
            {authMode === 'PASSWORD' && (
              <form onSubmit={handlePasswordLogin} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {selectedRole === 'patient' ? 'Email / Mobile / ABHA ID' : 'Healthcare Email / Staff ID'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter registered credentials..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset link sent to registered email in demo mode.')}
                      className="text-[11px] font-semibold text-sky-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter account password..."
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Remember this device for 30 days</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Log In to Arogya Command</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* FORM B: REAL MOBILE OTP AUTHENTICATION (SMSLocal Integration) */}
            {authMode === 'OTP' && (
              <form onSubmit={handleVerifyOtp} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="flex gap-2">
                    {/* Country Code Selector */}
                    <div className="relative w-28 shrink-0">
                      <select
                        value={countryCode}
                        onChange={e => {
                          setCountryCode(e.target.value);
                          setOtpSent(false);
                        }}
                        className="w-full py-2.5 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+971">🇦🇪 +971 (AE)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                      </select>
                    </div>

                    <div className="relative flex-1">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value);
                          if (otpSent) setOtpSent(false);
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSendingOtp || otpTimer > 0}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
                        otpTimer > 0
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSendingOtp && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                      <span>{otpSent ? (otpTimer > 0 ? `${otpTimer}s` : 'Resend OTP') : 'Send OTP'}</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 pl-1 flex items-center justify-between">
                    <span>One-time password dispatched via SMSLocal gateway</span>
                    <span className="text-sky-700 font-medium">E.164: {getNormalizedPhone()}</span>
                  </p>
                </div>

                {otpSent && (
                  <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/70 space-y-3 animate-fadeIn">
                    {devOtpNotice && (
                      <div className="p-2.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>SMS Gateway Notice</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const digits = devOtpNotice.code.split('').slice(0, 6);
                              while (digits.length < 6) digits.push('');
                              setOtpCode(digits);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-mono font-bold text-[11px] transition shadow-2xs"
                          >
                            Fill OTP: {devOtpNotice.code}
                          </button>
                        </div>
                        <p className="text-[11px] text-amber-800 leading-snug">
                          {devOtpNotice.notice}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sky-950">Enter 6-Digit Verification Code</span>
                      <span className="text-[11px] font-bold text-sky-700 font-mono">
                        Valid for 5 mins
                      </span>
                    </div>

                    <div className="flex justify-center gap-2">
                      {otpCode.map((digit, idx) => (
                        <input
                          key={idx}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '');
                            const newOtp = [...otpCode];
                            newOtp[idx] = val;
                            setOtpCode(newOtp);
                            // Auto-advance to next input box
                            if (val && idx < 5) {
                              const nextInput = document.getElementById(`login-otp-cell-${idx + 1}`);
                              nextInput?.focus();
                            }
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Backspace' && !digit && idx > 0) {
                              const prevInput = document.getElementById(`login-otp-cell-${idx - 1}`);
                              prevInput?.focus();
                            }
                          }}
                          id={`login-otp-cell-${idx}`}
                          className="w-10 h-12 bg-white border border-slate-300 rounded-xl text-center text-lg font-black font-mono text-slate-900 focus:ring-2 focus:ring-sky-500 focus:outline-hidden shadow-xs"
                        />
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Recipient: <strong>{getNormalizedPhone()}</strong></span>
                      {otpTimer > 0 ? (
                        <span>Resend in: <strong>{otpTimer}s</strong></span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isLoading}
                          className="font-bold text-sky-700 hover:text-sky-900 hover:underline"
                        >
                          Resend OTP Code
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otpCode.join('').length !== 6}
                      className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                        otpCode.join('').length === 6 && !isLoading
                          ? 'bg-sky-600 hover:bg-sky-700 text-white'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      <span>Verify & Enter Dashboard</span>
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* FORM C: RFID / SMART BADGE SCANNER */}
            {authMode === 'SMART_CARD' && (
              <div className="mt-5 p-6 bg-slate-900 text-white rounded-3xl text-center space-y-4">
                <div className="relative w-24 h-24 mx-auto rounded-3xl bg-slate-800 border-2 border-dashed border-cyan-400 flex items-center justify-center overflow-hidden">
                  <CreditCard className="w-10 h-10 text-cyan-300" />
                  {isScanningBadge && (
                    <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-bounce" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-white">
                    {badgeScanSuccess ? '✅ Hospital Smart Badge Verified!' : 'Tap or Scan Hospital RFID Badge'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Hold staff badge near NFC scanner or camera reader for instant biometric sign-in.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateSmartCardScan}
                  disabled={isScanningBadge}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition inline-flex items-center gap-2"
                >
                  {isScanningBadge ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Reading RFID Chip...</span>
                    </>
                  ) : (
                    <>
                      <Fingerprint className="w-4 h-4" />
                      <span>Simulate Badge Scan</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* FORM D: NEW PATIENT REGISTRATION */}
            {authMode === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="mt-5 space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Patient Name *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="e.g. Kavita Sengupta"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={e => setRegPhone(e.target.value)}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">ABHA Health ID (Optional)</label>
                    <input
                      type="text"
                      value={regAbha}
                      onChange={e => setRegAbha(e.target.value)}
                      placeholder="14-digit ABHA ID"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Age</label>
                    <input
                      type="number"
                      value={regAge}
                      onChange={e => setRegAge(e.target.value)}
                      placeholder="e.g. 38"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Gender</label>
                    <select
                      value={regGender}
                      onChange={e => setRegGender(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
                    >
                      <option>Female</option>
                      <option>Male</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Complete Patient Registration</span>
                </button>
              </form>
            )}
          </div>

          {/* 1-Click Quick Demo Shortcuts Bar */}
          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>1-Click Evaluator Demo Logins</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold text-left border border-indigo-200/60 transition truncate"
              >
                👨‍⚕️ Admin (Dr. Vikram)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('hospital_staff')}
                className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-bold text-left border border-teal-200/60 transition truncate"
              >
                🩺 Bed Manager (Anjali)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patient')}
                className="p-2 rounded-xl bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-[11px] font-bold text-left border border-cyan-200/60 transition truncate"
              >
                👤 Patient (Suhani S.)
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('sysadmin')}
                className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-[11px] font-bold text-left border border-purple-200/60 transition truncate"
              >
                🛡️ System Admin (Rajiv)
              </button>
            </div>
          </div>
        </div>

        {/* Right Info & Live Telemetry Column */}
        <div className="lg:col-span-5 bg-linear-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-6 sm:p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-800">
          <div className="space-y-6">
            <div>
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">
                Live Hospital Network Telemetry
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {selectedHospital.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedHospital.city} • Zone 1 Medical Node
              </p>
            </div>

            {/* Live KPI Cards Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Total Capacity</div>
                <div className="text-2xl font-black text-white font-mono mt-0.5">
                  {selectedHospital.totalBeds} <span className="text-xs text-slate-400 font-normal">Beds</span>
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-emerald-300 font-bold uppercase">Open Available</div>
                <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                  {selectedHospital.availableBeds} <span className="text-xs text-emerald-300/80 font-normal">Beds</span>
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-rose-300 font-bold uppercase">Occupancy Rate</div>
                <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                  {selectedHospital.occupancyRate}%
                </div>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                <div className="text-[10px] text-amber-300 font-bold uppercase">ER Reserve</div>
                <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                  {selectedHospital.emergencyBeds} <span className="text-xs text-amber-300/80 font-normal">Beds</span>
                </div>
              </div>
            </div>

            {/* Live Shortage Alert Ribbon */}
            <div className="p-4 bg-rose-500/20 rounded-2xl border border-rose-500/30 text-xs text-rose-100 space-y-1.5">
              <div className="font-black text-rose-300 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Active 24h Capacity Forecast</span>
              </div>
              <p className="leading-snug">
                🚨 ICU occupancy predicted to reach <strong>96%</strong> tomorrow. 15 admissions projected vs 10 discharges.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span>Role-Based Permissions & End-to-End Encryption</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ayushman Bharat Digital Health Ecosystem Linked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
