import React, { useRef, useEffect } from 'react';
import {
  Search,
  BrainCircuit,
  Stethoscope,
  ShieldAlert,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Zap,
  Activity,
  ChevronRight,
  ShieldCheck,
  HeartPulse,
  Syringe,
  Baby,
  Smile,
  Eye,
  Bone,
  Pill,
  Microscope,
  Stethoscope as StethIcon
} from 'lucide-react';
import { NodeCard, NodeCardProps } from './NodeCard';
import { ConnectionCables, Connection } from './ConnectionCables';
import { TWELVE_MEDICAL_DOMAINS, MedicalDomainAgent } from '../data/medicalDomains';

interface ArchitectureVisualizerProps {
  currentRoutedDomain?: string | null;
  lastQuery?: string;
  isSafe?: boolean;
  isProcessing?: boolean;
  onSelectAgent?: (agent: MedicalDomainAgent) => void;
  onStartInquiry?: () => void;
}

export const ArchitectureVisualizer: React.FC<ArchitectureVisualizerProps> = ({
  currentRoutedDomain = 'general_medicine',
  lastQuery,
  isSafe = true,
  isProcessing = false,
  onSelectAgent,
  onStartInquiry
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeDomain = currentRoutedDomain || 'general_medicine';
  const hasQueried = Boolean(lastQuery && lastQuery.trim().length > 0);

  // Map 12 domain agents into compact specialist cards in column 3
  const DOMAIN_ICONS: Record<string, any> = {
    general_medicine: Stethoscope,
    dermatology: Microscope,
    nutrition: Pill,
    cardiology: HeartPulse,
    pediatrics: Baby,
    endocrinology: Syringe,
    neurology: BrainCircuit,
    psychiatry: Smile,
    ophthalmology: Eye,
    orthopedics: Bone,
    gastroenterology: Activity,
    pulmonology: ShieldCheck
  };

  const getStatus = (stepStage: number, isBranchSafety = false): NodeCardProps['status'] => {
    if (!hasQueried) return 'PENDING';
    if (isProcessing) {
      if (stepStage === 1 || stepStage === 2) return 'EVALUATING';
      return 'PENDING';
    }
    if (!isSafe && (isBranchSafety || stepStage === 4)) return 'SAFETY_HALT';
    return 'VERIFIED';
  };

  const isStageActive = (stepStage: number) => {
    if (!hasQueried) return false;
    return true;
  };

  // Node geometry definitions:
  // Column 1 (x: 0): Query Ingestion
  // Column 2 (x: 270): Intent Classifier
  // Column 3 (x: 540): 12 Medical Specialists (Compact grid column, highlighting routed specialist)
  // Column 4 (x: 820): Red-Flag Triage & Safety Gate
  // Column 5 (x: 1090): Response Grounding & Audit
  // Column 6 (x: 1360): Terminal Synthesis Delivery

  const activeDomainDef = TWELVE_MEDICAL_DOMAINS.find(d => d.domain === activeDomain);

  // Core Pipeline Nodes
  const coreNodes: NodeCardProps[] = [
    {
      id: 'INGEST',
      index: 1,
      title: 'QUERY INGESTION',
      status: getStatus(0),
      icon: Search,
      x: 0,
      y: 190,
      hasInput: false,
      isActive: hasQueried,
      width: 220,
      metrics: [
        { label: 'Payload', value: hasQueried ? `${lastQuery?.length || 0} chars` : 'Awaiting' },
        { label: 'Ingress Method', value: 'REST /api/v1/query' }
      ]
    },
    {
      id: 'ROUTER',
      index: 2,
      title: 'INTENT CLASSIFIER',
      status: getStatus(1),
      icon: BrainCircuit,
      x: 260,
      y: 190,
      isActive: hasQueried,
      width: 220,
      metrics: [
        { label: 'Target Route', value: activeDomainDef?.name || 'General Medicine' },
        { label: 'Confidence', value: hasQueried ? '99.4%' : '--' }
      ]
    },
    {
      id: 'SAFETY_GATE',
      index: 4,
      title: 'TRIAGE & SAFETY GATE',
      status: getStatus(3, true),
      icon: ShieldAlert,
      x: 840,
      y: 190,
      isActive: hasQueried,
      width: 220,
      metrics: [
        { label: 'Acuity Level', value: isSafe ? 'Non-Urgent' : 'HIGH ACUITY RED-FLAG' },
        { label: 'Kill-Switch', value: isSafe ? 'DISENGAGED' : 'ENGAGED' }
      ]
    },
    {
      id: 'VALIDATOR',
      index: 5,
      title: 'RESPONSE GROUNDING',
      status: getStatus(4),
      icon: FileCheck2,
      x: 1100,
      y: 190,
      isActive: hasQueried,
      width: 220,
      metrics: [
        { label: 'Disclaimer', value: 'AFFIXED' },
        { label: 'Audit Proof', value: hasQueried ? '0x8f7a...3c' : '--' }
      ]
    },
    {
      id: 'TERMINAL',
      index: 6,
      title: 'TERMINAL SYNTHESIS',
      status: getStatus(5),
      icon: isSafe ? CheckCircle2 : AlertTriangle,
      x: 1360,
      y: 190,
      hasOutput: false,
      isActive: hasQueried,
      width: 220,
      metrics: [
        { label: 'Outcome', value: !hasQueried ? 'PENDING' : isSafe ? 'VERIFIED' : 'EMERGENCY_HALT' },
        { label: 'Dispatch', value: isSafe ? 'PATIENT_STREAM' : '911_TRIAGE' }
      ]
    }
  ];

  // 12 Medical Specialist Nodes in Column 3 (arranged vertically or stacked)
  // To keep canvas clean, we show the 12 domain agents in Column 3
  const specialistNodes: NodeCardProps[] = TWELVE_MEDICAL_DOMAINS.map((domain, i) => {
    const isRouted = domain.domain === activeDomain;
    const Icon = DOMAIN_ICONS[domain.domain] || Stethoscope;
    
    // Position stacked evenly in column 3
    const spacing = 38;
    const yPos = 10 + (i * spacing);

    return {
      id: `AGENT_${domain.domain}`,
      index: i + 1,
      title: domain.name.toUpperCase(),
      status: isRouted && hasQueried ? (isSafe ? 'VERIFIED' : 'SAFETY_HALT') : 'PENDING',
      icon: Icon,
      x: 520,
      y: yPos,
      width: 280,
      isActive: isRouted && hasQueried,
      onClick: () => onSelectAgent && onSelectAgent(domain),
      metrics: [
        { label: 'Domain', value: domain.domain },
        { label: 'Status', value: isRouted ? 'ACTIVE_ROUTED' : domain.status }
      ]
    };
  });

  const allNodes = [...coreNodes, ...specialistNodes];

  // Dynamic Connection Cables
  const connections: Connection[] = [
    // Ingest -> Router
    {
      sourceId: 'INGEST',
      targetId: 'ROUTER',
      isActive: hasQueried
    },
    // Router -> Active Specialist Agent
    {
      sourceId: 'ROUTER',
      targetId: `AGENT_${activeDomain}`,
      isActive: hasQueried
    },
    // Active Specialist Agent -> Safety Gate
    {
      sourceId: `AGENT_${activeDomain}`,
      targetId: 'SAFETY_GATE',
      isActive: hasQueried,
      isError: !isSafe
    },
    // Safety Gate -> Validator
    {
      sourceId: 'SAFETY_GATE',
      targetId: 'VALIDATOR',
      isActive: hasQueried,
      isError: !isSafe
    },
    // Validator -> Terminal
    {
      sourceId: 'VALIDATOR',
      targetId: 'TERMINAL',
      isActive: hasQueried,
      isError: !isSafe
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Canvas Frame Container (Faithful to Invariant's backdrop & milled borders) */}
      <div className="relative w-full max-w-[1240px] h-[580px] rounded-2xl border border-white/10 bg-[#050505] overflow-hidden shadow-2xl">
        
        {/* Subtle Canvas Dot Matrix Grid with radial vignette mask */}
        <div className="absolute inset-0 canvas-dot-grid pointer-events-none" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(59,130,246,0.12),transparent_70%)] pointer-events-none" />

        {/* Main Canvas Scroll Area */}
        <div
          ref={containerRef}
          className="w-full h-full overflow-x-auto overflow-y-auto custom-scrollbar relative p-6"
        >
          {/* Inner Canvas Geometry */}
          <div className="relative min-w-[1640px] min-h-[500px]">
            <ConnectionCables nodes={allNodes} connections={connections} />

            {allNodes.map((node) => (
              <NodeCard key={node.id} {...node} />
            ))}
          </div>
        </div>

        {/* Floating Telemetry Dock HUD (Sticky at bottom inside the canvas) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 bg-zinc-950/90 border border-white/10 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-2xl font-mono text-xs">
          
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
              ENGINE ONLINE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-zinc-400 text-[11px]">
            <span>ROUTED: <strong className="text-zinc-200">{activeDomainDef?.name || activeDomain}</strong></span>
            <span>SAFETY: <strong className={isSafe ? "text-emerald-400" : "text-rose-400"}>{isSafe ? "CLEAR" : "INTERCEPTED"}</strong></span>
            <span>AUDIT: <strong className="text-zinc-200">SHA-256</strong></span>
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">
              {hasQueried ? "LIVE SESSION CONNECTED" : "AWAITING USER INPUT"}
            </span>
          </div>

        </div>

      </div>

      {/* Current Active Query Trace Summary */}
      {hasQueried && (
        <div className="w-full max-w-[1240px] mt-4 px-4 py-2.5 rounded-xl bg-zinc-950/70 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 truncate text-zinc-400">
            <span className="text-blue-400 font-bold">Query:</span>
            <span className="text-zinc-200 truncate">"{lastQuery}"</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 text-[11px]">
            <span className="text-zinc-500">Triage:</span>
            <span className={`font-semibold ${isSafe ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isSafe ? 'Tier 1 Non-Urgent' : 'Emergency Red-Flag Intercept'}
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
