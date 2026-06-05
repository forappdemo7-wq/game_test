import { create } from 'zustand';
import { GameMode, UserProfile, ServerPlayer, Orb, Point, KillFeedEntry, PlayerRank } from '../types';

interface GameState {
  user: UserProfile | null;
  isPlaying: boolean;
  currentGameMode: GameMode;
  roomCode: string | null;
  players: Record<string, ServerPlayer>;
  orbs: Orb[];
  brZoneRadius: number;
  brCenter: Point;
  chatMessages: Array<{ id: string; username: string; message: string; timestamp: string }>;
  killFeed: KillFeedEntry[];
  soundEnabled: boolean;
  isAdminPanelOpen: boolean;

  // Actions
  setUser: (user: UserProfile | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentGameMode: (mode: GameMode) => void;
  setRoomCode: (code: string | null) => void;
  setGameState: (state: { players: Record<string, ServerPlayer>; orbs: Orb[]; brZoneRadius: number; brCenter: Point }) => void;
  addChatMessage: (msg: { id: string; username: string; message: string; timestamp: string }) => void;
  clearChat: () => void;
  addKillFeed: (entry: KillFeedEntry) => void;
  removeKillFeed: (id: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setIsAdminPanelOpen: (open: boolean) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  user: null,
  isPlaying: false,
  currentGameMode: GameMode.CASUAL,
  roomCode: null,
  players: {},
  orbs: [],
  brZoneRadius: 1500,
  brCenter: { x: 1500, y: 1500 },
  chatMessages: [],
  killFeed: [],
  soundEnabled: true,
  isAdminPanelOpen: false,

  setUser: (user) => set({ user }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentGameMode: (currentGameMode) => set({ currentGameMode }),
  setRoomCode: (roomCode) => set({ roomCode }),
  setGameState: (state) => set({
    players: state.players,
    orbs: state.orbs,
    brZoneRadius: state.brZoneRadius,
    brCenter: state.brCenter,
  }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg].slice(-40) })),
  clearChat: () => set({ chatMessages: [] }),
  addKillFeed: (entry) => set((s) => ({ killFeed: [...s.killFeed, entry].slice(-5) })),
  removeKillFeed: (id) => set((s) => ({ killFeed: s.killFeed.filter((item) => item.id !== id) })),
  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setIsAdminPanelOpen: (isAdminPanelOpen) => set({ isAdminPanelOpen }),
  resetGame: () => set({
    players: {},
    orbs: [],
    brZoneRadius: 1500,
    brCenter: { x: 1500, y: 1500 },
    chatMessages: [],
    killFeed: [],
  }),
}));
