/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameMode, PlayerRank, UserProfile } from '../types';
import { DBInstance } from './store';

// =========================================================
// PHASE 3: RANKED MATCHMAKING
// =========================================================
export interface MatchmakingTicket {
  userId: string;
  username: string;
  rankPoints: number;
  rank: PlayerRank;
  joinedAt: number;
}

export class RankedMatchmakingService {
  private queue: MatchmakingTicket[] = [];

  public joinQueue(userId: string, username: string, rankPoints: number, rank: PlayerRank) {
    this.leaveQueue(userId);
    this.queue.push({
      userId,
      username,
      rankPoints,
      rank,
      joinedAt: Date.now(),
    });
  }

  public leaveQueue(userId: string) {
    this.queue = this.queue.filter((ticket) => ticket.userId !== userId);
  }

  public getQueue(): MatchmakingTicket[] {
    return this.queue;
  }

  /**
   * Search for balanced matches. Over time, rank thresholds widen.
   */
  public findMatches(): { playerA: MatchmakingTicket; playerB: MatchmakingTicket }[] {
    const matches: { playerA: MatchmakingTicket; playerB: MatchmakingTicket }[] = [];
    const matchedIds = new Set<string>();

    for (let i = 0; i < this.queue.length; i++) {
      const pA = this.queue[i];
      if (matchedIds.has(pA.userId)) continue;

      let bestMatch: MatchmakingTicket | null = null;
      let bestDiff = Infinity;

      // Calculate waiting time to widen matching gap if search holds too long
      const waitTimeSec = (Date.now() - pA.joinedAt) / 1000;
      const allowedGap = 80 + waitTimeSec * 15; // Widen match threshold dynamically

      for (let j = i + 1; j < this.queue.length; j++) {
        const pB = this.queue[j];
        if (matchedIds.has(pB.userId)) continue;

        const diff = Math.abs(pA.rankPoints - pB.rankPoints);
        if (diff <= allowedGap && diff < bestDiff) {
          bestMatch = pB;
          bestDiff = diff;
        }
      }

      if (bestMatch) {
        matches.push({ playerA: pA, playerB: bestMatch });
        matchedIds.add(pA.userId);
        matchedIds.add(bestMatch.userId);
      }
    }

    // Keep unmatched tickets
    this.queue = this.queue.filter((ticket) => !matchedIds.has(ticket.userId));
    return matches;
  }

  /**
   * Calculate Rating Shifts including placements and promotion triggers
   */
  public calculateRankChange(playerPoints: number, won: boolean, opponentPoints: number): number {
    const expected = 1 / (1 + Math.pow(10, (opponentPoints - playerPoints) / 400));
    const kFactor = 32;
    const actual = won ? 1 : 0;
    let shift = Math.round(kFactor * (actual - expected));

    // Boost rating modifications for placement rounds (when points < 200)
    if (playerPoints < 250) {
      shift *= won ? 1.6 : 0.6; // soft landing for bronze
    }

    return shift === 0 ? (won ? 10 : -10) : shift;
  }

  /**
   * Ranked Rating decay simulator for High tier inactive players
   */
  public simulateRankDecay(userId: string): { decayed: boolean; decayAmount: number } {
    const user = DBInstance.getUser(userId);
    if (!user) return { decayed: false, decayAmount: 0 };

    const minDecayRank = [PlayerRank.DIAMOND, PlayerRank.MASTER, PlayerRank.LEGEND];
    if (minDecayRank.includes(user.rank) && user.rankPoints > 1000) {
      // simulate decay
      const decayAmount = 15;
      user.rankPoints = Math.max(1000, user.rankPoints - decayAmount);
      DBInstance.saveUser(user);
      return { decayed: true, decayAmount };
    }
    return { decayed: false, decayAmount: 0 };
  }
}

// =========================================================
// PHASE 4: ANTI CHEAT SERVICE
// =========================================================
export interface CheatLog {
  id: string;
  userId: string;
  username: string;
  type: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
}

export class AntiCheatService {
  private cheatLogs: CheatLog[] = [];
  private playerPositions: Record<string, { lastX: number; lastY: number; lastTick: number }> = {};
  private lastAbilityTrigger: Record<string, Record<string, number>> = {};

  public validateMovement(
    userId: string,
    username: string,
    x: number,
    y: number,
    isBoosting: boolean
  ): { valid: boolean; reason?: string } {
    const prev = this.playerPositions[userId];
    const now = Date.now();
    this.playerPositions[userId] = { lastX: x, lastY: y, lastTick: now };

    if (!prev) return { valid: true };

    const dx = x - prev.lastX;
    const dy = y - prev.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Dynamic max speeds checking: high velocity blocks teleport or speed hacks
    const maxVelocity = isBoosting ? 65 : 35; // velocity pixels per server tick delta
    const elapsedTicks = (now - prev.lastTick) / 50; // ideal server ticks elapsed (20Hz is 50ms)

    const adjustedMaxDist = maxVelocity * Math.max(1, elapsedTicks);

    if (dist > adjustedMaxDist && dist > 150) {
      this.logCheat(
        userId,
        username,
        'SPEED_VELOCITY_CRITICAL',
        `Player traversed ${Math.round(dist)}px in ${Math.round(now - prev.lastTick)}ms (limit ${Math.round(adjustedMaxDist)}px)`,
        'high'
      );
      return { valid: false, reason: 'Speed deviation threshold breached.' };
    }

    return { valid: true };
  }

