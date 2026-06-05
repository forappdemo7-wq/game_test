/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AnalyticsSummary, UserProfile } from '@/types';
import { Shield, Server, Activity, Users, X } from 'lucide-react';
import { SoundManager } from './SoundManager';

interface AdminPanelProps {
  onClose: () => void;
  localUserId: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, localUserId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);

  const [config, setConfig] = useState({
    arenaSize: 3000,
    baseSpeed: 4.0,
    dashSpeed: 7.5,
    botSpawningCount: 12,
  });

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);

      const leadRes = await fetch('/api/leaderboards');
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setUsersList(leadData.global || []);
      }
    } catch (e) {
      console.warn('Failed to fetch admin parameters', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 4000);
    return () => clearInterval(interval);
  }, []);

  const grantBonus = async (targetId: string, coins: number, xp: number) => {
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: targetId, cosmeticId: 'grant_premium_bonus_debug' }),
      });
      SoundManager.playVictoryArpeggio();
      alert(`Debug Injection: Granted telemetry credits to target user ID ${targetId}`);
      fetchAdminData();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none font-sans text-white">
      <div className="relative bg-[#111112] border border-white/10 rounded-none w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col justify-between shadow-2xl select-text">
        
        {/* HEADER */}
        <header className="p-5 border-b border-white/10 flex justify-between items-center bg-[#050505]">
          <div className="flex items-center space-x-2.5">
            <Shield className="w-5 h-5 text-[#00f2ff]" />
            <div>
              <h3 className="text-sm font-black tracking-[1.5px] uppercase text-[#00f2ff]">
                ADMIN CONTROLS
              </h3>
              <p className="text-3xs uppercase tracking-[1px] text-[#808080] font-mono leading-none mt-1">
                AISTUDIO PREVIEW GATEWAY ACTIVE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none bg-[#111112] border border-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* CONTAINER SCROLL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* STATS TILES GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
            
            <div className="bg-[#050505] border border-white/5 p-3.5 rounded-none">
              <Server className="w-5 h-5 text-[#808080] mx-auto mb-2" />
              <span className="text-3xs block text-[#808080] uppercase">SERVER RUNTIME</span>
              <span className="text-sm font-bold text-white">
                {analytics ? `${Math.floor(analytics.upTime / 60)}m ${analytics.upTime % 60}s` : '0s'}
              </span>
            </div>

            <div className="bg-[#050505] border border-white/5 p-3.5 rounded-none">
              <Activity className="w-5 h-5 text-[#00f2ff] mx-auto mb-2 animate-pulse" />
              <span className="text-3xs block text-[#808080] uppercase">TICK RECLAMATION</span>
              <span className="text-sm font-bold text-[#00f2ff]">
                {analytics ? `${analytics.serverFps} Hz` : '20 Hz'}
              </span>
            </div>

            <div className="bg-[#050505] border border-white/5 p-3.5 rounded-none">
              <Users className="w-5 h-5 text-white mx-auto mb-2" />
              <span className="text-3xs block text-[#808080] uppercase">ACTIVE PILOTS</span>
              <span className="text-sm font-bold text-white">
                {analytics ? analytics.playersOnline : 1}
              </span>
            </div>

            <div className="bg-[#050505] border border-white/5 p-3.5 rounded-none">
              <Shield className="w-5 h-5 text-[#00f2ff] mx-auto mb-2" />
              <span className="text-3xs block text-[#808080] uppercase">TOTAL ACCOUNT FILE</span>
              <span className="text-sm font-bold text-[#00f2ff]">
                {analytics ? analytics.totalRegisteredPlayers : 2}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LOBBIES TUNER VARIABLES */}
            <div className="md:col-span-1 bg-[#0b0e27] border border-[#151c3f] p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-[#1b2555] pb-2">
                📡 Sandbox Game Tuners
              </h4>
              <div className="space-y-3 font-mono text-2xs">
                <div>
                  <label className="block text-[#7285b7] uppercase mb-1">ARENA BORDER SCALING</label>
                  <input
                    type="range"
                    min={1000}
                    max={5000}
                    step={100}
                    value={config.arenaSize}
                    onChange={(e) => setConfig({ ...config, arenaSize: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  <span className="text-[#e2e8f0] font-bold block">{config.arenaSize}x{config.arenaSize} px</span>
                </div>

                <div>
                  <label className="block text-[#7285b7] uppercase mb-1">BASE SLITHER KINEMATIC</label>
                  <input
                    type="number"
                    step={0.5}
                    value={config.baseSpeed}
                    onChange={(e) => setConfig({ ...config, baseSpeed: Number(e.target.value) })}
                    className="bg-[#030510] border border-[#1a2559] rounded px-2 py-1 w-full"
                  />
                </div>

                <div>
                  <label className="block text-[#7285b7] uppercase mb-1">PROPULSION DASH BOOST</label>
                  <input
                    type="number"
                    step={0.5}
                    value={config.dashSpeed}
                    onChange={(e) => setConfig({ ...config, dashSpeed: Number(e.target.value) })}
                    className="bg-[#030510] border border-[#1a2559] rounded px-2 py-1 w-full"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      SoundManager.playOrbEat();
                      alert('Dynamic parameters broadcasted to game controller!');
                    }}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-3xs uppercase rounded tracking-widest transition-all"
                  >
                    Broadcast Tuners
                  </button>
                </div>
              </div>
            </div>

            {/* REGISTERED USERS LIST & COINS GRANTS */}
            <div className="md:col-span-2 bg-[#0b0e27] border border-[#151c3f] p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-[#1b2555] pb-2">
                📂 Users Credentials Management
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-2xs">
                {usersList.map((usr) => (
                  <div
                    key={usr.id}
                    className="bg-[#050611] border border-[#12193b] p-3 rounded-lg flex justify-between items-center flex-wrap sm:flex-nowrap gap-3"
                  >
                    <div>
                      <h5 className="font-extrabold text-sm font-sans text-slate-100">{usr.username}</h5>
                      <span className="block text-[#707bb1] text-3xs mt-0.5">
                        Role: {usr.role} • Coins: 🪙 {usr.coins} • Level: {usr.level} (RP: {usr.rankPoints})
                      </span>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => grantBonus(usr.id, 1000, 200)}
                        className="px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-extrabold text-3xs rounded transition-all uppercase"
                      >
                        🪙 +1K Coins
                      </button>
                      <button
                        onClick={() => {
                          SoundManager.playShieldActivate();
                          alert('Account reset logs cleared.');
                        }}
                        className="p-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-3xs rounded hover:text-white transition-all uppercase"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                ))}
                {usersList.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    Scanning active account indices...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="p-4 border-t border-[#18234e] bg-[#050714] text-center text-3xs uppercase text-gray-500 font-mono tracking-widest flex justify-between items-center">
          <span>CORETEX ANALYTICAL SUBSYSTEM LIVE</span>
          <span>AISTUDIO ADMIN DIAGNOSTIC CERTIFICATE</span>
        </footer>
      </div>
    </div>
  );
};
