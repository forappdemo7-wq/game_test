/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GameMode,
  UserProfile,
  CosmeticItem,
  Achievement,
  Clan,
  FriendShip,
} from '@/types';
import {
  Trophy,
  ShoppingBag,
  Users,
  Award,
  User,
  Shield,
  Volume2,
  VolumeX,
  Play,
  Send,
  Compass,
  GraduationCap,
  CalendarDays,
  Sparkles,
} from 'lucide-react';
import { SoundManager } from './SoundManager';

interface MainMenuProps {
  user: UserProfile | null;
  onLogin: (username: string) => void;
  onJoinGame: (mode: GameMode, roomCode?: string) => void;
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
  type Tab = 'play' | 'training' | 'shop' | 'clans' | 'friends' | 'leaderboards' | 'achievements' | 'profile';
  const [activeTab, setActiveTab] = useState<Tab>('play');

  // Form helpers
  const [usernameInput, setUsernameInput] = useState('');
  const [clanForm, setClanForm] = useState({ name: '', tag: '' });
  const [friendForm, setFriendForm] = useState('');
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [isBrQueueActive, setIsBrQueueActive] = useState(false);

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
      const shopRes = await fetch('/api/shop');
      if (shopRes.ok) {
        const shopData = await shopRes.json();
        setShopItems(shopData.shopItems || []);
      }

