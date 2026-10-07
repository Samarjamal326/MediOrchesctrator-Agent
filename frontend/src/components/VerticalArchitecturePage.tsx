import React, { useState, useMemo, useEffect } from 'react';
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
   ANIMATED CONNECTOR — the living wire between pipeline stages
   ===================================================================== */
type ConnectorColor = 'emerald' | 'blue' | 'rose' | 'cyan';

interface ConnectorProps {
  active?: boolean;
  processing?: boolean;
  label?: string;
  color?: ConnectorColor;
}

const COLOR_MAP: Record<ConnectorColor, {
  track: string; fill: string; glow: string; dot: string;
  labelCls: string; arrowColor: string;
}> = {
  emerald: {
    track: 'bg-emerald-500/20 dark:bg-emerald-400/15',
    fill: 'bg-emerald-500',
    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.8)]',
    dot: 'bg-emerald-500',
    labelCls: 'text-emerald-700 dark:text-emerald-400 border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/70',
    arrowColor: 'rgba(16,185,129,0.5)',
  },
  blue: {
    track: 'bg-blue-500/20 dark:bg-blue-400/15',
    fill: 'bg-blue-500',
    glow: 'shadow-[0_0_10px_rgba(59,130,246,0.8)]',
    dot: 'bg-blue-500',
    labelCls: 'text-blue-700 dark:text-blue-400 border-blue-500/30 bg-blue-50/90 dark:bg-blue-950/70',
    arrowColor: 'rgba(59,130,246,0.5)',
  },
  rose: {
    track: 'bg-rose-500/20 dark:bg-rose-400/15',
    fill: 'bg-rose-500',
    glow: 'shadow-[0_0_10px_rgba(244,63,94,0.8)]',
    dot: 'bg-rose-500',
    labelCls: 'text-rose-700 dark:text-rose-400 border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/70',
    arrowColor: 'rgba(244,63,94,0.5)',
  },
  cyan: {
    track: 'bg-cyan-500/20 dark:bg-cyan-400/15',
    fill: 'bg-cyan-500',
    glow: 'shadow-[0_0_10px_rgba(6,182,212,0.8)]',
    dot: 'bg-cyan-500',
    labelCls: 'text-cyan-700 dark:text-cyan-400 border-cyan-500/30 bg-cyan-50/90 dark:bg-cyan-950/70',
    arrowColor: 'rgba(6,182,212,0.5)',
  },
};

