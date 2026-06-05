/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ServerGameState,
  ServerPlayer,
  Orb,
  Point,
  GameMode,
  PlayerRank,
} from '../types';
import { DBInstance, COSMETICS_SHOP } from './store';
import { AntiCheatServiceController } from './UpgradedServices';

const ARENA_SIZE = 3000;
const CLIENT_TICK_RATE = 20; // 20 updates per second
const SPAWN_ORBS_COUNT = 250;

// Ability durations in ticks (20 ticks = 1 second)
const SHIELD_DURATION = 100; // 5s
const MAGNET_DURATION = 140; // 7s
const GHOST_DURATION = 80;   // 4s

export class GameManager {
  public state: Record<GameMode, ServerGameState> = {
    [GameMode.CASUAL]: this.createInitialState(),
    [GameMode.RANKED]: this.createInitialState(),
    [GameMode.BATTLE_ROYALE]: this.createInitialState(),
    [GameMode.PRIVATE]: this.createInitialState(),
  };

  private lastTickTime: number = Date.now();
  private privateLobbies: Record<string, string> = {}; // inviteCode -> hostPlayerId
  private activeBRMatch: boolean = false;
  private brCountdown: number = 300; // Ticks countdown to shrink ring

  public onKill?: (mode: GameMode, victimName: string, killerName: string) => void;

  constructor() {
    this.spawnInitialFood(GameMode.CASUAL);
    this.spawnInitialFood(GameMode.RANKED);
    this.spawnInitialFood(GameMode.BATTLE_ROYALE);
    this.spawnInitialFood(GameMode.PRIVATE);

    // Populate bots for multiplayer feeling
    this.repopulateBots(GameMode.CASUAL, 12);
    this.repopulateBots(GameMode.RANKED, 8);
    this.repopulateBots(GameMode.BATTLE_ROYALE, 16);
    this.repopulateBots(GameMode.PRIVATE, 4);

    // Start tick loop
    setInterval(() => this.tick(), 1000 / CLIENT_TICK_RATE);
  }

  private createInitialState(): ServerGameState {
    return {
      players: {},
      orbs: [],
      arenaSize: ARENA_SIZE,
      brZoneRadius: ARENA_SIZE / 2,
      brCenter: { x: ARENA_SIZE / 2, y: ARENA_SIZE / 2 },
      timeLeft: 180, // Game duration for BR
    };
  }

  private spawnInitialFood(mode: GameMode) {
    const state = this.state[mode];
    for (let i = 0; i < SPAWN_ORBS_COUNT; i++) {
      state.orbs.push(this.createRandomOrb());
    }
  }

  private createRandomOrb(x?: number, y?: number, value: number = 1): Orb {
    const isPremium = Math.random() < 0.08;
    return {
      id: `orb_${Date.now()}_${Math.random()}`,
      x: x !== undefined ? x : Math.floor(50 + Math.random() * (ARENA_SIZE - 100)),
      y: y !== undefined ? y : Math.floor(50 + Math.random() * (ARENA_SIZE - 100)),
      value: isPremium ? value * 5 : value,
      color: isPremium
        ? '#f59e0b' // Premium gold
        : ['#3b82f6', '#ef4444', '#10b981', '#a855f7', '#06b6d4', '#f43f5e', '#10b981'][Math.floor(Math.random() * 7)],
      isPremium,
    };
  }

