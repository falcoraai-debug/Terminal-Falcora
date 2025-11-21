"use client";

import { useMiniApp } from "@neynar/react";
import Dashboard from "./Dashboard";

export default function App() {
  const { isSDKLoaded } = useMiniApp();

  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-violet-500 font-mono">
        <div className="text-center animate-pulse">
          [ LOADING TERMINAL ]
        </div>
      </div>
    );
  }

  return <Dashboard />;
}


