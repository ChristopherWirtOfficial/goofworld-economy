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
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  inventory: Record<string, number>; // item -> pounds
  capacity: number;
  incomingOrderIds: string[];
  outgoingOrderIds: string[];
}

export interface GameState {
  entities: Record<string, Entity>;
  orders: Record<string, Order>;
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
}

export interface PlayerCooldown {
  playerId: string;
  nextActionTime: number;
}
