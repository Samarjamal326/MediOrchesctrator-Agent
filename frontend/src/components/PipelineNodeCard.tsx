import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface MetricItem {
  label: string;
  value: string;
  tone?: 'default' | 'accent' | 'warning' | 'success';
}

export interface PipelineNodeCardProps {
  id: string;
  index: number;
  title: string;
  subtitle?: string;
  status: 'PENDING' | 'ACTIVE' | 'VERIFIED' | 'SAFETY_HALT' | 'STANDBY';
  icon: LucideIcon;
  metrics: MetricItem[];
  x: number;
  y: number;
  hasInput?: boolean;
  hasOutput?: boolean;
  isActive?: boolean;
  onClick?: () => void;
}

const statusStyles = {
  PENDING: {
    badge: 'text-zinc-500 bg-zinc-800/40 border-zinc-700/50',
    dot: 'bg-zinc-600',
    ring: 'border-white/[0.07] dark:border-white/[0.08]'
  },
  ACTIVE: {
    badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/80',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse',
    ring: 'ring-1 ring-emerald-500/40 shadow-[0_8px_30px_rgba(16,185,129,0.15)] -translate-y-0.5'
  },
  VERIFIED: {
    badge: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
    dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
    ring: 'ring-1 ring-emerald-500/20'
  },
  SAFETY_HALT: {
    badge: 'text-rose-400 bg-rose-950/60 border-rose-800/80',
    dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse',
    ring: 'ring-1 ring-rose-500/40 shadow-[0_8px_30px_rgba(244,63,94,0.15)] -translate-y-0.5'
  },
  STANDBY: {
    badge: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
    dot: 'bg-amber-400',
    ring: 'border-white/[0.07]'
  }
};

export const PipelineNodeCard: React.FC<PipelineNodeCardProps> = ({
  id,
  index,
  title,
  subtitle,
  status,
  icon: Icon,
  metrics,
  x,
  y,
  hasInput = true,
  hasOutput = true,
  isActive = false,
  onClick
}) => {
  const currentStatusStyle = statusStyles[status] || statusStyles.PENDING;

  return (
    <div
      onClick={onClick}
      className={`absolute w-[270px] select-none rounded-xl flex flex-col transition-all duration-300 group cursor-pointer 
        bg-white dark:bg-[#090b0f] border border-slate-200/90 dark:border-white/[0.08] shadow-lg
        ${currentStatusStyle.ring}
        ${isActive ? 'scale-[1.01]' : 'opacity-85 hover:opacity-100 hover:border-slate-300 dark:hover:border-white/20'}
      `}
      style={{ left: x, top: y }}
    >
      {/* Input Socket Bead */}
      {hasInput && (
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 flex items-center justify-center w-4 h-4 z-10 pointer-events-none">
          <div
            className={`w-2 h-2 rounded-full border bg-slate-900 transition-colors ${
              isActive || status === 'VERIFIED'
                ? 'border-emerald-400 bg-emerald-500/20'
                : 'border-slate-500/60 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-900'
            }`}
          />
        </div>
      )}

      {/* Output Socket Bead */}
      {hasOutput && (
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex items-center justify-center w-4 h-4 z-10 pointer-events-none">
          <div
            className={`w-2 h-2 rounded-full border bg-slate-900 transition-colors ${
              isActive || status === 'VERIFIED'
                ? 'border-emerald-400 bg-emerald-500/20'
                : 'border-slate-500/60 dark:border-zinc-700 bg-slate-200 dark:bg-zinc-900'
            }`}
          />
        </div>
      )}

      {/* Header */}
      <div className="px-3 py-2.5 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02] rounded-t-xl">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded p-1 flex-shrink-0">
            <Icon className="w-3.5 h-3.5 text-slate-700 dark:text-zinc-300" strokeWidth={2.2} />
          </div>
          <div className="font-mono text-[10.5px] font-semibold tracking-wider uppercase text-slate-700 dark:text-zinc-300 truncate">
            {String(index).padStart(2, '0')} // {title}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          <span className={`font-mono text-[9px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded border ${currentStatusStyle.badge}`}>
            {status}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${currentStatusStyle.dot}`} />
        </div>
      </div>

      {/* Subtitle / Role if present */}
      {subtitle && (
        <div className="px-3 pt-2 text-[10px] font-sans text-slate-500 dark:text-zinc-500 truncate">
          {subtitle}
        </div>
      )}

      {/* Metrics Body */}
      <div className="p-3 flex flex-col gap-2 font-mono text-[11px]">
        {metrics.map((m, i) => {
          let toneClass = 'text-slate-800 dark:text-zinc-200';
          if (m.tone === 'accent') toneClass = 'text-emerald-600 dark:text-emerald-400 font-semibold';
          if (m.tone === 'warning') toneClass = 'text-rose-600 dark:text-rose-400 font-semibold';
          if (m.tone === 'success') toneClass = 'text-emerald-600 dark:text-emerald-300 font-semibold';

          return (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-slate-400 dark:text-zinc-500 text-[10px] tracking-wide uppercase truncate">
                {m.label}
              </span>
              <span className={`truncate text-right ${toneClass}`}>
                {m.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
