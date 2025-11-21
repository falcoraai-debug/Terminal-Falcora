export interface PatternSignal {
  type: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  name: string;
  description: string;
}

export function detectPatterns(
  prices: { open: number; high: number; low: number; close: number }[],
  ema5: number[],
  ema25: number[],
  ema99: number[]
): PatternSignal[] {
  const signals: PatternSignal[] = [];
  const len = prices.length;
  
  if (len < 5) return signals; // Need a bit more history for patterns

  const lastPrice = prices[len - 1];
  const lastEma5 = ema5[len - 1];
  const lastEma25 = ema25[len - 1];
  const lastEma99 = ema99[len - 1];

  const prevEma5 = ema5[len - 2];
  const prevEma25 = ema25[len - 2];
  
  // 1. Trend Detection (Price vs EMA99)
  const distToEma99 = Math.abs(lastPrice.close - lastEma99);
  const sidewaysThreshold = lastEma99 * 0.002; // 0.2% range
  
  if (distToEma99 < sidewaysThreshold) {
     signals.push({
      type: 'NEUTRAL',
      name: 'SIDEWAYS',
      description: 'Price ranging near EMA 99',
    });
  } else if (lastPrice.close > lastEma99) {
    signals.push({
      type: 'BULLISH',
      name: 'UPTREND',
      description: 'Price > EMA 99',
    });
  } else {
    signals.push({
      type: 'BEARISH',
      name: 'DOWNTREND',
      description: 'Price < EMA 99',
    });
  }

  // 2. Momentum (EMA5 vs EMA25)
  if (lastEma5 > lastEma25) {
      signals.push({
          type: 'BULLISH',
          name: 'BULL MOMENTUM',
          description: 'EMA 5 > EMA 25'
      });
  } else {
      signals.push({
          type: 'BEARISH',
          name: 'BEAR MOMENTUM',
          description: 'EMA 5 < EMA 25'
      });
  }

  // 3. Crossovers (Golden/Death Cross on EMA 5/25)
  if (prevEma5 < prevEma25 && lastEma5 > lastEma25) {
    signals.push({
      type: 'BULLISH',
      name: 'GOLDEN CROSS',
      description: 'EMA 5 crossed ABOVE EMA 25',
    });
  } else if (prevEma5 > prevEma25 && lastEma5 < lastEma25) {
    signals.push({
      type: 'BEARISH',
      name: 'DEATH CROSS',
      description: 'EMA 5 crossed BELOW EMA 25',
    });
  }

  // 4. Breakout Detection (Price crossing EMA 99)
  const prevPrice = prices[len - 2];
  if (prevPrice.close < lastEma99 && lastPrice.close > lastEma99) {
      signals.push({
          type: 'BULLISH',
          name: 'EMA99 BREAKOUT',
          description: 'Price broke ABOVE EMA 99'
      });
  } else if (prevPrice.close > lastEma99 && lastPrice.close < lastEma99) {
      signals.push({
          type: 'BEARISH',
          name: 'EMA99 BREAKDOWN',
          description: 'Price broke BELOW EMA 99'
      });
  }

  // 5. Candlestick Patterns
  const isGreen = lastPrice.close > lastPrice.open;
  const bodySize = Math.abs(lastPrice.close - lastPrice.open);
  const wickTop = lastPrice.high - Math.max(lastPrice.close, lastPrice.open);
  const wickBottom = Math.min(lastPrice.close, lastPrice.open) - lastPrice.low;
  const totalSize = lastPrice.high - lastPrice.low;

  // Hammer (Bullish Reversal) - Small body, long lower wick
  if (wickBottom > bodySize * 2 && wickTop < bodySize * 0.5 && isGreen) {
     signals.push({
      type: 'BULLISH',
      name: 'HAMMER',
      description: 'Bullish rejection of lower prices',
    });
  }

  // Shooting Star (Bearish Reversal) - Small body, long upper wick
  if (wickTop > bodySize * 2 && wickBottom < bodySize * 0.5 && !isGreen) {
      signals.push({
          type: 'BEARISH',
          name: 'SHOOTING STAR',
          description: 'Bearish rejection of higher prices'
      });
  }

  // Engulfing
  const prevIsGreen = prevPrice.close > prevPrice.open;
  const prevBody = Math.abs(prevPrice.close - prevPrice.open);
  
  // Bullish Engulfing
  if (!prevIsGreen && isGreen && bodySize > prevBody && lastPrice.close > prevPrice.open && lastPrice.open < prevPrice.close) {
      signals.push({
          type: 'BULLISH',
          name: 'BULL ENGULFING',
          description: 'Strong bullish reversal pattern'
      });
  }
  // Bearish Engulfing
  if (prevIsGreen && !isGreen && bodySize > prevBody && lastPrice.close < prevPrice.open && lastPrice.open > prevPrice.close) {
      signals.push({
          type: 'BEARISH',
          name: 'BEAR ENGULFING',
          description: 'Strong bearish reversal pattern'
      });
  }
  
  // Doji (Indecision)
  if (bodySize < totalSize * 0.1) {
      signals.push({
          type: 'NEUTRAL',
          name: 'DOJI',
          description: 'Market indecision'
      });
  }

  // 6. Breakout Detection relative to EMA99
  if (prevPrice.close < lastEma99 && lastPrice.close > lastEma99) {
      // Already covered by "EMA99 BREAKOUT" above, but we can add a specific breakout signal if needed.
      // The existing check #4 covers this logic.
  }

  return signals;
}
