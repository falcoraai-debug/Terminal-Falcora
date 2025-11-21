import React from 'react';
import { TRADING_PAIRS } from '~/lib/chart/pairs';

interface Props {
  selectedPair: string;
  onPairChange: (p: string) => void;
}

export default function PairSelector({ selectedPair, onPairChange }: Props) {
  return (
    <select
      value={selectedPair}
      onChange={(e) => onPairChange(e.target.value)}
      className="bg-black border border-violet-800 text-violet-200 px-3 py-2 focus:outline-none focus:border-violet-500 uppercase font-mono text-sm rounded"
    >
      {TRADING_PAIRS.map((p) => (
        <option key={p} value={p}>
          {p}
        </option>
      ))}
    </select>
  );
}
