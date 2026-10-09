import React, { useState, useEffect } from 'react';
import {
  Activity,
  Bed,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Building2,
  Calendar,
  Cpu,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  Home,
  MessageSquare,
  Ticket,
  Users,
  FileText,
  Database,
  ShieldAlert,
  Flame,
  Landmark
} from 'lucide-react';
import {
  UserRole,
  AuthUser,
  Hospital,
  BedCategory,
  ShortageAlert,
  AdmissionSpike,
  DischargeForecast,
  MLModelEvaluation,
  Doctor,
  OPDToken,
  BedRequest,
  EmergencySOSRequest
} from './types';
import {
  INITIAL_HOSPITALS,
  INITIAL_ADMISSION_SPIKE,
  INITIAL_DISCHARGE_FORECAST,
  INITIAL_ALERTS,
  INITIAL_ML_METRICS,
  INITIAL_DOCTORS,
  INITIAL_OPD_TOKENS,
  INITIAL_BED_REQUESTS,
  INITIAL_EMERGENCY_LOGS
} from './data/mockData';
import { Header } from './components/common/Header';
import { ArogyaLoginLandingPage } from './components/auth/ArogyaLoginLandingPage';
import { LandingPage } from './components/LandingPage';
import { DashboardOverview } from './components/admin/DashboardOverview';
import { MLPredictionSection } from './components/admin/MLPredictionSection';
import { AdmissionSpikeSection } from './components/admin/AdmissionSpikeSection';
import { DischargeForecastSection } from './components/admin/DischargeForecastSection';
import { BedAvailabilityForecastPage } from './components/admin/BedAvailabilityForecastPage';
import { ShortageAlertSystem } from './components/admin/ShortageAlertSystem';
import { WhatIfSimulator } from './components/admin/WhatIfSimulator';
import { HospitalMapView } from './components/admin/HospitalMapView';
import { HospitalDataManagement } from './components/admin/HospitalDataManagement';
import { MLModelSection } from './components/admin/MLModelSection';
import { ReportsAnalytics } from './components/admin/ReportsAnalytics';
import { FindAvailableBeds } from './components/patient/FindAvailableBeds';
import { OPDTokenBooking } from './components/patient/OPDTokenBooking';
import { DoctorDirectory } from './components/patient/DoctorDirectory';
import { EmergencyModule } from './components/patient/EmergencyModule';
import { AIAssistant } from './components/patient/AIAssistant';
import { AIReportAssistant } from './components/patient/AIReportAssistant';
import { MyBookings } from './components/patient/MyBookings';