const StageConnector: React.FC<ConnectorProps> = ({
  active = false,
  processing = false,
  label,
  color = 'emerald',
}) => {
  const c = COLOR_MAP[color];
  return (
    <div className="w-full flex flex-col items-center py-1 relative z-10" style={{ gap: 0 }}>
      {/* Vertical track */}
      <div className={`relative w-0.5 h-12 ${c.track} rounded-full overflow-hidden`}>
        {(active || processing) && (
          <motion.div
            className={`absolute top-0 left-0 right-0 ${c.fill} rounded-full`}
            initial={{ height: '0%' }}
            animate={{ height: '100%' }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        )}
        {processing && (
          <motion.div
            className={`absolute w-2.5 h-2.5 rounded-full ${c.dot} ${c.glow}`}
            style={{ left: '50%', marginLeft: -5 }}
            animate={{ top: ['-10%', '110%'] }}
            transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
        {active && !processing && (
          <motion.div
            className={`absolute w-2 h-2 rounded-full ${c.dot} ${c.glow}`}
            style={{ left: '50%', marginLeft: -4 }}
            animate={{ top: ['0%', '80%', '0%'] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Label pill */}
      {label && (
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border backdrop-blur-sm shadow-sm my-1 ${c.labelCls}`}
        >
          {label}
        </span>
      )}

      {/* Down-pointing arrow */}
      <div
        style={{
          width: 0, height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `7px solid ${c.arrowColor}`,
        }}
      />
    </div>
  );
};

/* =====================================================================
   STAGE CARD
   ===================================================================== */
type StageStatus = 'idle' | 'active' | 'done' | 'error';
type AccentColor = 'emerald' | 'blue' | 'rose' | 'cyan';

interface StageCardProps {
  step: number;
  title: string;
  desc: string;
  status?: StageStatus;
  accentColor?: AccentColor;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}

const ACCENT: Record<AccentColor, { step: string; done: string; active: string; idle: string; glow: string }> = {
  emerald: {
    step: 'bg-emerald-100 dark:bg-[#1a2820] border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300',
    done: 'border-emerald-500/40 bg-white dark:bg-[#101713] dark:border-emerald-500/30',
    active: 'border-emerald-600/50 bg-white dark:bg-[#121c17] dark:border-emerald-400 ring-1 ring-emerald-500/40',
    idle: 'border-emerald-900/10 bg-white/90 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_4px_30px_rgba(16,185,129,0.14)] dark:shadow-[0_4px_30px_rgba(16,185,129,0.12)]',
  },
  blue: {
    step: 'bg-blue-100 dark:bg-[#13222e] border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-300',
    done: 'border-emerald-500/40 bg-white dark:bg-[#101713] dark:border-emerald-500/30',
    active: 'border-blue-500/50 bg-blue-50/70 dark:bg-[#101c24] dark:border-blue-400/50 ring-1 ring-blue-500/40',
    idle: 'border-emerald-900/10 bg-white/90 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_4px_30px_rgba(59,130,246,0.14)] dark:shadow-[0_4px_30px_rgba(59,130,246,0.12)]',
  },
  rose: {
    step: 'bg-rose-100 dark:bg-[#2e1418] border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300',
    done: 'border-emerald-500/40 bg-white dark:bg-[#101713] dark:border-emerald-500/30',
    active: 'border-rose-500/60 bg-rose-50/80 dark:bg-[#200f13] dark:border-rose-500/50 ring-2 ring-rose-500/40',
    idle: 'border-emerald-900/10 bg-white/90 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_4px_30px_rgba(244,63,94,0.16)] dark:shadow-[0_4px_30px_rgba(244,63,94,0.14)]',
  },
  cyan: {
    step: 'bg-cyan-100 dark:bg-[#10252b] border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300',
    done: 'border-emerald-500/40 bg-white dark:bg-[#101713] dark:border-emerald-500/30',
    active: 'border-cyan-500/50 bg-cyan-50/70 dark:bg-[#0e2126] dark:border-cyan-400/50 ring-1 ring-cyan-500/40',
    idle: 'border-emerald-900/10 bg-white/90 dark:border-emerald-950/80 dark:bg-[#0c120f]',
    glow: 'shadow-[0_4px_30px_rgba(6,182,212,0.14)] dark:shadow-[0_4px_30px_rgba(6,182,212,0.12)]',
  },
};

const StageCard: React.FC<StageCardProps> = ({
  step, title, desc, status = 'idle', accentColor = 'emerald', badge, children,
}) => {
  const ac = ACCENT[accentColor];
  const errorAc = ACCENT.rose;
  const borderCls =
    status === 'active' ? ac.active :
    status === 'done' ? ac.done :
    status === 'error' ? errorAc.active :
    ac.idle;
  const glowCls = (status === 'done' || status === 'active') ? ac.glow : '';
  const stepCls = status === 'error' ? ACCENT.rose.step : ac.step;

  return (
    <div className={`w-full rounded-2xl border transition-all duration-300 backdrop-blur-xl p-6 sm:p-7 shadow-lg ${borderCls} ${glowCls}`}>
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
        </div>
        {badge && <div className="flex items-center gap-1.5 text-xs font-mono">{badge}</div>}
      </div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{desc}</p>
      {children}
    </div>
  );
};

/* =====================================================================
   DATA PACKET — animated icon box
   ===================================================================== */
interface DataPacketProps {
  active?: boolean;
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const DataPacket: React.FC<DataPacketProps> = ({ active, icon, label, value }) => (
  <div
    className={`rounded-xl border p-4 flex items-center gap-3.5 transition-all duration-300 ${
      active
        ? 'border-emerald-500/40 bg-emerald-50/50 dark:bg-[#121c17] dark:border-emerald-500/40 shadow-sm'
        : 'border-emerald-900/10 dark:border-emerald-950/60 bg-emerald-50/30 dark:bg-[#0c120f]'
    }`}
  >
    {icon && (
      <motion.div
        animate={active ? { x: [0, 4, 0] } : {}}
        transition={{ duration: 1.6, repeat: Infinity }}
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
          active
            ? 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black'
            : 'bg-emerald-100/70 dark:bg-[#1a2820] text-emerald-800 dark:text-emerald-400'
        }`}
      >
        {icon}
      </motion.div>
    )}
    <div className="min-w-0 flex-1">
      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
        {label}
      </span>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate mt-0.5">{value}</p>
    </div>
  </div>
);

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
    if (!lastQuery) return ['Health', 'inquiry', 'symptoms', 'wellness'];
    return lastQuery.split(/\s+/).slice(0, 12);
  }, [lastQuery]);

  // Derive stage statuses
  const s1: StageStatus = hasQueried ? 'done' : 'idle';
  const s2: StageStatus = isProcessing ? 'active' : hasQueried ? 'done' : 'idle';
  const s3: StageStatus = hasQueried ? 'done' : 'idle';
  const s4: StageStatus = isProcessing ? 'active' : hasQueried ? 'done' : 'idle';
  const s5: StageStatus = hasQueried && !isSafe ? 'error' : hasQueried ? 'done' : 'idle';
  const s6: StageStatus = hasQueried && !isProcessing ? 'done' : 'idle';

  return (
    <div className="w-full min-h-screen pt-28 pb-24 px-4 sm:px-6 flex flex-col items-center relative bg-[#f3f7f4] dark:bg-[#000000] text-zinc-900 dark:text-white transition-colors duration-200">
      {/* Backgrounds */}
      <div className="absolute inset-0 canvas-dot-grid pointer-events-none opacity-40 dark:opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[85%] h-[600px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(16,185,129,0.09),transparent_75%)] pointer-events-none" />

      {/* ── HERO HEADER ── */}
      <header className="text-center max-w-3xl mb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/5 dark:bg-white/[0.04] border border-emerald-900/15 dark:border-white/10 text-xs font-mono text-emerald-800 dark:text-zinc-400 mb-4 shadow-sm"
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
          <span>LIVE CLINICAL PIPELINE // MULTI-AGENT JOURNEY</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-3 leading-tight"
        >
          How Your Question Travels
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto"
        >
          Watch how MediOrchestrator receives your question, understands your symptoms, pairs you with a
          specialized doctor agent, and checks every word for safety.
        </motion.p>
      </header>

      {/* ── LIVE QUESTION CARD ── */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="w-full max-w-3xl mb-10 relative z-10"
        aria-label="Current question"
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
                <span>Active Patient Inquiry</span>
                <span>•</span>
                <span className="text-zinc-500 dark:text-zinc-400 normal-case font-normal">
                  {hasQueried
                    ? isProcessing
                      ? 'Traveling through pipeline…'
                      : 'Journey complete'
                    : 'Awaiting question'}
                </span>
              </div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug line-clamp-2">
                {hasQueried
                  ? `"${lastQuery}"`
                  : 'Submit a health question in the Chatbot tab, or click a specialist below to see the pipeline light up.'}
              </p>
            </div>
          </div>

          {onNavigateToChat && (
            <button
              onClick={onNavigateToChat}
              className="px-4 py-2 rounded-xl text-xs font-mono font-bold bg-emerald-700 hover:bg-emerald-800 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-md hover:scale-[1.03] active:scale-[0.97] flex-shrink-0 self-end sm:self-center"
            >
              <span>Ask in Chatbot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.section>

      {/* ── 6-STEP JOURNEY ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="w-full max-w-3xl flex flex-col items-center relative z-10"
      >
        {/* STAGE 1 */}
        <StageCard
          step={1}
          title="Your Question Arrives"
          desc="Your inquiry enters MediOrchestrator through a secure channel. The system captures your words and prepares them for clinical understanding."
          status={s1}
          accentColor="emerald"
          badge={
            hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Received
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Waiting for input</span>
            )
          }
        >
          <DataPacket
            active={hasQueried}
            icon={<MessageSquare className="w-4 h-4" />}
            label="Received content"
            value={hasQueried ? `"${lastQuery}"` : "e.g., 'What are good dietary sources of iron?'"}
          />
        </StageCard>

        <StageConnector active={hasQueried} processing={isProcessing} label="Reading intent" color="emerald" />

        {/* STAGE 2 */}
        <StageCard
          step={2}
          title="Understanding Your Question"
          desc="Instead of giving a generic response, the system carefully reads your words to identify the medical topic and which part of the body it involves."
          status={s2}
          accentColor="blue"
          badge={
            isProcessing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-bold flex items-center gap-1.5 animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" /> Analyzing…
              </span>
            ) : hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Intent Understood
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Standby</span>
            )
          }
        >
          <div className="rounded-xl border border-emerald-900/10 dark:border-emerald-950/70 bg-emerald-50/40 dark:bg-[#0c120f] p-4">
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Keywords detected:
            </span>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {queryWords.map((word: string, idx: number) => (
                <motion.span
                  key={idx}
                  animate={
                    isProcessing
                      ? { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
                      : hasQueried
                      ? { opacity: 1 }
                      : { opacity: 0.45 }
                  }
                  transition={{ duration: 1.3, delay: idx * 0.08, repeat: isProcessing ? Infinity : 0 }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                    hasQueried
                      ? 'bg-white dark:bg-[#16211b] border-emerald-300 dark:border-emerald-500/30 text-zinc-900 dark:text-zinc-100 font-medium shadow-sm'
                      : 'bg-white/40 dark:bg-[#101713] border-transparent text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {word}
                </motion.span>
              ))}
            </div>
            <div className="pt-2 border-t border-emerald-900/10 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                Identified specialist:
              </span>
              <span className="font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                {hasQueried ? activeAgent.name : 'Awaiting question'}
              </span>
            </div>
          </div>
        </StageCard>

        <StageConnector active={hasQueried} processing={isProcessing} label="Routing decision" color="emerald" />

        {/* STAGE 3 */}
        <StageCard
          step={3}
          title="Choosing the Right Specialist"
          desc="MediOrchestrator houses 12 dedicated clinical AI specialists. Your inquiry is routed specifically to the one with exactly the right knowledge and boundaries."
          status={s3}
          accentColor="emerald"
          badge={
            hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-500/40">
                {activeAgent.name} Selected
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">12 Specialists Available</span>
            )
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {TWELVE_MEDICAL_DOMAINS.map((agent) => {
              const Icon = DOMAIN_ICONS[agent.domain] || Stethoscope;
              const isSelected = hasQueried && agent.domain === activeDomain;
              const domainDesc = DOMAIN_FRIENDLY_DESC[agent.domain] || agent.specialization;
              return (
                <motion.div
                  key={agent.id}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  animate={isSelected ? { scale: [1, 1.03, 1] } : {}}
                  transition={isSelected ? { duration: 2, repeat: Infinity } : { duration: 0.15 }}
                  onClick={() => onSelectAgent && onSelectAgent(agent)}
                  className={`rounded-xl p-3 border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 dark:bg-[#16291e] dark:border-emerald-400 shadow-md ring-1 ring-emerald-500/50'
                      : 'border-emerald-900/10 bg-white/70 hover:border-emerald-500/30 hover:bg-emerald-50/30 dark:border-emerald-950/80 dark:bg-[#0c120f] dark:hover:bg-[#121c17] dark:hover:border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white dark:bg-emerald-400 dark:text-black shadow-sm'
                          : 'bg-emerald-100/60 text-emerald-800 dark:bg-[#1a2820] dark:text-emerald-300'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                    </div>
                    <span
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-zinc-900 dark:text-zinc-200'
                      }`}
                    >
                      {agent.name}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                      ● Selected
                    </span>
                  )}
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed hidden sm:block">
                    {domainDesc}
                  </p>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Click any specialist above to read their scope &amp; responsibilities ↗
            </span>
          </div>
        </StageCard>

        <StageConnector active={hasQueried} processing={isProcessing} label="Specialist activated" color="cyan" />

        {/* STAGE 4 */}
        <StageCard
          step={4}
          title="Specialist Working"
          desc={`The ${activeAgent.name} Agent carefully crafts your answer using evidence-based clinical knowledge—respecting defined medical boundaries and safety principles.`}
          status={s4}
          accentColor="cyan"
          badge={
            isProcessing ? (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-bold flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" /> Composing guidance…
              </span>
            ) : hasQueried ? (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3 stroke-[3]" /> Guidance Ready
              </span>
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Standby</span>
            )
          }
        >
          <div className="rounded-xl border border-emerald-900/10 dark:border-emerald-950/70 bg-emerald-50/40 dark:bg-[#0c120f] p-4">
            <div className="flex items-center gap-2 mb-2.5 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>How this specialist always behaves:</span>
            </div>
            <ul className="text-xs text-zinc-700 dark:text-zinc-300 space-y-2 font-sans">
              {[
                'Provides evidence-based considerations grounded in established clinical science',
                'Never issues definitive diagnoses or makes prescription claims',
                'Flags urgent or life-threatening symptoms before anything else',
              ].map((rule, i) => (
                <motion.li
                  key={i}
                  animate={isProcessing ? { opacity: [0.6, 1, 0.6] } : {}}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: isProcessing ? Infinity : 0 }}
                  className="flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{rule}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried}
          processing={isProcessing}
          label="Safety audit"
          color={hasQueried && !isSafe ? 'rose' : 'emerald'}
        />

        {/* STAGE 5 */}
        <StageCard
          step={5}
          title="Safety Check & Emergency Scan"
          desc="Before your answer reaches you, an automated safety layer scans for life-threatening red flags and makes sure no harmful advice was generated."
          status={s5}
          accentColor={hasQueried && !isSafe ? 'rose' : 'emerald'}
          badge={
            hasQueried ? (
              isSafe ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Passed
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Emergency Intercept
                </span>
              )
            ) : (
              <span className="text-zinc-400 dark:text-zinc-500">Guarding</span>
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
              <motion.div
                animate={
                  hasQueried
                    ? isSafe
                      ? { scale: [1, 1.12, 1] }
                      : { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }
                    : { opacity: [0.4, 0.7, 0.4] }
                }
                transition={{ duration: 1.8, repeat: Infinity }}
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  hasQueried && !isSafe ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white dark:bg-emerald-500 dark:text-black'
                }`}
              >
                {hasQueried && !isSafe ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </motion.div>
              <div>
                <div className="text-xs font-mono font-bold mb-0.5">
                  {isSafe ? 'VERIFIED SAFE' : 'ACUITY INTERCEPT'}
                </div>
                <p className="text-xs leading-relaxed font-sans">
                  {isSafe
                    ? 'No critical red-flags detected. Clinical disclaimer automatically attached.'
                    : 'Emergency red-flag detected. Immediate emergency guidance provided.'}
                </p>
              </div>
            </div>
          </div>
        </StageCard>

        <StageConnector
          active={hasQueried && !isProcessing}
          processing={isProcessing}
          label="Answer delivered"
          color="emerald"
        />

        {/* STAGE 6 */}
        <StageCard
          step={6}
          title="Your Answer Is Delivered"
          desc="The verified response arrives in your consultation window, complete with the specialist's badge and a transparent clinical note."
          status={s6}
          accentColor="emerald"
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
                  Response from {activeAgent.name}:
                </span>
                <span>Delivered ✓</span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 line-clamp-4 leading-relaxed font-sans">
                {lastResponse}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-emerald-900/20 dark:border-emerald-950/80 p-4 text-center text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              Submit your question in the Chatbot tab to see your answer preview here.
            </div>
          )}
        </StageCard>
      </motion.div>

      {/* ── TECHNICAL DETAILS (collapsible) ── */}
      <section className="w-full max-w-3xl mt-10 relative z-10" aria-label="Technical details">
        <div className="rounded-2xl border border-emerald-900/10 dark:border-emerald-950/80 bg-white/70 dark:bg-[#0c120f] backdrop-blur-md p-5 shadow-sm">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold uppercase tracking-wider">Engineering Details (For Developers)</span>
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
                    { label: 'API Protocol', value: 'FastAPI REST POST' },
                    { label: 'Classification', value: 'JSON Intent Classifier' },
                    { label: 'Model Inference', value: 'Local Ollama // qwen2.5:3b' },
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
                    Total roundtrip latency:{' '}
                    <strong>{executionTrace.total_latency_ms} ms</strong>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── FOOTER STATUS BAR ── */}
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
            {isProcessing ? 'PROCESSING QUESTION' : hasQueried ? 'JOURNEY COMPLETED' : 'PIPELINE READY'}
          </span>
        </div>
        <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-600 dark:text-zinc-400 hidden sm:inline text-[11px]">
          SPECIALIST:{' '}
          <strong className="text-zinc-900 dark:text-zinc-200">{activeAgent.name}</strong>
        </span>
        <span className="text-zinc-300 dark:text-zinc-600 hidden sm:inline">|</span>
        <span className="text-zinc-600 dark:text-zinc-400 hidden sm:inline text-[11px]">
          SAFETY:{' '}
          <strong className={isSafe ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}>
            {isSafe ? 'VERIFIED' : 'INTERCEPTED'}
          </strong>
        </span>
      </footer>
    </div>
  );
};
