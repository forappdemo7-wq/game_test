import { NextRequest, NextResponse } from 'next/server';
import { GameMode, PlayerRank } from '../../../src/types';
import { DBInstance, COSMETICS_SHOP, GAME_ACHIEVEMENTS } from '../../../src/server/store';
import { GameController } from '../../../src/server/game';
import {
  RankedQueueController,
  AntiCheatServiceController,
  TournamentsTracker,
  ReplayTheatre,
  ClanWarsController,
  TrainingAcademy,
  TRAINING_COURSES
} from '../../../src/server/UpgradedServices';

// HELPER: Respond with JSON standard structure
function jsonResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

// Global Options handler for preflight operations
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 1. Health check
    if (pathname === '/api/health') {
      return jsonResponse({ status: 'ok', time: new Date().toISOString() });
    }

    // 2. Fetch full user profile: /api/users/:id
    if (pathname.startsWith('/api/users/')) {
      const parts = pathname.split('/');
      const id = parts[parts.length - 1];
      const user = DBInstance.getUser(id);
      if (!user) {
        return jsonResponse({ error: 'User profile not found' }, 404);
      }
      return jsonResponse(user);
    }

    // 3. Shop Items Listings /api/shop
    if (pathname === '/api/shop') {
      return jsonResponse({ shopItems: COSMETICS_SHOP });
    }

    // 4. Achievements /api/achievements/:userId
    if (pathname.startsWith('/api/achievements/')) {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1];
      const user = DBInstance.getUser(userId);
      if (!user) {
        return jsonResponse({ error: 'User not found' }, 404);
      }

      const clientAchievements = GAME_ACHIEVEMENTS.map((ach) => {
        let progressCurrent = 0;
        if (ach.id === 'ach_first_kill') {
          progressCurrent = user.stats.kills >= 1 ? 1 : 0;
        } else if (ach.id === 'ach_first_win') {
          progressCurrent = user.stats.wins >= 1 ? 1 : 0;
        } else if (ach.id === 'ach_orbs_100') {
          progressCurrent = Math.min(100, user.stats.orbsCollected);
        } else if (ach.id === 'ach_orbs_1000') {
          progressCurrent = Math.min(1000, user.stats.orbsCollected);
        } else if (ach.id === 'ach_wins_50') {
          progressCurrent = Math.min(50, user.stats.wins);
        } else if (ach.id === 'ach_legendary') {
          progressCurrent = (user.level >= 20 || user.rank === PlayerRank.LEGEND) ? 1 : 0;
        }

        const unlockedAt = progressCurrent >= ach.progressMax ? new Date().toISOString() : undefined;

        return {
          ...ach,
          progressCurrent,
          unlockedAt,
        };
      });

      return jsonResponse(clientAchievements);
    }

    // 5. Global / Ranks Leaderboards /api/leaderboards
    if (pathname === '/api/leaderboards') {
      return jsonResponse(DBInstance.getLeaderboards());
    }

    // 6. Friends: /api/friends/:userId
    if (pathname.startsWith('/api/friends/')) {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1];
      return jsonResponse({
        friends: DBInstance.getFriends(userId),
        requests: DBInstance.getFriendRequests(userId),
      });
    }

    // 7. Clan List: /api/clans
    if (pathname === '/api/clans') {
      return jsonResponse(DBInstance.getClans());
    }

    // 8. Admin Panel Analytics: /api/admin/analytics
    if (pathname === '/api/admin/analytics') {
      const onlineCounter = Object.values(GameController.state).reduce((sum, s) => {
        return sum + Object.values(s.players).filter((p) => !p.isBot && !p.isDead).length;
      }, 0);
      const activeLobbies = Object.keys(GameController.state).length;
      return jsonResponse(DBInstance.getAdminAnalytics(onlineCounter, activeLobbies));
    }

    // 9. Matchmaking Queue: /api/ranked/queue
    if (pathname === '/api/ranked/queue') {
      return jsonResponse({
        queue: RankedQueueController.getQueue(),
        size: RankedQueueController.getQueue().length,
      });
    }

    // 10. Anti-Cheat WARNING Logs: /api/admin/anti-cheat
    if (pathname === '/api/admin/anti-cheat') {
      return jsonResponse({ logs: AntiCheatServiceController.getLogs() });
    }

    // 11. Active Cup Brackets: /api/tournaments
    if (pathname === '/api/tournaments') {
      return jsonResponse({ tournaments: TournamentsTracker.getTournaments() });
    }

    // 12. Clan War Territories: /api/clan-wars/territories
    if (pathname === '/api/clan-wars/territories') {
      return jsonResponse({ territories: ClanWarsController.getTerritories() });
    }

    // 13. Replays system: /api/replays
    if (pathname === '/api/replays') {
      return jsonResponse({ replays: ReplayTheatre.getReplayList() });
    }

    // 14. Training academy courses: /api/training/courses
    if (pathname === '/api/training/courses') {
      return jsonResponse({ courses: TRAINING_COURSES });
    }

    // 15. Quests and challenges: /api/quests/:userId
    if (pathname.startsWith('/api/quests/')) {
      const parts = pathname.split('/');
      const userId = parts[parts.length - 1];
      const user = DBInstance.getUser(userId);
      if (!user) {
        return jsonResponse({ error: 'User database not found' }, 404);
      }
      return jsonResponse({
        dailyQuests: [
          { id: 'q1', type: 'collect_orbs', name: 'Gather Fusion Sparks', desc: 'Collect 150 energy sparks in casual or ranked.', target: 150, current: Math.min(150, user.stats.orbsCollected % 150), coinsReward: 50, xpReward: 100 },
          { id: 'q2', type: 'win_matches', name: 'Apex Pilot Champion', desc: 'Secure first place in any sector match.', target: 1, current: user.stats.wins > 0 ? 1 : 0, coinsReward: 120, xpReward: 250 },
        ],
        weeklyChallenges: [
          { id: 'wc1', type: 'total_kills', name: 'Laser Beam Desintegrations', desc: 'Decimate 30 rival space gliders.', target: 30, current: Math.min(30, user.stats.kills), coinsReward: 500, xpReward: 800 },
          { id: 'wc2', type: 'match_streak', name: 'Continuous Horizon Orbits', desc: 'Survive in matches for over 20 rounds.', target: 20, current: Math.min(20, user.stats.gamesPlayed), coinsReward: 400, xpReward: 600 },
        ],
      });
    }

    return jsonResponse({ error: 'Route not mapped' }, 404);
  } catch (err: any) {
    console.error('Next.js API GET compilation catch: ', err);
    return jsonResponse({ error: err.message }, 550);
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const body = await request.json().catch(() => ({}));

    // 1. Passwordless login: /api/auth/login
    if (pathname === '/api/auth/login') {
      const { id, username, email } = body;
      if (!id) {
        return jsonResponse({ error: 'ID is required' }, 400);
      }
      const realUsername = username || `Legend_${Math.floor(100 + Math.random() * 900)}`;
      const user = DBInstance.getOrCreateUser(id, realUsername, email);
      return jsonResponse({ success: true, user });
    }

    // 2. Buy Cosmetics: /api/shop/buy
    if (pathname === '/api/shop/buy') {
      const { userId, cosmeticId } = body;
      const result = DBInstance.buyCosmetic(userId, cosmeticId);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true, user: DBInstance.getUser(userId) });
    }

    // 3. Equip skin: /api/shop/equip
    if (pathname === '/api/shop/equip') {
      const { userId, cosmeticId } = body;
      const result = DBInstance.equipCosmetic(userId, cosmeticId);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true, user: DBInstance.getUser(userId) });
    }

    // 4. Send Friend requests: /api/friends/request
    if (pathname === '/api/friends/request') {
      const { fromId, toUsername } = body;
      const result = DBInstance.sendFriendRequest(fromId, toUsername);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true });
    }

    // 5. Accept Friend requests: /api/friends/accept
    if (pathname === '/api/friends/accept') {
      const { requestId } = body;
      const result = DBInstance.acceptFriendRequest(requestId);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true });
    }

    // 6. Create clan: /api/clans/create
    if (pathname === '/api/clans/create') {
      const { userId, name, tag } = body;
      const result = DBInstance.createClan(userId, name, tag);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true, clan: result.clan, user: DBInstance.getUser(userId) });
    }

    // 7. Join clan: /api/clans/join
    if (pathname === '/api/clans/join') {
      const { userId, clanId } = body;
      const result = DBInstance.joinClan(userId, clanId);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true, clan: result.clan, user: DBInstance.getUser(userId) });
    }

    // 8. Leave clan: /api/clans/leave
    if (pathname === '/api/clans/leave') {
      const { userId } = body;
      const result = DBInstance.leaveClan(userId);
      if (!result.success) {
        return jsonResponse({ error: result.error }, 400);
      }
      return jsonResponse({ success: true, user: DBInstance.getUser(userId) });
    }

    // 9. Join Matchmaking Queue: /api/ranked/queue/join
    if (pathname === '/api/ranked/queue/join') {
      const { userId } = body;
      const user = DBInstance.getUser(userId);
      if (!user) return jsonResponse({ error: 'User profile not found' }, 404);

      RankedQueueController.joinQueue(userId, user.username, user.rankPoints, user.rank);
      return jsonResponse({ success: true, queueSize: RankedQueueController.getQueue().length });
    }

    // 10. Leave Matchmaking Queue: /api/ranked/queue/leave
    if (pathname === '/api/ranked/queue/leave') {
      const { userId } = body;
      RankedQueueController.leaveQueue(userId);
      return jsonResponse({ success: true });
    }

    // 11. Tournaments Register: /api/tournaments/register
    if (pathname === '/api/tournaments/register') {
      const { tournamentId, username } = body;
      const result = TournamentsTracker.registerPlayer(tournamentId, username);
      if (!result.success) return jsonResponse({ error: result.error }, 400);
      return jsonResponse({ success: true, tournaments: TournamentsTracker.getTournaments() });
    }

    // 12. Clan War territory investment: /api/clan-wars/invest
    if (pathname === '/api/clan-wars/invest') {
      const { clanId, clanTag, territoryId, amount } = body;
      const result = ClanWarsController.investWarPoints(clanId, clanTag, territoryId, amount);
      if (!result.success) return jsonResponse({ error: 'Failed to invest points.' }, 400);
      return jsonResponse({ success: true, territory: result.territory });
    }

    // 13. Save Replays: /api/replays/save
    if (pathname === '/api/replays/save') {
      const { replay } = body;
      if (!replay) return jsonResponse({ error: 'Replay details required' }, 400);
      ReplayTheatre.saveReplay(replay);
      return jsonResponse({ success: true });
    }

    // 14. Training course completed award: /api/training/complete
    if (pathname === '/api/training/complete') {
      const { userId, courseId } = body;
      const result = TrainingAcademy.completeCourse(userId, courseId);
      if (!result.success) return jsonResponse({ error: 'Course not found' }, 400);

      return jsonResponse({
        success: true,
        earnedXp: result.earnedXp,
        earnedCoins: result.earnedCoins,
        user: DBInstance.getUser(userId),
      });
    }

    return jsonResponse({ error: 'Route not mapped' }, 404);
  } catch (err: any) {
    console.error('Next.js API POST compilation catch: ', err);
    return jsonResponse({ error: err.message }, 550);
  }
}