  public validateAbility(userId: string, username: string, abilityType: string): { valid: boolean } {
    const now = Date.now();
    if (!this.lastAbilityTrigger[userId]) {
      this.lastAbilityTrigger[userId] = {};
    }

    const lastUsed = this.lastAbilityTrigger[userId][abilityType] || 0;
    const cooldownTime = 12000; // 12 seconds cooldown limit on special abilities

    if (now - lastUsed < cooldownTime) {
      this.logCheat(
        userId,
        username,
        'ABILITY_COOLDOWN_EXPLOIT',
        `Ability: ${abilityType} triggered ${now - lastUsed}ms after previous usage. Expected limit: ${cooldownTime}ms`,
        'medium'
      );
      return { valid: false };
    }

    this.lastAbilityTrigger[userId][abilityType] = now;
    return { valid: true };
  }

  public getLogs(): CheatLog[] {
    return this.cheatLogs;
  }

  public logCheat(userId: string, username: string, type: string, details: string, severity: 'low' | 'medium' | 'high') {
    const log: CheatLog = {
      id: `cheat_${Date.now()}_${Math.random()}`,
      userId,
      username,
      type,
      details,
      severity,
      timestamp: new Date().toISOString(),
    };
    this.cheatLogs.push(log);
    if (this.cheatLogs.length > 100) this.cheatLogs.shift();
    console.warn(`[ANTI-CHEAT WARNING] :: Player ${username} flagged for ${type}: ${details}`);
  }
}

// =========================================================
// PHASE 5: TOURNAMENT SCHEDULER
// =========================================================
export interface TournamentBracketNode {
  id: string;
  round: number;
  playerA?: string;
  playerB?: string;
  winner?: string;
}

export interface TournamentDetails {
  id: string;
  name: string;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  stage: 'REGISTRATION' | 'ACTIVE' | 'FINISHED';
  participants: string[];
  brackets: TournamentBracketNode[];
}

export class TournamentSystem {
  private activeTournaments: TournamentDetails[] = [];

  constructor() {
    this.spawnAutomaticTournaments();
  }

  private spawnAutomaticTournaments() {
    this.activeTournaments.push({
      id: 'tour_daily_warp',
      name: 'Galactic Horizon Cup (Daily)',
      type: 'DAILY',
      stage: 'REGISTRATION',
      participants: ['AstroSlinker', 'StellarPython', 'DracoBot', 'VoidSlink'],
      brackets: [],
    });
  }

  public registerPlayer(tournamentId: string, username: string): { success: boolean; error?: string } {
    const tour = this.activeTournaments.find((t) => t.id === tournamentId);
    if (!tour) return { success: false, error: 'Tournament not found' };
    if (tour.stage !== 'REGISTRATION') return { success: false, error: 'Registration is closed' };
    if (tour.participants.includes(username)) return { success: false, error: 'Already registered' };

    tour.participants.push(username);
    return { success: true };
  }

  public startTournament(tournamentId: string) {
    const tour = this.activeTournaments.find((t) => t.id === tournamentId);
    if (!tour) return;

    tour.stage = 'ACTIVE';
    // Generate initial registration brackets pairs
    const nodes: TournamentBracketNode[] = [];
    const participants = [...tour.participants];

    // Seed bots if odd number
    if (participants.length % 2 !== 0) {
      participants.push('Bot_Rival_Alpha');
    }

    for (let i = 0; i < participants.length; i += 2) {
      nodes.push({
        id: `match_${i}_r1`,
        round: 1,
        playerA: participants[i],
        playerB: participants[i + 1],
      });
    }

    tour.brackets = nodes;
  }

  public advanceRound(tournamentId: string, matchNodeId: string, winnerName: string) {
    const tour = this.activeTournaments.find((t) => t.id === tournamentId);
    if (!tour) return;

    const node = tour.brackets.find((n) => n.id === matchNodeId);
    if (node) {
      node.winner = winnerName;
    }

    // Check if round is finished to seed round 2
    const currentRoundNodes = tour.brackets.filter((n) => n.round === 1);
    const completedAll = currentRoundNodes.every((n) => n.winner !== undefined);

    if (completedAll && tour.brackets.filter((n) => n.round === 2).length === 0) {
      const round1Winners = currentRoundNodes.map((n) => n.winner!);
      const nextRoundNodes: TournamentBracketNode[] = [];

      for (let i = 0; i < round1Winners.length; i += 2) {
        nextRoundNodes.push({
          id: `match_${i}_r2`,
          round: 2,
          playerA: round1Winners[i],
          playerB: round1Winners[i + 1] || 'BYE',
          winner: round1Winners[i + 1] ? undefined : round1Winners[i],
        });
      }
      tour.brackets = [...tour.brackets, ...nextRoundNodes];

      // If only one node in round 2 was created and already won (or won due to BYE), end tournament
      const r2Done = nextRoundNodes.every((n) => n.winner !== undefined);
      if (r2Done) {
        tour.stage = 'FINISHED';
      }
    }
  }

