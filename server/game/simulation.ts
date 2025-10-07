import { GameState } from '../../shared/types';

export function simulationTick(gameState: GameState): GameState {
  const now = Date.now();

  // Hide orders that have expired
  for (const orderId in gameState.orders) {
    const order = gameState.orders[orderId];
    if (order.isRevealed && order.revealedUntil && order.revealedUntil < now) {
      order.isRevealed = false;
      order.revealedUntil = undefined;
    }
  }

  // TODO: Add auto-stabilization logic
  // TODO: Add metrics calculation
  // TODO: Add spoilage/waste mechanics

  return { ...gameState };
}
