import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  Heart,
  Activity,
  Languages,
  Check,
  MessageSquare,
  Wand2,
  Radio,
  Sliders,
  Smile,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface ArogyaRobotProps {
  patientName?: string;
  onActionClick?: (actionType: string) => void;
  className?: string;
  showExtendedControls?: boolean;
}

export const ArogyaRobot: React.FC<ArogyaRobotProps> = ({
  patientName = 'Suhani Shambwani',
  onActionClick,
  className = '',
  showExtendedControls = true,
}) => {
  // Speech & Voice State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'mr'>('en');
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [activeMood, setActiveMood] = useState<'greeting' | 'speaking' | 'happy' | 'listening'>('greeting');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hasGreetedOnce, setHasGreetedOnce] = useState<boolean>(false);
  const [interactiveName, setInteractiveName] = useState<string>(patientName);

  // Audio Context Ref for Robot Chime
  const audioContextRef = useRef<AudioContext | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Sync interactiveName if prop changes
  useEffect(() => {
    if (patientName) {
      setInteractiveName(patientName);
    }
  }, [patientName]);

  // Clean name for spoken greeting (strips '(Patient)' if present)
  const displayName = interactiveName.replace(/\s*\(.*?\)/g, '').trim() || 'Suhani Shambwani';

  // Greeting scripts tailored to language
  const greetingScripts = {
    en: {
      title: `Welcome to Arogya AI, ${displayName}!`,
      speechText: `Welcome to Arogya AI, ${displayName}! I am Arogya, your dedicated AI healthcare robot. I am here to help you understand your medical reports, track your live OPD queues, and assist your hospital care today. Feel free to upload your lab test or ask me any health questions!`,
      shortSub: `Your smart healthcare robot is ready to assist with lab reports, queue tracking, and doctor visits.`,
      tagline: 'AI Healthcare Companion • Online & Listening',
    },
    hi: {
      title: `आरोग्य एआई में आपका स्वागत है, ${displayName}!`,
      speechText: `आरोग्य एआई में आपका हार्दिक स्वागत है, ${displayName} जी! मैं हूँ आरोग्य, आपका पर्सनल एआई स्वास्थ्य रोबोट। मैं आपकी मेडिकल रिपोर्ट्स को सरल भाषा में समझाने और अस्पताल की ओपीडी कतार में सहायता करने के लिए तैयार हूँ।`,
      shortSub: `आपका स्मार्ट स्वास्थ्य साथी आपकी रिपोर्ट और डॉक्टर परामर्श में सहायता के लिए उपस्थित है।`,
      tagline: 'एआई स्वास्थ्य साथी • ऑनलाइन व तत्पर',
    },
    mr: {
      title: `आरोग्य एआय मध्ये आपले स्वागत आहे, ${displayName}!`,
      speechText: `आरोग्य एआय मध्ये आपले मनःपूर्वक स्वागत आहे, ${displayName}! मी आहे आरोग्य, आपला डिजिटल एआय आरोग्य रोबो. आपले लॅब रिपोर्ट समजून घेण्यासाठी आणि ओपीडी रांगेची माहिती मिळवण्यासाठी मी सदैव तत्पर आहे.`,
      shortSub: `आपला वैयक्तिक आरोग्य रोबो रिपोर्ट विश्लेषण आणि रुग्णालय सेवेसाठी सज्ज आहे.`,
      tagline: 'एआय आरोग्य मार्गदर्शक • सेवेत कार्यरत',
    },
  };

  const currentScript = greetingScripts[selectedLanguage];

  // Play pleasant robotic activation chime using Web Audio API
  const playRobotChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioContextRef.current || new AudioCtx();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // High-tech pleasant dual-tone arpeggio: 587.33Hz (D5) -> 880Hz (A5) -> 1174.66Hz (D6)
      const notes = [587.33, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.24);
      });
    } catch {
      // Audio context might be restricted before user gesture
    }
  };

  // Voice Speech Synthesis Handler
  const speakGreeting = (forceNewLang?: 'en' | 'hi' | 'mr') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Voice synthesis is not supported on this browser.');
      return;
    }

    const lang = forceNewLang || selectedLanguage;
    const textToSpeak = greetingScripts[lang].speechText;

    // Stop ongoing speech
    window.speechSynthesis.cancel();
    playRobotChime();

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utteranceRef.current = utterance;
      utterance.rate = speechRate;
      utterance.pitch = 1.05; // Slightly friendly, upbeat pitch

      const voices = window.speechSynthesis.getVoices();
      if (lang === 'hi') {
        utterance.lang = 'hi-IN';
        const hiVoice = voices.find(v => v.lang.startsWith('hi'));
        if (hiVoice) utterance.voice = hiVoice;
      } else if (lang === 'mr') {
        utterance.lang = 'mr-IN';
        const mrVoice = voices.find(v => v.lang.startsWith('mr') || v.lang.startsWith('hi'));
        if (mrVoice) utterance.voice = mrVoice;
      } else {
        utterance.lang = 'en-US';
        const naturalVoice = voices.find(
          v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Karen'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setActiveMood('speaking');
        setHasGreetedOnce(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMood('happy');
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setActiveMood('greeting');
      };

      window.speechSynthesis.speak(utterance);
    }, 180);
  };

  const handlePauseResume = () => {
    if (!('speechSynthesis' in window)) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      setActiveMood('speaking');
    } else if (isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(false);
      setActiveMood('listening');
    } else {
      speakGreeting();
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setActiveMood('greeting');
  };

  // Change language and immediately speak if playing
  const handleLanguageChange = (lang: 'en' | 'hi' | 'mr') => {
    setSelectedLanguage(lang);
    if (isPlaying) {
      speakGreeting(lang);
    }
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-sky-950 to-teal-950 text-white p-5 sm:p-7 shadow-2xl border border-sky-500/30 transition-all duration-300 ${className}`}
    >
      {/* Background Animated Atmosphere */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-teal-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/20 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Main Flex Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
        
        {/* ======================================================== */}
        {/* LEFT / CENTER: ANIMATED MOVING ROBOT "AROGYA"            */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center shrink-0 group select-none">
          {/* Status Capsule Above Arogya */}
          <div className="mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/40 text-[11px] font-bold text-teal-300 shadow-sm backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
            </span>
            <span>Arogya • AI Medical Robot</span>
            {isPlaying && (
              <span className="ml-1 text-[10px] text-teal-200 bg-teal-500/40 px-1.5 py-0.2 rounded-md animate-pulse">
                Speaking...
              </span>
            )}
          </div>

          {/* Robot Canvas Container with Floating & Shadow Animations */}
          <div className="relative w-44 h-48 sm:w-48 sm:h-52 flex items-center justify-center">
            {/* Soft Ambient Glow Halo */}
            <div
              className={`absolute inset-4 rounded-full transition-all duration-700 blur-2xl ${
                isPlaying
                  ? 'bg-teal-400/35 scale-110'
                  : 'bg-cyan-500/20 scale-95'
              }`}
            />

            {/* SVG Interactive Animated Moving Robot */}
            <div
              onClick={() => {
                if (!isPlaying) speakGreeting();
              }}
              title="Click Arogya to hear the Welcome Voice greeting!"
              className="cursor-pointer relative z-10 animate-arogya-float transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <svg
                width="170"
                height="180"
                viewBox="0 0 170 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_12px_24px_rgba(14,165,233,0.35)]"
              >
                {/* Defs for Linear Gradients & Filters */}
                <defs>
                  {/* Robot Body Shell Gradient */}
                  <linearGradient id="arogyaBody" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="60%" stopColor="#f0fdfa" />
                    <stop offset="100%" stopColor="#ccfbf1" />
                  </linearGradient>

                  {/* Dark Metallic Joints & Accent Gradient */}
                  <linearGradient id="arogyaMetal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>

                  {/* High-Tech Teal Chest Accent */}
                  <linearGradient id="arogyaTeal" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0d9488" />
                    <stop offset="50%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>

                  {/* Visor Screen Gradient */}
                  <linearGradient id="arogyaVisor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0f172a" />
                    <stop offset="60%" stopColor="#022c22" />
                    <stop offset="100%" stopColor="#042f2e" />
                  </linearGradient>

                  {/* Glow Filter for Visor & LED */}
                  <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 1. TOP ANTENNA & BEACON */}
                {/* Antenna Mast */}
                <rect x="83" y="14" width="4" height="18" rx="2" fill="url(#arogyaMetal)" />
                {/* Antenna Glowing Orb */}
                <circle
                  cx="85"
                  cy="12"
                  r="6"
                  fill="#06b6d4"
                  filter="url(#cyanGlow)"
                  className="animate-pulse"
                />
                <circle cx="85" cy="12" r="3" fill="#ffffff" />
                {/* Radio Signal Arc waves emitting from antenna */}
                <path
                  d="M75 9 C79 5, 91 5, 95 9"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  className={isPlaying ? 'animate-ping' : 'opacity-60'}
                />

                {/* 2. ROBOT EARS / SIDE SENSORS */}
                {/* Left Ear Sensor */}
                <rect x="36" y="48" width="8" height="20" rx="4" fill="url(#arogyaMetal)" />
                <circle cx="40" cy="58" r="2.5" fill="#14b8a6" className="animate-pulse" />
                {/* Right Ear Sensor */}
                <rect x="126" y="48" width="8" height="20" rx="4" fill="url(#arogyaMetal)" />
                <circle cx="130" cy="58" r="2.5" fill="#14b8a6" className="animate-pulse" />

                {/* 3. ROBOT HEAD */}
                {/* Outer Head Shell */}
                <rect
                  x="42"
                  y="28"
                  width="86"
                  height="62"
                  rx="24"
                  fill="url(#arogyaBody)"
                  stroke="#99f6e4"
                  strokeWidth="2.5"
                />

                {/* Head Top Gloss Highlight */}
                <path
                  d="M52 35 C65 31, 105 31, 118 35"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.8"
                />

                {/* OLED Visor Screen */}
                <rect
                  x="49"
                  y="40"
                  width="72"
                  height="40"
                  rx="14"
                  fill="url(#arogyaVisor)"
                  stroke="#0d9488"
                  strokeWidth="1.8"
                />

                {/* Glass Visor Inner Reflection */}
                <path
                  d="M54 44 Q85 41 116 44"
                  stroke="#2dd4bf"
                  strokeWidth="1"
                  strokeLinecap="round"
                  opacity="0.4"
                />

                {/* 4. DIGITAL ROBOT EYES (CYAN / EMERALD) */}
                {/* Left Eye */}
                {activeMood === 'happy' ? (
                  // Happy curved smiling eye
                  <path
                    d="M62 58 Q70 50 78 58"
                    stroke="#2dd4bf"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#cyanGlow)"
                  />
                ) : (
                  // Rounded expressive digital eye
                  <g filter="url(#cyanGlow)">
                    <rect x="62" y="50" width="15" height="15" rx="5" fill="#06b6d4" />
                    <circle cx="67" cy="55" r="2" fill="#ffffff" />
                    <circle cx="73" cy="61" r="1.5" fill="#a5f3fc" />
                  </g>
                )}

                {/* Right Eye */}
                {activeMood === 'happy' ? (
                  // Happy curved smiling eye
                  <path
                    d="M92 58 Q100 50 108 58"
                    stroke="#2dd4bf"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#cyanGlow)"
                  />
                ) : (
                  // Rounded expressive digital eye
                  <g filter="url(#cyanGlow)">
                    <rect x="93" y="50" width="15" height="15" rx="5" fill="#06b6d4" />
                    <circle cx="98" cy="55" r="2" fill="#ffffff" />
                    <circle cx="104" cy="61" r="1.5" fill="#a5f3fc" />
                  </g>
                )}

                {/* 5. ROBOT MOUTH / VOICE EQUALIZER VISUALIZER */}
                {isPlaying ? (
                  // Animated dancing equalizer bars when speaking!
                  <g filter="url(#cyanGlow)">
                    <rect x="73" y="69" width="3" height="7" rx="1.5" fill="#2dd4bf" className="animate-pulse" />
                    <rect x="79" y="66" width="3" height="11" rx="1.5" fill="#5eead4" />
                    <rect x="85" y="64" width="3" height="13" rx="1.5" fill="#ffffff" />
                    <rect x="91" y="67" width="3" height="9" rx="1.5" fill="#5eead4" />
                    <rect x="97" y="70" width="3" height="6" rx="1.5" fill="#2dd4bf" className="animate-pulse" />
                  </g>
                ) : (
                  // Gentle friendly digital mouth curve
                  <path
                    d="M80 72 Q85 76 90 72"
                    stroke="#2dd4bf"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    filter="url(#cyanGlow)"
                  />
                )}

                {/* 6. ROBOT NECK JOINT */}
                <rect x="78" y="90" width="14" height="6" rx="2" fill="url(#arogyaMetal)" />

                {/* 7. ROBOT TORSO / BODY */}
                <rect
                  x="46"
                  y="96"
                  width="78"
                  height="60"
                  rx="20"
                  fill="url(#arogyaBody)"
                  stroke="#99f6e4"
                  strokeWidth="2.5"
                />

                {/* Torso Chest Plate (High-Tech Health Console) */}
                <rect
                  x="56"
                  y="105"
                  width="58"
                  height="34"
                  rx="10"
                  fill="url(#arogyaMetal)"
                  stroke="#0f766e"
                  strokeWidth="1.2"
                />

                {/* "AROGYA" Brand Plaque */}
                <text
                  x="85"
                  y="114"
                  textAnchor="middle"
                  fill="#5eead4"
                  fontSize="7.5"
                  fontWeight="900"
                  letterSpacing="1.2"
                  fontFamily="system-ui, sans-serif"
                >
                  AROGYA
                </text>

                {/* Heartbeat ECG Line on Chest (Animated Dash) */}
                <path
                  d="M60 125 L68 125 L72 119 L76 131 L80 121 L84 127 L88 125 L110 125"
                  stroke="#14b8a6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  filter="url(#cyanGlow)"
                  className="animate-arogya-ecg"
                />

                {/* Red Healthcare Cross Indicator on upper right chest */}
                <circle cx="112" cy="103" r="5" fill="#f43f5e" />
                <path d="M110 103 H114 M112 101 V105" stroke="#ffffff" strokeWidth="1.4" strokeLinecap="round" />

                {/* 8. ROBOT ARMS */}
                {/* Left Arm (Resting gracefully) */}
                <path
                  d="M46 104 C35 110, 32 125, 38 135 C41 140, 47 138, 48 134 C43 124, 44 114, 48 108"
                  fill="url(#arogyaBody)"
                  stroke="#99f6e4"
                  strokeWidth="2"
                />

                {/* Right Arm (ANIMATED WAVING GREETING ARM!) */}
                <g className="animate-arogya-wave">
                  <path
                    d="M124 104 C138 100, 148 90, 150 78 C152 72, 144 70, 140 76 C136 86, 128 96, 122 104"
                    fill="url(#arogyaBody)"
                    stroke="#99f6e4"
                    strokeWidth="2"
                  />
                  {/* Waving Hand Palm */}
                  <circle cx="147" cy="74" r="5.5" fill="url(#arogyaTeal)" />
                  {/* High-Tech Palm Pulse Light */}
                  <circle cx="147" cy="74" r="2.5" fill="#ffffff" filter="url(#cyanGlow)" />
                </g>

                {/* 9. BOTTOM LEVITATION THRUSTER & AURA */}
                <ellipse cx="85" cy="156" rx="16" ry="4" fill="url(#arogyaMetal)" />
                {/* Levitation Glow Beam */}
                <path
                  d="M73 158 Q85 174 97 158 Z"
                  fill="#06b6d4"
                  opacity="0.75"
                  filter="url(#cyanGlow)"
                  className="animate-pulse"
                />
              </svg>
            </div>

            {/* Floating Soft Shadow Beneath */}
            <div className="absolute -bottom-2 w-28 h-4 rounded-full bg-slate-950/70 blur-md animate-arogya-shadow pointer-events-none" />
          </div>

          {/* Quick Voice Play Trigger on Robot Mascot */}
          <button
            onClick={() => speakGreeting()}
            className="mt-1 px-3.5 py-1.5 rounded-full bg-linear-to-r from-teal-500 to-sky-500 hover:from-teal-400 hover:to-sky-400 text-white text-[11px] font-extrabold shadow-md shadow-teal-500/30 transition flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-bounce text-white" />
                <span>Speaking Now...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>Say Welcome!</span>
              </>
            )}
          </button>
        </div>

        {/* ======================================================== */}
        {/* RIGHT / MAIN CONTENT: WELCOME SPEECH BUBBLE & CONTROLS  */}
        {/* ======================================================== */}
        <div className="flex-1 space-y-4 w-full">
          {/* Header Row: Badge & Language Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-400/20 text-teal-300 border border-teal-400/30 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Bot className="w-3 h-3 text-teal-300" />
                <span>Robo Arogya Voice Feature</span>
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-sky-200 font-semibold hidden sm:inline">
                Patient: <strong className="text-white underline decoration-teal-400 underline-offset-2">{displayName}</strong>
              </span>
            </div>

            {/* Language Switcher for Welcome Voice */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-sky-400/20 text-xs">
              <Languages className="w-3.5 h-3.5 text-teal-400 ml-1.5 mr-0.5" />
              {(['en', 'hi', 'mr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition text-xs cursor-pointer ${
                    selectedLanguage === lang
                      ? 'bg-linear-to-r from-teal-500 to-sky-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          {/* Speech Bubble with Glowing Border and Spoken Dialogue */}
          <div className="relative bg-slate-900/90 rounded-2xl p-4 sm:p-5 border border-teal-500/40 shadow-inner backdrop-blur-md space-y-3">
            {/* Speech Bubble Pointer pointing towards Robot */}
            <div className="hidden lg:block absolute -left-2.5 top-8 w-4 h-4 bg-slate-900 border-l border-b border-teal-500/40 transform rotate-45" />

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                  <span>{currentScript.title}</span>
                  <span className="text-base">👋</span>
                </h3>
                <p className="text-xs text-teal-300 font-medium mt-0.5">
                  {currentScript.tagline}
                </p>
              </div>

              {/* Sound Wave Equalizer Graphic */}
              <div className="flex items-end gap-1 h-6 px-2 py-1 rounded-lg bg-teal-950/60 border border-teal-500/30">
                {[40, 75, 100, 60, 90, 45, 80].map((height, i) => (
                  <span
                    key={i}
                    style={{
                      height: isPlaying ? `${Math.max(20, (height * (1 + Math.sin(i * 1.5))) % 100)}%` : '30%',
                      transition: 'height 0.15s ease',
                    }}
                    className={`w-1 rounded-full ${
                      isPlaying
                        ? 'bg-teal-400 animate-pulse'
                        : 'bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Spoken Text Display with highlighted glow when speaking */}
            <div
              className={`p-3 rounded-xl border transition-all text-xs sm:text-sm leading-relaxed ${
                isPlaying
                  ? 'bg-teal-950/70 border-teal-400/60 text-teal-50 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                  : 'bg-slate-950/50 border-slate-800 text-slate-300'
              }`}
            >
              <div className="font-mono text-[11px] text-teal-400 mb-1 flex items-center gap-1.5 font-bold">
                <Bot className="w-3.5 h-3.5" />
                <span>ROBO AROGYA VOICE TRANSCRIPT:</span>
              </div>
              <p className="font-normal font-sans">
                &ldquo;{currentScript.speechText}&rdquo;
              </p>
            </div>

            {/* Primary Action Controls Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Big Welcome Voice Play / Pause Button */}
                <button
                  onClick={handlePauseResume}
                  className="px-4 py-2 rounded-xl bg-linear-to-r from-teal-500 via-teal-600 to-sky-600 hover:from-teal-400 hover:to-sky-500 text-white font-extrabold text-xs shadow-lg shadow-teal-500/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Voice</span>
                    </>
                  ) : isPaused ? (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>Resume Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>Play Welcome Voice Greeting</span>
                    </>
                  )}
                </button>

                {/* Replay Button */}
                <button
                  onClick={() => speakGreeting()}
                  title="Replay Welcome from beginning"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Replay</span>
                </button>

                {/* Stop Speech */}
                {(isPlaying || isPaused) && (
                  <button
                    onClick={handleStop}
                    className="px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800/60 text-xs font-bold transition cursor-pointer"
                  >
                    Stop
                  </button>
                )}
              </div>

              {/* Speed & Chime Controls */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="hidden sm:inline text-[11px]">Speed:</span>
                {[0.9, 1.0, 1.2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => {
                      setSpeechRate(rate);
                      if (isPlaying) {
                        speakGreeting();
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                      speechRate === rate
                        ? 'bg-teal-500 text-white shadow-2xs'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Interactive Shortcut Prompts */}
          {showExtendedControls && (
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Ask Arogya to Speak:</span>
              </span>

              <button
                onClick={() => {
                  if (onActionClick) onActionClick('REPORT_SUMMARY');
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-900/50 hover:bg-sky-800/60 border border-sky-400/30 text-sky-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🧪 Explain {displayName}&apos;s Lab Report</span>
              </button>

              <button
                onClick={() => {
                  if (onActionClick) onActionClick('QUEUE_STATUS');
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-900/50 hover:bg-teal-800/60 border border-teal-400/30 text-teal-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>⏱️ Live Token A-402 Wait Time</span>
              </button>

              <button
                onClick={() => {
                  if (onActionClick) onActionClick('DOCTOR_QUESTIONS');
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-900/50 hover:bg-indigo-800/60 border border-indigo-400/30 text-indigo-200 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>📋 Questions for Dr. Malhotra</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
