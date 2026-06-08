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
  public activeWeeklyEvent: string = 'Boss Raid'; // Options: Double XP Weekend, Giant Snake Mode, Speed Arena, Boss Raid
  
  public state: Record<GameMode, ServerGameState> = {
    [GameMode.CASUAL]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600, activeWeeklyEvent: 'Boss Raid' },
    [GameMode.RANKED]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600, activeWeeklyEvent: 'Boss Raid' },
    [GameMode.BATTLE_ROYALE]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: 2000, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600, activeWeeklyEvent: 'Boss Raid' },
    [GameMode.PRIVATE]: { players: {}, orbs: [], arenaSize: ARENA_SIZE, brZoneRadius: ARENA_SIZE, brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 }, timeLeft: 3600, activeWeeklyEvent: 'Boss Raid' },
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

  public spawnWorldBoss(mode: GameMode) {
    const state = this.state[mode];
    const id = 'world_boss_hydra';
    
    // Check if world boss is already present
    if (state.players[id]) return;

    const x = ARENA_SIZE / 2;
    const y = ARENA_SIZE / 2;
    const angle = 0;
    
    const segments: Point[] = [];
    const initialBossSegments = 60; // GIGANTIC size
    for (let i = 0; i < initialBossSegments; i++) {
      segments.push({ x: x - Math.cos(angle) * i * 15, y: y - Math.sin(angle) * i * 15 });
    }

    const boss: ServerPlayer = {
      id,
      name: '👾 NEON HYDRA [WORLD BOSS]',
      isBot: true,
      isBoss: true,
      skin: 'rainbow',
      trail: 'galaxy_trail',
      title: 'RAID WORLD BOSS',
      x,
      y,
      angle,
      segments,
      score: 150,
      length: initialBossSegments,
      speed: 4, // slow but devastating
      isDead: false,
      respawnTimer: 0,
      abilities: {
        dash: { active: false, duration: 0 },
        shield: { active: true, duration: 99999 }, // World Boss has permanent body aura shields!
        magnet: { active: true, duration: 99999 },
        ghost: { active: false, duration: 0 },
      },
      rank: PlayerRank.LEGEND,
      level: 100,
      kills: 0,
      difficulty: 'elite',
    };

    state.players[id] = boss;
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

    const difficulties: Array<'easy' | 'medium' | 'hard' | 'elite'> = ['easy', 'medium', 'hard', 'elite'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    const titles = {
      easy: 'Cadet Trainee',
      medium: 'Tactical Fighter',
      hard: 'Apex Ranger',
      elite: 'Legendary Gladiator',
    };

    const skins = {
      easy: 'neon_blue',
      medium: 'neon_red',
      hard: 'fire',
      elite: 'galaxy',
    };

    const trails = {
      easy: 'none',
      medium: 'none',
      hard: 'fire_trail',
      elite: 'galaxy_trail',
    };

    const bot: ServerPlayer = {
      id,
      name,
      isBot: true,
      skin: skins[difficulty],
      trail: trails[difficulty],
      title: titles[difficulty],
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
      difficulty,
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

    // World Boss periodic spawning check
    if (this.activeWeeklyEvent === 'Boss Raid' || Math.random() < 0.002) {
      if (!state.players['world_boss_hydra'] && (mode === GameMode.CASUAL || mode === GameMode.BATTLE_ROYALE)) {
        this.spawnWorldBoss(mode);
      }
    }

    // Re-population system bots
    const botCount = Object.values(state.players).filter((p) => p.isBot && !p.isDead && !p.isBoss).length;
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

      // Weekly Event: Speed Arena increases speed reference multipliers
      let currentBaseSpeed = BASE_SPEED;
      let currentBoostSpeed = BOOST_SPEED;
      if (this.activeWeeklyEvent === 'Speed Arena') {
        currentBaseSpeed *= 1.4;
        currentBoostSpeed *= 1.4;
      }

      // Update speed value references
      p.speed = p.abilities.dash.active ? currentBoostSpeed : currentBaseSpeed;

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

      // Server Anti-Cheat: Validate Impossible Speeds & Boundaries
      if (p.speed > currentBoostSpeed * 1.1 && !p.isBoss) {
        p.speed = currentBoostSpeed; // Clamp speed to maximum legal limit
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
          let finalOrbVal = orb.value;
          if (this.activeWeeklyEvent === 'Double XP Weekend') {
            finalOrbVal *= 2.0; // Weekly multiplier!
          }

          p.score += finalOrbVal * 0.35;
          state.orbs.splice(i, 1);

          if (!p.isBot) {
            DBInstance.incrementQuest(p.id, 'orbs', 1);
            // Reward safe micro gains
            const coinMultiplier = this.activeWeeklyEvent === 'Double XP Weekend' ? 2 : 1;
            DBInstance.addCoinsAndXp(p.id, 1 * coinMultiplier, 3 * coinMultiplier);
          }
        }
      }

      // World Boss periodically scattering firing projectiles (Orbs with neon hazard colors)
      if (p.isBoss && Math.random() < 0.08) {
        const fireAngle = p.angle + (Math.random() - 0.5) * Math.PI;
        state.orbs.push({
          id: `boss_projectile_${Date.now()}_${Math.random()}`,
          x: p.x + Math.cos(fireAngle) * 80,
          y: p.y + Math.sin(fireAngle) * 80,
          value: 8,
          color: '#f43f5e',
          isPremium: true,
        });
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
              
              if (!p1.isBoss) {
                p2.kills++;
                if (!p2.isBot) {
                  DBInstance.incrementQuest(p2.id, 'kills', 1);
                  DBInstance.addCoinsAndXp(p2.id, 40, 100);
                }
              }
              return; // break iteration instantly to maintain frame cycle stability
            }
          }
        }
      }
    }
  }

  private updateBotPathfinding(bot: ServerPlayer, state: ServerGameState) {
    if (bot.isBoss) {
      // World Boss specific pathfinding: hunt the closest non-bot player aggressively!
      let closestPlayer: ServerPlayer | null = null;
      let minDistance = 2000;

      Object.values(state.players).forEach((p) => {
        if (!p.isBot && !p.isDead) {
          const dist = Math.sqrt((p.x - bot.x) ** 2 + (p.y - bot.y) ** 2);
          if (dist < minDistance) {
            minDistance = dist;
            closestPlayer = p;
          }
        }
      });

      if (closestPlayer) {
        const target = closestPlayer as ServerPlayer;
        bot.angle = Math.atan2(target.y - bot.y, target.x - bot.x);
      } else if (Math.random() < 0.05) {
        bot.angle += (Math.random() - 0.5) * 1.2;
      }
      return;
    }

    const diff = bot.difficulty || 'medium';

    if (diff === 'easy') {
      // Easy Bot: basic gentle slithering towards any nearby orb
      if (Math.random() < 0.03) {
        let nearestOrb: Orb | null = null;
        let minDist = 300;

        state.orbs.forEach((orb) => {
          const dist = Math.sqrt((orb.x - bot.x) ** 2 + (orb.y - bot.y) ** 2);
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
    } else if (diff === 'medium') {
      // Medium Bot: tracks orbs and avoids wall boundaries
      if (Math.random() < 0.06) {
        let nearestOrb: Orb | null = null;
        let minDist = 400;

        state.orbs.forEach((orb) => {
          const dist = Math.sqrt((orb.x - bot.x) ** 2 + (orb.y - bot.y) ** 2);
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
    } else if (diff === 'hard') {
      // Hard Bot: chases orbs, speed boosts occasionally, and tries to cut off nearby players
      let targetCoords: Point | null = null;
      let closestEnemy: ServerPlayer | null = null;
      let enemyDist = 250;

      Object.values(state.players).forEach((p) => {
        if (p.id !== bot.id && !p.isDead) {
          const dist = Math.sqrt((p.x - bot.x) ** 2 + (p.y - bot.y) ** 2);
          if (dist < enemyDist) {
            enemyDist = dist;
            closestEnemy = p;
          }
        }
      });

      if (closestEnemy) {
        const enemy = closestEnemy as ServerPlayer;
        // Hunt/cut-off steering vector
        bot.angle = Math.atan2(enemy.y - bot.y, enemy.x - bot.x) + 0.35; // offset slightly to swirl around them
        bot.abilities.dash.active = bot.score > 12 && Math.random() < 0.15;
      } else if (Math.random() < 0.08) {
        let nearestOrb: Orb | null = null;
        let minDist = 500;

        state.orbs.forEach((orb) => {
          const dist = Math.sqrt((orb.x - bot.x) ** 2 + (orb.y - bot.y) ** 2);
          if (dist < minDist) {
            minDist = dist;
            nearestOrb = orb;
          }
        });

        if (nearestOrb) {
          const tOrb = nearestOrb as Orb;
          bot.angle = Math.atan2(tOrb.y - bot.y, tOrb.x - bot.x);
        }
      }
    } else if (diff === 'elite') {
      // Elite Bot: extremely aggressive tracking, predictive pathing, and active capability casting!
      let closestEnemy: ServerPlayer | null = null;
      let enemyDist = 300;

      Object.values(state.players).forEach((p) => {
        if (p.id !== bot.id && !p.isDead) {
          const dist = Math.sqrt((p.x - bot.x) ** 2 + (p.y - bot.y) ** 2);
          if (dist < enemyDist) {
            enemyDist = dist;
            closestEnemy = p;
          }
        }
      });

      if (closestEnemy) {
        const enemy = closestEnemy as ServerPlayer;
        // Steer predictively ahead of player head
        const predictedX = enemy.x + Math.cos(enemy.angle) * enemy.speed * 4;
        const predictedY = enemy.y + Math.sin(enemy.angle) * enemy.speed * 4;
        bot.angle = Math.atan2(predictedY - bot.y, predictedX - bot.x);

        // Turn on dash propulsion for strategic maneuvers
        bot.abilities.dash.active = bot.score > 9;

        // Smart capability triggers: Activate shields if within direct collision risk
        if (enemyDist < 90 && Math.random() < 0.2) {
          bot.abilities.shield.active = true;
          bot.abilities.shield.duration = 60;
        }
        if (enemyDist < 120 && Math.random() < 0.1) {
          bot.abilities.ghost.active = true;
          bot.abilities.ghost.duration = 40;
        }
      } else {
        bot.abilities.dash.active = false;
        if (Math.random() < 0.1) {
          // Track premium gold orbs
          let bestOrb: Orb | null = null;
          let bestDist = 600;

          state.orbs.forEach((orb) => {
            const dist = Math.sqrt((orb.x - bot.x) ** 2 + (orb.y - bot.y) ** 2);
            const scoreRating = orb.isPremium ? dist / 2.5 : dist;
            if (scoreRating < bestDist) {
              bestDist = scoreRating;
              bestOrb = orb;
            }
          });

          if (bestOrb) {
            const tOrb = bestOrb as Orb;
            bot.angle = Math.atan2(tOrb.y - bot.y, tOrb.x - bot.x);
          }
        }
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
    player.respawnTimer = player.isBoss ? 240 : 100; // Boss respawns slower

    // Disperse scores weight back into orbs
    const dispersAmount = Math.min(player.isBoss ? 150 : 25, Math.floor(player.segments.length));
    const state = this.state[mode];

    for (let i = 0; i < dispersAmount; i++) {
      const seg = player.segments[i * Math.floor(player.segments.length / dispersAmount)] || player;
      state.orbs.push({
        id: `scattered_${Date.now()}_${Math.random()}`,
        x: seg.x + (Math.random() - 0.5) * 55,
        y: seg.y + (Math.random() - 0.5) * 55,
        value: player.isBoss ? 15 : 4,
        color: player.isBoss ? '#f59e0b' : player.isBot ? '#f43f5e' : '#38bdf8',
        isPremium: player.isBoss || Math.random() < 0.25,
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
    } else if (player.isBoss) {
      // World Boss destroyed! Disperse rare token credits to closest players
      Object.keys(state.players).forEach((id) => {
        const p = state.players[id];
        if (!p.isBot && !p.isDead) {
          const dist = Math.sqrt((p.x - player.x) ** 2 + (p.y - player.y) ** 2);
          if (dist < 800) {
            DBInstance.addCoinsAndXp(p.id, 120, 300); // Massive raid bonus coins & XP!
          }
        }
      });
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

    // Weekly Event: Giant Snake Mode spawns players with greater start size
    let startScore = 10;
    if (this.activeWeeklyEvent === 'Giant Snake Mode') {
      startScore = 25;
    }

    player.score = startScore;
    player.kills = 0;

    const segments: Point[] = [];
    const segmentCount = Math.floor(startScore);
    for (let i = 0; i < segmentCount; i++) {
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
