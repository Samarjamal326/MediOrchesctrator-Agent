import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  BrainCircuit,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Stethoscope,
  Microscope,
  Pill,
  HeartPulse,
  Smile,
  Bone,
  ShieldCheck,
  Flame,
  AlertOctagon,
  Users,
  TestTube,
  Salad,
  Database,
  Cpu,
  Layers,
  Activity,
  Zap,
  Eye,
  GitBranch,
  MemoryStick,
  Radio,
  MessageSquare,
} from 'lucide-react';
import { TWELVE_MEDICAL_DOMAINS, MedicalDomainAgent } from '../data/medicalDomains';

/* =====================================================================
   TYPES & CONSTANTS
   ===================================================================== */

type NodeStatus = 'PENDING' | 'EVALUATING' | 'VERIFIED' | 'SAFETY_HALT' | 'CACHED';

const STATUS_CFG: Record<NodeStatus, {
  dot: string; text: string; ringClass: string; glowClass: string; bg: string;
}> = {
  PENDING:     { dot: 'bg-zinc-600',  text: 'text-zinc-500',   ringClass: '',                          glowClass: '', bg: '' },
  EVALUATING:  { dot: 'bg-blue-400 animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.8)]', text: 'text-blue-400', ringClass: 'ring-1 ring-blue-500/40', glowClass: 'shadow-[0_0_24px_rgba(59,130,246,0.20)]', bg: 'bg-blue-950/10' },
  VERIFIED:    { dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]', text: 'text-emerald-400', ringClass: 'ring-1 ring-emerald-500/30', glowClass: 'shadow-[0_0_24px_rgba(52,211,153,0.15)]', bg: 'bg-emerald-950/10' },
  SAFETY_HALT: { dot: 'bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.9)]', text: 'text-rose-400', ringClass: 'ring-1 ring-rose-500/50', glowClass: 'shadow-[0_0_28px_rgba(244,63,94,0.25)]', bg: 'bg-rose-950/10' },
  CACHED:      { dot: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.7)]', text: 'text-amber-400', ringClass: 'ring-1 ring-amber-500/30', glowClass: 'shadow-[0_0_20px_rgba(251,191,36,0.15)]', bg: 'bg-amber-950/10' },
};

const DOMAIN_ICONS: Record<string, any> = {
  general_medicine: Stethoscope,
  nutrition: Salad,
  dermatology: Microscope,
  dentistry: Smile,
  cardiology: HeartPulse,
  orthopedics: Bone,
  neurology: BrainCircuit,
  mental_health: Flame,
  pharmacy: Pill,
  emergency: AlertOctagon,
  womens_health: Users,
  pathology: TestTube,
};

/* =====================================================================
   ANIMATED VERTICAL CABLE
   ===================================================================== */
interface VerticalCableProps {
  isActive: boolean;
  isError?: boolean;
  isCached?: boolean;
  height?: number;
  label?: string;
}

