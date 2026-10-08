import React, { useState } from 'react';
import {
  Search,
  Stethoscope,
  Building2,
  Calendar,
  Clock,
  Ticket,
  Star,
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { Doctor } from '../../types';

interface DoctorDirectoryProps {
  doctors: Doctor[];
  onSelectDoctorToBook: (doctor: Doctor) => void;
}

export const DoctorDirectory: React.FC<DoctorDirectoryProps> = ({
  doctors,
  onSelectDoctorToBook,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.qualification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'ALL' || doc.department.toLowerCase().includes(selectedDept.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-sky-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Specialist Directory</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Find a Doctor & Specialist
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Search verified healthcare consultants, critical care intensivists, surgeons, and pediatricians across participating hospital network nodes.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by doctor name, specialization, or hospital..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={e => setSelectedDept(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          >
            <option value="ALL">All Specialities</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics & NICU</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="ICU">Critical Care / ICU</option>
            <option value="Surgery">General Surgery</option>
            <option value="Emergency">Emergency Medicine</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid (Prompt Requirement 14) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doc => (
          <div
            key={doc.id}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              {/* Doctor Header */}
              <div className="flex items-start gap-3.5">
                <img
                  src={doc.avatarUrl}
                  alt={doc.name}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                      ★ {doc.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">({doc.experienceYears}y exp)</span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1 truncate">
                    {doc.name}
                  </h3>
                  <div className="text-[11px] text-sky-700 font-bold leading-tight mt-0.5">
                    {doc.specialization}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {doc.qualification}
                  </div>
                </div>
              </div>

              {/* Hospital & Availability Meta */}
              <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-800 text-[11px] line-clamp-1">{doc.hospitalName}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">{doc.availableTime}</span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                  <span>Consultation Fee:</span>
                  <strong className="font-mono text-slate-900 text-xs">₹{doc.fee}</strong>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span>OPD Tokens Open:</span>
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {doc.opdTokensAvailable} Available
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Action */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">
                Next Slot: <strong className="text-slate-700">{doc.nextAvailableSlot}</strong>
              </span>

              <button
                onClick={() => onSelectDoctorToBook(doc)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Book Token</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
