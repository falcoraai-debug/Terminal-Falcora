import React from 'react';
import { PatternSignal } from '~/lib/chart/patterns';

interface Props {
  signals: PatternSignal[];
}

export default function SignalBadges({ signals }: Props) {
  if (!signals.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs">
      {signals.map((s, i) => (
        <span
          key={i}
          className={`px-2 py-1 border rounded ${
            s.type === 'BULLISH'
              ? 'bg-green-900/20 border-green-500/50 text-green-400'
              : s.type === 'BEARISH'
              ? 'bg-red-900/20 border-red-500/50 text-red-400'
              : 'bg-violet-900/20 border-violet-500/50 text-violet-400'
          }`}
          title={s.description}
        >
          {s.name.toUpperCase()}
        </span>
      ))}
    </div>
  );
}
