import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIoServer } from 'socket.io';
import { GameMode, PlayerRank } from '../../src/types';
import { DBInstance } from '../../src/server/store';
import { GameController } from '../../src/server/game';

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketPlayerRegistry: Record<string, { userId: string; mode: GameMode }> = {};
let isInitialized = false;

function setupSocketHandlers(io: SocketIoServer) {
  if (isInitialized) return;
  isInitialized = true;

  GameController.onKill = (mode: GameMode, victimName: string, killerName: string) => {
    io.to(mode).emit('game:killfeed', {
      id: `kill_${Date.now()}_${Math.random()}`,
      victimName,
      killerName,
      timestamp: Date.now(),
    });
  };

  io.on('connection', (socket) => {
    console.log(`Socket client connected on Next.js: ${socket.id}`);

    // Join Match Lobby
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

      // Ensure fresh database state
      const user = DBInstance.getOrCreateUser(userId, username);
      const rank = user?.rank || PlayerRank.BRONZE;
      const level = user?.level || 1;

      // Disconnect from current lobby first if any
      const existing = socketPlayerRegistry[socket.id];
      if (existing) {
        GameController.removePlayer(existing.userId, existing.mode);
        socket.leave(existing.mode);
      }

      // Add to server authoritative game manager
      GameController.addPlayer(userId, username, mode, skin, trail, title, rank, level);

      // Map socket identity
      socketPlayerRegistry[socket.id] = { userId, mode };

      // Set user online
      if (user) {
        user.online = true;
        DBInstance.saveUser(user);
      }

      // Socket-room connection
      socket.join(mode);

      // Confirm join
      socket.emit('game:joined', {
        mode,
        arenaSize: GameController.state[mode].arenaSize,
      });

      console.log(`Player ${username} (${userId}) joined lobby ${mode}`);
    });

    // Angle & speed updates inputs
    socket.on('player:input', (data: { angle: number; isBoosting: boolean }) => {
      const mapping = socketPlayerRegistry[socket.id];
      if (!mapping) return;

      GameController.updatePlayerInput(mapping.userId, mapping.mode, data);
    });

    // Activating Shield, Magnet, or Ghost abilities
    socket.on('player:ability', (data: { type: 'shield' | 'magnet' | 'ghost' }) => {
      const mapping = socketPlayerRegistry[socket.id];
      if (!mapping) return;

      GameController.triggerAbility(mapping.userId, mapping.mode, data.type);
    });

    // Chat trigger inside the room
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

    // Handle abrupt disconnection or route changes
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

  // Periodic broad-caster 20 times/sec is 50ms of lobby status data
  setInterval(() => {
    Object.keys(GameController.state).forEach((modeKey) => {
      const mode = modeKey as GameMode;
      const state = GameController.state[mode];

      // Broadcast complete snapshot
      io.to(mode).emit('game:state', {
        players: state.players,
        orbs: state.orbs,
        brZoneRadius: state.brZoneRadius,
        brCenter: state.brCenter,
      });
    });
  }, 50);
}

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.IO handler...');
    const io = new SocketIoServer(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;
    setupSocketHandlers(io);
  } else {
    console.log('Socket.IO is already configured');
  }
  res.end();
}
