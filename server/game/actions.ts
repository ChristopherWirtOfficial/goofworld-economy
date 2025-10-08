import { GameState, PlayerAction, Order } from '../../shared/types';

export function processAction(gameState: GameState, action: PlayerAction): GameState {
  switch (action.type) {
    case 'move_order':
      return moveOrder(gameState, action);
    case 'reveal_orders':
      return revealOrders(gameState, action);
    default:
      throw new Error('Unknown action type');
  }
}

function moveOrder(gameState: GameState, action: PlayerAction): GameState {
  if (!action.orderId || !action.targetEntityId) {
    throw new Error('Missing orderId or targetEntityId for move_order action');
  }

  const order = gameState.orders[action.orderId];
  if (!order) {
    throw new Error('Order not found');
  }

  const targetEntity = gameState.entities[action.targetEntityId];
  if (!targetEntity) {
    throw new Error('Target entity not found');
  }

  // Remove order from old entities
  const oldFrom = gameState.entities[order.fromEntityId];
  const oldTo = gameState.entities[order.toEntityId];

  if (oldFrom) {
    oldFrom.outgoingOrderIds = oldFrom.outgoingOrderIds.filter(id => id !== action.orderId);
  }
  if (oldTo) {
    oldTo.incomingOrderIds = oldTo.incomingOrderIds.filter(id => id !== action.orderId);
  }

  // Update order - moving to a new "to" entity
  order.toEntityId = action.targetEntityId;

  // Add to new entity
  targetEntity.incomingOrderIds.push(action.orderId);

  // Re-add to from entity if removed
  if (oldFrom && !oldFrom.outgoingOrderIds.includes(action.orderId)) {
    oldFrom.outgoingOrderIds.push(action.orderId);
  }

  return { ...gameState };
}

function revealOrders(gameState: GameState, action: PlayerAction): GameState {
  if (!action.layer) {
    throw new Error('Missing layer for reveal_orders action');
  }

  let ordersToReveal: string[] = [];
  let revealPercentage: number;
  let durationMs: number;

  if (action.layer === 'warehouse') {
    // Warehouse reveals work at layer level (all warehouses)
    const allEntities = Object.values(gameState.entities);
    const warehouseEntities = allEntities.filter(e => e.type === 'warehouse');
    
    warehouseEntities.forEach(entity => {
      ordersToReveal.push(...entity.incomingOrderIds, ...entity.outgoingOrderIds);
    });
    
    revealPercentage = 0.7; // 70%
    durationMs = 30 * 60 * 1000; // 30 minutes
  } else if (action.layer === 'store' || action.layer === 'household') {
    // Store and household reveals work at neighborhood level
    if (!action.neighborhoodId) {
      throw new Error('Missing neighborhoodId for store/household reveal_orders action');
    }

    const neighborhood = gameState.neighborhoods[action.neighborhoodId];
    if (!neighborhood) {
      throw new Error(`Neighborhood ${action.neighborhoodId} not found`);
    }

    if (action.layer === 'store') {
      // Reveal orders for stores in this neighborhood
      neighborhood.storeIds.forEach(storeId => {
        const store = gameState.entities[storeId];
        if (store) {
          ordersToReveal.push(...store.incomingOrderIds, ...store.outgoingOrderIds);
        }
      });
      revealPercentage = 0.5; // 50%
      durationMs = 45 * 60 * 1000; // 45 minutes
    } else {
      // Reveal orders for households in this neighborhood
      neighborhood.householdIds.forEach(householdId => {
        const household = gameState.entities[householdId];
        if (household) {
          ordersToReveal.push(...household.incomingOrderIds, ...household.outgoingOrderIds);
        }
      });
      revealPercentage = 0.3; // 30%
      durationMs = 60 * 60 * 1000; // 60 minutes
    }
  } else {
    throw new Error('Invalid layer for reveal_orders action');
  }

  const numToReveal = Math.floor(ordersToReveal.length * revealPercentage);
  const shuffled = [...ordersToReveal].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, numToReveal);

  const now = Date.now();
  selected.forEach(orderId => {
    const order = gameState.orders[orderId];
    if (order) {
      order.isRevealed = true;
      order.revealedUntil = now + durationMs;
      order.revealSource = action.layer;
    }
  });

  return { ...gameState };
}
