import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { GameState, Order, Entity } from '@/shared/types';

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

// Derived atoms for revealed orders and key information
export const revealedOrdersAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  if (!gameState) return [];
  
  return Object.values(gameState.orders).filter(order => order.isRevealed);
});

export const ordersByEntityAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  if (!gameState) return {};
  
  const ordersByEntity: Record<string, { incoming: Order[]; outgoing: Order[] }> = {};
  
  Object.values(gameState.entities).forEach(entity => {
    ordersByEntity[entity.id] = {
      incoming: entity.incomingOrderIds
        .map(id => gameState.orders[id])
        .filter(Boolean)
        .filter(order => order.isRevealed),
      outgoing: entity.outgoingOrderIds
        .map(id => gameState.orders[id])
        .filter(Boolean)
        .filter(order => order.isRevealed),
    };
  });
  
  return ordersByEntity;
});

export const entityDetailsAtom = atom((get) => {
  const gameState = get(gameStateAtom);
  if (!gameState) return {};
  
  const entityDetails: Record<string, {
    entity: Entity;
    revealedIncoming: Order[];
    revealedOutgoing: Order[];
    totalIncoming: number;
    totalOutgoing: number;
    revealedIncomingCount: number;
    revealedOutgoingCount: number;
  }> = {};
  
  Object.values(gameState.entities).forEach(entity => {
    const incomingOrders = entity.incomingOrderIds.map(id => gameState.orders[id]).filter(Boolean);
    const outgoingOrders = entity.outgoingOrderIds.map(id => gameState.orders[id]).filter(Boolean);
    
    entityDetails[entity.id] = {
      entity,
      revealedIncoming: incomingOrders.filter(order => order.isRevealed),
      revealedOutgoing: outgoingOrders.filter(order => order.isRevealed),
      totalIncoming: incomingOrders.length,
      totalOutgoing: outgoingOrders.length,
      revealedIncomingCount: incomingOrders.filter(order => order.isRevealed).length,
      revealedOutgoingCount: outgoingOrders.filter(order => order.isRevealed).length,
    };
  });
  
  return entityDetails;
});

// TODO: Add turn cooldown system (currently disabled for development)
export const isActionAllowedAtom = atom(true);

