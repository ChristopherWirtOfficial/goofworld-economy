import { useEffect } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import { getSocket } from '@/lib/socket';
import { gameStateAtom, nextActionTimeAtom, playerIdAtom } from '@/store/atoms';
import { GameState } from '@/shared/types';

export function useSocket() {
  const [gameState, setGameState] = useAtom(gameStateAtom);
  const setNextActionTime = useSetAtom(nextActionTimeAtom);
  const [playerId] = useAtom(playerIdAtom);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('checkCooldown', playerId);
    });

    socket.on('gameStateUpdate', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    socket.on('actionSuccess', ({ nextActionTime }: { nextActionTime: number }) => {
      setNextActionTime(nextActionTime);
    });

    socket.on('actionError', ({ message }: { message: string }) => {
      console.error('Action error:', message);
      alert(`Action failed: ${message}`);
    });

    socket.on('cooldownStatus', ({ onCooldown, nextActionTime }: { onCooldown: boolean; nextActionTime: number }) => {
      setNextActionTime(onCooldown ? nextActionTime : 0);
    });

    return () => {
      socket.off('connect');
      socket.off('gameStateUpdate');
      socket.off('actionSuccess');
      socket.off('actionError');
      socket.off('cooldownStatus');
    };
  }, [playerId, setGameState, setNextActionTime]);

  return { gameState, socket: getSocket() };
}