  // Manage players joining
  public addPlayer(
    id: string,
    name: string,
    mode: GameMode,
    skin: string,
    trail: string,
    title: string,
    rank: PlayerRank,
    level: number
  ) {
    const state = this.state[mode];
    const spawnPos = this.getSafeSpawnPosition(mode);

    // Initial segment size: 8 pieces
    const segments: Point[] = [];
    for (let i = 0; i < 8; i++) {
      segments.push({ x: spawnPos.x, y: spawnPos.y + i * 15 });
    }

    state.players[id] = {
      id,
      name,
      isBot: false,
      skin,
      trail,
      title,
      x: spawnPos.x,
      y: spawnPos.y,
      angle: -Math.PI / 2, // Upward
      segments,
      score: 10,
      length: 8,
      speed: 4,
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
  }

  public removePlayer(id: string, mode: GameMode) {
    const state = this.state[mode];
    if (state.players[id]) {
      this.explodeSnake(state, id);
      delete state.players[id];
    }
  }

  public updatePlayerInput(id: string, mode: GameMode, data: { angle: number; isBoosting: boolean }) {
    const player = this.state[mode].players[id];
    if (!player || player.isDead) return;

    // Phase 4: Server authoritative position and coordinates speed validation
    const check = AntiCheatServiceController.validateMovement(
      player.id,
      player.name,
      player.x,
      player.y,
      player.abilities.dash.active
    );

    if (!check.valid) {
      // Impose severe speed dampening to neutralize cheat vectors instantly
      player.speed = 0.5;
    }

    player.angle = data.angle;
    player.abilities.dash.active = data.isBoosting && player.score > 20;
  }

  // Cast specific game capabilities
  public triggerAbility(id: string, mode: GameMode, type: 'shield' | 'magnet' | 'ghost') {
    const player = this.state[mode].players[id];
    if (!player || player.isDead) return;

    // Phase 4: Server authoritative ability cooldown check
    const check = AntiCheatServiceController.validateAbility(player.id, player.name, type);
    if (!check.valid) {
      return; // cheat rejected!
    }

    if (type === 'shield' && player.abilities.shield.duration <= 0) {
      player.abilities.shield.duration = SHIELD_DURATION;
      player.abilities.shield.active = true;
    } else if (type === 'magnet' && player.abilities.magnet.duration <= 0) {
      player.abilities.magnet.duration = MAGNET_DURATION;
      player.abilities.magnet.active = true;
    } else if (type === 'ghost' && player.abilities.ghost.duration <= 0) {
      player.abilities.ghost.duration = GHOST_DURATION;
      player.abilities.ghost.active = true;
    }
  }

  // Main gameplay ticker loop
  private tick() {
    const now = Date.now();
    this.lastTickTime = now;

    // Loop through game modes
    Object.keys(this.state).forEach((modeKey) => {
      const mode = modeKey as GameMode;
      const state = this.state[mode];

      // Handle Battle Royale boundaries
      if (mode === GameMode.BATTLE_ROYALE) {
        this.processBRMatch(state);
      }

      // 1. Slither, prediction calculations, abilities update
      Object.keys(state.players).forEach((pId) => {
        const player = state.players[pId];

        if (player.isDead) {
          player.respawnTimer -= 1;
          if (player.respawnTimer <= 0) {
            this.respawnPlayer(state, player, mode);
          }
          return;
        }

        // Apply abilities cool downs
        this.updatePlayerAbilities(player);

        // Apply Speed kinematics
        let speed = 4; // Base speed
        if (player.abilities.dash.active) {
          speed = 7.5; // High speed
          // Dash costs score! 0.1 score per tick
          if (Math.random() < 0.2) {
            player.score = Math.max(10, player.score - 1);
            // Spawn discarded orb behind tail
            const lastSegment = player.segments[player.segments.length - 1];
            if (lastSegment) {
              state.orbs.push(this.createRandomOrb(lastSegment.x, lastSegment.y, 1));
            }
          }
        }
        player.speed = speed;

        // Kinematic translation forward
        const nextX = player.x + Math.cos(player.angle) * speed;
        const nextY = player.y + Math.sin(player.angle) * speed;

        // Wall crashing boundary check
        const wallThreshold = 15;
        if (
          nextX < wallThreshold ||
          nextX > ARENA_SIZE - wallThreshold ||
          nextY < wallThreshold ||
          nextY > ARENA_SIZE - wallThreshold
        ) {
          if (player.abilities.shield.active) {
            // bounce off
            player.angle = player.angle + Math.PI;
          } else {
            this.handlePlayerDeath(state, pId, 'wall', mode);
            return;
          }
        }

        // Move head position
        player.x = Math.max(10, Math.min(ARENA_SIZE - 10, nextX));
        player.y = Math.max(10, Math.min(ARENA_SIZE - 10, nextY));

        // Insert head at segments beginning
        player.segments.unshift({ x: player.x, y: player.y });

        // Maintain appropriate length
        const targetLen = Math.floor(8 + (player.score - 10) / 4);
        player.length = targetLen;

        while (player.segments.length > targetLen) {
          player.segments.pop();
        }

        // BR Storm circle check
        if (mode === GameMode.BATTLE_ROYALE) {
          const dx = player.x - state.brCenter.x;
          const dy = player.y - state.brCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > state.brZoneRadius) {
            // In the storm! Bypasses shield! Take damage
            player.score = Math.max(10, player.score - 1);
            if (player.score <= 10 && Math.random() < 0.2) {
              this.handlePlayerDeath(state, pId, 'the storm', mode);
            }
          }
        }

        // 2. Orb attraction & picking checks
        this.processOrbCollection(state, player);
      });

      // 3. Collision logic: Player-to-Player crashes
      this.processSnakeCollisions(state, mode);

      // 4. Update Smart Bots moves
      this.updateBotsDecision(state, mode);

      // Keep bots populated
      const targetBotsCount = mode === GameMode.BATTLE_ROYALE ? 15 : 10;
      this.repopulateBots(mode, targetBotsCount);
    });
  }

