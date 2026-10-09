import { SampleReportTemplate } from '../types';

export const SAMPLE_REPORTS: SampleReportTemplate[] = [
  {
    id: 'sample-cbc',
    title: 'Complete Blood Count (CBC) Panel',
    category: 'Hematology / Blood Test',
    badge: 'Anemia & Low Platelets Flagged',
    description: 'A routine blood test measuring red blood cells, white blood cells, hemoglobin, and platelets.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
    mockAnalysis: {
      id: 'rep-cbc-01',
      fileName: 'CBC_Blood_Panel_Sample.pdf',
      imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&auto=format&fit=crop&q=80',
      reportType: 'Complete Blood Count (CBC) & Hemogram',
      patientName: 'Suhani Shambwani (Age: 28, Female)',
      reportDate: '02 Oct 2026',
      labOrHospital: 'Arogya Central Diagnostic & Pathology Labs',
      overallSummary: 'This Complete Blood Count report shows mild anemia with lower-than-normal hemoglobin and red blood cells, which can explain symptoms like tiredness, dizziness, or weakness. Additionally, the platelet count is moderately reduced (thrombocytopenia), while white blood cells and infection markers remain in a normal healthy range.',
      spokenSummary: "This Complete Blood Count shows mild anemia with hemoglobin at 9.2 g/dL, below the normal 12 to 15 range. Platelets are also slightly reduced at 95,000 /mcL, while white blood cells and infection markers are completely normal. No active bacterial infection was detected. Please consult your physician for clinical follow-up; this summary is informational and not a medical diagnosis.",
      spokenSummaryHi: "इस कम्पलीट ब्लड काउंट में हीमोग्लोबिन 9.2 है जो सामान्य 12 से 15 से कम है। प्लेटलेट्स 95,000 हैं जो सामान्य स्तर से थोड़े कम हैं, जबकि व्हाइट ब्लड सेल्स बिल्कुल सामान्य हैं। कोई संक्रमण नहीं पाया गया है। कृपया चिकित्सीय सलाह के लिए अपने डॉक्टर से परामर्श करें; यह सारांश केवल जानकारी हेतु है और कोई चिकित्सीय निदान नहीं है।",
      spokenSummaryMr: "या कम्प्लीट ब्लड काउंटमध्ये हिमोग्लोबिन 9.2 आहे, जे सामान्य 12 ते 15 पेक्षा कमी आहे. प्लेटलेट्स 95,000 असून थोडे कमी आहेत, तर पांढऱ्या रक्तपेशी पूर्णपणे सामान्य आहेत. कोणताही संसर्ग आढळलेला नाही. कृपया उपचारांसाठी डॉक्टरांचा सल्ला घ्या; हा सारांश केवळ माहितीसाठी असून वैद्यकीय निदान नाही.",
      keyObservations: [
        'Hemoglobin is low (9.2 g/dL) indicating iron deficiency or mild microcytic anemia.',
        'Platelet count is 95,000 /mcL (mild thrombocytopenia), requiring clinical follow-up.',
        'Total White Blood Cell count (7,400 /mcL) is healthy, showing no active systemic infection.',
        'RBC indices (MCV 72 fL) suggest smaller red blood cells typically seen in iron deficiency.'
      ],
      abnormalValues: [
        {
          testName: 'Hemoglobin (Hb)',
          value: '9.2',
          unit: 'g/dL',
          referenceRange: '12.0 - 15.5',
          status: 'LOW',
          simpleExplanation: 'Hemoglobin carries oxygen from your lungs to the rest of your body. Low levels cause anemia, making you feel easily tired or breathless.',
          recommendation: 'Ask your doctor about iron studies (Serum Ferritin) and iron-rich diet/supplements.'
        },
        {
          testName: 'Platelet Count',
          value: '95,000',
          unit: '/mcL',
          referenceRange: '150,000 - 450,000',
          status: 'LOW',
          simpleExplanation: 'Platelets help your blood clot when you get a cut. A mild drop means you should avoid harsh physical impacts and watch for unusual bruising.',
          recommendation: 'Monitor for any spontaneous gum bleeding or skin bruising; consult physician.'
        },
        {
          testName: 'Mean Corpuscular Volume (MCV)',
          value: '72.4',
          unit: 'fL',
          referenceRange: '80.0 - 100.0',
          status: 'LOW',
          simpleExplanation: 'This measures the average physical size of your red blood cells. Small cells are classic signs of iron deficiency.'
        }
      ],
      normalValues: [
        {
          testName: 'Total Leukocyte Count (WBC)',
          value: '7,400',
          unit: '/mcL',
          referenceRange: '4,000 - 11,000',
          simpleExplanation: 'Your immune defense cells are in a completely healthy and balanced range.'
        },
        {
          testName: 'Absolute Neutrophil Count',
          value: '4,600',
          unit: '/mcL',
          referenceRange: '2,000 - 7,000',
          simpleExplanation: 'Normal bacterial defense and immune fighting cells.'
        },
        {
          testName: 'Erythrocyte Sedimentation Rate (ESR)',
          value: '14',
          unit: 'mm/hr',
          referenceRange: '0 - 20',
          simpleExplanation: 'No significant systemic inflammation detected.'
        }
      ],
      importantDatesAndNumbers: [
        { label: 'Test Date', value: '02 Oct 2026, 08:30 AM' },
        { label: 'Sample Barcode', value: '#HEM-884920' },
        { label: 'Overall Quality', value: 'Specimen Optimal' },
        { label: 'Critical Alert Flag', value: 'Mild Priority Review' }
      ],
      termExplanations: [
        {
          term: 'Hemoglobin (Hb)',
          simpleMeaning: 'The iron-rich protein in red blood cells that transports oxygen to your organs and muscles.',
          whyItMatters: 'When it is low, organs receive less oxygen, leading to fatigue and cold hands/feet.'
        },
        {
          term: 'Thrombocytopenia',
          simpleMeaning: 'A medical term that simply means having fewer platelets in your blood than usual.',
          whyItMatters: 'Can sometimes happen after viral infections, vitamin B12 deficiency, or medication side effects.'
        },
        {
          term: 'Microcytic RBC',
          simpleMeaning: 'Red blood cells that are smaller in diameter than average.',
          whyItMatters: 'Usually caused by insufficient iron stores in the body.'
        }
      ],
      doctorDiscussionQuestions: [
        'Could my low hemoglobin be caused by iron deficiency or dietary factors?',
        'Do you recommend testing serum ferritin, vitamin B12, or folic acid levels?',
        'When should I repeat the complete blood count to check if my platelets have recovered?'
      ],
      disclaimer: 'This is an AI-generated explanation to help you understand your laboratory results in simple language. It is not a clinical medical diagnosis. Please consult your physician for personalized medical advice.',
      analyzedAt: 'Just now (Instant Vision OCR & Clinical Reasoning)'
    }
  },
  {
    id: 'sample-lipid',
    title: 'Lipid Profile & Diabetic Metabolic Panel',
    category: 'Biochemistry / Metabolic Health',
    badge: 'High LDL & Fasting Glucose',
    description: 'Measures cholesterol levels, triglycerides, fasting blood sugar, and HbA1c for heart & metabolic health.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
    mockAnalysis: {
      id: 'rep-lip-02',
      fileName: 'Lipid_Metabolic_Report.pdf',
      imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80',
      reportType: 'Lipid Profile & Glycemic Panel (HbA1c + Fasting Sugar)',
      patientName: 'Ramesh Patel (Age: 52, Male)',
      reportDate: '01 Oct 2026',
      labOrHospital: 'Metropolis Premier Clinical Laboratories',
      overallSummary: 'This metabolic test shows elevated "bad" LDL cholesterol and elevated fasting blood sugar, with an HbA1c of 7.4% indicating moderately high average blood glucose over the past 3 months (prediabetes/type-2 diabetes range). Good HDL cholesterol is borderline low. Kidney markers like Serum Creatinine are completely normal.',
      spokenSummary: "Your metabolic panel reveals an HbA1c of 7.4%, indicating higher average blood glucose over the past three months. Fasting blood sugar is 142 mg/dL and LDL cholesterol is elevated at 158 mg/dL. Kidney filtration markers including Serum Creatinine are completely normal. Please review these values with your doctor for glycemic and cholesterol planning; this summary is informational and not a medical diagnosis.",
      spokenSummaryHi: "आपकी जांच में HbA1c 7.4% और फास्टिंग शुगर 142 है, जो सामान्य सीमा से अधिक है। खराब LDL कोलेस्ट्रॉल 158 है जो सामान्य से अधिक है, जबकि किडनी की जांच पूरी तरह सामान्य है। खान-पान और दवा के प्रबंधन के लिए अपने डॉक्टर से संपर्क करें; यह सारांश केवल सूचनात्मक है, चिकित्सीय निदान नहीं।",
      spokenSummaryMr: "तुमच्या चाचणीत HbA1c 7.4% आणि फास्टिंग शुगर 142 आहे, जे सामान्य मर्यादेपेक्षा जास्त आहे. LDL कोलेस्टेरॉल 158 असून जास्त आहे, तर किडनीचे कार्य पूर्णपणे सामान्य आहे. योग्य आहार आणि उपचारांसाठी डॉक्टरांचा सल्ला घ्या; हा सारांश केवळ माहितीसाठी असून वैद्यकीय निदान नाही.",
      keyObservations: [
        'HbA1c is 7.4% (elevated, indicating uncontrolled glycemic index).',
        'Fasting Blood Glucose is 142 mg/dL (above normal fasting limit of 100 mg/dL).',
        'LDL ("Bad") Cholesterol is 158 mg/dL (desirable is <100 mg/dL).',
        'Serum Creatinine (0.9 mg/dL) and eGFR (>90 mL/min) show excellent kidney function.'
      ],
      abnormalValues: [
        {
          testName: 'Glycated Hemoglobin (HbA1c)',
          value: '7.4',
          unit: '%',
          referenceRange: '< 5.7 (Normal), 5.7-6.4 (Prediabetes), >=6.5 (Diabetes)',
          status: 'HIGH',
          simpleExplanation: 'This gives a 3-month average of your blood sugar. 7.4% means sugar has been running higher than desired.',
          recommendation: 'Consult your physician or diabetologist for glycemic management.'
        },
        {
          testName: 'LDL Cholesterol ("Bad" Cholesterol)',
          value: '158',
          unit: 'mg/dL',
          referenceRange: '< 100',
          status: 'HIGH',
          simpleExplanation: 'High LDL can slowly form plaque in blood vessels over time. Lowering it protects your heart.',
          recommendation: 'Incorporate aerobic exercise, reduce saturated oils/fats, and consult doctor.'
        },
        {
          testName: 'Fasting Blood Sugar',
          value: '142',
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          status: 'HIGH',
          simpleExplanation: 'Blood glucose level after an overnight fast of 8-10 hours.'
        }
      ],
      normalValues: [
        {
          testName: 'Serum Creatinine',
          value: '0.9',
          unit: 'mg/dL',
          referenceRange: '0.7 - 1.2',
          simpleExplanation: 'A key waste product filtered by the kidneys. Normal value shows healthy kidney filtration.'
        },
        {
          testName: 'Triglycerides',
          value: '138',
          unit: 'mg/dL',
          referenceRange: '< 150',
          simpleExplanation: 'Fats circulating in the blood are within a healthy, safe limit.'
        }
      ],
      importantDatesAndNumbers: [
        { label: 'Fasting Duration', value: '11 Hours (Adequate)' },
        { label: 'HbA1c 3-Mo Avg', value: '7.4% (Estimated Avg Glucose: 165 mg/dL)' },
        { label: 'Cardiovascular Risk', value: 'Moderate - Manageable with Lifestyle' }
      ],
      termExplanations: [
        {
          term: 'HbA1c',
          simpleMeaning: 'The percentage of your hemoglobin that is coated with sugar, showing average glucose control over 90 days.',
          whyItMatters: 'Unlike a daily finger prick test, HbA1c cannot be fooled by what you ate yesterday.'
        },
        {
          term: 'LDL vs HDL Cholesterol',
          simpleMeaning: 'LDL is "bad" cholesterol that deposits in arteries; HDL is "good" cholesterol that clears it away.',
          whyItMatters: 'Keeping LDL low and HDL high reduces long-term cardiac risk.'
        }
      ],
      doctorDiscussionQuestions: [
        'What dietary changes or physical exercise routine do you suggest to lower my LDL cholesterol?',
        'Do I need to adjust or start any daily blood sugar medication for my 7.4% HbA1c?',
        'Should I consult a certified clinical nutritionist for a diabetic-friendly meal plan?'
      ],
      disclaimer: 'This is an AI-generated explanation to help you understand your laboratory results in simple language. It is not a clinical medical diagnosis. Please consult your physician for personalized medical advice.',
      analyzedAt: 'Just now (Instant Vision OCR & Clinical Reasoning)'
    }
  },
  {
    id: 'sample-liver-thyroid',
    title: 'Liver Function (LFT) & Thyroid Panel (TSH)',
    category: 'Endocrinology & Hepatology',
    badge: 'Elevated TSH (Hypothyroidism)',
    description: 'Evaluates thyroid stimulating hormone (TSH), liver enzymes (SGOT/SGPT), and bilirubin.',
    sampleImageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
    mockAnalysis: {
      id: 'rep-thy-03',
      fileName: 'Thyroid_Liver_Function_Panel.pdf',
      imageUrl: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=600&auto=format&fit=crop&q=80',
      reportType: 'Thyroid Profile (TSH, Free T4) & Liver Function Test',
      patientName: 'Pooja Deshmukh (Age: 38, Female)',
      reportDate: '03 Oct 2026',
      labOrHospital: 'City Care Diagnostic Pathology Centre',
      overallSummary: 'Your report indicates an underactive thyroid gland (Hypothyroidism), marked by an elevated TSH of 8.8 uIU/mL and slightly lower Free T4. This commonly leads to feeling sluggish, unexplained weight gain, or feeling cold easily. Meanwhile, your liver function is in pristine health with completely normal bilirubin and liver enzymes.',
      spokenSummary: "Your thyroid test shows an elevated TSH of 8.8 uIU/mL with borderline low Free T4, indicating mild hypothyroidism. All liver function markers including SGPT, SGOT, and Bilirubin are completely normal and healthy. Your doctor may evaluate mild thyroid hormone replacement to normalize your metabolism. Please note this summary is informational and not a medical diagnosis.",
      spokenSummaryHi: "आपकी जांच में थायरॉइड TSH 8.8 है, जो सामान्य सीमा से अधिक है और सुस्त थायरॉइड का संकेत देता है। SGPT और बिलीरुबिन सहित लिवर की सभी जांचें पूरी तरह सामान्य हैं। थायरॉइड संतुलन के लिए अपने चिकित्सक से परामर्श लें; यह सारांश केवल सूचनात्मक है, चिकित्सीय निदान नहीं।",
      spokenSummaryMr: "तुमच्या चाचणीत थायरॉईड TSH 8.8 आहे, जे सामान्य मर्यादेपेक्षा जास्त असून सौम्य हायपोथायरॉईडीझम दर्शवते. लिव्हरच्या सर्व चाचण्या पूर्णपणे सामान्य आहेत. थायरॉईड संतुलनासाठी डॉक्टरांचा सल्ला घ्या; हा सारांश केवळ माहितीसाठी असून वैद्यकीय निदान नाही.",
      keyObservations: [
        'TSH is 8.8 uIU/mL (Elevated - primary hypothyroidism).',
        'Free T4 is 0.78 ng/dL (Borderline low, consistent with high TSH).',
        'Liver enzymes (SGPT/ALT 22 U/L, SGOT/AST 26 U/L) are completely normal.',
        'Total Bilirubin (0.6 mg/dL) is within ideal range.'
      ],
      abnormalValues: [
        {
          testName: 'Thyroid Stimulating Hormone (TSH)',
          value: '8.80',
          unit: 'uIU/mL',
          referenceRange: '0.45 - 4.50',
          status: 'HIGH',
          simpleExplanation: 'TSH is released by your brain to tell your thyroid gland to work harder. High TSH means your thyroid is working too slowly (Hypothyroidism).',
          recommendation: 'Consult an endocrinologist or physician for thyroid hormone (Levothyroxine) evaluation.'
        },
        {
          testName: 'Free Thyroxine (FT4)',
          value: '0.78',
          unit: 'ng/dL',
          referenceRange: '0.82 - 1.77',
          status: 'LOW',
          simpleExplanation: 'The active thyroid hormone responsible for metabolism and energy in body tissues.'
        }
      ],
      normalValues: [
        {
          testName: 'SGPT / ALT (Liver Enzyme)',
          value: '22',
          unit: 'U/L',
          referenceRange: '< 35',
          simpleExplanation: 'Normal liver cell integrity with no sign of inflammation or fatty liver stress.'
        },
        {
          testName: 'Total Bilirubin',
          value: '0.6',
          unit: 'mg/dL',
          referenceRange: '0.2 - 1.2',
          simpleExplanation: 'Bile pigment excretion is healthy with no sign of jaundice.'
        }
      ],
      importantDatesAndNumbers: [
        { label: 'Thyroid Function State', value: 'Mild Primary Hypothyroidism' },
        { label: 'Liver Toxicity Index', value: 'Zero / Normal' },
        { label: 'Follow-up Timeline', value: 'Review in 6 to 8 weeks after starting treatment' }
      ],
      termExplanations: [
        {
          term: 'Hypothyroidism',
          simpleMeaning: 'When the thyroid gland in your neck produces less thyroid hormone than your body needs.',
          whyItMatters: 'Very common, easily manageable with a small daily morning tablet.'
        },
        {
          term: 'SGPT (ALT)',
          simpleMeaning: 'An enzyme found mostly inside liver cells.',
          whyItMatters: 'When the liver is injured, ALT spills into the blood. A normal level confirms healthy liver tissue.'
        }
      ],
      doctorDiscussionQuestions: [
        'Would you recommend starting thyroid replacement therapy (Levothyroxine) based on my TSH of 8.8?',
        'Do I need to take the thyroid medicine on an empty stomach in the morning?',
        'Should we test for thyroid antibodies (Anti-TPO) to check for autoimmune thyroiditis?'
      ],
      disclaimer: 'This is an AI-generated explanation to help you understand your laboratory results in simple language. It is not a clinical medical diagnosis. Please consult your physician for personalized medical advice.',
      analyzedAt: 'Just now (Instant Vision OCR & Clinical Reasoning)'
    }
  }
];
