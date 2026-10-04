import React from 'react';

export interface CableNodePos {
  id: string;
  x: number;
  y: number;
  metricsCount?: number;
}

export interface CableConnection {
  sourceId: string;
  targetId: string;
  isActive?: boolean;
  isError?: boolean;
}

interface PipelineCablesProps {
  nodes: CableNodePos[];
  connections: CableConnection[];
  nodeWidth?: number;
}

export const PipelineCables: React.FC<PipelineCablesProps> = ({
  nodes,
  connections,
  nodeWidth = 270
}) => {
  const getNodeCenter = (id: string, type: 'output' | 'input') => {
    const node = nodes.find(n => n.id === id);
    if (!node) return { x: 0, y: 0 };

    const count = node.metricsCount ?? 2;
    // Base card height formula: header (40px) + padding + metric rows (~22px each)
    const nodeHeight = 40 + (count * 25) + 16;

    if (type === 'output') {
      return {
        x: node.x + nodeWidth,
        y: node.y + (nodeHeight / 2)
      };
    } else {
      return {
        x: node.x,
        y: node.y + (nodeHeight / 2)
      };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg className="w-full h-full overflow-visible">
        <defs>
          <filter id="cable-glow-active" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="active-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#34d399" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
          </linearGradient>

          <linearGradient id="error-flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#fb7185" stopOpacity="1" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {connections.map((conn, idx) => {
          const source = getNodeCenter(conn.sourceId, 'output');
          const target = getNodeCenter(conn.targetId, 'input');

          const deltaX = target.x - source.x;
          const controlPointX = Math.max(deltaX * 0.5, 40);
          const pathD = `M ${source.x} ${source.y} C ${source.x + controlPointX} ${source.y}, ${target.x - controlPointX} ${target.y}, ${target.x} ${target.y}`;

          return (
            <g key={`${conn.sourceId}-${conn.targetId}-${idx}`}>
              {/* Inactive Base Cable */}
              <path
                d={pathD}
                fill="none"
                stroke="currentColor"
                className="text-slate-300/40 dark:text-zinc-800/80"
                strokeWidth={1.75}
              />

              {/* Active flowing neon cable */}
              {conn.isActive && (
                <path
                  d={pathD}
                  fill="none"
                  stroke={conn.isError ? "url(#error-flow-grad)" : "url(#active-flow-grad)"}
                  strokeWidth={2.25}
                  filter="url(#cable-glow-active)"
                  className="animate-cable-flow"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
