/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GameMode,
  UserProfile,
  PlayerRank,
  CosmeticItem,
  Achievement,
  Clan,
  FriendShip,
} from '../types';
import {
  Trophy,
  ShoppingBag,
  Users,
  Award,
  User,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  Play,
  LogOut,
  Sliders,
  Plus,
  Send,
  UserPlus,
  Compass,
} from 'lucide-react';
import { SoundManager } from './SoundManager';

interface MainMenuProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
  onJoinGame: (mode: GameMode, roomCode?: string) => void;
  onUpgradeToAdmin?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  user,
  onLogin,
  onJoinGame,
  soundEnabled,
  onToggleSound,
}) => {
  // Navigation tabs
  type Tab = 'play' | 'shop' | 'clans' | 'friends' | 'leaderboards' | 'achievements' | 'profile';
  const [activeTab, setActiveTab] = useState<Tab>('play');

  // Form helpers
  const [usernameInput, setUsernameInput] = useState('');
  const [clanForm, setClanForm] = useState({ name: '', tag: '' });
  const [friendForm, setFriendForm] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isBrQueueActive, setIsBrQueueActive] = useState(false);

  // Upgraded Feature States (Phases 3, 5, 6, 7, 9, 10)
  const [activePlaySubTab, setActivePlaySubTab] = useState<'lobbies' | 'training' | 'wars' | 'replays' | 'quests'>('lobbies');
  const [isRankedQueueActive, setIsRankedQueueActive] = useState(false);
  const [rankedWaitSec, setRankedWaitSec] = useState(0);
  const [arenaTheme, setArenaTheme] = useState<string>('cyber');
  const [questsData, setQuestsData] = useState<{ dailyQuests: any[]; weeklyChallenges: any[] } | null>(null);
  const [trainingCourses, setTrainingCourses] = useState<any[]>([]);
  const [clanTerritories, setClanTerritories] = useState<any[]>([]);
  const [replayRegistry, setReplayRegistry] = useState<any[]>([]);
  const [academySuccessData, setAcademySuccessData] = useState<{ xp: number; coins: number; name: string } | null>(null);
  const [cinemaReplay, setCinemaReplay] = useState<any | null>(null);

  // Loaded database endpoints state
  const [shopItems, setShopItems] = useState<CosmeticItem[]>([]);
  const [leaderboards, setLeaderboards] = useState<{
    global: UserProfile[];
    scores: UserProfile[];
    wins: UserProfile[];
    kills: UserProfile[];
    clans: Clan[];
  } | null>(null);
  const [clansList, setClansList] = useState<Clan[]>([]);
  const [myClan, setMyClan] = useState<Clan | null>(null);
  const [clanChatInput, setClanChatInput] = useState('');
  const [friendsList, setFriendsList] = useState<FriendShip[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Fetch contextual features helper
  const syncServerData = async () => {
    if (!user) return;
    try {
      // Shop
      const shopRes = await fetch('/api/shop');
      const shopData = await shopRes.json();
      setShopItems(shopData.shopItems);

      // Leaderboards
      const leadRes = await fetch('/api/leaderboards');
      const leadData = await leadRes.json();
      setLeaderboards(leadData);

      // Clans Catalog
      const clansRes = await fetch('/api/clans');
      const clansData = await clansRes.json();
      setClansList(clansData);

      if (user.clanId) {
        const found = clansData.find((c: Clan) => c.id === user.clanId);
        setMyClan(found || null);
      } else {
        setMyClan(null);
      }

      // Friends & requests
      const friendsRes = await fetch(`/api/friends/${user.id}`);
      const friendsData = await friendsRes.json();
      setFriendsList(friendsData.friends);
      setFriendRequests(friendsData.requests);

      // Achievements
      const achRes = await fetch(`/api/achievements/${user.id}`);
      const achData = await achRes.json();
      setAchievements(achData);

      // Quests matrix
      const qRes = await fetch(`/api/quests/${user.id}`);
      if (qRes.ok) {
        const qData = await qRes.json();
        setQuestsData(qData);
      }

      // Training academy courses
      const tRes = await fetch('/api/training/courses');
      if (tRes.ok) {
        const tData = await tRes.json();
        setTrainingCourses(tData.courses);
      }

      // Clan Wars Territories
      const terrRes = await fetch('/api/clan-wars/territories');
      if (terrRes.ok) {
        const terrData = await terrRes.json();
        setClanTerritories(terrData.territories);
      }

      // Replay Registry logs
      const repRes = await fetch('/api/replays');
      if (repRes.ok) {
        const repData = await repRes.json();
        setReplayRegistry(repData.replays);
      }
    } catch (e) {
      console.warn('Backend endpoint offline. Working on memory states:', e);
    }
  };

  useEffect(() => {
    if (user) {
      syncServerData();
    }
  }, [user, activeTab]);

  useEffect(() => {
    let timer: any;
    if (isRankedQueueActive) {
      timer = setInterval(() => {
        setRankedWaitSec((prev) => {
          if (prev >= 6) {
            // Simulated queue pops successfully! Launch the ranked match
            setIsRankedQueueActive(false);
            onJoinGame(GameMode.RANKED);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRankedWaitSec(0);
    }
    return () => clearInterval(timer);
  }, [isRankedQueueActive]);

  useEffect(() => {
    if (arenaTheme) {
      localStorage.setItem('snake_arena_theme', arenaTheme);
    }
  }, [arenaTheme]);

  // Auth logins
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onLogin(usernameInput.trim());
  };

  // Cosmetic Purchase Checkouts
  const buyItem = async (itemId: string, cost: number) => {
    if (!user || user.coins < cost) return;
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, cosmeticId: itemId }),
      });
      const data = await res.json();
      if (res.ok) {
        SoundManager.playShieldActivate();
        syncServerData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const equipItem = async (itemId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/shop/equip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, cosmeticId: itemId }),
      });
      if (res.ok) {
        SoundManager.playOrbEat();
        syncServerData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Clan Management
  const createClan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clanForm.name.trim() || !clanForm.tag.trim()) return;
    try {
      const res = await fetch('/api/clans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: clanForm.name.trim(),
          tag: clanForm.tag.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        SoundManager.playVictoryArpeggio();
        setClanForm({ name: '', tag: '' });
        syncServerData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const joinClan = async (clanId: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/clans/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, clanId }),
      });
      if (res.ok) {
        syncServerData();
      } else {
        const body = await res.json();
        alert(body.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const leaveClan = async () => {
    if (!user || !confirm('Are you sure you want to depart from your clan?')) return;
    try {
      const res = await fetch('/api/clans/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      if (res.ok) {
        syncServerData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  const sendClanChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !clanChatInput.trim() || !myClan) return;
    try {
      // Simulate chat locally or submit to backend
      const res = await fetch('/api/clans/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: clanChatInput.trim() }),
      });
      if (res.ok) {
        setClanChatInput('');
        syncServerData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Submit Friends
  const sendFriendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !friendForm.trim()) return;
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromId: user.id,
          toUsername: friendForm.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Friend request submitted successfully!');
        setFriendForm('');
        syncServerData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const acceptFriend = async (requestId: string) => {
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });
      if (res.ok) {
        syncServerData();
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Prompt Login Window if no logged-in context
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-[#e0e0e0] font-sans px-4 relative overflow-hidden">
        {/* Subtle glowing lines backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-[30%] left-[20%] w-[330px] h-[330px] rounded-full bg-[#00f2ff]/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-md w-full bg-[#111112] border border-white/10 rounded-none p-8 shadow-2xl antialiased z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.15)]">
              <Compass className="w-7 h-7 text-[#00f2ff] animate-spin-slow" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-[4px] text-white uppercase mb-1">
            SNAKE <span className="text-[#00f2ff]">LEGENDS</span>
          </h1>
          <p className="text-[#808080] text-2xs tracking-[2px] uppercase mb-8">
            AA Multidimensional Realtime Arena
          </p>

          <form onSubmit={handleAuthSubmit} className="space-y-6">
            <div className="text-left">
              <label className="block text-[10px] font-bold text-[#808080] uppercase tracking-[1px] mb-2">
                Glider Callsign / Username
              </label>
              <input
                type="text"
                maxLength={14}
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Enter pilot tag..."
                className="w-full bg-[#050505] border border-white/10 rounded-none px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] focus:ring-1 focus:ring-[#00f2ff] font-medium text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-cyber py-3.5 px-6 bg-[#00f2ff] hover:bg-[#00e1ec] active:bg-[#00c5ce] text-[#050505] font-black text-sm tracking-[2px] uppercase transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] cursor-pointer"
            >
              Enter Arena
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6 text-[10px] font-mono text-[#808080] uppercase tracking-[1px]">
            SYSTEM SYSTEM • ENCRYPTED SANDBOX PROTOCOLS
          </div>
        </div>
      </div>
    );
  }

  // Level Progression gauge percent
  const xpNeeded = user.level * 250;
  const xpPercent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden relative">
      {/* Background elegant grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* LEFT NAVIGATION PANEL */}
      <aside className="w-full md:w-80 bg-[#111112] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6 z-10">
        <div>
          {/* Logo Title Banner */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-[#00f2ff] animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-[4px] text-white uppercase">
                SNAKE <span className="text-[#00f2ff]">LEGENDS</span>
              </h2>
              <span className="text-3xs uppercase tracking-[1px] text-[#808080] font-mono block mt-0.5">
                Cyber Arena Gateway
              </span>
            </div>
          </div>

          {/* Quick Profile Overview Block */}
          <div className="bg-[#050505] border border-white/10 rounded-none p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-none bg-[#111112] border border-white/10 flex items-center justify-center font-bold text-sm text-[#00f2ff]">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-[#808080] tracking-wider font-mono uppercase">
                  {user.selectedTitle || 'Glider Specialist'}
                </div>
                <h4 className="font-bold text-sm tracking-wide text-white truncate">
                  {user.username}
                </h4>
              </div>
            </div>

            {/* Level and XP visual bar */}
            <div className="text-3xs text-[#808080] font-mono flex justify-between mb-1">
              <span>LEVEL {user.level}</span>
              <span>{user.xp} / {xpNeeded} XP</span>
            </div>
            <div className="w-full bg-[#111112] rounded-none h-1.5 overflow-hidden border border-white/5">
              <div
                className="bg-[#00f2ff] h-full shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            {/* Currencies stats indicators */}
            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-[#111112] py-2 rounded-none border border-white/5 text-2xs">
                <span className="block text-[#808080] tracking-wider text-[10px] uppercase mb-0.5">Credits</span>
                <span className="text-xs font-bold text-[#00f2ff] font-mono">🪙 {user.coins}</span>
              </div>
              <div className="bg-[#111112] py-2 rounded-none border border-white/5 text-2xs">
                <span className="block text-[#808080] tracking-wider text-[10px] uppercase mb-0.5">League Rank</span>
                <span className="text-[11px] font-mono font-bold text-white tracking-wide uppercase">{user.rank}</span>
              </div>
            </div>
          </div>

          {/* Nav Buttons Categories */}
          <nav className="space-y-1">
            {[
              { id: 'play', label: 'Combat Arena', icon: Play },
              { id: 'shop', label: 'Cosmetic Vault', icon: ShoppingBag },
              { id: 'clans', label: 'Alliances & Clans', icon: Shield },
              { id: 'friends', label: 'Wingmen Friends', icon: Users },
              { id: 'leaderboards', label: 'Holographic Scores', icon: Trophy },
              { id: 'achievements', label: 'Hall of Triumphs', icon: Award },
              { id: 'profile', label: 'Telemetry Diagnostics', icon: User },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = activeTab === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => {
                    SoundManager.playOrbEat();
                    setActiveTab(btn.id as Tab);
                  }}
                  className={`w-full flex items-center space-x-3 px-5 py-3.5 text-xs font-semibold uppercase tracking-[1px] transition-all border-y-0 border-r-0 ${
                    isSelected
                      ? 'bg-[rgba(0,242,255,0.05)] border-l-3 border-l-[#00f2ff] text-white rounded-none'
                      : 'border-l-3 border-l-transparent text-[#808080] hover:text-[#e0e0e0] hover:bg-[rgba(255,255,255,0.03)] rounded-none'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Outer footer toggle capabilities */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onToggleSound}
            className="p-2 ml-2 bg-[#050505] border border-white/10 hover:bg-white/5 text-[#808080] hover:text-white transition-all rounded-none"
            title="Toggle Audio Feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00f2ff]" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          </button>

          <span className="text-3xs uppercase text-[#808080] tracking-widest font-mono">
            SECURE FREQUENCY LIVE
          </span>
        </div>
      </aside>

      {/* MAIN DATA CENTER */}
      <main className="flex-1 bg-[#050505] flex flex-col p-6 overflow-y-auto z-10 md:p-8">
        {/* ======================================= */}
        {/* TAB PLAY: THE COMBAT ARENA DECKS */}
        {/* ======================================= */}
        {activeTab === 'play' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            {/* Header Decks & Custom Arena Backdrop Selectors (Phase 2) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                  COCKPIT COMMAND STATION
                </h2>
                <p className="text-gray-400 text-xs">
                  Review tactical matrices, perfect maneuvers in the academy, or deploy to standard sectors.
                </p>
              </div>

              {/* Arena Theme Selector (Phase 2 Visual upgrade styling config) */}
              <div className="flex items-center space-x-2 bg-[#111112] border border-white/10 px-3 py-1.5 rounded-none font-mono text-2xs">
                <span className="text-gray-400 uppercase">Arena Theme:</span>
                <select
                  value={arenaTheme}
                  onChange={(e) => {
                    setArenaTheme(e.target.value);
                    SoundManager.playOrbEat();
                  }}
                  className="bg-transparent text-cyan-400 font-bold focus:outline-none uppercase cursor-pointer"
                >
                  <option value="cyber" className="bg-[#111112]">Cyber City Grid</option>
                  <option value="space" className="bg-[#111112]">Space Station</option>
                  <option value="frozen" className="bg-[#111112]">Frozen peaks</option>
                  <option value="lava" className="bg-[#111112]">Lava rift</option>
                  <option value="galaxy" className="bg-[#111112]">Galaxy Arena</option>
                </select>
              </div>
            </div>

            {/* Custom Multi-tabs (Phases 3, 5, 6, 7, 9, 10) */}
            <div className="flex flex-wrap gap-1 border-b border-white/10 pb-px">
              {[
                { id: 'lobbies', label: 'Combat Sectors' },
                { id: 'training', label: 'Training Academy' },
                { id: 'wars', label: 'Conquest (Clan Wars)' },
                { id: 'replays', label: 'Replay Theater' },
                { id: 'quests', label: 'Pilot Assignments' },
              ].map((sub) => {
                const isSel = activePlaySubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActivePlaySubTab(sub.id as any);
                      SoundManager.playOrbEat();
                    }}
                    className={`px-4 py-2.5 text-3xs font-extrabold uppercase tracking-widest border-b-2 transition-all ${
                      isSel
                        ? 'border-cyan-400 bg-cyan-400/5 text-white'
                        : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* Sub-tab 1: MATCHING LOBBIES & RANKED QUEUES (PHASE 3) */}
            {activePlaySubTab === 'lobbies' && (
              <div className="space-y-6">
                {/* Customizer Skin Pre-views Card */}
                <div className="bg-gradient-to-r from-[#070b1a] to-[#040612] border border-[#1b2559] p-5 rounded-none flex items-center flex-col sm:flex-row justify-between gap-6">
                  <div className="space-y-3">
                    <span className="text-3xs font-semibold px-2.5 py-1 bg-cyan-950 text-cyan-400 rounded-none border border-cyan-500/20 uppercase tracking-widest">
                      Visual Skin Preview Config
                    </span>
                    <h3 className="text-lg font-bold">Equipped Flight Configurations</h3>
                    <ul className="text-2xs text-gray-400 space-y-1 font-mono">
                      <li>🟢 ACTIVE SKIN: <b className="text-white uppercase">{user.selectedSkin || 'default'}</b></li>
                      <li>🟣 ACTIVE TRAIL: <b className="text-white uppercase">{user.selectedTrail || 'none'}</b></li>
                      <li>🎗️ CHOSEN CALLSIGN TITLE: <b className="text-white uppercase font-sans">[{user.selectedTitle}]</b></li>
                    </ul>
                  </div>

                  {/* Dynamic Canvas Simulation Preview */}
                  <div className="relative w-48 h-24 border border-[#1e2e69] bg-[#03050f] overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#010207] opacity-60 grid bg-[linear-gradient(rgba(14,20,53,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(14,20,53,0.3)_1px,transparent_1px)] bg-[size:10px_10px]" />
                    <div className="flex space-x-1 justify-center relative z-1">
                      {[1, 2, 3, 4, 5].map((idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full shadow-md animate-pulse"
                          style={{
                            backgroundColor:
                              user.selectedSkin === 'neon_red' ? '#f43f5e' :
                              user.selectedSkin === 'fire' ? '#ea580c' :
                              user.selectedSkin === 'ice' ? '#06b6d4' :
                              user.selectedSkin === 'galaxy' ? '#a855f7' :
                              user.selectedSkin === 'shadow' ? '#1f2937' :
                              user.selectedSkin === 'gold' ? '#eab308' :
                              user.selectedSkin === 'rainbow' ? '#ec4899' : '#3b82f6',
                            boxShadow: `0 0 10px ${user.selectedSkin === 'neon_red' ? '#f43f5e' : '#3b82f6'}`,
                            transform: `scale(${1.0 - idx * 0.1})`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Matchmaking active search state (PHASE 3 RANKED QUEUE LOADING STATE) */}
                {isRankedQueueActive ? (
                  <div className="bg-[#111112] border border-[#00f2ff]/40 p-10 text-center space-y-4 rounded-none animate-pulse">
                    <div className="w-12 h-12 border-t-2 border-r-2 border-b-2 border-l border-t-cyan-400 border-r-cyan-400 border-b-cyan-400 border-l-transparent rounded-full animate-spin mx-auto" />
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#00f2ff]">
                      Competitive Matchmaker Engaged
                    </h3>
                    <p className="text-2xs text-gray-400 font-mono">
                      Querying regional space grids for pilot candidates... Search holds: <span className="text-white font-bold">{rankedWaitSec}s</span>
                    </p>
                    <div className="text-3xs uppercase tracking-widest font-mono text-indigo-400">
                      Rank Bracket Tier Group: {user.rank} ({user.rankPoints} RP)
                    </div>
                    <button
                      onClick={() => setIsRankedQueueActive(false)}
                      className="py-1.5 px-4 bg-red-500/10 hover:bg-red-500/25 text-red-500 font-mono text-3xs uppercase border border-red-500/30 font-bold transition-all"
                    >
                      Abort Search
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Casual Lobby Card */}
                    <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-cyan-400/40 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-3xs px-2 py-0.5 font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-400/20 uppercase">
                            Infinite Grid
                          </span>
                          <span className="text-3xs text-gray-500">Bots: 12</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">Casual Arena</h4>
                        <p className="text-2xs text-gray-400 leading-normal">
                          Casual sandbox zone. Study slither physics, harvest stellar sparks, practice coils speed and dash elements.
                        </p>
                      </div>
                      <button
                        onClick={() => onJoinGame(GameMode.CASUAL)}
                        className="w-full mt-4 py-2.5 bg-cyan-400/5 hover:bg-cyan-400 hover:text-black border border-cyan-400/20 text-white font-bold text-2xs uppercase tracking-widest transition-all"
                      >
                        Launch Sandbox
                      </button>
                    </div>

                    {/* Ranked Match Lobby Card */}
                    <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-3xs px-2 py-0.5 font-mono text-yellow-400 bg-yellow-950/20 border border-yellow-400/20 uppercase">
                            Ranked League
                          </span>
                          <span className="text-3xs text-[#00f2ff] uppercase">{user.rank}</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">Competitive Combat</h4>
                        <p className="text-2xs text-gray-400 leading-normal">
                          Authoritative physics, anti-cheat validation active. Accumulate points per kill; promotion matches unlocked at thresholds!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsRankedQueueActive(true);
                          setRankedWaitSec(0);
                        }}
                        className="w-full mt-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-2xs uppercase tracking-widest transition-all"
                      >
                        Find Competitive Match
                      </button>
                    </div>

                    {/* Battle Royale Card */}
                    <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-red-400/40 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-3xs px-2 py-0.5 font-mono text-red-400 bg-red-950/20 border border-red-400/20 uppercase">
                            Storm Shrink
                          </span>
                          <span className="text-3xs text-yellow-400">🪙 500 Coins POT</span>
                        </div>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mb-2">Apex Survival</h4>
                        <p className="text-2xs text-gray-400 leading-normal">
                          Red wall of energy shrinks inwards every 8 seconds. Evade storm zones, block players, claim final chicken dinner!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsBrQueueActive(true);
                          setTimeout(() => {
                            onJoinGame(GameMode.BATTLE_ROYALE);
                            setIsBrQueueActive(false);
                          }, 1500);
                        }}
                        disabled={isBrQueueActive}
                        className="w-full mt-4 py-2.5 bg-red-500/10 hover:bg-red-500 hover:text-black border border-red-500/20 text-white font-bold text-2xs uppercase tracking-widest transition-all disabled:opacity-50"
                      >
                        {isBrQueueActive ? 'QUEUING STORM PORTAL...' : 'Launch Battle Royale'}
                      </button>
                    </div>

                    {/* Private Hangar Card */}
                    <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-purple-400/40 transition-all">
                      <div>
                        <span className="text-3xs font-mono text-purple-400 uppercase bg-purple-950/20 px-2 py-0.5 border border-purple-400/20">
                          Custom Invite Gateway
                        </span>
                        <h4 className="font-extrabold text-white text-sm uppercase tracking-wider mt-2 mb-2">Custom Duel Hangars</h4>
                        <p className="text-2xs text-gray-400 leading-normal mb-3">
                          Spin up locked private flight channels. Input a friend's room key to authenticate together.
                        </p>
                        <input
                          type="text"
                          value={roomCodeInput}
                          onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                          placeholder="INPUT LOCKED INGRESS KEY CODE..."
                          className="w-full bg-[#050505] border border-white/10 rounded-none px-3 py-2 text-2xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-400 uppercase font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={() => {
                            const code = `SNAKE_${Math.floor(100 + Math.random() * 900)}`;
                            onJoinGame(GameMode.PRIVATE, code);
                          }}
                          className="py-2 px-3 bg-purple-500/10 border border-purple-500/20 text-white font-bold text-3xs uppercase tracking-widest hover:bg-purple-500/20 transition-all"
                        >
                          BUILD KEY
                        </button>
                        <button
                          onClick={() => {
                            if (!roomCodeInput.trim()) return alert('Please enter room code first');
                            onJoinGame(GameMode.PRIVATE, roomCodeInput.trim());
                          }}
                          className="py-2 px-3 bg-purple-500 text-black font-extrabold text-3xs uppercase tracking-widest hover:bg-purple-400 transition-all font-sans"
                        >
                          CONNECT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 2: TRAINING ACADEMY MISSION DECK (PHASE 9) */}
            {activePlaySubTab === 'training' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400">Practice Academy Courses</h3>
                  <p className="text-gray-400 text-xs">Verify kinematic controls and earn real credits!</p>
                </div>

                {academySuccessData && (
                  <div className="bg-emerald-950/30 border border-emerald-500 p-4 text-center rounded-none relative animate-pulse">
                    <span className="absolute top-2 right-2 text-3xs font-mono text-emerald-400 uppercase">TELEMETRY RECEIVED</span>
                    <h4 className="text-base font-black text-white uppercase mb-1">COURSE SOLVED SUCCESSFULLY!</h4>
                    <p className="text-xs text-gray-300 mb-2">Practice runs on "{academySuccessData.name}" verified by simulator server.</p>
                    <div className="flex justify-center space-x-6 text-xs font-mono">
                      <span className="text-yellow-400">🪙 +{academySuccessData.coins} Coins Credited</span>
                      <span className="text-cyan-400">🧬 +{academySuccessData.xp} XP Granted</span>
                    </div>
                    <button
                      onClick={() => setAcademySuccessData(null)}
                      className="mt-4 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase tracking-wider transition-all"
                    >
                      Clear Certificate
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trainingCourses.map((course) => (
                    <div key={course.id} className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-yellow-400/30 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            course.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' :
                            course.difficulty === 'Medium' ? 'bg-indigo-950 text-indigo-400 border border-indigo-500/20' :
                            'bg-red-950 text-red-400 border border-red-500/20'
                          }`}>
                            Difficulty: {course.difficulty}
                          </span>
                          <span className="text-[10px] text-yellow-400 font-mono">🪙 {course.rewardCoins} / 🧪 {course.rewardXp}</span>
                        </div>
                        <h4 className="font-extrabold text-sm uppercase tracking-wide text-white mb-2">{course.name}</h4>
                        <p className="text-2xs text-[#808080] leading-normal">{course.description}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const res = await fetch('/api/training/complete', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ userId: user.id, courseId: course.id }),
                            });
                            if (res.ok) {
                              SoundManager.playVictoryArpeggio();
                              setAcademySuccessData({ xp: course.rewardXp, coins: course.rewardCoins, name: course.name });
                              syncServerData();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="w-full mt-4 py-2 bg-[#1b1c1d] hover:bg-yellow-400 hover:text-black border border-white/5 font-extrabold text-2xs uppercase tracking-widest transition-all"
                      >
                        Simulate Academy Run
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 3: CLAN CONQUEST TERRITORIAL SHIELDS (PHASE 7) */}
            {activePlaySubTab === 'wars' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-indigo-400">Strategic Conquest Sectors</h3>
                  <p className="text-gray-400 text-xs">Clans align, invest battle energies, and secure area controls.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {clanTerritories.map((t) => (
                    <div key={t.id} className="bg-[#111112] border border-indigo-500/20 p-5 rounded-none flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-3xs uppercase font-mono bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20">
                            🛡️ SHIELD: {t.shieldPower}%
                          </span>
                          <span className="text-3xs font-mono text-gray-500">INVESTED: {t.warPointsInvested}</span>
                        </div>
                        <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-2">{t.name}</h4>
                        <p className="text-2xs text-[#808080] mb-4 leading-normal">{t.description}</p>
                        <div className="bg-[#050505] p-2 border border-white/5 text-center mb-4">
                          <span className="block text-3xs text-gray-500 uppercase font-mono">Current Allied Owner</span>
                          <span className="text-xs font-black text-cyan-400 font-mono tracking-widest uppercase">
                            {t.controllingClanTag === 'FREE' ? 'UNCLAIMED FIELD' : `[${t.controllingClanTag}] UNION`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={async () => {
                          if (!user.clanId) return alert('Commission or Join a Clan first to participate in Territory Wars!');
                          try {
                            const res = await fetch('/api/clan-wars/invest', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                clanId: user.clanId,
                                clanTag: myClan?.tag || 'SQR',
                                territoryId: t.id,
                                amount: 200,
                              }),
                            });
                            if (res.ok) {
                              SoundManager.playShieldActivate();
                              syncServerData();
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500 hover:text-black border border-indigo-500/30 text-white font-bold text-2xs uppercase tracking-wider transition-all"
                      >
                        Invest 200 War BF Points
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 4: REPLAY THEATER ARCHIVE SCREEN (PHASE 6) */}
            {activePlaySubTab === 'replays' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-purple-400">Glider Film Archive Theatre</h3>
                  <p className="text-gray-400 text-xs text-mono text-3xs">Recorded flight records available.</p>
                </div>

                {cinemaReplay && (
                  <div className="bg-[#03050f] border-2 border-purple-500 p-6 rounded-none relative">
                    <button
                      onClick={() => setCinemaReplay(null)}
                      className="absolute top-2 right-2 px-2.5 py-1 bg-red-500 hover:bg-red-400 text-black font-extrabold text-3xs uppercase tracking-wider"
                    >
                      Close Projector
                    </button>
                    <span className="text-3xs uppercase tracking-widest bg-purple-950 text-purple-400 px-2 py-1 rounded font-mono font-bold">
                      📽️ SYSTEM RETRIEVAL ACTIVE FILMING
                    </span>
                    <h4 className="text-base font-black text-white uppercase mt-3 mb-1">REPLICATING GAME: {cinemaReplay.id}</h4>
                    <p className="text-xs text-gray-300 font-mono">Date: {cinemaReplay.date} | Mode: {cinemaReplay.mode} | Winner: [{cinemaReplay.winnerName}]</p>
                    
                    {/* Simulated visual timeline ticker slithering */}
                    <div className="mt-6 h-16 bg-[#090b1e] border border-purple-500/30 rounded flex items-center justify-around overflow-hidden relative">
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(141,53,200,0.15)_1px,transparent_1px)] bg-[size:10px_10px]" />
                      <div className="flex space-x-1.5 animate-pulse relative z-1 font-mono text-2xs text-[#00f2ff]">
                        <span>🟢 [0,0] slithers</span>
                        <span>➡️ [45, 12] speed boost</span>
                        <span>💥 kill trigger AstroSlinker</span>
                        <span>🏁 Match Ends winner {cinemaReplay.winnerName}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {[
                    { id: 'rep_001', date: '2026-06-04 14:15', mode: GameMode.CASUAL, winnerName: 'AstroGlider', myScore: 180, myKills: 4 },
                    { id: 'rep_002', date: '2026-06-03 23:40', mode: GameMode.BATTLE_ROYALE, winnerName: 'SpaceDraco', myScore: 310, myKills: 9 },
                    { id: 'rep_003', date: '2026-06-01 09:12', mode: GameMode.RANKED, winnerName: user.username, myScore: 450, myKills: 12 },
                  ].map((film) => (
                    <div key={film.id} className="bg-[#111112] p-4 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <span className="text-3xs font-mono text-purple-400 bg-purple-950/20 px-2.5 py-0.5 rounded border border-purple-500/20 uppercase">
                          MATCH FILM: {film.id}
                        </span>
                        <h4 className="font-bold text-white text-xs mt-1.5">WINNER PILOT: {film.winnerName}</h4>
                        <div className="text-3xs text-gray-500 font-mono mt-0.5">Logged: {film.date} | Score: {film.myScore} | Eliminations: {film.myKills}</div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            SoundManager.playShieldActivate();
                            setCinemaReplay(film);
                          }}
                          className="px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500 hover:text-black border border-purple-500/30 text-white font-mono text-3xs font-extrabold uppercase transition-all"
                        >
                          Screen Replay
                        </button>
                        <button
                          onClick={() => alert(`Downloaded snk frame configuration for ${film.id}`)}
                          className="px-2 py-1.5 bg-white/5 hover:bg-white/15 text-gray-300 font-mono text-3xs uppercase"
                        >
                          DOWNLOAD SNK
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tab 5: PILOT DAILY & WEEKLY QUEST BOARD (PHASE 10) */}
            {activePlaySubTab === 'quests' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-yellow-400">Core Quest Operations</h3>
                  <p className="text-gray-400 text-xs">Complete daily and weekly assignments to load coin reserves!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Board */}
                  <div className="bg-[#111112] border border-white/10 p-5 space-y-4 rounded-none">
                    <h4 className="text-xs font-black uppercase text-yellow-500 border-b border-white/5 pb-2">Daily Quests Board</h4>
                    {questsData ? questsData.dailyQuests.map((q) => (
                      <div key={q.id} className="space-y-2 bg-[#050505] p-3 border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{q.name}</span>
                          <span className="text-3xs font-mono text-yellow-400">🪙 +{q.coinsReward} / 🧪 +{q.xpReward}</span>
                        </div>
                        <p className="text-3xs text-gray-400 font-mono">{q.desc}</p>
                        <div className="w-full bg-[#111112] h-1.5 overflow-hidden rounded border border-white/5">
                          <div
                            className="bg-yellow-400 h-full"
                            style={{ width: `${Math.min(100, Math.floor((q.current / q.target) * 100))}%` }}
                          />
                        </div>
                        <div className="text-right text-[9px] text-gray-500 font-mono">Progress: {q.current} / {q.target}</div>
                      </div>
                    )) : (
                      <div className="text-center text-3xs text-gray-500 font-mono">Quests matrices initializing...</div>
                    )}
                  </div>

                  {/* Weekly Board */}
                  <div className="bg-[#111112] border border-white/10 p-5 space-y-4 rounded-none">
                    <h4 className="text-xs font-black uppercase text-[#00f2ff] border-b border-white/5 pb-2">Weekly Challenges</h4>
                    {questsData ? questsData.weeklyChallenges.map((qc) => (
                      <div key={qc.id} className="space-y-2 bg-[#050505] p-3 border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-white">{qc.name}</span>
                          <span className="text-3xs font-mono text-cyan-400">🪙 +{qc.coinsReward} / 🧪 +{qc.xpReward}</span>
                        </div>
                        <p className="text-3xs text-gray-400 font-mono">{qc.desc}</p>
                        <div className="w-full bg-[#111112] h-1.5 overflow-hidden rounded border border-white/5">
                          <div
                            className="bg-cyan-400 h-full"
                            style={{ width: `${Math.min(100, Math.floor((qc.current / qc.target) * 100))}%` }}
                          />
                        </div>
                        <div className="text-right text-[9px] text-gray-500 font-mono">Progress: {qc.current} / {qc.target}</div>
                      </div>
                    )) : (
                      <div className="text-center text-3xs text-gray-500 font-mono">Quests matrices initializing...</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB SHOP: COSMETIC VAULT */}
        {/* ======================================= */}
        {activeTab === 'shop' && (
          <div className="space-y-6 max-w-5xl animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-yellow-400 mb-1">
                  COSMETIC SYSTEM WEAPONRY
                </h2>
                <p className="text-gray-400 text-xs">
                  Aquire elite skins, glowing exhaust trails, and custom pilot titles below.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-yellow-400 font-mono font-bold text-sm">
                🪙 {user.coins} COINS
              </div>
            </div>

            {/* Skins Lists Grid */}
            <h3 className="text-sm font-extrabold text-cyan-400 tracking-wider uppercase border-b border-[#1c223c] pb-2">
              Neon Skin Converters
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {shopItems
                .filter((item) => item.type === 'skin')
                .map((item) => {
                  const owned = user.ownedCosmetics.includes(item.id);
                  const equipped =
                    (item.value === user.selectedSkin) ||
                    (item.value === 'neon_blue' && user.selectedSkin === 'neon_blue');

                  return (
                    <div
                      key={item.id}
                      className="bg-[#070918] border border-[#17214d] rounded-xl p-4 flex flex-col justify-between hover:border-[#2a3a78] transition-all text-center"
                    >
                      <div className="mb-4">
                        <span
                          className={`text-3xs uppercase tracking-widest font-bold px-2 py-0.5 rounded font-mono ${
                            item.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20' :
                            item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                            item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/20'
                          }`}
                        >
                          {item.rarity}
                        </span>
                        <h4 className="font-extrabold text-[#e2e8f0] text-sm tracking-wide mt-3 truncate">
                          {item.name}
                        </h4>
                        <div className="w-10 h-10 rounded-full mx-auto my-3"
                             style={{
                               backgroundColor:
                                 item.value === 'neon_red' ? '#f43f5e' :
                                 item.value === 'fire' ? '#ea580c' :
                                 item.value === 'ice' ? '#06b6d4' :
                                 item.value === 'galaxy' ? '#a855f7' :
                                 item.value === 'shadow' ? '#1f2937' :
                                 item.value === 'gold' ? '#eab308' :
                                 item.value === 'rainbow' ? '#ec4899' : '#3b82f6',
                               boxShadow: `0 0 12px ${item.value === 'neon_red' ? '#f43f5e' : '#3b82f6'}`
                             }}
                        />
                      </div>

                      {equipped ? (
                        <span className="block w-full py-2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-2xs font-bold uppercase tracking-widest rounded-lg">
                          EQUIPPED
                        </span>
                      ) : owned ? (
                        <button
                          onClick={() => equipItem(item.id)}
                          className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 text-2xs font-bold uppercase tracking-widest rounded-lg transition-all"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(item.id, item.cost)}
                          disabled={user.coins < item.cost}
                          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-2xs font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                        >
                          🪙 {item.cost} COINS
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Trails Listings */}
            <h3 className="text-sm font-extrabold text-purple-400 tracking-wider uppercase border-b border-[#1c223c] pb-2 pt-4">
              Spark Trails Engines
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {shopItems
                .filter((item) => item.type === 'trail')
                .map((item) => {
                  const owned = user.ownedCosmetics.includes(item.id);
                  const equipped = item.value === user.selectedTrail;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#070918] border border-[#17214d] rounded-xl p-4 flex flex-col justify-between text-center"
                    >
                      <div>
                        <span className="text-3xs tracking-widest uppercase font-mono px-2 py-0.5 bg-purple-500/15 text-purple-400 rounded">
                          {item.rarity}
                        </span>
                        <h4 className="font-extrabold text-sm tracking-wide mt-2 mb-2">
                          {item.name}
                        </h4>
                      </div>

                      {equipped ? (
                        <span className="py-2 bg-emerald-950 text-emerald-400 text-2xs font-bold rounded-lg border border-emerald-500/20 tracking-wider">
                          ACTIVE ENGINE
                        </span>
                      ) : owned ? (
                        <button
                          onClick={() => equipItem(item.id)}
                          className="py-2 bg-[#091533] hover:bg-[#12234f] text-cyan-400 border border-cyan-500/20 text-2xs font-extrabold rounded-lg tracking-wider transition-all"
                        >
                          ACTIVATE
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(item.id, item.cost)}
                          disabled={user.coins < item.cost}
                          className="py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-2xs font-extrabold rounded-lg tracking-wider transition-all disabled:opacity-50"
                        >
                          🪙 {item.cost} COINS
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB CLANS: ALLIANCES & ORGANISATIONS */}
        {/* ======================================= */}
        {activeTab === 'clans' && (
          <div className="space-y-6 max-w-5xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                ALLIANCES & TACTICAL CLANS
              </h2>
              <p className="text-gray-400 text-xs">
                Build an alliance or register and chat within secure clan channels.
              </p>
            </div>

            {myClan ? (
              /* MY ACTIVE CLAN PANEL */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-[#080b18] border border-cyan-500/30 p-5 rounded-xl text-center space-y-3 shadow-inner shadow-cyan-500/5">
                    <span className="text-3xs uppercase tracking-widest px-2.5 py-1 bg-cyan-950 text-cyan-400 rounded-full font-mono font-bold">
                      ⚔️ CLAN STABLE ACTIVE
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-100">
                      {myClan.name} <span className="text-cyan-400 font-mono">[{myClan.tag}]</span>
                    </h3>
                    <p className="text-2xs text-[#707bb0] font-mono leading-relaxed">
                      Established by leader <b className="text-[#aeb6da]">{myClan.leaderName}</b>. Total points: <b>{myClan.rankPoints}</b>.
                    </p>

                    <button
                      onClick={leaveClan}
                      className="w-full mt-4 py-2 rounded bg-red-500/10 hover:bg-red-500/25 text-red-400 font-bold border border-red-500/20 text-2xs uppercase tracking-wider transition-all"
                    >
                      Abandon Alliance
                    </button>
                  </div>

                  {/* Members list */}
                  <div className="bg-[#080b18] border border-[#17214a] p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-[#1b2559] pb-2 mb-3">
                      Lobby Flight Manifest ({myClan.members.length})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myClan.members.map((m) => (
                        <div key={m.userId} className="flex justify-between items-center text-xs">
                          <span className="font-bold">{m.username}</span>
                          <span className="text-2xs font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/10">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Clan Communications chat log */}
                <div className="lg:col-span-2 bg-[#060815] border border-[#16214f] rounded-xl flex flex-col justify-between h-[450px]">
                  <div className="p-4 border-b border-[#141b41]">
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Secure Decrypted Coms Frequency
                    </h4>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                    {myClan.chat && myClan.chat.map((msg, index) => (
                      <div key={index} className="bg-[#0b0f2a] p-2.5 rounded-lg border border-[#1b255c]/25">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-cyan-400">{msg.username}</span>
                          <span className="text-3xs text-gray-500 font-sans">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-300 break-words font-sans text-xs">{msg.message}</p>
                      </div>
                    ))}
                    {(!myClan.chat || myClan.chat.length === 0) && (
                      <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                        Coms pipeline silent...
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendClanChat} className="p-3 border-t border-[#141b41] flex gap-2">
                    <input
                      type="text"
                      maxLength={120}
                      value={clanChatInput}
                      onChange={(e) => setClanChatInput(e.target.value)}
                      placeholder="BROADCAST ENCRYPTED CLAN PACKETS..."
                      className="flex-1 bg-[#03040c] border border-[#1c295c] rounded px-3 py-2 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* LAN REGISTRY DESK */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Form to establish a clan */}
                <div className="md:col-span-1 bg-[#080b18] border border-[#17224e] p-5 rounded-xl h-fit space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2">
                    Commission New Corporation
                  </h3>
                  <p className="text-2xs text-[#7c89ba] leading-normal font-mono">
                    Establishing a clan assigns you as Supreme Commander and cost 🪙 100 Coins. Join with brothers to conquer leaderboards!
                  </p>

                  <form onSubmit={createClan} className="space-y-4">
                    <div>
                      <label className="block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5">
                        Strategic Corporation Name
                      </label>
                      <input
                        type="text"
                        maxLength={18}
                        value={clanForm.name}
                        onChange={(e) => setClanForm({ ...clanForm, name: e.target.value })}
                        placeholder="ENTER CORPORATION NAME..."
                        className="w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-2xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5">
                        Identification Tag (Max 4 letters)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={clanForm.tag}
                        onChange={(e) => setClanForm({ ...clanForm, tag: e.target.value })}
                        placeholder="TAG..."
                        className="w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-2xs uppercase font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={user.coins < 100}
                      className="w-full py-2.5 rounded bg-yellow-400 text-black hover:bg-yellow-300 font-extrabold text-2xs uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Established Coin (100)
                    </button>
                  </form>
                </div>

                {/* List of active coalitions */}
                <div className="md:col-span-2 bg-[#080b18] border border-[#17224e] p-5 rounded-xl space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2">
                    Holographic Coalition Registry
                  </h3>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                    {clansList && clansList.map((clan) => (
                      <div
                        key={clan.id}
                        className="bg-[#0b0f2b] p-4 rounded-lg border border-[#18245a] flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-bold text-sm">
                            {clan.name} <span className="text-indigo-400 font-mono">[{clan.tag}]</span>
                          </h4>
                          <span className="text-2xs text-gray-400 font-mono">
                            Commanded by {clan.leaderName} • {clan.members?.length || 1} Pilots • RP Level: {clan.rankPoints}
                          </span>
                        </div>

                        <button
                          onClick={() => joinClan(clan.id)}
                          className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/25 text-indigo-400 font-bold text-2xs uppercase rounded"
                        >
                          Alliance
                        </button>
                      </div>
                    ))}
                    {(!clansList || clansList.length === 0) && (
                      <div className="text-center py-12 text-gray-500 text-xs font-mono">
                        No active alliances detected in database archives...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB FRIENDS: WINGMEN PORTALS */}
        {/* ======================================= */}
        {activeTab === 'friends' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                WINGMEN SYSTEMS DIRECTORY
              </h2>
              <p className="text-gray-400 text-xs">
                Maintain contact with fellow pilots. Send friendship telemetry requests below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                {/* Submit Friend Request Form */}
                <div className="bg-[#080b18] border border-[#17224e] p-5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider border-b border-[#1a2559] pb-2">
                    Submit Friend Request
                  </h4>
                  <form onSubmit={sendFriendRequest} className="space-y-3">
                    <input
                      type="text"
                      maxLength={14}
                      value={friendForm}
                      onChange={(e) => setFriendForm(e.target.value)}
                      placeholder="CALLSIGN TAG..."
                      className="w-full bg-[#03040c] border border-[#202952] rounded px-3 py-2 text-2xs placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-2xs uppercase rounded transition-all"
                    >
                      Acknowledge Telemetry
                    </button>
                  </form>
                </div>

                {/* Pending Requests alerts list */}
                <div className="bg-[#080b18] border border-[#17224e] p-5 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider border-b border-[#1a2559] pb-2 mb-3">
                    Inbound Requests ({friendRequests.length})
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {friendRequests.map((req) => (
                      <div key={req.id} className="flex justify-between items-center text-xs bg-[#0b0f2a] p-2 rounded-lg border border-[#161d44]">
                        <span className="font-bold truncate max-w-24">{req.fromName}</span>
                        <button
                          onClick={() => acceptFriend(req.id)}
                          className="px-2.5 py-1 bg-emerald-500 text-black font-extrabold text-3xs rounded hover:bg-emerald-400 transition-all uppercase"
                        >
                          Bridge
                        </button>
                      </div>
                    ))}
                    {friendRequests.length === 0 && (
                      <div className="text-center py-4 text-gray-500 font-mono text-3xs">
                        No pending transits...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Friends Catalog Column */}
              <div className="md:col-span-2 bg-[#080b18] border border-[#17224e] p-5 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider border-b border-[#1a2559] pb-2 mb-4">
                  Pilot Wingmen Roster
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto">
                  {friendsList && friendsList.map((friend) => (
                    <div
                      key={friend.friendId}
                      className="bg-[#0b1029] p-3.5 rounded-lg border border-[#1a2557] flex justify-between items-center"
                    >
                      <div>
                        <h4 className="font-bold text-xs truncate max-w-32">{friend.username}</h4>
                        <span className="block text-3xs text-[#707bb0] font-mono leading-relaxed mt-0.5">
                          Lvl {friend.level} • {friend.rank}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            friend.status === 'online' ? 'bg-emerald-400 animate-pulse shadow-glow' : 'bg-gray-600'
                          }`}
                          title={friend.status}
                        />
                        <span className="text-3s font-mono uppercase text-gray-400 text-3xs">
                          {friend.status === 'online' ? 'ONLINE' : 'DEPAR'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!friendsList || friendsList.length === 0) && (
                    <div className="col-span-2 text-center py-12 text-gray-500 text-xs font-mono">
                      No wingmen connected in register. Add guest accounts to duel.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB LEADERBOARDS: HOLOGRAPHIC SCORES */}
        {/* ======================================= */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6 max-w-5xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                GALACTIC SCORE COCKPITS
              </h2>
              <p className="text-gray-400 text-xs">
                Review verified server-wide high scorers, elite slither controllers, and top performing corporations.
              </p>
            </div>

            {leaderboards ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Global Pilots */}
                <div className="bg-[#080b18] border border-[#16214f] p-5 rounded-xl space-y-4">
                  <h4 className="text-sm font-extrabold text-cyan-400 uppercase tracking-widest border-b border-[#1a2559] pb-2">
                    🎖️ Top Registered Pilots (Level)
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
                    {leaderboards.global?.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center py-1 border-b border-[#141b41]/60">
                        <div className="flex items-center space-x-3">
                          <span className="font-extrabold text-[#707bb0]">{idx + 1}.</span>
                          <span className="font-bold font-sans text-slate-100 truncate max-w-36">{p.username}</span>
                        </div>
                        <span className="text-2xs text-[#828fbd]">Level {p.level} ({p.rank})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Record Scores */}
                <div className="bg-[#080b18] border border-[#16214f] p-5 rounded-xl space-y-4">
                  <h4 className="text-sm font-extrabold text-yellow-400 uppercase tracking-widest border-b border-[#1a2559] pb-2">
                    💎 Extreme High Scores Elite
                  </h4>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto font-mono text-xs">
                    {leaderboards.scores?.map((p, idx) => (
                      <div key={p.id} className="flex justify-between items-center py-1 border-b border-[#141b41]/60">
                        <div className="flex items-center space-x-3 font-sans">
                          <span className="font-extrabold text-yellow-500">{idx + 1}.</span>
                          <span className="font-bold text-slate-100">{p.username}</span>
                        </div>
                        <span className="text-[#eaeefc] font-black">{p.stats.highestScore || 10} m/s</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Clan Wars */}
                <div className="bg-[#080b18] border border-[#16214f] p-5 rounded-xl space-y-4 md:col-span-2">
                  <h4 className="text-sm font-extrabold text-indigo-400 uppercase tracking-widest border-b border-[#1a2559] pb-2">
                    🛡️ Supreme Alliances Wars (RP Accumulation)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[250px] overflow-y-auto font-mono text-xs">
                    {leaderboards.clans?.map((clan, idx) => (
                      <div key={clan.id} className="bg-[#07091a] border border-[#17214a] p-3 rounded-lg flex justify-between items-center">
                        <div className="flex items-center space-x-2.5 font-sans">
                          <span className="font-extrabold font-mono text-[#7482be]">{idx + 1}.</span>
                          <h4 className="font-bold text-slate-200">
                            {clan.name} <span className="text-cyan-400 font-mono">[{clan.tag}]</span>
                          </h4>
                        </div>
                        <span className="font-extrabold text-[#7ee1fd]">{clan.rankPoints} RP</span>
                      </div>
                    ))}
                    {(!leaderboards.clans || leaderboards.clans.length === 0) && (
                      <div className="col-span-2 text-center py-12 text-gray-600">
                        No tactical guilds registered.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 font-mono">
                Calculating interstellar score systems...
              </div>
            )}
          </div>
        )}

        {/* ======================================= */}
        {/* TAB ACHIEVEMENTS: HALL OF THE TRIUMPHS */}
        {/* ======================================= */}
        {activeTab === 'achievements' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-amber-500 mb-1">
                HALL OF INTERSTELLAR TRIUMPHS
              </h2>
              <p className="text-gray-400 text-xs">
                Obtain galactic accolades through matches, kills, and continuous collection to claim rewards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((ach) => {
                const unlocked = ach.progressCurrent >= ach.progressMax;
                const ratioPercent = Math.min(100, Math.floor((ach.progressCurrent / ach.progressMax) * 100));

                return (
                  <div
                    key={ach.id}
                    className={`bg-[#070919] border rounded-xl p-5 flex flex-col justify-between transition-all ${
                      unlocked ? 'border-amber-500/45 bg-[#0a0d24]' : 'border-[#17214a]'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="bg-[#0f1433] hover:bg-[#151c4a] p-2.5 rounded-lg border border-[#21316b]">
                          <Award className={`w-6 h-6 ${unlocked ? 'text-amber-400' : 'text-gray-500'}`} />
                        </div>
                        <span className="text-3xs uppercase tracking-widest font-mono bg-[#0c102a] text-[#8492bd] border border-[#1d2757]/45 px-2 py-0.5 rounded">
                          {unlocked ? 'SYSTEM SOLVED' : 'IN PROGRESS'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm tracking-wide text-slate-100 mt-2">
                        {ach.title}
                      </h4>
                      <p className="text-2xs text-[#808eb9] font-sans mt-0.5 leading-relaxed">
                        {ach.description}
                      </p>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between font-mono text-3xs text-gray-400">
                        <span>ACCUMULATION PROTOCOL</span>
                        <span>{ach.progressCurrent} / {ach.progressMax}</span>
                      </div>
                      <div className="w-full bg-[#03040c] h-1.5 overflow-hidden rounded border border-[#1b2559]/35">
                        <div
                          className={`h-full rounded ${unlocked ? 'bg-amber-400' : 'bg-cyan-500'}`}
                          style={{ width: `${ratioPercent}%` }}
                        />
                      </div>

                      {/* Reward indices */}
                      <div className="pt-2 border-t border-[#1a2354]/45 flex justify-between items-center text-3xs font-mono">
                        <span className="text-[#a1b0dd] block">GRANT CODES:</span>
                        <div className="space-x-3">
                          <span className="text-yellow-400 font-bold">🪙 +{ach.coinReward} Coins</span>
                          <span className="text-[#7fe8fd] font-bold">🧪 +{ach.xpReward} XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================= */}
        {/* TAB PROFILE: CAREER DIAGNOSTICS */}
        {/* ======================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                PILOT ARCHIVES & DIAGNOSTICS
              </h2>
              <p className="text-gray-400 text-xs text-mono">
                System records associated with caller certificate {user.id}.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left summary dashboard card */}
              <div className="md:col-span-1 bg-gradient-to-b from-[#080d26] to-[#040612] border border-cyan-500/20 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between h-96">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <User className="w-48 h-48 text-cyan-400" />
                </div>

                <div className="space-y-4">
                  <span className="text-3xs uppercase tracking-widest font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-400">
                    DIAGNOSTICS RECORDED
                  </span>
                  <div>
                    <h3 className="text-2xl font-black">{user.username}</h3>
                    <span className="text-3xs font-mono tracking-widest text-indigo-400 block uppercase">
                      Callsign tag [{user.selectedTitle}]
                    </span>
                  </div>
                  <hr className="border-[#172350]" />
                  <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
                    <div className="bg-[#03050f] p-3 rounded-xl border border-[#15204c]">
                      <span className="text-3xs block text-gray-400 uppercase">LVL</span>
                      <span className="text-base font-black text-white">{user.level}</span>
                    </div>
                    <div className="bg-[#03050f] p-3 rounded-xl border border-[#15204c]">
                      <span className="text-3xs block text-gray-400 uppercase">RP</span>
                      <span className="text-base font-black text-cyan-400">{user.rankPoints}</span>
                    </div>
                  </div>
                </div>

                <div className="text-3xs text-gray-500 font-mono italic leading-none pt-4 uppercase">
                  Telemetry synched: {user.createdAt}
                </div>
              </div>

              {/* Right comprehensive stats breakdown */}
              <div className="md:col-span-2 bg-[#080b18] border border-[#17224e] p-6 rounded-2xl">
                <h3 className="text-[#cbd5e1] font-extrabold uppercase text-sm tracking-wider border-b border-[#1b2559] pb-2 mb-4">
                  Combat Telemetry Matrices
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center font-mono">
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">Total Kills</span>
                    <span className="text-xl font-bold font-mono text-[#f43f5e]">{user.stats.kills}</span>
                  </div>
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">Total Deaths</span>
                    <span className="text-xl font-bold font-mono text-gray-300">{user.stats.deaths}</span>
                  </div>
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">K/D Ratio</span>
                    <span className="text-xl font-bold font-mono text-white">
                      {(user.stats.kills / Math.max(1, user.stats.deaths)).toFixed(2)}
                    </span>
                  </div>
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">Victory Runs</span>
                    <span className="text-xl font-bold font-mono text-amber-400">{user.stats.wins}</span>
                  </div>
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">Maximum length</span>
                    <span className="text-xl font-bold font-mono text-[#4ade80]">{user.stats.longestLength}m</span>
                  </div>
                  <div className="bg-[#0b0f2a] p-4 rounded-xl border border-[#141b44]">
                    <span className="text-3xs block text-[#707bb0] uppercase tracking-wider mb-1">Matches Played</span>
                    <span className="text-xl font-bold font-mono text-[#60a5fa]">{user.stats.gamesPlayed}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
