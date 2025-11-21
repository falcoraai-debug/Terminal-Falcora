export function calculateEMA(data: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  
  // Simple Moving Average (SMA) as the starting point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    if (i < data.length) {
        sum += data[i];
    }
  }
  
  let ema = sum / period;
  
  // Fill the initial part with null or handle it. 
  // Lightweight charts expects data points matched by time. 
  // We will fill the first 'period - 1' points with NaN/null or just start pushing from 'period - 1'.
  // However, standard EMA usually propagates from the beginning.
  
  // A better approach for trading charts:
  // 1. Initialize EMA with the first price (or SMA of first N).
  // 2. Iterate through the rest.
  
  if (data.length === 0) return [];

  // Initialize with the first value
  ema = data[0];
  emaArray.push(ema);

  for (let i = 1; i < data.length; i++) {
    ema = data[i] * k + ema * (1 - k);
    emaArray.push(ema);
  }

  return emaArray;
}

// Helper to transform Binance Kline data to Lightweight Charts format
// Binance Kline: [time, open, high, low, close, volume, ...]
export function processChartData(klines: any[]) {
  return klines.map((k) => ({
    time: k[0] / 1000, // Lightweight charts uses seconds for UNIX timestamps
    open: parseFloat(k[1]),
    high: parseFloat(k[2]),
    low: parseFloat(k[3]),
    close: parseFloat(k[4]),
  }));
}

export function generateIndicators(klines: any[]) {
  const closes = klines.map(k => parseFloat(k[4]));
  const ema5 = calculateEMA(closes, 5);
  const ema25 = calculateEMA(closes, 25);
  const ema99 = calculateEMA(closes, 99);

  // We need to align them with time
  // The klines and calculated EMAs are same length because we started from index 0
  
  return {
    ema5: klines.map((k, i) => ({ time: k[0] / 1000, value: ema5[i] })),
    ema25: klines.map((k, i) => ({ time: k[0] / 1000, value: ema25[i] })),
    ema99: klines.map((k, i) => ({ time: k[0] / 1000, value: ema99[i] })),
  };
}
