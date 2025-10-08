import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { GameState } from '@/shared/types';

// Player ID persisted to localStorage
export const playerIdAtom = atomWithStorage<string>(
  'goofworld_playerId',
  typeof window !== 'undefined' ? `player_${Math.random().toString(36).substring(2, 15)}` : ''
);

// Game state synced from WebSocket
export const gameStateAtom = atom<GameState | null>(null);

// Cooldown state
export const nextActionTimeAtom = atom<number>(0);

// Derived atoms
export const onCooldownAtom = atom((get) => {
  const nextActionTime = get(nextActionTimeAtom);
  return nextActionTime > Date.now();
});

export const cooldownRemainingAtom = atom((get) => {
  const nextActionTime = get(nextActionTimeAtom);
  const now = Date.now();
  return Math.max(0, Math.ceil((nextActionTime - now) / 1000));
});

