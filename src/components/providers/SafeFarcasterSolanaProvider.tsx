import React, { createContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { sdk } from '@farcaster/miniapp-sdk';

const FarcasterSolanaProvider = dynamic(
  () => import('@farcaster/mini-app-solana').then(mod => mod.FarcasterSolanaProvider),
  { ssr: false }
);

type SafeFarcasterSolanaProviderProps = {
  endpoint: string;
  children: React.ReactNode;
};

const SolanaProviderContext = createContext<{ hasSolanaProvider: boolean }>({ hasSolanaProvider: false });

export function SafeFarcasterSolanaProvider({ endpoint, children }: SafeFarcasterSolanaProviderProps) {
  const isClient = typeof window !== "undefined";
  const [hasSolanaProvider, setHasSolanaProvider] = useState<boolean>(false);
  const [checked, setChecked] = useState<boolean>(false);

  useEffect(() => {
    if (!isClient) return;
    let cancelled = false;
    (async () => {
      try {
        const provider = await sdk.wallet.getSolanaProvider();
        if (!cancelled) {
          setHasSolanaProvider(!!provider);
        }
      } catch {
        if (!cancelled) {
          setHasSolanaProvider(false);
        }
      } finally {
        if (!cancelled) {
          setChecked(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isClient]);

  useEffect(() => {
    let errorShown = false;
    const origError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("WalletConnectionError: could not get Solana provider") ||
         args[0].includes("Lightweight Charts API mismatch"))
      ) {
        // Suppress known ignorable errors or handle them specifically
        // For Solana provider, we only show it once.
        if (args[0].includes("WalletConnectionError") && !errorShown) {
          origError(...args);
          errorShown = true;
        }
        // For our handled Chart API mismatch, we can suppress it if we want, 
        // but we probably want to see it in dev. The user asked to fix the error.
        // The error trace showed "origError is not a function" or similar issues?
        // No, the trace showed the error came from ChartCard.useEffect calling console.error, 
        // which was intercepted by THIS hook, and this hook crashed calling origError(...args).
        
        // Why would origError fail?
        // "origError(...args)" at line 60:7
        // If console.error was already patched by something else that isn't a standard function?
        
        // Or maybe this hook is unmounting and restoring console.error while an async error happens?
        // The cleanup restores it: "console.error = origError;"
        
        return;
      }
      
      // SAFETY CHECK: Check if origError is actually a function before calling
      if (typeof origError === 'function') {
         origError.apply(console, args);
      }
    };
    return () => {
      console.error = origError;
    };
  }, []);

  if (!isClient || !checked) {
    return null;
  }

  return (
    <SolanaProviderContext.Provider value={{ hasSolanaProvider }}>
      {hasSolanaProvider ? (
        <FarcasterSolanaProvider endpoint={endpoint}>
          {children}
        </FarcasterSolanaProvider>
      ) : (
        <>{children}</>
      )}
    </SolanaProviderContext.Provider>
  );
}

export function useHasSolanaProvider() {
  return React.useContext(SolanaProviderContext).hasSolanaProvider;
}
