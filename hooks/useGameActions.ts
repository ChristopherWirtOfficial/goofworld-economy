import { useAtom } from 'jotai';
import { playerIdAtom } from '@/store/atoms';
import { getSocket } from '@/lib/socket';
import { PlayerAction } from '@/shared/types';

export function useGameActions() {
  const [playerId] = useAtom(playerIdAtom);

  const performAction = (action: Omit<PlayerAction, 'playerId' | 'timestamp'>) => {
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

  const revealOrders = (revealEntityId: string) => {
    performAction({
      type: 'reveal_orders',
      revealEntityId,
    });
  };

  return {
    moveOrder,
    revealOrders,
  };
}

