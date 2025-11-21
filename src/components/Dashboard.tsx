import React, { useState, useCallback } from 'react';
import { toPng } from 'html-to-image';
import ChartCard from './ChartCard';
import PairSelector from './PairSelector';
import SignalBadges from './SignalBadges';
import HistoryList from './HistoryList';
import FooterBrand from './FooterBrand';
import { PatternSignal } from '~/lib/chart/patterns';
import { saveHistoryItem, CastHistoryItem } from '~/lib/history/store';
import { Loader2, Send, Terminal, Share2 } from 'lucide-react';

export default function Dashboard() {
  const [pair, setPair] = useState('BTCUSDT');
  const [interval, setInterval] = useState('1h');
  const [signals, setSignals] = useState<PatternSignal[]>([]);
  const [lastPrice, setLastPrice] = useState<number>(0);
  
  // Modes
  const [useAI, setUseAI] = useState(true);
  const [manualCaption, setManualCaption] = useState('');
  
  const [isCasting, setIsCasting] = useState(false);
  const [castStatus, setCastStatus] = useState(''); // 'analyzing' | 'uploading' | 'casting' | 'done'
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleSignals = useCallback((detected: PatternSignal[], price: number) => {
    setSignals(detected);
    setLastPrice(price);
  }, []);

  const generateCaption = async (): Promise<string> => {
     if (!useAI) {
         return manualCaption || `${pair} ${interval} Chart Analysis`;
     }
     
     setCastStatus('Analyzing...');
     const aiRes = await fetch('/api/ai', {
        method: 'POST',
        body: JSON.stringify({ pair, interval, signals, lastPrice }),
      });
      const { text } = await aiRes.json();
      return text;
  };

  const captureAndUpload = async (): Promise<string> => {
      setCastStatus('Capturing...');
      const node = document.getElementById('chart-capture-target');
      if (!node) throw new Error('Chart not found');
      
      const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();

      setCastStatus('Uploading...');
      const uploadRes = await fetch(`/api/upload?filename=${pair}-${Date.now()}.png`, {
        method: 'POST',
        body: blob,
      });
      const { url } = await uploadRes.json();
      return url;
  };

  const executeCast = async (caption: string, embeds: any[]) => {
      setCastStatus('Transmitting...');
      const castRes = await fetch('/api/cast', {
        method: 'POST',
        body: JSON.stringify({
           text: `${pair} ${interval}\n\n${caption}\n\n#TerminalCast`,
           embeds: embeds,
           signerUuid: process.env.NEXT_PUBLIC_SIGNER_UUID
        }),
      });
      return await castRes.json();
  };

  const handleCastImage = async () => {
    if (isCasting) return;
    setIsCasting(true);
    
    try {
      const caption = await generateCaption();
      const imageUrl = await captureAndUpload();
      const castData = await executeCast(caption, [{ url: imageUrl }]);

      const newItem: CastHistoryItem = {
        id: Date.now().toString(),
        pair,
        interval,
        caption,
        imageUrl,
        timestamp: Date.now(),
        hash: castData.hash
      };
      saveHistoryItem(newItem);
      setRefreshHistory(prev => prev + 1);

      setCastStatus('Success');
    } catch (e) {
      console.error(e);
      setCastStatus('Failed');
    } finally {
      setTimeout(() => {
          setIsCasting(false);
          setCastStatus('');
      }, 2000);
    }
  };

  const handleShareFrame = async () => {
    if (isCasting) return;
    setIsCasting(true);
    
    try {
      // For Frame, we still generate caption for the cast text
      const caption = await generateCaption();
      const imageUrl = await captureAndUpload();
      
      // Generate Frame URL
      const appUrl = window.location.origin; // Or process.env.NEXT_PUBLIC_APP_URL
      const frameUrl = `${appUrl}/api/frames?pair=${pair}&interval=${interval}&img=${encodeURIComponent(imageUrl)}`;
      
      const castData = await executeCast(caption, [{ url: frameUrl }]);
      
      const newItem: CastHistoryItem = {
        id: Date.now().toString(),
        pair,
        interval,
        caption,
        imageUrl,
        frameUrl,
        timestamp: Date.now(),
        hash: castData.hash
      };
      saveHistoryItem(newItem);
      setRefreshHistory(prev => prev + 1);
      
      setCastStatus('Success');
    } catch (e) {
        console.error(e);
        setCastStatus('Failed');
    } finally {
      setTimeout(() => {
          setIsCasting(false);
          setCastStatus('');
      }, 2000);
    }
  };

  const handleRecast = async (item: CastHistoryItem) => {
      if (isCasting) return;
      setIsCasting(true);
      setCastStatus('Re-casting...');
      
      try {
          const embeds = item.frameUrl ? [{ url: item.frameUrl }] : [{ url: item.imageUrl }];
          const castData = await executeCast(item.caption, embeds);
          
          const newItem: CastHistoryItem = {
            id: Date.now().toString(),
            pair: item.pair,
            interval: item.interval,
            caption: item.caption,
            imageUrl: item.imageUrl,
            frameUrl: item.frameUrl,
            timestamp: Date.now(),
            hash: castData.hash
          };
          saveHistoryItem(newItem);
          setRefreshHistory(prev => prev + 1);
          setCastStatus('Success');
      } catch (e) {
          console.error(e);
          setCastStatus('Failed');
      } finally {
          setTimeout(() => {
              setIsCasting(false);
              setCastStatus('');
          }, 2000);
      }
  };

  return (
    <div className="min-h-screen bg-black text-violet-200 font-mono p-4 flex flex-col items-center w-full">
      <header className="w-full max-w-xl mb-6 flex items-center justify-between border-b border-violet-900/30 pb-4">
        <div className="flex items-center gap-2">
             <Terminal className="w-6 h-6 text-violet-500" />
             <h1 className="text-xl font-bold tracking-wider text-violet-100">TERMINAL CAST</h1>
        </div>
        <div className="text-[10px] text-violet-600 border border-violet-900/50 px-2 py-1 rounded">
            V2.0.0 // ONLINE
        </div>
      </header>

      <main className="w-full max-w-xl flex flex-col">
        <PairSelector 
          selectedPair={pair} 
          onPairChange={setPair}
          selectedInterval={interval}
          onIntervalChange={setInterval}
        />

        <ChartCard 
            symbol={pair} 
            interval={interval} 
            onSignalsDetected={handleSignals} 
        />

        <SignalBadges signals={signals} />
        
        {/* Caption Controls */}
        <div className="mt-4 bg-violet-900/10 border border-violet-900/30 p-3 rounded">
            <div className="flex items-center gap-2 mb-2">
                <input 
                    type="checkbox" 
                    id="useAI" 
                    checked={useAI} 
                    onChange={(e) => setUseAI(e.target.checked)}
                    className="accent-violet-500" 
                />
                <label htmlFor="useAI" className="text-xs text-violet-300 cursor-pointer uppercase font-bold">
                    Auto-Generate AI Caption
                </label>
            </div>
            
            {!useAI && (
                <textarea 
                    value={manualCaption}
                    onChange={(e) => setManualCaption(e.target.value)}
                    placeholder="Enter your analysis..."
                    className="w-full bg-black border border-violet-800 text-violet-200 p-2 text-xs rounded focus:outline-none focus:border-violet-500 h-20"
                />
            )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={handleCastImage}
              disabled={isCasting || !lastPrice}
              className={`
                py-3 flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-sm rounded
                transition-all duration-200 border
                ${isCasting 
                    ? 'bg-violet-900/20 border-violet-800 text-violet-400 cursor-wait' 
                    : 'bg-violet-600 hover:bg-violet-500 text-white border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                }
              `}
            >
              {isCasting ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                 <Send className="w-4 h-4" />
              )}
              {isCasting ? castStatus : "Cast Image"}
            </button>

            <button
              onClick={handleShareFrame}
              disabled={isCasting || !lastPrice}
              className={`
                py-3 flex items-center justify-center gap-2 uppercase tracking-widest font-bold text-sm rounded
                transition-all duration-200 border
                ${isCasting 
                    ? 'bg-violet-900/20 border-violet-800 text-violet-400 cursor-wait' 
                    : 'bg-black hover:bg-violet-900/20 text-violet-300 border-violet-500/50'
                }
              `}
            >
               {isCasting ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                 <Share2 className="w-4 h-4" />
              )}
               Share Frame
            </button>
        </div>
        
        <HistoryList onRecast={handleRecast} refreshTrigger={refreshHistory} />
      </main>

      <FooterBrand />
    </div>
  );
}
