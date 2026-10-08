import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { MLForecastEngine } from './src/services/mlForecastEngine.ts';
import {
  OPDToken,
  BedRequest,
  EmergencySOSRequest
} from './src/types/index.ts';
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
} from './src/data/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// AI Studio dev server runs on port 3000
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory runtime state for interactive demo persistence
let hospitalsState = [...INITIAL_HOSPITALS];
let alertsState = [...INITIAL_ALERTS];
let admissionSpikeState = { ...INITIAL_ADMISSION_SPIKE };
let dischargeForecastState = { ...INITIAL_DISCHARGE_FORECAST };
let mlMetricsState = { ...INITIAL_ML_METRICS };
let doctorsState = [...INITIAL_DOCTORS];
let opdTokensState = [...INITIAL_OPD_TOKENS];
let bedRequestsState = [...INITIAL_BED_REQUESTS];
let emergencyLogsState = [...INITIAL_EMERGENCY_LOGS];

// Gemini AI client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ---------------- API ROUTES ---------------- //

// 1. Live Hospitals & Bed Inventory
app.get('/api/hospitals', (_req: Request, res: Response) => {
  res.json({
    success: true,
    hospitals: hospitalsState,
    timestamp: new Date().toISOString(),
  });
});

// Update Bed Category Counts (Admin / Staff Action)
app.post('/api/hospitals/:id/update-bed', (req: Request, res: Response) => {
  const { id } = req.params;
  const { bedCategoryId, occupiedDelta, reservedDelta, availableDelta } = req.body;

  const hospitalIndex = hospitalsState.findIndex(h => h.id === id);
  if (hospitalIndex === -1) {
    return res.status(404).json({ success: false, error: 'Hospital not found' });
  }

  const hosp = hospitalsState[hospitalIndex];
  const catIndex = hosp.bedCategories.findIndex(c => c.id === bedCategoryId);

  if (catIndex !== -1) {
    const cat = hosp.bedCategories[catIndex];
    if (occupiedDelta !== undefined) cat.occupied = Math.max(0, Math.min(cat.total, cat.occupied + occupiedDelta));
    if (reservedDelta !== undefined) cat.reserved = Math.max(0, Math.min(cat.total, cat.reserved + reservedDelta));
    if (availableDelta !== undefined) {
      cat.available = Math.max(0, Math.min(cat.total, cat.available + availableDelta));
    } else {
      cat.available = Math.max(0, cat.total - cat.occupied - cat.reserved);
    }

    cat.occupancyRate = Math.round((cat.occupied / cat.total) * 1000) / 10;
    cat.status = cat.occupancyRate >= 90 ? 'Danger' : cat.occupancyRate >= 80 ? 'Warning' : 'Normal';
    cat.lastUpdated = 'Just now';

    // Recalculate hospital totals
    hosp.occupiedBeds = hosp.bedCategories.reduce((acc, c) => acc + c.occupied, 0);
    hosp.reservedBeds = hosp.bedCategories.reduce((acc, c) => acc + c.reserved, 0);
    hosp.availableBeds = hosp.bedCategories.reduce((acc, c) => acc + c.available, 0);
    hosp.occupancyRate = Math.round((hosp.occupiedBeds / hosp.totalBeds) * 1000) / 10;
    hosp.lastUpdated = 'Just now (Staff action recorded)';
  }

  res.json({ success: true, hospital: hosp });
});

// 2. ML Bed Demand Predictions & Horizon Summaries
app.get('/api/predictions', (_req: Request, res: Response) => {
  const summaries = MLForecastEngine.getPredictionSummaries();
  res.json({
    success: true,
    summaries,
    admissionSpike: admissionSpikeState,
    dischargeForecast: dischargeForecastState,
    alerts: alertsState,
    metrics: mlMetricsState,
  });
});

// Time Series Data for Forecasting Graph
app.get('/api/predictions/timeseries', (req: Request, res: Response) => {
  const horizon = parseInt((req.query.horizon as string) || '7', 10);
  const bedCategory = (req.query.bedCategory as string) || 'All';
  const department = (req.query.department as string) || 'All';
  const deltaAdm = parseFloat((req.query.deltaAdm as string) || '0');
  const deltaDis = parseFloat((req.query.deltaDis as string) || '0');
  const addBeds = parseInt((req.query.addBeds as string) || '0', 10);

  const series = MLForecastEngine.generateTimeSeries(
    horizon,
    bedCategory,
    department,
    deltaAdm,
    deltaDis,
    addBeds
  );

  res.json({ success: true, series });
});

// 3. What-If Simulator Endpoint
app.post('/api/predictions/simulate', (req: Request, res: Response) => {
  const {
    deltaAdmissionsPercent = 0,
    deltaDischargesPercent = 0,
    additionalBeds = 0,
    emergencySurgeFactor = 1.0,
  } = req.body;

  const result = MLForecastEngine.runWhatIfSimulation(
    deltaAdmissionsPercent,
    deltaDischargesPercent,
    additionalBeds,
    emergencySurgeFactor
  );

  res.json({ success: true, simulation: result });
});

