/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { ServerPlayer, Orb, Point, GameMode } from '@/types';
import { SoundManager } from './SoundManager';

interface GameCanvasProps {
  players: Record<string, ServerPlayer>;
  orbs: Orb[];
  localPlayerId: string | null;
  mode: GameMode;
  brZoneRadius: number;
  brCenter: Point;
  onInputChange: (angle: number, isBoosting: boolean) => void;
}

interface CameraShake {
  intensity: number;
  decay: number;
}

interface FloatingScore {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  opacity: number;
  age: number;
}

interface VisualParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  players,
  orbs,
  localPlayerId,
  mode,
  brZoneRadius,
  brCenter,
  onInputChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Local state tracking
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [joystickPos, setJoystickPos] = useState({ active: false, startX: 0, startY: 0, curX: 0, curY: 0 });

  const stateRef = useRef({
    players,
    orbs,
    localPlayerId,
    interpolatedPlayers: {} as Record<string, { x: number; y: number; angle: number; segments: Point[] }>,
    shaker: { intensity: 0, decay: 0.9 } as CameraShake,
    particles: [] as VisualParticle[],
    scores: [] as FloatingScore[],
    lastLocalScore: 10,
    lastActiveKills: 0,
    nebulaOffset: 0,
  });

  const isBoostingRef = useRef(false);

  // Dynamic window resizing with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Synchronise socket updates to canvas engine state refs
  useEffect(() => {
    stateRef.current.players = players;
    stateRef.current.orbs = orbs;
    stateRef.current.localPlayerId = localPlayerId;

    if (localPlayerId && players[localPlayerId]) {
      const p = players[localPlayerId];
      if (p.score > stateRef.current.lastLocalScore) {
        const diff = p.score - stateRef.current.lastLocalScore;
        if (diff > 3) {
          SoundManager.playPremiumOrbEat();
        } else {
          SoundManager.playOrbEat();
        }

        stateRef.current.scores.push({
          id: `score_${Date.now()}_${Math.random()}`,
          x: p.x + (Math.random() - 0.5) * 30,
          y: p.y - 20,
          text: `+${diff}`,
          color: '#34d399',
          opacity: 1,
          age: 0,
        });

        stateRef.current.lastLocalScore = p.score;
      }

      if (p.isDead && stateRef.current.lastLocalScore > 10) {
        SoundManager.playDeathExplosion();
        stateRef.current.shaker.intensity = 25;
        spawnExplosion(p.x, p.y, '#f43f5e');
        stateRef.current.lastLocalScore = 10;
      }
    }

    Object.keys(players).forEach((id) => {
      const curr = players[id];
      const prev = stateRef.current.interpolatedPlayers[id];
      if (curr.isDead && prev && !curr.isBot) {
        stateRef.current.shaker.intensity = Math.max(stateRef.current.shaker.intensity, 15);
        spawnExplosion(curr.x, curr.y, '#ef4444');
      }
    });

  }, [players, orbs, localPlayerId]);

  const spawnExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 8;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  // Canvas Core Renderer Loop (rAF)
  useEffect(() => {
    let animationId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      ctx.fillStyle = '#020205';
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const refState = stateRef.current;
      const localId = refState.localPlayerId;
      const localPlayer = localId && refState.players[localId] ? refState.players[localId] : null;

      // Coordinate Interpolations (Delta-time Lerping)
      Object.keys(refState.players).forEach((id) => {
        const servo = refState.players[id];
        if (!refState.interpolatedPlayers[id]) {
          refState.interpolatedPlayers[id] = {
            x: servo.x,
            y: servo.y,
            angle: servo.angle,
            segments: JSON.parse(JSON.stringify(servo.segments)),
          };
        } else {
          const inter = refState.interpolatedPlayers[id];
          inter.x += (servo.x - inter.x) * 0.2;
          inter.y += (servo.y - inter.y) * 0.2;
          inter.angle += Math.sin(servo.angle - inter.angle) * 0.25;

          if (inter.segments.length !== servo.segments.length) {
            inter.segments = JSON.parse(JSON.stringify(servo.segments));
          } else {
            for (let i = 0; i < inter.segments.length; i++) {
              if (servo.segments[i]) {
                inter.segments[i].x += (servo.segments[i].x - inter.segments[i].x) * 0.25;
                inter.segments[i].y += (servo.segments[i].y - inter.segments[i].y) * 0.25;
              }
            }
          }
        }
      });

      let camX = 1500;
      let camY = 1500;
      let zoom = 1.0;

      if (localPlayer) {
        const interLocal = refState.interpolatedPlayers[localId!];
        if (interLocal) {
          camX = interLocal.x;
          camY = interLocal.y;
        }

        const growthFactor = Math.min(0.35, (localPlayer.score - 10) / 450);
        zoom = 1.0 - growthFactor;

        if (localPlayer.abilities.dash.active) {
          zoom *= 0.93;
        }
      }

      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (refState.shaker.intensity > 0.1) {
        shakeOffsetX = (Math.random() - 0.5) * refState.shaker.intensity;
        shakeOffsetY = (Math.random() - 0.5) * refState.shaker.intensity;
        refState.shaker.intensity *= refState.shaker.decay;
      }

      ctx.save();
      ctx.translate(dimensions.width / 2 + shakeOffsetX, dimensions.height / 2 + shakeOffsetY);
      ctx.scale(zoom, zoom);
      ctx.translate(-camX, -camY);

      // Parallax Grid Tiles Drawing
      ctx.save();
      ctx.strokeStyle = '#0e1124';
      ctx.lineWidth = 1.0;
      const gridSize = 100;
      const startX = Math.max(0, Math.floor((camX - dimensions.width / 2 / zoom) / gridSize) * gridSize);
      const endX = Math.min(3000, Math.floor((camX + dimensions.width / 2 / zoom) / gridSize) * gridSize + gridSize);
      const startY = Math.max(0, Math.floor((camY - dimensions.height / 2 / zoom) / gridSize) * gridSize);
      const endY = Math.min(3000, Math.floor((camY + dimensions.height / 2 / zoom) / gridSize) * gridSize + gridSize);

      for (let x = startX; x <= endX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
      }
      for (let y = startY; y <= endY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
      }
      ctx.restore();

      // Nebula Celestial Background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 60; i++) {
        const starX = ((i * 57) % 3000) + (camX * 0.15);
        const starY = ((i * 83) % 3000) + (camY * 0.15);
        ctx.fillRect(((starX % 3000) + 3000) % 3000, ((starY % 3000) + 3000) % 3000, 2, 2);
      }

      // Drawing Glowing Energy Orbs
      refState.orbs.forEach((orb) => {
        const margin = 50;
        if (
          orb.x < camX - dimensions.width / 2 / zoom - margin ||
          orb.x > camX + dimensions.width / 2 / zoom + margin ||
          orb.y < camY - dimensions.height / 2 / zoom - margin ||
          orb.y > camY + dimensions.height / 2 / zoom + margin
        ) {
          return;
        }

        ctx.save();
        ctx.beginPath();
        const rad = orb.isPremium ? 9 : 5;
        ctx.arc(orb.x, orb.y, rad, 0, Math.PI * 2);

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 1, orb.x, orb.y, rad * 3.5);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, orb.color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = orb.isPremium ? 20 : 8;
        ctx.fill();

        if (orb.isPremium) {
          ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
          ctx.lineWidth = 1.5;
          const cycle = (Date.now() / 150) % (Math.PI * 2);
          const raySize = 14 + Math.sin(cycle) * 4;

          ctx.beginPath();
          ctx.moveTo(orb.x - raySize, orb.y);
          ctx.lineTo(orb.x + raySize, orb.y);
          ctx.moveTo(orb.x, orb.y - raySize);
          ctx.lineTo(orb.x, orb.y + raySize);
          ctx.stroke();
        }
        ctx.restore();
      });

      // Render Snakes
      Object.keys(refState.players).forEach((id) => {
        const player = refState.players[id];
        const inter = refState.interpolatedPlayers[id];

        if (player.isDead || !inter || !inter.segments || inter.segments.length === 0) return;

        const margin = 200;
        if (
          inter.x < camX - dimensions.width / 2 / zoom - margin ||
          inter.x > camX + dimensions.width / 2 / zoom + margin ||
          inter.y < camY - dimensions.height / 2 / zoom - margin ||
          inter.y > camY + dimensions.height / 2 / zoom + margin
        ) {
          const lastSeg = inter.segments[inter.segments.length - 1];
          if (
            !lastSeg ||
            lastSeg.x < camX - dimensions.width / 2 / zoom - margin ||
            lastSeg.x > camX + dimensions.width / 2 / zoom + margin ||
            lastSeg.y < camY - dimensions.height / 2 / zoom - margin ||
            lastSeg.y > camY + dimensions.height / 2 / zoom + margin
          ) {
            return;
          }
        }

        ctx.save();

        if (player.abilities.ghost.active) {
          ctx.globalAlpha = 0.45;
        }

        const numSegments = inter.segments.length;
        const widthRangeArr = Array.from({ length: numSegments }, (_, idx) => {
          const progress = idx / numSegments;
          return 14 + (1 - progress) * 8;
        });

        // Slither Trails
        if (player.trail && player.trail !== 'none' && Math.random() < 0.15) {
          const tail = inter.segments[numSegments - 1] || inter;
          let pColor = '#3b82f6';
          if (player.trail === 'fire_trail') pColor = '#f97316';
          if (player.trail === 'galaxy_trail') pColor = '#c084fc';

          refState.particles.push({
            x: tail.x + (Math.random() - 0.5) * 15,
            y: tail.y + (Math.random() - 0.5) * 15,
            vx: -Math.cos(inter.angle) * (1 + Math.random() * 2),
            vy: -Math.sin(inter.angle) * (1 + Math.random() * 2),
            size: 3 + Math.random() * 4,
            color: pColor,
            alpha: 1.0,
            decay: 0.04,
          });
        }

        // Draw segments back-to-front
        for (let i = numSegments - 1; i >= 0; i--) {
          const seg = inter.segments[i];
          if (!seg) continue;

          ctx.beginPath();
          const rad = widthRangeArr[i];
          ctx.arc(seg.x, seg.y, rad, 0, Math.PI * 2);

          let fillGradient = '#3b82f6';
          let shadowColor = 'transparent';

          if (player.skin === 'neon_red') {
            fillGradient = '#f43f5e';
            shadowColor = 'rgba(244, 63, 94, 0.6)';
          } else if (player.skin === 'neon_blue') {
            fillGradient = '#06b6d4';
            shadowColor = 'rgba(6, 182, 212, 0.6)';
          } else if (player.skin === 'fire') {
            const grad = ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, rad);
            grad.addColorStop(0, '#fde047');
            grad.addColorStop(0.6, '#ea580c');
            grad.addColorStop(1, '#9a3412');
            fillGradient = grad as any;
            shadowColor = 'rgba(234, 88, 12, 0.7)';
          } else if (player.skin === 'ice') {
            const grad = ctx.createRadialGradient(seg.x, seg.y, 2, seg.x, seg.y, rad);
            grad.addColorStop(0, '#ffffff');
            grad.addColorStop(0.5, '#67e8f9');
            grad.addColorStop(1, '#1d4ed8');
            fillGradient = grad as any;
            shadowColor = 'rgba(103, 232, 249, 0.5)';
          } else if (player.skin === 'galaxy') {
            const grad = ctx.createRadialGradient(seg.x - rad/3, seg.y - rad/3, 1, seg.x, seg.y, rad);
            grad.addColorStop(0, '#d8b4fe');
            grad.addColorStop(0.4, '#a855f7');
            grad.addColorStop(1, '#3b0764');
            fillGradient = grad as any;
            shadowColor = 'rgba(168, 85, 247, 0.6)';
          } else if (player.skin === 'shadow') {
            const grad = ctx.createRadialGradient(seg.x, seg.y, rad * 0.4, seg.x, seg.y, rad);
            grad.addColorStop(0, '#111827');
            grad.addColorStop(0.8, '#030712');
            grad.addColorStop(1, '#818cf8');
            fillGradient = grad as any;
            shadowColor = 'rgba(129, 140, 248, 0.4)';
          } else if (player.skin === 'gold') {
            const grad = ctx.createRadialGradient(seg.x - rad/4, seg.y - rad/4, 2, seg.x, seg.y, rad);
            grad.addColorStop(0, '#fef08a');
            grad.addColorStop(0.5, '#eab308');
            grad.addColorStop(1, '#854d0e');
            fillGradient = grad as any;
            shadowColor = 'rgba(234, 179, 8, 0.7)';
          } else if (player.skin === 'rainbow') {
            const offsetCycle = (Date.now() / 400 + i * 0.3) % (Math.PI * 2);
            const r = Math.floor(127 + Math.sin(offsetCycle) * 127);
            const g = Math.floor(127 + Math.sin(offsetCycle + Math.PI*(2/3)) * 127);
            const b = Math.floor(127 + Math.sin(offsetCycle + Math.PI*(4/3)) * 127);
            fillGradient = `rgb(${r}, ${g}, ${b})`;
            shadowColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
          }

          ctx.fillStyle = fillGradient;
          if (shadowColor !== 'transparent' && i % 3 === 0) {
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = rad * 0.75;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Draw names labels above the head
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';

        const crownTitle = player.title ? `[${player.title}] ` : '';
        ctx.fillText(crownTitle + player.name, inter.x, inter.y - 35);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '9px monospace';
        ctx.fillText(`Lvl ${player.level} (${player.rank})`, inter.x, inter.y - 23);
        ctx.restore();

        // Draw head, crown and face features
        ctx.save();
        ctx.translate(inter.x, inter.y);
        ctx.rotate(inter.angle);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, -8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(8, -8, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(6, 8, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(8, 8, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (player.rank === 'Legend' || player.title === 'Snake Legend' || id === localId) {
          ctx.save();
          ctx.translate(-2, 0);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(-10, -8);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-2, -12);
          ctx.lineTo(0, -6);
          ctx.lineTo(6, -8);
          ctx.lineTo(4, 4);
          ctx.lineTo(-8, 4);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        ctx.restore();

        // Capabilities visual bubbles overlays
        if (player.abilities.shield.active) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(inter.x, inter.y, 42, 0, Math.PI * 2);
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3.0;

          const cyclePulse = 0.5 + Math.sin(Date.now() / 100) * 0.25;
          ctx.globalAlpha = cyclePulse * 0.85;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 18;
          ctx.stroke();
          ctx.restore();
        }

        if (player.abilities.magnet.active) {
          ctx.save();
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 1.5;
          const ringRad = 45 + (Date.now() / 15) % 65;
          ctx.arc(inter.x, inter.y, ringRad, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      });

      // Drawing Battle Royale Storm collapsed bounds
      if (mode === GameMode.BATTLE_ROYALE && brZoneRadius < 2000) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(brCenter.x, brCenter.y, brZoneRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.lineWidth = 6 + Math.sin(Date.now() / 80) * 2;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 24;
        ctx.stroke();

        ctx.beginPath();
        ctx.rect(-200, -200, 3400, 3400);
        ctx.arc(brCenter.x, brCenter.y, brZoneRadius, 0, Math.PI * 2, true);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.fill();
        ctx.restore();
      }

      // Drawing bounds limits walls
      ctx.save();
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 8;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.strokeRect(0, 0, 3000, 3000);

      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('WARNING: DEEP SPACE LIMITS - SYSTEM CRITICAL BARRIER', 1500, 50);
      ctx.fillText('WARNING: DEEP SPACE LIMITS - SYSTEM CRITICAL BARRIER', 1500, 2950);
      ctx.restore();

      // Rendering Particles & floating scores label lines
      ctx.save();
      refState.particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0.05) {
          refState.particles.splice(index, 1);
          return;
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      ctx.save();
      refState.scores.forEach((s, sIdx) => {
        s.y -= 1.0;
        s.age += 1;
        s.opacity = Math.max(0, 1.0 - s.age / 50);

        if (s.opacity <= 0.01) {
          refState.scores.splice(sIdx, 1);
          return;
        }

        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.opacity;
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(s.text, s.x, s.y);
      });
      ctx.restore();

      ctx.restore(); // camera end

      // Mobile joystick drawing
      if (joystickPos.active) {
        ctx.save();
        const baseRadius = 55;
        const knobRadius = 22;

        ctx.beginPath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.lineWidth = 2.0;
        ctx.arc(joystickPos.startX, joystickPos.startY, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.fillStyle = 'rgba(6, 182, 212, 0.45)';
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3.0;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        ctx.arc(joystickPos.curX, joystickPos.curY, knobRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [dimensions, joystickPos]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const refState = stateRef.current;
    const localId = refState.localPlayerId;
    if (!localId || !refState.players[localId]) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const cursorRelativeX = e.clientX - rect.left - dimensions.width / 2;
    const cursorRelativeY = e.clientY - rect.top - dimensions.height / 2;

    const angle = Math.atan2(cursorRelativeY, cursorRelativeX);
    onInputChange(angle, isBoostingRef.current);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    if (!touch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = touch.clientX - rect.left;
    const ry = touch.clientY - rect.top;

    setJoystickPos({
      active: true,
      startX: rx,
      startY: ry,
      curX: rx,
      curY: ry,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!joystickPos.active) return;
    const touch = e.touches[0];
    if (!touch) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const rx = touch.clientX - rect.left;
    const ry = touch.clientY - rect.top;

    let dx = rx - joystickPos.startX;
    let dy = ry - joystickPos.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxLimitRadius = 55;

    if (dist > maxLimitRadius) {
      dx = (dx / dist) * maxLimitRadius;
      dy = (dy / dist) * maxLimitRadius;
    }

    setJoystickPos((p) => ({
      ...p,
      curX: p.startX + dx,
      curY: p.startY + dy,
    }));

    const angle = Math.atan2(dy, dx);
    onInputChange(angle, isBoostingRef.current);
  };

  const handleTouchEnd = () => {
    setJoystickPos({ active: false, startX: 0, startY: 0, curX: 0, curY: 0 });
    onInputChange(stateRef.current.players[localPlayerId || '']?.angle || 0, false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space') {
        e.preventDefault();
        isBoostingRef.current = true;
        const refState = stateRef.current;
        const local = localPlayerId && refState.players[localPlayerId];
        if (local) {
          onInputChange(local.angle, true);
          SoundManager.playBoost();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        isBoostingRef.current = false;
        const refState = stateRef.current;
        const local = localPlayerId && refState.players[localPlayerId];
        if (local) {
          onInputChange(local.angle, false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [localPlayerId, onInputChange]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden cursor-crosshair">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => {
          SoundManager.playOrbEat();
        }}
        id="game_rendering_canvas"
        className="block"
      />
    </div>
  );
};
export default GameCanvas;
