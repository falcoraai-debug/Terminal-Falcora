import React from 'react';
import { TIMEFRAMES } from '~/lib/chart/pairs';

interface Props {
  selectedInterval: string;
  onIntervalChange: (i: string) => void;
}

export default function TimeframeSelector({ selectedInterval, onIntervalChange }: Props) {
  return (
    <div className="flex border border-violet-900/50 rounded overflow-hidden">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          onClick={() => onIntervalChange(tf.value)}
          className={`px-3 py-2 font-mono text-xs transition-colors duration-200 ${
            selectedInterval === tf.value
              ? 'bg-violet-900/50 text-violet-100 font-bold'
              : 'bg-black text-violet-500 hover:bg-violet-900/20'
          }`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