// 4. Alert Actions
app.post('/api/alerts/:id/action', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action, staffName, note } = req.body;

  const alertIndex = alertsState.findIndex(a => a.id === id);
  if (alertIndex !== -1) {
    if (action === 'REVIEW') {
      alertsState[alertIndex].status = 'REVIEWED';
    } else if (action === 'ASSIGN') {
      alertsState[alertIndex].status = 'ASSIGNED';
      alertsState[alertIndex].assignedStaff = staffName || 'Dr. Assigned Staff';
    } else if (action === 'RESOLVE') {
      alertsState[alertIndex].status = 'RESOLVED';
    }
    if (note) {
      alertsState[alertIndex].actionTaken = note;
    }
  }

  res.json({ success: true, alerts: alertsState });
});

// 5. Hospital Data Dataset Upload & Model Retraining Simulation
app.post('/api/data/retrain', (req: Request, res: Response) => {
  const { datasetRows = 120, algorithm = 'Prophet + XGBoost' } = req.body;

  mlMetricsState = {
    ...mlMetricsState,
    status: 'ACTIVE',
    lastUpdated: `Retrained just now (${new Date().toLocaleTimeString()}) with ${datasetRows} records`,
    mae: Math.round((mlMetricsState.mae * 0.96) * 100) / 100,
    rmse: Math.round((mlMetricsState.rmse * 0.95) * 100) / 100,
    mape: Math.round((mlMetricsState.mape * 0.94) * 100) / 100,
    r2Score: Math.min(0.985, Math.round((mlMetricsState.r2Score + 0.005) * 1000) / 1000),
    algorithmType: `${algorithm} (Optimized Hyperparameters)`,
  };

  res.json({
    success: true,
    message: 'Model retrained successfully with new historical dataset.',
    metrics: mlMetricsState,
  });
});

// 6. Doctors & OPD Tokens
app.get('/api/doctors', (_req: Request, res: Response) => {
  res.json({ success: true, doctors: doctorsState });
});

app.post('/api/opd/book', (req: Request, res: Response) => {
  const {
    patientName,
    patientAge,
    patientGender,
    patientPhone,
    hospitalId,
    hospitalName,
    department,
    doctorId,
    doctorName,
    date,
    timeSlot,
    reasonForVisit,
    symptoms = [],
    priority = 'REGULAR',
  } = req.body;

  const tokenNumber = `T-${Math.floor(100 + Math.random() * 900)}`;
  const newToken: OPDToken = {
    id: `tok-${Date.now()}`,
    tokenNumber,
    patientName,
    patientAge: Number(patientAge),
    patientGender,
    patientPhone,
    hospitalId,
    hospitalName,
    department,
    doctorId,
    doctorName,
    date: date || new Date().toISOString().split('T')[0],
    timeSlot: timeSlot || '11:00 AM - 11:30 AM',
    reasonForVisit: reasonForVisit || 'General Medical Consultation',
    symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
    queuePosition: opdTokensState.length + 1,
    estimatedWaitMins: (opdTokensState.length + 1) * 10,
    status: 'WAITING',
    qrCodeHash: `AROGYA-OPD-${tokenNumber}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    priority,
  };

  opdTokensState.unshift(newToken);
  res.json({ success: true, token: newToken });
});

app.get('/api/opd/tokens', (_req: Request, res: Response) => {
  res.json({ success: true, tokens: opdTokensState });
});

// 7. Bed Requests
app.post('/api/beds/request', (req: Request, res: Response) => {
  const {
    patientName,
    patientAge,
    patientGender,
    contactNumber,
    hospitalId,
    hospitalName,
    department,
    bedCategory,
    urgency = 'ELECTIVE',
    reason,
    attendantName,
  } = req.body;

  const newRequest: BedRequest = {
    id: `req-${Date.now()}`,
    patientName,
    patientAge: Number(patientAge),
    patientGender,
    contactNumber,
    hospitalId,
    hospitalName,
    department,
    bedCategory,
    urgency,
    reason,
    attendantName,
    status: 'PENDING_CONFIRMATION',
    submittedAt: 'Just now',
    updatedAt: 'Just now',
  };

  bedRequestsState.unshift(newRequest);
  res.json({ success: true, request: newRequest });
});

app.get('/api/beds/requests', (_req: Request, res: Response) => {
  res.json({ success: true, requests: bedRequestsState });
});

app.post('/api/beds/requests/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, allocatedBedNumber } = req.body;

  const index = bedRequestsState.findIndex(r => r.id === id);
  if (index !== -1) {
    bedRequestsState[index].status = status;
    if (allocatedBedNumber) {
      bedRequestsState[index].allocatedBedNumber = allocatedBedNumber;
    }
    bedRequestsState[index].updatedAt = 'Just now';
  }

  res.json({ success: true, requests: bedRequestsState });
});

// 8. Emergency SOS Module
app.post('/api/emergency/sos', (req: Request, res: Response) => {
  const {
    patientName,
    age,
    contactNumber,
    location,
    emergencyType,
    symptoms,
    preferredHospitalId,
    preferredHospitalName,
  } = req.body;

  const newSOS: EmergencySOSRequest = {
    id: `sos-${Date.now()}`,
    patientName: patientName || 'Emergency Patient',
    age: Number(age) || 45,
    contactNumber: contactNumber || '+91 99999 99999',
    location: location || 'Live GPS Location Shared',
    emergencyType: emergencyType || 'Chest pain',
    symptoms: symptoms || 'Acute distress reported',
    preferredHospitalId: preferredHospitalId || 'hosp-1',
    preferredHospitalName: preferredHospitalName || 'Arogya Central Multi-Speciality Research Hospital',
    timestamp: 'Just now',
    status: 'AMBULANCE_EN_ROUTE',
    etaMinutes: Math.floor(4 + Math.random() * 6),
    ambulanceUnit: `ALS-Unit #${Math.floor(10 + Math.random() * 89)}`,
    paramedicContact: '+91 98200 11999',
    vitalsNote: 'Emergency Triage Dispatched. Hospital trauma team notified.',
  };

  emergencyLogsState.unshift(newSOS);
  res.json({ success: true, sos: newSOS });
});

