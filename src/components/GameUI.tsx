/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ServerPlayer, GameMode, Orb, Point, KillFeedEntry } from '../types';
import { Shield, Zap, Compass, Smile, Eye, MessageSquare, AlertTriangle } from 'lucide-react';
import { SoundManager } from './SoundManager';

interface GameUIProps {
  players: Record<string, ServerPlayer>;
  orbs: Orb[];
  localPlayerId: string | null;
  mode: GameMode;
  brZoneRadius: number;
  brCenter: Point;
  onTriggerAbility: (type: 'shield' | 'magnet' | 'ghost') => void;
  onSendChat: (message: string) => void;
  onExitGame: () => void;
  chatMessages: Array<{ id: string; username: string; message: string; timestamp: string }>;
  killFeed: KillFeedEntry[];
}

export const GameUI: React.FC<GameUIProps> = ({
  players,
  orbs,
  localPlayerId,
  mode,
  brZoneRadius,
  brCenter,
  onTriggerAbility,
  onSendChat,
  onExitGame,
  chatMessages,
  killFeed = [],
}) => {
  const localPlayer = localPlayerId ? players[localPlayerId] : null;

  // UI state
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Parse top scoreboard sorted descending
  const playersArray = Object.values(players) as ServerPlayer[];
  const sortedLeaderboard = [...playersArray]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  // Filter in local player rank amongst everyone
  const fullLeaderboard = [...playersArray].sort((a, b) => b.score - a.score);
  const myLeaderboardRank = localPlayerId
    ? fullLeaderboard.findIndex((p) => (p as ServerPlayer).id === localPlayerId) + 1
    : 0;

  // Active abilities cooling gauges (Simulated cooldown states)
  const [cooldowns, setCooldowns] = useState({
    shield: 0, // max 100
    magnet: 0, // max 100
    ghost: 0,  // max 100
  });

  // Track keyboard hooks for PC controls W, E, R
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isChatOpen) return; // ignore typing triggers
      if (e.code === 'KeyW') {
        e.preventDefault();
        triggerAbilityLocal('shield');
      } else if (e.code === 'KeyE') {
        e.preventDefault();
        triggerAbilityLocal('magnet');
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        triggerAbilityLocal('ghost');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen]);

  // Ability client-trigger and cool down scheduler
  const triggerAbilityLocal = (type: 'shield' | 'magnet' | 'ghost') => {
    if (cooldowns[type] > 0) return; // cooling

    // Fire callback to server API/sockets
    onTriggerAbility(type);

    // Play specific sound
    if (type === 'shield') SoundManager.playShieldActivate();
    else if (type === 'magnet') SoundManager.playMagnetActivate();
    else if (type === 'ghost') SoundManager.playGhostActivate();

    // Trigger local 8 second cooldown
    setCooldowns((prev) => ({ ...prev, [type]: 100 }));
  };

  // Tick cooldown values down smoothly in UI
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => ({
        shield: Math.max(0, prev.shield - 1.25),
        magnet: Math.max(0, prev.magnet - 1),
        ghost: Math.max(0, prev.ghost - 1.5),
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Scroll chat to bottom automatically
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendChat(chatInput.trim());
    setChatInput('');
    setIsChatOpen(false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-sans select-none z-10 text-white">
      {/* =========================================== */}
      {/* 1. TOP HUD BAR: MISSION TELEMETRICS */}
      {/* =========================================== */}
      <header className="flex justify-between items-start w-full">
        <div className="flex space-x-3 pointer-events-auto">
          {/* Back button to cockpit */}
          <button
            onClick={onExitGame}
            className="px-4 py-2 bg-[#111112] hover:bg-white/5 border border-white/10 uppercase font-black text-xs rounded-none transition-all tracking-[1.5px] font-mono shadow-2xl cursor-pointer hover:border-[#00f2ff]/40 text-white"
          >
            ◀ EXIT TO COCKPIT
          </button>

          {/* Core HUD status indicators */}
          {localPlayer && (
            <div className="flex bg-[#111112] border border-white/10 px-4 py-2 rounded-none space-x-4 text-xs font-mono">
              <div className="text-center">
                <span className="block text-[#808080] text-3xs font-bold tracking-widest uppercase">MASS WEIGHT</span>
                <span className="text-sm font-black text-[#00f2ff]">{localPlayer.score} HP</span>
              </div>
              <div className="w-[1px] bg-white/10 h-8 self-center" />
              <div className="text-center">
                <span className="block text-[#808080] text-3xs font-bold tracking-widest uppercase">TAIL PIECES</span>
                <span className="text-sm font-black text-white">{localPlayer.segments?.length || 0} SEGS</span>
              </div>
              <div className="w-[1px] bg-white/10 h-8 self-center" />
              <div className="text-center">
                <span className="block text-[#808080] text-3xs font-bold tracking-widest uppercase">SECTOR RANK</span>
                <span className="text-sm font-black text-[#00f2ff] font-sans">#{myLeaderboardRank}</span>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Storm alert bar in Battle Royale mode */}
        {mode === GameMode.BATTLE_ROYALE && brZoneRadius < 3000 && (
          <div className="flex items-center space-x-2.5 bg-red-950/80 border border-red-500/40 px-4 py-2.5 rounded-xl block shadow-xl w-72 animate-pulse pointer-events-auto">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-xs font-sans">
              <span className="block font-black text-red-500 uppercase tracking-widest text-2xs leading-none mb-0.5">
                STORM COLLAPSE IN BOUNDS
              </span>
              <span className="text-3xs font-mono text-gray-300">
                Safe radius decreased to {Math.floor(brZoneRadius)}m!
              </span>
            </div>
          </div>
        )}

        {/* LOBBY LEADERBOARD & KILL FEED */}
        <div className="flex flex-col space-y-2.5 items-end pointer-events-auto">
          <div className="bg-[#111112] border border-white/10 p-4 rounded-none w-60 shadow-xl">
            <h4 className="text-3xs font-black text-[#00f2ff] tracking-[1.5px] uppercase border-b border-white/10 pb-1.5 mb-2 flex justify-between">
              <span>SECTOR LOBBY LEADERS</span>
              <span className="text-[#808080] font-mono">MODE: {mode.toUpperCase()}</span>
            </h4>
            <div className="space-y-1 text-2xs font-mono">
              {sortedLeaderboard.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex justify-between items-center py-0.5 ${
                    p.id === localPlayerId ? 'text-[#00f2ff] font-bold bg-[#00f2ff]/10 px-1 rounded-none' : 'text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate max-w-[150px]">
                    <span className="text-[#808080]">{idx + 1}.</span>
                    <span className="font-sans font-bold text-[#e0e0e0] truncate">{p.name}</span>
                  </div>
                  <span>{p.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC RETRO SPACE PILOT KILL FEED */}
          {killFeed.length > 0 && (
            <div className="flex flex-col space-y-1.5 items-end w-60 max-h-64 overflow-hidden">
              {killFeed.slice().reverse().map((feed) => {
                const isMyKill = localPlayer && feed.killerName === localPlayer.name;
                const isMyDeath = localPlayer && feed.victimName === localPlayer.name;
                
                let messageContent;
                let cardStyle = "bg-[#111112]/95 border-white/5 text-[#c0c0c0]";
                let iconColor = "text-[#808080]";

                if (isMyKill) {
                  cardStyle = "bg-[#00f2ff]/5 border-[#00f2ff]/30 text-white shadow-[0_0_10px_rgba(0,242,255,0.15)] border-l-2 border-l-[#00f2ff]";
                  iconColor = "text-[#00f2ff]";
                  messageContent = (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="text-[#00f2ff] font-extrabold">YOU</span>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">disintegrated</span>
                      <span className="font-bold text-white truncate max-w-[100px]">{feed.victimName}</span>
                    </div>
                  );
                } else if (isMyDeath) {
                  cardStyle = "bg-red-950/20 border-red-500/30 text-white shadow-[0_0_10px_rgba(239,68,68,0.15)] border-l-2 border-l-red-500";
                  iconColor = "text-red-500 animate-pulse";
                  messageContent = (
                    <div className="flex items-center space-x-1 select-none">
                      <span className="text-red-400 font-extrabold">YOU</span>
                      <span className="text-gray-400 font-mono text-[9px] uppercase tracking-wider">crashed - by</span>
                      <span className="font-bold text-white truncate max-w-[100px]">
                        {feed.killerName === 'wall' ? 'BOUNDARY' : feed.killerName === 'the storm' ? 'STORM RING' : feed.killerName}
                      </span>
                    </div>
                  );
                } else {
                  // regular player/bot kill
                  const isWall = feed.killerName === 'wall';
                  const isStorm = feed.killerName === 'the storm';
                  
                  messageContent = (
                    <div className="flex items-center space-x-1 select-none">
                      {isWall || isStorm ? (
                        <>
                          <span className="font-bold text-white truncate max-w-[90px]">{feed.victimName}</span>
                          <span className="text-[#808080] font-mono text-[9px] uppercase tracking-wider">
                            {isWall ? 'hit border' : 'lost to storm'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-white truncate max-w-[85px]">{feed.killerName}</span>
                          <span className="text-[#808080] font-mono text-[8px] uppercase tracking-widest px-1 bg-white/5">VS</span>
                          <span className="font-bold text-white truncate max-w-[85px]">{feed.victimName}</span>
                        </>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={feed.id}
                    className={`flex items-center justify-between px-3 py-1.5 border font-mono text-[10px] w-full transition-all duration-300 ${cardStyle}`}
                  >
                    <div className="truncate pr-1">{messageContent}</div>
                    <span className={`${iconColor} text-[8px] font-black ml-1 shrink-0 bg-[#050505] px-1 py-0.5 border border-white/5`}>
                      {isMyKill ? '⚔️ KILL' : isMyDeath ? '💥 DESTR' : '• FEED'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* =========================================== */}
      {/* 2. BODY HUD: INBOUND EVENT NOTIFICATIONS */}
      {/* =========================================== */}
      <div className="flex-1 flex items-center justify-center p-6 select-none">
        {localPlayer && localPlayer.abilities.dash.active && (
          <div className="bg-[#030511]/90 border border-cyan-500/30 px-4 py-2 rounded-lg text-xs tracking-wider text-cyan-400 flex items-center space-x-2 animate-bounce">
            <Zap className="w-4 h-4 fill-cyan-500 stroke-none" />
            <span className="font-bold uppercase tracking-widest">PROPULSION OVERHEAT • HYPER SPEED ACTIVE</span>
          </div>
        )}
      </div>

      {/* =========================================== */}
      {/* 3. BOTTOM HUD BAR: COM PROTOCOLS */}
      {/* =========================================== */}
      <footer className="flex justify-between items-end w-full">
        {/* CHAT TERMINAL WINDOW */}
        <div className="flex flex-col w-72 pointer-events-auto">
          {/* Scroll log window */}
          {isChatOpen && (
            <div className="bg-[#111112] border border-white/10 rounded-none p-3 h-48 overflow-y-auto space-y-1.5 flex flex-col shadow-2xl">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-2xs font-mono leading-tight">
                  <span className="font-sans font-bold text-[#00f2ff] mr-1.5">[{msg.username}]:</span>
                  <span className="text-gray-300">{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {/* Form text input trigger bar */}
          <form
            onSubmit={handleChatSubmit}
            className={`flex bg-[#111112] border border-white/10 p-2 rounded-none ${
              isChatOpen ? 'border-t-0' : 'shadow-lg'
            }`}
          >
            <input
              type="text"
              maxLength={45}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onFocus={() => setIsChatOpen(true)}
              placeholder="PRESS ENTER OR CLICK TO TRANSMIT..."
              className="flex-1 bg-transparent border-none text-2xs px-2 focus:outline-none placeholder-gray-600 font-mono text-white"
            />
            <button
              type="button"
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="p-1.5 hover:bg-white/5 duration-150 rounded-none cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[#808080]" />
            </button>
          </form>
        </div>

        {/* ACTIVE CAPABILITIES SPELLS SYSTEM PANEL */}
        <div className="flex space-x-4 bg-[#111112] border border-white/10 p-3 rounded-none pointer-events-auto shadow-2xl">
          {/* ABILITY 1: SHIELD */}
          <button
            onClick={() => triggerAbilityLocal('shield')}
            disabled={cooldowns.shield > 0}
            className={`w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${
              cooldowns.shield > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'
            }`}
          >
            <Shield className="w-5 h-5 text-[#00f2ff] mb-1" />
            <span className="text-3xs tracking-widest font-bold">W-SHIELD</span>
            {cooldowns.shield > 0 && (
              <div
                className="absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400"
              >
                {Math.floor(cooldowns.shield / 12.5)}s
              </div>
            )}
          </button>

          {/* ABILITY 2: MAGNET */}
          <button
            onClick={() => triggerAbilityLocal('magnet')}
            disabled={cooldowns.magnet > 0}
            className={`w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${
              cooldowns.magnet > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'
            }`}
          >
            <Compass className="w-5 h-5 text-[#00f2ff] mb-1" />
            <span className="text-3xs tracking-widest font-bold">E-VACUUM</span>
            {cooldowns.magnet > 0 && (
              <div
                className="absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400"
              >
                {Math.floor(cooldowns.magnet / 10)}s
              </div>
            )}
          </button>

          {/* ABILITY 3: GHOST */}
          <button
            onClick={() => triggerAbilityLocal('ghost')}
            disabled={cooldowns.ghost > 0}
            className={`w-14 items-center flex flex-col justify-center relative rounded-none p-2 transition-all cursor-pointer ${
              cooldowns.ghost > 0 ? 'bg-[#050505]/40 opacity-40' : 'bg-[#111112] border border-white/10 hover:border-[#00f2ff]/60 hover:bg-white/5'
            }`}
          >
            <Eye className="w-5 h-5 text-[#00f2ff] mb-1" />
            <span className="text-3xs tracking-widest font-bold">R-PHASE</span>
            {cooldowns.ghost > 0 && (
              <div
                className="absolute inset-0 bg-[#050505]/95 rounded-none border border-red-500/25 flex items-center justify-center font-mono text-3xs font-black text-red-400"
              >
                {Math.floor(cooldowns.ghost / 15)}s
              </div>
            )}
          </button>
        </div>

        {/* TACTICAL FLOATING MINIMAP GRID */}
        <div className="relative bg-[#111112] border border-white/10 w-32 h-32 rounded-none overflow-hidden pointer-events-auto shadow-2xl">
          <canvas
            id="minimap_tactical_grid"
            width={128}
            height={128}
            ref={(canvas) => {
              if (!canvas) return;
              const ctx = canvas.getContext('2d');
              if (!ctx) return;

              // Clear background grid
              ctx.clearRect(0,0,128,128);
              ctx.fillStyle = '#050505';
              ctx.fillRect(0,0,128,128);

              // Grid hash lines
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.moveTo(64, 0); ctx.lineTo(64, 128);
              ctx.moveTo(0, 64); ctx.lineTo(128, 64);
              ctx.stroke();

              const scale = 128 / 3000;

              // Draw Battle Royale Hazard Zone
              if (mode === GameMode.BATTLE_ROYALE) {
                const rx = brCenter.x * scale;
                const ry = brCenter.y * scale;
                const rRadius = brZoneRadius * scale;
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
                ctx.lineWidth = 1.0;
                ctx.beginPath();
                ctx.arc(rx, ry, rRadius, 0, Math.PI * 2);
                ctx.stroke();
              }

              // Draw other snakes dots
              Object.keys(players).forEach((pId) => {
                const p = players[pId];
                if (p.isDead) return;

                const mx = p.x * scale;
                const my = p.y * scale;

                if (pId === localPlayerId) {
                  // Green glowing pulsing dots representing local glider
                  ctx.fillStyle = '#10b981';
                  ctx.beginPath();
                  ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
                  ctx.fill();
                } else {
                  // Standard whites dots for opponent components
                  ctx.fillStyle = p.isBot ? '#ffffff' : '#3b82f6';
                  ctx.beginPath();
                  ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              });
            }}
          />
        </div>
      </footer>

      {/* =========================================== */}
      {/* 4. DIALOG LAYER: POST DE-ORBIT GAME OVER */}
      {/* =========================================== */}
      {localPlayer && localPlayer.isDead && (
        <div className="absolute inset-0 bg-[#050505]/95 backdrop-blur-md pointer-events-auto flex items-center justify-center animate-fade-in z-50">
          <div className="bg-[#111112] border border-white/10 p-8 rounded-none w-full max-w-md text-center shadow-2xl border-t-3 border-t-[#00f2ff]">
            <span className="text-3xs uppercase tracking-[2px] font-mono font-bold px-3 py-1 bg-[#050505] border border-[#00f2ff]/20 text-[#00f2ff] rounded-none inline-block mb-3 animate-pulse">
              MATCH DE-BRIEFING PROTOCOL ACTIVE
            </span>
            <h2 className="text-2xl font-black text-white uppercase tracking-[4px] mb-1">
              MATCH SUMMARY
            </h2>
            <p className="text-[#808080] text-3xs font-mono uppercase tracking-[1px] mb-6">
              Sector: {mode.toUpperCase()} Arena
            </p>

            {/* Top 3 Leaders Section */}
            <div className="mb-6 text-left">
              <h3 className="text-3xs uppercase tracking-[2px] text-[#808080] font-mono font-bold mb-3 border-b border-white/10 pb-1">
                LOBBY PODIUM (TOP 3)
              </h3>
              <div className="space-y-1.5">
                {sortedLeaderboard.slice(0, 3).map((player, idx) => {
                  const isUser = player.id === localPlayerId;
                  return (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-2.5 border font-mono transition-all ${
                        idx === 0
                          ? 'bg-[#00f2ff]/5 border-[#00f2ff]/30 text-white'
                          : isUser
                            ? 'bg-white/5 border-[#00f2ff]/20 text-white'
                            : 'bg-[#111112] border-white/5 text-[#e0e0e0]'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-[120px] truncate">
                        <span className={`text-[11px] font-black ${idx === 0 ? 'text-[#00f2ff]' : 'text-[#808080]'}`}>
                          0{idx + 1}
                        </span>
                        <span className="font-sans text-xs font-bold text-white truncate">
                          {player.name} {isUser && <span className="text-[#00f2ff] text-[10px] ml-0.5">(YOU)</span>}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px] text-right">
                        <span>
                          <span className="text-[#808080] mr-1">MASS:</span>
                          <span className="text-white font-bold">{player.score} HP</span>
                        </span>
                        <span>
                          <span className="text-[#808080] mr-1">KILLS:</span>
                          <span className="text-[#00f2ff] font-bold">{player.kills || 0}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Personal Statistics Review */}
            <div className="text-left mb-6">
              <h3 className="text-3xs uppercase tracking-[2px] text-[#808080] font-mono font-bold mb-3 border-b border-white/10 pb-1">
                PILOT MISSION LOG
              </h3>
              <div className="bg-[#050505] rounded-none border border-white/5 p-4 font-mono text-xs space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-[#808080] uppercase tracking-[1.5px] text-[10px]">FINAL MASS / DENSITY:</span>
                  <span className="font-bold text-[#00f2ff]">{localPlayer.score} HP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#808080] uppercase tracking-[1.5px] text-[10px]">ELIMINATIONS SECURED:</span>
                  <span className="font-bold text-white">{localPlayer.kills || 0} SECURED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#808080] uppercase tracking-[1.5px] text-[10px]">ESTIMATED LOBBY PAYOUT:</span>
                  <span className="font-bold text-[#00f2ff]">🪙 +{Math.floor(localPlayer.score / 6)} CREDIT</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onExitGame}
                className="w-full btn-cyber py-3 bg-[#00f2ff] hover:bg-[#00e1ec] text-[#050505] font-black tracking-[2px] text-xs uppercase transition-all cursor-pointer shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:shadow-[0_0_20px_rgba(0,242,255,0.5)]"
              >
                Return to Lobby
              </button>
              
              <button
                onClick={() => {
                  SoundManager.playShieldActivate();
                }}
                className="w-full py-2.5 bg-transparent hover:bg-white/5 border border-white/10 text-2xs font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-all cursor-pointer rounded-none"
              >
                Waiting for Respawn... ({Math.floor(localPlayer.respawnTimer / 20)}s)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
