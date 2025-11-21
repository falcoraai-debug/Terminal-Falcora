import React, { useEffect, useState } from 'react';
import { CastHistoryItem, getHistory } from '~/lib/history/store';
import { formatDistanceToNow } from 'date-fns';
import { Repeat } from 'lucide-react';

interface Props {
  onRecast: (item: CastHistoryItem) => void;
  refreshTrigger: number; 
}

export default function HistoryList({ onRecast, refreshTrigger }: Props) {
  const [history, setHistory] = useState<CastHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, [refreshTrigger]);

  if (history.length === 0) return null;

  return (
    <div className="mt-8 w-full max-w-xl border-t border-violet-900/30 pt-4">
      <h3 className="text-violet-400 font-mono text-sm mb-3 uppercase tracking-wider">Transmission Log</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {history.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-2 border border-violet-900/20 bg-violet-900/5 hover:bg-violet-900/10 transition-colors">
            <div className="flex flex-col">
               <span className="text-xs text-violet-300 font-mono font-bold">
                   {item.pair} <span className="opacity-50">|</span> {item.interval}
                   <span className="ml-2 text-violet-500/50 text-[9px]">[{item.frameUrl ? 'FRAME' : 'IMG'}]</span>
               </span>
               <span className="text-[10px] text-violet-500 font-mono truncate max-w-[200px]">{item.caption}</span>
            </div>
            <div className="flex items-center gap-2">
                 <span className="text-[10px] text-violet-600 font-mono">{formatDistanceToNow(item.timestamp, { addSuffix: true })}</span>
                 <button 
                    onClick={() => onRecast(item)}
                    className="text-violet-500 hover:text-violet-100 p-1 transition-colors"
                    title="Recast"
                 >
                    <Repeat className="w-3 h-3" />
                 </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
