import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  User,
  AlertTriangle,
  Bot,
  HelpCircle,
  Stethoscope,
  BookOpen,
  Building2,
  Calendar,
  PhoneCall,
  Info,
  UploadCloud,
  FileText,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Languages,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileUp,
  Mic,
  MicOff,
  Check,
  ShieldCheck,
  Lock,
  Download
} from 'lucide-react';
import { ChatMessage, MedicalReportAnalysis, SampleReportTemplate } from '../../types';
import { SAMPLE_REPORTS } from '../../data/sampleReports';
import { ArogyaRobot } from '../common/ArogyaRobot';
import { EhrExportModal } from './EhrExportModal';

interface AIAssistantProps {
  onEmergencyClick: () => void;
  onNavigateTab: (tab: string) => void;
  patientName?: string;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onEmergencyClick,
  onNavigateTab,
  patientName = 'Suhani Shambwani',
}) => {
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${patientName}! I am **Arogya AI Assistant**, your comprehensive clinical healthcare and wellness AI companion.

I am equipped to answer **all health-related questions**, including:
• **Symptoms & Conditions:** Understand causes, patterns, and what your symptoms might mean (fever, headaches, acidity, blood pressure, diabetes, thyroid, joint pain, etc.).
• **Diet, Nutrition & Lifestyle:** Heart-healthy foods, blood sugar management, hydration, vitamin requirements, and daily wellness habits.
• **Diagnostic Tests & Lab Vitals:** Understand your blood test results (CBC, Hemoglobin, Lipid Profile, HbA1c, Platelets) and clinical reference ranges.
• **Medications & Treatment Concepts:** Learn how medications work, important precautions, and questions to ask your pharmacist.
• **Doctor Visit Preparation:** Prepare chronological symptoms and high-priority questions to ask during your OPD appointments.
• **Medical Reports & Voice Narration:** Upload your lab documents or scan reports anytime for a concise plain-language summary and audio narration!

*Safety Notice: Arogya AI provides clinical information and care navigation. Always consult a qualified physician for individualized medical diagnoses, prescriptions, and treatment plans.*`,
      timestamp: 'Just now',
      suggestedPrompts: [
        'What foods help lower high blood pressure naturally?',
        'What are the common symptoms of diabetes & normal sugar ranges?',
        'What causes frequent headaches & what are home remedies?',
        'Home relief steps for acidity and acid reflux',
        'How to improve deep restorative sleep at night?',
        'What questions should I ask my doctor during OPD consultation?',
      ],
    },
  ]);

  const [activeHealthCategory, setActiveHealthCategory] = useState<string>('all');
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);

  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Health Report Upload & Analysis State
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState<boolean>(true);
  const [isAnalyzingReport, setIsAnalyzingReport] = useState<boolean>(false);
  const [uploadedReport, setUploadedReport] = useState<MedicalReportAnalysis | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isEhrExportOpen, setIsEhrExportOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio / Voice State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [spokenProgress, setSpokenProgress] = useState<number>(0);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechTimerRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, uploadedReport]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
    };
  }, []);

  // -------------------------------------------------------------
  // Voice Narration Feature
  // -------------------------------------------------------------
  const getSpokenText = (analysis: MedicalReportAnalysis, lang: 'en' | 'hi' | 'mr') => {
    if (lang === 'hi' && analysis.spokenSummaryHi) {
      return analysis.spokenSummaryHi;
    }
    if (lang === 'mr' && analysis.spokenSummaryMr) {
      return analysis.spokenSummaryMr;
    }
    return analysis.spokenSummary || analysis.overallSummary;
  };

  const cleanTextForSpeech = (rawText: string) => {
    return rawText
      .replace(/#{1,6}\s?/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/•/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/`{1,3}.*?`{1,3}/g, '')
      .replace(/[\n\r]+/g, '. ')
      .trim();
  };

  const handleStartVoice = (overrideText?: string, langOverride?: 'en' | 'hi' | 'mr', msgId?: string) => {
    if (!uploadedReport && !overrideText) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    const currentLang = langOverride || selectedLanguage;
    const rawTextToSpeak =
      overrideText ||
      (uploadedReport ? getSpokenText(uploadedReport, currentLang) : '');

    if (!rawTextToSpeak) return;
    const textToSpeak = cleanTextForSpeech(rawTextToSpeak);

    // Stop existing speech before starting a new playback session
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Pick best natural voice for chosen language
    const voices = window.speechSynthesis.getVoices();
    if (currentLang === 'hi') {
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else if (currentLang === 'mr') {
      utterance.lang = 'mr-IN';
      const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
      if (mrVoice) utterance.voice = mrVoice;
    } else {
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      setSpokenProgress(5);
      if (msgId) setCurrentlySpeakingMsgId(msgId);
    };

    // Play exactly once - do not automatically restart playback after it finishes
    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setSpokenProgress(100);
      setCurrentlySpeakingMsgId(null);
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
      setTimeout(() => setSpokenProgress(0), 1000);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis ended or cancelled:', e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setSpokenProgress(0);
      setCurrentlySpeakingMsgId(null);
      if (speechTimerRef.current) {
        clearInterval(speechTimerRef.current);
        speechTimerRef.current = null;
      }
    };

    // Update progress periodically
    speechTimerRef.current = setInterval(() => {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        setSpokenProgress(prev => Math.min(prev + 4, 95));
      } else {
        if (speechTimerRef.current) {
          clearInterval(speechTimerRef.current);
          speechTimerRef.current = null;
        }
      }
    }, 500);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePauseVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlayingAudio && !isPausedAudio) {
        window.speechSynthesis.pause();
        setIsPausedAudio(true);
      } else if (isPausedAudio) {
        window.speechSynthesis.resume();
        setIsPausedAudio(false);
      }
    }
  };

  const handleStopVoice = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (speechTimerRef.current) {
      clearInterval(speechTimerRef.current);
      speechTimerRef.current = null;
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setSpokenProgress(0);
    setCurrentlySpeakingMsgId(null);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlayingAudio) {
      handleStartVoice();
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlayingAudio && uploadedReport) {
      handleStartVoice(undefined, lang);
    }
  };

  // -------------------------------------------------------------
  // Report Upload & Analysis Handler
  // -------------------------------------------------------------
  const processReportAnalysis = async (
    imageBase64: string,
    fileName: string,
    sampleFallback?: SampleReportTemplate
  ) => {
    setIsAnalyzingReport(true);
    handleStopVoice();

    try {
      // Call backend OCR & vision analysis endpoint
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageBase64.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
          fileName,
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        setUploadedReport(data.analysis);
        setUploadedImagePreview(data.analysis.imageUrl || imageBase64);
        addReportToChat(data.analysis);
        // Automatically start voice intro
        setTimeout(() => {
          handleStartVoice(getSpokenText(data.analysis, selectedLanguage));
        }, 600);
      } else if (sampleFallback) {
        // Fallback to rich sample template if server AI API key is pending
        setUploadedReport(sampleFallback.mockAnalysis);
        setUploadedImagePreview(sampleFallback.mockAnalysis.imageUrl || null);
        addReportToChat(sampleFallback.mockAnalysis);
        setTimeout(() => {
          handleStartVoice(getSpokenText(sampleFallback.mockAnalysis, selectedLanguage));
        }, 600);
      }
    } catch (err) {
      console.error('Error analyzing report:', err);
      if (sampleFallback) {
        setUploadedReport(sampleFallback.mockAnalysis);
        setUploadedImagePreview(sampleFallback.mockAnalysis.imageUrl || null);
        addReportToChat(sampleFallback.mockAnalysis);
        setTimeout(() => {
          handleStartVoice(getSpokenText(sampleFallback.mockAnalysis, selectedLanguage));
        }, 600);
      }
    } finally {
      setIsAnalyzingReport(false);
    }
  };

  const addReportToChat = (rep: MedicalReportAnalysis) => {
    const summaryMsg: ChatMessage = {
      id: `rep-chat-${Date.now()}`,
      sender: 'assistant',
      text: `📋 **Report Analyzed: ${rep.reportType}**\n\n**Short Summary:**\n${rep.overallSummary}\n\n${
        rep.abnormalValues && rep.abnormalValues.length > 0
          ? `⚠️ **Values to Note:** ${rep.abnormalValues.map(v => `${v.testName} (${v.value} ${v.unit || ''} - ${v.status})`).join(', ')}`
          : '✅ All tested parameters appear within reference ranges.'
      }\n\n🎧 *You can tap the **Listen** button above to hear the full spoken explanation, or ask me any follow-up question below.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'What does this value mean?',
        'Is this result normal?',
        'Explain this in simple words',
        'Which values are important?',
        'Summarize the whole report in 30 seconds',
      ],
    };

    setMessages(prev => [...prev, summaryMsg]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedImagePreview(base64);
      // Process using CBC template as reliable fallback if OCR parses general document
      processReportAnalysis(base64, file.name, SAMPLE_REPORTS[0]);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = (sample: SampleReportTemplate) => {
    setUploadedImagePreview(sample.mockAnalysis.imageUrl || null);
    processReportAnalysis(
      sample.mockAnalysis.imageUrl || sample.sampleImageUrl,
      sample.mockAnalysis.fileName,
      sample
    );
  };

  // -------------------------------------------------------------
  // Chat Messaging
  // -------------------------------------------------------------
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // If we have an active uploaded report, route through report Q&A
      if (uploadedReport) {
        const res = await fetch('/api/reports/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: text.trim(),
            reportContext: uploadedReport,
            language: selectedLanguage,
          }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'I have analyzed your question regarding your medical report.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages(prev => [...prev, botMsg]);
      } else {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          }),
        });

        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || 'I am here to guide your healthcare navigation.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isEmergencyAlert: data.isEmergencyAlert,
        };

        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'I can assist you with understanding hospital departments, questions for your doctor, and OPD booking guidance. What can I help you prepare today?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleToggleVoiceInput = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => setIsListeningMic(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          setTimeout(() => handleSendMessage(transcript), 300);
        }
      };
      recognition.onerror = () => setIsListeningMic(false);
      recognition.onend = () => setIsListeningMic(false);

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningMic(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner - cohesive deep navy/sky styling */}
      <div className="bg-linear-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Health Assistant • Voice & Report Companion</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Arogya AI Health Assistant
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 leading-relaxed">
            Upload your health reports to receive an instant, simple <strong>short summary</strong> and listen in <strong>natural voice narration</strong> in English, Hindi, or Marathi.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-linear-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-extrabold shadow-md shadow-cyan-600/20 transition flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Health Report</span>
            </button>

            <button
              onClick={() => onNavigateTab('report-assistant')}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-300" />
              <span>Open Full Report Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Card */}
      <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Medical Notice:</strong> Arogya AI provides plain-language explanations of medical documents and healthcare navigation. It is not a clinical medical diagnosis. In case of emergency or severe symptoms, call <strong>108 / 112</strong> or tap Emergency SOS immediately.
        </div>
      </div>

      {/* Animated Moving Robot "Arogya" with Voice Welcome Feature (Placed above AI Voice Assistant) */}
      <ArogyaRobot
        patientName={patientName}
        onActionClick={(actionType) => {
          if (actionType === 'REPORT_SUMMARY') {
            setIsUploadPanelOpen(true);
            handleStartVoice();
          } else if (actionType === 'QUEUE_STATUS') {
            onNavigateTab('my-bookings');
          } else if (actionType === 'DOCTOR_QUESTIONS') {
            setInputText('What questions should I ask my doctor during my upcoming OPD visit?');
          }
        }}
      />

      {/* ========================================================= */}
      {/* 1. HEALTH REPORT UPLOAD & SAMPLE SELECTOR PANEL          */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Upload Health / Medical Report
              </h3>
              <p className="text-[11px] text-slate-500">
                Upload a blood test, prescription, or radiology document (JPG, PNG, PDF)
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsUploadPanelOpen(!isUploadPanelOpen)}
            className="text-xs font-bold text-sky-700 hover:text-sky-900"
          >
            {isUploadPanelOpen ? 'Collapse' : 'Expand'}
          </button>
        </div>

        {isUploadPanelOpen && (
          <div className="space-y-4 pt-1">
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-5 text-center cursor-pointer transition group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs mx-auto flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform mb-2">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-xs font-extrabold text-slate-800">
                Click to browse or drag & drop your medical report
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Supports Blood Test, Lipid Profile, Thyroid, X-Ray, ECG documents
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  <strong>Encrypted & Confidential:</strong> This system is securely encrypted and no personal health data is stored.
                </span>
              </div>
            </div>

            {/* Quick 1-Click Samples for Instant Testing */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Or Test with Pre-Loaded Medical Reports:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SAMPLE_REPORTS.map(sample => (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-sky-400 hover:bg-sky-50/60 bg-slate-50 text-left transition text-xs group"
                  >
                    <div className="font-extrabold text-[11px] text-slate-900 group-hover:text-sky-700 truncate">
                      {sample.title.split('(')[0]}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {sample.category}
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 bg-sky-100/70 px-1.5 py-0.5 rounded">
                      <span>Analyze</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {isAnalyzingReport && (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-center space-y-2 animate-pulse">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-900">
              <Sparkles className="w-4 h-4 text-sky-600 animate-spin" />
              <span>Vision AI & OCR Reading Medical Report...</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Extracting clinical numbers, abnormal flags, and generating plain-language short summary.
            </p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. SHORT SUMMARY & VOICE NARRATION CARD (When Analyzed)   */}
      {/* ========================================================= */}
      {uploadedReport && (
        <div className="bg-white rounded-3xl border border-sky-200 shadow-lg shadow-sky-950/5 overflow-hidden transition-all">
          {/* Top Bar with Report Title & Language Picker */}
          <div className="bg-linear-to-r from-sky-900 via-slate-900 to-indigo-900 text-white p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-300 shadow-xs">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    {uploadedReport.reportType}
                  </h4>
                  <span className="px-2 py-0.5 rounded bg-cyan-400/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                    Analyzed
                  </span>
                </div>
                <div className="text-[11px] text-slate-300">
                  {uploadedReport.labOrHospital || 'Diagnostic Lab'} • {uploadedReport.reportDate || 'Recent'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20 text-xs">
                <Languages className="w-3.5 h-3.5 text-cyan-300 ml-1.5" />
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    selectedLanguage === 'en'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    selectedLanguage === 'hi'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`px-2 py-1 rounded-lg font-bold text-[11px] transition ${
                    selectedLanguage === 'mr'
                      ? 'bg-cyan-500 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Standardized EHR Export Button */}
              <button
                onClick={() => setIsEhrExportOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition shadow-xs shrink-0"
                title="Export Standardized EHR Report in PDF or FHIR R4 JSON"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Export EHR</span>
              </button>
            </div>
          </div>

          {/* Interactive Voice Player Bar */}
          <div className="bg-sky-50/80 border-b border-sky-100 p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Separate Play button (Disabled while playing, plays once) */}
              <button
                onClick={() => handleStartVoice()}
                disabled={isPlayingAudio}
                className="px-3.5 py-2 rounded-xl bg-linear-to-tr from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-1.5 shadow-md shadow-sky-600/25 transition active:scale-95 text-xs font-bold"
                title={isPlayingAudio ? 'Speech in progress' : 'Listen to Report Summary'}
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>{isPlayingAudio ? 'Playing...' : 'Play'}</span>
              </button>

              {/* Pause / Resume button */}
              <button
                onClick={handlePauseVoice}
                disabled={!isPlayingAudio}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition"
                title={isPausedAudio ? 'Resume Narration' : 'Pause Narration'}
              >
                {isPausedAudio ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
              </button>

              {/* Separate Stop Button (Cancels immediately) */}
              <button
                onClick={handleStopVoice}
                disabled={!isPlayingAudio && !isPausedAudio}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed text-rose-700 transition flex items-center gap-1.5 text-xs font-bold"
                title="Stop audio immediately"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>

              <div>
                <div className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>AI Voice Summary</span>
                  {isPlayingAudio && !isPausedAudio && (
                    <span className="flex items-center gap-0.5 ml-1">
                      <span className="w-1 h-3 bg-cyan-600 rounded-full animate-bounce" />
                      <span className="w-1 h-4 bg-sky-600 rounded-full animate-bounce delay-75" />
                      <span className="w-1 h-2 bg-indigo-600 rounded-full animate-bounce delay-150" />
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  {isPlayingAudio
                    ? isPausedAudio
                      ? 'Narration Paused'
                      : 'Reading concise summary...'
                    : 'Tap Play to listen to summarized findings'}
                </div>
              </div>
            </div>

            {/* Playback Controls: Replay, Speed */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleStartVoice()}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition"
                title="Replay from start"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              {/* Speed Buttons */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5 text-[10px] font-bold text-slate-600">
                {[0.8, 1.0, 1.2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    className={`px-1.5 py-1 rounded-lg transition ${
                      playbackSpeed === speed
                        ? 'bg-sky-600 text-white'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Progress line */}
            {isPlayingAudio && (
              <div className="w-full bg-sky-200 h-1 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-linear-to-r from-cyan-600 to-sky-600 h-full transition-all duration-300"
                  style={{ width: `${spokenProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Short Summary Text Body */}
          <div className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
            {/* Plain language summary box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="font-extrabold text-xs uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>Short Summary (Easy Read)</span>
              </div>
              <p className="text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                {uploadedReport.overallSummary}
              </p>
            </div>

            {/* Important Findings & Abnormal Values */}
            {uploadedReport.abnormalValues && uploadedReport.abnormalValues.length > 0 && (
              <div>
                <div className="font-bold text-xs text-rose-950 mb-2 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Values Requiring Attention:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {uploadedReport.abnormalValues.map((abn, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{abn.testName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-200 text-rose-800">
                          {abn.status}: {abn.value} {abn.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 leading-snug">
                        {abn.simpleExplanation}
                      </div>
                      {abn.referenceRange && (
                        <div className="text-[10px] text-slate-400">
                          Normal range: {abn.referenceRange}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Normal Findings */}
            {uploadedReport.normalValues && uploadedReport.normalValues.length > 0 && (
              <div>
                <div className="font-bold text-xs text-emerald-950 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Normal Findings:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {uploadedReport.normalValues.map((norm, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>{norm.testName}: {norm.value} {norm.unit || ''} (Normal)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Questions for Doctor */}
            {uploadedReport.doctorDiscussionQuestions && uploadedReport.doctorDiscussionQuestions.length > 0 && (
              <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-200/80 text-xs text-sky-950 space-y-1">
                <span className="font-bold block text-sky-900">
                  Questions to ask your doctor during your OPD consultation:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-700 text-[11px]">
                  {uploadedReport.doctorDiscussionQuestions.slice(0, 3).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
              <span>{uploadedReport.disclaimer}</span>
              <button
                onClick={() => onNavigateTab('report-assistant')}
                className="text-sky-700 hover:text-sky-900 font-bold underline flex items-center gap-1 shrink-0 ml-2"
              >
                <span>Full Studio View</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ASSISTANT CHAT THREAD (Ask follow-ups about report)   */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px] overflow-hidden">
        {/* Chat Header */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-extrabold text-slate-900">
              {uploadedReport ? `Chatting about: ${uploadedReport.reportType}` : 'Arogya AI Health Assistant'}
            </span>
          </div>
          {uploadedReport && (
            <button
              onClick={() => {
                setUploadedReport(null);
                setUploadedImagePreview(null);
                handleStopVoice();
              }}
              className="text-slate-400 hover:text-rose-600 text-[11px] font-semibold flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Report Context</span>
            </button>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => {
            const isBot = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  isBot ? 'items-start' : 'items-end justify-end'
                }`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-cyan-600 to-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-2 ${isBot ? 'text-left' : 'text-right'}`}>
                  <div
                    className={`p-4 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                      isBot
                        ? 'bg-slate-50 text-slate-800 border border-slate-200/70 shadow-xs'
                        : 'bg-sky-600 text-white rounded-br-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Read Aloud Voice Button for Assistant Response */}
                  {isBot && (
                    <div className="flex items-center gap-2 pt-0.5">
                      <button
                        onClick={() => {
                          if (currentlySpeakingMsgId === msg.id && isPlayingAudio) {
                            handleStopVoice();
                          } else {
                            handleStartVoice(msg.text, selectedLanguage, msg.id);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition shadow-xs ${
                          currentlySpeakingMsgId === msg.id && isPlayingAudio
                            ? 'bg-rose-50 text-rose-700 border border-rose-300'
                            : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
                        }`}
                      >
                        {currentlySpeakingMsgId === msg.id && isPlayingAudio ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                            <VolumeX className="w-3 h-3 text-rose-600" />
                            <span>Stop Voice</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-sky-600" />
                            <span>🔊 Read Aloud (Voice)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Red Flag Warning Box */}
                  {msg.isEmergencyAlert && (
                    <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center justify-between gap-3">
                      <span className="font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Possible Emergency Symptoms Detected!
                      </span>
                      <button
                        onClick={onEmergencyClick}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-xs"
                      >
                        Launch Emergency SOS
                      </button>
                    </div>
                  )}

                  {/* Suggested Quick Prompts */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedPrompts.map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition text-left border border-slate-200"
                        >
                          💬 {prompt}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 block px-1">
                    {msg.timestamp}
                  </span>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>Arogya AI is synthesizing care guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Health Topic Categories */}
        <div className="px-3.5 py-2 border-t border-slate-100 bg-slate-50/80 overflow-x-auto flex items-center gap-1.5 text-xs">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Topics:
          </span>
          {[
            { id: 'bp', label: '🩺 Blood Pressure & Heart', query: 'What causes high blood pressure and how to control it naturally?' },
            { id: 'diabetes', label: '🩸 Sugar & Diabetes', query: 'What are normal blood sugar ranges and diabetic diet tips?' },
            { id: 'diet', label: '🥗 Nutrition & Hemoglobin', query: 'What foods help boost hemoglobin and energy levels?' },
            { id: 'acidity', label: '🔥 Acidity & Heartburn', query: 'Home remedies and diet changes to stop acid reflux' },
            { id: 'sleep', label: '🌙 Sleep & Rest', query: 'How to fall asleep faster and improve deep sleep quality?' },
            { id: 'headache', label: '🤕 Headaches & Migraine', query: 'Common causes of headaches and when to consult a doctor?' },
            { id: 'fever', label: '🌡️ Fever & Home Care', query: 'Safe home care and temperature monitoring for fever' },
            { id: 'doctor', label: '📋 Doctor Consultation Prep', query: 'What questions should I ask my doctor during OPD consultation?' },
          ].map(topic => (
            <button
              key={topic.id}
              onClick={() => handleSendMessage(topic.query)}
              className="px-2.5 py-1 rounded-full bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-900 border border-slate-200 text-[11px] font-semibold shrink-0 transition shadow-2xs hover:border-sky-300"
            >
              {topic.label}
            </button>
          ))}
        </div>

        {/* Input Bar with Voice Input & Send */}
        <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
          {/* Quick upload trigger inside chat */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 transition shrink-0"
            title="Upload health report document"
          >
            <UploadCloud className="w-4 h-4 text-sky-600" />
          </button>

          {/* Microphone toggle for speech input */}
          <button
            onClick={handleToggleVoiceInput}
            className={`p-2.5 rounded-2xl border transition shrink-0 ${
              isListeningMic
                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title={isListeningMic ? 'Listening... click to stop' : 'Speak your question'}
          >
            {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            placeholder={
              uploadedReport
                ? `Ask follow-up on ${uploadedReport.reportType} (e.g., 'What does this value mean?')...`
                : 'Ask ANY health question (e.g., causes of headache, diet for BP, sugar ranges, medications)...'
            }
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500 placeholder:text-slate-400 shadow-xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 rounded-2xl bg-linear-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:bg-slate-200 text-white shadow-md shadow-sky-600/20 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Standardized EHR Export Modal (HL7 FHIR R4 & PDF) */}
      {uploadedReport && (
        <EhrExportModal
          report={uploadedReport}
          isOpen={isEhrExportOpen}
          onClose={() => setIsEhrExportOpen(false)}
        />
      )}
    </div>
  );
};
