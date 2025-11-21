"use client";

import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickSeries, LineSeries, CrosshairMode } from 'lightweight-charts';
import { processChartData, generateIndicators } from '~/lib/chart/indicators';
import { detectPatterns, PatternSignal } from '~/lib/chart/patterns';

interface Props {
  symbol: string;
  interval: string;
  onSignalsDetected: (signals: PatternSignal[], lastPrice: number) => void;
}

export default function ChartCard({ symbol, interval, onSignalsDetected }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tooltip, setTooltip] = useState<{ price: string, ema5: string, ema25: string, ema99: string, x: number, y: number, visible: boolean }>({
      price: '', ema5: '', ema25: '', ema99: '', x: 0, y: 0, visible: false
  });

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // cleanup previous chart
    try {
        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }
    } catch (e) {
        console.warn("Chart cleanup failed", e);
    }

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#000000' },
        textColor: '#8b5cf6', 
      },
      grid: {
        vertLines: { color: '#1e1b4b' }, 
        horzLines: { color: '#1e1b4b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderColor: '#4c1d95',
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#4c1d95',
      },
      crosshair: {
          mode: CrosshairMode.Normal,
      }
    });

    chartRef.current = chart;

    // Store series refs
    let candleSeries: ISeriesApi<"Candlestick"> | undefined;
    let ema5Series: ISeriesApi<"Line"> | undefined;
    let ema25Series: ISeriesApi<"Line"> | undefined;
    let ema99Series: ISeriesApi<"Line"> | undefined;

    try {
        candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#8b5cf6', // violet-500
            downColor: '#ffffff', 
            borderVisible: false,
            wickUpColor: '#8b5cf6',
            wickDownColor: '#ffffff',
        });

        ema5Series = chart.addSeries(LineSeries, { color: '#d8b4fe', lineWidth: 1, priceLineVisible: false }); // violet-300
        ema25Series = chart.addSeries(LineSeries, { color: '#a78bfa', lineWidth: 2, priceLineVisible: false }); // violet-400
        ema99Series = chart.addSeries(LineSeries, { color: '#4c1d95', lineWidth: 2, priceLineVisible: false }); // violet-900
    } catch(e) {
        console.error("Failed to add series", e);
        setError("Chart Initialization Failed");
    }
    
    // Crosshair Tooltip Handler
    chart.subscribeCrosshairMove((param) => {
        if (!param.time || param.point === undefined || !candleSeries || !ema5Series || !ema25Series || !ema99Series) {
            setTooltip(prev => ({ ...prev, visible: false }));
            return;
        }

        const priceData = param.seriesData.get(candleSeries) as any;
        const ema5Data = param.seriesData.get(ema5Series) as any;
        const ema25Data = param.seriesData.get(ema25Series) as any;
        const ema99Data = param.seriesData.get(ema99Series) as any;

        setTooltip({
            visible: true,
            x: param.point.x,
            y: param.point.y,
            price: priceData ? priceData.close.toFixed(2) : '-',
            ema5: ema5Data ? ema5Data.value.toFixed(2) : '-',
            ema25: ema25Data ? ema25Data.value.toFixed(2) : '-',
            ema99: ema99Data ? ema99Data.value.toFixed(2) : '-',
        });
    });

    const fetchData = async () => {
        setLoading(true);
        setError('');
        
        let isCancelled = false;
        
        try {
            const res = await fetch(`/api/chart?symbol=${symbol}&interval=${interval}`);
            if (!res.ok) {
                 const txt = await res.text();
                 throw new Error(`Failed to fetch: ${res.status} ${txt}`);
            }
            const rawData = await res.json();
            
            if (isCancelled) return;

            const data = processChartData(rawData);
            
            if (data.length === 0) throw new Error('No data received');

            const indicators = generateIndicators(rawData);

            // Ensure chart is still valid before updating data
            if (chartRef.current) {
                try {
                    if (candleSeries) candleSeries.setData(data);
                    if (ema5Series) ema5Series.setData(indicators.ema5);
                    if (ema25Series) ema25Series.setData(indicators.ema25);
                    if (ema99Series) ema99Series.setData(indicators.ema99);

                    // Fit content
                    chart.timeScale().fitContent();
                } catch (err) {
                   console.warn("Chart update failed (possibly disposed)", err);
                }
            }

            // Run detection
            const lastPrice = data[data.length - 1];
            const rawEma5 = indicators.ema5.map(i => i.value);
            const rawEma25 = indicators.ema25.map(i => i.value);
            const rawEma99 = indicators.ema99.map(i => i.value);
            
            const signals = detectPatterns(data, rawEma5, rawEma25, rawEma99);
            onSignalsDetected(signals, lastPrice.close);

        } catch (e) {
            if (!isCancelled) {
                console.error("Chart Data Error:", e);
                setError(e instanceof Error ? e.message : 'Signal Lost');
            }
        } finally {
            if (!isCancelled) {
                setLoading(false);
            }
        }
        
        return () => { isCancelled = true; };
    };

    // Execute fetch and capture cancellation closure
    let cancelCallback: (() => void) | undefined;
    
    // Initial fetch
    fetchData().then((cancel) => {
        cancelCallback = cancel;
    });
    
    // Auto-Refresh every 60s
    const intervalId = setInterval(() => {
        fetchData().then((cancel) => {
             // We don't necessarily need to store cancel callback for interval updates 
             // as long as they handle isCancelled correctly internally
        });
    }, 60000);

    const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
             try {
                chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
             } catch(e) {
                 // ignore resize on disposed chart
             }
        }
    };

    window.addEventListener('resize', handleResize);

    return () => {
        clearInterval(intervalId);
        window.removeEventListener('resize', handleResize);
        
        if (cancelCallback) cancelCallback();
        
        try {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        } catch(e) {
            // ignore
        }
    };
  }, [symbol, interval]); // Re-run everything when symbol/interval changes

  return (
    <div className="relative w-full bg-black border border-violet-900/50 rounded-sm p-1 overflow-hidden mb-4" id="chart-capture-target">
       <div className="absolute top-2 left-3 z-10 pointer-events-none mix-blend-difference">
         <h2 className="text-violet-100 font-bold font-mono text-lg">{symbol} <span className="text-violet-500 text-sm">{interval}</span></h2>
       </div>

       {loading && (
         <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 text-violet-400 font-mono animate-pulse">
           [ INITIALIZING DATALINK ]
         </div>
       )}
       
       {error && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/90 text-red-500 font-mono border border-red-900 p-2 text-xs text-center">
           [ ERROR: {error} ]
         </div>
       )}
       
       {/* Crosshair Tooltip */}
       {tooltip.visible && (
           <div 
             className="absolute z-30 pointer-events-none bg-black/80 border border-violet-900/50 p-2 rounded text-[10px] font-mono text-violet-200 shadow-xl backdrop-blur-sm"
             style={{ 
                 left: tooltip.x, 
                 top: tooltip.y, 
                 transform: 'translate(10px, 10px)' 
             }}
           >
               <div>PRICE: <span className="text-white font-bold">{tooltip.price}</span></div>
               <div className="text-violet-300">EMA05: {tooltip.ema5}</div>
               <div className="text-violet-400">EMA25: {tooltip.ema25}</div>
               <div className="text-violet-600">EMA99: {tooltip.ema99}</div>
           </div>
       )}

       <div ref={chartContainerRef} className="w-full h-[300px]" />
    </div>
  );
}