  public getTournaments() {
    return this.activeTournaments;
  }
}

// =========================================================
// PHASE 6: REPLAY SYSTEM
// =========================================================
export interface ReplayFrame {
  tick: number;
  players: Record<string, { x: number; y: number; angle: number; score: number }>;
}

export interface SavedReplay {
  id: string;
  date: string;
  mode: GameMode;
  winnerName: string;
  myScore: number;
  myKills: number;
  snapshots: ReplayFrame[];
}

export class ReplayEngine {
  private activeReplays: Record<string, SavedReplay> = {};

  public saveReplay(replay: SavedReplay) {
    this.activeReplays[replay.id] = replay;
  }

  public getReplay(id: string): SavedReplay | null {
    return this.activeReplays[id] || null;
  }

  public getReplayList(): Omit<SavedReplay, 'snapshots'>[] {
    return Object.values(this.activeReplays).map((rep) => ({
      id: rep.id,
      date: rep.date,
      mode: rep.mode,
      winnerName: rep.winnerName,
      myScore: rep.myScore,
      myKills: rep.myKills,
    }));
  }
}

// =========================================================
// PHASE 7: CLAN WARS
// =========================================================
export interface ClanTerritory {
  id: string;
  name: string;
  description: string;
  shieldPower: number;
  controllingClanId: string | null;
  controllingClanTag: string;
  warPointsInvested: number;
}

export class ClanWarsManager {
  private territories: ClanTerritory[] = [
    { id: 'zone_cyber', name: 'Cyber City Sector', description: 'Tech sector brimming with core neon nodes', shieldPower: 80, controllingClanId: null, controllingClanTag: 'FREE', warPointsInvested: 0 },
    { id: 'zone_lava', name: 'Draconian Caverns', description: 'High density energy nodes and lava flows', shieldPower: 45, controllingClanId: null, controllingClanTag: 'FREE', warPointsInvested: 0 },
    { id: 'zone_frozen', name: 'Glacial Spires', description: 'Deep cooling chambers and speed crystals', shieldPower: 90, controllingClanId: null, controllingClanTag: 'FREE', warPointsInvested: 0 },
  ];

  public getTerritories() {
    return this.territories;
  }

  public investWarPoints(clanId: string, clanTag: string, territoryId: string, amount: number): { success: boolean; territory?: ClanTerritory } {
    const t = this.territories.find((item) => item.id === territoryId);
    if (!t) return { success: false };

    t.warPointsInvested += amount;
    if (t.warPointsInvested > t.shieldPower * 10) {
      t.controllingClanId = clanId;
      t.controllingClanTag = clanTag;
    }
    return { success: true, territory: t };
  }
}

// =========================================================
// PHASE 9: TRAINING MISSION SERVICE
// =========================================================
export interface CourseTask {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rewardXp: number;
  rewardCoins: number;
}

export const TRAINING_COURSES: CourseTask[] = [
  { id: 'track_tutorial', name: 'Glider Boot Camp', description: 'Grasp the core kinematics slither maneuvers.', difficulty: 'Easy', rewardXp: 40, rewardCoins: 15 },
  { id: 'track_obstacle', name: 'Nebula Asteroid Belt', description: 'Weave around obstacles without registration crashes.', difficulty: 'Medium', rewardXp: 80, rewardCoins: 30 },
  { id: 'track_ability', name: 'Shield Projection Sync', description: 'Deploy barrier deflection within 200ms of collision warnings.', difficulty: 'Medium', rewardXp: 100, rewardCoins: 40 },
  { id: 'track_survival', name: 'Storm Evader Core', description: 'Withstand boundaries squeeze for over 60 seconds.', difficulty: 'Hard', rewardXp: 150, rewardCoins: 60 },
];

export class TrainingAcademyService {
  public completeCourse(userId: string, courseId: string): { success: boolean; earnedXp: number; earnedCoins: number } {
    const course = TRAINING_COURSES.find((c) => c.id === courseId);
    if (!course) return { success: false, earnedXp: 0, earnedCoins: 0 };

    DBInstance.addCoinsAndXp(userId, course.rewardCoins, course.rewardXp);
    return {
      success: true,
      earnedXp: course.rewardXp,
      earnedCoins: course.rewardCoins,
    };
  }
}

// EXPORT ALL AS SINGLE INSTANCES
export const RankedQueueController = new RankedMatchmakingService();
export const AntiCheatServiceController = new AntiCheatService();
export const TournamentsTracker = new TournamentSystem();
export const ReplayTheatre = new ReplayEngine();
export const ClanWarsController = new ClanWarsManager();
export const TrainingAcademy = new TrainingAcademyService();
