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
} from 'lucide-react';
import { FlickeringGrid } from './FlickeringGrid';

interface UnifiedLandingViewProps {
  onScrollToChat: () => void;
  onGoToChatbot: () => void;
  onGoToArchitecture: () => void;
}

const PILLARS = [
  {
    icon: BrainCircuit,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    title: 'LangGraph Orchestration',
    desc: 'Deterministic AI workflow with conditional routing across 12 clinical specialist agents.',
  },
  {
    icon: Database,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
    title: 'RAG + Qdrant Knowledge',
    desc: 'Hybrid semantic search retrieves verified medical knowledge before generation.',
  },
  {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    title: 'Dual Safety Guardrails',
    desc: 'Input and output safety checks with emergency red-flag detection and kill-switch.',
  },
  {
    icon: Activity,
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    title: 'Langfuse Observability',
    desc: 'Full trace visibility — every routing decision, RAG retrieval, and LLM call logged.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    title: 'Redis Semantic Cache',
    desc: 'Key-value and semantic caching avoids redundant pipeline runs for similar queries.',
  },
  {
    icon: Layers,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    title: 'Multi-Domain Routing',
    desc: '12 specialized clinical agents with shared LLM backend and domain-specific knowledge bases.',
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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

        {/* Status badge */}
        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-950/5 dark:bg-white/[0.04] border border-emerald-900/15 dark:border-white/10 backdrop-blur-md mb-8">
          <div className="relative flex items-center justify-center w-2 h-2">
            <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
            <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          </div>
          <span className="font-mono text-xs font-semibold text-emerald-800 dark:text-zinc-400 tracking-widest uppercase">
            MediOrchestrator // Clinical AI Engine
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="relative z-10 text-5xl sm:text-6xl md:text-[80px] font-bold tracking-tight leading-[1.05] text-zinc-900 dark:text-white max-w-4xl">
          A control plane for<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-800 to-teal-700 dark:from-blue-400 dark:via-white dark:to-blue-300">
            clinical intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="relative z-10 mt-6 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl font-sans leading-relaxed">
          A deterministic AI orchestration layer that safely routes health queries through 12 specialist agents, 
          RAG knowledge retrieval, dual safety guardrails, and full observability — all in one pipeline.
        </p>

        {/* CTAs */}
        <div className="relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onGoToChatbot}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black font-semibold text-sm shadow-xl transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Try the Chatbot</span>
          </button>
          <button
            onClick={onGoToArchitecture}
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white/70 hover:bg-white text-zinc-800 border border-emerald-900/15 dark:bg-transparent dark:border-white/20 dark:hover:border-white/40 dark:text-white font-semibold text-sm transition-all hover:scale-[1.02] shadow-sm"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>View Pipeline</span>
          </button>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 mt-16 flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500">
          <span className="text-xs font-mono tracking-widest uppercase">Scroll to explore</span>
          <ArrowDown className="w-4 h-4 animate-bounce" />
        </div>
      </section>

      {/* Feature pillars */}
      <section className="w-full max-w-6xl px-4 sm:px-6 pb-24 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Everything in the pipeline
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 max-w-md mx-auto">
            Every layer is purpose-built and observable.
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

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="w-px h-12 bg-gradient-to-b from-transparent via-emerald-600/30 dark:via-white/20 to-transparent" />
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onGoToChatbot}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-700/20 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-sm font-medium transition-all"
            >
              Open Chatbot →
            </button>
            <button
              onClick={onGoToArchitecture}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-emerald-700/10 hover:bg-emerald-700/20 text-emerald-800 border border-emerald-700/20 dark:bg-white/10 dark:hover:bg-white/20 dark:border-white/15 dark:text-white text-sm font-medium transition-all"
            >
              Explore Architecture →
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
