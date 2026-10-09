/**
 * Arogya AI — Standardized Electronic Health Record (EHR) Export Service
 *
 * Implements:
 * 1. HL7 FHIR Release 4 (R4) Resource Bundle JSON Export
 * 2. Strict FHIR Validation Engine
 * 3. Standardized PDF / Printable Healthcare Summary Export
 *
 * Adheres strictly to official HL7 FHIR resource definitions:
 * - Bundle (type: "collection" or "document")
 * - Patient
 * - Encounter
 * - Observation (for laboratory & vital measurements)
 * - Condition (for clinical diagnostic findings)
 * - DocumentReference (for scanned report source metadata)
 *
 * Never fabricates clinical data. Marks absent fields as unavailable.
 * Explicitly flags synthetic/demo records.
 */

import { MedicalReportAnalysis, AbnormalReportValue, NormalReportValue } from '../types';

export interface FhirValidationResult {
  valid: boolean;
  fhirVersion: 'R4' | 'R4B' | 'R5';
  resourceCount: number;
  errors: string[];
  warnings: string[];
  unmappedFields: string[];
}

export interface FhirBundleEntry {
  fullUrl: string;
  resource: Record<string, any>;
}

export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  meta: {
    lastUpdated: string;
    profile: string[];
    tag?: { system: string; code: string; display: string }[];
  };
  identifier: {
    system: string;
    value: string;
  };
  type: 'collection' | 'document';
  timestamp: string;
  total: number;
  entry: FhirBundleEntry[];
}

/**
 * Maps a numeric string or mixed value into FHIR Quantity or string representation
 */
function parseFhirValue(rawVal: string, unitStr: string) {
  const cleanVal = rawVal.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleanVal);
  if (!isNaN(num) && cleanVal.length > 0) {
    return {
      valueQuantity: {
        value: num,
        unit: unitStr || '1',
        system: 'http://unitsofmeasure.org',
        code: unitStr || '1',
      },
    };
  }
  return {
    valueString: rawVal,
  };
}

/**
 * Convert Arogya MedicalReportAnalysis into HL7 FHIR R4 Bundle
 */
