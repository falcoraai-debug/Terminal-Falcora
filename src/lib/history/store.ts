export interface CastHistoryItem {
  id: string;
  pair: string;
  interval: string;
  caption: string;
  imageUrl: string;
  frameUrl?: string;
  timestamp: number;
  hash?: string; // Farcaster cast hash
}

const HISTORY_KEY = 'terminal_cast_history';

export const getHistory = (): CastHistoryItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveHistoryItem = (item: CastHistoryItem) => {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  // Add to beginning, limit to 50
  const updated = [item, ...history].slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
};

export const clearHistory = () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
}