export default function App() {
  // Global Application State
  const [currentRole, setCurrentRole] = useState<UserRole>('admin');
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('hosp-1');

  // Active Authenticated User
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'usr-admin-default',
    name: 'Dr. Vikram Malhotra',
    email: 'admin.vikram@arogya.health',
    phone: '9820188000',
    role: 'admin',
    hospitalId: 'hosp-1',
    hospitalName: 'Arogya Central Multi-Speciality Research Hospital',
    department: 'Hospital Administration & Chief Medical Office',
    designation: 'Chief Medical Officer & Administrator',
    badgeNumber: 'AROGYA-ADM-702',
    isLoggedIn: true,
  });

  // Dynamic Data States
  const [hospitals, setHospitals] = useState<Hospital[]>(INITIAL_HOSPITALS);
  const [alerts, setAlerts] = useState<ShortageAlert[]>(INITIAL_ALERTS);
  const [admissionSpike, setAdmissionSpike] = useState<AdmissionSpike>(INITIAL_ADMISSION_SPIKE);
  const [dischargeForecast, setDischargeForecast] = useState<DischargeForecast>(INITIAL_DISCHARGE_FORECAST);
  const [mlMetrics, setMlMetrics] = useState<MLModelEvaluation>(INITIAL_ML_METRICS);
  const [doctors, setDoctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [opdTokens, setOpdTokens] = useState<OPDToken[]>(INITIAL_OPD_TOKENS);
  const [bedRequests, setBedRequests] = useState<BedRequest[]>(INITIAL_BED_REQUESTS);
  const [emergencyLogs, setEmergencyLogs] = useState<EmergencySOSRequest[]>(INITIAL_EMERGENCY_LOGS);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];

  // Check active server session on mount (restores authenticated cookie session)
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          setCurrentRole(data.user.role);
          if (data.user.hospitalId) {
            setSelectedHospitalId(data.user.hospitalId);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    setSelectedHospitalId(user.hospitalId);
    if (user.role === 'patient') {
      setActiveTab('report-assistant');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    setCurrentUser(null);
    setActiveTab('login');
  };

  // Live Bed Management Update handler
  const handleUpdateBed = async (
    bedCategoryId: string,
    occDelta: number,
    resDelta: number,
    availDelta?: number
  ) => {
    try {
      const res = await fetch(`/api/hospitals/${selectedHospital.id}/update-bed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bedCategoryId, occupiedDelta: occDelta, reservedDelta: resDelta, availableDelta: availDelta }),
      });

      if (res.ok) {
        const data = await res.json();
        setHospitals(prev => prev.map(h => (h.id === data.hospital.id ? data.hospital : h)));
      } else {
        // Fallback local update
        setHospitals(prev =>
          prev.map(h => {
            if (h.id !== selectedHospital.id) return h;
            const updatedCats = h.bedCategories.map(cat => {
              if (cat.id !== bedCategoryId) return cat;
              const newOcc = Math.max(0, Math.min(cat.total, cat.occupied + occDelta));
              const newAvail = Math.max(0, cat.total - newOcc - cat.reserved);
              const occRate = Math.round((newOcc / cat.total) * 1000) / 10;
              return {
                ...cat,
                occupied: newOcc,
                available: newAvail,
                occupancyRate: occRate,
                status: (occRate >= 90 ? 'Danger' : occRate >= 80 ? 'Warning' : 'Normal') as any,
                lastUpdated: 'Just now',
              };
            });
            const totOcc = updatedCats.reduce((a, c) => a + c.occupied, 0);
            const totAvail = updatedCats.reduce((a, c) => a + c.available, 0);
            const hospRate = Math.round((totOcc / h.totalBeds) * 1000) / 10;
            return {
              ...h,
              bedCategories: updatedCats,
              occupiedBeds: totOcc,
              availableBeds: totAvail,
              occupancyRate: hospRate,
              lastUpdated: 'Just now',
            };
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Alert Action Handler
  const handleAlertAction = (
    alertId: string,
    action: 'REVIEW' | 'ASSIGN' | 'RESOLVE',
    staffName?: string,
    note?: string
  ) => {
    setAlerts(prev =>
      prev.map(a => {
        if (a.id !== alertId) return a;
        return {
          ...a,
          status: action === 'REVIEW' ? 'REVIEWED' : action === 'ASSIGN' ? 'ASSIGNED' : 'RESOLVED',
          assignedStaff: staffName || a.assignedStaff,
          actionTaken: note || a.actionTaken,
        };
      })
    );
  };

  // Book OPD Token Handler
  const handleBookOPDToken = async (tokenData: any): Promise<OPDToken> => {
    try {
      const res = await fetch('/api/opd/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tokenData),
      });
      const data = await res.json();
      if (data.token) {
        setOpdTokens(prev => [data.token, ...prev]);
        return data.token;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackToken: OPDToken = {
      id: `tok-${Date.now()}`,
      tokenNumber: `T-${Math.floor(100 + Math.random() * 900)}`,
      patientName: tokenData.patientName,
      patientAge: tokenData.patientAge,
      patientGender: tokenData.patientGender,
      patientPhone: tokenData.patientPhone,
      hospitalId: tokenData.hospitalId,
      hospitalName: tokenData.hospitalName,
      department: tokenData.department,
      doctorId: tokenData.doctorId,
      doctorName: tokenData.doctorName,
      date: tokenData.date,
      timeSlot: tokenData.timeSlot,
      reasonForVisit: tokenData.reasonForVisit,
      symptoms: tokenData.symptoms,
      queuePosition: opdTokens.length + 1,
      estimatedWaitMins: (opdTokens.length + 1) * 10,
      status: 'WAITING',
      qrCodeHash: `AROGYA-OPD-${Date.now()}`,
      createdAt: new Date().toISOString(),
      priority: 'REGULAR',
      feeAmount: tokenData.feeAmount || 100,
      paymentStatus: tokenData.paymentStatus || 'PAID',
      upiId: tokenData.upiId || 'ajinkya70280@okicici',
      transactionRef: tokenData.transactionRef || `UPI-AJI-${Date.now().toString().slice(-6)}`,
      paymentTime: tokenData.paymentTime || new Date().toISOString(),
    };
    setOpdTokens(prev => [fallbackToken, ...prev]);
    return fallbackToken;
  };

  // Bed Request Submission Handler
  const handleRequestBed = async (
    reqData: Omit<BedRequest, 'id' | 'status' | 'submittedAt' | 'updatedAt'>
  ) => {
    try {
      const res = await fetch('/api/beds/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqData),
      });
      const data = await res.json();
      if (data.request) {
        setBedRequests(prev => [data.request, ...prev]);
        return;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackReq: BedRequest = {
      ...reqData,
      id: `req-${Date.now()}`,
      status: 'PENDING_CONFIRMATION',
      feeAmount: reqData.feeAmount || 100,
      paymentStatus: reqData.paymentStatus || 'PAID',
      upiId: reqData.upiId || 'ajinkya70280@okicici',
      transactionRef: reqData.transactionRef || `BED-UPI-${Date.now().toString().slice(-6)}`,
      paymentTime: reqData.paymentTime || new Date().toISOString(),
      submittedAt: 'Just now',
      updatedAt: 'Just now',
    };
    setBedRequests(prev => [fallbackReq, ...prev]);
  };

  // Emergency SOS Trigger Handler
  const handleTriggerSOS = async (sosData: any): Promise<EmergencySOSRequest> => {
    try {
      const res = await fetch('/api/emergency/sos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sosData),
      });
      const data = await res.json();
      if (data.sos) {
        setEmergencyLogs(prev => [data.sos, ...prev]);
        return data.sos;
      }
    } catch (e) {
      console.error(e);
    }

    const fallbackSOS: EmergencySOSRequest = {
      ...sosData,
      id: `sos-${Date.now()}`,
      timestamp: 'Just now',
      status: 'AMBULANCE_EN_ROUTE',
      etaMinutes: 5,
      ambulanceUnit: 'ALS-Unit #14',
      paramedicContact: '+91 98200 11999',
      vitalsNote: 'Emergency Triage Dispatched. Trauma team alerted.',
    };
    setEmergencyLogs(prev => [fallbackSOS, ...prev]);
    return fallbackSOS;
  };

  interface NavTabItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }

  // Navigation tabs for Admin (Prompt Requirement 22)
  const adminNavTabs: NavTabItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'prediction', label: 'AI Predictions', icon: Sparkles },
    { id: 'forecast-graph', label: 'Availability Forecast', icon: TrendingUp },
    { id: 'spike-detection', label: 'Admission Spike', icon: Flame },
    { id: 'discharge-forecast', label: 'Discharge Forecast', icon: Calendar },
    { id: 'alerts', label: 'Shortage Alerts', icon: ShieldAlert, badge: alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length },
    { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'hospital-map', label: 'Hospital Overview', icon: Building2 },
    { id: 'hospital-data', label: 'Hospital Data', icon: Database },
    { id: 'ml-model', label: 'Prediction Model', icon: Cpu },
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'analytics', label: 'Analytics & Reports', icon: FileText },
    { id: 'doctors-opd', label: 'Doctors & OPD', icon: Stethoscope },
  ];

  // Navigation tabs for Staff
  const staffNavTabs: NavTabItem[] = [
    { id: 'dashboard', label: 'Live Bed Operations', icon: Bed },
    { id: 'alerts', label: 'Shortage Alerts', icon: ShieldAlert },
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'what-if', label: 'What-If Simulator', icon: SlidersHorizontal },
    { id: 'doctors-opd', label: 'Doctors & OPD Queue', icon: Stethoscope },
  ];

  // Navigation tabs for Patient (Prompt Requirement 22)
  const patientNavTabs: NavTabItem[] = [
    { id: 'report-assistant', label: 'AI Report Assistant', icon: FileText },
    { id: 'find-beds', label: 'Find Available Beds', icon: Bed },
    { id: 'book-opd', label: 'Book OPD Token', icon: Ticket },
    { id: 'find-doctor', label: 'Find a Doctor', icon: Stethoscope },
    { id: 'emergency', label: '🚨 Emergency SOS', icon: AlertTriangle },
    { id: 'ai-assistant', label: 'AI Health Assistant', icon: Sparkles },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar, badge: opdTokens.length + bedRequests.length },
  ];

  const currentNavTabs = currentRole === 'patient'
    ? patientNavTabs
    : currentRole === 'hospital_staff'
    ? staffNavTabs
    : adminNavTabs;

  // Dedicated Full-Widescreen Government Healthcare AI Login Landing Page
  if (activeTab === 'login') {
    return (
      <ArogyaLoginLandingPage
        hospitals={hospitals}
        onLoginSuccess={handleLoginSuccess}
        onExploreDemo={() => setActiveTab('dashboard')}
        onOpenReportAssistant={() => {
          setCurrentRole('patient');
          setActiveTab('report-assistant');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Universal Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={role => {
          setCurrentRole(role);
          if (role === 'patient') {
            setActiveTab('find-beds');
          } else {
            setActiveTab('dashboard');
          }
        }}
        selectedHospital={selectedHospital}
        hospitals={hospitals}
        onHospitalChange={id => setSelectedHospitalId(id)}
        onEmergencyClick={() => {
          setCurrentRole('patient');
          setActiveTab('emergency');
        }}
        currentUser={currentUser}
        onOpenLogin={() => setActiveTab('login')}
        onLogout={handleLogout}
      />

      {/* Sub-Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-2xs sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar">
            {/* Landing Home Tab */}
            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                activeTab === 'landing'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            {/* Gov Portal Login Tab */}
            <button
              onClick={() => setActiveTab('login')}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 shadow-2xs"
              title="Open Arogya AI Government Portal Login Landing Page"
            >
              <Landmark className="w-3.5 h-3.5 text-sky-600" />
              <span>Gov Portal Login</span>
            </button>

            <span className="text-slate-300 mx-1">|</span>

            {/* Role-Specific Tabs */}
            {currentNavTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 relative ${
                    isActive
                      ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      isActive ? 'bg-white text-sky-900' : 'bg-rose-500 text-white animate-pulse'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* LANDING PAGE */}
        {activeTab === 'landing' && (
          <LandingPage
            onSelectRoleAndTab={(role, tab) => {
              setCurrentRole(role);
              setActiveTab(tab);
            }}
            onEmergencyClick={() => {
              setCurrentRole('patient');
              setActiveTab('emergency');
            }}
          />
        )}

        {/* ADMIN & STAFF VIEWS */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            hospital={selectedHospital}
            onUpdateBed={handleUpdateBed}
            onNavigateTab={tab => setActiveTab(tab)}
            spikeAlert={admissionSpike}
            alerts={alerts}
            isStaffRole={currentRole === 'hospital_staff'}
          />
        )}

        {activeTab === 'prediction' && (
          <MLPredictionSection
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'forecast-graph' && (
          <BedAvailabilityForecastPage
            hospital={selectedHospital}
            hospitals={hospitals}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'spike-detection' && (
          <AdmissionSpikeSection
            spike={admissionSpike}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'discharge-forecast' && (
          <DischargeForecastSection
            forecast={dischargeForecast}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'alerts' && (
          <ShortageAlertSystem
            alerts={alerts}
            onAlertAction={handleAlertAction}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'what-if' && <WhatIfSimulator />}

        {activeTab === 'hospital-map' && (
          <HospitalMapView
            hospital={selectedHospital}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'hospital-data' && (
          <HospitalDataManagement
            onRetrainSuccess={() => {
              setMlMetrics(prev => ({
                ...prev,
                lastUpdated: 'Just now (Retrained)',
                mae: 1.98,
                rmse: 2.85,
                mape: 4.41,
                r2Score: 0.958,
              }));
            }}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'ml-model' && (
          <MLModelSection
            metrics={mlMetrics}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'analytics' && (
          <ReportsAnalytics hospital={selectedHospital} />
        )}

        {activeTab === 'doctors-opd' && (
          <div className="space-y-6">
            <DoctorDirectory
              doctors={doctors}
              onSelectDoctorToBook={doc => {
                setCurrentRole('patient');
                setActiveTab('book-opd');
              }}
            />
          </div>
        )}

        {/* PATIENT & REPORT VIEWS */}
        {activeTab === 'report-assistant' && (
          <AIReportAssistant
            onEmergencyClick={() => setActiveTab('emergency')}
            onNavigateTab={tab => setActiveTab(tab)}
            patientName={currentUser?.role === 'patient' ? (currentUser.name.replace(/\s*\(.*?\)/, '').trim() || 'Suhani Shambwani') : 'Suhani Shambwani'}
          />
        )}

        {activeTab === 'find-beds' && (
          <FindAvailableBeds
            hospitals={hospitals}
            onRequestBed={handleRequestBed}
            onEmergencyClick={() => setActiveTab('emergency')}
          />
        )}

        {activeTab === 'book-opd' && (
          <OPDTokenBooking
            hospitals={hospitals}
            doctors={doctors}
            onBookToken={handleBookOPDToken}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'find-doctor' && (
          <DoctorDirectory
            doctors={doctors}
            onSelectDoctorToBook={doc => setActiveTab('book-opd')}
          />
        )}

        {activeTab === 'emergency' && (
          <EmergencyModule
            hospitals={hospitals}
            onTriggerSOS={handleTriggerSOS}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistant
            onEmergencyClick={() => setActiveTab('emergency')}
            onNavigateTab={tab => setActiveTab(tab)}
            patientName={currentUser?.role === 'patient' ? (currentUser.name.replace(/\s*\(.*?\)/, '').trim() || 'Suhani Shambwani') : 'Suhani Shambwani'}
          />
        )}

        {activeTab === 'my-bookings' && (
          <MyBookings
            tokens={opdTokens}
            bedRequests={bedRequests}
            onNavigateTab={tab => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Hospital Command Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-200">Arogya AI • Healthcare Operations</div>
              <div className="text-[11px] text-slate-500">PS #16 Predictive Hospital Bed Management System</div>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] text-slate-500">
            <div>Predict. Prepare. Provide. • Multi-Hospital Telemetry & ML Forecasting Engine</div>
            <div className="text-slate-600 mt-0.5">Prototype Demonstration Environment • Never use simulated data for clinical emergency triage without physical verification</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