app.get('/api/emergency/logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: emergencyLogsState });
});

// Clinical health knowledge helper for offline/resilience fallback
function generateComprehensiveHealthResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('blood pressure') || q.includes('hypertension') || q.includes(' bp ') || q.includes('bp?')) {
    return `### Understanding Blood Pressure & Cardiovascular Health

**1. Normal Reference Standards:**
• **Normal:** Less than 120/80 mmHg
• **Elevated:** Systolic between 120–129 mmHg and Diastolic < 80 mmHg
• **Stage 1 Hypertension:** Systolic 130–139 mmHg OR Diastolic 80–89 mmHg
• **Stage 2 Hypertension:** Systolic ≥ 140 mmHg OR Diastolic ≥ 90 mmHg

**2. Key Drivers & Contributing Factors:**
• High dietary sodium (processed foods, excessive salt)
• Sedentary lifestyle and prolonged physical inactivity
• Chronic emotional or work-related stress
• Genetics, family history, and age-related vascular stiffness

**3. Evidence-Based Lifestyle & Nutritional Steps:**
• **Adopt the DASH Diet:** Emphasize leafy greens, potassium-rich foods (bananas, sweet potatoes), whole grains, and lean proteins.
• **Limit Sodium:** Keep daily sodium intake below 2,000 mg (approx. 1 teaspoon of table salt).
• **Regular Aerobic Activity:** Aim for at least 30 minutes of moderate aerobic activity (brisk walking, cycling) 5 days a week.
• **Stress Management:** Practice daily diaphragmatic breathing or meditation to lower sympathetic nervous system arousal.

**4. Questions to Ask Your Doctor / Cardiologist:**
• "What is my ideal target blood pressure based on my age and medical history?"
• "Should I maintain a daily home blood pressure log?"
• "Are there specific dietary supplements or medications recommended for my profile?"

*Note: If you experience systolic BP over 180 or diastolic over 120 with headache, chest pain, or vision changes, seek immediate emergency care. Arogya AI provides educational guidance; please consult a licensed physician for clinical management.*`;
  }

  if (q.includes('diabet') || q.includes('sugar') || q.includes('glucose') || q.includes('hba1c')) {
    return `### Comprehensive Guide to Blood Sugar & Diabetes Management

**1. Standard Clinical Blood Sugar Benchmarks:**
• **Fasting Plasma Glucose:** Normal: 70–99 mg/dL | Prediabetes: 100–125 mg/dL | Diabetes: ≥ 126 mg/dL
• **Post-Prandial (2h after meal):** Normal: < 140 mg/dL | Prediabetes: 140–199 mg/dL | Diabetes: ≥ 200 mg/dL
• **HbA1c (3-Month Glycemic Average):** Normal: < 5.7% | Prediabetes: 5.7%–6.4% | Diabetes: ≥ 6.5%

**2. Common Symptoms to Monitor:**
• Increased thirst (polydipsia) and frequent urination (polyuria), especially at night
• Unexplained fatigue, lethargy, or brain fog
• Slow-healing minor cuts or recurring skin infections
• Tingling sensation or numbness in feet or fingers

**3. Nutritional & Lifestyle Pillars:**
• **Low Glycemic Index (GI) Diet:** Opt for complex carbohydrates (oats, millets, quinoa, legumes) that digest slowly and prevent insulin spikes.
• **Fiber Priority:** Consume abundant non-starchy vegetables and soluble fiber to slow glucose absorption.
• **Post-Meal Walking:** A light 10–15 minute walk after meals significantly blunts postprandial glucose surges.
• **Consistent Hydration:** Drink 2.5–3 liters of pure water daily to support kidney filtration.

**4. Key Questions for Your Diabetologist / Physician:**
• "What is my individual target HbA1c range?"
• "How frequently should I check my fasting and post-meal numbers?"
• "Should I get an annual diabetic retinopathy (eye) and foot neuropathy evaluation?"

*Note: Arogya AI provides health information and care navigation. Always follow your physician's personalized prescription and testing schedule.*`;
  }

  if (q.includes('fever') || q.includes('temperature') || q.includes('chills')) {
    return `### Fever Assessment & Supportive Home Care

**1. Body Temperature Reference:**
• **Normal Range:** 97.7°F to 99.5°F (36.5°C to 37.5°C)
• **Low-Grade Fever:** 99.6°F to 100.9°F
• **Moderate to High Fever:** 101.0°F to 103.0°F
• **High-Grade Fever:** > 103.0°F (39.4°C)

**2. Why Fever Occurs:**
Fever is a natural immunological defense mechanism. The hypothalamus resets body temperature in response to pyrogens to inhibit pathogen replication and stimulate white blood cells.

**3. Supportive Home Measures:**
• **Aggressive Hydration:** Drink plenty of fluids—oral rehydration salts (ORS), tender coconut water, warm broths, or clear soups—to prevent dehydration.
• **Adequate Rest:** Conserve energy to support immune recovery.
• **Lukewarm Sponging:** If uncomfortable, apply a cloth dampened with lukewarm (NOT cold/ice) water to the forehead, neck, and armpits.
• **Wear Light, Breathable Clothes:** Avoid bundling up in heavy blankets, which traps excessive body heat.

**4. Red Flags Requiring Immediate Medical Attention:**
• Fever exceeding 103°F (39.4°C) or lasting longer than 3 consecutive days
• Stiff neck, extreme photophobia (light sensitivity), or severe persistent headache
• Difficulty breathing, chest tightness, or persistent vomiting
• Confusion, extreme drowsiness, or seizures

*Note: Never administer aspirin to children or teenagers due to Reye's syndrome risk. Consult a qualified doctor for persistent or unexplained fevers.*`;
  }

  if (q.includes('headache') || q.includes('migraine')) {
    return `### Understanding Headaches & Relief Strategies

**1. Common Classifications:**
• **Tension Headache:** Most prevalent; characterized by a dull, aching "band-like" pressure around both sides of the head. Often caused by stress, posture, or screen fatigue.
• **Migraine:** Throbbing, typically unilateral (one-sided) pain often accompanied by nausea, sensitivity to light/sound, and visual auras.
• **Sinus Headache:** Pressure and pain around the cheekbones, forehead, and bridge of the nose, often paired with nasal congestion.
• **Dehydration / Fatigue Headache:** Triggered by insufficient fluid intake or erratic sleep patterns.

**2. Practical Relief Steps:**
• **Rest in a Quiet, Dark Room:** Reduces sensory stimulation, particularly helpful for migraines and tension headaches.
• **Hydration & Electrolytes:** Drink 500–750 ml of room-temperature water or coconut water.
• **Temperature Therapy:** Apply a cold compress across the forehead or a warm compress on the back of the neck to relieve tense cervical muscles.
• **Gentle Neck & Shoulder Stretches:** Relieves postural tension from desk work.
• **Reduce Screen Exposure:** Take regular breaks following the 20-20-20 rule.

**3. Warning Signs (Seek Urgent Care):**
• Sudden, explosive "thunderclap" headache reaching maximum intensity within seconds
• Headache accompanied by fever, stiff neck, numbness, weakness, or difficulty speaking
• Headache following a head injury or fall

*Note: For recurrent headaches, maintain a headache trigger journal and consult a neurologist or general physician.*`;
  }

  if (q.includes('cold') || q.includes('cough') || q.includes('sore throat') || q.includes('flu')) {
    return `### Respiratory Health: Cough, Cold & Sore Throat Guidance

**1. Clinical Overview:**
Most upper respiratory tract infections are viral (rhinovirus, coronavirus, influenza) and typically resolve naturally within 7 to 10 days with supportive care.

**2. Effective Evidence-Based Home Relief:**
• **Warm Saltwater Gargling:** Dissolve 1/2 teaspoon of salt in a glass of warm water and gargle 3–4 times daily to soothe throat inflammation.
• **Steam Inhalation:** Inhale warm steam for 5–10 minutes to loosen nasal congestion and lubricate airways.
• **Natural Soothers:** Warm water or herbal tea with honey and ginger provides natural demulcent (throat-coating) relief. *(Do not give honey to infants under 1 year).*
• **Hydration & Elevation:** Elevate your head with an extra pillow while sleeping to reduce post-nasal drip cough.

**3. Dry vs. Wet Cough:**
• **Dry Cough:** Tickling, non-productive sensation; benefits from warm liquids, throat lozenges, and humidifiers.
• **Wet/Productive Cough:** Produces mucus; avoid suppressing productive coughs completely, as coughing clears secretions.

**4. When to Consult a Doctor:**
• Cough persisting beyond 2–3 weeks
• High fever, shortness of breath, wheezing, or chest pain
• Coughing up thick discolored phlegm or blood
• Inability to swallow fluids or open the mouth fully

*Note: Antibiotics are ineffective against viral infections and should only be taken when specifically prescribed by a physician for confirmed bacterial infections.*`;
  }

  if (q.includes('acidity') || q.includes('gerd') || q.includes('heartburn') || q.includes('acid reflux') || q.includes('gas') || q.includes('stomach')) {
    return `### Managing Acidity, Heartburn & Digestive Health

**1. Mechanism of Acid Reflux (GERD):**
Acid reflux occurs when the lower esophageal sphincter (LES) temporarily relaxes, allowing stomach acid and digestive juices to flow back upward into the esophagus, causing a burning sensation.

**2. Common Triggers:**
• Spicy, oily, deep-fried, or highly acidic foods (citrus, tomatoes)
• Lying down flat immediately within 2–3 hours of eating
• Excessive consumption of caffeinated drinks, carbonated sodas, or chocolate
• Overeating or eating very rapidly under stress

**3. Evidence-Based Lifestyle & Nutritional Measures:**
• **Smaller, Frequent Meals:** Reduces intragastric pressure and prevents the LES from being overwhelmed.
• **Elevate Head of Bed:** Raise your pillow/head by 6 inches while sleeping to leverage gravity against acid backflow.
• **Stay Upright Post-Meal:** Remain seated or take a gentle 10-minute stroll after meals; never recline immediately.
• **Soothing Foods:** Cold milk (in moderation), tender coconut water, oatmeal, and bananas help neutralize mild acidity naturally.

**4. Questions to Discuss with a Gastroenterologist:**
• "Is my acidity an episodic reaction or chronic GERD?"
• "Should an upper GI endoscopy or H. pylori test be performed if symptoms persist?"
• "Are there safe long-term acid-suppressing strategies tailored to me?"

*Note: Burning chest pain can sometimes mimic cardiac symptoms. If accompanied by sweating, arm pain, or breathlessness, seek emergency medical care immediately.*`;
  }

  if (q.includes('cholesterol') || q.includes('lipid') || q.includes('triglyceride')) {
    return `### Understanding Cholesterol & Lipid Profiles

**1. Clinical Lipid Reference Ranges:**
• **Total Cholesterol:** Desirable: < 200 mg/dL | Borderline: 200–239 mg/dL | High: ≥ 240 mg/dL
• **LDL ("Bad" Cholesterol):** Optimal: < 100 mg/dL | Near Optimal: 100–129 mg/dL | High: ≥ 160 mg/dL
• **HDL ("Good" Protective Cholesterol):** Men: > 40 mg/dL | Women: > 50 mg/dL (higher is protective)
• **Triglycerides:** Normal: < 150 mg/dL | Borderline: 150–199 mg/dL | High: ≥ 200 mg/dL

**2. How Cholesterol Affects Arterial Health:**
Excess circulating LDL particles can oxidize and deposit within endothelial walls, creating atherosclerotic plaques that narrow coronary arteries over time.

**3. Actionable Heart-Healthy Steps:**
• **Increase Soluble Fiber:** Eat oatmeal, barley, kidney beans, apples, and flaxseeds, which bind to cholesterol in the digestive system.
• **Healthy Fats:** Replace saturated fats (butter, palm oil, fatty meats) with monounsaturated and omega-3 fats (extra virgin olive oil, walnuts, chia seeds, fatty fish).
• **Eliminate Trans Fats:** Avoid baked goods, fried snacks, and partially hydrogenated oils.
• **Aerobic Exercise:** 150 minutes of weekly cardio raises protective HDL levels and lowers triglycerides.

*Note: If lipid levels are markedly elevated, your physician may recommend statin therapy alongside dietary modifications.*`;
  }

  if (q.includes('sleep') || q.includes('insomnia') || q.includes('tired') || q.includes('fatigue')) {
    return `### Sleep Optimization & Overcoming Fatigue

**1. Sleep Architecture & Need:**
Adults require 7 to 9 hours of quality sleep nightly to facilitate physical tissue repair, memory consolidation, hormone regulation, and immune optimization.

**2. Science-Backed Sleep Hygiene Protocol:**
• **Consistent Wake Time:** Wake up at the exact same hour 7 days a week to anchor your circadian rhythm.
• **Digital Curfew:** Power down smartphones, laptops, and TVs at least 60 minutes before bedtime; blue light suppresses melatonin production.
• **Optimized Bedroom Environment:** Keep your bedroom cool (around 18–20°C / 65–68°F), dark, and quiet.
• **Caffeine Cutoff:** Avoid caffeine (coffee, energy drinks, tea) after 2:00 PM; caffeine has a 5–7 hour half-life.
• **The 4-7-8 Breathing Technique:** Inhale through your nose for 4 seconds, hold for 7 seconds, and exhale slowly through your mouth for 8 seconds to activate the parasympathetic nervous system.

**3. Investigating Chronic Fatigue:**
If you feel tired despite 8 hours in bed, consider screening with your doctor for:
• Iron deficiency / low ferritin
• Vitamin D3 or Vitamin B12 deficiency
• Hypothyroidism (TSH test)
• Obstructive sleep apnea (snoring, morning dry mouth, gasping)

*Note: Arogya AI provides sleep education. Consult your healthcare provider if insomnia or fatigue persists.*`;
  }

  if (q.includes('back pain') || q.includes('joint pain') || q.includes('knee') || q.includes('arthritis')) {
    return `### Musculoskeletal Health: Back & Joint Pain Management

**1. Common Causes of Back & Joint Discomfort:**
• Postural strain from prolonged sedentary sitting and forward head posture
• Weak core musculature failing to support lumbar vertebrae
• Osteoarthritis (cartilage wear) or inflammatory joint conditions
• Acute muscle spasms or ligament sprains from improper lifting

**2. Immediate Self-Care Recommendations:**
• **Temperature Therapy:** Use cold ice packs for the first 48 hours following an acute strain; transition to moist heat thereafter to relax tight muscles.
• **Gentle Movement:** Avoid prolonged bed rest beyond 24–48 hours; gentle walking and stretching prevent stiffness.
• **Ergonomic Adjustments:** Keep computer monitors at eye level, knees at 90 degrees, and lower back supported with a lumbar cushion.
• **Low-Impact Exercises:** Swimming, walking, and stationary cycling strengthen supporting muscles without joint impact.

**3. Red Flag Symptoms (Seek Immediate Orthopedic/ER Care):**
• Numbness, tingling, or weakness radiating down into the legs or arms
• Unexplained loss of bowel or bladder control (cauda equina syndrome)
• Severe back pain accompanied by unexplained fever or history of cancer

*Note: Always consult an orthopedic specialist or physiotherapist for persistent joint or spinal pain.*`;
  }

  if (q.includes('diet') || q.includes('nutrition') || q.includes('food') || q.includes('weight') || q.includes('vitamin')) {
    return `### Nutrition, Micronutrients & Balanced Health

**1. The Balanced Plate Blueprint:**
• **50% Vegetables & Fruits:** Varied colors providing polyphenols, bioflavonoids, and dietary fiber.
• **25% Lean Protein:** Lentils, chickpeas, paneer, tofu, eggs, fish, or chicken to support muscle synthesis and cellular repair.
• **25% Complex Carbohydrates:** Brown rice, whole wheat, oats, millets (ragi, jowar) for sustained energy.
• **Healthy Fats:** Handful of nuts (almonds, walnuts) and seeds daily.

**2. Crucial Micronutrients to Monitor:**
• **Vitamin D3:** Essential for bone mineralization and immune competence. Tested via 25-hydroxy vitamin D.
• **Vitamin B12:** Vital for neurological function and red blood cell creation; vegetarians often benefit from supplementation.
• **Iron & Hemoglobin:** Iron-rich foods include spinach, beetroots, pomegranate, dates, and legumes (pair with vitamin C for optimal absorption).
• **Hydration:** Aim for 2.5 to 3.5 liters of clean water daily based on climate and activity.

*Note: For specific medical diets (renal, cardiac, diabetic), consult a registered clinical dietitian.*`;
  }

  // General Comprehensive Healthcare Overview for all other queries
  return `### Comprehensive Health Guidance & Clinical Insights

**1. Overview & Understanding Your Concern:**
Your health inquiry regarding "${query}" touches on an important aspect of holistic well-being. Good health combines regular physical activity, balanced nutrition, proactive symptom awareness, and timely medical consultations.

**2. Evidence-Based Daily Health Principles:**
• **Consistent Hydration:** Drink 2.5–3 liters of water daily to support cellular metabolism and detoxification.
• **Nutrient-Dense Nutrition:** Prioritize unprocessed whole foods, colorful vegetables, healthy proteins, and dietary fiber while limiting refined sugars and trans fats.
• **Physical Activity:** Strive for at least 30 minutes of moderate aerobic exercise 5 days a week, complemented by gentle stretching.
• **Rest & Recovery:** Prioritize 7–8 hours of restorative sleep and intentional stress-reduction routines (meditation, nature walks).

**3. Proactive Health Monitoring:**
• Track your vital signs periodically (blood pressure, resting heart rate, body weight, blood sugar).
• If you are experiencing symptoms, note their exact onset, duration, triggers, and what provides relief.

**4. Preparing for Your Doctor Consultation:**
• "What could be the root cause of the symptoms I am observing?"
• "Are there baseline diagnostic tests (e.g. Complete Blood Count, Metabolic Panel, Vitals) you recommend?"
• "What lifestyle or dietary adjustments would be most beneficial for my current profile?"

*Safety Reminder: Arogya AI provides comprehensive educational health guidance. If you experience acute severe symptoms (chest pain, breathlessness, loss of consciousness, or high fever), please call emergency services (108/112) or seek urgent clinical care.*`;
}

