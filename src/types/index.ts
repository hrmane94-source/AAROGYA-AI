export type UserRole = 'patient' | 'hospital_staff' | 'admin' | 'sysadmin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  hospitalId: string;
  hospitalName: string;
  department?: string;
  designation?: string;
  badgeNumber?: string;
  abhaId?: string;
  avatarUrl?: string;
  isLoggedIn: boolean;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';

export type BedStatus = 'Normal' | 'Warning' | 'Danger';

export interface DepartmentBedInfo {
  id: string;
  name: string;
  icon: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  emergencyBuffer: number;
  avgStayDays: number;
  predictedDemand: number;
  riskLevel: RiskLevel;
  occupancyRate: number;
}

export interface BedCategory {
  id: string;
  name: string;
  departmentId: string;
  departmentName: string;
  total: number;
  occupied: number;
  reserved: number;
  available: number;
  emergencyBuffer: number;
  status: BedStatus;
  occupancyRate: number;
  lastUpdated: string;
  wing: string;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  rating: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  reservedBeds: number;
  emergencyBeds: number;
  occupancyRate: number;
  acceptingRequests: boolean;
  emergencyActive: boolean;
  departments: DepartmentBedInfo[];
  bedCategories: BedCategory[];
  lastUpdated: string;
}

export interface PredictionSummary {
  horizon: '24h' | '3d' | '7d' | '30d';
  bedType: string;
  department: string;
  currentAvailable: number;
  predictedAdmissions: number;
  predictedDischarges: number;
  expectedAvailable: number;
  predictedOccupancy: number;
  riskLevel: RiskLevel;
  confidenceLower: number;
  confidenceUpper: number;
  lastUpdated: string;
  notes: string;
}

export interface AdmissionSpike {
  id: string;
  department: string;
  expectedDailyAdmissions: number;
  predictedTomorrow: number;
  percentIncrease: number;
  expectedDate: string;
  confidenceRange: [number, number];
  severity: RiskLevel;
  primaryDrivers: string[];
  suggestedActions: string[];
  isMitigated: boolean;
}

export interface DepartmentDischarge {
  department: string;
  count: number;
  alosDays: number;
  expectedTurnaroundHours: number;
}

export interface DischargeForecast {
  expectedToday: number;
  expectedTomorrow: number;
  expectedThisWeek: number;
  confidenceScore: number;
  departmentBreakdown: DepartmentDischarge[];
  peakDischargeHour: string;
  dischargeVelocityIndex: number;
}

export interface ForecastTimePoint {
  date: string;
  dayName: string;
  historicalAvailable?: number;
  currentAvailable?: number;
  predictedAvailable: number;
  lowerConfidence: number;
  upperConfidence: number;
  admissions: number;
  discharges: number;
  occupancyPercent: number;
  riskLevel: RiskLevel;
}

export interface ShortageAlert {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  department: string;
  bedCategory: string;
  severity: AlertSeverity;
  predictedTimeframe: string;
  currentOccupancyPercent: number;
  predictedOccupancyPercent: number;
  status: 'UNREVIEWED' | 'REVIEWED' | 'ASSIGNED' | 'RESOLVED';
  assignedStaff?: string;
  actionTaken?: string;
}

export interface WhatIfScenario {
  id: string;
  name: string;
  deltaAdmissionsPercent: number;
  deltaDischargesPercent: number;
  additionalBeds: number;
  emergencySurgeFactor: number;
  simulatedAvailable: number;
  simulatedOccupancy: number;
  simulatedRisk: RiskLevel;
  bottleneckDepartment: string;
  criticalBedCount: number;
  timestamp: string;
}

export interface Doctor {
  id: string;
  name: string;
  qualification: string;
  specialization: string;
  department: string;
  experienceYears: number;
  hospitalId: string;
  hospitalName: string;
  availableTime: string;
  fee: number;
  rating: number;
  opdTokensAvailable: number;
  avatarUrl: string;
  languages: string[];
  nextAvailableSlot: string;
}

export interface OPDToken {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  reasonForVisit: string;
  symptoms: string[];
  queuePosition: number;
  estimatedWaitMins: number;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  qrCodeHash: string;
  createdAt: string;
  priority: 'REGULAR' | 'SENIOR' | 'EMERGENCY_TRIAGE';
}

export interface BedRequest {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: 'Male' | 'Female' | 'Other';
  contactNumber: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  bedCategory: string;
  urgency: 'CRITICAL_EMERGENCY' | 'URGENT' | 'ELECTIVE';
  reason: string;
  notes?: string;
  attendantName: string;
  status: 'PENDING_CONFIRMATION' | 'APPROVED' | 'BED_ALLOCATED' | 'REJECTED';
  allocatedBedNumber?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface EmergencySOSRequest {
  id: string;
  patientName: string;
  age: number;
  contactNumber: string;
  location: string;
  emergencyType: 'Accident' | 'Breathing difficulty' | 'Chest pain' | 'Severe bleeding' | 'Unconsciousness' | 'Other';
  symptoms: string;
  preferredHospitalId?: string;
  preferredHospitalName?: string;
  timestamp: string;
  status: 'DISPATCHED' | 'TRIAGED' | 'AMBULANCE_EN_ROUTE' | 'ARRIVED_AT_ER';
  etaMinutes: number;
  ambulanceUnit: string;
  paramedicContact: string;
  vitalsNote?: string;
}

export interface MLModelEvaluation {
  modelName: string;
  version: string;
  status: 'ACTIVE' | 'RETRAINING' | 'EVALUATING';
  trainingHorizon: string;
  lastUpdated: string;
  mae: number;
  rmse: number;
  mape: number;
  r2Score: number;
  sampleSize: string;
  algorithmType: string;
  featureImportance: { feature: string; importance: number; description: string }[];
  pipelineSteps: {
    id: number;
    step: string;
    description: string;
    status: 'COMPLETED' | 'ACTIVE' | 'QUEUED';
    timestamp: string;
  }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  isEmergencyAlert?: boolean;
}

export interface AbnormalReportValue {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'HIGH' | 'LOW' | 'CRITICAL' | 'BORDERLINE';
  simpleExplanation: string;
  recommendation?: string;
}

export interface NormalReportValue {
  testName: string;
  value: string;
  unit: string;
  referenceRange: string;
  simpleExplanation: string;
}

export interface MedicalTermExplanation {
  term: string;
  simpleMeaning: string;
  whyItMatters: string;
}

export interface MedicalReportAnalysis {
  id: string;
  fileName: string;
  imageUrl?: string;
  reportType: string;
  patientName?: string;
  reportDate?: string;
  labOrHospital?: string;
  overallSummary: string;
  spokenSummary: string;
  spokenSummaryHi?: string;
  spokenSummaryMr?: string;
  keyObservations: string[];
  abnormalValues: AbnormalReportValue[];
  normalValues: NormalReportValue[];
  importantDatesAndNumbers: { label: string; value: string }[];
  termExplanations: MedicalTermExplanation[];
  doctorDiscussionQuestions: string[];
  disclaimer: string;
  analyzedAt: string;
}

export interface SampleReportTemplate {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  sampleImageUrl: string;
  mockAnalysis: MedicalReportAnalysis;
}

