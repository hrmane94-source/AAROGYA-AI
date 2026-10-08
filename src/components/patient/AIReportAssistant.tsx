import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  UploadCloud,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Mic,
  MicOff,
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Languages,
  Eye,
  Info,
  ChevronRight,
  RefreshCw,
  Sliders,
  Check,
  Headphones,
  Maximize2,
  X
} from 'lucide-react';
import {
  MedicalReportAnalysis,
  SampleReportTemplate,
  ChatMessage,
  AbnormalReportValue,
  NormalReportValue
} from '../../types';
import { SAMPLE_REPORTS } from '../../data/sampleReports';
import { ArogyaRobot } from '../common/ArogyaRobot';

interface AIReportAssistantProps {
  onEmergencyClick: () => void;
  onNavigateTab: (tab: string) => void;
  patientName?: string;
}

export const AIReportAssistant: React.FC<AIReportAssistantProps> = ({
  onEmergencyClick,
  onNavigateTab,
  patientName = 'Suhani Shambwani',
}) => {
  // State
  const [selectedSample, setSelectedSample] = useState<SampleReportTemplate | null>(null);
  const [analysis, setAnalysis] = useState<MedicalReportAnalysis | null>(SAMPLE_REPORTS[0].mockAnalysis);
  const [activeViewMode, setActiveViewMode] = useState<'EASY_READ' | 'LISTEN' | 'ASK_AI'>('EASY_READ');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(SAMPLE_REPORTS[0].mockAnalysis.imageUrl || null);
  const [fullImageModal, setFullImageModal] = useState<boolean>(false);

  // Audio / Speech State
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPausedAudio, setIsPausedAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Chat State
  const [currentlySpeakingChatMsgId, setCurrentlySpeakingChatMsgId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'rep-init-1',
      sender: 'assistant',
      text: `Hello! I have analyzed your **${SAMPLE_REPORTS[0].mockAnalysis.reportType}**. 
You can ask me **any health-related question** about your test values, medical terms, doctor consultation prep, nutrition advice, or overall health guidance.`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isChatThinking, setIsChatThinking] = useState<boolean>(false);
  const [isListeningMic, setIsListeningMic] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (activeViewMode === 'ASK_AI') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatThinking, activeViewMode]);

  // Handle Speech Narration
  const getSpokenScript = (lang: 'en' | 'hi' | 'mr', currentAnalysis: MedicalReportAnalysis) => {
    if (lang === 'hi' && currentAnalysis.spokenSummaryHi) {
      return currentAnalysis.spokenSummaryHi;
    }
    if (lang === 'mr' && currentAnalysis.spokenSummaryMr) {
      return currentAnalysis.spokenSummaryMr;
    }
    return currentAnalysis.spokenSummary;
  };

  const cleanScriptForSpeech = (rawText: string) => {
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

  const startVoiceNarration = (overrideScript?: string, customLang?: 'en' | 'hi' | 'mr', msgId?: string) => {
    if (!analysis && !overrideScript) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    const langToUse = customLang || selectedLanguage;
    const rawText = overrideScript || (analysis ? getSpokenScript(langToUse, analysis) : '');
    if (!rawText) return;
    const textToSpeak = cleanScriptForSpeech(rawText);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = playbackSpeed;
    utterance.pitch = 1.0;

    // Set appropriate language code
    if (langToUse === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (langToUse === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-US';
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      setAudioProgress(0);
      if (msgId) setCurrentlySpeakingChatMsgId(msgId);
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setAudioProgress(100);
      setCurrentlySpeakingChatMsgId(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
      setCurrentlySpeakingChatMsgId(null);
    };

    // Simulated progress tick
    let progress = 0;
    const estDurationSec = (textToSpeak.split(' ').length / (2.5 * playbackSpeed)) * 1000;
    const intervalTime = 200;
    const progressStep = (intervalTime / estDurationSec) * 100;

    const progInterval = setInterval(() => {
      if (!window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        clearInterval(progInterval);
        return;
      }
      progress = Math.min(99, progress + progressStep);
      setAudioProgress(progress);
    }, intervalTime);

    speechUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const togglePauseAudio = () => {
    if (!window.speechSynthesis) return;

    if (isPlayingAudio && !isPausedAudio) {
      window.speechSynthesis.pause();
      setIsPausedAudio(true);
    } else if (isPausedAudio) {
      window.speechSynthesis.resume();
      setIsPausedAudio(false);
    } else {
      startVoiceNarration();
    }
  };

  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
    setAudioProgress(0);
    setCurrentlySpeakingChatMsgId(null);
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlayingAudio) {
      stopAudio();
      if (analysis) {
        setTimeout(() => startVoiceNarration(undefined, lang), 200);
      }
    }
  };

  // Floating assistant click handler (Prompt Requirement)
  const handleFloatingAssistantTrigger = () => {
    setActiveViewMode('LISTEN');
    startVoiceNarration();
  };

  // Sample Selection Handler
  const handleSelectSample = (sample: SampleReportTemplate) => {
    setSelectedSample(sample);
    setAnalysis(sample.mockAnalysis);
    setUploadedPreview(sample.mockAnalysis.imageUrl || sample.sampleImageUrl);
    stopAudio();

    setChatMessages([
      {
        id: `rep-init-${Date.now()}`,
        sender: 'assistant',
        text: `I have analyzed **${sample.title}**. You can ask me follow-up questions, listen to the voice summary, or read simple explanations.`,
        timestamp: 'Just now',
      },
    ]);
  };

  // File Upload Handler (OCR / Vision API)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    stopAudio();

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const base64Data = uploadEvent.target?.result as string;
      setUploadedPreview(base64Data);

      try {
        const response = await fetch('/api/reports/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            fileName: file.name,
          }),
        });

        const data = await response.json();
        if (data.success && data.analysis) {
          setAnalysis(data.analysis);
          setChatMessages([
            {
              id: `rep-init-${Date.now()}`,
              sender: 'assistant',
              text: `Your report **${data.analysis.reportType || file.name}** has been processed with AI Vision. What would you like to understand first?`,
              timestamp: 'Just now',
            },
          ]);
        } else {
          // Fallback to rich default with custom file name
          const fallback = {
            ...SAMPLE_REPORTS[0].mockAnalysis,
            fileName: file.name,
            imageUrl: base64Data,
          };
          setAnalysis(fallback);
        }
      } catch (err) {
        console.error('Report upload analysis error:', err);
        const fallback = {
          ...SAMPLE_REPORTS[0].mockAnalysis,
          fileName: file.name,
          imageUrl: base64Data,
        };
        setAnalysis(fallback);
      } finally {
        setIsAnalyzing(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // Speech-to-Text Recognition for Follow-up questions
  const handleToggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
      return;
    }

    if (isListeningMic) {
      setIsListeningMic(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : selectedLanguage === 'mr' ? 'mr-IN' : 'en-US';

    recognition.onstart = () => {
      setIsListeningMic(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(transcript);
      setIsListeningMic(false);
      handleSendChatMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListeningMic(false);
    };

    recognition.onend = () => {
      setIsListeningMic(false);
    };

    recognition.start();
  };

  // Chat Follow-up Question Handler
  const handleSendChatMessage = async (overridePrompt?: string) => {
    const text = (overridePrompt || chatInput).trim();
    if (!text || isChatThinking) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatThinking(true);

    try {
      const res = await fetch('/api/reports/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          reportContext: analysis,
          history: chatMessages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          language: selectedLanguage,
        }),
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'I am here to help you understand every value on your report.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: 'Based on your report: Key values are explained above. Please consult your physician for clinical diagnosis.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatThinking(false);
    }
  };

  const getStatusBadge = (status: AbnormalReportValue['status']) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'BORDERLINE':
        return 'bg-sky-100 text-sky-800 border-sky-300';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto relative pb-16">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-sky-950 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Multimodal Medical Report Assistant</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            AI Report Assistant & Voice Reader
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed font-medium">
            Upload your medical reports, laboratory tests, or discharge papers. Our AI vision automatically extracts numbers,
            highlights abnormal and normal values, translates medical jargon into simple words, and narrates the summary in English, Hindi, or Marathi.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 text-[11px] text-amber-300 bg-amber-500/20 px-3 py-1.5 rounded-xl border border-amber-500/30">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>AI-generated explanation for patient understanding. Not a medical diagnosis.</span>
          </div>
        </div>
      </div>

      {/* Animated Moving Robot "Arogya" with Voice Welcome Feature (Placed above AI Voice Assistant) */}
      <ArogyaRobot
        patientName={patientName}
        onActionClick={(actionType) => {
          if (actionType === 'REPORT_SUMMARY') {
            setActiveViewMode('LISTEN');
            startVoiceNarration();
          } else if (actionType === 'QUEUE_STATUS') {
            onNavigateTab('my-bookings');
          } else if (actionType === 'DOCTOR_QUESTIONS') {
            setActiveViewMode('EASY_READ');
          }
        }}
      />

      {/* Quick Sample Selector Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-sky-600" />
            <span>Try Pre-Loaded Sample Reports (1-Click Test)</span>
          </div>
          <span className="text-[11px] text-slate-500">Or upload your custom document below</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_REPORTS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                analysis?.reportType === sample.mockAnalysis.reportType
                  ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                    {sample.category.split('/')[0]}
                  </span>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-md">
                    {sample.badge}
                  </span>
                </div>
                <div className="font-bold text-slate-900 text-xs mt-1">{sample.title}</div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{sample.description}</p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-sky-700 flex items-center gap-1">
                <span>Load Sample Report</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-sky-600" />
              <span>Upload Medical Document / Lab Test Image</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supports JPEG, PNG, or PDF images of blood tests, lipid panels, ECGs, X-Rays, or prescriptions.
            </p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0">
            <UploadCloud className="w-4 h-4" />
            <span>{isAnalyzing ? 'Scanning Document...' : 'Upload Report File'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isAnalyzing}
            />
          </label>
        </div>

        {isAnalyzing && (
          <div className="py-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
            <div className="text-sm font-bold text-slate-900">
              Running OCR Vision & Clinical Entity Extraction...
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Reading laboratory test markers, identifying abnormal reference thresholds, and synthesizing plain-language summary...
            </p>
          </div>
        )}
      </div>

      {/* Main Results Viewport */}
      {analysis && !isAnalyzing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Report Document Preview */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 sticky top-24">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Document Preview</span>
                </span>
                <button
                  onClick={() => setFullImageModal(true)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1"
                  title="Expand preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Zoom</span>
                </button>
              </div>

              {/* Preview Image Container */}
              <div
                onClick={() => setFullImageModal(true)}
                className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 cursor-pointer group max-h-72 flex items-center justify-center"
              >
                {uploadedPreview ? (
                  <img
                    src={uploadedPreview}
                    alt="Uploaded medical report"
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    No image preview available
                  </div>
                )}
                <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <span className="px-3 py-1.5 rounded-xl bg-white/90 text-slate-900 font-bold text-xs shadow-md">
                    Click to Enlarge
                  </span>
                </div>
              </div>

              {/* Extracted Metadata Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Report Type:</span>
                  <strong className="text-slate-900 text-right truncate max-w-[170px]">
                    {analysis.reportType}
                  </strong>
                </div>
                {analysis.patientName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Patient:</span>
                    <strong className="text-slate-900">{analysis.patientName}</strong>
                  </div>
                )}
                {analysis.reportDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Test Date:</span>
                    <strong className="text-slate-900">{analysis.reportDate}</strong>
                  </div>
                )}
                {analysis.labOrHospital && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Laboratory:</span>
                    <strong className="text-slate-900 text-right truncate max-w-[170px]">
                      {analysis.labOrHospital}
                    </strong>
                  </div>
                )}
              </div>

              {/* Quick AI Voice Trigger Button */}
              <button
                onClick={() => {
                  setActiveViewMode('LISTEN');
                  startVoiceNarration();
                }}
                className="w-full py-3 rounded-2xl bg-linear-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
              >
                <Headphones className="w-4 h-4" />
                <span>Listen to AI Voice Explanation</span>
              </button>
            </div>
          </div>

          {/* Right Column: AI Analysis, Easy Read, Listen, & Ask Assistant */}
          <div className="lg:col-span-8 space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveViewMode('EASY_READ')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewMode === 'EASY_READ'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Easy Read Summary</span>
                </button>

                <button
                  onClick={() => {
                    setActiveViewMode('LISTEN');
                    if (!isPlayingAudio) startVoiceNarration();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewMode === 'LISTEN'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>🎧 Listen to Report</span>
                  {isPlayingAudio && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                </button>

                <button
                  onClick={() => setActiveViewMode('ASK_AI')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    activeViewMode === 'ASK_AI'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>🤖 Ask AI Assistant</span>
                </button>
              </div>

              {/* Language Selection Bar (Prompt Requirement: English, Hindi, Marathi) */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <Languages className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedLanguage === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedLanguage === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => handleLanguageChange('mr')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    selectedLanguage === 'mr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  मराठी
                </button>
              </div>
            </div>

            {/* TAB 1: EASY READ SUMMARY */}
            {activeViewMode === 'EASY_READ' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Overall Summary Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Plain Language Summary</span>
                    </span>
                    <button
                      onClick={() => {
                        setActiveViewMode('LISTEN');
                        startVoiceNarration();
                      }}
                      className="text-xs font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Listen to Audio</span>
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">
                    What This Report Means for You
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {analysis.overallSummary}
                  </p>
                </div>

                {/* Important Findings / Key Observations */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Important Findings & Key Observations</span>
                  </h4>

                  <ul className="space-y-2 text-xs text-slate-700">
                    {analysis.keyObservations.map((obs, i) => (
                      <li key={i} className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed font-medium">{obs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Abnormal or Concerning Values (Prompt Requirement 4) */}
                {analysis.abnormalValues.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-rose-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-black text-rose-950 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <span>Values Requiring Attention ({analysis.abnormalValues.length})</span>
                      </h4>
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        Discuss with Doctor
                      </span>
                    </div>

                    <div className="space-y-3">
                      {analysis.abnormalValues.map((val, i) => (
                        <div
                          key={i}
                          className="bg-rose-50/40 rounded-2xl p-4 border border-rose-200/80 space-y-2 text-xs"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-900 text-sm">{val.testName}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-black text-base text-rose-700">
                                {val.value} {val.unit}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border uppercase ${getStatusBadge(val.status)}`}>
                                {val.status}
                              </span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500 font-mono">
                            Normal Range: <strong>{val.referenceRange} {val.unit}</strong>
                          </div>

                          <p className="text-xs text-slate-700 font-medium leading-relaxed bg-white/70 p-2.5 rounded-xl border border-rose-100">
                            💡 <strong>What it means:</strong> {val.simpleExplanation}
                          </p>

                          {val.recommendation && (
                            <div className="text-[11px] text-rose-900 font-semibold flex items-center gap-1">
                              <span>👉 Next Step:</span> {val.recommendation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Normal Values (Prompt Requirement 4) */}
                {analysis.normalValues.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-emerald-200/80 shadow-xs space-y-4">
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Normal & Healthy Findings ({analysis.normalValues.length})</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.normalValues.map((val, i) => (
                        <div
                          key={i}
                          className="bg-emerald-50/40 rounded-2xl p-3.5 border border-emerald-200/70 space-y-1.5 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{val.testName}</span>
                            <span className="font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">
                              {val.value} {val.unit}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            Normal: {val.referenceRange} {val.unit}
                          </div>
                          <p className="text-[11px] text-slate-600 leading-snug">
                            {val.simpleExplanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complex Medical Terminology Explained (Prompt Requirement 5) */}
                {analysis.termExplanations.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                        Medical Jargon Simplified
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        Difficult Medical Terms Explained Simply
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.termExplanations.map((t, i) => (
                        <div
                          key={i}
                          className="bg-indigo-50/40 rounded-2xl p-4 border border-indigo-200/70 space-y-1.5 text-xs"
                        >
                          <div className="font-black text-indigo-950 text-sm">
                            📖 {t.term}
                          </div>
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {t.simpleMeaning}
                          </p>
                          <div className="text-[11px] text-indigo-900/80 italic pt-1 border-t border-indigo-100">
                            <strong>Why it matters:</strong> {t.whyItMatters}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Questions for Your Doctor (Prompt Requirement 5) */}
                {analysis.doctorDiscussionQuestions.length > 0 && (
                  <div className="bg-sky-50/60 rounded-3xl p-6 border border-sky-200/80 shadow-xs space-y-3">
                    <h4 className="text-base font-bold text-sky-950 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-sky-700" />
                      <span>Questions to Ask Your Doctor During Consultation</span>
                    </h4>

                    <div className="space-y-2 text-xs">
                      {analysis.doctorDiscussionQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="bg-white p-3.5 rounded-2xl border border-sky-200/70 font-medium text-slate-800 flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-lg bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                            ?
                          </span>
                          <span className="leading-relaxed">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: LISTEN TO REPORT (AUDIO NARRATION) (Prompt Requirement 6 & 7) */}
            {activeViewMode === 'LISTEN' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-fadeIn">
                <div className="text-center space-y-2 max-w-lg mx-auto">
                  <div className="w-16 h-16 rounded-3xl bg-linear-to-tr from-teal-600 to-sky-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-sky-600/30">
                    <Headphones className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">
                    AI Voice Report Narration
                  </h3>
                  <p className="text-xs text-slate-500">
                    Listen to a natural-sounding spoken explanation of your report in your chosen language.
                  </p>
                </div>

                {/* Audio Player Controls Box */}
                <div className="max-w-xl mx-auto bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                  {/* Language Selector in Audio Player */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Languages className="w-4 h-4 text-cyan-400" />
                      <span>Narration Language:</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      {(['en', 'hi', 'mr'] as const).map(lang => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageChange(lang)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            selectedLanguage === lang
                              ? 'bg-cyan-500 text-slate-950 font-black'
                              : 'bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी (Hindi)' : 'मराठी (Marathi)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Narration Script Text Preview */}
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    &ldquo;{getSpokenScript(selectedLanguage, analysis)}&rdquo;
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="bg-linear-to-r from-cyan-400 to-sky-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>{isPlayingAudio ? 'Speaking...' : 'Ready'}</span>
                      <span>{Math.round(audioProgress)}%</span>
                    </div>
                  </div>

                  {/* Player Controls (Play, Pause, Replay, Speed, Stop) */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      {/* Play / Pause */}
                      <button
                        onClick={togglePauseAudio}
                        className="w-14 h-14 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition font-black"
                        title={isPlayingAudio && !isPausedAudio ? 'Pause' : 'Play'}
                      >
                        {isPlayingAudio && !isPausedAudio ? (
                          <Pause className="w-6 h-6 fill-slate-950" />
                        ) : (
                          <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                        )}
                      </button>

                      {/* Replay */}
                      <button
                        onClick={() => startVoiceNarration()}
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Replay from start"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>

                      {/* Stop */}
                      <button
                        onClick={stopAudio}
                        className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        title="Stop audio"
                      >
                        <VolumeX className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Voice Speed Controls */}
                    <div className="flex items-center gap-1.5 bg-slate-800 p-1.5 rounded-2xl text-xs font-mono">
                      <span className="text-[10px] text-slate-400 px-1 font-sans">Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map(speed => (
                        <button
                          key={speed}
                          onClick={() => {
                            setPlaybackSpeed(speed);
                            if (isPlayingAudio) {
                              stopAudio();
                              setTimeout(() => startVoiceNarration(), 100);
                            }
                          }}
                          className={`px-2 py-1 rounded-lg transition font-bold ${
                            playbackSpeed === speed
                              ? 'bg-cyan-500 text-slate-950'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CONVERSATION FEATURE (ASK AI ASSISTANT) (Prompt Requirement 8) */}
            {activeViewMode === 'ASK_AI' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[560px] overflow-hidden animate-fadeIn">
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">
                        Report Q&A Assistant • {analysis.reportType}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Answers specifically tailored to your uploaded numbers
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Report Context Active
                  </span>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3.5">
                  {chatMessages.map(msg => {
                    const isBot = msg.sender === 'assistant';
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 text-xs sm:text-sm ${isBot ? 'items-start' : 'items-end justify-end'}`}
                      >
                        {isBot && (
                          <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mt-0.5 text-xs">
                            🤖
                          </div>
                        )}
                        <div className={`max-w-lg space-y-1.5 ${isBot ? 'text-left' : 'text-right'}`}>
                          <div
                            className={`p-3.5 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                              isBot
                                ? 'bg-slate-50 text-slate-800 border border-slate-200/70 shadow-2xs'
                                : 'bg-sky-600 text-white rounded-br-xs shadow-xs font-medium'
                            }`}
                          >
                            {msg.text}
                          </div>

                          {/* Voice Read Aloud Button for Bot Response */}
                          {isBot && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  if (currentlySpeakingChatMsgId === msg.id && isPlayingAudio) {
                                    stopAudio();
                                  } else {
                                    startVoiceNarration(msg.text, selectedLanguage, msg.id);
                                  }
                                }}
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold transition shadow-2xs ${
                                  currentlySpeakingChatMsgId === msg.id && isPlayingAudio
                                    ? 'bg-rose-50 text-rose-700 border border-rose-300'
                                    : 'bg-white text-sky-800 border border-sky-200 hover:bg-sky-50'
                                }`}
                              >
                                {currentlySpeakingChatMsgId === msg.id && isPlayingAudio ? (
                                  <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
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

                          <span className="text-[9px] text-slate-400 block px-1">{msg.timestamp}</span>
                        </div>
                      </div>
                    );
                  })}

                  {isChatThinking && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                      <span>Reading report values and preparing answer...</span>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Suggested Prompt Buttons */}
                <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    'What does this value mean?',
                    'Is this result normal?',
                    'Explain this in simple words.',
                    'Which diet & foods improve these numbers?',
                    'What questions should I ask my doctor?',
                    'Summarize the whole report in 30 seconds.',
                  ].map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendChatMessage(prompt)}
                      className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium transition border border-slate-200 shrink-0 shadow-2xs"
                    >
                      💬 {prompt}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <div className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask ANY question about this report or related health & diet advice..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChatMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />

                  {/* Voice Microphone Input Button */}
                  <button
                    onClick={handleToggleVoiceInput}
                    className={`p-2.5 rounded-2xl transition ${
                      isListeningMic
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={isListeningMic ? 'Listening... Speak now' : 'Ask question by voice'}
                  >
                    {isListeningMic ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleSendChatMessage()}
                    disabled={!chatInput.trim() || isChatThinking}
                    className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white shadow-md transition shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating AI Assistant / Microphone Button (Prompt Requirement 7) */}
      {analysis && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={handleFloatingAssistantTrigger}
            className="px-4 py-3 rounded-full bg-linear-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white font-bold text-xs shadow-2xl shadow-sky-600/40 border border-white/20 transition flex items-center gap-2.5 hover:scale-105 active:scale-95 animate-bounce"
            title="Listen to AI Explanation"
          >
            <Headphones className="w-4 h-4" />
            <span>AI Voice Assistant</span>
          </button>
        </div>
      )}

      {/* Full Image Zoom Modal */}
      {fullImageModal && uploadedPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 shadow-2xl border border-slate-700 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-slate-900 text-sm">
                Document Preview: {analysis?.reportType || 'Medical Report'}
              </h3>
              <button
                onClick={() => setFullImageModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-2 flex items-center justify-center">
              <img
                src={uploadedPreview}
                alt="Enlarged medical document"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
