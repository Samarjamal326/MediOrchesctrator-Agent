import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Stethoscope,
  Microscope,
  Pill,
  HeartPulse,
  Smile,
  Bone,
  Flame,
  AlertOctagon,
  Users,
  TestTube,
  Salad,
  BrainCircuit,
  ArrowRight,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Lock,
  GitBranch,
  Terminal,
  Activity,
  Layers,
  Radio,
  FileSearch,
  BookOpen,
} from 'lucide-react';
import { TWELVE_MEDICAL_DOMAINS, MedicalDomainAgent } from '../data/medicalDomains';

/* =====================================================================
   DOMAIN ICONS & FRIENDLY SUBTITLES
   ===================================================================== */
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

const DOMAIN_FRIENDLY_DESC: Record<string, string> = {
  general_medicine: 'Everyday health, common symptoms & primary triage',
  nutrition: 'Dietary science, metabolic wellness & meal pairing',
  dermatology: 'Skin barriers, rashes, hair & lesion guidance',
  dentistry: 'Teeth, gum health, oral pain & tooth trauma',
  cardiology: 'Heart rhythms, blood pressure & cardio warning signs',
  orthopedics: 'Joints, spine, muscles & sports injury recovery',
  neurology: 'Headaches, nerve pathways & cognitive symptoms',
  mental_health: 'Stress, emotional wellness & mood balance',
  pharmacy: 'Medications, supplement cautions & interactions',
  emergency: 'Acute red-flag triage & urgent care escalation',
  womens_health: 'Hormonal cycles, prenatal & maternal wellness',
  pathology: 'Lab test values, biomarkers & screening context',
};

/* =====================================================================
   ANIMATED CONNECTOR — Vertical data bus with bidirectional pulse
   ===================================================================== */
type ConnectorColor = 'emerald' | 'blue' | 'rose' | 'cyan' | 'purple' | 'amber';

interface ConnectorProps {
  active?: boolean;
  processing?: boolean;
  label?: string;
  sublabel?: string;
  color?: ConnectorColor;
}

const COLOR_MAP: Record<ConnectorColor, {
  track: string; fill: string; glow: string; dot: string;
  labelCls: string; arrowColor: string;
}> = {
  emerald: {
    track: 'bg-emerald-500/20 dark:bg-emerald-400/15',
    fill: 'bg-emerald-500',
    glow: 'shadow-[0_0_12px_rgba(16,185,129,0.9)]',
    dot: 'bg-emerald-400',
    labelCls: 'text-emerald-700 dark:text-emerald-300 border-emerald-500/30 bg-emerald-50/90 dark:bg-[#0a1811]',
    arrowColor: 'rgba(16,185,129,0.7)',
  },
  blue: {
    track: 'bg-blue-500/20 dark:bg-blue-400/15',
    fill: 'bg-blue-500',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.9)]',
    dot: 'bg-blue-400',
    labelCls: 'text-blue-700 dark:text-blue-300 border-blue-500/30 bg-blue-50/90 dark:bg-[#0c1626]',
    arrowColor: 'rgba(59,130,246,0.7)',
  },
  purple: {
    track: 'bg-purple-500/20 dark:bg-purple-400/15',
    fill: 'bg-purple-500',
    glow: 'shadow-[0_0_12px_rgba(168,85,247,0.9)]',
    dot: 'bg-purple-400',
    labelCls: 'text-purple-700 dark:text-purple-300 border-purple-500/30 bg-purple-50/90 dark:bg-[#1a0f2e]',
    arrowColor: 'rgba(168,85,247,0.7)',
  },
  rose: {
    track: 'bg-rose-500/20 dark:bg-rose-400/15',
    fill: 'bg-rose-500',
    glow: 'shadow-[0_0_12px_rgba(244,63,94,0.9)]',
    dot: 'bg-rose-400',
    labelCls: 'text-rose-700 dark:text-rose-300 border-rose-500/30 bg-rose-50/90 dark:bg-[#260f15]',
    arrowColor: 'rgba(244,63,94,0.7)',
  },
  cyan: {
    track: 'bg-cyan-500/20 dark:bg-cyan-400/15',
    fill: 'bg-cyan-500',
    glow: 'shadow-[0_0_12px_rgba(6,182,212,0.9)]',
    dot: 'bg-cyan-400',
    labelCls: 'text-cyan-700 dark:text-cyan-300 border-cyan-500/30 bg-cyan-50/90 dark:bg-[#0a1e24]',
    arrowColor: 'rgba(6,182,212,0.7)',
  },
  amber: {
    track: 'bg-amber-500/20 dark:bg-amber-400/15',
    fill: 'bg-amber-500',
    glow: 'shadow-[0_0_12px_rgba(245,158,11,0.9)]',
    dot: 'bg-amber-400',
    labelCls: 'text-amber-700 dark:text-amber-300 border-amber-500/30 bg-amber-50/90 dark:bg-[#241708]',
    arrowColor: 'rgba(245,158,11,0.7)',
  },
};

