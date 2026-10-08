import React, { useState } from 'react';
import {
  AlertTriangle,
  PhoneCall,
  Ambulance,
  MapPin,
  Clock,
  CheckCircle2,
  Building2,
  Bed,
  ShieldAlert,
  Send,
  Navigation,
  Info
} from 'lucide-react';
import { Hospital, EmergencySOSRequest } from '../../types';

interface EmergencyModuleProps {
  hospitals: Hospital[];
  onTriggerSOS: (sosData: any) => Promise<EmergencySOSRequest>;
}

export const EmergencyModule: React.FC<EmergencyModuleProps> = ({
  hospitals,
  onTriggerSOS,
}) => {
  const [patientName, setPatientName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [location, setLocation] = useState<string>('Live GPS Location (Sector 4, West Bypass)');
  const [emergencyType, setEmergencyType] = useState<
    'Accident' | 'Breathing difficulty' | 'Chest pain' | 'Severe bleeding' | 'Unconsciousness' | 'Other'
  >('Chest pain');
  const [symptoms, setSymptoms] = useState<string>('');
  const [preferredHospitalId, setPreferredHospitalId] = useState<string>(hospitals[0]?.id || 'hosp-1');

  const [activeSOS, setActiveSOS] = useState<EmergencySOSRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const emergencyCategories = [
    { type: 'Chest pain', icon: '💔', color: 'bg-rose-50 border-rose-300 text-rose-900' },
    { type: 'Breathing difficulty', icon: '🫁', color: 'bg-amber-50 border-amber-300 text-amber-900' },
    { type: 'Accident', icon: '🚗', color: 'bg-red-50 border-red-300 text-red-900' },
    { type: 'Severe bleeding', icon: '🩸', color: 'bg-rose-50 border-rose-300 text-rose-900' },
    { type: 'Unconsciousness', icon: '⚡', color: 'bg-purple-50 border-purple-300 text-purple-900' },
    { type: 'Other', icon: '🚨', color: 'bg-slate-50 border-slate-300 text-slate-900' },
  ] as const;

  const handleSOSSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const prefHosp = hospitals.find(h => h.id === preferredHospitalId);

    try {
      const sos = await onTriggerSOS({
        patientName: patientName || 'Emergency Patient',
        age: Number(age) || 45,
        contactNumber: contactNumber || '+91 99999 99999',
        location,
        emergencyType,
        symptoms: symptoms || 'Urgent emergency triage triggered via SOS',
        preferredHospitalId,
        preferredHospitalName: prefHosp?.name || 'Arogya Central Hospital',
      });
      setActiveSOS(sos);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Red Alert Header Box */}
      <div className="bg-linear-to-r from-red-950 via-rose-900 to-red-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-rose-700/60">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-black uppercase tracking-widest mb-3 shadow-md animate-pulse">
            <AlertTriangle className="w-4 h-4 fill-white text-red-900" />
            <span>CRITICAL EMERGENCY TRIAGE & AMBULANCE DISPATCH</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            🚨 Immediate Emergency Assistance
          </h2>
          <p className="text-rose-100 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            For life-threatening medical emergencies, dial local emergency services directly.
            Arogya AI instantly notifies nearest hospital trauma teams to prepare ER reception beds.
          </p>

          {/* National / Regional Emergency Helplines (Prompt Requirement 15) */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="tel:108"
              className="bg-white text-rose-900 hover:bg-rose-50 p-3.5 rounded-2xl font-black text-center shadow-lg transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <span>DIAL 108 (National Ambulance)</span>
            </a>
            <a
              href="tel:112"
              className="bg-white text-rose-900 hover:bg-rose-50 p-3.5 rounded-2xl font-black text-center shadow-lg transition flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-5 h-5 text-rose-600" />
              <span>DIAL 112 (Emergency Response)</span>
            </a>
            <a
              href="tel:911"
              className="bg-white/20 hover:bg-white/30 text-white p-3.5 rounded-2xl font-bold text-center border border-white/30 transition flex items-center justify-center gap-2 text-xs"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Universal Emergency (911)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Mandatory Regulatory Disclaimer (Prompt Requirement 15) */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed font-medium">
          <strong>Mandatory Safety Disclaimer:</strong> Arogya AI coordinates hospital trauma bed readiness and is not a substitute for licensed municipal emergency medical services. Arogya AI does not guarantee hospital admission. In critical or unconscious cases, call emergency ambulances (108/112) immediately.
        </div>
      </div>

      {/* Active Live SOS Dispatcher Tracker (If Triggered) */}
      {activeSOS && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-rose-500/50 space-y-5 animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider">
                ACTIVE AMBULANCE DISPATCH
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Emergency Unit #{activeSOS.ambulanceUnit} Dispatched
              </h3>
              <p className="text-xs text-slate-400">
                Paramedics linked with {activeSOS.preferredHospitalName} Trauma Bay
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Estimated Arrival</span>
              <span className="text-3xl font-black text-cyan-300 font-mono">
                ~{activeSOS.etaMinutes} Mins
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-800/80 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] text-slate-400 block">Patient Name</span>
              <strong className="text-white text-sm">{activeSOS.patientName} ({activeSOS.age}y)</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Emergency Type</span>
              <strong className="text-rose-400 text-sm">{activeSOS.emergencyType}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Paramedic Direct Contact</span>
              <a href={`tel:${activeSOS.paramedicContact}`} className="text-cyan-300 font-mono font-bold hover:underline">
                {activeSOS.paramedicContact}
              </a>
            </div>
          </div>

          <div className="p-3.5 bg-rose-950/60 rounded-xl border border-rose-500/30 text-xs text-rose-200">
            <strong>Trauma Bed Preparation:</strong> 2 Emergency resuscitation bays and 1 ICU bed held in reserve at {activeSOS.preferredHospitalName}.
          </div>
        </div>
      )}

      {/* Emergency Triage Submission Form (Prompt Requirement 15) */}
      {!activeSOS && (
        <form onSubmit={handleSOSSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Emergency Triage & Hospital Bed Alert Form
            </h3>
            <p className="text-xs text-slate-500">
              Transmit urgent patient vitals and emergency category to reserve immediate trauma bed capacity.
            </p>
          </div>

          {/* Emergency Category Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Emergency Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {emergencyCategories.map(cat => (
                <div
                  key={cat.type}
                  onClick={() => setEmergencyType(cat.type)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition text-left flex items-center gap-3 ${
                    emergencyType === cat.type
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950 font-bold'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800 font-medium'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="text-xs">{cat.type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Patient Full Name</label>
              <input
                type="text"
                placeholder="e.g. Rajesh Nair"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Number *</label>
              <input
                type="tel"
                required
                placeholder="+91 99XXX XXXXX"
                value={contactNumber}
                onChange={e => setContactNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Current Patient Location / GPS *</label>
              <input
                type="text"
                required
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Emergency Hospital</label>
              <select
                value={preferredHospitalId}
                onChange={e => setPreferredHospitalId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold"
              >
                {hospitals.map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.bedCategories.find(c => c.name === 'Emergency')?.available || 5} ER Beds Open)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Specific Critical Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g. Severe chest tightness radiating to jaw, profuse sweating, shortness of breath..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Immediate hospital ER telemetry alert will trigger upon dispatch.
            </span>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <Ambulance className="w-4 h-4" />
              <span>{isSubmitting ? 'Dispatching...' : 'TRIGGER EMERGENCY SOS & RESERVE BED'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
