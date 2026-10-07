import React from 'react';
import {
  ShieldCheck,
  BrainCircuit,
  ArrowDown,
  Sparkles,
  Layers,
  Zap,
  Database,
  Activity,
  HeartPulse,
  Microscope,
  Stethoscope,
  Smile,
  AlertOctagon,
  TestTube,
} from 'lucide-react';
import { FlickeringGrid } from './FlickeringGrid';
import { TWELVE_MEDICAL_DOMAINS } from '../data/medicalDomains';

interface UnifiedLandingViewProps {
  onScrollToChat: () => void;
  onGoToChatbot: () => void;
  onGoToArchitecture: () => void;
}

const PILLARS = [
  {
    icon: BrainCircuit,
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'Multi-Agent Orchestration',
    desc: 'Deterministic classification automatically routes patient symptoms into 12 specialized clinical domains.',
  },
  {
    icon: Database,
    color: 'text-purple-500 dark:text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    title: 'Evidence-Based RAG & Protocols',
    desc: 'Grounds advice on peer-reviewed guidelines from WHO, CDC, AAD, ADA, and ACC/AHA clinical frameworks.',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Dual Safety Guardrails',
    desc: 'Pre-flight and post-synthesis emergency red-flag scanners intercept acute life threats before release.',
  },
  {
    icon: Activity,
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Observability & Trace Audit',
    desc: 'Full latency telemetry per stage with cryptographic audit logging and transparent rationale notes.',
  },
  {
    icon: Zap,
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    title: 'Semantic Caching & Speed',
    desc: 'Avoids redundant inference loops for frequent medical inquiries while preserving accuracy.',
  },
  {
    icon: Layers,
    color: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-500/10 border-cyan-500/20',
    title: 'Structured Output Synthesis',
    desc: 'Markdown tables for routines/comparisons and bullet lists with bold warnings for acute symptoms.',
  },
];

export const UnifiedLandingView: React.FC<UnifiedLandingViewProps> = ({
  onScrollToChat,
  onGoToChatbot,
  onGoToArchitecture,
}) => {
  return (
    <div className="w-full flex flex-col items-center relative">

      {/* Hero Section */}
      <section className="w-full min-h-screen pt-20 pb-16 px-4 sm:px-6 relative flex flex-col items-center justify-center text-center overflow-hidden">

        {/* Flickering Grid Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, white 0%, white 65%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, white 0%, white 65%, transparent 100%)',
          }}
        >
          <FlickeringGrid
            className="w-full h-full"
            squareSize={4}
            gridGap={6}
            color="rgb(255, 255, 255)"
            maxOpacity={0.10}
            flickerChance={0.25}
          />
        </div>

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none" />

        {/* Status badge */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/5 dark:bg-white/[0.04] border border-emerald-900/15 dark:border-white/10 backdrop-blur-md mb-8">
          <div className="relative flex items-center justify-center w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-zinc-300 tracking-widest uppercase">
            MediOrchestrator // 12 Clinical Agents Operational
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="relative z-10 text-5xl sm:text-6xl md:text-[80px] font-bold tracking-tight leading-[1.05] text-zinc-900 dark:text-white max-w-4xl">
          A control plane for<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-white dark:to-teal-300">
            clinical intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed">
          Deterministic AI orchestration safely routes patient symptoms through 12 specialized medical agents, 
          strict non-definitive guidelines, dual safety guardrails, and structured Markdown output.
        </p>

        {/* CTAs */}
        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoToChatbot}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold text-sm shadow-xl transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Consultation Chat</span>
          </button>
          <button
            onClick={onGoToArchitecture}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white/70 hover:bg-white text-zinc-800 border border-emerald-900/15 dark:bg-transparent dark:border-white/20 dark:hover:border-white/40 dark:text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-sm"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Explore Pipeline Architecture</span>
          </button>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="relative z-10 mt-14 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl w-full">
          {[
            { label: 'Active Specialists', value: '12 Operational', detail: 'General Med to Pathology' },
            { label: 'Acuity Safety Gate', value: '100% Monitored', detail: 'Red-flag intercept active' },
            { label: 'Inference Engine', value: 'qwen2.5:3b', detail: 'Ollama local + External' },
            { label: 'Formatting Directive', value: 'Rich Markdown', detail: 'Tables, Lists, Bold' },
          ].map((metric, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-emerald-900/10 dark:border-emerald-500/20 bg-white/80 dark:bg-[#0c120f]/80 backdrop-blur-md text-left shadow-sm"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-0.5">
                {metric.label}
              </span>
              <strong className="text-sm font-bold text-zinc-900 dark:text-white block font-mono">
                {metric.value}
              </strong>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans mt-0.5 block truncate">
                {metric.detail}
              </span>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-12 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <span className="text-xs font-mono tracking-widest uppercase">Scroll to explore pillars</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* Feature pillars */}
      <section className="w-full max-w-6xl px-4 sm:px-6 pb-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Pipeline Architecture Pillars
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Every layer blends medical theory with observable execution guarantees.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <div
                key={i}
                className="node-milled-border rounded-xl p-5 flex flex-col gap-3 hover:border-emerald-500/30 dark:hover:border-white/20 transition-all duration-300 group"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center ${pillar.bg}`}>
                  <Icon className={`w-4.5 h-4.5 ${pillar.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1">{pillar.title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{pillar.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 12 Operational Specialist Agents Showcase */}
        <div className="mt-14 p-6 rounded-2xl border border-emerald-900/10 dark:border-emerald-500/20 bg-white/70 dark:bg-[#0c120f]/70 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                All 12 Clinical Domain Specialists
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Configured with specialized medical boundary prompts and active routing.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              12 / 12 OPERATIONAL
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {TWELVE_MEDICAL_DOMAINS.map((domain) => (
              <div
                key={domain.id}
                className="p-2.5 rounded-lg border border-emerald-900/10 dark:border-white/[0.06] bg-emerald-50/30 dark:bg-[#121c17]/60 flex flex-col gap-1"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {domain.name}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-1 font-mono">
                  {domain.primaryModel.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-emerald-600/30 dark:via-white/20 to-transparent" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGoToChatbot}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-700/20 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-sm font-medium transition-all"
            >
              Open Consultation Chat →
            </button>
            <button
              onClick={onGoToArchitecture}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-700/20 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-sm font-medium transition-all"
            >
              Explore Architecture Pipeline →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