// Resilient Gemini generator with timeout protection and instantaneous clinical fallback
async function generateGeminiWithRetry(params: any, retries = 0, timeoutMs = 4000): Promise<string> {
  if (!ai) {
    throw new Error('AI client not initialized');
  }

  let lastError: any = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const generatePromise = ai.models.generateContent(params);
      let timer: NodeJS.Timeout | null = null;
      const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini API timeout after ' + timeoutMs + 'ms')), timeoutMs);
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      if (timer) clearTimeout(timer);

      const text = response.text;
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      const isRecoverable =
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('timeout') ||
        err?.status === 503;
      if (attempt < retries && isRecoverable) {
        await new Promise(r => setTimeout(r, 400));
        continue;
      }
      break;
    }
  }
  throw lastError || new Error('Failed to generate content');
}

// 9. Arogya AI Health Assistant (Gemini 3.8 Flash Integration with Comprehensive Health Coverage)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Check for critical emergency red flags
  const lowerMsg = message.toLowerCase();
  const isEmergencyAlert =
    lowerMsg.includes('chest pain') ||
    lowerMsg.includes('heart attack') ||
    lowerMsg.includes('cannot breathe') ||
    lowerMsg.includes('cant breathe') ||
    lowerMsg.includes('unconscious') ||
    lowerMsg.includes('heavy bleeding') ||
    lowerMsg.includes('severe stroke') ||
    lowerMsg.includes('facial drooping');

  // Safety system instruction answering ALL health-related questions
  const systemInstruction = `You are "Arogya AI Assistant", an advanced, compassionate, and comprehensive clinical healthcare and wellness AI companion.

YOUR MISSION: Answer ALL health, medical, wellness, clinical, nutritional, and patient queries thoroughly, accurately, empathetically, and clearly.

TOPICS YOU FULLY ANSWER:
1. Symptoms, Illnesses & Medical Conditions: Explain symptoms, biological mechanisms, causes, and progression for any condition (e.g., fever, headaches, diabetes, hypertension, GERD, asthma, arthritis, thyroid disorders, allergies, infections, skin conditions, mental wellness, anxiety, etc.).
2. Diagnostic Tests, Lab Values & Vitals: Explain what blood tests mean (CBC, Hemoglobin, WBC, Platelets, Lipid Profile, HbA1c, LFT, KFT, Creatinine), normal clinical reference ranges, and what high/low readings imply.
3. Diet, Nutrition & Lifestyle: Provide evidence-based nutrition tips, heart-healthy habits, diabetic-friendly foods, hydration goals, vitamins/supplements, sleep hygiene, safe exercise routines, and stress management.
4. Medications & Treatment Concepts: Explain the purpose, category, and mechanisms of medications, general precautions, why completing prescribed courses is crucial, and questions to ask the pharmacist. (Do not prescribe specific prescription drugs or personalized dosages).
5. Home Care & Supportive Measures: Offer evidence-backed home remedies and first aid (e.g. hydration, steam, warm gargles, RICE protocol for sprains, rest).
6. Doctor Consultation Preparation: Help patients organize their symptoms clearly, prepare chronological timelines, and formulate targeted questions to ask their doctor during OPD visits.
7. Care Navigation & Hospital Triage: Help patients understand hospital departments (Cardiology, Neurology, Orthopedics, Gastroenterology, General Medicine) and determine the appropriate level of care (OPD token booking, urgent clinic, or emergency ER).

RESPONSE FORMAT:
- Structure your answer with clear markdown headings, bullet points, and bold key terms for effortless readability.
- Keep the tone empathetic, reassuring, professional, and accessible.
- Provide actionable takeaways and questions the patient can discuss with their treating doctor.

SAFETY & DISCLAIMER:
- End every response with a brief supportive disclaimer: "*Note: This guidance is for educational and healthcare awareness purposes. Please consult your physician for individualized clinical diagnosis and prescription.*"
- If life-threatening red flags are present, immediately prioritize emergency stabilization advice and urge calling emergency services (108 / 112) or clicking the Red Emergency SOS button in Arogya AI.`;

  try {
    const formattedContents = [
      ...history.map((h: { sender: string; text: string }) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    let reply = '';
    if (ai) {
      try {
        reply = await generateGeminiWithRetry({
          model: 'gemini-3.8-flash',
          contents: formattedContents as any,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (geminiErr: any) {
        console.warn('Gemini 3.8 Flash temporarily unavailable, generating clinical knowledge answer:', geminiErr?.message);
        reply = generateComprehensiveHealthResponse(message);
      }
    } else {
      reply = generateComprehensiveHealthResponse(message);
    }

    res.json({
      reply,
      isEmergencyAlert,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.json({
      reply: generateComprehensiveHealthResponse(message),
      isEmergencyAlert,
    });
  }
});

// 10. AI Report Assistant (OCR Vision & Multi-lingual Report Analysis)
app.post('/api/reports/analyze', async (req: Request, res: Response) => {
  const { imageBase64, mimeType = 'image/jpeg', fileName = 'Medical_Report.jpg', sampleId } = req.body;

  if (!ai || !imageBase64) {
    return res.status(400).json({ error: 'Image data and AI client required.' });
  }

  try {
    // Strip prefix if user passed full data URL
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');

    const prompt = `You are an expert, compassionate healthcare AI report assistant. 
Analyze this uploaded medical document / laboratory test / radiology report carefully using OCR and clinical vision reasoning.
Extract all relevant laboratory values, radiology findings, or clinical notes.

Return ONLY a valid JSON object matching this exact structure (NO extra markdown backticks, pure valid JSON):
{
  "reportType": "Name of the test or report (e.g., Complete Blood Count, Lipid Profile, Chest X-Ray)",
  "patientName": "Extracted patient name and age if visible, else 'Patient Document'",
  "reportDate": "Date of the report if visible, else 'Recent'",
  "labOrHospital": "Hospital or Diagnostic Lab name if visible",
  "overallSummary": "A simple 2-3 paragraph explanation of the report in friendly, clear, plain language that a patient or elderly family member can easily understand without medical confusion.",
  "spokenSummary": "A natural, warm, conversational audio script (2-4 sentences in English) designed for text-to-speech reading. Start with: 'Your report has been analyzed. I will explain the important points in simple language.' Then highlight the main findings clearly.",
  "spokenSummaryHi": "The spoken summary translated naturally into spoken Hindi (Devanagari script) for voice narration.",
  "spokenSummaryMr": "The spoken summary translated naturally into spoken Marathi (Devanagari script) for voice narration.",
  "keyObservations": [
    "Key observation bullet 1",
    "Key observation bullet 2",
    "Key observation bullet 3"
  ],
  "abnormalValues": [
    {
      "testName": "Name of the test",
      "value": "Measured value",
      "unit": "Unit (e.g., mg/dL, g/dL)",
      "referenceRange": "Normal reference range",
      "status": "HIGH or LOW or CRITICAL or BORDERLINE",
      "simpleExplanation": "Plain language explanation of what this test means and why this number is elevated or reduced.",
      "recommendation": "Suggested action or question for doctor"
    }
  ],
  "normalValues": [
    {
      "testName": "Name of the test",
      "value": "Measured value",
      "unit": "Unit",
      "referenceRange": "Normal range",
      "simpleExplanation": "Why this normal finding is good news"
    }
  ],
  "importantDatesAndNumbers": [
    { "label": "Key metric/date name", "value": "Value" }
  ],
  "termExplanations": [
    {
      "term": "Medical term used in report",
      "simpleMeaning": "Simple translation for non-doctors",
      "whyItMatters": "Why this matters to the patient"
    }
  ],
  "doctorDiscussionQuestions": [
    "Suggested question 1 to ask the doctor during next consultation",
    "Suggested question 2",
    "Suggested question 3"
  ],
  "disclaimer": "This is an AI-generated explanation to help you understand your laboratory results in simple language. It is not a clinical medical diagnosis. Please consult your physician for personalized medical advice."
}

Safety Rule: DO NOT make a definitive clinical diagnosis. If there are concerning or critical values, clearly advise consulting a licensed physician.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
                data: cleanBase64,
              },
            },
            { text: prompt },
          ],
        },
      ],
      config: {
        temperature: 0.2,
      },
    });

    const responseText = response.text || '';
    // Clean potential markdown codeblock wrapping
    const cleanedJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedData = JSON.parse(cleanedJson);

    const result = {
      id: `rep-${Date.now()}`,
      fileName,
      imageUrl: imageBase64.startsWith('data:') ? imageBase64 : `data:${mimeType};base64,${cleanBase64}`,
      ...parsedData,
      analyzedAt: 'Just now (Vision AI & Clinical Reasoning Engine)',
    };

    res.json({ success: true, analysis: result });
  } catch (error: any) {
    console.error('Vision report analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze report image. Please ensure the image is clear and contains readable text.',
    });
  }
});

// 11. Follow-up Q&A on Analyzed Medical Report & General Health
app.post('/api/reports/chat', async (req: Request, res: Response) => {
  const { question, reportContext, history = [], language = 'en' } = req.body;

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const systemInstruction = `You are "Arogya AI Report & Health Assistant", an expert, empathetic clinical AI companion.
You are helping a patient understand their medical/laboratory report AND answering any health, wellness, diet, or clinical questions they ask.

Here is the extracted clinical context from their uploaded report (if any):
${JSON.stringify(reportContext || {}, null, 2)}

Instructions:
1. Answer the patient's questions specifically and directly.
2. If the question relates to the report (e.g. "What does this value mean?", "Is this normal?", "Explain in simple words", "Why is my hemoglobin low?"), explain the clinical significance in simple, comforting language and connect it to their overall health.
3. If the user asks a broader health or wellness question (e.g., diet, symptoms, foods, exercises, related conditions, or general medical inquiries), answer it completely with clinical clarity and structured takeaways.
4. If the language requested is Hindi (hi) or Marathi (mr), respond directly in that language (using natural Devanagari script).
5. Format responses with clean markdown headings and bullet points.
6. Safety: DO NOT formulate definitive diagnoses or prescribe medications. Advise reviewing abnormal values with their treating doctor.`;

  try {
    const formattedContents = [
      ...history.map((h: { sender: string; text: string }) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: question }],
      },
    ];

    let reply = '';
    if (ai) {
      try {
        reply = await generateGeminiWithRetry({
          model: 'gemini-3.8-flash',
          contents: formattedContents as any,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });
      } catch (geminiErr: any) {
        console.warn('Gemini temporarily unavailable for report chat, using clinical knowledge:', geminiErr?.message);
        reply = generateComprehensiveHealthResponse(question);
      }
    } else {
      reply = generateComprehensiveHealthResponse(question);
    }

    res.json({
      reply,
    });
  } catch (error: any) {
    console.error('Report chat error:', error);
    res.json({
      reply: generateComprehensiveHealthResponse(question),
    });
  }
});

// Vite middleware in dev or static serving in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Arogya AI] Full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
