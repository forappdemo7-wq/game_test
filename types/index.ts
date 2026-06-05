/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Point {
  x: number;
  y: number;
}

export enum GameMode {
  CASUAL = 'casual',
  RANKED = 'ranked',
  BATTLE_ROYALE = 'battle_royale',
  PRIVATE = 'private',
}

export enum SnakeSkin {
  NEON_BLUE = 'neon_blue',
  NEON_RED = 'neon_red',
  FIRE = 'fire',
  ICE = 'ice',
  GALAXY = 'galaxy',
  SHADOW = 'shadow',
  GOLD = 'gold',
  RAINBOW = 'rainbow',
}

export enum SnakeTrail {
  NONE = 'none',
  LIGHTNING = 'lightning',
  FIRE_TRAIL = 'fire_trail',
  GALAXY_TRAIL = 'galaxy_trail',
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'skin' | 'trail' | 'title';
  value: string;
  cost: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerStats {
  kills: number;
  deaths: number;
  wins: number;
  orbsCollected: number;
  longestLength: number;
  highestScore: number;
  gamesPlayed: number;
}

export interface UserProfile {
  id: string;
  username: string;
  role: 'user' | 'admin';
  createdAt: string;
  level: number;
  xp: number;
  coins: number;
  rankPoints: number;
  rank: PlayerRank;
  stats: PlayerStats;
  ownedCosmetics: string[]; // cosmetic IDs
  selectedSkin: string;
  selectedTrail: string;
  selectedTitle: string;
  clanId: string | null;
  online: boolean;
}

export enum PlayerRank {
  BRONZE = 'Bronze',
  SILVER = 'Silver',
  GOLD = 'Gold',
  PLATINUM = 'Platinum',
  DIAMOND = 'Diamond',
  MASTER = 'Master',
  LEGEND = 'Legend',
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  coinReward: number;
  icon: string;
  unlockedAt?: string;
  progressMax: number;
  progressCurrent: number;
}

export interface Clan {
  id: string;
  name: string;
  tag: string;
  leaderId: string;
  leaderName: string;
  members: {
    userId: string;
    username: string;
    role: 'leader' | 'officer' | 'member';
  }[];
  rankPoints: number;
  chat: ClanChatMessage[];
}

export interface ClanChatMessage {
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface FriendShip {
  friendId: string;
  username: string;
  status: 'online' | 'offline' | 'in_game';
  level: number;
  rank: PlayerRank;
}

export interface ActiveAbilities {
  dash: { active: boolean; duration: number }; // speed boost
  shield: { active: boolean; duration: number }; // immune to crashes
  magnet: { active: boolean; duration: number }; // attracts orbs
  ghost: { active: boolean; duration: number }; // passes through enemies
}

export interface ServerPlayer {
  id: string;
  name: string;
  isBot: boolean;
  skin: string;
  trail: string;
  title: string;
  x: number;
  y: number;
  angle: number;
  segments: Point[];
  score: number;
  length: number;
  speed: number;
  isDead: boolean;
  respawnTimer: number;
  abilities: ActiveAbilities;
  rank: PlayerRank;
  level: number;
  kills: number;
  difficulty?: 'easy' | 'medium' | 'hard' | 'elite';
  isBoss?: boolean;
}

export interface Orb {
  id: string;
  x: number;
  y: number;
  value: number; // XP/score size
  color: string;
  isPremium: boolean; // special golden orb
}

export interface ServerGameState {
  players: Record<string, ServerPlayer>;
  orbs: Orb[];
  arenaSize: number; // width and height of square arena
  brZoneRadius: number; // active radius for Battle Royale
  brCenter: Point;
  timeLeft: number; // game time ending/shrinking
  activeWeeklyEvent?: string; // Double XP Weekend, Giant Snake Mode, Speed Arena, Boss Raid
}

export interface GameConfig {
  arenaSize: number;
  baseSpeed: number;
  dashSpeed: number;
  maxPlayers: number;
  tickRate: number;
}

export interface AnalyticsSummary {
  playersOnline: number;
  activeMatches: number;
  serverFps: number;
  upTime: number;
  totalRegisteredPlayers: number;
  totalClans: number;
}

export interface KillFeedEntry {
  id: string;
  victimName: string;
  killerName: string;
  timestamp: number;
}
