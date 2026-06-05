/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  UserProfile,
  PlayerRank,
  CosmeticItem,
  Achievement,
  Clan,
  FriendShip,
  AnalyticsSummary,
} from '../types';
import { getPrisma } from '../lib/prisma';

const DB_FILE = path.join(process.cwd(), 'db-fallback.json');

export const COSMETICS_SHOP: CosmeticItem[] = [
  { id: 'skin_neon_blue', name: 'Neon Sphere Blue', type: 'skin', value: 'neon_blue', cost: 0, rarity: 'common' },
  { id: 'skin_neon_red', name: 'Neon Blast Red', type: 'skin', value: 'neon_red', cost: 100, rarity: 'common' },
  { id: 'skin_fire', name: 'Inferno Serpent', type: 'skin', value: 'fire', cost: 500, rarity: 'rare' },
  { id: 'skin_ice', name: 'Glacial Dragon', type: 'skin', value: 'ice', cost: 500, rarity: 'rare' },
  { id: 'skin_galaxy', name: 'Cosmic Nebula', type: 'skin', value: 'galaxy', cost: 1200, rarity: 'epic' },
  { id: 'skin_shadow', name: 'Shadow Stalker', type: 'skin', value: 'shadow', cost: 1500, rarity: 'epic' },
  { id: 'skin_gold', name: 'Midas Touch Gold', type: 'skin', value: 'gold', cost: 3000, rarity: 'legendary' },
  { id: 'skin_rainbow', name: 'Hypercolor Rainbow', type: 'skin', value: 'rainbow', cost: 4000, rarity: 'legendary' },

  { id: 'trail_lightning', name: 'Electro Spark', type: 'trail', value: 'lightning', cost: 300, rarity: 'rare' },
  { id: 'trail_fire', name: 'Blazing embers', type: 'trail', value: 'fire_trail', cost: 800, rarity: 'epic' },
  { id: 'trail_galaxy', name: 'Cosmic dust', type: 'trail', value: 'galaxy_trail', cost: 2000, rarity: 'legendary' },

  { id: 'title_beginner', name: 'Beginner', type: 'title', value: 'Beginner', cost: 0, rarity: 'common' },
  { id: 'title_hunter', name: 'Orb Hunter', type: 'title', value: 'Orb Hunter', cost: 200, rarity: 'rare' },
  { id: 'title_champion', name: 'Champion', type: 'title', value: 'Champion', cost: 1000, rarity: 'epic' },
  { id: 'title_legend', name: 'Snake Legend', type: 'title', value: 'Snake Legend', cost: 3000, rarity: 'legendary' },
];

export const GAME_ACHIEVEMENTS: Omit<Achievement, 'progressCurrent' | 'unlockedAt'>[] = [
  { id: 'ach_first_kill', title: 'First Blood', description: 'Eliminate one enemy snake', xpReward: 50, coinReward: 20, icon: 'Flame', progressMax: 1 },
  { id: 'ach_first_win', title: 'Arena Conqueror', description: 'Secure 1st place in any game match', xpReward: 200, coinReward: 100, icon: 'Trophy', progressMax: 1 },
  { id: 'ach_orbs_100', title: 'Gluttony', description: 'Collect a total of 100 energy orbs', xpReward: 100, coinReward: 50, icon: 'Cookie', progressMax: 100 },
  { id: 'ach_orbs_1000', title: 'Energy Collector', description: 'Collect a total of 1000 energy orbs', xpReward: 500, coinReward: 250, icon: 'Zap', progressMax: 1000 },
  { id: 'ach_wins_50', title: 'Grandmaster', description: 'Reach 50 wins in Snake Legends', xpReward: 2000, coinReward: 1000, icon: 'Crown', progressMax: 50 },
  { id: 'ach_legendary', title: 'Legendary Status', description: 'Reach Level 20 or obtain Legend ranking', xpReward: 3000, coinReward: 1500, icon: 'Star', progressMax: 1 },
];

export interface Quest {
  id: string;
  description: string;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  xpReward: number;
  coinReward: number;
  battlePassXpReward: number;
  type: 'orbs' | 'kills' | 'survive' | 'matches';
}