  private updatePlayerAbilities(player: ServerPlayer) {
    // Shield
    if (player.abilities.shield.active) {
      player.abilities.shield.duration -= 1;
      if (player.abilities.shield.duration <= 0) {
        player.abilities.shield.active = false;
      }
    }
    // Magnet
    if (player.abilities.magnet.active) {
      player.abilities.magnet.duration -= 1;
      if (player.abilities.magnet.duration <= 0) {
        player.abilities.magnet.active = false;
      }
    }
    // Ghost
    if (player.abilities.ghost.active) {
      player.abilities.ghost.duration -= 1;
      if (player.abilities.ghost.duration <= 0) {
        player.abilities.ghost.active = false;
      }
    }
  }

  private processOrbCollection(state: ServerGameState, player: ServerPlayer) {
    let collectDist = 22; // default
    let pullDist = 0;     // draw items

    if (player.abilities.magnet.active) {
      collectDist = 32;
      pullDist = 130;
    }

    state.orbs.forEach((orb) => {
      const dx = orb.x - player.x;
      const dy = orb.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < collectDist) {
        player.score += orb.value;
        // Delete and replace food
        state.orbs = state.orbs.filter((o) => o.id !== orb.id);
        state.orbs.push(this.createRandomOrb());

        // Local persist update for real players
        if (!player.isBot) {
          DBInstance.addCoinsAndXp(player.id, orb.isPremium ? 3 : 1, orb.isPremium ? 5 : 2);
          const user = DBInstance.getUser(player.id);
          if (user) {
            user.stats.orbsCollected += 1;
            user.stats.highestScore = Math.max(user.stats.highestScore, player.score);
            user.stats.longestLength = Math.max(user.stats.longestLength, player.length);
            DBInstance.saveUser(user);
          }
        }
      } else if (dist < pullDist) {
        // Magnet effect: slide orb towards player
        const speed = 6;
        orb.x -= (dx / dist) * speed;
        orb.y -= (dy / dist) * speed;
      }
    });
  }

  private processSnakeCollisions(state: ServerGameState, mode: GameMode) {
    const playersArr = Object.values(state.players).filter((p) => !p.isDead);

    playersArr.forEach((pA) => {
      // If ghost capacity active, can't crash into bodies
      if (pA.abilities.ghost.active || pA.abilities.shield.active) return;

      playersArr.forEach((pB) => {
        if (pA.id === pB.id) return; // Can't crash into themselves

        // Check head of A against all segments of B
        // Skip first 4 segments of B because heads can brush near each other safely
        const snakeSegments = pB.segments;
        for (let idx = 3; idx < snakeSegments.length; idx++) {
          const seg = snakeSegments[idx];
          const dx = pA.x - seg.x;
          const dy = pA.y - seg.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const collisionRadius = 18; // thickness contact
          if (dist < collisionRadius) {
            // A crashed into B! A dies!
            this.handlePlayerDeath(state, pA.id, pB.name, mode);

            // Reward B for the kill!
            pB.kills = (pB.kills || 0) + 1;
            if (!pB.isBot) {
              const coinsBonus = 25;
              const xpBonus = 100;
              DBInstance.addCoinsAndXp(pB.id, coinsBonus, xpBonus);
              DBInstance.updateRankPoints(pB.id, 15); // Add Rank Points

              const user = DBInstance.getUser(pB.id);
              if (user) {
                user.stats.kills += 1;
                DBInstance.saveUser(user);
              }
            }
            break;
          }
        }
      });
    });
  }

  private handlePlayerDeath(state: ServerGameState, id: string, killerName: string, mode: GameMode) {
    const player = state.players[id];
    if (!player || player.isDead) return;

    player.isDead = true;
    player.respawnTimer = 100; // 5 seconds wait is 100 ticks

    // Explode into orbs!
    this.explodeSnake(state, id);

    if (this.onKill) {
      try {
        this.onKill(mode, player.name, killerName);
      } catch (e) {
        console.error('Error invoking onKill callback:', e);
      }
    }

    if (!player.isBot) {
      // Deduct ranked points in Ranked Mode
      if (mode === GameMode.RANKED) {
        DBInstance.updateRankPoints(player.id, -10);
      }

      const user = DBInstance.getUser(player.id);
      if (user) {
        user.stats.deaths += 1;
        user.stats.gamesPlayed += 1;
        DBInstance.saveUser(user);
      }
    }
  }

  private explodeSnake(state: ServerGameState, id: string) {
    const player = state.players[id];
    if (!player) return;

    // Turn body segments into orbs
    player.segments.forEach((seg, index) => {
      // Only spawn for every 2nd segment to avoid overload
      if (index % 2 === 0) {
        // Value corresponds to snake's feed density
        state.orbs.push(this.createRandomOrb(
          seg.x + (Math.random() - 0.5) * 15,
          seg.y + (Math.random() - 0.5) * 15,
          Math.floor(2 + Math.random() * 3)
        ));
      }
    });

    // Clear segments
    player.segments = [];
  }

  private respawnPlayer(state: ServerGameState, player: ServerPlayer, mode: GameMode) {
    const spawnPos = this.getSafeSpawnPosition(mode);
    player.x = spawnPos.x;
    player.y = spawnPos.y;
    player.isDead = false;
    player.score = 10;
    player.length = 8;
    player.angle = Math.random() * Math.PI * 2;
    player.abilities = {
      dash: { active: false, duration: 0 },
      shield: { active: true, duration: 60 }, // Grace period of 3s shield on respawn
      magnet: { active: false, duration: 0 },
      ghost: { active: false, duration: 0 },
    };

    const segments: Point[] = [];
    for (let i = 0; i < 8; i++) {
      segments.push({ x: spawnPos.x, y: spawnPos.y });
    }
    player.segments = segments;
  }

  private getSafeSpawnPosition(mode: GameMode): Point {
    const state = this.state[mode];
    let attempts = 0;
    while (attempts < 20) {
      const rx = Math.floor(100 + Math.random() * (ARENA_SIZE - 200));
      const ry = Math.floor(100 + Math.random() * (ARENA_SIZE - 200));

      // Make sure we are in the battle royale zone if appropriate
      if (mode === GameMode.BATTLE_ROYALE) {
        const dx = rx - state.brCenter.x;
        const dy = ry - state.brCenter.y;
        if (Math.sqrt(dx * dx + dy * dy) > state.brZoneRadius - 100) {
          attempts++;
          continue;
        }
      }

      // Check distance from existing non-dead players
      let tooClose = false;
      Object.values(state.players).forEach((p) => {
        if (!p.isDead) {
          const dist = Math.sqrt((p.x - rx) ** 2 + (p.y - ry) ** 2);
          if (dist < 400) tooClose = true;
        }
      });

      if (!tooClose) {
        return { x: rx, y: ry };
      }
      attempts++;
    }
    return {
      x: Math.floor(ARENA_SIZE / 2 + (Math.random() - 0.5) * 500),
      y: Math.floor(ARENA_SIZE / 2 + (Math.random() - 0.5) * 500),
    };
  }

  // Smart bots controller AI navigation
  private updateBotsDecision(state: ServerGameState, mode: GameMode) {
    const playersArr = Object.values(state.players).filter((p) => !p.isDead);
    const bots = playersArr.filter((p) => p.isBot);

    bots.forEach((bot) => {
      // Find closest food
      let closestOrb: Orb | null = null;
      let minDist = 999999;

      state.orbs.forEach((orb) => {
        const dx = orb.x - bot.x;
        const dy = orb.y - bot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          closestOrb = orb;
        }
      });

      let targetAngle = bot.angle;
      if (closestOrb) {
        targetAngle = Math.atan2((closestOrb as Orb).y - bot.y, (closestOrb as Orb).x - bot.x);
      }

      // Avoid obstacles! (Border limits AND body segments of other snakes)
      let perceivesDanger = false;
      const dangerDist = 75;

      // 1. Check borders
      if (
        bot.x < dangerDist ||
        bot.x > ARENA_SIZE - dangerDist ||
        bot.y < dangerDist ||
        bot.y > ARENA_SIZE - dangerDist
      ) {
        perceivesDanger = true;
        // turn away towards center
        targetAngle = Math.atan2(ARENA_SIZE / 2 - bot.y, ARENA_SIZE / 2 - bot.x);
      }

      // If Battle royale, actively move inward
      if (mode === GameMode.BATTLE_ROYALE) {
        const dx = bot.x - state.brCenter.x;
        const dy = bot.y - state.brCenter.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > state.brZoneRadius - 100) {
          perceivesDanger = true;
          targetAngle = Math.atan2(state.brCenter.y - bot.y, state.brCenter.x - bot.x);
        }
      }

      // 2. Body evasion index
      if (!perceivesDanger) {
        for (const other of playersArr) {
          if (other.id === bot.id || other.abilities.ghost.active) continue;

          // Check if head will collide with sections
          other.segments.forEach((seg, idx) => {
            if (idx < 2) return; // ignore heads which naturally drift
            const dx = bot.x - seg.x;
            const dy = bot.y - seg.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < dangerDist) {
              perceivesDanger = true;
              // Compute cross product to see which side of segments we are, and turn opposite
              targetAngle = bot.angle + Math.PI / 2 + (Math.random() - 0.5) * 0.4;
            }
          });
        }
      }

      // Interpolate angle for smooth turns
      const angleDiff = targetAngle - bot.angle;
      const turnSpeed = 0.12; // radians per tick
      bot.angle += Math.max(-turnSpeed, Math.min(turnSpeed, Math.sin(angleDiff)));

      // Chance to activate abilities randomly to mimic actual humans
      if (Math.random() < 0.005) {
        bot.abilities.dash.active = bot.score > 25;
      }
      if (Math.random() < 0.002) {
        bot.abilities.shield.active = true;
        bot.abilities.shield.duration = 60;
      }
      if (Math.random() < 0.003) {
        bot.abilities.magnet.active = true;
        bot.abilities.magnet.duration = 100;
      }
    });
  }

  private repopulateBots(mode: GameMode, targetCount: number) {
    const state = this.state[mode];
    const currentBotsList = Object.values(state.players).filter((p) => p.isBot);

    if (currentBotsList.length < targetCount) {
      const botsNeeded = targetCount - currentBotsList.length;
      for (let i = 0; i < botsNeeded; i++) {
        const botId = `bot_${Date.now()}_${Math.floor(Math.random() * 999999)}`;
        const botName = [
          'CypherSnake_XP',
          'Viper_GLOW',
          'Aero_Hunter',
          'NeonStriker',
          'IceDragon_AI',
          'CosmicCore',
          'HyperGlider',
          'Tox_Bane',
          'SpectralVind',
          'GridRunner',
          'SolarFlare',
          'ApexStalker',
        ][Math.floor(Math.random() * 12)] + `_${Math.floor(10 + Math.random() * 89)}`;

        const skinOpt = COSMETICS_SHOP
          .filter((c) => c.type === 'skin')
          .map((c) => c.value);
        const randSkin = skinOpt[Math.floor(Math.random() * skinOpt.length)] || 'neon_blue';

        const trailOpt = ['none', 'lightning', 'fire_trail', 'galaxy_trail'];
        const randTrail = trailOpt[Math.floor(Math.random() * trailOpt.length)] || 'none';

        const titleOpt = ['Beginner', 'Hunter', 'Champion', 'Legend'];
        const randTitle = titleOpt[Math.floor(Math.random() * titleOpt.length)] || 'Beginner';

        // Safe coordinates calculation
        const safeCoords = this.getSafeSpawnPosition(mode);
        const segments: Point[] = [];
        for (let s = 0; s < 8; s++) {
          segments.push({ x: safeCoords.x, y: safeCoords.y + s * 15 });
        }

        state.players[botId] = {
          id: botId,
          name: botName,
          isBot: true,
          skin: randSkin,
          trail: randTrail,
          title: randTitle,
          x: safeCoords.x,
          y: safeCoords.y,
          angle: Math.random() * Math.PI * 2,
          segments,
          score: Math.floor(10 + Math.random() * 80), // random starting size
          length: 8,
          speed: 4,
          isDead: false,
          respawnTimer: 0,
          abilities: {
            dash: { active: false, duration: 0 },
            shield: { active: false, duration: 0 },
            magnet: { active: false, duration: 0 },
            ghost: { active: false, duration: 0 },
          },
          rank: [PlayerRank.BRONZE, PlayerRank.SILVER, PlayerRank.GOLD, PlayerRank.PLATINUM][Math.floor(Math.random() * 4)],
          level: Math.floor(1 + Math.random() * 15),
          kills: 0,
        };
      }
    }
  }

  // Process storm & rings for BR Matches
  private processBRMatch(state: ServerGameState) {
    this.brCountdown -= 1;
    if (this.brCountdown <= 0) {
      this.brCountdown = 160; // shrink ring every 8 seconds (160 ticks)
      state.brZoneRadius = Math.max(250, state.brZoneRadius - 150);

      // System announcement
      const currentSurvivorCount = Object.values(state.players).filter((p) => !p.isDead).length;

      // Log results if 1 player remaining
      if (currentSurvivorCount === 1) {
        const lastSurvivor = Object.values(state.players).find((p) => !p.isDead);
        if (lastSurvivor) {
          // Track match results in system
          DBInstance.trackMatchEnd('Battle Royale', lastSurvivor.name, [
            { name: lastSurvivor.name, score: lastSurvivor.score, kills: 1 },
          ]);

          if (!lastSurvivor.isBot) {
            DBInstance.addCoinsAndXp(lastSurvivor.id, 500, 1000); // Massive chicken dinner rewards!
            const user = DBInstance.getUser(lastSurvivor.id);
            if (user) {
              user.stats.wins += 1;
              DBInstance.saveUser(user);
            }
          }
        }
        // Restart Arena
        state.brZoneRadius = ARENA_SIZE / 2;
        this.state[GameMode.BATTLE_ROYALE] = this.createInitialState();
        this.spawnInitialFood(GameMode.BATTLE_ROYALE);
        this.repopulateBots(GameMode.BATTLE_ROYALE, 16);
      }
    }
  }
}

export const GameController = new GameManager();
