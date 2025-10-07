import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { GameState, PlayerAction } from '@/shared/types';

interface GameStore {
  socket: Socket | null;
  gameState: GameState | null;
  playerId: string;
  nextActionTime: number;
  connect: () => void;
  disconnect: () => void;
  performAction: (action: Omit<PlayerAction, 'playerId' | 'timestamp'>) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  socket: null,
  gameState: null,
  playerId: typeof window !== 'undefined' 
    ? localStorage.getItem('goofworld_playerId') || generatePlayerId() 
    : '',
  nextActionTime: 0,

  connect: () => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('gameStateUpdate', (gameState: GameState) => {
      set({ gameState });
    });

    socket.on('actionSuccess', ({ nextActionTime }: { nextActionTime: number }) => {
      set({ nextActionTime });
    });

    socket.on('actionError', ({ message }: { message: string }) => {
      console.error('Action error:', message);
      alert(`Action failed: ${message}`);
    });

    socket.on('cooldownStatus', ({ onCooldown, nextActionTime }: { onCooldown: boolean; nextActionTime: number }) => {
      set({ nextActionTime: onCooldown ? nextActionTime : 0 });
    });

    set({ socket });

    // Check cooldown status
    const playerId = get().playerId;
    socket.emit('checkCooldown', playerId);
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  performAction: (action) => {
    const { socket, playerId } = get();
    if (!socket) return;

    const fullAction: PlayerAction = {
      ...action,
      playerId,
      timestamp: Date.now(),
    };

    socket.emit('playerAction', fullAction);
  },
}));

function generatePlayerId(): string {
  const id = `player_${Math.random().toString(36).substring(2, 15)}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem('goofworld_playerId', id);
  }
  return id;
}
