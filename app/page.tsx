'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import GameView from '@/components/GameView';
import Header from '@/components/Header';

export default function Home() {
  const { connect } = useGameStore();

  useEffect(() => {
    connect();
  }, [connect]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <GameView />
    </main>
  );
}
