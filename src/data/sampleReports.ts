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
      spokenSummary: "Your Complete Blood Count report has been analyzed. I will explain the important points in simple language. Your hemoglobin level is 9.2, which is lower than the normal range of 12 to 15. This indicates mild anemia, which often causes fatigue or weakness. Also, your platelet count is 95,000, which is slightly below the normal minimum of 150,000. Your white blood cells are completely normal, meaning there is no active bacterial infection. I recommend discussing these results with your doctor, who may suggest an iron profile or dietary supplements.",
      spokenSummaryHi: "आपकी कम्पलीट ब्लड काउंट रिपोर्ट का विश्लेषण कर लिया गया है। मैं मुख्य बातों को आसान भाषा में समझाता हूँ। आपका हीमोग्लोबिन 9.2 है, जो सामान्य 12 से 15 से कम है। यह हल्के एनीमिया का संकेत देता है जिससे थकान या कमजोरी महसूस हो सकती है। साथ ही प्लेटलेट्स 95,000 हैं जो सामान्य से थोड़े कम हैं। आपके व्हाइट ब्लड सेल्स पूरी तरह सामान्य हैं। कृपया इस रिपोर्ट को अपने डॉक्टर को दिखाएं ताकि वे सही सलाह दे सकें।",
      spokenSummaryMr: "तुमच्या कम्प्लीट ब्लड काउंट रिपोर्टचे विश्लेषण झाले आहे. मी महत्त्वाचे मुद्दे सोप्या भाषेत सांगतो. तुमचे हिमोग्लोबिन 9.2 आहे, जे सामान्य 12 ते 15 पेक्षा कमी आहे. यामुळे थकवा किंवा अशक्तपणा जाणवू शकतो. तसेच प्लेटलेट्स 95,000 आहेत, जे सामान्य पातळीपेक्षा थोडे कमी आहेत. पांढऱ्या पेशी पूर्णपणे सामान्य आहेत. योग्य उपचारांसाठी डॉक्टरांचा सल्ला नक्की घ्या.",
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
      spokenSummary: "Your metabolic and cholesterol report has been analyzed. Here are the key findings in simple terms. Your HbA1c is 7.4%, which shows your average blood sugar has been higher than normal over the last three months. Your bad LDL cholesterol is 158, which is above the optimal target of under 100. On a positive note, your kidney function test and liver enzymes are completely normal and healthy. Your doctor can help create a balanced diet, exercise routine, or adjust medication to bring your sugar and cholesterol into healthy ranges.",
      spokenSummaryHi: "आपकी कोलेस्ट्रॉल और शुगर रिपोर्ट का विश्लेषण किया गया है। मुख्य बातें: आपका HbA1c 7.4% है, जो दर्शाता है कि पिछले 3 महीनों में शुगर का स्तर थोड़ा अधिक रहा है। आपका खराब LDL कोलेस्ट्रॉल 158 है जो सामान्य 100 से ज्यादा है। अच्छी बात यह है कि किडनी और लिवर की जांच बिल्कुल सामान्य है। कृपया उचित खान-पान और दवा के लिए अपने डॉक्टर से परामर्श करें।",
      spokenSummaryMr: "तुमच्या लिपिड आणि शुगर रिपोर्टचे विश्लेषण केले आहे. मुख्य मुद्दे: तुमचा HbA1c 7.4% आहे, जो रक्तातील साखरेचे प्रमाण थोडे जास्त असल्याचे दर्शवतो. तसेच LDL म्हणजेच वाईट कोलेस्टेरॉल 158 आहे जे सामान्य मर्यादेपेक्षा जास्त आहे. चांगली गोष्ट म्हणजे किडनीचे कार्य अगदी सामान्य आहे. योग्य डाएट आणि उपचारांसाठी डॉक्टरांचा सल्ला घ्या.",
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
      spokenSummary: "Your thyroid and liver function report has been analyzed. The main finding is that your Thyroid Stimulating Hormone, or TSH, is 8.8, which is above the standard range of 0.4 to 4.2. This indicates a mildly underactive thyroid, also called hypothyroidism, which can cause slow metabolism, tiredness, or dry skin. On the other hand, all your liver tests, including SGOT, SGPT, and Bilirubin, are completely normal and healthy. Your doctor will likely prescribe a mild thyroid hormone tablet to bring your TSH back to normal.",
      spokenSummaryHi: "आपकी थायरॉइड और लिवर रिपोर्ट का विश्लेषण हो चुका है। मुख्य परिणाम: आपका TSH 8.8 है, जो सामान्य 0.4 से 4.2 से अधिक है। यह हाइपोथायरायडिज्म (सुस्त थायरॉइड) का संकेत है, जिससे सुस्ती, वजन बढ़ना या ठंड लगना हो सकता है। अच्छी बात है कि आपका लिवर पूरी तरह स्वस्थ और सामान्य है। डॉक्टर आपको थायरॉइड संतुलन के लिए उचित दवा दे सकते हैं।",
      spokenSummaryMr: "तुमच्या थायरॉईड आणि लिव्हर रिपोर्टचे विश्लेषण झाले आहे. महत्त्वाचा मुद्दा: तुमचा TSH 8.8 आहे, जो सामान्य 4.2 पेक्षा जास्त आहे. याला हायपोथायरॉईडीझम म्हणतात, ज्यामुळे आळस, वजन वाढणे किंवा केस गळणे होऊ शकते. तुमचे लिव्हर आणि इतर चाचण्या पूर्णपणे नॉर्मल आहेत. थायरॉईड गोळी सुरू करण्यासाठी डॉक्टरांचा सल्ला घ्या.",
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
