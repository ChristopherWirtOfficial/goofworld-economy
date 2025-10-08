'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Badge,
  SimpleGrid,
} from '@chakra-ui/react';
import { gameStateAtom } from '@/store/atoms';
import { useSocket } from '@/hooks/useSocket';

export default function AdminDashboard() {
  useSocket(); // Connect to backend
  const gameState = useAtomValue(gameStateAtom);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset the game state? This will delete all current progress.')) {
      return;
    }

    setIsResetting(true);
    try {
      const response = await fetch('http://localhost:3001/api/reset', {
        method: 'POST',
      });
      const data = await response.json();
      alert(`Success: ${data.message}`);
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsResetting(false);
    }
  };

  if (!gameState) {
    return (
      <VStack align="center" justify="center" minH="60vh" gap={4}>
        <Heading size="lg" color="gray.400">
          Loading game state...
        </Heading>
      </VStack>
    );
  }

  const entities = Object.values(gameState.entities);
  const warehouses = entities.filter(e => e.type === 'warehouse');
  const stores = entities.filter(e => e.type === 'store');
  const households = entities.filter(e => e.type === 'household');
  const orders = Object.values(gameState.orders);
  const revealedOrders = orders.filter(o => o.isRevealed);
  const neighborhoods = Object.values(gameState.neighborhoods);

  const timeRemaining = gameState.endTime - Date.now();
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const gameProgress = ((Date.now() - gameState.startTime) / (gameState.endTime - gameState.startTime)) * 100;

  // Calculate some interesting metrics
  const ordersPerEntity = orders.length / entities.length;
  const revealPercentage = (revealedOrders.length / orders.length) * 100;
  
  // Order distribution by layer
  const warehouseOrderIds = new Set(warehouses.flatMap(w => [...w.incomingOrderIds, ...w.outgoingOrderIds]));
  const storeOrderIds = new Set(stores.flatMap(s => [...s.incomingOrderIds, ...s.outgoingOrderIds]));
  const householdOrderIds = new Set(households.flatMap(h => [...h.incomingOrderIds, ...h.outgoingOrderIds]));

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <HStack justify="space-between" align="start">
        <Box>
          <Heading size="xl" color="white" mb={2}>
            Admin Dashboard
          </Heading>
          <Text color="gray.400">
            Real-time game monitoring and control
          </Text>
        </Box>
        <HStack>
          <Button
            colorScheme="red"
            variant="outline"
            onClick={handleReset}
            loading={isResetting}
          >
            Reset Game
          </Button>
        </HStack>
      </HStack>

      {/* Game Timer */}
      <Box
        bg="#1a1d29"
        p={6}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <HStack justify="space-between">
          <VStack align="start" gap={0}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              TIME REMAINING
            </Text>
            <Heading size="lg" color="red.400">
              {daysRemaining}d {hoursRemaining}h
            </Heading>
          </VStack>
          <VStack align="end" gap={0}>
            <Text fontSize="sm" color="gray.500" fontWeight="medium">
              GAME PROGRESS
            </Text>
            <Heading size="lg" color="cyan.400">
              {gameProgress.toFixed(1)}%
            </Heading>
          </VStack>
        </HStack>
      </Box>

      {/* Core Metrics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        <StatCard
          label="Total Orders"
          value={orders.length}
          helpText={`${ordersPerEntity.toFixed(1)} per entity`}
          color="gray.400"
        />
        <StatCard
          label="Revealed Orders"
          value={revealedOrders.length}
          helpText={`${revealPercentage.toFixed(1)}% visible`}
          color="green.400"
        />
        <StatCard
          label="Entities"
          value={entities.length}
          helpText={`${warehouses.length}W + ${stores.length}S + ${households.length}H`}
          color="purple.400"
        />
        <StatCard
          label="Neighborhoods"
          value={neighborhoods.length}
          helpText={`${stores.length / neighborhoods.length} stores each`}
          color="orange.400"
        />
      </SimpleGrid>

      {/* Layer Distribution */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <LayerCard
          title="Warehouses"
          count={warehouses.length}
          orders={warehouseOrderIds.size}
          color="cyan"
        />
        <LayerCard
          title="Stores"
          count={stores.length}
          orders={storeOrderIds.size}
          color="purple"
        />
        <LayerCard
          title="Households"
          count={households.length}
          orders={householdOrderIds.size}
          color="orange"
        />
      </Grid>

      {/* Recent Activity Placeholder */}
      <Box
        bg="#1a1d29"
        p={6}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Heading size="md" color="white" mb={4}>
          System Status
        </Heading>
        <VStack align="stretch" gap={2}>
          <HStack>
            <Badge colorScheme="green">Online</Badge>
            <Text fontSize="sm" color="gray.400">
              Backend server connected
            </Text>
          </HStack>
          <HStack>
            <Badge colorScheme="green">Active</Badge>
            <Text fontSize="sm" color="gray.400">
              Database persistence enabled
            </Text>
          </HStack>
          <HStack>
            <Badge colorScheme="blue">Running</Badge>
            <Text fontSize="sm" color="gray.400">
              Simulation ticks every {gameState.tickInterval / 1000 / 60} minutes
            </Text>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}

function StatCard({
  label,
  value,
  helpText,
  color,
}: {
  label: string;
  value: number;
  helpText: string;
  color: string;
}) {
  return (
    <Box
      bg="#1a1d29"
      p={5}
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack align="stretch" gap={1}>
        <Text color="gray.500" fontSize="sm" fontWeight="medium">
          {label}
        </Text>
        <Text color={color} fontSize="3xl" fontWeight="bold">
          {value.toLocaleString()}
        </Text>
        <Text color="gray.600" fontSize="xs">
          {helpText}
        </Text>
      </VStack>
    </Box>
  );
}

function LayerCard({
  title,
  count,
  orders,
  color,
}: {
  title: string;
  count: number;
  orders: number;
  color: string;
}) {
  return (
    <Box
      bg="#1a1d29"
      p={5}
      borderRadius="lg"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between">
          <Text fontSize="sm" color="gray.500" fontWeight="bold">
            {title.toUpperCase()}
          </Text>
          <Badge colorScheme={color}>{count}</Badge>
        </HStack>
        <Text fontSize="2xl" color={`${color}.400`} fontWeight="bold">
          {orders.toLocaleString()}
        </Text>
        <Text fontSize="xs" color="gray.600">
          orders in this layer
        </Text>
      </VStack>
    </Box>
  );
}

