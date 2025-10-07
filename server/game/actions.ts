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
  if (!action.revealEntityId) {
    throw new Error('Missing revealEntityId for reveal_orders action');
  }

  const entity = gameState.entities[action.revealEntityId];
  if (!entity) {
    throw new Error('Entity not found');
  }

  // Determine reveal parameters based on entity type
  let revealPercentage = 0.5;
  let revealDurationMs = 45 * 60 * 1000; // 45 minutes

  switch (entity.type) {
    case 'warehouse':
      revealPercentage = 0.7;
      revealDurationMs = 30 * 60 * 1000; // 30 minutes
      break;
    case 'store':
      revealPercentage = 0.5;
      revealDurationMs = 45 * 60 * 1000; // 45 minutes
      break;
    case 'household':
      revealPercentage = 0.3;
      revealDurationMs = 60 * 60 * 1000; // 60 minutes
      break;
  }

  // Get all orders for this entity
  const allOrderIds = [...entity.incomingOrderIds, ...entity.outgoingOrderIds];
  
  // Randomly reveal orders based on percentage
  const ordersToReveal = Math.floor(allOrderIds.length * revealPercentage);
  const shuffled = [...allOrderIds].sort(() => Math.random() - 0.5);
  const selectedOrderIds = shuffled.slice(0, ordersToReveal);

  const revealUntil = Date.now() + revealDurationMs;

  for (const orderId of selectedOrderIds) {
    const order = gameState.orders[orderId];
    if (order) {
      order.isRevealed = true;
      order.revealedUntil = revealUntil;
    }
  }

  return { ...gameState };
}
