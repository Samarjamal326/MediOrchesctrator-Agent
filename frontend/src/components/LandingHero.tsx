import React from 'react';
import {
  Stethoscope,
  Activity,
  ShieldCheck,
  BrainCircuit,
  ArrowRight,
  Layers,
  Sparkles,
  Lock,
  Terminal,
  CheckCircle2,
  FileCode2,
  Zap,
  Key
} from 'lucide-react';
import { TWELVE_MEDICAL_DOMAINS } from '../data/medicalDomains';

interface LandingHeroProps {
  onStartChat: () => void;
  onExploreArchitecture: () => void;
  onOpenSettings: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartChat,
  onExploreArchitecture,
  onOpenSettings
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Hero Section */}
      <section className="w-full pt-16 pb-20 px-4 sm:px-6 relative flex flex-col items-center text-center overflow-hidden">
        
        {/* Subtle dot matrix grid background */}
        <div className="absolute inset-0 canvas-dot-grid-light dark:canvas-dot-grid pointer-events-none opacity-60" />
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none" />

        {/* Status Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/[0.04] dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 backdrop-blur-md mb-8">
          <div className="relative flex items-center justify-center w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300 tracking-widest uppercase">
            MEDIORCHESTRATOR // CLINICAL ENGINE
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.08] text-slate-900 dark:text-white max-w-4xl">
          A control plane for <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            clinical AI operations.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-base md:text-lg text-slate-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed">
          A deterministic control layer between clinical inquiries and autonomous specialist agents.
          MediOrchestrator isolates probabilistic reasoning inside strict verification boundaries and zero-tolerance emergency triage gates.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center gap-3.5 flex-wrap justify-center">
          <button
            onClick={onStartChat}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs sm:text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Launch Clinical Chatbot</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreArchitecture}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 font-mono text-xs sm:text-sm font-medium shadow-sm transition-all"
          >
            <Layers className="w-4 h-4 text-emerald-500" />
            <span>Inspect Vertical Architecture</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-3 rounded-xl bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-white/10 transition-colors"
            title="Configure Custom Model & API Keys"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>

      </section>

      {/* Highlights Grid */}
      <section className="w-full max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0f16] border border-slate-200/90 dark:border-white/10 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mb-2">
              12 Clinical Domain Agents
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Dynamic routing maps user queries into specialized agents including General Medicine, Dermatology, Nutrition, Cardiology, and Pediatrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0f16] border border-slate-200/90 dark:border-white/10 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mb-2">
              Deterministic Safety Gate
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Instant regex triage intercepts high-acuity red flags like chest pain or stroke symptoms, halting AI generation and triggering emergency protocols.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c0f16] border border-slate-200/90 dark:border-white/10 shadow-lg">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-bold text-base text-slate-900 dark:text-white mb-2">
              Bring Your Own Model (BYOK)
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
              Seamlessly switch between local Ollama (`qwen2.5:3b`), OpenAI, Groq, or OpenRouter with custom model IDs and API keys.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