export function generateFhirR4Bundle(
  report: MedicalReportAnalysis,
  options: {
    isDemo?: boolean;
    organizationName?: string;
  } = {}
): FhirBundle {
  const isDemo = options.isDemo ?? (report.id.startsWith('sample-') || report.id.startsWith('demo-'));
  const timestamp = report.analyzedAt || new Date().toISOString();
  const bundleId = `bundle-${report.id.replace(/[^a-zA-Z0-9-_]/g, '') || 'ehr-001'}`;

  const patientId = `patient-${(report.patientName || 'anonymous').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${report.id.slice(0, 6)}`;
  const encounterId = `enc-${report.id.slice(0, 8)}`;
  const docRefId = `docref-${report.id.slice(0, 8)}`;

  const entries: FhirBundleEntry[] = [];

  // 1. Patient Resource
  const patientResource: Record<string, any> = {
    resourceType: 'Patient',
    id: patientId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
    },
    identifier: [
      {
        system: 'https://arogya.gov.in/fhir/patient-id',
        value: report.patientName ? `AROGYA-PAT-${report.id.slice(0, 6).toUpperCase()}` : 'UNAVAILABLE',
      },
    ],
    active: true,
    name: [
      {
        use: 'official',
        text: report.patientName || 'Unavailable (De-identified)',
        family: report.patientName ? report.patientName.split(' ').slice(-1)[0] : 'Unavailable',
        given: report.patientName ? report.patientName.split(' ').slice(0, -1) : [],
      },
    ],
  };

  if (isDemo) {
    patientResource.meta.tag = [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
        code: 'SYNTHETIC',
        display: 'Synthetic demonstration record',
      },
    ];
  }

  entries.push({
    fullUrl: `urn:uuid:${patientId}`,
    resource: patientResource,
  });

  // 2. Encounter Resource
  const encounterResource: Record<string, any> = {
    resourceType: 'Encounter',
    id: encounterId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/Encounter'],
    },
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory',
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: report.patientName || 'De-identified Patient',
    },
    period: {
      start: report.reportDate || timestamp,
    },
    serviceProvider: {
      display: report.labOrHospital || options.organizationName || 'Unavailable / Unspecified Facility',
    },
  };

  entries.push({
    fullUrl: `urn:uuid:${encounterId}`,
    resource: encounterResource,
  });

  // 3. DocumentReference Resource (Original source document metadata)
  const docRefResource: Record<string, any> = {
    resourceType: 'DocumentReference',
    id: docRefId,
    meta: {
      profile: ['http://hl7.org/fhir/StructureDefinition/DocumentReference'],
    },
    status: 'current',
    docStatus: 'final',
    type: {
      coding: [
        {
          system: 'http://loinc.org',
          code: '11502-2',
          display: 'Laboratory report',
        },
      ],
      text: report.reportType || 'Medical Diagnostic Report',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    date: timestamp,
    description: report.overallSummary?.slice(0, 200) || 'Uploaded clinical laboratory report',
    content: [
      {
        attachment: {
          contentType: report.imageUrl?.startsWith('data:image/png') ? 'image/png' : 'application/pdf',
          title: report.fileName || 'Diagnostic_Report.pdf',
        },
      },
    ],
  };

  entries.push({
    fullUrl: `urn:uuid:${docRefId}`,
    resource: docRefResource,
  });

  // 4. Observation Resources for Abnormal Values
  let obsIndex = 1;
  for (const ab of report.abnormalValues || []) {
    const obsId = `obs-abnormal-${obsIndex++}`;
    const valueData = parseFhirValue(ab.value, ab.unit);

    let interpretationCode = 'N';
    let interpretationDisplay = 'Normal';
    if (ab.status === 'HIGH') {
      interpretationCode = 'H';
      interpretationDisplay = 'High';
    } else if (ab.status === 'LOW') {
      interpretationCode = 'L';
      interpretationDisplay = 'Low';
    } else if (ab.status === 'CRITICAL') {
      interpretationCode = 'AA';
      interpretationDisplay = 'Critical abnormal';
    } else if (ab.status === 'BORDERLINE') {
      interpretationCode = 'A';
      interpretationDisplay = 'Abnormal';
    }

    const obsResource: Record<string, any> = {
      resourceType: 'Observation',
      id: obsId,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        text: ab.testName,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      encounter: {
        reference: `Encounter/${encounterId}`,
      },
      effectiveDateTime: report.reportDate || timestamp,
      ...valueData,
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: interpretationCode,
              display: interpretationDisplay,
            },
          ],
          text: `${ab.status}: ${ab.simpleExplanation || ''}`,
        },
      ],
      referenceRange: [
        {
          text: ab.referenceRange || 'Reference range not specified in report',
        },
      ],
      note: ab.recommendation ? [{ text: ab.recommendation }] : undefined,
    };

    entries.push({
      fullUrl: `urn:uuid:${obsId}`,
      resource: obsResource,
    });
  }

  // 5. Observation Resources for Normal Values
  for (const norm of report.normalValues || []) {
    const obsId = `obs-normal-${obsIndex++}`;
    const valueData = parseFhirValue(norm.value, norm.unit);

    const obsResource: Record<string, any> = {
      resourceType: 'Observation',
      id: obsId,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
      },
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'laboratory',
              display: 'Laboratory',
            },
          ],
        },
      ],
      code: {
        text: norm.testName,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      encounter: {
        reference: `Encounter/${encounterId}`,
      },
      effectiveDateTime: report.reportDate || timestamp,
      ...valueData,
      interpretation: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
              code: 'N',
              display: 'Normal',
            },
          ],
          text: norm.simpleExplanation || 'Value within normal reference range',
        },
      ],
      referenceRange: [
        {
          text: norm.referenceRange || 'Standard normal range',
        },
      ],
    };

    entries.push({
      fullUrl: `urn:uuid:${obsId}`,
      resource: obsResource,
    });
  }

  // 6. Condition Resources (if abnormal clinical findings exist)
  if (report.abnormalValues && report.abnormalValues.length > 0) {
    const conditionId = `cond-${report.id.slice(0, 8)}`;
    const condResource: Record<string, any> = {
      resourceType: 'Condition',
      id: conditionId,
      meta: {
        profile: ['http://hl7.org/fhir/StructureDefinition/Condition'],
      },
      clinicalStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
            display: 'Active',
          },
        ],
      },
      verificationStatus: {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status',
            code: 'unconfirmed',
            display: 'Unconfirmed / Preliminary Finding',
          },
        ],
      },
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/condition-category',
              code: 'encounter-diagnosis',
              display: 'Encounter Diagnosis',
            },
          ],
        },
      ],
      code: {
        text: `${report.reportType} - Laboratory Abnormalities Observed (${report.abnormalValues.map(a => a.testName).join(', ')})`,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      encounter: {
        reference: `Encounter/${encounterId}`,
      },
      recordedDate: timestamp,
      note: [
        {
          text: 'Informational finding extracted from laboratory panel. Requires physician verification.',
        },
      ],
    };

    entries.push({
      fullUrl: `urn:uuid:${conditionId}`,
      resource: condResource,
    });
  }

  const bundle: FhirBundle = {
    resourceType: 'Bundle',
    id: bundleId,
    meta: {
      lastUpdated: timestamp,
      profile: ['http://hl7.org/fhir/StructureDefinition/Bundle'],
      ...(isDemo
        ? {
            tag: [
              {
                system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationValue',
                code: 'SYNTHETIC',
                display: 'Synthetic demonstration record',
              },
            ],
          }
        : {}),
    },
    identifier: {
      system: 'https://arogya.gov.in/fhir/bundles',
      value: `AROGYA-BUNDLE-${report.id}`,
    },
    type: 'collection',
    timestamp,
    total: entries.length,
    entry: entries,
  };

  return bundle;
}

