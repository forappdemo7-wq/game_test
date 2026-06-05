/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js Cockpit Crash Captured: ', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 font-mono text-xs text-red-400 space-y-6">
      <div className="w-16 h-16 rounded-full border border-red-500/30 flex items-center justify-center bg-red-950/20 text-lg animate-pulse">
        ⚠️
      </div>

      <div className="text-center space-y-2 uppercase tracking-wide max-w-md">
        <h2 className="text-base font-black tracking-wider text-white">SATELLITE DOWNLINK LOST</h2>
        <p className="text-2xs text-gray-400 normal-case leading-relaxed">
          {error.message || "An unresolved network or database error prevented connection to the slither combat server."}
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-black border border-red-500/20 text-2xs uppercase tracking-widest font-extrabold transition-all"
        >
          Re-establish Quantum Bridge
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-2xs uppercase tracking-widest font-extrabold"
        >
          Return to Deck
        </button>
      </div>
    </div>
  );
}