      const leadRes = await fetch('/api/leaderboards');
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboards(leadData);
      }

      const clansRes = await fetch('/api/clans');
      if (clansRes.ok) {
        const clansData = await clansRes.json();
        setClansList(clansData || []);
        if (user.clanId) {
          const found = clansData.find((c: Clan) => c.id === user.clanId);
          setMyClan(found || null);
        } else {
          setMyClan(null);
        }
      }

      const friendsRes = await fetch(`/api/friends/${user.id}`);
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriendsList(friendsData.friends || []);
        setFriendRequests(friendsData.requests || []);
      }

      const achRes = await fetch(`/api/achievements/${user.id}`);
      if (achRes.ok) {
        const achData = await achRes.json();
        setAchievements(achData || []);
      }
    } catch (e) {
      console.warn('Backend endpoints offline. Using local fallback simulation logic:', e);
    }
  };

  useEffect(() => {
    if (user) {
      syncServerData();
    }
  }, [user, activeTab]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    onLogin(usernameInput.trim());
  };

  const buyItem = async (itemId: string, cost: number) => {
    if (!user || user.coins < cost) return;
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, cosmeticId: itemId }),
      });
      if (res.ok) {
        SoundManager.playShieldActivate();
        syncServerData();
      } else {
        const body = await res.json();
        alert(body.error || 'Purchase failed');
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
      if (res.ok) {
        SoundManager.playVictoryArpeggio();
        setClanForm({ name: '', tag: '' });
        syncServerData();
      } else {
        const data = await res.json();
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

  const handleLessonRun = async (lessonName: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/training/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, lessonName, scoreObtained: 95 }),
      });
      if (res.ok) {
        SoundManager.playVictoryArpeggio();
        syncServerData();
        onJoinGame(GameMode.CASUAL);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] text-[#e0e0e0] font-sans px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-[30%] left-[20%] w-[330px] h-[330px] rounded-full bg-[#00f2ff]/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-md w-full bg-[#111112] border border-white/10 rounded-none p-8 shadow-2xl antialiased z-10 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.15)]">
              <Compass className="w-7 h-7 text-[#00f2ff]" />
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
              <label className="block text-[10px] font-bold text-[#808080] uppercase tracking-[1px] mb-2 font-mono">
                Glider Callsign / Pilot Tag
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
              className="w-full py-3.5 px-6 bg-[#00f2ff] hover:bg-[#00e1ec] active:bg-[#00c5ce] text-[#050505] font-black text-sm tracking-[2px] uppercase transition-all shadow-[0_0_15px_rgba(0,242,255,0.25)] cursor-pointer"
            >
              Enter Arena
            </button>
          </form>

          <div className="mt-8 border-t border-white/5 pt-6 text-[10px] font-mono text-[#808080] uppercase tracking-[1px]">
            SYSTEM SECURITY PROTOCOLS LIVE
          </div>
        </div>
      </div>
    );
  }

  const xpNeeded = user.level * 250;
  const xpPercent = Math.min(100, Math.floor((user.xp / xpNeeded) * 100));

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#050505] text-[#e0e0e0] font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* LEFT PANEL DECK */}
      <aside className="w-full md:w-80 bg-[#111112] border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-between p-6 z-10 shadow-2xl">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-none bg-[#00f2ff]/10 border border-[#00f2ff]/40 flex items-center justify-center">
              <Compass className="w-4.5 h-4.5 text-[#00f2ff]" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-[4px] text-white uppercase">
                SNAKE <span className="text-[#00f2ff]">LEGENDS</span>
              </h2>
              <span className="text-[9px] uppercase tracking-[1px] text-[#808080] font-mono block mt-0.5">
                Cyber Arena Cockpit
              </span>
            </div>
          </div>

          <div className="bg-[#050505] border border-white/10 rounded-none p-4 mb-5">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-none bg-[#111112] border border-white/10 flex items-center justify-center font-bold text-sm text-[#00f2ff] font-mono">
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="text-[10px] text-[#808080] tracking-wider font-mono uppercase truncate">
                  {user.selectedTitle || 'Arena Novice'}
                </div>
                <h4 className="font-bold text-sm tracking-wide text-white truncate">
                  {user.username}
                </h4>
              </div>
            </div>

            <div className="text-3xs text-[#808080] font-mono flex justify-between mb-1">
              <span>LEVEL {user.level}</span>
              <span>{user.xp} / {xpNeeded} XP</span>
            </div>
            <div className="w-full bg-[#111112] h-1.5 overflow-hidden border border-white/5">
              <div
                className="bg-[#00f2ff] h-full shadow-[0_0_10px_rgba(0,242,255,0.4)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 text-center">
              <div className="bg-[#111112] py-2 rounded-none border border-white/5 text-2xs">
                <span className="block text-[#808080] text-[9px] uppercase font-mono tracking-wider mb-0.5">Coins</span>
                <span className="text-xs font-bold text-[#00f2ff] font-mono">🪙 {user.coins}</span>
              </div>
              <div className="bg-[#111112] py-2 rounded-none border border-white/5 text-2xs">
                <span className="block text-[#808080] text-[9px] uppercase font-mono tracking-wider mb-0.5">ELO Rank</span>
                <span className="text-[10px] font-mono font-black text-white tracking-wide uppercase">{user.rank}</span>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'play', label: 'Action Arenas', icon: Play },
              { id: 'training', label: 'Academy training', icon: GraduationCap },
              { id: 'shop', label: 'Skins vault', icon: ShoppingBag },
              { id: 'clans', label: 'Alliances & clans', icon: Shield },
              { id: 'friends', label: 'Wingmen friends', icon: Users },
              { id: 'leaderboards', label: 'Top Rankings', icon: Trophy },
              { id: 'achievements', label: 'Achievements', icon: Award },
              { id: 'profile', label: 'Pilot Telemetry', icon: User },
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
                  className={`w-full flex items-center space-x-3 px-5 py-3 text-xs font-semibold uppercase tracking-[1px] transition-all border-y-0 border-r-0 ${
                    isSelected
                      ? 'bg-[rgba(0,242,255,0.05)] border-l-2 border-l-[#00f2ff] text-white rounded-none'
                      : 'border-l-2 border-l-transparent text-[#808080] hover:text-[#e0e0e0] hover:bg-[rgba(255,255,255,0.03)] rounded-none'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onToggleSound}
            className="p-2 ml-2 bg-[#050505] border border-white/10 hover:bg-white/5 text-[#808080] hover:text-white transition-all rounded-none"
            title="Toggle SFX Synth"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#00f2ff]" /> : <VolumeX className="w-4 h-4 text-red-500" />}
          </button>
          <span className="text-3xs uppercase text-[#808080] tracking-widest font-mono">
            SECURE LINK ACTIVE
          </span>
        </div>
      </aside>

      {/* CORE DISPLAY DECKS */}
      <main className="flex-1 bg-[#050505] flex flex-col p-6 overflow-y-auto z-10 md:p-8">
        {/* ACTION ARENAS */}
        {activeTab === 'play' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-[#00f2ff] mb-1">
                  TACTICAL DEPLOYMENT STATION
                </h2>
                <p className="text-gray-400 text-xs">
                  Aquire cosmic food, dodge high-speed opponents, and slither into the leaderboards.
                </p>
              </div>

              {/* Dynamic Daily Quest checklist overlay inside lobby deck */}
              <div className="mt-4 sm:mt-0 p-3 bg-cyan-950/20 border border-cyan-500/20 max-w-sm w-full rounded-lg font-mono text-[11px] block">
                <div className="flex justify-between font-bold text-[#00f2ff] uppercase border-b border-cyan-500/20 pb-1 mb-1.5 font-sans">
                  <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> DAILY QUEST COMS</span>
                  <span>ACTIVE</span>
                </div>
                <div className="space-y-1">
                  {(user as any).dailyQuests?.map((q: any) => (
                    <div key={q.id} className="flex justify-between gap-2">
                      <span className={`${q.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{q.description}</span>
                      <span className="text-[#00f2ff] shrink-0">{q.currentCount}/{q.targetCount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono">
                      Endless Lobby
                    </span>
                    <span className="text-2xs text-[#808080] font-mono">Bots online: 12</span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Casual Sandbox</h3>
                  <p className="text-2xs text-[#808080] leading-relaxed">
                    Test your tactical parameters, slither smoothly, vacuum up energy feeds, and destroy system bots. No ELO risk.
                  </p>
                </div>
                <button
                  onClick={() => onJoinGame(GameMode.CASUAL)}
                  className="w-full py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none"
                >
                  Bridge Casual Gate
                </button>
              </div>

              <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono">
                      Competitive Orbit
                    </span>
                    <span className="text-2xs text-[#808080] font-mono">My RP Points: {user.rankPoints}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Ranked League</h3>
                  <p className="text-2xs text-[#808080] leading-relaxed">
                    Intense ladder matchmaking. Scale placement matches up through Bronze, Platinum, Master, up to Legend.
                  </p>
                </div>
                <button
                  onClick={() => onJoinGame(GameMode.RANKED)}
                  className="w-full py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none"
                >
                  Inbound Ranked Arena
                </button>
              </div>

              <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-red-950/20 border border-red-500/30 rounded-none text-red-400 font-mono">
                      COLLAPSIBLE MATRIX
                    </span>
                    <span className="text-2xs text-[#808080] font-mono">Prize: 🪙 500 Credits</span>
                  </div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-mono">Battle Royale Collapse</h3>
                  <p className="text-2xs text-[#808080] leading-relaxed">
                    Survive inside a collapsing solar radiation storm grid limits! Fight off other gliders to capture massive coin checks.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsBrQueueActive(true);
                    setTimeout(() => {
                      onJoinGame(GameMode.BATTLE_ROYALE);
                      setIsBrQueueActive(false);
                    }, 1200);
                  }}
                  disabled={isBrQueueActive}
                  className="w-full py-2.5 bg-[#111112] hover:bg-red-500/10 hover:border-red-500/40 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition-all cursor-pointer rounded-none"
                >
                  {isBrQueueActive ? 'DEPRESSURIZING LAUNCH TUBES...' : 'Engage Survival Lock'}
                </button>
              </div>

              <div className="bg-[#111112] border border-white/10 p-5 rounded-none flex flex-col justify-between hover:border-[#00f2ff]/40 hover:bg-[#111112]/90 transition-all">
                <div className="mb-4">
                  <span className="text-3xs uppercase tracking-[1px] px-2 py-0.5 bg-[#00f2ff]/10 border border-[#00f2ff]/30 rounded-none text-[#00f2ff] font-mono">
                    Hangar Codes
                  </span>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider mt-2 mb-2 font-mono">Private Duel Cells</h3>
                  <p className="text-2xs text-[#808080] leading-relaxed mb-3">
                    Input an encryption key below to bridge into secure sandbox spaces with invited comrades.
                  </p>

                  <input
                    type="text"
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    placeholder="ENTER SECURE PRIVATE CODE..."
                    className="w-full bg-[#050505] border border-white/10 rounded-none px-3 py-2 text-2xs text-white placeholder-gray-600 focus:outline-none focus:border-[#00f2ff] uppercase font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const code = `DUEL_${Math.floor(100 + Math.random() * 900)}`;
                      onJoinGame(GameMode.PRIVATE, code);
                    }}
                    className="py-2.5 bg-[#111112] hover:bg-[#00f2ff]/10 hover:border-[#00f2ff]/40 text-white border border-white/10 font-bold text-2xs uppercase tracking-wider transition-all cursor-pointer rounded-none"
                  >
                    Host Cell
                  </button>
                  <button
                    onClick={() => {
                      if (!roomCodeInput.trim()) return alert('Input room code protocol first');
                      onJoinGame(GameMode.PRIVATE, roomCodeInput.trim());
                    }}
                    className="py-2.5 bg-[#050505] hover:bg-white/5 text-white border border-white/10 font-bold text-2xs uppercase tracking-wider transition-all cursor-pointer rounded-none"
                  >
                    Join Cell
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRAINING ACADEMY (Phase 7) */}
        {activeTab === 'training' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-green-400 mb-1">
                COMBAT EXPEDITIONS ACADEMY
              </h2>
              <p className="text-gray-400 text-xs">
                Refine combat schools of slither, collect safe XP runs, and test advanced dash propulsion. No ranked drop penalties.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Movement School', desc: 'Master low-level kinematics, sub-millisecond turning mechanics, and virtual joystick sensitivity bounds.', reward: 'XP +120, Credits +40' },
                { name: 'Combat School', desc: 'Secure bot captures by using fast dash wrap-arounds and advanced shield trapping envelopes.', reward: 'XP +120, Credits +40' },
                { name: 'Survival School', desc: 'Evade collapsing red Battle Royale solar storm matrices and practice centering mechanics.', reward: 'XP +120, Credits +40' },
                { name: 'Advanced Techniques', desc: 'Maximize magnet pickup ranges, master speed boost-decay curves, and lock stealth ghost runs.', reward: 'XP +120, Credits +40' },
              ].map((school) => {
                const completeData = (user as any).academyProgress?.[school.name];
                return (
                  <div
                    key={school.name}
                    className="bg-[#0b1008] border border-green-500/20 p-5 rounded-none hover:border-green-400/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-3xs uppercase tracking-widest bg-green-500/10 text-green-400 font-mono px-2 py-0.5 border border-green-500/20">
                          SCHOOL MODULE
                        </span>
                        {completeData?.completed && (
                          <span className="text-3xs font-extrabold uppercase font-mono text-green-400 flex items-center gap-1 animate-pulse">
                            ★ COMPLETED
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-gray-200 mt-1 mb-2 font-mono uppercase">{school.name}</h4>
                      <p className="text-2xs text-gray-400 leading-relaxed">{school.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-green-500/10 flex justify-between items-center flex-wrap sm:flex-nowrap gap-3">
                      <span className="text-3xs text-yellow-500 font-mono uppercase">🎁 {school.reward}</span>
                      <button
                        onClick={() => handleLessonRun(school.name)}
                        className="px-4 py-1.5 bg-green-600 hover:bg-green-500 text-black font-black text-3xs uppercase tracking-wider rounded-none"
                      >
                        ENGAGE MODULE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COSMETIC VAULT SHOP */}
        {activeTab === 'shop' && (
          <div className="space-y-6 max-w-5xl animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-wider text-yellow-400 mb-1">
                  COSMETIC VAULT DEPLOYMENT
                </h2>
                <p className="text-gray-400 text-xs">
                  Redigitize your slither appearance with premium skins and exhaust fuels.
                </p>
              </div>
              <div className="mt-4 sm:mt-0 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-lg text-yellow-400 font-mono font-bold text-sm">
                🪙 {user.coins} CREDITS
              </div>
            </div>

            <h3 className="text-xs font-bold text-cyan-400 tracking-wider uppercase border-b border-[#1c223c] pb-2 font-mono">
              Neon Skin Shells
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {shopItems
                .filter((item) => item.type === 'skin')
                .map((item) => {
                  const owned = user.ownedCosmetics.includes(item.id);
                  const equipped =
                    item.value === user.selectedSkin ||
                    (item.value === 'neon_blue' && user.selectedSkin === 'neon_blue');

                  return (
                    <div
                      key={item.id}
                      className="bg-[#070918] border border-[#17214d] rounded-xl p-4 flex flex-col justify-between text-center hover:border-cyan-500/30 transition-all duration-300"
                    >
                      <div className="mb-4">
                        <span
                          className={`text-3xs uppercase tracking-widest font-black px-2 py-0.5 rounded font-mono ${
                            item.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/25' :
                            item.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/25' :
                            item.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/25' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/25'
                          }`}
                        >
                          {item.rarity}
                        </span>
                        <h4 className="font-bold text-[#e2e8f0] text-[13px] tracking-wide mt-3 truncate font-sans uppercase">
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
                        <span className="block w-full py-2 bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-2xs font-extrabold uppercase rounded-lg">
                          EQUIPPED
                        </span>
                      ) : owned ? (
                        <button
                          onClick={() => equipItem(item.id)}
                          className="w-full py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-500/30 text-2xs font-bold uppercase rounded-lg transition-all"
                        >
                          EQUIP
                        </button>
                      ) : (
                        <button
                          onClick={() => buyItem(item.id, item.cost)}
                          disabled={user.coins < item.cost}
                          className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-black text-2xs font-black uppercase rounded-lg transition-all disabled:opacity-50"
                        >
                          🪙 {item.cost} COINS
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            <h3 className="text-xs font-bold text-purple-400 tracking-wider uppercase border-b border-[#1c223c] pb-2 pt-4 font-mono">
              Glowing Engine Exhausts Trails
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
                        <h4 className="font-extrabold text-sm tracking-wide mt-2 mb-2 font-sans uppercase text-gray-200">
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

        {/* ALLIANCES & CLANS */}
        {activeTab === 'clans' && (
          <div className="space-y-6 max-w-5xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1">
                ALLIANCES & GUILDS CLANS
              </h2>
              <p className="text-gray-400 text-xs">
                Incorporate custom snake alliances, rank on leaderboards, and communicate in secure clan lines.
              </p>
            </div>

            {myClan ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-[#080b18] border border-cyan-500/30 p-5 rounded-xl text-center space-y-3">
                    <span className="text-3xs uppercase tracking-widest px-2.5 py-1 bg-cyan-950 text-cyan-400 rounded-full font-mono font-bold">
                      ⚔️ CLAN CHANNEL OPENED
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-100 font-mono">
                      {myClan.name} <span className="text-cyan-400 font-mono">[{myClan.tag}]</span>
                    </h3>
                    <p className="text-2xs text-[#7c89ba] font-mono">
                      Established by <b className="text-indigo-400">{myClan.leaderName}</b>. Rank Points accumulated: <b>{myClan.rankPoints}</b>.
                    </p>
                    <button
                      onClick={leaveClan}
                      className="w-full mt-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/25 text-red-400 font-bold text-2xs uppercase tracking-wider transition-all"
                    >
                      Leave Alliance
                    </button>
                  </div>

                  <div className="bg-[#080b18] border border-[#17214a] p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-[#1b2559] pb-2 mb-3">
                      Clan Pilots Manifest ({myClan.members?.length || 1})
                    </h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {myClan.members?.map((m) => (
                        <div key={m.userId} className="flex justify-between items-center text-xs font-mono">
                          <span className="font-bold">{m.username}</span>
                          <span className="text-3xs uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/10">
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 bg-[#060815] border border-[#16214f] rounded-xl flex flex-col justify-between h-[450px]">
                  <div className="p-4 border-b border-[#141b41] font-sans text-xs">
                    <h4 className="font-bold uppercase tracking-wider text-green-400">
                      🛰️ Decrypted coms link
                    </h4>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                    {myClan.chat && myClan.chat.map((msg, idx) => (
                      <div key={idx} className="bg-[#0b0f2a] p-2.5 rounded-lg border border-[#1b255c]/25">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-cyan-400">[{msg.username}]:</span>
                          <span className="text-3xs text-gray-500 font-sans">{msg.timestamp}</span>
                        </div>
                        <p className="text-gray-300 break-words font-sans text-xs">{msg.message}</p>
                      </div>
                    ))}
                    {(!myClan.chat || myClan.chat.length === 0) && (
                      <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                        Signal quiet...
                      </div>
                    )}
                  </div>

                  <form onSubmit={sendClanChat} className="p-3 border-t border-[#141b41] flex gap-2">
                    <input
                      type="text"
                      maxLength={120}
                      value={clanChatInput}
                      onChange={(e) => setClanChatInput(e.target.value)}
                      placeholder="BROADCAST SECURE CLAN PACKET..."
                      className="flex-1 bg-[#03040c] border border-[#1c295c] rounded px-3 py-2 text-xs placeholder-gray-600 focus:outline-none focus:border-cyan-500 text-white font-mono"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-[#080b18] border border-[#17224e] p-5 rounded-xl h-fit space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2 font-mono">
                    Form Alliance
                  </h3>
                  <p className="text-2xs text-[#7c89ba] leading-normal font-mono">
                    Forms an alliance Corp. Costs 🪙 100 Credits to construct telemetry hubs. Join up with wingmen in private chats!
                  </p>

                  <form onSubmit={createClan} className="space-y-4 font-mono text-2xs">
                    <div>
                      <label className="block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5">
                        Strategic Alliance Name
                      </label>
                      <input
                        type="text"
                        maxLength={18}
                        value={clanForm.name}
                        onChange={(e) => setClanForm({ ...clanForm, name: e.target.value })}
                        placeholder="ENTER ALLIANCES NAME..."
                        className="w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-3xs text-cyan-400 tracking-wider uppercase mb-1.5">
                        Unique alliance tag (Max 4 characters)
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={clanForm.tag}
                        onChange={(e) => setClanForm({ ...clanForm, tag: e.target.value })}
                        placeholder="TAG..."
                        className="w-full bg-[#03040a] border border-[#233575] rounded px-3 py-2 text-xs uppercase text-white font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={user.coins < 100}
                      className="w-full py-2.5 rounded bg-yellow-400 text-black hover:bg-yellow-300 font-extrabold text-2xs uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      Exchange Coins (100)
                    </button>
                  </form>
                </div>

                <div className="md:col-span-2 bg-[#080b18] border border-[#17224e] p-5 rounded-xl space-y-4">
                  <h3 className="text-base font-extrabold uppercase tracking-wide border-b border-[#1e2c65] pb-2 font-mono">
                    Coalition Registry
                  </h3>

                  <div className="space-y-2.5 max-h-[350px] overflow-y-auto">
                    {clansList && clansList.map((clan) => (
                      <div
                        key={clan.id}
                        className="bg-[#0b0f2b] p-4 rounded-lg border border-[#18245a] flex justify-between items-center font-mono text-xs"
                      >
                        <div>
                          <h4 className="font-bold text-sm">
                            {clan.name} <span className="text-indigo-400 font-mono">[{clan.tag}]</span>
                          </h4>
                          <span className="text-2xs text-gray-400 font-mono block mt-1">
                            Led by {clan.leaderName} • {clan.members?.length || 1} Wingmen • RP Level: {clan.rankPoints}
                          </span>
                        </div>
                        <button
                          onClick={() => joinClan(clan.id)}
                          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold uppercase text-3xs tracking-wider rounded-none"
                        >
                          Join alliance
                        </button>
                      </div>
                    ))}
                    {clansList.length === 0 && (
                      <div className="text-center py-12 text-gray-500 font-mono">
                        No tactical alliances formed yet on current sectors.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* WINGMEN FRIENDS LIST */}
        {activeTab === 'friends' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-indigo-400 mb-1">
                WINGMEN CONNECTIONS HUB
              </h2>
              <p className="text-gray-400 text-xs">
                Enlist slither compatriots, audit active online telemetry, and submit requests below.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 bg-[#090b16] border border-indigo-500/20 p-5 rounded-none h-fit space-y-3 font-mono text-2xs">
                <h4 className="font-bold uppercase tracking-wide text-indigo-400 border-b border-indigo-500/10 pb-2">
                  Enlist Wingman
                </h4>
                <form onSubmit={sendFriendRequest} className="space-y-3">
                  <input
                    type="text"
                    value={friendForm}
                    onChange={(e) => setFriendForm(e.target.value)}
                    placeholder="ENTER PILOT CALLSIGN..."
                    className="w-full bg-[#03040c] border border-indigo-500/30 rounded px-2.5 py-2 text-2xs text-white uppercase placeholder-gray-600"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-3xs uppercase tracking-wider"
                  >
                    Submit Enlist Request
                  </button>
                </form>

                {friendRequests.length > 0 && (
                  <div className="pt-4 space-y-2">
                    <h5 className="font-bold uppercase tracking-wide text-indigo-450 border-b border-indigo-500/10 pb-1 flex justify-between">
                      <span>INBOUND SIGNALS</span>
                      <span className="text-yellow-500 animate-pulse">(!)</span>
                    </h5>
                    {friendRequests.map((req) => (
                      <div key={req.id} className="bg-[#0c0e1e] p-2 border border-indigo-500/15 flex justify-between items-center rounded-lg">
                        <span className="font-bold text-gray-300 truncate max-w-[120px]">{req.fromName}</span>
                        <button
                          onClick={() => acceptFriend(req.id)}
                          className="px-2 py-1 bg-green-600 hover:bg-green-500 text-black font-black text-3xs uppercase"
                        >
                          Enlist
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-2 bg-[#090b16] border border-indigo-500/20 p-5 rounded-none h-fit space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-gray-300 border-b border-white/5 pb-2">
                  Holographic Friends Grid
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto">
                  {friendsList.map((friend) => (
                    <div
                      key={friend.friendId}
                      className="bg-[#05060f] border border-[#1b2554]/45 p-4 rounded-xl flex items-center space-x-3.5"
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-indigo-950 font-bold border border-indigo-500/25 flex items-center justify-center font-mono">
                          {friend.username.slice(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-indigo-950 rounded-full ${
                            friend.status === 'online' ? 'bg-emerald-400' : 'bg-gray-500'
                          }`}
                        />
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="font-bold text-sm truncate">{friend.username}</h5>
                        <ul className="text-3xs text-gray-400 font-mono flex gap-2.5 mt-1">
                          <li>LV {friend.level}</li>
                          <li className="text-[#00f2ff]">{friend.rank}</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                  {friendsList.length === 0 && (
                    <div className="col-span-2 text-center py-16 text-gray-500 font-mono">
                      No wingmen linked inside sector index files yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOLOGRAPHIC LEADERBOARDS */}
        {activeTab === 'leaderboards' && (
          <div className="space-y-6 max-w-5xl animate-fade-in font-mono text-2xs">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-indigo-400 mb-1 font-sans">
                GLOBAL LEADERBOARDS
              </h2>
              <p className="text-gray-400 text-xs font-sans">
                Audit elite gliders, longest loops recorded, high-density scores, and global coalition alliances.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leaderboard 1: High Levels */}
              <div className="bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl">
                <h4 className="text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans">
                  <span>HIGH LEVEL PILOTS</span>
                  <span className="text-[#00f2ff]">LV / XP</span>
                </h4>
                <div className="space-y-1">
                  {leaderboards?.global?.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-[#80c0ff] font-bold">0{idx + 1}. {item.username}</span>
                      <span className="font-bold text-[#00f2ff]">LV {item.level}</span>
                    </div>
                  ))}
                  {(!leaderboards?.global || leaderboards.global.length === 0) && (
                    <div className="text-center py-12 text-gray-500">Scanning satellite telemetry files...</div>
                  )}
                </div>
              </div>

              {/* Leaderboard 2: Heavy Scores */}
              <div className="bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl">
                <h4 className="text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans">
                  <span>HIGH DENSITY MASS</span>
                  <span className="text-green-400">RECORD HP</span>
                </h4>
                <div className="space-y-1">
                  {leaderboards?.scores?.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-emerald-400 font-bold">0{idx + 1}. {item.username}</span>
                      <span className="font-bold text-white">{item.stats.highestScore} HP</span>
                    </div>
                  ))}
                  {(!leaderboards?.scores || leaderboards.scores.length === 0) && (
                    <div className="text-center py-12 text-gray-500">Retrieving density stats...</div>
                  )}
                </div>
              </div>

              {/* Leaderboard 3: Clans */}
              <div className="bg-[#080d1e] border border-indigo-550/20 p-4 rounded-xl">
                <h4 className="text-xs font-extrabold uppercase text-gray-200 border-b border-indigo-550/15 pb-2 mb-3 flex justify-between font-sans">
                  <span>ALLIANCES ALL-STARS</span>
                  <span className="text-indigo-400">RP LEVEL</span>
                </h4>
                <div className="space-y-1">
                  {leaderboards?.clans?.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-yellow-500 font-bold">0{idx + 1}. {item.name} [{item.tag}]</span>
                      <span className="font-bold text-white">{item.rankPoints} RP</span>
                    </div>
                  ))}
                  {(!leaderboards?.clans || leaderboards.clans.length === 0) && (
                    <div className="text-center py-12 text-gray-500">Scanning guild databases...</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        {activeTab === 'achievements' && (
          <div className="space-y-6 max-w-4xl animate-fade-in">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-[#00f2ff] mb-1">
                HALL OF COSMIC ACHIEVEMENT
              </h2>
              <p className="text-gray-400 text-xs">
                Review telemetry goals, unlock credit payouts, and level badges.
              </p>
            </div>

            <div className="space-y-2.5">
              {achievements && achievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-4 rounded-none border flex justify-between items-center ${
                    ach.unlockedAt
                      ? 'bg-cyan-950/20 border-cyan-500/25'
                      : 'bg-[#111112] border-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    <div className={`p-2 bg-black/40 border ${ach.unlockedAt ? 'border-cyan-500/20 text-[#00f2ff]' : 'border-white/5 text-gray-500'}`}>
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-wide uppercase text-gray-300">{ach.title}</h4>
                      <p className="text-2xs text-[#808080] leading-snug mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono text-2xs space-y-1">
                    {ach.unlockedAt ? (
                      <span className="text-cyan-400 font-black tracking-widest text-3xs uppercase bg-black/40 border border-cyan-500/10 px-2 py-0.5 rounded-full inline-block">
                        ★ COMPLETED
                      </span>
                    ) : (
                      <span className="text-gray-500 tracking-widest text-3xs uppercase font-sans">
                        {Math.floor(ach.progressCurrent)}/{ach.progressMax} IN PROCESS
                      </span>
                    )}
                    <span className="block text-yellow-500 font-bold">🪙 +{ach.coinReward} CREDITS</span>
                  </div>
                </div>
              ))}
              {achievements.length === 0 && (
                <div className="text-center py-24 text-gray-500 font-mono">
                  Loading pilot award registries...
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILE / DIAGNOSTICS */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl animate-fade-in font-mono text-xs">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wider text-cyan-400 mb-1 font-sans">
                TELEMETRY DIAGNOSTICS
              </h2>
              <p className="text-gray-400 text-xs font-sans">
                Audit system values, slither lengths, combat statistics, and pilot accounts records.
              </p>
            </div>

            <div className="bg-[#0c0d16] border border-cyan-500/20 p-6 rounded-none space-y-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest border-b border-cyan-500/10 pb-2 flex justify-between font-sans">
                <span>PILOT STATS HISTORIC FILE</span>
                <span className="text-[#00f2ff]">DECRYPTED</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">TOTAL KILLS SECURED</span>
                  <span className="text-sm font-bold text-white tracking-wider">{user.stats.kills} SECURED</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">ARENA CHIPS EXCLUDED</span>
                  <span className="text-sm font-bold text-white tracking-wider">{user.stats.deaths} EXPIRED</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">VICTORIES CONQUERED</span>
                  <span className="text-sm font-bold text-white tracking-wider">{user.stats.wins} WINS</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">MAX ENERGY MASS RECORD</span>
                  <span className="text-sm font-bold text-emerald-400 tracking-wider font-mono">{user.stats.highestScore} HP</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">TOTAL COSMIC ORBS</span>
                  <span className="text-sm font-bold text-white tracking-wider">{user.stats.orbsCollected} ORBS</span>
                </div>
                <div className="bg-[#050505] border border-white/5 p-4 py-3.5">
                  <span className="text-[#808080] block text-3xs uppercase tracking-wider">PILOTING EXPERIENCE</span>
                  <span className="text-sm font-bold text-[#00f2ff] tracking-wider">RANK {user.rank}</span>
                </div>
              </div>

              <div className="border-t border-cyan-500/10 pt-4 text-3xs text-gray-500 uppercase flex justify-between tracking-widest font-sans">
                <span>Account file created: {user.createdAt || 'N/A'}</span>
                <span>ID: {user.id}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
