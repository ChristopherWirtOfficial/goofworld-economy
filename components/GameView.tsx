import { useAtomValue } from 'jotai';
import { Box, Heading, Text, VStack, SimpleGrid, Spinner, Center } from '@chakra-ui/react';
import { gameStateAtom } from '@/store/atoms';
import { TownVisualization } from './TownVisualization';
import { RevealedOrdersPanel } from './RevealedOrdersPanel';

export default function GameView() {
  const gameState = useAtomValue(gameStateAtom);

  if (!gameState) {
    return (
      <Center minH="60vh" flexDir="column" gap={4}>
        <Spinner size="xl" color="blue.500" />
        <Text fontSize="lg" color="gray.500">
          Connecting to Goof World...
        </Text>
      </Center>
    );
  }

  const entities = Object.values(gameState.entities);
  const warehouses = entities.filter(e => e.type === 'warehouse');
  const stores = entities.filter(e => e.type === 'store');
  const households = entities.filter(e => e.type === 'household');

  const totalOrders = Object.keys(gameState.orders).length;
  const revealedOrders = Object.values(gameState.orders).filter(o => o.isRevealed).length;

  return (
    <Box maxW="1400px" mx="auto" p={8} position="relative">
      <RevealedOrdersPanel />
      <VStack align="stretch" gap={8}>
        <Box 
          bg="#1a1d29" 
          p={6} 
          borderRadius="lg" 
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Heading size="lg" mb={4} color="white">
            System Overview
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 5 }} gap={6}>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color="cyan.400">
                {warehouses.length}
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Warehouses
              </Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color="purple.400">
                {stores.length}
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Stores
              </Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color="orange.400">
                {households.length}
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Households
              </Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color="gray.400">
                {totalOrders}
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Total Orders
              </Text>
            </VStack>
            <VStack>
              <Text fontSize="3xl" fontWeight="bold" color="green.400">
                {revealedOrders}
              </Text>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                Revealed Orders
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>

        <Box 
          bg="#1a1d29" 
          p={6} 
          borderRadius="lg" 
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Heading size="md" mb={4} color="white">
            Supply Chain Network
          </Heading>
          <TownVisualization />
        </Box>
      </VStack>
    </Box>
  );
}
