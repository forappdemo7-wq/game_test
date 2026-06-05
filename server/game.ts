/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, ServerPlayer, Orb, Point, PlayerRank, ActiveAbilities, ServerGameState } from '../types';
import { DBInstance } from './store';

const TICK_RATE = 20; // 20 ticks per second (50ms loop)
const ARENA_SIZE = 3000;
const BASE_SPEED = 5;
const BOOST_SPEED = 9;

class autorunGameController {
  public state: Record<GameMode, ServerGameState> = {
    [GameMode.CASUAL]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600 },
    [GameMode.RANKED]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600 },
    [GameMode.BATTLE_ROYALE]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: 2000, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600 },
    [GameMode.PRIVATE]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600 },
  };

  public onKill: (mode: GameMode, victimName: string, killerName: string) => void = () => {};

  constructor() {
    this.initLobbies();
    this.startLoop();
  }

  private initLobbies() {
    Object.keys(this.state).forEach((modeKey) => {
      const mode = modeKey as GameMode;
      this.spawnOrbs(mode, 150);
      if (mode === GameMode.CASUAL || mode === GameMode.RANKED) {
        // Spawn active bot gliders
        for (let i = 0; i < 8; i++) {
          this.spawnBot(mode);
        }
      }
    });
  }

  private spawnOrbs(mode: GameMode, count: number) {
    const state = this.state[mode];
    for (let i = 0; i < count; i++) {
      state.orbs.push({
        id: `orb_${Date.now()}_${Math.random()}`,
        x: Math.random() * ARENA_SIZE,
        y: Math.random() * ARENA_SIZE,
        value: Math.random() < 0.1 ? 6 : 2,
        color: this.getRandomColor(),
        isPremium: Math.random() < 0.1,
      });
    }
  }

  private spawnBot(mode: GameMode) {
    const id = `bot_${Math.floor(Math.random() * 1000000)}`;
    const names = ['ViperBot', 'CruiserGlider', 'NeonStrike', 'CobaltCrawl', 'QuantumLoop', 'ApexGlider', 'GlitchGiga', 'SentinelX'];
    const name = `${names[Math.floor(Math.random() * names.length)]}_${Math.floor(Math.random() * 99)}`;
    
    const x = 200 + Math.random() * (ARENA_SIZE - 400);
    const y = 200 + Math.random() * (ARENA_SIZE - 400);
    const angle = Math.random() * Math.PI * 2;
    
    // Set segments
    const segments: Point[] = [];
    for (let i = 0; i < 12; i++) {
      segments.push({ x: x - Math.cos(angle) * i * 15, y: y - Math.sin(angle) * i * 15 });
    }

    const bot: ServerPlayer = {
      id,
      name,
      isBot: true,
      skin: this.getRandomSkin(),
      trail: 'none',
      title: 'Bot Opponent',
      x,
      y,
      angle,
      segments,
      score: 12,
      length: 12,
      speed: BASE_SPEED,
      isDead: false,
      respawnTimer: 0,
      abilities: {
        dash: { active: false, duration: 0 },
        shield: { active: false, duration: 0 },
        magnet: { active: false, duration: 0 },
        ghost: { active: false, duration: 0 },
      },
      rank: PlayerRank.GOLD,
      level: Math.floor(2 + Math.random() * 15),
      kills: 0,
    };

    this.state[mode].players[id] = bot;
  }

  public addPlayer(
    userId: string,
    username: string,
    mode: GameMode,
    skin: string,
    trail: string,
    title: string,
    rank: PlayerRank,
    level: number
  ) {
    const state = this.state[mode];
    const x = 200 + Math.random() * (ARENA_SIZE - 400);
    const y = 200 + Math.random() * (ARENA_SIZE - 400);
    const angle = Math.random() * Math.PI * 2;

    const segments: Point[] = [];
    for (let i = 0; i < 10; i++) {
      segments.push({ x: x - Math.cos(angle) * i * 15, y: y - Math.sin(angle) * i * 15 });
    }

    const player: ServerPlayer = {
      id: userId,
      name: username,
      isBot: false,
      skin,
      trail,
      title,
      x,
      y,
      angle,
      segments,
      score: 10,
      length: 10,
      speed: BASE_SPEED,
      isDead: false,
      respawnTimer: 0,
      abilities: {
        dash: { active: false, duration: 0 },
        shield: { active: false, duration: 0 },
        magnet: { active: false, duration: 0 },
        ghost: { active: false, duration: 0 },
      },
      rank,
      level,
      kills: 0,
    };

    state.players[userId] = player;
  }

  public removePlayer(userId: string, mode: GameMode) {
    if (this.state[mode].players[userId]) {
      delete this.state[mode].players[userId];
    }
  }

  public updatePlayerInput(userId: string, mode: GameMode, data: { angle: number; isBoosting: boolean }) {
    const player = this.state[mode].players[userId];
    if (player && !player.isDead) {
      player.angle = data.angle;
      player.abilities.dash.active = data.isBoosting && player.score > 8;
    }
  }

  public triggerAbility(userId: string, mode: GameMode, type: 'shield' | 'magnet' | 'ghost') {
    const player = this.state[mode].players[userId];
    if (player && !player.isDead) {
      player.abilities[type].active = true;
      player.abilities[type].duration = type === 'shield' ? 80 : type === 'magnet' ? 120 : 60; // ticks (3 to 6 seconds)
    }
  }

  private startLoop() {
    setInterval(() => {
      Object.keys(this.state).forEach((modeKey) => {
        const mode = modeKey as GameMode;
        this.updateLobby(mode);
      });
    }, 1000 / TICK_RATE);
  }

  private updateLobby(mode: GameMode) {
    const state = this.state[mode];

    // Shrink Battle Royale Storm Zone smoothly
    if (mode === GameMode.BATTLE_ROYALE) {
      state.brZoneRadius = Math.max(120, state.brZoneRadius - 0.45);
    }

    // Spawn replacement elements
    if (state.orbs.length < 150) {
      this.spawnOrbs(mode, 12);
    }

    // Re-population system bots
    const botCount = Object.values(state.players).filter((p) => p.isBot && !p.isDead).length;
    if (botCount < 8 && (mode === GameMode.CASUAL || mode === GameMode.RANKED)) {
      this.spawnBot(mode);
    }

    // Ticks active gliders
    Object.keys(state.players).forEach((id) => {
      const p = state.players[id];

      if (p.isDead) {
        if (p.respawnTimer > 0) {
          p.respawnTimer--;
          if (p.respawnTimer === 0) {
            this.respawnPlayer(p, mode);
          }
        }
        return;
      }

      // Decrement duration of spells
      Object.keys(p.abilities).forEach((abKey) => {
        const ab = p.abilities[abKey as keyof ActiveAbilities];
        if (ab.active && ab.duration > 0) {
          ab.duration--;
          if (ab.duration === 0) {
            ab.active = false;
          }
        }
      });

      // Update speed value references
      p.speed = p.abilities.dash.active ? BOOST_SPEED : BASE_SPEED;

      // Exhaust Mass consumption logic
      if (p.abilities.dash.active && p.score > 8) {
        p.score = Math.max(8, p.score - 0.08);

        // Spawn trailing residues
        if (Math.random() < 0.2) {
          const lastSeg = p.segments[p.segments.length - 1];
          state.orbs.push({
            id: `food_residue_${Date.now()}_${Math.random()}`,
            x: (lastSeg?.x || p.x) + (Math.random() - 0.5) * 15,
            y: (lastSeg?.y || p.y) + (Math.random() - 0.5) * 15,
            value: 2,
            color: '#06b6d4',
            isPremium: false,
          });
        }
      }

      // Check bot auto piloting vectors update
      if (p.isBot) {
        this.updateBotPathfinding(p, state);
      }

      // Calculate Head Coordinates
      const nextX = p.x + Math.cos(p.angle) * p.speed;
      const nextY = p.y + Math.sin(p.angle) * p.speed;

      // Deep Space Boundary Limits Check
      if (nextX < 0 || nextX > ARENA_SIZE || nextY < 0 || nextY > ARENA_SIZE) {
        this.disintegrate(p, mode, 'wall');
        return;
      }

      // Battle Royale Storm damage checks
      if (mode === GameMode.BATTLE_ROYALE) {
        const dx = nextX - state.brCenter.x;
        const dy = nextY - state.brCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > state.brZoneRadius) {
          // Sustains damage
          p.score = Math.max(0, p.score - 0.45);
          if (p.score <= 0.05) {
            this.disintegrate(p, mode, 'the storm');
            return;
          }
        }
      }

      p.x = nextX;
      p.y = nextY;

      // Follow segments array backward spacing
      const head: Point = { x: p.x, y: p.y };
      p.segments.unshift(head);

      // Desired segments based on scalar scores (growth engine)
      const targetLength = Math.floor(10 + (p.score - 10) * 1.5);
      while (p.segments.length > targetLength) {
        p.segments.pop();
      }

      // Orbs Vacuum attraction and absorption loop
      for (let i = state.orbs.length - 1; i >= 0; i--) {
        const orb = state.orbs[i];
        const dx = orb.x - p.x;
        const dy = orb.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Pull nearby orbs closer if Vacuum speed Magnet is active
        if (p.abilities.magnet.active && dist < 160) {
          const pullSpeed = 4.5;
          orb.x -= (dx / dist) * pullSpeed;
          orb.y -= (dy / dist) * pullSpeed;
        }

        if (dist < 26) {
          // Absorb score XP
          p.score += orb.value * 0.35;
          state.orbs.splice(i, 1);

          if (!p.isBot) {
            DBInstance.incrementQuest(p.id, 'orbs', 1);
            // Reward safe micro gains
            DBInstance.addCoinsAndXp(p.id, 1, 3);
          }
        }
      }
    });

    // Players VS Players Head-to-Body collisions loop
    const activePlayers = Object.values(state.players).filter((p) => !p.isDead);
    for (let u = 0; u < activePlayers.length; u++) {
      const p1 = activePlayers[u];
      if (p1.abilities.ghost.active) continue; // Ghosts pass through other gliders!

      for (let v = 0; v < activePlayers.length; v++) {
        const p2 = activePlayers[v];
        if (p1.id === p2.id) continue;

        // Skip head collision checks if p2 is currently a spectral ghost
        if (p2.abilities.ghost.active) continue;

        // Trace along all physical segments of p2
        for (let s = 1; s < p2.segments.length; s++) {
          const segment = p2.segments[s];
          const dx = p1.x - segment.x;
          const dy = p1.y - segment.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 25) {
            // Impact collision! Cap to see if p1 is protected by active shields
            if (p1.abilities.shield.active) {
              // Shields absorb impact, bounce player back!
              p1.angle += Math.PI;
              p1.x += Math.cos(p1.angle) * p1.speed * 4;
              p1.y += Math.sin(p1.angle) * p1.speed * 4;
              break;
            } else {
              // Crash and disintegrate
              this.disintegrate(p1, mode, p2.name);
              p2.kills++;
              if (!p2.isBot) {
                DBInstance.incrementQuest(p2.id, 'kills', 1);
                DBInstance.addCoinsAndXp(p2.id, 40, 100);
              }
              return; // break iteration instantly to maintain frame cycle stability
            }
          }
        }
      }
    }
  }

  private updateBotPathfinding(bot: ServerPlayer, state: ServerGameState) {
    // Basic reactive steering updates
    if (Math.random() < 0.05) {
      // Direct angle towards nearest orb
      let nearestOrb: Orb | null = null;
      let minDist = 400;

      state.orbs.forEach((orb) => {
        const dx = orb.x - bot.x;
        const dy = orb.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearestOrb = orb;
        }
      });

      if (nearestOrb) {
        const tOrb = nearestOrb as Orb;
        bot.angle = Math.atan2(tOrb.y - bot.y, tOrb.x - bot.x);
      } else {
        bot.angle += (Math.random() - 0.5) * 1.5;
      }
    }

    // Emergency evasion if facing outer barrier bounds
    if (bot.x < 150) bot.angle = 0; // turn East
    else if (bot.x > ARENA_SIZE - 150) bot.angle = Math.PI; // turn West
    if (bot.y < 150) bot.angle = Math.PI / 2; // turn South
    else if (bot.y > ARENA_SIZE - 150) bot.angle = -Math.PI / 2; // turn North
  }

  private disintegrate(player: ServerPlayer, mode: GameMode, killerName: string) {
    player.isDead = true;
    player.respawnTimer = 100; // ~5 seconds based on 20 TPS timer rate limits

    // Disperse scores weight back into orbs
    const dispersAmount = Math.min(25, Math.floor(player.segments.length));
    const state = this.state[mode];

    for (let i = 0; i < dispersAmount; i++) {
      const seg = player.segments[i * Math.floor(player.segments.length / dispersAmount)] || player;
      state.orbs.push({
        id: `scattered_${Date.now()}_${Math.random()}`,
        x: seg.x + (Math.random() - 0.5) * 45,
        y: seg.y + (Math.random() - 0.5) * 45,
        value: 4,
        color: player.isBot ? '#f43f5e' : '#38bdf8',
        isPremium: Math.random() < 0.25,
      });
    }

    // Trigger killfeed emit listener hooks
    this.onKill(mode, player.name, killerName);

    if (!player.isBot) {
      // Log deaths to DB store persistence
      const user = DBInstance.getUser(player.id);
      if (user) {
        user.stats.deaths++;
        user.stats.highestScore = Math.max(user.stats.highestScore, Math.floor(player.score));
        if (player.score >= user.stats.longestLength) {
          user.stats.longestLength = Math.floor(player.score);
        }
        DBInstance.saveUser(user);
      }
    }
  }

  private respawnPlayer(player: ServerPlayer, mode: GameMode) {
    const rx = 200 + Math.random() * (ARENA_SIZE - 400);
    const ry = 200 + Math.random() * (ARENA_SIZE - 400);
    const rAngle = Math.random() * Math.PI * 2;

    player.isDead = false;
    player.x = rx;
    player.y = ry;
    player.angle = rAngle;
    player.score = 10;
    player.kills = 0;

    const segments: Point[] = [];
    for (let i = 0; i < 10; i++) {
      segments.push({ x: rx - Math.cos(rAngle) * i * 15, y: ry - Math.sin(rAngle) * i * 15 });
    }
    player.segments = segments;

    if (!player.isBot) {
      const user = DBInstance.getUser(player.id);
      if (user) {
        user.stats.gamesPlayed++;
        DBInstance.saveUser(user);
      }
    }
  }

  private getRandomSkin(): string {
    const skins = ['neon_red', 'neon_blue', 'fire', 'ice', 'galaxy', 'shadow', 'gold', 'rainbow'];
    return skins[Math.floor(Math.random() * skins.length)];
  }

  private getRandomColor(): string {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#a855f7', '#06b6d4', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

export const GameController = new autorunGameController();
