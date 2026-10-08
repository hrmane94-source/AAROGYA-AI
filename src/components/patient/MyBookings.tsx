import React from 'react';
import {
  Ticket,
  Bed,
  QrCode,
  CheckCircle2,
  Clock,
  Printer,
  Calendar,
  Building2,
  User,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { OPDToken, BedRequest } from '../../types';

interface MyBookingsProps {
  tokens: OPDToken[];
  bedRequests: BedRequest[];
  onNavigateTab: (tab: string) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  tokens,
  bedRequests,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Active Bookings & Requests
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Live tracking for outpatient OPD token queues and inpatient bed admission requests.
        </p>
      </div>

      {/* OPD Tokens Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Ticket className="w-5 h-5 text-teal-600" />
            <span>Digital OPD Tokens ({tokens.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('book-opd')}
            className="text-xs text-teal-700 hover:text-teal-900 font-bold"
          >
            + Book New Token
          </button>
        </div>

        {tokens.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            No active OPD tokens found. Book a token to consult with hospital doctors.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokens.map(token => (
              <div
                key={token.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md uppercase">
                        OPD Pass
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                        {token.doctorName}
                      </h4>
                      <p className="text-[11px] text-slate-500">{token.department}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Token</span>
                      <span className="text-2xl font-black font-mono text-teal-700">
                        {token.tokenNumber}
                      </span>
                    </div>
                  </div>

                  <div className="my-3 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Hospital:</span>
                      <strong className="text-slate-800 text-right truncate max-w-[200px]">{token.hospitalName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <strong className="text-slate-800">{token.patientName} ({token.patientAge}y)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Appointment Time:</span>
                      <strong className="text-slate-800">{token.date} • {token.timeSlot}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Queue Status:</span>
                      <span className="font-bold text-teal-700">
                        Position #{token.queuePosition} (Wait: ~{token.estimatedWaitMins}m)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Status: {token.status}
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bed Requests Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bed className="w-5 h-5 text-sky-600" />
            <span>Hospital Bed Admission Requests ({bedRequests.length})</span>
          </h3>
          <button
            onClick={() => onNavigateTab('find-beds')}
            className="text-xs text-sky-700 hover:text-sky-900 font-bold"
          >
            + Request Bed
          </button>
        </div>

        {bedRequests.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-400 text-xs">
            No active bed admission requests.
          </div>
        ) : (
          <div className="space-y-3">
            {bedRequests.map(req => {
              const isAllocated = req.status === 'BED_ALLOCATED' || req.status === 'APPROVED';

              return (
                <div
                  key={req.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        req.urgency === 'CRITICAL_EMERGENCY'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.urgency.replace('_', ' ')}
                      </span>
                      <span className="font-extrabold text-slate-900 text-sm">{req.patientName} ({req.patientAge}y)</span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>{req.hospitalName}</strong> • {req.department} ({req.bedCategory} Bed)
                    </p>
                    <p className="text-[11px] text-slate-500 italic">
                      &ldquo;{req.reason}&rdquo;
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      isAllocated
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {isAllocated ? 'Bed Allocated: ' + (req.allocatedBedNumber || 'GW-314B') : 'Pending Confirmation'}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Submitted: {req.submittedAt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
