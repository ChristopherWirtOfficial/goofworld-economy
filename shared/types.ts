// Shared types between frontend and backend

export type EntityType = 'backplane' | 'warehouse' | 'store' | 'household';

export interface Order {
  id: string;
  item: string;
  quantity: number; // in pounds
  fromEntityId: string;
  toEntityId: string;
  isRevealed: boolean;
  revealedUntil?: number; // timestamp
  revealSource?: 'warehouse' | 'store' | 'household'; // which layer revealed this
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  inventory: Record<string, number>; // item -> pounds
  capacity: number;
  incomingOrderIds: string[];
  outgoingOrderIds: string[];
  neighborhoodId?: string; // stores and households belong to neighborhoods
}

export interface Neighborhood {
  id: string;
  name: string;
  storeIds: string[];
  householdIds: string[];
}

export interface GameState {
  entities: Record<string, Entity>;
  orders: Record<string, Order>;
  neighborhoods: Record<string, Neighborhood>;
  startTime: number;
  endTime: number;
  tickInterval: number; // ms between simulation ticks
}

export interface PlayerAction {
  type: 'move_order' | 'reveal_orders';
  playerId: string;
  timestamp: number;
  orderId?: string;
  targetEntityId?: string;
  revealEntityId?: string;
  layer?: 'warehouse' | 'store' | 'household'; // for reveal_orders
  neighborhoodId?: string; // for neighborhood-level reveals
}

export interface PlayerCooldown {
  playerId: string;
  nextActionTime: number;
}