const StageConnector: React.FC<ConnectorProps> = ({
  active = false,
  processing = false,
  label,
  sublabel,
  color = 'emerald',
}) => {
  const c = COLOR_MAP[color];
  return (
    <div className="w-full flex flex-col items-center py-2 relative z-10">
      {/* Vertical Animated Wire */}
      <div className={`relative w-1 h-14 ${c.track} rounded-full overflow-hidden`}>
        {(active || processing) && (
          <motion.div
            className={`absolute top-0 left-0 right-0 ${c.fill} rounded-full`}
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
        )}
        {processing && (
          <motion.div
            className={`absolute w-3 h-3 rounded-full ${c.dot} ${c.glow}`}
            style={{ left: '50%', marginLeft: -6 }}
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {active && !processing && (
          <motion.div
            className={`absolute w-2.5 h-2.5 rounded-full ${c.dot} ${c.glow}`}
            style={{ left: '50%', marginLeft: -5 }}
            animate={{ top: ['0%', '85%', '0%'] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Label and Sublabel */}
      {label && (
        <div className="flex flex-col items-center my-1.5">
          <span
            className={`text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border backdrop-blur-md shadow-sm ${c.labelCls}`}
          >
            {label}
          </span>
          {sublabel && (
            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
              {sublabel}
            </span>
          )}
        </div>
      )}

      {/* Down-pointing arrow */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${c.arrowColor}`,
        }}
      />
    </div>
  );
};

/* =====================================================================
   STAGE CARD WITH UNIQUE VISUAL THEME PER NODE
   ===================================================================== */
type StageStatus = 'idle' | 'active' | 'done' | 'error';
type AccentColor = 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan';

interface StageCardProps {
  step: number;
  title: string;
  theoryDesc: string;
  techDesc: string;
  status?: StageStatus;
  accentColor?: AccentColor;
  badge?: React.ReactNode;
  nodeAnimationType: 'wave' | 'scan' | 'tree' | 'mesh' | 'shield' | 'stream';
  children?: React.ReactNode;
}

const ACCENT: Record<AccentColor, {
  step: string;
  active: string;
  done: string;
  idle: string;
  glow: string;
  headerIconBg: string;
}> = {
  emerald: {
    step: 'bg-emerald-100 dark:bg-[#152e20] border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
    active: 'border-emerald-500/70 bg-emerald-50/70 dark:bg-[#102218] dark:border-emerald-400 ring-2 ring-emerald-500/30',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(16,185,129,0.16)] dark:shadow-[0_6px_35px_rgba(16,185,129,0.14)]',
    headerIconBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300',
  },
  blue: {
    step: 'bg-blue-100 dark:bg-[#13222e] border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-300',
    active: 'border-blue-500/70 bg-blue-50/70 dark:bg-[#101c24] dark:border-blue-400 ring-2 ring-blue-500/30',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(59,130,246,0.16)] dark:shadow-[0_6px_35px_rgba(59,130,246,0.14)]',
    headerIconBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
  },
  purple: {
    step: 'bg-purple-100 dark:bg-[#251533] border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300',
    active: 'border-purple-500/70 bg-purple-50/70 dark:bg-[#1d1028] dark:border-purple-400 ring-2 ring-purple-500/30',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(168,85,247,0.16)] dark:shadow-[0_6px_35px_rgba(168,85,247,0.14)]',
    headerIconBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300',
  },
  amber: {
    step: 'bg-amber-100 dark:bg-[#2e1d0d] border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300',
    active: 'border-amber-500/70 bg-amber-50/70 dark:bg-[#21160a] dark:border-amber-400 ring-2 ring-amber-500/30',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(245,158,11,0.16)] dark:shadow-[0_6px_35px_rgba(245,158,11,0.14)]',
    headerIconBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
  },
  rose: {
    step: 'bg-rose-100 dark:bg-[#2e1418] border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300',
    active: 'border-rose-500/80 bg-rose-50/80 dark:bg-[#260f15] dark:border-rose-500 ring-2 ring-rose-500/40',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(244,63,94,0.18)] dark:shadow-[0_6px_35px_rgba(244,63,94,0.16)]',
    headerIconBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300',
  },
  cyan: {
    step: 'bg-cyan-100 dark:bg-[#10252b] border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300',
    active: 'border-cyan-500/70 bg-cyan-50/70 dark:bg-[#0e2126] dark:border-cyan-400 ring-2 ring-cyan-500/30',
    done: 'border-emerald-500/40 bg-white dark:bg-[#0f1914] dark:border-emerald-500/30',
    idle: 'border-emerald-900/10 bg-white/95 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_6px_35px_rgba(6,182,212,0.16)] dark:shadow-[0_6px_35px_rgba(6,182,212,0.14)]',
    headerIconBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300',
  },
};

const StageCard: React.FC<StageCardProps> = ({
  step,
  title,
  theoryDesc,
  techDesc,
  status = 'idle',
  accentColor = 'emerald',
  badge,
  nodeAnimationType,
  children,
}) => {
  const ac = ACCENT[accentColor];
  const borderCls =
    status === 'active' ? ac.active :
    status === 'done' ? ac.done :
    status === 'error' ? ACCENT.rose.active :
    ac.idle;
  const glowCls = (status === 'done' || status === 'active') ? ac.glow : '';
  const stepCls = status === 'error' ? ACCENT.rose.step : ac.step;

  // Unique micro-animation render based on nodeAnimationType
  const renderNodeAnimation = () => {
    switch (nodeAnimationType) {
      case 'wave':
        return (
          <div className="flex items-center gap-1 h-3.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            {[0, 1, 2, 3].map((bar) => (
              <motion.span
                key={bar}
                animate={status === 'active' || status === 'done' ? { height: ['3px', '12px', '3px'] } : { height: '3px' }}
                transition={{ duration: 0.9, delay: bar * 0.15, repeat: Infinity }}
                className="w-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full inline-block"
              />
            ))}
          </div>
        );
      case 'scan':
        return (
          <div className="relative w-10 h-3.5 rounded-full bg-blue-500/10 border border-blue-500/20 overflow-hidden flex items-center">
            <motion.div
              animate={{ left: ['-20%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
              className="absolute w-3 h-full bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-80"
            />
          </div>
        );
      case 'tree':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <GitBranch className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <motion.span
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
            />
          </div>
        );
      case 'mesh':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            <Cpu className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
            />
          </div>
        );
      case 'shield':
        return (
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
            <motion.div
              animate={status === 'error' ? { rotate: [0, -10, 10, 0] } : { scale: [1, 1.1, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
          </div>
        );
      case 'stream':
        return (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400">OUT</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border transition-all duration-300 backdrop-blur-xl p-5 sm:p-7 shadow-lg ${borderCls} ${glowCls}`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between flex-wrap gap-2.5 mb-2.5">
        <div className="flex items-center gap-3">
          <motion.span
            animate={status === 'active' ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.4, repeat: Infinity }}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs border shadow-sm ${stepCls}`}
          >
            {step}
          </motion.span>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{title}</h2>
          {renderNodeAnimation()}
        </div>
        {badge && <div className="flex items-center gap-1.5 text-xs font-mono">{badge}</div>}
      </div>

      {/* Dual Context: Theory & Technical Reality */}
      <div className="space-y-1.5 mb-4">
        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-sans">
          {theoryDesc}
        </p>
        <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 bg-zinc-100/60 dark:bg-white/[0.03] px-2.5 py-1 rounded-lg border border-black/[0.04] dark:border-white/[0.04]">
          <Terminal className="w-3 h-3 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="line-clamp-1">{techDesc}</span>
        </p>
      </div>

      {children}
    </div>
  );
};

/* =====================================================================
   MAIN COMPONENT
   ===================================================================== */
export interface VerticalArchitecturePageProps {
  currentRoutedDomain?: string | null;
  lastQuery?: string;
  lastResponse?: string;
  isSafe?: boolean;
  isProcessing?: boolean;
  executionTrace?: any;
  onSelectAgent?: (agent: MedicalDomainAgent) => void;
  onNavigateToChat?: () => void;
}

export const VerticalArchitecturePage: React.FC<VerticalArchitecturePageProps> = ({
  currentRoutedDomain = 'general_medicine',
  lastQuery = '',
  lastResponse = '',
  isSafe = true,
  isProcessing = false,
  executionTrace = null,
  onSelectAgent,
  onNavigateToChat,
}) => {
  const activeDomain = currentRoutedDomain || 'general_medicine';
  const hasQueried = Boolean(lastQuery && lastQuery.trim().length > 0);
  const activeAgent =
    TWELVE_MEDICAL_DOMAINS.find((d) => d.domain === activeDomain) || TWELVE_MEDICAL_DOMAINS[0];
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const queryWords = useMemo(() => {
    if (!lastQuery) return ['Headache', 'Blood pressure', 'Rash', 'Diet'];
    return lastQuery.split(/\s+/).slice(0, 10);
  }, [lastQuery]);

  // Derive stage statuses for all 6 pipeline nodes
  const s1: StageStatus = hasQueried ? 'done' : 'idle';
  const s2: StageStatus = isProcessing ? 'active' : hasQueried ? 'done' : 'idle';
  const s3: StageStatus = hasQueried ? 'done' : 'idle';
  const s4: StageStatus = hasQueried ? 'done' : 'idle';
  const s5: StageStatus = isProcessing ? 'active' : hasQueried ? 'done' : 'idle';
  const s6: StageStatus = hasQueried && !isSafe ? 'error' : hasQueried ? 'done' : 'idle';
  const s7: StageStatus = hasQueried && !isProcessing ? 'done' : 'idle';

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-4 sm:px-6 flex flex-col items-center relative bg-[#f3f7f4] dark:bg-[#000000] text-zinc-900 dark:text-white transition-colors duration-200">
      {/* Background Grids */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40 dark:opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.09),transparent_75%)] pointer-events-none" />

      {/* ── HERO HEADER ── */}
      <header className="text-center max-w-3xl mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/5 dark:bg-white/[0.04] border border-emerald-900/15 dark:border-white/10 text-xs font-mono text-emerald-800 dark:text-zinc-300 mb-4 shadow-sm"
        >
          <motion.div
            animate={
              isProcessing
                ? { scale: [1, 1.7, 1], opacity: [1, 0.5, 1] }
                : hasQueried
                ? { opacity: [0.7, 1, 0.7] }
                : { opacity: [0.4, 0.9, 0.4] }
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              isProcessing
                ? 'bg-blue-500'
                : hasQueried
                ? 'bg-emerald-500'
                : 'bg-emerald-400 dark:bg-zinc-600'
            }`}
          />
          <span>CLINICAL ARCHITECTURE // BALANCED THEORY & RUNTIME</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3 leading-tight"
        >
          Pipeline Orchestration Flow
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto"
        >
          Each node connects theoretical clinical safeguards with high-performance multi-agent routing. Watch inquiries travel seamlessly across stages.
        </motion.p>
      </header>

      {/* ── CURRENT INQUIRY CONTROLLER ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="w-full max-w-3xl mb-10 relative z-10"
      >
        <div
          className={`rounded-2xl border backdrop-blur-xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${
            hasQueried
              ? 'border-emerald-500/40 bg-white dark:bg-[#101713] dark:border-emerald-500/30 shadow-[0_4px_40px_rgba(16,185,129,0.15)]'
              : 'border-emerald-900/15 dark:border-emerald-950/80 bg-white/95 dark:bg-[#0c120f]'
          }`}
        >
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <motion.div
              animate={hasQueried ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-[#1a2820] border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-800 dark:text-emerald-400 shadow-sm"
            >
              <MessageSquare className="w-5 h-5" />
            </motion.div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 dark:text-emerald-400 uppercase tracking-wider font-bold">
                <span>Active Patient Query</span>
                <span>•</span>
                <span className="text-zinc-500 dark:text-zinc-400 normal-case font-normal">
                  {hasQueried
                    ? isProcessing
                      ? 'In transit through pipeline…'
                      : 'Audit completed'
                    : 'Awaiting patient prompt'}
                </span>
              </div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug line-clamp-2">
                {hasQueried
                  ? `"${lastQuery}"`
                  : 'Submit a clinical query in the Chatbot tab to watch the live routing graph execute.'}
              </p>
            </div>
          </div>

          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.03] active:scale-[0.97] flex-shrink-0 self-end sm:self-center"
            >
              <span>Open Chatbot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.section>

      {/* ── EXPANDED 6-STAGE BALANCED ARCHITECTURE ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        {/* NODE 1: Ingestion & Input Sanitization */}
        <StageCard
          step={1}
          title="Query Ingestion & Sanitization"
          theoryDesc="Receives patient inquiries via encrypted protocol. Validates character bounds and scrubs private identifiable signatures."
          techDesc="POST /api/v1/query • Ingestion latency < 2ms • Pydantic schema validation"
          status={s1}
          accentColor="emerald"
          nodeAnimationType="wave"
          badge={
            hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Ingested
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Standby</span>
            )
          }
        >
          <div className="rounded-xl border border-emerald-900/10 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-[#0c120f] p-3 flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500 dark:text-zinc-400">Payload length:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {hasQueried ? `${lastQuery.length} characters` : '0 characters'}
            </span>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried}
          processing={isProcessing}
          label="Deterministic Classification"
          sublabel="Zero-shot taxonomy matcher"
          color="blue"
        />

        {/* NODE 2: Intent Classification & Semantic Routing */}
        <StageCard
          step={2}
          title="Intent Classification & Clinical Routing"
          theoryDesc="Classifies clinical presentation against the 12 medical taxonomies to select the domain specialist agent."
          techDesc="Zero-temperature JSON intent router • Exact domain extraction • 12-domain routing table"
          status={s2}
          accentColor="blue"
          nodeAnimationType="scan"
          badge={
            isProcessing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-bold flex items-center gap-1.5 animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" /> Classifying…
              </span>
            ) : hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Classified: {activeAgent.domain}
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Standby</span>
            )
          }
        >
          <div className="rounded-xl border border-blue-900/10 dark:border-blue-950/70 bg-blue-50/40 dark:bg-[#0c1622] p-4">
            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {queryWords.map((word: string, idx: number) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-xs font-mono bg-white dark:bg-[#16212e] border border-blue-300 dark:border-blue-500/30 text-blue-900 dark:text-blue-200"
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-blue-900/10 dark:border-white/10">
              <span className="text-zinc-500 dark:text-zinc-400">Assigned Domain:</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{activeAgent.name}</span>
            </div>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried}
          processing={isProcessing}
          label="Domain Registry Activation"
          sublabel="Scoped prompts & clinical boundaries"
          color="purple"
        />

        {/* NODE 3: Active Specialist Agent Dispatch */}
        <StageCard
          step={3}
          title="Clinical Specialist Activation"
          theoryDesc="Activates the registered specialist agent with domain-specific boundaries, contraindication alerts, and safety principles."
          techDesc="AgentRegistry.get(domain) • Dedicated system prompt • Tuned temperature parameter"
          status={s3}
          accentColor="purple"
          nodeAnimationType="tree"
          badge={
            hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-bold border border-purple-300 dark:border-purple-500/40">
                {activeAgent.name} Active
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">12 Agents Ready</span>
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-2">
            {TWELVE_MEDICAL_DOMAINS.map((agent) => {
              const Icon = DOMAIN_ICONS[agent.domain] || Stethoscope;
              const isSelected = hasQueried && agent.domain === activeDomain;
              return (
                <div
                  key={agent.id}
                  onClick={() => onSelectAgent && onSelectAgent(agent)}
                  className={`rounded-lg p-2.5 border transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50/80 dark:bg-[#20112d] dark:border-purple-400 shadow-sm ring-1 ring-purple-500/40'
                      : 'border-emerald-900/10 bg-white/70 hover:border-purple-500/30 hover:bg-purple-50/30 dark:border-emerald-950/80 dark:bg-[#0c120f] dark:hover:bg-[#121c17]'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white dark:bg-purple-400 dark:text-black'
                        : 'bg-purple-100/60 text-purple-800 dark:bg-[#231530] dark:text-purple-300'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      isSelected ? 'text-purple-900 dark:text-purple-200 font-bold' : 'text-zinc-800 dark:text-zinc-300'
                    }`}
                  >
                    {agent.name}
                  </span>
                </div>
              );
            })}
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried}
          processing={isProcessing}
          label="Formatting & Inference Engine"
          sublabel="Markdown table, bullet points & bold enforcement"
          color="cyan"
        />

        {/* NODE 4: Structured Reasoning & Output Formatting */}
        <StageCard
          step={4}
          title="Clinical Reasoning & Structured Synthesis"
          theoryDesc="Formulates evidence-based guidance. Automatically formats tables for schedules and bullet lists with bold warnings for symptoms."
          techDesc="Local Ollama qwen2.5:3b / External LLM API • Inline Markdown syntax directives"
          status={s5}
          accentColor="cyan"
          nodeAnimationType="mesh"
          badge={
            isProcessing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Synthesizing…
              </span>
            ) : hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Formatted Markdown
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Standby</span>
            )
          }
        >
          <div className="rounded-xl border border-cyan-900/10 dark:border-cyan-950/70 bg-cyan-50/40 dark:bg-[#0c1d22] p-4 text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>Rule Enforcement:</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-bold">Strict Non-Definitive</span>
            </div>
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
              <span>Layout Constraints:</span>
              <span className="text-cyan-700 dark:text-cyan-300 font-bold">Tables | Lists | Bolded Warnings</span>
            </div>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried}
          processing={isProcessing}
          label="Post-Generation Safety Gate"
          sublabel="Red-flag emergency check & disclaimer attachment"
          color={hasQueried && !isSafe ? 'rose' : 'emerald'}
        />

        {/* NODE 5: Safety Validator & Acuity Gate */}
        <StageCard
          step={5}
          title="Safety Gate & Emergency Red-Flag Scan"
          theoryDesc="Every drafted answer passes through a safety gate to catch critical acuity symptoms (chest pain, stroke, emergency vitals) before release."
          techDesc="ResponseValidator • Emergency kill-switch trigger • Non-definitive boundary audit"
          status={s6}
          accentColor={hasQueried && !isSafe ? 'rose' : 'emerald'}
          nodeAnimationType="shield"
          badge={
            hasQueried ? (
              isSafe ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Safe Clearance
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Emergency Intercept
                </span>
              )
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Guard Armed</span>
            )
          }
        >
          <div
            className={`rounded-xl border p-4 ${
              hasQueried && !isSafe
                ? 'border-rose-300 bg-rose-100/60 dark:border-rose-900/60 dark:bg-[#200f13] text-rose-900 dark:text-rose-200'
                : 'border-emerald-900/10 dark:border-emerald-950/70 bg-emerald-50/40 dark:bg-[#0c120f] text-zinc-800 dark:text-zinc-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  hasQueried && !isSafe ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black'
                }`}
              >
                {hasQueried && !isSafe ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </div>
              <div className="text-xs">
                <div className="font-mono font-bold">{isSafe ? 'SAFETY AUDIT: PASSED' : 'EMERGENCY INTERCEPT'}</div>
                <p className="mt-0.5 text-zinc-600 dark:text-zinc-400 font-sans">
                  {isSafe
                    ? 'No critical emergency signs detected. Standard clinical educational disclaimer applied.'
                    : 'Emergency warning sign identified. Fallback emergency dispatch instruction activated.'}
                </p>
              </div>
            </div>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried && !isProcessing}
          processing={isProcessing}
          label="Client Delivery"
          sublabel="Rendered Markdown & Audit Trace"
          color="emerald"
        />

        {/* NODE 6: Client Delivery & Observability Audit */}
        <StageCard
          step={6}
          title="Response Delivery & Observability Audit"
          theoryDesc="Delivers the clinical consultation with agent metadata, latency benchmarks, and verified safety status."
          techDesc="Execution trace logging • Client-side ReactMarkdown formatting • Telemetry recorded"
          status={s7}
          accentColor="emerald"
          nodeAnimationType="stream"
          badge={
            hasQueried && !isProcessing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Delivered
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Ready</span>
            )
          }
        >
          {hasQueried && lastResponse ? (
            <div className="rounded-xl border border-emerald-900/15 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-[#121c17] p-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
                <span className="font-bold text-emerald-800 dark:text-emerald-400">
                  Specialist Response: {activeAgent.name}
                </span>
                <span>Audit Verified ✓</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-3 leading-relaxed font-sans">
                {lastResponse}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-emerald-900/20 dark:border-emerald-950/80 p-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Ask any health question in the Chatbot tab to see the live output preview.
            </div>
          )}
        </StageCard>
      </motion.div>

      {/* ── TECHNICAL BENCHMARKS & TELEMETRY (COLLAPSIBLE) ── */}
      <section className="w-full max-w-3xl mt-10 relative z-10">
        <div className="rounded-2xl border border-emerald-900/10 dark:border-emerald-950/80 bg-white/70 dark:bg-[#0c120f] backdrop-blur-md p-5 shadow-sm">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold uppercase tracking-wider">Engineering Telemetry & Stage Metrics</span>
            </div>
            <div className="flex items-center gap-1 text-[11px]">
              <span>{showTechnicalDetails ? 'Hide' : 'Show'}</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          <AnimatePresence>
            {showTechnicalDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-emerald-900/10 dark:border-white/[0.08] space-y-3 text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Ingestion Protocol', value: 'FastAPI REST POST (JSON)' },
                    { label: 'Router Engine', value: 'Zero-shot Intent Classifier' },
                    { label: 'Active LLM Backend', value: 'Local Ollama // qwen2.5:3b' },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-3 rounded-lg bg-emerald-50/60 dark:bg-[#121c17] border border-emerald-900/10 dark:border-emerald-500/20"
                    >
                      <span className="text-[10px] text-zinc-400 block mb-0.5">{label}</span>
                      <strong className="text-zinc-900 dark:text-white font-bold">{value}</strong>
                    </div>
                  ))}
                </div>
                {executionTrace?.total_latency_ms && (
                  <div className="text-[11px] text-right text-emerald-700 dark:text-emerald-400 pt-1">
                    End-to-end execution latency: <strong>{executionTrace.total_latency_ms} ms</strong>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── STATUS BAR FOOTER ── */}
      <footer className="mt-12 relative z-10 flex flex-wrap items-center justify-center gap-4 bg-white/90 dark:bg-[#101713] border border-emerald-900/15 dark:border-emerald-500/30 px-6 py-3 rounded-full backdrop-blur-xl shadow-lg font-mono text-xs">
        <div className="flex items-center gap-2">
          <motion.div
            animate={
              isProcessing
                ? { scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }
                : hasQueried
                ? { opacity: [0.7, 1, 0.7] }
                : {}
            }
            transition={{ duration: 1.2, repeat: Infinity }}
            className={`w-2 h-2 rounded-full ${
              isProcessing
                ? 'bg-blue-500'
                : hasQueried
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : 'bg-emerald-400 dark:bg-zinc-600'
            }`}
          />
          <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
            {isProcessing ? 'PROCESSING INQUIRY' : hasQueried ? 'JOURNEY COMPLETE' : 'PIPELINE ACTIVE'}
          </span>
        </div>
        <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-600 dark:text-zinc-400 hidden sm:inline text-[11px]">
          ACTIVE AGENT: <strong className="text-zinc-900 dark:text-zinc-200">{activeAgent.name}</strong>
        </span>
        <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-600 dark:text-zinc-400 hidden sm:inline text-[11px]">
          SAFETY AUDIT:{' '}
          <strong className={isSafe ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
            {isSafe ? 'VERIFIED' : 'INTERCEPTED'}
          </strong>
        </span>
      </footer>
    </div>
  );
};
