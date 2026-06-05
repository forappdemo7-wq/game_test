/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameMode, UserProfile, ServerPlayer, Orb, Point, KillFeedEntry } from '@/src/types';
import { MainMenu } from '@/src/components/MainMenu';
import { ThreeGameCanvas } from '@/src/components/ThreeGameCanvas';
import { GameUI } from '@/src/components/GameUI';
import { AdminPanel } from '@/src/components/AdminPanel';
import { SoundManager } from '@/src/components/SoundManager';
import { Shield } from 'lucide-react';

export default function App() {
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

  // Clean local storage pilot sessions trigger
  useEffect(() => {
    const cachedUserId = localStorage.getItem('snake_legends_user_id');
    const cachedUsername = localStorage.getItem('snake_legends_username');

    if (cachedUserId) {
      // Login matching credentials
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

  // Standard credential submissions
  const handleLogin = async (username: string) => {
    // Generate static ID once
    const newUserId = `pilot_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUserId, username, email: 'forappdemo7@gmail.com' }), // make user admin for quick previews
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

  // Launching multiplayer orbit gate
  const handleJoinGame = (mode: GameMode, selectedRoomCode?: string) => {
    if (!user) return;

    setCurrentGameMode(mode);
    setRoomCode(selectedRoomCode || null);
    setIsPlaying(true);
    setPlayers({});
    setOrbs([]);
    setChatMessages([]);
    setKillFeed([]);

    // Establish Socket.io socket pipeline
    // Connects seamlessly with custom socket path defined inside Next.js pages handler
    fetch('/api/socket')
      .then(() => {
        const socket = io({
          path: '/api/socket',
          transports: ['websocket'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Orbital sockets connection bridged successfully: ', socket.id);
          
          // Submit join manifest
          socket.emit('game:join', {
            userId: user.id,
            username: user.username,
            mode,
            skin: user.selectedSkin,
            trail: user.selectedTrail,
            title: user.selectedTitle,
          });
        });

        // Handle real-time snapshot loads
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

        // Inbound in-lobby messaging packets
        socket.on('chat:receive', (msg: { id: string; username: string; message: string; timestamp: string }) => {
          setChatMessages((prev) => [...prev, msg].slice(-40)); // keep last 40 coms
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
      })
      .catch((err) => {
        console.error('Failed to trigger Socket.IO server setup API route:', err);
      });
  };

  // Dynamic Input changes (mouse vector triggers / joysticks moves)
  const handleInputChange = (angle: number, isBoosting: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:input', { angle, isBoosting });
    }
  };

  // Trigger active capabilities cast
  const handleTriggerAbility = (type: 'shield' | 'magnet' | 'ghost') => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('player:ability', { type });
    }
  };

  // Dispatch mid-flight com messages
  const handleSendChatMessage = (message: string) => {
    if (socketRef.current && socketRef.current.connected && user) {
      socketRef.current.emit('chat:broadcast', {
        username: user.username,
        message,
      });
    }
  };

  // Exit match, closing socket connection and synching profile stats
  const handleExitGame = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsPlaying(false);

    // Refresh profile state stats instantly from centralized store
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
        /* ACTIVE IN-ARENA VIEW */
        <div className="relative w-full h-full">
          <ThreeGameCanvas
            players={players}
            orbs={orbs}
            localPlayerId={user?.id || null}
            mode={currentGameMode}
            brZoneRadius={brZoneRadius}
            brCenter={brCenter}
            onInputChange={handleInputChange}
            onTriggerAbility={handleTriggerAbility}
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
        /* COCKPIT MENU LAYERS */
        <div className="relative w-full h-full select-none">
          <MainMenu
            user={user}
            onLogin={handleLogin}
            onJoinGame={handleJoinGame}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
          />

          {/* Admin Toggle button displayed exclusively for Admins */}
          {user && user.role === 'admin' && (
            <button
              onClick={() => {
                SoundManager.playShieldActivate();
                setIsAdminPanelOpen(true);
              }}
              className="absolute bottom-6 right-6 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl hover:shadow-cyan-400/20 active:translate-y-0.5 transition-all z-40 cursor-pointer pointer-events-auto"
              title="Open Admin Control Panels"
            >
              <Shield className="w-5.5 h-5.5 animate-pulse" />
            </button>
          )}

          {/* Core admin diagnostics display overlay */}
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
