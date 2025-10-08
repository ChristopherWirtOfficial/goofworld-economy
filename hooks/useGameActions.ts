import { useAtom, useAtomValue } from 'jotai';
import { playerIdAtom, isActionAllowedAtom } from '@/store/atoms';
import { getSocket } from '@/lib/socket';
import { PlayerAction } from '@/shared/types';

export function useGameActions() {
  const [playerId] = useAtom(playerIdAtom);
  const isActionAllowed = useAtomValue(isActionAllowedAtom);

  const performAction = (action: Omit<PlayerAction, 'playerId' | 'timestamp'>) => {
    // TODO: Add turn cooldown system (currently disabled for development)
    if (!isActionAllowed) {
      console.warn('Action blocked: Turn cooldown active');
      return;
    }

    const socket = getSocket();
    const fullAction: PlayerAction = {
      ...action,
      playerId,
      timestamp: Date.now(),
    };
    socket.emit('playerAction', fullAction);
  };

  const moveOrder = (orderId: string, targetEntityId: string) => {
    performAction({
      type: 'move_order',
      orderId,
      targetEntityId,
    });
  };

  const revealOrders = (layer: 'warehouse' | 'store' | 'household', neighborhoodId?: string) => {
    performAction({
      type: 'reveal_orders',
      layer,
      neighborhoodId,
    });
  };

  return {
    performAction,
    moveOrder,
    revealOrders,
  };
}