export interface ReplayFrame {
  tick: number;
  players: Record<string, { x: number; y: number; angle: number; segments: Array<{ x: number; y: number }>; score: number }>;
  orbs: Array<{ id: string; x: number; y: number; premium: boolean }>;
}

export interface ReplayData {
  matchId: string;
  mode: string;
  winnerName: string;
  date: string;
  events: Array<{ type: string; tick: number; desc: string }>;
  frames: ReplayFrame[];
}

interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
}

interface DBStructure {
  users: Record<string, UserProfile & { 
    dailyQuests?: Quest[]; 
    academyProgress?: Record<string, { completed: boolean; score: number }>;
    placementMatchesPlayed?: number;
    matchHistory?: string[]; // list of match IDs
  }>;
  clans: Record<string, Clan & { clanXp?: number; clanLevel?: number }>;
  friendRequests: FriendRequest[];
  matchesOffline: Array<{
    id: string;
    mode: string;
    winnerName: string;
    scores: Array<{ name: string; score: number; kills: number }>;
    timestamp: string;
  }>;
  replays: Record<string, ReplayData>;
}

class Store {
  private data: DBStructure = {
    users: {},
    clans: {},
    friendRequests: [],
    matchesOffline: [],
    replays: {},
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = {
          users: {},
          clans: {},
          friendRequests: [],
          matchesOffline: [],
          replays: {},
        };
        this.save();
      }
    } catch (e) {
      console.error('Failed to load database fallback file, using memory fallback:', e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database fallback:', e);
    }
  }

  // Authenticators
  public getUser(id: string): UserProfile & { dailyQuests?: Quest[]; academyProgress?: Record<string, { completed: boolean; score: number }>; placementMatchesPlayed?: number } | null {
    const user = this.data.users[id];
    if (user) {
      // Lazy init quests
      if (!user.dailyQuests || user.dailyQuests.length === 0) {
        user.dailyQuests = [
          { id: 'q_orbs', description: 'Collect 300 energy orbs', targetCount: 300, currentCount: 0, completed: false, xpReward: 150, coinReward: 50, battlePassXpReward: 100, type: 'orbs' },
          { id: 'q_kills', description: 'Eliminate 5 enemy snakes', targetCount: 5, currentCount: 0, completed: false, xpReward: 300, coinReward: 100, battlePassXpReward: 200, type: 'kills' },
          { id: 'q_survive', description: 'Survive in the zone for 10 minutes total', targetCount: 600, currentCount: 0, completed: false, xpReward: 200, coinReward: 75, battlePassXpReward: 150, type: 'survive' },
          { id: 'q_matches', description: 'Slither through 3 arena matches', targetCount: 3, currentCount: 0, completed: false, xpReward: 100, coinReward: 40, battlePassXpReward: 80, type: 'matches' },
        ];
      }
      if (!user.academyProgress) {
        user.academyProgress = {
          'Movement School': { completed: false, score: 0 },
          'Combat School': { completed: false, score: 0 },
          'Survival School': { completed: false, score: 0 },
          'Advanced Techniques': { completed: false, score: 0 },
        };
      }
      if (user.placementMatchesPlayed === undefined) {
        user.placementMatchesPlayed = 0;
      }
    }
    return user || null;
  }

  public getUserByUsername(username: string): UserProfile | null {
    return Object.values(this.data.users).find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
  }

  public getOrCreateUser(id: string, preferredUsername: string, email?: string): UserProfile {
    const existing = this.getUser(id);
    if (existing) {
      existing.online = true;
      this.save();
      return existing;
    }

    let username = preferredUsername || `Legend_${Math.floor(1000 + Math.random() * 9000)}`;
    let counter = 1;
    while (this.getUserByUsername(username)) {
      username = `${preferredUsername}_${counter++}`;
    }

    const newUser: UserProfile & { dailyQuests?: Quest[]; academyProgress?: Record<string, { completed: boolean; score: number }>; placementMatchesPlayed?: number } = {
      id,
      username,
      role: email === 'forappdemo7@gmail.com' ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      level: 1,
      xp: 0,
      coins: 200,
      rankPoints: 100,
      rank: PlayerRank.BRONZE,
      stats: {
        kills: 0,
        deaths: 0,
        wins: 0,
        orbsCollected: 0,
        longestLength: 0,
        highestScore: 0,
        gamesPlayed: 0,
      },
      ownedCosmetics: ['skin_neon_blue', 'title_beginner'],
      selectedSkin: 'neon_blue',
      selectedTrail: 'none',
      selectedTitle: 'Beginner',
      clanId: null,
      online: true,
      placementMatchesPlayed: 0,
      dailyQuests: [
        { id: 'q_orbs', description: 'Collect 300 energy orbs', targetCount: 300, currentCount: 0, completed: false, xpReward: 150, coinReward: 50, battlePassXpReward: 100, type: 'orbs' },
        { id: 'q_kills', description: 'Eliminate 5 enemy snakes', targetCount: 5, currentCount: 0, completed: false, xpReward: 300, coinReward: 100, battlePassXpReward: 200, type: 'kills' },
        { id: 'q_survive', description: 'Survive in the zone for 10 minutes total', targetCount: 600, currentCount: 0, completed: false, xpReward: 200, coinReward: 75, battlePassXpReward: 150, type: 'survive' },
        { id: 'q_matches', description: 'Slither through 3 arena matches', targetCount: 3, currentCount: 0, completed: false, xpReward: 100, coinReward: 40, battlePassXpReward: 80, type: 'matches' },
      ],
      academyProgress: {
        'Movement School': { completed: false, score: 0 },
        'Combat School': { completed: false, score: 0 },
        'Survival School': { completed: false, score: 0 },
        'Advanced Techniques': { completed: false, score: 0 },
      },
    };

    this.data.users[id] = newUser;
    this.save();

    // Lazy background save to Prisma database
    const prisma = getPrisma();
    if (prisma) {
      prisma.user.create({
        data: {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
          level: newUser.level,
          coins: newUser.coins,
          rankPoints: newUser.rankPoints,
          rank: newUser.rank,
        }
      }).catch(err => console.error('[PRISMA] Create user async capture error:', err));
    }

    return newUser;
  }

  public saveUser(user: UserProfile & { dailyQuests?: Quest[]; academyProgress?: Record<string, { completed: boolean; score: number }>; placementMatchesPlayed?: number }) {
    this.data.users[user.id] = { ...this.data.users[user.id], ...user };
    this.save();

    // Lazy Prisma Sync
    const prisma = getPrisma();
    if (prisma) {
      prisma.user.update({
        where: { id: user.id },
        data: {
          level: user.level,
          xp: user.xp,
          coins: user.coins,
          rankPoints: user.rankPoints,
          rank: user.rank,
          kills: user.stats.kills,
          deaths: user.stats.deaths,
          wins: user.stats.wins,
          orbsCollected: user.stats.orbsCollected,
          longestLength: user.stats.longestLength,
          highestScore: user.stats.highestScore,
          gamesPlayed: user.stats.gamesPlayed,
          equippedSkin: user.selectedSkin,
          equippedTrail: user.selectedTrail,
          equippedTitle: user.selectedTitle,
        }
      }).catch(err => console.log('[PRISMA] Optional update error: ', err.message));
    }
  }

  // Daily Quests progresses
  public incrementQuest(userId: string, type: 'orbs' | 'kills' | 'survive' | 'matches', delta: number) {
    const user = this.getUser(userId);
    if (!user || !user.dailyQuests) return;

    user.dailyQuests.forEach((quest) => {
      if (quest.type === type && !quest.completed) {
        quest.currentCount = Math.min(quest.targetCount, quest.currentCount + delta);
        if (quest.currentCount >= quest.targetCount) {
          quest.completed = true;
          // Reward user
          user.xp += quest.xpReward;
          user.coins += quest.coinReward;
          // Level check formula
          let xpNeeded = user.level * 250;
          while (user.xp >= xpNeeded && user.level < 100) {
            user.xp -= xpNeeded;
            user.level += 1;
            user.coins += user.level * 50;
            xpNeeded = user.level * 250;
          }
        }
      }
    });
    this.saveUser(user);
  }

  // Cosmetics Purchases
  public buyCosmetic(userId: string, cosmeticId: string): { success: boolean; error?: string } {
    const user = this.getUser(userId);
    const item = COSMETICS_SHOP.find(c => c.id === cosmeticId);

    if (!user) return { success: false, error: 'User not found' };
    if (!item) return { success: false, error: 'Item not found in shop' };
    if (user.ownedCosmetics.includes(cosmeticId)) return { success: false, error: 'You already own this item' };
    if (user.coins < item.cost) return { success: false, error: `Insufficient Coins. Costs ${item.cost}` };

    user.coins -= item.cost;
    user.ownedCosmetics.push(cosmeticId);
    this.saveUser(user);
    return { success: true };
  }

  public equipCosmetic(userId: string, cosmeticId: string): { success: boolean; error?: string } {
    const user = this.getUser(userId);
    const item = COSMETICS_SHOP.find(c => c.id === cosmeticId);

    if (!user) return { success: false, error: 'User not found' };
    if (!item) return { success: false, error: 'Cosmetic item does not exist' };
    if (!user.ownedCosmetics.includes(cosmeticId)) return { success: false, error: 'You do not own this cosmetic yet' };

    if (item.type === 'skin') {
      user.selectedSkin = item.value;
    } else if (item.type === 'trail') {
      user.selectedTrail = item.value;
    } else if (item.type === 'title') {
      user.selectedTitle = item.value;
    }

    this.saveUser(user);
    return { success: true };
  }

  public addCoinsAndXp(userId: string, coinsGained: number, xpGained: number): UserProfile | null {
    const user = this.getUser(userId);
    if (!user) return null;

    user.coins += coinsGained;
    user.xp += xpGained;

    // Check leveling formula
    let xpNeeded = user.level * 250;
    while (user.xp >= xpNeeded && user.level < 100) {
      user.xp -= xpNeeded;
      user.level += 1;
      user.coins += user.level * 50;
      xpNeeded = user.level * 250;
    }

    this.saveUser(user);
    return user;
  }

  public updateRankPoints(userId: string, delta: number): UserProfile | null {
    const user = this.getUser(userId);
    if (!user) return null;

    if (user.placementMatchesPlayed !== undefined && user.placementMatchesPlayed < 5) {
      user.placementMatchesPlayed += 1;
      // In placement matches, ELO progresses quicker for faster sorting
      user.rankPoints = Math.max(0, user.rankPoints + delta * 2.5);
    } else {
      user.rankPoints = Math.max(0, user.rankPoints + delta);
    }

    // Update Rank Badge (Bronze -> Legend)
    if (user.rankPoints < 200) user.rank = PlayerRank.BRONZE;
    else if (user.rankPoints < 500) user.rank = PlayerRank.SILVER;
    else if (user.rankPoints < 1000) user.rank = PlayerRank.GOLD;
    else if (user.rankPoints < 2000) user.rank = PlayerRank.PLATINUM;
    else if (user.rankPoints < 3500) user.rank = PlayerRank.DIAMOND;
    else if (user.rankPoints < 6000) user.rank = PlayerRank.MASTER;
    else user.rank = PlayerRank.LEGEND;

    this.saveUser(user);
    return user;
  }

  // Friends Features
  public getFriends(userId: string): FriendShip[] {
    const list: FriendShip[] = [];
    Object.values(this.data.users).forEach(other => {
      if (other.id !== userId) {
        list.push({
          friendId: other.id,
          username: other.username,
          status: other.online ? 'online' : 'offline',
          level: other.level,
          rank: other.rank,
        });
      }
    });

    if (list.length === 0) {
      list.push({
        friendId: 'bot_alpha',
        username: 'AstroSnake_Bot',
        status: 'online',
        level: 12,
        rank: PlayerRank.GOLD,
      });
    }

    return list;
  }

  public getFriendRequests(userId: string): FriendRequest[] {
    return this.data.friendRequests.filter(r => r.toId === userId);
  }

  public sendFriendRequest(fromId: string, toUsername: string): { success: boolean; error?: string } {
    const fromUser = this.getUser(fromId);
    if (!fromUser) return { success: false, error: 'User sender not found' };

    const toUser = this.getUserByUsername(toUsername);
    if (!toUser) return { success: false, error: 'Recipient username not found' };
    if (toUser.id === fromId) return { success: false, error: 'Cannot add yourself' };

    const duplicate = this.data.friendRequests.find(r => r.fromId === fromId && r.toId === toUser.id);
    if (duplicate) return { success: false, error: 'Request already sent' };

    const req: FriendRequest = {
      id: `req_${Date.now()}_${Math.random()}`,
      fromId,
      fromName: fromUser.username,
      toId: toUser.id,
      toName: toUser.username,
    };
    this.data.friendRequests.push(req);
    this.save();
    return { success: true };
  }

  public acceptFriendRequest(requestId: string): { success: boolean; error?: string } {
    const idx = this.data.friendRequests.findIndex(r => r.id === requestId);
    if (idx === -1) return { success: false, error: 'Request not found' };

    this.data.friendRequests.splice(idx, 1);
    this.save();
    return { success: true };
  }

  // Clans Features (Progression, Chat, XP, Levels, Leaderboard)
  public getClans(): Clan[] {
    return Object.values(this.data.clans);
  }

  public createClan(leaderId: string, name: string, tag: string): { success: boolean; clan?: Clan; error?: string } {
    const user = this.getUser(leaderId);
    if (!user) return { success: false, error: 'User not found' };
    if (user.clanId) return { success: false, error: 'You are already in a clan' };

    const nameDup = Object.values(this.data.clans).find(c => c.name.toLowerCase() === name.toLowerCase());
    if (nameDup) return { success: false, error: 'Clan name already taken' };

    const tagDup = Object.values(this.data.clans).find(c => c.tag.toLowerCase() === tag.toLowerCase());
    if (tagDup) return { success: false, error: 'Clan tag already taken' };

    if (user.coins < 100) return { success: false, error: 'Creating a clan requires 100 Coins' };

    user.coins -= 100;

    const clanId = `clan_${Date.now()}`;
    const newClan: Clan & { clanXp?: number; clanLevel?: number } = {
      id: clanId,
      name,
      tag: tag.toUpperCase(),
      leaderId,
      leaderName: user.username,
      members: [{ userId: leaderId, username: user.username, role: 'leader' }],
      rankPoints: user.rankPoints,
      clanXp: 0,
      clanLevel: 1,
      chat: [
        {
          userId: 'system',
          username: 'CORETEX_SYS',
          message: `Clan ${name} [${tag.toUpperCase()}] established by ${user.username}. Welcome to the guild, Arena Legends!`,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    user.clanId = clanId;
    this.data.clans[clanId] = newClan;
    this.saveUser(user);
    this.save();

    return { success: true, clan: newClan };
  }

  public joinClan(userId: string, clanId: string): { success: boolean; clan?: Clan; error?: string } {
    const user = this.getUser(userId);
    const clan = this.data.clans[clanId];

    if (!user) return { success: false, error: 'User not found' };
    if (user.clanId) return { success: false, error: 'You must leave your current clan first' };
    if (!clan) return { success: false, error: 'Clan does not exist' };

    clan.members.push({ userId, username: user.username, role: 'member' });
    clan.rankPoints += user.rankPoints;
    user.clanId = clanId;

    clan.chat.push({
      userId: 'system',
      username: 'CORETEX_SYS',
      message: `${user.username} has joined the clan. Welcome!`,
      timestamp: new Date().toISOString(),
    });

    this.saveUser(user);
    this.save();
    return { success: true, clan };
  }

  public leaveClan(userId: string): { success: boolean; error?: string } {
    const user = this.getUser(userId);
    if (!user || !user.clanId) return { success: false, error: 'Not in a clan' };

    const clan = this.data.clans[user.clanId];
    if (!clan) {
      user.clanId = null;
      this.saveUser(user);
      return { success: true };
    }

    if (clan.leaderId === userId) {
      clan.members.forEach(m => {
        const u = this.getUser(m.userId);
        if (u) {
          u.clanId = null;
          this.saveUser(u);
        }
      });
      delete this.data.clans[clan.id];
    } else {
      clan.members = clan.members.filter(m => m.userId !== userId);
      clan.rankPoints = Math.max(0, clan.rankPoints - user.rankPoints);
      clan.chat.push({
        userId: 'system',
        username: 'CORETEX_SYS',
        message: `${user.username} has left the clan.`,
        timestamp: new Date().toISOString(),
      });
    }

    user.clanId = null;
    this.saveUser(user);
    this.save();
    return { success: true };
  }

  public sendClanMessage(userId: string, message: string): { success: boolean; error?: string } {
    const user = this.getUser(userId);
    if (!user || !user.clanId) return { success: false, error: 'Not in a clan' };

    const clan = this.data.clans[user.clanId];
    if (!clan) return { success: false, error: 'Clan not found' };

    clan.chat.push({
      userId,
      username: user.username,
      message,
      timestamp: new Date().toISOString(),
    });

    if (clan.chat.length > 65) clan.chat.shift();
    this.save();
    return { success: true };
  }

  // Training Academy Progress updates
  public completeAcademyLesson(userId: string, lessonName: string, scoreObtained: number): { success: boolean; user: UserProfile } {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');

    if (!user.academyProgress) {
      user.academyProgress = {};
    }

    const prevSession = user.academyProgress[lessonName];
    const isNew = !prevSession || !prevSession.completed;

    user.academyProgress[lessonName] = {
      completed: true,
      score: Math.max(prevSession ? prevSession.score : 0, scoreObtained),
    };

    // Reward Lesson Completion (Small safe amounts as requested: eg 100XP, 30 Coins runs)
    if (isNew) {
      user.xp += 120;
      user.coins += 40;
      
      let xpNeeded = user.level * 250;
      while (user.xp >= xpNeeded && user.level < 100) {
        user.xp -= xpNeeded;
        user.level += 1;
        user.coins += user.level * 50;
        xpNeeded = user.level * 250;
      }
    }

    this.saveUser(user);
    return { success: true, user };
  }

  // Replays system tracking (Phase 12)
  public saveReplay(matchId: string, replayData: ReplayData) {
    this.data.replays[matchId] = replayData;
    // Keep max 10 replays on server
    const keys = Object.keys(this.data.replays);
    if (keys.length > 10) {
      delete this.data.replays[keys[0]];
    }
    this.save();
  }

  public getReplay(matchId: string): ReplayData | null {
    return this.data.replays[matchId] || null;
  }

  // Match analytics tracking
  public trackMatchEnd(mode: string, winnerName: string, scores: Array<{ name: string; score: number; kills: number }>) {
    const id = `match_${Date.now()}`;
    this.data.matchesOffline.push({
      id,
      mode,
      winnerName,
      scores,
      timestamp: new Date().toISOString(),
    });
    if (this.data.matchesOffline.length > 50) {
      this.data.matchesOffline.shift();
    }
    this.save();
  }

  // Leaderboards list
  public getLeaderboards() {
    const players = Object.values(this.data.users);
    const xpRanked = [...players].sort((a, b) => b.level * 250 + b.xp - (a.level * 250 + a.xp));
    const scoreRanked = [...players].sort((a, b) => b.stats.highestScore - a.stats.highestScore);
    const winRanked = [...players].sort((a, b) => b.stats.wins - a.stats.wins);
    const killRanked = [...players].sort((a, b) => b.stats.kills - a.stats.kills);
    const clanRanked = Object.values(this.data.clans).sort((a, b) => b.rankPoints - a.rankPoints);

    return {
      global: xpRanked.slice(0, 50),
      scores: scoreRanked.slice(0, 50),
      wins: winRanked.slice(0, 50),
      kills: killRanked.slice(0, 50),
      clans: clanRanked.slice(0, 50),
    };
  }

  // Admin summary analytics
  public getAdminAnalytics(onlineUsersCount: number, activeMatchesCount: number): AnalyticsSummary {
    this.load();
    const totalRegistered = Object.keys(this.data.users).length;
    const totalClans = Object.keys(this.data.clans).length;

    return {
      playersOnline: onlineUsersCount,
      activeMatches: activeMatchesCount,
      serverFps: 20,
      upTime: Math.floor(process.uptime()),
      totalRegisteredPlayers: totalRegistered,
      totalClans,
    };
  }

  public markAllOffline() {
    Object.values(this.data.users).forEach(u => {
      u.online = false;
    });
    this.save();
  }
}

export const DBInstance = new Store();
DBInstance.markAllOffline();
