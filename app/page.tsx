'use client';

import { Box, Flex } from '@chakra-ui/react';
import { useSocket } from '@/hooks/useSocket';
import GameView from '@/components/GameView';
import Header from '@/components/Header';

export default function Home() {
  useSocket();

  return (
    <Flex minH="100vh" direction="column" bg="#0f1117">
      <Header />
      <Box flex="1">
        <GameView />
      </Box>
    </Flex>
  );
}
