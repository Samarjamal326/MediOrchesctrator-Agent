import React from 'react';
import {
  ShieldCheck,
  Compass,
  Cpu,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Loader2,
  Lock
} from 'lucide-react';

export interface ExecutionStage {
  id: string;
  name: string;
  label: string;
  status: 'pending' | 'processing' | 'complete' | 'flagged';
  latencyMs?: number;
  detail?: string;
}

interface ExecutionGraphProps {
  stages: ExecutionStage[];
  activeDomain?: string | null;
  layout?: 'horizontal' | 'vertical';
}

export const ExecutionGraph: React.FC<ExecutionGraphProps> = ({
  stages,
  activeDomain,
  layout = 'horizontal'
}) => {
  const isVertical = layout === 'vertical';

  const getStageIcon = (stageId: string, status: ExecutionStage['status']) => {
    if (status === 'processing') {
      return <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />;
    }
    if (status === 'flagged') {
      return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    }
    if (status === 'complete') {
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    }

    switch (stageId) {
      case '00_INPUT_SAFETY':
        return <Lock className="w-3.5 h-3.5 text-zinc-500" />;
      case '01_QUERY_INGESTION':
        return <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />;
      case '02_INTENT_ROUTER':
        return <Compass className="w-3.5 h-3.5 text-zinc-500" />;
      case '03_CLINICAL_SPECIALIST':
        return <Cpu className="w-3.5 h-3.5 text-zinc-500" />;
      case '04_SAFETY_GATE':
      case '05_OUTPUT_SAFETY_GUARDRAILS':
        return <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />;
      case '06_VALIDATOR_AUDIT':
        return <FileCheck2 className="w-3.5 h-3.5 text-zinc-500" />;
      default:
        return <Cpu className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  return (
    <div className={`w-full ${isVertical ? 'h-full flex flex-col p-3 bg-zinc-900/40' : 'bg-zinc-900/90 border border-emerald-500/20 rounded-2xl p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300'}`}>
      <div className="flex items-center justify-between pb-2.5 border-b border-emerald-900/10 dark:border-white/[0.08] mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
            {isVertical ? 'Pipeline' : 'Live Clinical Pipeline'}
          </span>
          {activeDomain && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 uppercase truncate max-w-[110px]">
              {activeDomain}
            </span>
          )}
        </div>
        <span className="text-[9px] font-mono text-zinc-400">
          SSE Stream
        </span>
      </div>

      <div className={isVertical ? 'flex flex-col gap-2.5 overflow-y-auto custom-scrollbar flex-1 pr-0.5' : 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2'}>
        {stages.map((st) => {
          const isComplete = st.status === 'complete';
          const isProcessing = st.status === 'processing';
          const isFlagged = st.status === 'flagged';

          return (
            <div
              key={st.id}
              className={`flex ${isVertical ? 'flex-col p-2.5' : 'flex-col p-2.5'} rounded-xl border transition-all text-left ${
                isProcessing
                  ? 'bg-emerald-500/10 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                  : isComplete
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : isFlagged
                  ? 'bg-amber-950/30 border-amber-500/40'
                  : 'bg-white/[0.02] border-white/[0.05] opacity-50'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`p-1 rounded-lg ${
                    isProcessing
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isComplete
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : isFlagged
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {getStageIcon(st.id, st.status)}
                </div>
                {st.latencyMs !== undefined && (
                  <span className="text-[9px] font-mono text-zinc-400">
                    {st.latencyMs}ms
                  </span>
                )}
              </div>

              <div className="text-[11px] font-semibold text-zinc-200 truncate">
                {st.name}
              </div>

              <div className="text-[10px] font-mono text-zinc-400 truncate mt-0.5">
                {isProcessing
                  ? 'Executing...'
                  : st.detail || (isComplete ? 'Clear' : 'Queued')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
