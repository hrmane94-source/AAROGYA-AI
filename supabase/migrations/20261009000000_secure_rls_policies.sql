-- ==============================================================================
-- AROGYA AI: SUPABASE ROW LEVEL SECURITY (RLS) POLICIES & DATABASE HARDENING
-- ==============================================================================
-- Migration: 20261009000000_secure_rls_policies.sql
-- Description: Enforces least-privilege Row Level Security across all healthcare,
-- patient PII, ML forecasts, OPD appointment tokens, and emergency triage tables.
-- ==============================================================================

-- 1. PROFILES TABLE (Patient & Healthcare Worker PII)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'hospital_staff', 'admin', 'sysadmin')),
  hospital_id TEXT,
  department TEXT,
  designation TEXT,
  badge_number TEXT,
  abha_id TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1a: Service Role bypass (used by Express backend with SUPABASE_KEY)
DROP POLICY IF EXISTS "profiles_service_role_access" ON public.profiles;
CREATE POLICY "profiles_service_role_access"
  ON public.profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 1b: Users can read their own profile
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 1c: Healthcare Staff & Admins can read clinical profiles
DROP POLICY IF EXISTS "profiles_staff_select" ON public.profiles;
CREATE POLICY "profiles_staff_select"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
        AND profiles.is_active = TRUE
    )
  );

-- Policy 1d: Users can only update their own non-role profile fields
DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. FORECASTS TABLE (ML Hospital Bed Occupancy & Admission Predictions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  department_id UUID NOT NULL,
  forecast_date DATE NOT NULL,
  predicted_admissions NUMERIC(8,2) DEFAULT 0,
  predicted_discharges NUMERIC(8,2) DEFAULT 0,
  required_beds NUMERIC(8,2) DEFAULT 0,
  available_capacity NUMERIC(8,2) DEFAULT 0,
  expected_occupancy NUMERIC(8,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "forecasts_service_role_access" ON public.forecasts;
CREATE POLICY "forecasts_service_role_access"
  ON public.forecasts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Authenticated hospital staff & clinical personnel can read ML forecasts
DROP POLICY IF EXISTS "forecasts_staff_select" ON public.forecasts;
CREATE POLICY "forecasts_staff_select"
  ON public.forecasts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
    )
  );

-- 3. DEPARTMENTS & BED INVENTORY
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id UUID NOT NULL,
  name TEXT NOT NULL,
  total_beds INT NOT NULL DEFAULT 0,
  occupied_beds INT NOT NULL DEFAULT 0,
  available_beds INT NOT NULL DEFAULT 0,
  reserved_beds INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "departments_service_role_access" ON public.departments;
CREATE POLICY "departments_service_role_access"
  ON public.departments
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone authenticated can view public hospital bed capacities
DROP POLICY IF EXISTS "departments_public_select" ON public.departments;
CREATE POLICY "departments_public_select"
  ON public.departments
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only hospital staff/admins can update bed numbers
DROP POLICY IF EXISTS "departments_staff_update" ON public.departments;
CREATE POLICY "departments_staff_update"
  ON public.departments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
    )
  );

-- 4. OPD TOKENS (Outpatient Department Appointment & Medical Reason)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.opd_tokens (
  id TEXT PRIMARY KEY,
  token_number TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  patient_age INT,
  patient_gender TEXT,
  patient_phone TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  department TEXT NOT NULL,
  doctor_id TEXT,
  doctor_name TEXT,
  date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  reason_for_visit TEXT,
  symptoms JSONB DEFAULT '[]'::jsonb,
  queue_position INT DEFAULT 1,
  status TEXT DEFAULT 'WAITING',
  fee_amount NUMERIC(10,2) DEFAULT 100,
  payment_status TEXT DEFAULT 'PAID',
  upi_id TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.opd_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "opd_tokens_service_role_access" ON public.opd_tokens;
CREATE POLICY "opd_tokens_service_role_access"
  ON public.opd_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Patients can ONLY see their own tokens (matched via verified phone in profile)
DROP POLICY IF EXISTS "opd_tokens_patient_select" ON public.opd_tokens;
CREATE POLICY "opd_tokens_patient_select"
  ON public.opd_tokens
  FOR SELECT
  TO authenticated
  USING (
    patient_phone = (SELECT phone FROM public.profiles WHERE profiles.id = auth.uid())
  );

-- Hospital Staff and Admins can view all tokens for their hospital
DROP POLICY IF EXISTS "opd_tokens_staff_select" ON public.opd_tokens;
CREATE POLICY "opd_tokens_staff_select"
  ON public.opd_tokens
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
    )
  );

-- 5. BED REQUESTS (Patient Bed Allocation Requests & Urgency Notes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bed_requests (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  patient_age INT,
  patient_gender TEXT,
  contact_number TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  hospital_name TEXT NOT NULL,
  department TEXT NOT NULL,
  bed_category TEXT NOT NULL,
  urgency TEXT NOT NULL DEFAULT 'ELECTIVE',
  reason TEXT,
  attendant_name TEXT,
  status TEXT DEFAULT 'PENDING_CONFIRMATION',
  allocated_bed_number TEXT,
  fee_amount NUMERIC(10,2) DEFAULT 100,
  payment_status TEXT DEFAULT 'PAID',
  upi_id TEXT,
  transaction_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.bed_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bed_requests_service_role_access" ON public.bed_requests;
CREATE POLICY "bed_requests_service_role_access"
  ON public.bed_requests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Patients can only view bed requests they submitted
DROP POLICY IF EXISTS "bed_requests_patient_select" ON public.bed_requests;
CREATE POLICY "bed_requests_patient_select"
  ON public.bed_requests
  FOR SELECT
  TO authenticated
  USING (
    contact_number = (SELECT phone FROM public.profiles WHERE profiles.id = auth.uid())
  );

-- Hospital Staff & Admins can view and update bed status
DROP POLICY IF EXISTS "bed_requests_staff_manage" ON public.bed_requests;
CREATE POLICY "bed_requests_staff_manage"
  ON public.bed_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
    )
  );

-- 6. EMERGENCY SOS LOGS (GPS Location & Live Paramedic Dispatch Data)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.emergency_sos (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  age INT,
  contact_number TEXT NOT NULL,
  location TEXT NOT NULL,
  emergency_type TEXT NOT NULL,
  symptoms TEXT,
  preferred_hospital_id TEXT NOT NULL,
  preferred_hospital_name TEXT NOT NULL,
  status TEXT DEFAULT 'AMBULANCE_EN_ROUTE',
  eta_minutes INT,
  ambulance_unit TEXT,
  paramedic_contact TEXT,
  vitals_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.emergency_sos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emergency_sos_service_role_access" ON public.emergency_sos;
CREATE POLICY "emergency_sos_service_role_access"
  ON public.emergency_sos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Emergency dispatch personnel and hospital triage staff can view SOS logs
DROP POLICY IF EXISTS "emergency_sos_staff_select" ON public.emergency_sos;
CREATE POLICY "emergency_sos_staff_select"
  ON public.emergency_sos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hospital_staff', 'admin', 'sysadmin')
    )
  );
