// MOCK DATA GENERATOR for Offline/Fallback Mode
function generateMockData(limit: number = 200) {
    const data = [];
    let time = Date.now() - (limit * 60 * 60 * 1000); // 1h intervals
    let price = 50000;
    
    for (let i = 0; i < limit; i++) {
        const open = price;
        const close = price + (Math.random() - 0.5) * 500;
        const high = Math.max(open, close) + Math.random() * 100;
        const low = Math.min(open, close) - Math.random() * 100;
        
        data.push([
            time,
            open.toString(),
            high.toString(),
            low.toString(),
            close.toString(),
            "1000.00", // volume
            (time + 3600000), // close time
            // ... other ignored fields
        ]);
        
        price = close;
        time += 3600000;
    }
    return data;
}

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol') || 'BTCUSDT';
  const interval = searchParams.get('interval') || '1h';

  // Binance API: https://api.binance.com/api/v3/klines
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`;
  // Fallback to Binance US if main API fails (often due to region blocking)
  const urlUS = `https://api.binance.us/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=200`;

  try {
    let res;
    
    // Try Global
    try {
        res = await fetch(url, { signal: AbortSignal.timeout(3000) }); // Fast timeout
    } catch {
        console.warn("Binance Global fetch failed/timed out");
    }

    // Try US if Global failed or returned bad status
    if (!res || !res.ok) {
        console.warn(`Binance Global API failed, trying Binance US...`);
        try {
             res = await fetch(urlUS, { signal: AbortSignal.timeout(3000) });
        } catch {
            console.warn("Binance US fetch failed/timed out");
        }
    }

    // Check final result
    if (!res || !res.ok) {
        console.warn("All Binance APIs failed, serving MOCK data for demo purposes.");
        const mockData = generateMockData(200);
        return NextResponse.json(mockData);
    }
    
    const data = await res.json();
    
    // Validation
    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Empty data returned, serving MOCK data.");
        return NextResponse.json(generateMockData(200));
    }
    
    // Check for error object in response (Binance sometimes returns {code: -1121, msg: ...} with 200 OK?? No, usually 400 but checking anyway)
    if ((data as any).code && (data as any).msg) {
         console.warn("API Error response, serving MOCK data.");
         return NextResponse.json(generateMockData(200));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Chart API Critical Error:", error);
    // Last resort fallback
    return NextResponse.json(generateMockData(200));
  }
}
