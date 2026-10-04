import React from 'react';
import {
  Stethoscope,
  Salad,
  Sparkle,
  Smile,
  HeartPulse,
  Bone,
  Brain,
  Flame,
  Pill,
  AlertOctagon,
  Users,
  TestTube,
  Activity,
  Layers,
  ArrowRight,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Database
} from 'lucide-react';
import { MedicalDomainAgent } from '../data/medicalDomains';

interface AgentDetailModalProps {
  agent: MedicalDomainAgent | null;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
  isCurrentlyRouted?: boolean;
}

export const getDomainIcon = (iconName: string, className: string = "w-5 h-5") => {
  switch (iconName) {
    case 'Stethoscope': return <Stethoscope className={className} />;
    case 'Salad': return <Salad className={className} />;
    case 'Sparkle': return <Sparkle className={className} />;
    case 'Smile': return <Smile className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Bone': return <Bone className={className} />;
    case 'Brain': return <Brain className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Pill': return <Pill className={className} />;
    case 'AlertOctagon': return <AlertOctagon className={className} />;
    case 'Users': return <Users className={className} />;
    case 'TestTube': return <TestTube className={className} />;
    default: return <Activity className={className} />;
  }
};

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({
  agent,
  onClose,
  onSelectPrompt,
  isCurrentlyRouted = false,
}) => {
  if (!agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-msg">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#111720] border border-slate-200 dark:border-[#223042] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar styled like an engineering inspector window */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[#1d2737] flex items-center justify-between bg-slate-50/70 dark:bg-[#141b25]">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-sm ${
              agent.status === 'operational'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                : agent.status === 'in_development'
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25'
                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
            }`}>
              {getDomainIcon(agent.iconName, "w-5 h-5")}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">{agent.name}</h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  [{agent.domain}]
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">{agent.specialization}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 font-sans">
          
          {/* Status & Execution Path Pill */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              agent.status === 'operational'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : agent.status === 'in_development'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                agent.status === 'operational' ? 'bg-emerald-500' : agent.status === 'in_development' ? 'bg-amber-500' : 'bg-slate-400'
              }`} />
              {agent.status === 'operational' ? 'Operational in Local Pipeline' : agent.status === 'in_development' ? 'Under Scaffold Development' : 'Architectural Specification (Planned)'}
            </span>

            {isCurrentlyRouted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sage-100 text-sage-800 dark:bg-sage-950 dark:text-sage-300 border border-sage-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-sage-600" />
                Active in Current Query Session
              </span>
            )}
          </div>

          {/* Architecture Position & Module Details */}
          <div className="bg-[#f7f5f0] dark:bg-[#151c27] p-4 rounded-xl border border-[#e8e4dc] dark:border-[#222f3f] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-sage-600" />
              Runtime Architecture & Codebase Target
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <span className="text-slate-400 block mb-0.5">Model Engine:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{agent.primaryModel}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Source Module:</span>
                <span className="text-slate-800 dark:text-slate-200 bg-white/70 dark:bg-black/30 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {agent.modulePath}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Knowledge Base:</span>
                <span className="text-slate-800 dark:text-slate-200">{agent.kbSize} KB Index • {agent.updateFrequency} refresh</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Safety Boundary:</span>
                <span className="text-slate-800 dark:text-slate-200">ResponseValidator + Fallback Gate</span>
              </div>
            </div>
          </div>

          {/* Clinical Responsibilities */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
              Domain Responsibilities & Scope
            </h4>
            <ul className="space-y-1.5">
              {agent.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <span className="text-sage-500 dark:text-sage-400 mt-1">▸</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Knowledge Base Sources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-sage-600" />
              Clinical Grounding Authorities
            </h4>
            <div className="flex flex-wrap gap-2">
              {agent.kbSources.map((kb, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-[#1a2331] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans shadow-subtle">
                  {kb}
                </span>
              ))}
            </div>
          </div>

          {/* Test Prompts */}
          {agent.samplePrompts.length > 0 && onSelectPrompt && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Sample Clinical Inquiries (Click to Load)
              </h4>
              <div className="space-y-2">
                {agent.samplePrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onSelectPrompt(p);
                      onClose();
                    }}
                    className="w-full text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-sage-500 dark:hover:border-sage-500 bg-white/50 dark:bg-black/20 hover:bg-slate-50 dark:hover:bg-[#192230] transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between group"
                  >
                    <span>"{p}"</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sage-600 flex-shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-[#1d2737] bg-slate-50/50 dark:bg-[#141b25] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
