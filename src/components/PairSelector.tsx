import React from 'react';
import { TRADING_PAIRS } from '~/lib/chart/pairs';
import TimeframeSelector from './TimeframeSelector';

interface Props {
  selectedPair: string;
  onPairChange: (p: string) => void;
  selectedInterval: string;
  onIntervalChange: (i: string) => void;
}

export default function PairSelector({ selectedPair, onPairChange, selectedInterval, onIntervalChange }: Props) {
  return (
    <div className="flex flex-col gap-2 mb-4">
        <select
          value={selectedPair}
          onChange={(e) => onPairChange(e.target.value)}
          className="bg-black border border-violet-800 text-violet-200 px-3 py-2 focus:outline-none focus:border-violet-500 uppercase font-mono text-sm rounded w-full"
        >
          {TRADING_PAIRS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        
        <TimeframeSelector 
            selectedInterval={selectedInterval}
            onIntervalChange={onIntervalChange}
        />
    </div>
  );
}
