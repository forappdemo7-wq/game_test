/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode, UserProfile, ServerPlayer, Orb, Point, KillFeedEntry, ActiveAbilities } from '@/types';
import { MainMenu } from '@/components/MainMenu';
import { GameCanvas } from '@/components/GameCanvas';
import { GameUI } from '@/components/GameUI';
import { AdminPanel } from '@/components/AdminPanel';
import { SoundManager } from '@/components/SoundManager';
import { Shield } from 'lucide-react';

export default function AppPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>(GameMode.CASUAL);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  // Real-time socket states
  const [players, setPlayers] = useState<Record<string, ServerPlayer>>({});
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [brZoneRadius, setBrZoneRadius] = useState<number>(1500);
  const [brCenter, setBrCenter] = useState<Point>({ x: 1500, y: 1500 });
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; username: string; message: string; timestamp: string }>>([]);
  const [killFeed, setKillFeed] = useState<KillFeedEntry[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isReplaying, setIsReplaying] = useState(false);
  const replayIntervalRef = useRef<any>(null);

  // Fallback high performance offline client simulation state references
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const localSimIntervalRef = useRef<any>(null);
  const simStateRef = useRef<{
    players: Record<string, ServerPlayer>;
    orbs: Orb[];
    brZoneRadius: number;
    brCenter: Point;
  }>({
    players: {},
    orbs: [],
    brZoneRadius: 1500,
    brCenter: { x: 1500, y: 1500 }
  });

  // Cache user login details locally
  useEffect(() => {
    const cachedUserId = localStorage.getItem('snake_legends_user_id');
    const cachedUsername = localStorage.getItem('snake_legends_username');

    if (cachedUserId) {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cachedUserId, username: cachedUsername }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.user);
          }
        })
        .catch((err) => console.log('Store fallback offline initially', err));
    }
  }, []);

  const handleLogin = async (username: string) => {
    const newUserId = `pilot_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUserId, username, email: 'forappdemo7@gmail.com' }), // Default for fast demo testing
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('snake_legends_user_id', newUserId);
        localStorage.setItem('snake_legends_username', username);
        setUser(data.user);
        SoundManager.playVictoryArpeggio();
      }
    } catch (e) {
      console.log('Failing to bind login', e);
    }
  };

  const setLocalStats = (xpGained: number, coinsGained: number, isKill: boolean = false) => {
    if (!user) return;
    setUser((prev) => {
      if (!prev) return null;
      let newXp = prev.xp + xpGained;
      let newLevel = prev.level;
      let newCoins = prev.coins + coinsGained;
      let newKills = prev.stats.kills + (isKill ? 1 : 0);
      let newOrbsCollected = prev.stats.orbsCollected + (isKill ? 0 : 1);

      let xpNeeded = newLevel * 250;
      while (newXp >= xpNeeded && newLevel < 100) {
        newXp -= xpNeeded;
        newLevel += 1;
        newCoins += newLevel * 50;
        xpNeeded = newLevel * 250;
      }

      const updated = {
        ...prev,
        xp: newXp,
        level: newLevel,
        coins: newCoins,
        stats: {
          ...prev.stats,
          kills: newKills,
          orbsCollected: newOrbsCollected,
        }
      };

      // Lazy notify fallback DB
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updated.id,
          username: updated.username,
        })
      }).then(() => {
        if (isKill) {
          fetch('/api/training/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: updated.id, lessonName: 'Combat School', scoreObtained: 100 })
          }).catch((e) => console.log('Stat increment offline update catch:', e));
        }
      }).catch((e) => console.log('Sync profile catch:', e));

      return updated;
    });
  };

  const disintegrateOffline = (playerId: string, killerName: string) => {
    const currentSimState = simStateRef.current;
    const p = currentSimState.players[playerId];
    if (!p || p.isDead) return;

    p.isDead = true;
    p.respawnTimer = p.isBot && !p.isBoss ? 100 : p.isBoss ? 600 : 120; // bots wait 5s, boss wait 30s, player wait 6s

    // Scatter glowing space-orbs where segment residues were
    const colors = ['#f43f5e', '#06b6d4', '#10b981', '#a855f7', '#fbbf24', '#f97316', '#3b82f6'];
    p.segments.forEach((seg, idx) => {
      if (idx % 2 === 0) {
        currentSimState.orbs.push({
          id: `dis_orb_${Date.now()}_${idx}_${Math.random()}`,
          x: seg.x + (Math.random() - 0.5) * 15,
          y: seg.y + (Math.random() - 0.5) * 15,
          value: p.isBoss ? 8 : 4,
          color: colors[idx % colors.length],
          isPremium: Math.random() < 0.25,
        });
      }
    });

    const victimN = p.id === (user?.id || '') ? 'YOU' : p.name;
    const killerN = killerName || 'Deep Space';

    setKillFeed((prev) => [
      ...prev,
      {
        id: `kill_off_${Date.now()}_${Math.random()}`,
        victimName: victimN,
        killerName: killerN,
        timestamp: Date.now()
      }
    ].slice(-5));

    if (playerId === (user?.id || '')) {
      SoundManager.playDeathExplosion();
    }
  };

  const startOfflineSimulation = (mode: GameMode) => {
    setIsOfflineMode(true);

    const colors = ['#f43f5e', '#06b6d4', '#10b981', '#a855f7', '#fbbf24', '#f97316', '#3b82f6'];
    const initialOrbs: Orb[] = [];
    for (let i = 0; i < 150; i++) {
      initialOrbs.push({
        id: `orb_off_${Date.now()}_${i}_${Math.random()}`,
        x: Math.random() * 3000,
        y: Math.random() * 3000,
        value: Math.random() < 0.1 ? 6 : 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        isPremium: Math.random() < 0.1,
      });
    }

    const localId = user?.id || `pilot_offline_${Date.now()}`;
    const localUsername = user?.username || 'Offline Pilot';
    const px = 500 + Math.random() * 2000;
    const py = 500 + Math.random() * 2000;
    const pAngle = Math.random() * Math.PI * 2;
    const pSegments: Point[] = [];
    for (let i = 0; i < 10; i++) {
      pSegments.push({ x: px - Math.cos(pAngle) * i * 15, y: py - Math.sin(pAngle) * i * 15 });
    }

    const localPlayer: ServerPlayer = {
      id: localId,
      name: `${localUsername} [OFFLINE]`,
      isBot: false,
      skin: user?.selectedSkin || 'neon_blue',
      trail: user?.selectedTrail || 'none',
      title: user?.selectedTitle || 'Solo Fighter',
      x: px,
      y: py,
      angle: pAngle,
      segments: pSegments,
      score: 10,
      length: 10,
      speed: 5,
      isDead: false,
      respawnTimer: 0,
      abilities: {
        dash: { active: false, duration: 0 },
        shield: { active: false, duration: 0 },
        magnet: { active: false, duration: 0 },
        ghost: { active: false, duration: 0 },
      },
      rank: user?.rank || ('BRONZE' as any),
      level: user?.level || 1,
      kills: 0,
    };

    const initialPlayers: Record<string, ServerPlayer> = {
      [localId]: localPlayer
    };

    const botNames = ['QuantumSnake', 'PulseCobalt', 'VegaCrawler', 'CyberGlider', 'NeonAsp', 'TetherViper', 'AeroSlink', 'VortexGlide'];
    const botDifficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const difficultyTitles = { easy: 'Bot Cadet', medium: 'Bot Fighter', hard: 'Bot Gladiator' };

    for (let i = 0; i < 8; i++) {
      const bId = `bot_local_${i}_${Math.floor(Math.random() * 1000)}`;
      const bx = 300 + Math.random() * 2400;
      const by = 300 + Math.random() * 2400;
      const bAngle = Math.random() * Math.PI * 2;
      const bSegments: Point[] = [];
      for (let j = 0; j < 12; j++) {
        bSegments.push({ x: bx - Math.cos(bAngle) * j * 15, y: by - Math.sin(bAngle) * j * 15 });
      }
      const bDiff = botDifficulties[i % botDifficulties.length];

      initialPlayers[bId] = {
        id: bId,
        name: `🤖 ${botNames[i % botNames.length]}`,
        isBot: true,
        skin: colors[i % colors.length] === '#fbbf24' ? 'galaxy' : 'neon_blue',
        trail: 'none',
        title: difficultyTitles[bDiff],
        x: bx,
        y: by,
        angle: bAngle,
        segments: bSegments,
        score: 12,
        length: 12,
        speed: 5,
        isDead: false,
        respawnTimer: 0,
        abilities: {
          dash: { active: false, duration: 0 },
          shield: { active: false, duration: 0 },
          magnet: { active: false, duration: 0 },
          ghost: { active: false, duration: 0 },
        },
        rank: 'GOLD' as any,
        level: 5 + i * 2,
        kills: 0,
        difficulty: bDiff,
      };
    }

    if (mode === GameMode.CASUAL || mode === GameMode.BATTLE_ROYALE) {
      const bhId = 'world_boss_hydra';
      const bx = 1500;
      const by = 1500;
      const bAngle = 0;
      const bSegments: Point[] = [];
      for (let j = 0; j < 40; j++) {
        bSegments.push({ x: bx - j * 15, y: by });
      }
      initialPlayers[bhId] = {
        id: bhId,
        name: '👾 NEON HYDRA [WORLD BOSS]',
        isBot: true,
        isBoss: true,
        skin: 'rainbow',
        trail: 'galaxy_trail',
        title: 'RAID WORLD BOSS',
        x: bx,
        y: by,
        angle: bAngle,
        segments: bSegments,
        score: 150,
        length: 40,
        speed: 4,
        isDead: false,
        respawnTimer: 0,
        abilities: {
          dash: { active: false, duration: 0 },
          shield: { active: true, duration: 99999 },
          magnet: { active: true, duration: 99999 },
          ghost: { active: false, duration: 0 },
        },
        rank: 'LEGEND' as any,
        level: 100,
        kills: 0,
      };
    }

    simStateRef.current = {
      players: initialPlayers,
      orbs: initialOrbs,
      brZoneRadius: mode === GameMode.BATTLE_ROYALE ? 2000 : 1500,
      brCenter: { x: 1500, y: 1500 }
    };

    setPlayers({ ...simStateRef.current.players });
    setOrbs([...simStateRef.current.orbs]);
    setBrZoneRadius(simStateRef.current.brZoneRadius);
    setBrCenter({ ...simStateRef.current.brCenter });

    setChatMessages([
      {
        id: 'sys_off_init',
        username: 'CORETEX_SYS_BOT',
        message: '🔴 Sockets blocked by iframe sandbox restriction. Seamless local high performance offline bot-arena loaded!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      {
        id: 'sys_off_init_2',
        username: 'CORETEX_SYS_BOT',
        message: '💡 Tip: Steer with mouse/joystick, hold Click/Space to speed boost. Press W (Shield), E (Vacuum), R (Phase)!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    if (localSimIntervalRef.current) {
      clearInterval(localSimIntervalRef.current);
    }

    localSimIntervalRef.current = setInterval(() => {
      const currentSimState = simStateRef.current;
      const activeLobbyPlayers = currentSimState.players;

      if (mode === GameMode.BATTLE_ROYALE) {
        currentSimState.brZoneRadius = Math.max(120, currentSimState.brZoneRadius - 0.45);
      }

      if (currentSimState.orbs.length < 150) {
        const toSpawn = 150 - currentSimState.orbs.length;
        for (let s = 0; s < toSpawn; s++) {
          currentSimState.orbs.push({
            id: `orb_off_repl_${Date.now()}_${s}_${Math.random()}`,
            x: Math.random() * 3000,
            y: Math.random() * 3000,
            value: Math.random() < 0.1 ? 6 : 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            isPremium: Math.random() < 0.1,
          });
        }
      }

      Object.keys(activeLobbyPlayers).forEach((pId) => {
        const p = activeLobbyPlayers[pId];

        if (p.isDead) {
          if (p.respawnTimer > 0) {
            p.respawnTimer--;
            if (p.respawnTimer === 0) {
              p.isDead = false;
              p.score = 10;
              p.x = 200 + Math.random() * 2600;
              p.y = 200 + Math.random() * 2600;
              p.angle = Math.random() * Math.PI * 2;
              p.segments = [];
              for (let k = 0; k < 10; k++) {
                p.segments.push({ x: p.x - Math.cos(p.angle) * k * 15, y: p.y - Math.sin(p.angle) * k * 15 });
              }
              if (pId === localId) {
                setKillFeed((prev) => [
                  ...prev,
                  { id: `respawn_${Date.now()}`, victimName: 'SPECTATE', killerName: p.name, timestamp: Date.now() }
                ].slice(-5));
              }
            }
          }
          return;
        }

        Object.keys(p.abilities).forEach((abKey) => {
          const ab = p.abilities[abKey as keyof ActiveAbilities];
          if (ab.active && ab.duration > 0) {
            ab.duration--;
            if (ab.duration === 0) {
              ab.active = false;
            }
          }
        });

        const currentBaseSpeed = 5;
        const currentBoostSpeed = 9;
        p.speed = p.abilities.dash.active && p.score > 8 ? currentBoostSpeed : currentBaseSpeed;

        if (p.abilities.dash.active && p.score > 8) {
          p.score = Math.max(8, p.score - 0.08);
          if (Math.random() < 0.1) {
            const lastSeg = p.segments[p.segments.length - 1];
            currentSimState.orbs.push({
              id: `food_residue_${Date.now()}_${Math.random()}`,
              x: (lastSeg?.x || p.x) + (Math.random() - 0.5) * 15,
              y: (lastSeg?.y || p.y) + (Math.random() - 0.5) * 15,
              value: 2,
              color: '#06b6d4',
              isPremium: false,
            });
          }
        }

        if (p.isBot) {
          if (p.isBoss) {
            const sysLocalPlayer = activeLobbyPlayers[localId];
            if (sysLocalPlayer && !sysLocalPlayer.isDead) {
              p.angle = Math.atan2(sysLocalPlayer.y - p.y, sysLocalPlayer.x - p.x);
            } else if (Math.random() < 0.05) {
              p.angle += (Math.random() - 0.5) * 1.2;
            }

            if (Math.random() < 0.08) {
              const fireAngle = p.angle + (Math.random() - 0.5) * Math.PI;
              currentSimState.orbs.push({
                id: `boss_projectile_${Date.now()}_${Math.random()}`,
                x: p.x + Math.cos(fireAngle) * 80,
                y: p.y + Math.sin(fireAngle) * 80,
                value: 8,
                color: '#f43f5e',
                isPremium: true,
              });
            }
          } else {
            const diff = p.difficulty || 'medium';
            if (Math.random() < (diff === 'easy' ? 0.03 : diff === 'medium' ? 0.06 : 0.12)) {
              let nearestOrb: Orb | null = null;
              let minDist = diff === 'easy' ? 300 : diff === 'medium' ? 400 : 650;

              currentSimState.orbs.forEach((orb) => {
                const dist = Math.sqrt((orb.x - p.x) ** 2 + (orb.y - p.y) ** 2);
                if (dist < minDist) {
                  minDist = dist;
                  nearestOrb = orb;
                }
              });

              if (nearestOrb) {
                const tOrb = nearestOrb as Orb;
                let targetAngle = Math.atan2(tOrb.y - p.y, tOrb.x - p.x);
                if (diff === 'hard' && Math.random() < 0.3) {
                  const target = activeLobbyPlayers[localId];
                  if (target && !target.isDead) {
                    const pDist = Math.sqrt((target.x - p.x) ** 2 + (target.y - p.y) ** 2);
                    if (pDist < 250) {
                      const aheadX = target.x + Math.cos(target.angle) * 80;
                      const aheadY = target.y + Math.sin(target.angle) * 80;
                      targetAngle = Math.atan2(aheadY - p.y, aheadX - p.x);
                      p.abilities.dash.active = true;
                    }
                  }
                }
                p.angle = targetAngle;
              } else {
                p.angle += (Math.random() - 0.5) * 1.5;
              }
            }
          }
        }

        const nextX = p.x + Math.cos(p.angle) * p.speed;
        const nextY = p.y + Math.sin(p.angle) * p.speed;

        if (nextX < 0 || nextX > 3000 || nextY < 0 || nextY > 3000) {
          disintegrateOffline(pId, 'deep space magnetic wall');
          return;
        }

        if (mode === GameMode.BATTLE_ROYALE) {
          const dx = nextX - currentSimState.brCenter.x;
          const dy = nextY - currentSimState.brCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > currentSimState.brZoneRadius) {
            p.score = Math.max(0, p.score - 0.45);
            if (p.score <= 0.05) {
              disintegrateOffline(pId, 'the radioactive storm');
              return;
            }
          }
        }

        p.x = nextX;
        p.y = nextY;

        const head: Point = { x: p.x, y: p.y };
        p.segments.unshift(head);

        const targetLength = Math.floor(10 + (p.score - 10) * 1.5);
        while (p.segments.length > targetLength) {
          p.segments.pop();
        }

        for (let i = currentSimState.orbs.length - 1; i >= 0; i--) {
          const orb = currentSimState.orbs[i];
          const dx = orb.x - p.x;
          const dy = orb.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (p.abilities.magnet.active && dist < 160) {
            const pullSpeed = 4.5;
            orb.x -= (dx / dist) * pullSpeed;
            orb.y -= (dy / dist) * pullSpeed;
          }

          if (dist < 26) {
            p.score += orb.value * 0.35;
            currentSimState.orbs.splice(i, 1);

            if (pId === localId) {
              setLocalStats(2, 4);
            }
          }
        }
      });

      const activePlayersOffline = Object.values(currentSimState.players).filter((p) => !p.isDead);
      for (let u = 0; u < activePlayersOffline.length; u++) {
        const p1 = activePlayersOffline[u];
        if (p1.abilities.ghost.active) continue;

        for (let v = 0; v < activePlayersOffline.length; v++) {
          const p2 = activePlayersOffline[v];
          if (p1.id === p2.id) continue;
          if (p2.abilities.ghost.active) continue;

          for (let s = 1; s < p2.segments.length; s++) {
            const segment = p2.segments[s];
            const dx = p1.x - segment.x;
            const dy = p1.y - segment.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 25) {
              if (p1.abilities.shield.active) {
                p1.angle += Math.PI;
                p1.x += Math.cos(p1.angle) * p1.speed * 4;
                p1.y += Math.sin(p1.angle) * p1.speed * 4;
                break;
              } else {
                disintegrateOffline(p1.id, p2.name);
                if (!p1.isBoss) {
                  p2.kills++;
                  if (p2.id === localId) {
                    setLocalStats(60, 150, true);
                  }
                }
                break;
              }
            }
          }
        }
      }

      setPlayers({ ...currentSimState.players });
      setOrbs([...currentSimState.orbs]);
      setBrZoneRadius(currentSimState.brZoneRadius);
      setBrCenter({ ...currentSimState.brCenter });

    }, 50);
  };

  const handleJoinGame = (mode: GameMode, selectedRoomCode?: string) => {
    if (!user) return;

    setCurrentGameMode(mode);
    setRoomCode(selectedRoomCode || null);
    setIsPlaying(true);
    setIsReplaying(false);
    setPlayers({});
    setOrbs([]);
    setChatMessages([]);
    setKillFeed([]);

    SoundManager.startBackgroundMusic();

    // Sockets handshake timeout trigger (failsafe)
    const fallbackTimeout = setTimeout(() => {
      if (!socketRef.current || !socketRef.current.connected) {
        console.warn('Socket connection timed out! Booting off-line high performance fallback...');
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
        startOfflineSimulation(mode);
      }
    }, 1200);

    const socket = io({
      path: '/socket.io',
      transports: ['polling', 'websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      clearTimeout(fallbackTimeout);
      setIsOfflineMode(false);
      console.log('Orbital sockets connection bridged successfully: ', socket.id);
      
      socket.emit('game:join', {
        userId: user.id,
        username: user.username,
        mode,
        skin: user.selectedSkin,
        trail: user.selectedTrail,
        title: user.selectedTitle,
      });
    });

    socket.on('connect_error', (err) => {
      console.warn('Orbital sockets connect error:', err);
    });

    socket.on('game:state', (state: {
      players: Record<string, ServerPlayer>;
      orbs: Orb[];
      brZoneRadius: number;
      brCenter: Point;
    }) => {
      setPlayers(state.players);
      setOrbs(state.orbs);
      setBrZoneRadius(state.brZoneRadius);
      setBrCenter(state.brCenter);
    });

    socket.on('chat:receive', (msg: { id: string; username: string; message: string; timestamp: string }) => {
      setChatMessages((prev) => [...prev, msg].slice(-40));
    });

    socket.on('game:killfeed', (entry: KillFeedEntry) => {
      setKillFeed((prev) => [...prev, entry].slice(-5));
      setTimeout(() => {
        setKillFeed((prev) => prev.filter((item) => item.id !== entry.id));
      }, 6000);
    });

    socket.on('disconnect', () => {
      console.log('Orbital sockets disconnected.');
    });
  };

  const handleWatchReplay = async (matchId: string) => {
    if (!user) return;

    setIsPlaying(true);
    setIsReplaying(true);
    setPlayers({});
    setOrbs([]);
    setChatMessages([]);
    setKillFeed([]);

    SoundManager.startBackgroundMusic();

    try {
      const res = await fetch(`/api/replays/${matchId}`);
      if (!res.ok) {
        alert("Could not load selected replay files on the server.");
        handleExitGame();
        return;
      }
      const data = await res.json();
      if (!data || !data.frames || data.frames.length === 0) {
        alert("This record contains no slither snapshots.");
        handleExitGame();
        return;
      }

      setKillFeed([{
        id: 'replay_init_evt',
        victimName: 'COSMIC RECORDER',
        killerName: 'SPECTATE BOOT',
        timestamp: Date.now()
      }]);

      let frameIdx = 0;
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current);
      }

      replayIntervalRef.current = setInterval(() => {
        const frame = data.frames[frameIdx];
        if (!frame) {
          clearInterval(replayIntervalRef.current);
          replayIntervalRef.current = null;
          alert("Replay sequence completed.");
          handleExitGame();
          return;
        }

        const activePlayers: Record<string, ServerPlayer> = {};
        Object.keys(frame.players).forEach((pId) => {
          const raw = frame.players[pId];
          activePlayers[pId] = {
            id: pId,
            name: pId === 'world_boss_hydra' ? 'NEON HYDRA' : pId.includes('bot') ? 'SYSTEM BOT' : pId,
            x: raw.x,
            y: raw.y,
            angle: raw.angle,
            segments: raw.segments,
            score: raw.score,
            length: raw.segments.length,
            speed: 4,
            skin: pId === 'world_boss_hydra' ? 'galaxy' : 'neon_blue',
            trail: 'glow',
            title: pId === 'world_boss_hydra' ? 'WORLD BOSS [RAID]' : 'SPECTATE REC',
            isDead: false,
            isBot: pId.includes('bot'),
            isBoss: pId === 'world_boss_hydra',
            kills: 0,
            rank: 'BRONZE' as any,
            level: 1,
            respawnTimer: 0,
            abilities: {
              shield: { active: false, duration: 0 },
              magnet: { active: false, duration: 0 },
              ghost: { active: false, duration: 0 },
              dash: { active: false, duration: 0 }
            }
          };
        });

        const activeOrbs: Orb[] = frame.orbs.map((o: any) => ({
          id: o.id,
          x: o.x,
          y: o.y,
          value: o.premium ? 10 : 3,
          color: o.premium ? '#fbbf24' : '#38bdf8',
          isPremium: o.premium
        }));

        setPlayers(activePlayers);
        setOrbs(activeOrbs);

        frameIdx++;
      }, 200);
    } catch (e) {
      console.warn("Spectator play failed:", e);
      handleExitGame();
    }
  };

  const handleInputChange = (angle: number, isBoosting: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:input', { angle, isBoosting });
    } else if (isOfflineMode && user) {
      const currentSimState = simStateRef.current;
      const player = currentSimState.players[user.id];
      if (player && !player.isDead) {
        player.angle = angle;
        player.abilities.dash.active = isBoosting && player.score > 8;
      }
    }
  };

  const handleTriggerAbility = (type: 'shield' | 'magnet' | 'ghost') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:ability', { type });
    } else if (isOfflineMode && user) {
      const currentSimState = simStateRef.current;
      const player = currentSimState.players[user.id];
      if (player && !player.isDead && !player.abilities[type].active) {
        if (type === 'shield') SoundManager.playShieldActivate();
        else if (type === 'magnet') SoundManager.playPremiumOrbEat();
        else SoundManager.playVictoryArpeggio();

        player.abilities[type].active = true;
        player.abilities[type].duration = type === 'shield' ? 80 : type === 'magnet' ? 120 : 60;
        setPlayers({ ...currentSimState.players });
      }
    }
  };

  const handleSendChatMessage = (message: string) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('chat:broadcast', {
        username: user.username,
        message,
      });
    } else if (isOfflineMode && user && message.trim()) {
      const userMsg = {
        id: `chat_off_usr_${Date.now()}`,
        username: user.username,
        message: message.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, userMsg].slice(-45));

      const botResponses = [
        "ViperBot: Stealth maneuvers activated! Watch your six!",
        "CyberCrawler: Press Click/Space to accelerate! Boost and cut them off!",
        "HyperCrawl: There's a massive cluster of space coordinates at the center!",
        "CORETEX_SYS_BOT: Mass intake is critical to scale up and survive!",
        "SYS_BOT: Did you see that? You slithered right past a premium golden orb!",
        "AstroSlink: Watch your coordinate boundaries, there's a deep space wall!"
      ];
      setTimeout(() => {
        const botResponse = {
          id: `chat_off_bot_${Date.now()}`,
          username: 'CORETEX_SYS_BOT',
          message: botResponses[Math.floor(Math.random() * botResponses.length)],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages((prev) => [...prev, botResponse].slice(-45));
        SoundManager.playOrbEat();
      }, 1000 + Math.random() * 1500);
    }
  };

  const handleExitGame = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }

    if (localSimIntervalRef.current) {
      clearInterval(localSimIntervalRef.current);
      localSimIntervalRef.current = null;
    }

    setIsPlaying(false);
    setIsReplaying(false);
    setIsOfflineMode(false);

    SoundManager.stopBackgroundMusic();

    if (user) {
      fetch(`/api/users/${user.id}`)
        .then((res) => res.json())
        .then((freshUser) => {
          if (freshUser && !freshUser.error) {
            setUser(freshUser);
          }
        })
        .catch((err) => console.log('Error refreshing profile statistics', err));
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    SoundManager.setSoundEnabled(next);
  };

  return (
    <div className="w-screen h-screen bg-[#050505] text-white overflow-hidden relative">
      {isPlaying ? (
        <div className="relative w-full h-full">
          <GameCanvas
            players={players}
            orbs={orbs}
            localPlayerId={user?.id || null}
            mode={currentGameMode}
            brZoneRadius={brZoneRadius}
            brCenter={brCenter}
            onInputChange={handleInputChange}
          />
          <GameUI
            players={players}
            orbs={orbs}
            localPlayerId={user?.id || null}
            mode={currentGameMode}
            brZoneRadius={brZoneRadius}
            brCenter={brCenter}
            onTriggerAbility={handleTriggerAbility}
            onSendChat={handleSendChatMessage}
            onExitGame={handleExitGame}
            chatMessages={chatMessages}
            killFeed={killFeed}
          />
        </div>
      ) : (
        <div className="relative w-full h-full select-none">
          <MainMenu
            user={user}
            onLogin={handleLogin}
            onJoinGame={handleJoinGame}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            onWatchReplay={handleWatchReplay}
          />

          {user && user.role === 'admin' && (
            <button
              onClick={() => {
                SoundManager.playShieldActivate();
                setIsAdminPanelOpen(true);
              }}
              className="absolute bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-650 hover:from-cyan-400 hover:to-indigo-550 text-white shadow-xl hover:shadow-cyan-450/20 active:translate-y-0.5 transition-all z-40 cursor-pointer pointer-events-auto"
              title="Open Admin Control Panels"
            >
              <Shield className="w-5.5 h-5.5 animate-pulse" />
            </button>
          )}

          {isAdminPanelOpen && user && (
            <AdminPanel
              localUserId={user.id}
              onClose={() => setIsAdminPanelOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
}
