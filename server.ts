/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { createServer as createHttpServer } from 'http';
import { Server as SocketIoServer } from 'socket.io';
import next from 'next';
import path from 'path';

import { GameMode, PlayerRank } from './types';
import { DBInstance, COSMETICS_SHOP, GAME_ACHIEVEMENTS } from './server/store';
import { GameController } from './server/game';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const nextHandler = nextApp.getRequestHandler();

async function startServer() {
  // Bootstrap the Next.js compilation engine
  await nextApp.prepare();

  const app = express();
  app.use(express.json());

  const httpServer = createHttpServer(app);
  const io = new SocketIoServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  const PORT = 3000;

  // ==========================================
  // EXPRESS API ENDPOINTS
  // ==========================================

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  app.post('/api/auth/login', (req, res) => {
    const { id, username, email } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }
    const realUsername = username || `Legend_${Math.floor(100 + Math.random() * 900)}`;
    const user = DBInstance.getOrCreateUser(id, realUsername, email);
    res.json({ success: true, user });
  });

  app.get('/api/users/:id', (req, res) => {
    const user = DBInstance.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    res.json(user);
  });

  app.get('/api/shop', (req, res) => {
    res.json({
      shopItems: COSMETICS_SHOP,
    });
  });

  app.post('/api/shop/buy', (req, res) => {
    const { userId, cosmeticId } = req.body;
    const result = DBInstance.buyCosmetic(userId, cosmeticId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, user: DBInstance.getUser(userId) });
  });

  app.post('/api/shop/equip', (req, res) => {
    const { userId, cosmeticId } = req.body;
    const result = DBInstance.equipCosmetic(userId, cosmeticId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, user: DBInstance.getUser(userId) });
  });

  app.get('/api/achievements/:userId', (req, res) => {
    const user = DBInstance.getUser(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

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

    res.json(clientAchievements);
  });

  app.get('/api/leaderboards', (req, res) => {
    res.json(DBInstance.getLeaderboards());
  });

  app.get('/api/friends/:userId', (req, res) => {
    res.json({
      friends: DBInstance.getFriends(req.params.userId),
      requests: DBInstance.getFriendRequests(req.params.userId),
    });
  });

  app.post('/api/friends/request', (req, res) => {
    const { fromId, toUsername } = req.body;
    const result = DBInstance.sendFriendRequest(fromId, toUsername);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  });

  app.post('/api/friends/accept', (req, res) => {
    const { requestId } = req.body;
    const result = DBInstance.acceptFriendRequest(requestId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  });

  app.get('/api/clans', (req, res) => {
    res.json(DBInstance.getClans());
  });

  app.post('/api/clans/create', (req, res) => {
    const { userId, name, tag } = req.body;
    const result = DBInstance.createClan(userId, name, tag);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, clan: result.clan, user: DBInstance.getUser(userId) });
  });

  app.post('/api/clans/join', (req, res) => {
    const { userId, clanId } = req.body;
    const result = DBInstance.joinClan(userId, clanId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, clan: result.clan, user: DBInstance.getUser(userId) });
  });

  app.post('/api/clans/leave', (req, res) => {
    const { userId } = req.body;
    const result = DBInstance.leaveClan(userId);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true, user: DBInstance.getUser(userId) });
  });

  app.post('/api/clans/chat', (req, res) => {
    const { userId, message } = req.body;
    const result = DBInstance.sendClanMessage(userId, message);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  });

  app.post('/api/training/complete', (req, res) => {
    const { userId, lessonName, scoreObtained } = req.body;
    try {
      const result = DBInstance.completeAcademyLesson(userId, lessonName, scoreObtained);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/admin/analytics', (req, res) => {
    const onlineCounter = Object.values(GameController.state).reduce((sum, s) => {
      return sum + Object.values(s.players).filter(p => !p.isBot && !p.isDead).length;
    }, 0);
    const activeLobbies = Object.keys(GameController.state).length;

    res.json(DBInstance.getAdminAnalytics(onlineCounter, activeLobbies));
  });

  // Replays endpoints
  app.get('/api/replays', (req, res) => {
    res.json(DBInstance.getAllReplays());
  });

  app.get('/api/replays/:matchId', (req, res) => {
    const replay = DBInstance.getReplay(req.params.matchId);
    if (!replay) {
      return res.status(404).json({ error: 'Match replay not found' });
    }
    res.json(replay);
  });

  // ==========================================
  // REAL-TIME SOCKET.IO HANDLERS
  // ==========================================

  const socketPlayerRegistry: Record<string, { userId: string; mode: GameMode }> = {};
  
  // Replay buffers map to store server highlighted matches
  const matchIdMap: Record<string, string> = {
    [GameMode.CASUAL]: `casual_${Date.now()}`,
    [GameMode.RANKED]: `ranked_${Date.now()}`,
    [GameMode.BATTLE_ROYALE]: `br_${Date.now()}`,
    [GameMode.PRIVATE]: `private_${Date.now()}`,
  };

  const lobbyReplayBuffers: Record<string, {
    matchId: string;
    frames: any[];
    events: any[];
  }> = {};

  const getOrCreateBuffer = (mode: GameMode) => {
    if (!lobbyReplayBuffers[mode]) {
      lobbyReplayBuffers[mode] = {
        matchId: matchIdMap[mode] || `${mode}_${Date.now()}`,
        frames: [],
        events: []
      };
    }
    return lobbyReplayBuffers[mode];
  };

  GameController.onKill = (mode: GameMode, victimName: string, killerName: string) => {
    const killId = `kill_${Date.now()}_${Math.random()}`;
    io.to(mode).emit('game:killfeed', {
      id: killId,
      victimName,
      killerName,
      timestamp: Date.now(),
    });

    // Record Event into Replay Buffer
    const buf = getOrCreateBuffer(mode);
    buf.events.push({
      type: 'kill',
      tick: buf.frames.length,
      desc: `${killerName.toUpperCase()} disintegrated ${victimName.toUpperCase()}`
    });

    // Save Replay durably to db store fallbacks when a significant kill happens
    if (buf.frames.length > 5) {
      DBInstance.saveReplay(buf.matchId, {
        matchId: buf.matchId,
        mode,
        winnerName: killerName,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        events: buf.events,
        frames: buf.frames
      });
    }
  };

  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    socket.on('game:join', (payload: {
      userId: string;
      username: string;
      mode: GameMode;
      skin: string;
      trail: string;
      title: string;
    }) => {
      const { userId, username, mode, skin, trail, title } = payload;
      if (!userId) return;

      const user = DBInstance.getUser(userId);
      const rank = user?.rank || PlayerRank.BRONZE;
      const level = user?.level || 1;

      const existing = socketPlayerRegistry[socket.id];
      if (existing) {
        GameController.removePlayer(existing.userId, existing.mode);
        socket.leave(existing.mode);
      }

      GameController.addPlayer(userId, username, mode, skin, trail, title, rank, level);
      socketPlayerRegistry[socket.id] = { userId, mode };

      if (user) {
        user.online = true;
        DBInstance.saveUser(user);
      }

      socket.join(mode);

      socket.emit('game:joined', {
        mode,
        arenaSize: GameController.state[mode].arenaSize,
      });

      console.log(`Player ${username} (${userId}) joined lobby ${mode}`);
    });

    socket.on('player:input', (data: { angle: number; isBoosting: boolean }) => {
      const mapping = socketPlayerRegistry[socket.id];
      if (!mapping) return;

      GameController.updatePlayerInput(mapping.userId, mapping.mode, data);
    });

    socket.on('player:ability', (data: { type: 'shield' | 'magnet' | 'ghost' }) => {
      const mapping = socketPlayerRegistry[socket.id];
      if (!mapping) return;

      GameController.triggerAbility(mapping.userId, mapping.mode, data.type);
    });

    socket.on('chat:broadcast', (data: { username: string; message: string }) => {
      const mapping = socketPlayerRegistry[socket.id];
      if (!mapping) return;

      io.to(mapping.mode).emit('chat:receive', {
        id: `chat_${Date.now()}_${Math.random()}`,
        username: data.username,
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    });

    socket.on('disconnect', () => {
      const mapping = socketPlayerRegistry[socket.id];
      if (mapping) {
        GameController.removePlayer(mapping.userId, mapping.mode);
        const user = DBInstance.getUser(mapping.userId);
        if (user) {
          user.online = false;
          DBInstance.saveUser(user);
        }
        delete socketPlayerRegistry[socket.id];
        console.log(`Player ${mapping.userId} left due to socket close.`);
      }
    });
  });

  // Ticks snapshot for replay recording (slided 250ms updates)
  let serverTicksCounter = 0;

  // Authoritative real-time tick replication (20Hz loop)
  setInterval(() => {
    serverTicksCounter++;
    const shouldRecordFrame = serverTicksCounter % 4 === 0; // Record at 5Hz to remain extremely light memory footprint

    Object.keys(GameController.state).forEach((modeKey) => {
      const mode = modeKey as GameMode;
      const state = GameController.state[mode];

      io.to(mode).emit('game:state', {
        players: state.players,
        orbs: state.orbs,
        brZoneRadius: state.brZoneRadius,
        brCenter: state.brCenter,
      });

      // Record snap frame if there's active players slithering
      if (shouldRecordFrame) {
        const hasLiveHumans = Object.values(state.players).some(p => !p.isBot);
        if (hasLiveHumans) {
          const buf = getOrCreateBuffer(mode);
          
          // Capture player coordinate summaries
          const playersSnapshot: Record<string, any> = {};
          Object.keys(state.players).forEach((pId) => {
            const p = state.players[pId];
            if (!p.isDead) {
              playersSnapshot[pId] = {
                x: Math.round(p.x),
                y: Math.round(p.y),
                angle: Number(p.angle.toFixed(2)),
                segments: p.segments.map(seg => ({ x: Math.round(seg.x), y: Math.round(seg.y) })),
                score: Math.round(p.score)
              };
            }
          });

          // Grab some premium orbs positions
          const orbsSnapshot = state.orbs.slice(0, 8).map(o => ({
            id: o.id,
            x: Math.round(o.x),
            y: Math.round(o.y),
            premium: o.isPremium
          }));

          buf.frames.push({
            tick: buf.frames.length,
            players: playersSnapshot,
            orbs: orbsSnapshot
          });

          // Limit to max 120 recordings (30 seconds highlights)
          if (buf.frames.length > 120) {
            buf.frames.shift();
          }
        }
      }
    });
  }, 50);

  // Fallback direct NextJS request forwarding
  app.all('*', (req, res) => {
    return nextHandler(req, res);
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[SNAKE LEGENDS SERVER] Next.js 15 full-stack live on: http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Fatal Server crash on bootstrap:', error);
});