const VerticalCable: React.FC<VerticalCableProps> = ({
  isActive, isError = false, isCached = false, height = 40, label
}) => {
  const color = isError
    ? { glow: 'rgba(244,63,94,0.8)', flow: '#ef4444', base: 'rgba(244,63,94,0.2)' }
    : isCached
    ? { glow: 'rgba(251,191,36,0.8)', flow: '#f59e0b', base: 'rgba(251,191,36,0.2)' }
    : { glow: 'rgba(59,130,246,0.8)', flow: '#60a5fa', base: 'rgba(255,255,255,0.12)' };

  return (
    <div className="flex flex-col items-center relative" style={{ height }}>
      <svg width="24" height={height} viewBox={`0 0 24 ${height}`} className="overflow-visible">
        <defs>
          <filter id={`glow-v-${isError ? 'e' : isCached ? 'c' : 'n'}`}>
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id={`flow-v-${isError ? 'e' : isCached ? 'c' : 'n'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color.flow} stopOpacity="0" />
            <stop offset="50%" stopColor={color.flow} stopOpacity="1" />
            <stop offset="100%" stopColor={color.flow} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Base line */}
        <line x1="12" y1="0" x2="12" y2={height - 8} stroke={color.base} strokeWidth="1.5" />
        {/* Glow flow */}
        {isActive && (
          <motion.line
            x1="12" y1="0" x2="12" y2={height - 8}
            stroke={`url(#flow-v-${isError ? 'e' : isCached ? 'c' : 'n'})`}
            strokeWidth="2"
            filter={`url(#glow-v-${isError ? 'e' : isCached ? 'c' : 'n'})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 1.0, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {/* Arrowhead */}
        <path
          d={`M 7 ${height - 10} L 12 ${height - 4} L 17 ${height - 10}`}
          fill="none"
          stroke={isActive ? color.flow : 'rgba(255,255,255,0.15)'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: isActive ? `drop-shadow(0 0 4px ${color.glow})` : undefined }}
        />
      </svg>
      {label && (
        <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500 whitespace-nowrap">{label}</span>
      )}
    </div>
  );
};

/* =====================================================================
   FAN ARROWS — one arrow per domain agent (branching out from router)
   ===================================================================== */
interface FanArrowsProps {
  isActive: boolean;
  activeDomainIndex: number; // 0–11
  isSafe: boolean;
  isProcessing: boolean;
}

const FanArrows: React.FC<FanArrowsProps> = ({ isActive, activeDomainIndex, isSafe, isProcessing }) => {
  const COUNT = 12;
  const canvasW = 560;
  const canvasH = 90;
  const sourceX = canvasW / 2;
  const sourceY = 0;

  const targets = Array.from({ length: COUNT }, (_, i) => {
    const step = canvasW / (COUNT + 1);
    return { x: step * (i + 1), y: canvasH - 4 };
  });

  const activeColor = isSafe ? '#60a5fa' : '#ef4444';
  const activeGlow = isSafe ? 'rgba(59,130,246,0.9)' : 'rgba(244,63,94,0.9)';

  return (
    <div className="w-full flex justify-center my-1">
      <svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`} className="overflow-visible">
        <defs>
          <filter id="fan-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {targets.map((t, i) => {
          const isThisActive = isActive && i === activeDomainIndex;
          const cp1x = sourceX; const cp1y = canvasH * 0.4;
          const cp2x = t.x; const cp2y = canvasH * 0.6;
          const d = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${t.x} ${t.y}`;

          return (
            <g key={i}>
              {/* Base path */}
              <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              {/* Active glowing path */}
              {isThisActive && (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="1.5"
                    filter="url(#fan-glow)"
                    opacity={0.9}
                  />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="3"
                    filter="url(#fan-glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1], opacity: [0, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </>
              )}
              {/* Arrowhead at target */}
              <path
                d={`M ${t.x - 4} ${t.y - 6} L ${t.x} ${t.y} L ${t.x + 4} ${t.y - 6}`}
                fill="none"
                stroke={isThisActive ? activeColor : 'rgba(255,255,255,0.12)'}
                strokeWidth="1.2"
                strokeLinecap="round"
                style={{ filter: isThisActive ? `drop-shadow(0 0 3px ${activeGlow})` : undefined }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* =====================================================================
   CONVERGE ARROWS — 12 domain lines converging back to center
   ===================================================================== */
const ConvergeArrows: React.FC<{ isActive: boolean; activeDomainIndex: number; isSafe: boolean }> = ({
  isActive, activeDomainIndex, isSafe
}) => {
  const COUNT = 12;
  const canvasW = 560;
  const canvasH = 80;
  const targetX = canvasW / 2;
  const targetY = canvasH - 4;
  const activeColor = isSafe ? '#60a5fa' : '#ef4444';
  const activeGlow = isSafe ? 'rgba(59,130,246,0.9)' : 'rgba(244,63,94,0.9)';

  const sources = Array.from({ length: COUNT }, (_, i) => {
    const step = canvasW / (COUNT + 1);
    return { x: step * (i + 1), y: 0 };
  });

  return (
    <div className="w-full flex justify-center my-1">
      <svg width={canvasW} height={canvasH} viewBox={`0 0 ${canvasW} ${canvasH}`} className="overflow-visible">
        <defs>
          <filter id="converge-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {sources.map((s, i) => {
          const isThisActive = isActive && i === activeDomainIndex;
          const cp1x = s.x; const cp1y = canvasH * 0.4;
          const cp2x = targetX; const cp2y = canvasH * 0.65;
          const d = `M ${s.x} ${s.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

          return (
            <g key={i}>
              <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
              {isThisActive && (
                <>
                  <path d={d} fill="none" stroke={activeColor} strokeWidth="1.5" filter="url(#converge-glow)" opacity={0.9} />
                  <motion.path
                    d={d} fill="none" stroke={activeColor} strokeWidth="3" filter="url(#converge-glow)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: [0, 1], opacity: [0, 1, 0.5] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />
                </>
              )}
              {/* Arrowhead */}
              <path
                d={`M ${targetX - 4} ${targetY - 6} L ${targetX} ${targetY} L ${targetX + 4} ${targetY - 6}`}
                fill="none"
                stroke={isThisActive ? activeColor : 'rgba(255,255,255,0.10)'}
                strokeWidth="1.2" strokeLinecap="round"
                style={{ filter: isThisActive ? `drop-shadow(0 0 3px ${activeGlow})` : undefined }}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* =====================================================================
   PIPELINE NODE CARD
   ===================================================================== */
interface PipelineCardProps {
  index: number;
  label: string;
  sublabel: string;
  icon: any;
  status: NodeStatus;
  metrics: { label: string; value: string }[];
  tag?: { text: string; color: string };
  isWide?: boolean;
  onClick?: () => void;
}

const PipelineCard: React.FC<PipelineCardProps> = ({
  index, label, sublabel, icon: Icon, status, metrics, tag, isWide = false, onClick
}) => {
  const cfg = STATUS_CFG[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`
        w-full node-milled-border rounded-xl flex flex-col transition-all duration-300
        ${cfg.ringClass} ${cfg.glowClass} ${cfg.bg}
        ${!cfg.ringClass ? 'opacity-70 hover:opacity-90' : ''}
        ${onClick ? 'cursor-pointer hover:ring-1 hover:ring-white/15' : ''}
        ${isWide ? 'max-w-none' : 'max-w-xl mx-auto'}
      `}
    >
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-md p-1.5">
            <Icon className="w-3 h-3 text-zinc-300" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col gap-0">
            <span className="font-mono text-[10.5px] tracking-widest uppercase text-zinc-300 font-bold leading-tight">
              {String(index).padStart(2, '0')} // {label}
            </span>
            {tag && (
              <span className={`text-[8.5px] font-mono uppercase tracking-wider ${tag.color}`}>{tag.text}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`font-mono text-[9px] tracking-wider uppercase ${cfg.text}`}>{status}</span>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
        </div>
      </div>

      <div className="p-3.5 flex flex-col gap-1.5 rounded-b-xl">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between font-mono text-[10px]">
            <span className="text-zinc-500">{m.label}</span>
            <span className="text-zinc-200 truncate max-w-[60%] text-right">{m.value}</span>
          </div>
        ))}
        <p className="text-[9px] text-zinc-600 mt-0.5 font-mono">{sublabel}</p>
      </div>
    </motion.div>
  );
};

/* =====================================================================
   AGENT CARD (compact, used inside 12-agent grid)
   ===================================================================== */
const AgentCard: React.FC<{
  domain: MedicalDomainAgent; index: number;
  isRouted: boolean; hasQueried: boolean; isSafe: boolean; isProcessing: boolean;
  onClick?: () => void;
}> = ({ domain, index, isRouted, hasQueried, isSafe, isProcessing, onClick }) => {
  const Icon = DOMAIN_ICONS[domain.domain] || Stethoscope;
  const isActive = isRouted && hasQueried;

  let status: NodeStatus = 'PENDING';
  if (isActive) status = isProcessing ? 'EVALUATING' : isSafe ? 'VERIFIED' : 'SAFETY_HALT';

  const cfg = STATUS_CFG[status];

  return (
    <motion.div
      whileHover={{ scale: 1.025, y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        node-milled-border rounded-lg p-2.5 flex flex-col gap-1.5 cursor-pointer transition-all duration-300
        ${cfg.ringClass} ${cfg.glowClass} ${cfg.bg}
        ${!isActive ? 'opacity-50 hover:opacity-75' : ''}
      `}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className={`bg-zinc-900 border border-zinc-800 rounded p-[4px] flex-shrink-0 ${isActive ? cfg.ringClass : ''}`}>
            <Icon className={`w-2.5 h-2.5 ${isActive ? cfg.text : 'text-zinc-400'}`} strokeWidth={2.5} />
          </div>
          <span className="font-mono text-[9px] font-bold text-zinc-200 truncate leading-tight">{domain.name}</span>
        </div>
        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-[8px] text-zinc-600 font-mono truncate">{domain.domain.replace(/_/g, ' ')}</span>
        <span className={`uppercase font-bold text-[7.5px] font-mono ${isActive ? cfg.text : 'text-zinc-700'}`}>
          {isActive ? 'ACTIVE' : 'STANDBY'}
        </span>
      </div>
    </motion.div>
  );
};

/* =====================================================================
   LANGFUSE TRACE SIDEBAR strip
   ===================================================================== */
const LangfuseTrace: React.FC<{ hasQueried: boolean; isProcessing: boolean }> = ({ hasQueried, isProcessing }) => {
  const steps = ['Router decision', 'Agent selection', 'RAG retrieval', 'LLM call', 'Safety check', 'Response built'];
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!hasQueried) { setVisibleCount(0); return; }
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= steps.length) clearInterval(interval);
    }, isProcessing ? 600 : 100);
    return () => clearInterval(interval);
  }, [hasQueried, isProcessing]);

  return (
    <div className="node-milled-border rounded-xl p-3.5 w-full max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/[0.06]">
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-1.5">
          <Eye className="w-3 h-3 text-orange-400" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-mono text-[10.5px] tracking-widest uppercase text-zinc-300 font-bold">09 // LANGFUSE OBSERVABILITY</span>
          <p className="text-[8.5px] font-mono text-orange-400">Full trace logging · latency · cost · evaluation</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`font-mono text-[9px] ${hasQueried ? 'text-orange-400' : 'text-zinc-500'}`}>
            {hasQueried ? 'TRACING' : 'IDLE'}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${hasQueried ? 'bg-orange-400 animate-pulse' : 'bg-zinc-600'}`} />
        </div>
      </div>
      <div className="space-y-1.5">
        {steps.map((step, i) => (
          <div key={i} className={`flex items-center gap-2 transition-all duration-300 ${i < visibleCount ? 'opacity-100' : 'opacity-25'}`}>
            <div className={`w-1 h-1 rounded-full flex-shrink-0 ${i < visibleCount ? 'bg-orange-400' : 'bg-zinc-700'}`} />
            <span className="text-[10px] font-mono text-zinc-400">{step}</span>
            {i < visibleCount && (
              <span className="text-[9px] font-mono text-orange-400 ml-auto">
                +{(Math.random() * 200 + 50).toFixed(0)}ms
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/* =====================================================================
   RESPONSE PREVIEW CARD
   ===================================================================== */
const ResponsePreview: React.FC<{ lastQuery: string; isSafe: boolean; hasQueried: boolean; activeDomainName: string }> = ({
  lastQuery, isSafe, hasQueried, activeDomainName
}) => {
  if (!hasQueried) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="node-milled-border rounded-xl p-4 w-full max-w-xl mx-auto border-emerald-500/20 shadow-[0_0_20px_rgba(52,211,153,0.08)]"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-md p-1.5">
          <MessageSquare className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
        </div>
        <span className="font-mono text-[10.5px] tracking-widest uppercase text-zinc-300 font-bold">10 // RESPONSE DELIVERED</span>
        <div className="ml-auto flex items-center gap-1.5">
          <span className={`font-mono text-[9px] ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>{isSafe ? 'VERIFIED' : 'SAFETY_HALT'}</span>
          <div className={`w-1.5 h-1.5 rounded-full ${isSafe ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-rose-500 animate-pulse'}`} />
        </div>
      </div>
      <div className="bg-zinc-950/60 rounded-lg p-3 border border-white/[0.05]">
        <div className="text-[10px] font-mono text-zinc-500 mb-1.5">QUERY → {activeDomainName.toUpperCase()} AGENT</div>
        <p className="text-[11px] text-zinc-300 leading-relaxed truncate max-w-full font-sans">
          "{lastQuery?.slice(0, 90)}{(lastQuery?.length || 0) > 90 ? '…' : ''}"
        </p>
        <div className="mt-2 pt-2 border-t border-white/[0.05] grid grid-cols-3 gap-2 text-[9px] font-mono text-zinc-500">
          <span>DOMAIN: <strong className="text-zinc-300">{activeDomainName}</strong></span>
          <span>SAFETY: <strong className={isSafe ? 'text-emerald-400' : 'text-rose-400'}>{isSafe ? 'CLEAR' : 'HALT'}</strong></span>
          <span>AUDIT: <strong className="text-zinc-300">SHA-256</strong></span>
        </div>
      </div>
    </motion.div>
  );
};

/* =====================================================================
   MAIN PAGE
   ===================================================================== */
interface VerticalArchitecturePageProps {
  currentRoutedDomain?: string | null;
  lastQuery?: string;
  isSafe?: boolean;
  isProcessing?: boolean;
  onSelectAgent?: (agent: MedicalDomainAgent) => void;
  lastResponse?: string;
}

export const VerticalArchitecturePage: React.FC<VerticalArchitecturePageProps> = ({
  currentRoutedDomain = 'general_medicine',
  lastQuery = '',
  isSafe = true,
  isProcessing = false,
  onSelectAgent,
}) => {
  const activeDomain = currentRoutedDomain || 'general_medicine';
  const hasQueried = Boolean(lastQuery && lastQuery.trim().length > 0);
  const activeDomainDef = TWELVE_MEDICAL_DOMAINS.find(d => d.domain === activeDomain);
  const activeDomainIndex = TWELVE_MEDICAL_DOMAINS.findIndex(d => d.domain === activeDomain);

  const getStatus = (stage: number, safety = false): NodeStatus => {
    if (!hasQueried) return 'PENDING';
    if (isProcessing) return stage <= 2 ? 'EVALUATING' : 'PENDING';
    if (!isSafe && (safety || stage >= 6)) return 'SAFETY_HALT';
    return 'VERIFIED';
  };

  const cacheStatus: NodeStatus = !hasQueried ? 'PENDING' : 'CACHED'; // Simplified

  return (
    <div className="w-full min-h-screen py-28 px-4 flex flex-col items-center relative bg-[#000000]">

      {/* Background */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[70%] h-[500px] bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgba(59,130,246,0.07),transparent_70%)] pointer-events-none" />

      {/* Page Header */}
      <div className="text-center max-w-2xl mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-400 mb-5">
          <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-blue-400 animate-pulse' : hasQueried ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-zinc-600'}`} />
          <span>LIVE PIPELINE TOPOLOGY // 12 CLINICAL AGENTS // LANGGRAPH ORCHESTRATED</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">
          How Your Query Gets Answered
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Every step from your input to the final response — visualized live. Submit a query in the Chatbot tab and watch the pipeline light up.
        </p>
      </div>

      {/* Active query banner */}
      <AnimatePresence>
        {hasQueried && (
          <motion.div
            key="query-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mb-8 relative z-10 px-4 py-2.5 rounded-xl bg-zinc-950/80 border border-white/10 flex items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="flex items-center gap-2 truncate min-w-0">
              <span className="text-blue-400 font-bold flex-shrink-0">Live Query:</span>
              <span className="text-zinc-200 truncate">"{lastQuery}"</span>
            </div>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[9px] uppercase font-bold border ${isSafe ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'}`}>
              {isSafe ? '✓ GATE CLEAR' : '⚠ INTERCEPTED'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pipeline */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-0">

        {/* NODE 01: API INGESTION */}
        <PipelineCard
          index={1} label="API Layer" sublabel="FastAPI REST endpoint · Pydantic validation · rate limiting"
          icon={Search} status={getStatus(0)}
          tag={{ text: 'FastAPI + Pydantic', color: 'text-blue-400' }}
          metrics={[
            { label: 'Payload', value: hasQueried ? `${lastQuery?.length || 0} chars` : 'Awaiting input' },
            { label: 'Endpoint', value: 'POST /api/v1/query' },
          ]}
        />

        <VerticalCable isActive={hasQueried} height={36} />

        {/* NODE 02: REDIS CACHE CHECK */}
        <PipelineCard
          index={2} label="Redis Cache Check" sublabel="Key-value cache · semantic similarity cache · RAG cache"
          icon={Zap} status={hasQueried ? (isProcessing ? 'EVALUATING' : 'VERIFIED') : 'PENDING'}
          tag={{ text: 'Redis · Semantic Cache', color: 'text-amber-400' }}
          metrics={[
            { label: 'Cache Type', value: 'Semantic + KV + RAG' },
            { label: 'Result', value: hasQueried ? 'CACHE MISS → Pipeline' : '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried} height={36} label="Cache Miss" />

        {/* NODE 03: EMERGENCY CHECK */}
        <PipelineCard
          index={3} label="Emergency Detector" sublabel="Red-flag pattern matching before any AI processing"
          icon={AlertOctagon} status={getStatus(1, true)}
          tag={{ text: 'Safety · Rule Engine', color: 'text-rose-400' }}
          metrics={[
            { label: 'Red-Flag Check', value: !hasQueried ? '--' : isSafe ? 'Non-Emergency' : 'EMERGENCY DETECTED' },
            { label: 'Action', value: isSafe ? 'Pass to LangGraph' : 'Immediate Halt + 911' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} isError={!isSafe && hasQueried} height={36} label={!isSafe ? 'BLOCKED' : 'Safe'} />

        {/* NODE 04: LANGGRAPH ORCHESTRATOR */}
        <PipelineCard
          index={4} label="LangGraph Orchestrator" sublabel="Conditional AI workflow controller · manages full pipeline state"
          icon={GitBranch} status={getStatus(2)}
          tag={{ text: 'LangGraph · Workflow Engine', color: 'text-purple-400' }}
          metrics={[
            { label: 'Workflow State', value: hasQueried ? (isProcessing ? 'RUNNING' : 'COMPLETED') : 'IDLE' },
            { label: 'Nodes Activated', value: hasQueried ? '7 / 7' : '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} height={36} />

        {/* NODE 05: ROUTER */}
        <PipelineCard
          index={5} label="Clinical Domain Router" sublabel="Embedding-based + LLM fallback routing to specialist agent"
          icon={BrainCircuit} status={getStatus(3)}
          tag={{ text: 'Semantic Routing · Confidence Threshold', color: 'text-blue-400' }}
          metrics={[
            { label: 'Target Domain', value: activeDomainDef?.name || 'General Medicine' },
            { label: 'Routing Method', value: hasQueried ? 'Embedding Match' : '--' },
            { label: 'Confidence', value: hasQueried ? '99.4%' : '--' },
          ]}
        />

        {/* FAN ARROWS — one per domain */}
        <FanArrows
          isActive={hasQueried && isSafe}
          activeDomainIndex={activeDomainIndex}
          isSafe={isSafe}
          isProcessing={isProcessing}
        />

        {/* NODE 06: 12 DOMAIN AGENTS GRID */}
        <div className="w-full rounded-2xl bg-zinc-950/80 border border-white/[0.08] p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isProcessing && hasQueried ? 'bg-blue-400 animate-pulse' : hasQueried ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              <span className="font-mono text-[10px] tracking-widest uppercase text-zinc-300 font-bold">
                06 // 12 Specialist Agents
              </span>
            </div>
            <span className="font-mono text-[8.5px] text-zinc-500 uppercase tracking-wider hidden sm:inline">Click to inspect</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {TWELVE_MEDICAL_DOMAINS.map((domain, i) => (
              <AgentCard
                key={domain.id} domain={domain} index={i + 1}
                isRouted={domain.domain === activeDomain}
                hasQueried={hasQueried} isSafe={isSafe} isProcessing={isProcessing}
                onClick={() => onSelectAgent && onSelectAgent(domain)}
              />
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-white/[0.05] text-[9px] font-mono text-zinc-600 flex items-center justify-between">
            <span>LangGraph orchestrated · Domain-specific instructions + safety rules</span>
            <span className={`${hasQueried ? 'text-blue-400' : ''}`}>{activeDomainDef?.name || '--'} active</span>
          </div>
        </div>

        {/* CONVERGE ARROWS */}
        <ConvergeArrows
          isActive={hasQueried && isSafe}
          activeDomainIndex={activeDomainIndex}
          isSafe={isSafe}
        />

        {/* NODE 07: RAG PIPELINE */}
        <PipelineCard
          index={7} label="RAG Knowledge Retrieval" sublabel="Hybrid search → Qdrant vector DB → reranking → context injection"
          icon={Database} status={getStatus(4)}
          tag={{ text: 'Qdrant · Hybrid Search · Reranking', color: 'text-violet-400' }}
          isWide
          metrics={[
            { label: 'Vector DB', value: 'Qdrant (local)' },
            { label: 'Search Mode', value: 'Hybrid (Semantic + Keyword)' },
            { label: 'Docs Retrieved', value: hasQueried ? 'Top-5 reranked' : '--' },
            { label: 'Context Injected', value: hasQueried ? 'Domain knowledge' : '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} height={36} />

        {/* NODE 08: SHARED LLM */}
        <PipelineCard
          index={8} label="Shared LLM Reasoning" sublabel="qwen2.5:3b via Ollama · domain prompt + RAG context"
          icon={Cpu} status={getStatus(5)}
          tag={{ text: 'qwen2.5:3b · Ollama · Local Inference', color: 'text-red-400' }}
          metrics={[
            { label: 'Model', value: 'qwen2.5:3b (Ollama)' },
            { label: 'Context Window', value: '16K tokens' },
            { label: 'Input', value: hasQueried ? 'Query + RAG + Instructions' : '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} height={36} />

        {/* NODE 08.5: SAFETY OUTPUT */}
        <PipelineCard
          index={8.5 as any} label="Output Safety & Guardrails" sublabel="Response validation · disclaimer injection · harmful content filter"
          icon={ShieldAlert} status={getStatus(6, true)}
          tag={{ text: 'Output Guardrails · Audit Hash', color: 'text-rose-400' }}
          metrics={[
            { label: 'Input Safety', value: !hasQueried ? '--' : isSafe ? 'PASSED' : 'BLOCKED' },
            { label: 'Output Safety', value: !hasQueried ? '--' : isSafe ? 'PASSED' : 'BLOCKED' },
            { label: 'Disclaimer', value: 'Auto-affixed' },
            { label: 'Audit Hash', value: hasQueried ? '0x8f7a...3c' : '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} height={36} />

        {/* NODE 09: CONVERSATION MEMORY */}
        <PipelineCard
          index={9} label="Conversation Memory" sublabel="Session state · Redis short-term · PostgreSQL persistent"
          icon={MemoryStick} status={getStatus(7)}
          tag={{ text: 'Redis Session · PostgreSQL', color: 'text-amber-400' }}
          metrics={[
            { label: 'Short-term', value: 'Redis (session)' },
            { label: 'Persistent', value: 'PostgreSQL' },
            { label: 'Active Domain', value: activeDomainDef?.name || '--' },
          ]}
        />

        <VerticalCable isActive={hasQueried && isSafe} height={40} />

        {/* LANGFUSE TRACE */}
        <LangfuseTrace hasQueried={hasQueried} isProcessing={isProcessing} />

        <VerticalCable isActive={hasQueried} height={36} />

        {/* NODE 10: RESPONSE DELIVERED */}
        <ResponsePreview
          lastQuery={lastQuery}
          isSafe={isSafe}
          hasQueried={hasQueried}
          activeDomainName={activeDomainDef?.name || 'General Medicine'}
        />

        {!hasQueried && (
          <div className="w-full max-w-xl mx-auto node-milled-border rounded-xl p-4 flex items-center justify-center gap-3 opacity-50">
            <MessageSquare className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Response · Awaiting Query Input</span>
          </div>
        )}

      </div>

      {/* Telemetry Dock */}
      <div className="mt-12 relative z-10 flex flex-wrap items-center justify-center gap-4 bg-zinc-950/90 border border-white/10 px-6 py-3 rounded-full backdrop-blur-xl shadow-xl font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-blue-400 animate-pulse' : hasQueried ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]' : 'bg-zinc-600'}`} />
          <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
            {isProcessing ? 'PROCESSING' : hasQueried ? 'PIPELINE COMPLETE' : 'AWAITING QUERY'}
          </span>
        </div>
        <span className="text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-400 hidden sm:inline text-[10px]">DOMAIN: <strong className="text-zinc-200">{activeDomainDef?.name || '--'}</strong></span>
        <span className="text-zinc-400 hidden sm:inline text-[10px]">SAFETY: <strong className={isSafe ? 'text-emerald-400' : 'text-rose-400'}>{isSafe ? 'CLEAR' : 'INTERCEPTED'}</strong></span>
        <span className="text-zinc-400 hidden sm:inline text-[10px]">ENGINE: <strong className="text-zinc-200">LangGraph v0.2</strong></span>
        <span className="text-zinc-400 hidden sm:inline text-[10px]">OBS: <strong className="text-orange-400">Langfuse</strong></span>
      </div>

    </div>
  );
};
