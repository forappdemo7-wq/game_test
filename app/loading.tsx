/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] font-mono text-xs text-cyan-400 space-y-6">
      {/* Animated Orbiting Radar Scope */}
      <div className="relative w-20 h-20 border-2 border-cyan-800/20 rounded-full flex items-center justify-center">
        <div className="absolute inset-0 border-t-2 border-r-2 border-cyan-400 rounded-full animate-spin" />
        <div className="w-8 h-8 rounded-full border border-cyan-500/30 animate-pulse bg-cyan-950/20" />
      </div>

      <div className="text-center space-y-2 uppercase tracking-widest">
        <p className="font-extrabold animate-pulse">BOOTING COMBAT COCKPIT...</p>
        <p className="text-3xs text-gray-500">Connecting Satellite Grid | Loading WebGL Core</p>
      </div>
    </div>
  );
}
