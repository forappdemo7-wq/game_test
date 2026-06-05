/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode, UserProfile, ServerPlayer, Orb, Point, KillFeedEntry } from '@/types';
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

  const handleJoinGame = (mode: GameMode, selectedRoomCode?: string) => {
    if (!user) return;

    setCurrentGameMode(mode);
    setRoomCode(selectedRoomCode || null);
    setIsPlaying(true);
    setPlayers({});
    setOrbs([]);
    setChatMessages([]);
    setKillFeed([]);

    const socket = io({
      path: '/socket.io',
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
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

  const handleInputChange = (angle: number, isBoosting: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:input', { angle, isBoosting });
    }
  };

  const handleTriggerAbility = (type: 'shield' | 'magnet' | 'ghost') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:ability', { type });
    }
  };

  const handleSendChatMessage = (message: string) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('chat:broadcast', {
        username: user.username,
        message,
      });
    }
  };

  const handleExitGame = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsPlaying(false);

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
