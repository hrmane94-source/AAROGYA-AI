import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  ChevronDown,
  Shield,
  User,
  Sparkles,
  RefreshCw,
  Clock,
  PhoneCall,
  Bed,
  CheckCircle2,
  Stethoscope,
  LogIn,
  LogOut,
  KeyRound
} from 'lucide-react';
import { UserRole, Hospital, AuthUser } from '../../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedHospital: Hospital;
  hospitals: Hospital[];
  onHospitalChange: (hospitalId: string) => void;
  onEmergencyClick: () => void;
  currentUser: AuthUser | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onQuickNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedHospital,
  hospitals,
  onHospitalChange,
  onEmergencyClick,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showHospMenu, setShowHospMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<UserRole, { label: string; sub: string; badge: string; icon: any }> = {
    admin: {
      label: 'Hospital Administrator',
      sub: 'Command Center & ML Forecasting',
      badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: Shield,
    },
    hospital_staff: {
      label: 'Hospital Staff / Bed Manager',
      sub: 'Live Operations & Bed Triage',
      badge: 'bg-teal-100 text-teal-800 border-teal-200',
      icon: Stethoscope,
    },
    sysadmin: {
      label: 'System Administrator',
      sub: 'Model Pipelines & Node Config',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: Activity,
    },
    patient: {
      label: 'Patient & Attendant Portal',
      sub: 'Find Beds, OPD Tokens & SOS',
      badge: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: User,
    },
  };

  const CurrentRoleIcon = roleLabels[currentRole].icon;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Notification / Demo Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            DEMO PROTOTYPE MODE
          </span>
          <span className="hidden md:inline text-slate-400">
            Simulated Hospital Dataset & ML Engine active for PS #16 • Predictive Bed Demand
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-slate-200">{timeStr}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>AI Model Engine: Online</span>
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-cyan-600 via-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight bg-linear-to-r from-slate-900 via-sky-900 to-indigo-900 bg-clip-text text-transparent">
                Arogya AI
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                PS #16
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
              Predictive Hospital Bed Management System
            </p>
          </div>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hospital Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowHospMenu(!showHospMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition"
              title="Switch Hospital Network Node"
            >
              <Building2 className="w-4 h-4 text-sky-600" />
              <span className="hidden md:inline max-w-[140px] truncate text-left font-semibold">
                {selectedHospital.name.split(' ')[0]} {selectedHospital.name.split(' ')[1] || ''}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showHospMenu && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs"
                onClick={() => setShowHospMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Hospital Node
                </div>
                {hospitals.map(h => (
                  <button
                    key={h.id}
                    onClick={() => onHospitalChange(h.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-start justify-between gap-2 transition ${
                      h.id === selectedHospital.id
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-medium text-slate-900">{h.name}</div>
                      <div className="text-[11px] text-slate-500">{h.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sky-600">{h.availableBeds}</span>
                      <span className="text-[10px] text-slate-400"> / {h.totalBeds} beds</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50/80 hover:bg-indigo-100/80 border border-indigo-200 text-xs font-semibold text-indigo-900 transition"
            >
              <CurrentRoleIcon className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">{roleLabels[currentRole].label}</span>
              <span className="lg:hidden">{currentRole === 'patient' ? 'Patient' : 'Staff/Admin'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch User Role & View
                </div>
                {(Object.keys(roleLabels) as UserRole[]).map(role => {
                  const item = roleLabels[role];
                  const Icon = item.icon;
                  const isActive = currentRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => onRoleChange(role)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition ${
                        isActive
                          ? 'bg-indigo-50 border border-indigo-200/80 text-indigo-950 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500 font-normal">{item.sub}</div>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Account / Login Button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition border border-slate-200/80"
                title="User Account & Security"
              >
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="hidden xl:inline max-w-[120px] truncate text-left">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2"
                  onClick={() => setShowUserMenu(false)}
                >
                  <div className="p-2 bg-slate-50 rounded-xl space-y-1">
                    <div className="font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-[11px] text-sky-700 font-semibold">{currentUser.designation}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
                    {currentUser.badgeNumber && (
                      <div className="text-[10px] text-indigo-700 font-mono font-bold">
                        Badge ID: {currentUser.badgeNumber}
                      </div>
                    )}
                  </div>

                  <div className="pt-1 space-y-1">
                    <button
                      onClick={onOpenLogin}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-2 transition"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                      <span>Switch Account / Re-login</span>
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Emergency SOS Button */}
          <button
            onClick={onEmergencyClick}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 fill-white text-rose-600" />
            <span>EMERGENCY</span>
          </button>
        </div>
      </div>
    </header>
  );
};