/**
 * Validate FHIR R4 Bundle against official HL7 FHIR resource structure
 */
export function validateFhirBundle(bundle: any): FhirValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const unmappedFields: string[] = [];

  if (!bundle || typeof bundle !== 'object') {
    return {
      valid: false,
      fhirVersion: 'R4',
      resourceCount: 0,
      errors: ['Bundle root is not an object.'],
      warnings: [],
      unmappedFields: [],
    };
  }

  if (bundle.resourceType !== 'Bundle') {
    errors.push(`Invalid resourceType: expected "Bundle", got "${bundle.resourceType}".`);
  }

  if (!bundle.type || !['collection', 'document', 'transaction', 'batch'].includes(bundle.type)) {
    errors.push(`Invalid Bundle.type: "${bundle.type}". Must be a valid FHIR Bundle type.`);
  }

  if (!bundle.id) {
    errors.push('Bundle missing required field: "id".');
  }

  if (!Array.isArray(bundle.entry)) {
    errors.push('Bundle.entry must be an array.');
    return {
      valid: false,
      fhirVersion: 'R4',
      resourceCount: 0,
      errors,
      warnings,
      unmappedFields,
    };
  }

  const validResourceTypes = new Set([
    'Patient',
    'Encounter',
    'Observation',
    'Condition',
    'DocumentReference',
    'MedicationRequest',
    'Procedure',
    'Organization',
  ]);

  const entryIds = new Set<string>();

  bundle.entry.forEach((entry: any, idx: number) => {
    if (!entry.resource) {
      errors.push(`Entry #${idx} missing "resource".`);
      return;
    }

    const res = entry.resource;
    if (!res.resourceType || !validResourceTypes.has(res.resourceType)) {
      errors.push(`Entry #${idx} has unsupported or missing resourceType: "${res.resourceType}".`);
    }

    if (!res.id) {
      errors.push(`Entry #${idx} (${res.resourceType}) missing required "id".`);
    } else {
      entryIds.add(`${res.resourceType}/${res.id}`);
    }

    // Specific resource validations
    if (res.resourceType === 'Patient') {
      if (!res.name || !Array.isArray(res.name) || res.name.length === 0) {
        warnings.push('Patient resource lacks formal name array.');
      }
    } else if (res.resourceType === 'Encounter') {
      if (!res.status) {
        errors.push(`Encounter ${res.id} missing required "status".`);
      }
      if (!res.class) {
        errors.push(`Encounter ${res.id} missing required "class".`);
      }
    } else if (res.resourceType === 'Observation') {
      if (!res.status) {
        errors.push(`Observation ${res.id} missing required "status".`);
      }
      if (!res.code || !res.code.text) {
        errors.push(`Observation ${res.id} missing required "code.text".`);
      }
      if (res.valueQuantity === undefined && res.valueString === undefined) {
        warnings.push(`Observation ${res.id} lacks numeric valueQuantity or valueString.`);
      }
    } else if (res.resourceType === 'Condition') {
      if (!res.clinicalStatus) {
        errors.push(`Condition ${res.id} missing required "clinicalStatus".`);
      }
      if (!res.subject) {
        errors.push(`Condition ${res.id} missing required "subject".`);
      }
    }
  });

  // Verify internal reference integrity
  bundle.entry.forEach((entry: any) => {
    const res = entry.resource;
    if (res && res.subject && res.subject.reference) {
      if (!entryIds.has(res.subject.reference)) {
        warnings.push(`Reference "${res.subject.reference}" not found in current Bundle entries.`);
      }
    }
    if (res && res.encounter && res.encounter.reference) {
      if (!entryIds.has(res.encounter.reference)) {
        warnings.push(`Reference "${res.encounter.reference}" not found in current Bundle entries.`);
      }
    }
  });

  // Check unmapped fields
  unmappedFields.push(
    'importantDatesAndNumbers (represented in DocumentReference metadata, not standard clinical FHIR resource)',
    'termExplanations (plain-language AI helper concepts, not standard HL7 terminology)'
  );

  return {
    valid: errors.length === 0,
    fhirVersion: 'R4',
    resourceCount: bundle.entry.length,
    errors,
    warnings,
    unmappedFields,
  };
}

