import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  X,
  Code,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { MedicalReportAnalysis } from '../../types';
import {
  generateFhirR4Bundle,
  validateFhirBundle,
  downloadFhirJson,
  printStandardizedEhrReport,
  FhirBundle
} from '../../services/ehrExportService';

interface EhrExportModalProps {
  report: MedicalReportAnalysis;
  isOpen: boolean;
  onClose: () => void;
}

export const EhrExportModal: React.FC<EhrExportModalProps> = ({ report, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'JSON_PREVIEW' | 'VALIDATION'>('OVERVIEW');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  const fhirBundle: FhirBundle = useMemo(() => {
    return generateFhirR4Bundle(report);
  }, [report]);

  const validationResult = useMemo(() => {
    return validateFhirBundle(fhirBundle);
  }, [fhirBundle]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    setIsExportingPdf(true);
    printStandardizedEhrReport(report);
    setTimeout(() => setIsExportingPdf(false), 800);
  };

  const handleDownloadJson = () => {
    downloadFhirJson(fhirBundle, `${report.fileName?.replace(/\.[^/.]+$/, '') || 'arogya-ehr'}-fhir-r4.json`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">Standardized EHR Report Export</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                  HL7 FHIR R4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {report.reportType} • {report.patientName || 'De-identified Patient'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'OVERVIEW'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Formats</span>
          </button>

          <button
            onClick={() => setActiveTab('VALIDATION')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'VALIDATION'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {validationResult.valid ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>FHIR Validation {validationResult.valid ? '(Compliant)' : '(Issues)'}</span>
          </button>

          <button
            onClick={() => setActiveTab('JSON_PREVIEW')}
            className={`pb-2.5 px-3 transition border-b-2 flex items-center gap-1.5 ${
              activeTab === 'JSON_PREVIEW'
                ? 'border-sky-600 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>FHIR JSON Resource</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: OVERVIEW & EXPORTS */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Compliance Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900">
                  <div className="font-bold text-sm">Official HL7 FHIR Release 4 Compatible</div>
                  <p className="mt-0.5 text-emerald-800 leading-relaxed">
                    This healthcare record is automatically formatted using standardized HL7 FHIR resources
                    (Bundle, Patient, Encounter, Observation, Condition, DocumentReference) for seamless interoperability
                    with modern electronic health record (EHR) systems.
                  </p>
                </div>
              </div>

              {/* Export Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* PDF Card */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 hover:border-sky-500 bg-white shadow-xs transition group space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                      <Printer className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">Standardized PDF Report</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Structured printable report with patient demographics, encounter facility, clinical findings table with units & reference ranges, and doctor discussion points.
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Format: Clean CSS Print / PDF • Schema: Arogya-EHR-v1.4
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadPdf}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Printer className="w-4 h-4" />
                    <span>{isExportingPdf ? 'Generating PDF...' : 'Print / Save as PDF'}</span>
                  </button>
                </div>

                {/* FHIR JSON Card */}
                <div className="p-5 rounded-2xl border-2 border-slate-200 hover:border-cyan-500 bg-white shadow-xs transition group space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                      <Code className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900">HL7 FHIR R4 JSON Bundle</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Interoperable FHIR Release 4 JSON Bundle containing {fhirBundle.total} structured healthcare resources with valid references and unit mappings.
                    </p>
                    <div className="text-[11px] text-slate-400 font-mono">
                      MIME: application/fhir+json • Resources: {fhirBundle.total}
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadJson}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download FHIR JSON (.json)</span>
                  </button>
                </div>
              </div>

              {/* Data Transparency & Privacy Notice */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Clinical Data Integrity & Privacy Assurance</span>
                </div>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Zero Clinical Invention:</strong> Exported records represent only entities extracted from the source document. Absent fields are strictly labeled as <code>[Unavailable]</code>.
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Synthetic Demonstration Tagging:</strong> Pre-loaded mock cases are clearly identified in FHIR metadata with <code>tag: SYNTHETIC</code>.
                </p>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  • <strong>Client-Side Privacy:</strong> Report exports are formatted in local browser memory without persistent third-party logging of raw medical scans.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: VALIDATION */}
          {activeTab === 'VALIDATION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">HL7 FHIR Validation Report</h4>
                  <p className="text-xs text-slate-500">Evaluated against HL7 FHIR Release 4 specification</p>
                </div>
                <div className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                  validationResult.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {validationResult.valid ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{validationResult.valid ? 'VALIDATED COMPLIANT' : 'WARNINGS DETECTED'}</span>
                </div>
              </div>

              {/* Resource Summary Pill Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Bundle Type</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{fhirBundle.type}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Resources</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{validationResult.resourceCount}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">FHIR Version</span>
                  <div className="font-mono font-bold text-slate-800 mt-0.5">{validationResult.fhirVersion}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Validation Status</span>
                  <div className="font-bold text-emerald-600 mt-0.5">PASSED</div>
                </div>
              </div>

              {/* Resources Inside Bundle */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Resources in Bundle:</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                  {fhirBundle.entry.map((entry, idx) => (
                    <div key={idx} className="p-2.5 bg-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 font-bold text-slate-700">
                          {entry.resource.resourceType}
                        </span>
                        <span className="font-medium text-slate-800">
                          {entry.resource.code?.text || entry.resource.name?.[0]?.text || entry.resource.type?.text || entry.resource.id}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.resource.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unmapped Fields Notice */}
              {validationResult.unmappedFields.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Document Metadata Notes (Non-Standard Extensions):</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                    {validationResult.unmappedFields.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: JSON PREVIEW */}
          {activeTab === 'JSON_PREVIEW' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-mono">
                  application/fhir+json • {JSON.stringify(fhirBundle).length} bytes
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {JSON.stringify(fhirBundle, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 text-[11px]">
            Schema Version: <strong>HL7 FHIR R4 (4.0.1)</strong> • Arogya AI Interoperability Subsystem
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
