import React, { useState } from 'react';
import {
  Ticket,
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  QrCode,
  CheckCircle2,
  ArrowRight,
  User,
  Sparkles,
  Printer,
  Download,
  Info,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Hospital, Doctor, OPDToken } from '../../types';
import {
  UPIPaymentModal,
  UPIPaymentDetails,
  NOMINAL_FEE,
  UPI_ID
} from '../common/UPIPaymentModal';

interface OPDTokenBookingProps {
  hospitals: Hospital[];
  doctors: Doctor[];
  onBookToken: (tokenData: any) => Promise<OPDToken>;
  onNavigateTab: (tab: string) => void;
}

export const OPDTokenBooking: React.FC<OPDTokenBookingProps> = ({
  hospitals,
  doctors,
  onBookToken,
  onNavigateTab,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('Cardiology & CCU');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-03');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('11:00 AM - 11:30 AM');

  // Patient inputs
  const [patientName, setPatientName] = useState<string>('');
  const [patientAge, setPatientAge] = useState<string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [symptomsInput, setSymptomsInput] = useState<string>('');

  const [generatedToken, setGeneratedToken] = useState<OPDToken | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const filteredDoctors = doctors.filter(d =>
    d.hospitalId === selectedHospitalId || selectedHospitalId === 'hosp-1'
  );
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId) || filteredDoctors[0] || doctors[0];

  const handleOpenPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !patientPhone) return;
    setShowPaymentModal(true);
  };

  const handlePaymentCompleted = async (paymentDetails: UPIPaymentDetails) => {
    setShowPaymentModal(false);
    setIsSubmitting(true);

    const symptomsList = symptomsInput
      ? symptomsInput.split(',').map(s => s.trim()).filter(Boolean)
      : ['General Consultation'];

    const tokenPayload = {
      patientName,
      patientAge: Number(patientAge) || 32,
      patientGender,
      patientPhone,
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.name,
      department: selectedDepartment,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      reasonForVisit: reasonForVisit || 'Routine Clinical Follow-up',
      symptoms: symptomsList,
      priority: 'REGULAR',
      feeAmount: paymentDetails.feeAmount,
      paymentStatus: 'PAID',
      upiId: paymentDetails.upiId,
      transactionRef: paymentDetails.transactionRef,
      paymentTime: paymentDetails.paymentTime,
    };

    try {
      const created = await onBookToken(tokenPayload);
      setGeneratedToken(created);
      setStep(4); // Success Pass Step
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-teal-900 via-sky-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Ticket className="w-3.5 h-3.5" />
            <span>Digital Outpatient Queue</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Book Digital OPD Token
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Reserve your consultation slot with hospital doctors, track live queue wait times, and receive a verified digital token pass.
          </p>

          <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/15 text-xs text-slate-200 flex items-center gap-2.5">
            <Info className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>Arogya AI facilitates queue scheduling and symptom organization. We do not provide medical diagnosis.</span>
          </div>
        </div>
      </div>

      {/* Step Wizard Bar (Hidden if Token Generated) */}
      {!generatedToken && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 ${step >= 1 ? 'text-sky-700 font-black' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>1</span>
            <span>Hospital & Dept</span>
          </button>
          <span className="text-slate-300">→</span>
          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 ${step >= 2 ? 'text-sky-700 font-black' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>2</span>
            <span>Doctor & Time</span>
          </button>
          <span className="text-slate-300">→</span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 ${step >= 3 ? 'text-sky-700 font-black' : 'text-slate-400'}`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-200'}`}>3</span>
            <span>Patient & Symptoms</span>
          </button>
        </div>
      )}

      {/* STEP 1: Select Hospital & Department */}
      {step === 1 && !generatedToken && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Step 1: Choose Hospital & Department
            </h3>
            <p className="text-xs text-slate-500">
              Select your preferred healthcare facility and clinical specialty.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Hospital:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospitals.map(h => (
                  <div
                    key={h.id}
                    onClick={() => setSelectedHospitalId(h.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      selectedHospitalId === h.id
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="font-bold text-slate-900 text-xs">{h.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{h.city}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Clinical Department:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'General Medicine',
                  'Cardiology & CCU',
                  'Pediatrics & NICU',
                  'Orthopedics & Spine',
                  'ICU / Critical Care',
                  'General Surgery',
                  'Pulmonology',
                  'Emergency & Trauma',
                ].map(dept => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => setSelectedDepartment(dept)}
                    className={`p-3 rounded-xl text-xs font-bold border text-left transition ${
                      selectedDepartment === dept
                        ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>Next: Select Doctor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Doctor & Slot */}
      {step === 2 && !generatedToken && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Step 2: Select Doctor & Appointment Slot
            </h3>
            <p className="text-xs text-slate-500">
              Choose an available specialist and consultation time.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">
                Available Specialists:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDoctors.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3.5 ${
                      selectedDoctorId === doc.id
                        ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <img
                      src={doc.avatarUrl}
                      alt={doc.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900 text-xs truncate">{doc.name}</div>
                      <div className="text-[11px] text-sky-700 font-medium truncate">{doc.specialization}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {doc.experienceYears} yrs exp • ₹{doc.fee} fee • {doc.availableTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Consultation Date:
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Available Time Slot:
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={e => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                >
                  <option>09:30 AM - 10:00 AM</option>
                  <option>10:30 AM - 11:00 AM</option>
                  <option>11:00 AM - 11:30 AM</option>
                  <option>12:00 PM - 12:30 PM</option>
                  <option>02:00 PM - 02:30 PM</option>
                  <option>03:30 PM - 04:00 PM</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>Next: Patient Info & Symptoms</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Patient Details & Reason for Visit */}
      {step === 3 && !generatedToken && (
        <form onSubmit={handleOpenPayment} className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Step 3: Patient Information & Visit Reason
              </h3>
              <p className="text-xs text-slate-500">
                Provide basic patient details and reason for consultation to help the doctor prepare.
              </p>
            </div>
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-3.5 py-2 text-right">
              <span className="text-[10px] text-teal-800 uppercase block font-bold">Nominal Confirmation Fee</span>
              <span className="text-lg font-black text-teal-900 font-mono">₹{NOMINAL_FEE}</span>
              <span className="text-[10px] text-teal-700 block">via UPI (100% Adjustable)</span>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Patient Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Suhani Shambwani"
                  value={patientName}
                  onChange={e => setPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contact Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98XXX XXXXX"
                  value={patientPhone}
                  onChange={e => setPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={patientAge}
                  onChange={e => setPatientAge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={e => setPatientGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                >
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Prompt Requirement 13: Ask "What is the reason for your visit?" */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                What is the reason for your visit? *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Describe your symptoms, disease name, existing condition, or reason for consultation..."
                value={reasonForVisit}
                onChange={e => setReasonForVisit(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Specific Symptoms (comma separated):
              </label>
              <input
                type="text"
                placeholder="e.g. Mild headache, fever for 3 days, throat pain"
                value={symptomsInput}
                onChange={e => setSymptomsInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            {/* Fee Adjustment & Anti-Spam Notice */}
            <div className="p-3.5 bg-linear-to-r from-teal-50 to-sky-50 rounded-2xl border border-teal-200/80 text-[11px] text-teal-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-teal-900">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Nominal ₹{NOMINAL_FEE} UPI Confirmation Policy:</span>
              </div>
              <p className="leading-relaxed text-slate-600">
                To guarantee your queue slot with <strong>{selectedDoctor.name}</strong>, a nominal verification fee of <strong>₹{NOMINAL_FEE}</strong> is paid via UPI to <strong>{UPI_ID}</strong>. The entire ₹{NOMINAL_FEE} is adjusted against the doctor&apos;s consultation fee (₹{selectedDoctor.fee}), leaving only <strong>₹{Math.max(0, selectedDoctor.fee - NOMINAL_FEE)}</strong> payable upon arrival.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-2"
            >
              <Ticket className="w-4 h-4" />
              <span>Proceed to Pay ₹{NOMINAL_FEE} & Confirm Token</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Digital OPD Token Pass Generated (Prompt Requirement 13) */}
      {generatedToken && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              Digital OPD Token Confirmed!
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Please present this pass at the hospital OPD registration desk or scan the QR code.
            </p>
          </div>

          {/* Token Card Graphic */}
          <div className="max-w-md mx-auto bg-linear-to-b from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-2xl border border-slate-700 relative overflow-hidden">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-widest">
                  Arogya AI • Digital OPD Pass
                </span>
                <div className="text-base font-black text-white mt-1">
                  {generatedToken.hospitalName}
                </div>
                <div className="text-xs text-slate-300">{generatedToken.department}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Token Number</span>
                <span className="text-3xl font-black text-cyan-300 font-mono">
                  {generatedToken.tokenNumber}
                </span>
              </div>
            </div>

            {/* Token Details */}
            <div className="my-5 grid grid-cols-2 gap-y-3 gap-x-4 text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Patient Name</span>
                <strong className="text-white text-sm">{generatedToken.patientName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Consulting Doctor</span>
                <strong className="text-white text-sm">{generatedToken.doctorName}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Date & Slot</span>
                <strong className="text-white">{generatedToken.date} • {generatedToken.timeSlot}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Queue Position</span>
                <strong className="text-cyan-300 font-mono">#{generatedToken.queuePosition} (Est: ~{generatedToken.estimatedWaitMins}m)</strong>
              </div>
            </div>

            {/* Verified Payment Strip */}
            <div className="bg-emerald-950/70 border border-emerald-500/40 rounded-2xl p-3 my-4 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fee Verified: ₹{generatedToken.feeAmount || NOMINAL_FEE} Paid</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-200">
                  Ref: {generatedToken.transactionRef || 'UPI-CONFIRMED'}
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-300 pt-1 border-t border-emerald-800/40">
                <span>Paid via UPI to: <strong>{generatedToken.upiId || UPI_ID}</strong></span>
                <span className="text-emerald-300">Adjusted in OPD invoice</span>
              </div>
            </div>

            {/* QR Code Graphic Box */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block">Pass Verification Hash</span>
                <span className="text-[10px] font-mono text-cyan-400">{generatedToken.qrCodeHash.slice(0, 22)}...</span>
                <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Status: ACTIVE (Waiting)
                </div>
              </div>

              {/* Synthetic QR Code Symbol */}
              <div className="w-16 h-16 bg-white p-1.5 rounded-xl flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-950" />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Token Pass & Receipt</span>
            </button>
            <button
              onClick={() => {
                setGeneratedToken(null);
                setStep(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
            >
              Book Another Token
            </button>
            <button
              onClick={() => onNavigateTab('my-bookings')}
              className="px-4 py-2.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 text-xs font-bold transition"
            >
              View in My Bookings
            </button>
          </div>
        </div>
      )}

      {/* UPI Nominal Fee Payment Modal */}
      <UPIPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        bookingType="OPD"
        title="Confirm OPD Token Booking"
        subtitle="Pay nominal confirmation fee to reserve your consultation slot"
        detailsSummary={{
          patientName,
          hospitalName: selectedHospital.name,
          department: selectedDepartment,
          slotOrCategory: `${selectedDoctor.name} • ${selectedTimeSlot}`,
        }}
        onPaymentSuccess={handlePaymentCompleted}
      />
    </div>
  );
};