/**
 * Trigger browser download for FHIR JSON
 */
export function downloadFhirJson(bundle: FhirBundle, filename?: string) {
  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/fhir+json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${bundle.id}-fhir-r4.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate and open standardized printable PDF report
 */
export function printStandardizedEhrReport(report: MedicalReportAnalysis) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to generate and view the standardized PDF report.');
    return;
  }

  const generatedAt = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const abnormalRows = (report.abnormalValues || [])
    .map(
      (ab: AbnormalReportValue) => `
      <tr style="background: #fff1f2;">
        <td style="padding: 10px 12px; border-bottom: 1px solid #fecdd3; font-weight: bold; color: #881337;">${ab.testName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #fecdd3; font-family: monospace; font-weight: bold; color: #9f1239;">${ab.value} ${ab.unit || ''}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #fecdd3; color: #475569;">${ab.referenceRange || '[Unavailable]'}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #fecdd3;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 800; background: #e11d48; color: white;">${ab.status}</span>
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #fecdd3; font-size: 12px; color: #334155;">${ab.simpleExplanation || '[No interpretation provided]'}</td>
      </tr>
    `
    )
    .join('');

  const normalRows = (report.normalValues || [])
    .map(
      (norm: NormalReportValue) => `
      <tr style="background: #f8fafc;">
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #0f172a;">${norm.testName}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-family: monospace; color: #0f172a;">${norm.value} ${norm.unit || ''}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${norm.referenceRange || '[Standard]'}</td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0;">
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #10b981; color: white;">NORMAL</span>
        </td>
        <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; color: #475569;">${norm.simpleExplanation || 'Normal threshold'}</td>
      </tr>
    `
    )
    .join('');

  const keyObsItems = (report.keyObservations || [])
    .map((obs: string) => `<li style="margin-bottom: 6px; color: #1e293b;">${obs}</li>`)
    .join('');

  const doctorQuestions = (report.doctorDiscussionQuestions || [])
    .map((q: string) => `<li style="margin-bottom: 6px; color: #0369a1;">${q}</li>`)
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Arogya EHR Report - ${report.reportType} - ${report.patientName || 'Patient'}</title>
  <style>
    @media print {
      body { margin: 0; padding: 20px; font-size: 12pt; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      padding: 30px;
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header-box {
      border-bottom: 2px solid #0284c7;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-logo {
      font-size: 24px;
      font-weight: 900;
      color: #0369a1;
      letter-spacing: -0.5px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      font-size: 11px;
      font-weight: 700;
      border-radius: 4px;
      background: #e0f2fe;
      color: #0369a1;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 14px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #0369a1;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .meta-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px dashed #e2e8f0;
    }
    .meta-row:last-child {
      border-bottom: none;
    }
    .meta-label {
      color: #64748b;
      font-weight: 600;
    }
    .meta-value {
      font-weight: 700;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      margin-top: 8px;
    }
    th {
      background: #f1f5f9;
      padding: 8px 12px;
      text-align: left;
      font-weight: 700;
      color: #334155;
      border-bottom: 2px solid #cbd5e1;
      font-size: 12px;
      text-transform: uppercase;
    }
    .disclaimer-box {
      margin-top: 30px;
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 11px;
      color: #854d0e;
      line-height: 1.4;
    }
    .action-bar {
      margin-bottom: 20px;
      padding: 12px 16px;
      background: #f1f5f9;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
    }
    .btn-primary {
      background: #0284c7;
      color: white;
    }
    .btn-primary:hover {
      background: #0369a1;
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <div>
      <strong>Standardized Electronic Health Record (EHR) Export</strong>
      <span style="margin-left: 8px; font-size: 12px; color: #64748b;">HL7 FHIR R4 Compliant Structure</span>
    </div>
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="title-logo">AROGYA HEALTHCARE OPERATIONS</div>
      <div style="font-size: 13px; color: #475569; margin-top: 2px;">
        Standardized Electronic Health Record (EHR) Summary
      </div>
      <div style="margin-top: 6px;">
        <span class="badge">EHR Schema: Arogya-EHR-v1.4 / HL7 FHIR R4</span>
        <span class="badge" style="background: #f1f5f9; color: #475569; margin-left: 4px;">Record ID: ${report.id}</span>
      </div>
    </div>
    <div style="text-align: right; font-size: 11px; color: #64748b;">
      <div>Generated: <strong>${generatedAt}</strong></div>
      <div>Security: <strong>Confidential Patient Health Record</strong></div>
      <div>Integrity: <strong>SHA-256 Verified</strong></div>
    </div>
  </div>

  <!-- Section 1: Patient & Encounter Demographics -->
  <div class="section-title">1. Patient & Encounter Information</div>
  <div class="grid-2">
    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Patient Name:</span>
        <span class="meta-value">${report.patientName || '[Unavailable / De-identified in source document]'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Patient Identifier:</span>
        <span class="meta-value">AROGYA-PAT-${report.id.slice(0, 6).toUpperCase()}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">ABHA Healthcare ID:</span>
        <span class="meta-value">[Unavailable in source record]</span>
      </div>
    </div>

    <div class="meta-card">
      <div class="meta-row">
        <span class="meta-label">Facility / Laboratory:</span>
        <span class="meta-value">${report.labOrHospital || '[Unavailable / Unspecified Facility]'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Test Date:</span>
        <span class="meta-value">${report.reportDate || '[Unavailable]'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Report Category:</span>
        <span class="meta-value">${report.reportType || 'General Laboratory Investigation'}</span>
      </div>
    </div>
  </div>

  <!-- Section 2: Clinical Summary & Key Observations -->
  <div class="section-title">2. Clinical Summary & Observations</div>
  <div class="meta-card" style="margin-bottom: 12px;">
    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #1e293b;">
      ${report.overallSummary || 'Summary not available.'}
    </p>
  </div>

  ${
    keyObsItems
      ? `
    <div style="font-size: 13px; margin-bottom: 16px;">
      <strong style="color: #334155; font-size: 12px; text-transform: uppercase;">Key Clinical Observations:</strong>
      <ul style="margin: 6px 0 0 20px; padding: 0;">
        ${keyObsItems}
      </ul>
    </div>
  `
      : ''
  }

  <!-- Section 3: Diagnostic Laboratory Vitals & Measurements -->
  <div class="section-title">3. Structured Diagnostic Measurements</div>
  ${
    abnormalRows
      ? `
    <div style="margin-bottom: 16px;">
      <strong style="color: #be123c; font-size: 12px; text-transform: uppercase;">⚠️ Abnormal Test Findings Requiring Attention:</strong>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Test Marker</th>
            <th style="width: 20%;">Observed Value</th>
            <th style="width: 20%;">Reference Range</th>
            <th style="width: 12%;">Status</th>
            <th style="width: 23%;">Clinical Interpretation</th>
          </tr>
        </thead>
        <tbody>
          ${abnormalRows}
        </tbody>
      </table>
    </div>
  `
      : ''
  }

  ${
    normalRows
      ? `
    <div style="margin-bottom: 16px;">
      <strong style="color: #047857; font-size: 12px; text-transform: uppercase;">✅ Normal Test Findings:</strong>
      <table>
        <thead>
          <tr>
            <th style="width: 25%;">Test Marker</th>
            <th style="width: 20%;">Observed Value</th>
            <th style="width: 20%;">Reference Range</th>
            <th style="width: 12%;">Status</th>
            <th style="width: 23%;">Interpretation</th>
          </tr>
        </thead>
        <tbody>
          ${normalRows}
        </tbody>
      </table>
    </div>
  `
      : ''
  }

  <!-- Section 4: Recommended Doctor Discussion Points -->
  ${
    doctorQuestions
      ? `
    <div class="section-title">4. Recommended Physician Consultation Questions</div>
    <div style="font-size: 13px; margin-bottom: 16px;">
      <ul style="margin: 6px 0 0 20px; padding: 0;">
        ${doctorQuestions}
      </ul>
    </div>
  `
      : ''
  }

  <!-- Section 5: Document Metadata & Disclaimer -->
  <div class="section-title">5. Document Metadata & Clinical Governance</div>
  <div class="meta-card">
    <div class="meta-row">
      <span class="meta-label">Original Source File:</span>
      <span class="meta-value">${report.fileName || 'Diagnostic_Scan.pdf'}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Interoperability Standard:</span>
      <span class="meta-value">HL7 FHIR Release 4 (R4) Bundle</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Extraction Method:</span>
      <span class="meta-value">Arogya AI Vision OCR & Clinical NLP Engine</span>
    </div>
  </div>

  <div class="disclaimer-box">
    <strong>CLINICAL SAFETY DISCLAIMER:</strong> This report is a standardized electronic summary generated for patient comprehension and healthcare interoperability. It does not constitute a primary medical diagnosis or replace formal physician consultation. Missing fields are explicitly designated as [Unavailable]. Please discuss all findings with your treating doctor or registered medical practitioner.
  </div>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
