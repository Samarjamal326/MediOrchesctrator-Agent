import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface Metric {
  label: string;
  value: string;
}

export interface NodeCardProps {
  id: string;
  index: number;
  title: string;
  status: 'PENDING' | 'EVALUATING' | 'VERIFIED' | 'SAFETY_HALT';
  icon: LucideIcon;
  metrics: Metric[];
  x: number;
  y: number;
  hasInput?: boolean;
  hasOutput?: boolean;
  isActive?: boolean;
  width?: number;
  onClick?: () => void;
}

const statusColors = {
  PENDING: 'bg-zinc-600',
  EVALUATING: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] animate-pulse',
  VERIFIED: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
  SAFETY_HALT: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse'
};

const statusTextColors = {
  PENDING: 'text-zinc-500',
  EVALUATING: 'text-blue-400',
  VERIFIED: 'text-emerald-400',
  SAFETY_HALT: 'text-rose-400'
};

export const NodeCard: React.FC<NodeCardProps> = ({
  id,
  index,
  title,
  status,
  icon: Icon,
  metrics,
  x,
  y,
  hasInput = true,
  hasOutput = true,
  isActive = false,
  width = 240,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`absolute node-milled-border rounded-xl flex flex-col transition-all duration-300 group hover:ring-1 hover:ring-white/20 select-none cursor-pointer ${
        isActive
          ? 'ring-1 ring-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.8)] -translate-y-1 z-20'
          : 'opacity-85 hover:opacity-100 z-10'
      }`}
      style={{ left: x, top: y, width: `${width}px` }}
    >
      {/* Input Socket */}
      {hasInput && (
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 flex items-center justify-center w-4 h-4 z-10 group pointer-events-none">
          <div
            className={`w-2 h-2 rounded-full border border-zinc-600 bg-zinc-950 transition-colors ${
              isActive ? 'border-blue-400 bg-blue-500/20' : ''
            }`}
          />
        </div>
      )}

      {/* Output Socket */}
      {hasOutput && (
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 flex items-center justify-center w-4 h-4 z-10 group pointer-events-none">
          <div
            className={`w-2 h-2 rounded-full border border-zinc-600 bg-zinc-950 transition-colors ${
              isActive ? 'border-blue-400 bg-blue-500/20' : ''
            }`}
          />
        </div>
      )}

      {/* Header */}
      <div className="px-2.5 py-2 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <div className="bg-zinc-900 border border-zinc-800 rounded p-1 flex-shrink-0">
            <Icon className="w-3 h-3 text-zinc-300" strokeWidth={2.5} />
          </div>
          <div className="font-mono text-[9.5px] tracking-wider uppercase text-zinc-400 truncate">
            {String(index).padStart(2, '0')} // {title}
          </div>
        </div>

        {/* Status Dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          <span className={`font-mono text-[8.5px] tracking-wider uppercase ${statusTextColors[status]}`}>
            {status}
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${statusColors[status]}`} />
        </div>
      </div>

      {/* Body / Metrics */}
      <div className="p-2.5 flex flex-col gap-1.5 bg-zinc-950/40 rounded-b-xl font-mono text-[10px]">
        {metrics.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-zinc-400">
            <span className="text-zinc-500 text-[9px] uppercase tracking-wider truncate mr-1">
              {m.label}
            </span>
            <span className="text-zinc-200 font-semibold truncate text-right">
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
