'use client';

import { useState } from 'react';
import { useAtomValue } from 'jotai';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  Badge,
  Code,
  Button,
} from '@chakra-ui/react';
import { Tabs } from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { gameStateAtom } from '@/store/atoms';
import { useSocket } from '@/hooks/useSocket';

export default function GameStatePage() {
  useSocket();
  const gameState = useAtomValue(gameStateAtom);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [orderFilter, setOrderFilter] = useState<string>('all');

  if (!gameState) {
    return (
      <VStack align="center" justify="center" minH="60vh">
        <Heading size="lg" color="gray.400">
          Loading game state...
        </Heading>
      </VStack>
    );
  }

  const entities = Object.values(gameState.entities);
  const orders = Object.values(gameState.orders);
  const neighborhoods = Object.values(gameState.neighborhoods);

  // Filter entities
  const filteredEntities = entities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = entityFilter === 'all' || e.type === entityFilter;
    return matchesSearch && matchesType;
  });

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.item.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = orderFilter === 'all' ||
                         (orderFilter === 'revealed' && o.isRevealed) ||
                         (orderFilter === 'hidden' && !o.isRevealed);
    return matchesSearch && matchesFilter;
  });

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Box>
        <Heading size="xl" color="white" mb={2}>
          Game State Inspector
        </Heading>
        <Text color="gray.400">
          View and inspect all game entities, orders, and neighborhoods
        </Text>
      </Box>

      {/* Search and Filters */}
      <HStack gap={4}>
        <Input
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          bg="#1a1d29"
          border="1px solid"
          borderColor="whiteAlpha.100"
          color="white"
          _placeholder={{ color: 'gray.500' }}
        />
        <Button
          size="md"
          variant="outline"
          colorScheme="cyan"
          onClick={() => {
            const json = JSON.stringify(gameState, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gamestate-${Date.now()}.json`;
            a.click();
          }}
        >
          Export JSON
        </Button>
      </HStack>

      {/* Tabs */}
      <Tabs.Root colorScheme="cyan" defaultValue="entities">
        <Tabs.List borderColor="whiteAlpha.100">
          <Tabs.Trigger value="entities" color="gray.400" _selected={{ color: 'white', borderColor: 'cyan.400' }}>
            Entities ({filteredEntities.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="orders" color="gray.400" _selected={{ color: 'white', borderColor: 'cyan.400' }}>
            Orders ({filteredOrders.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="neighborhoods" color="gray.400" _selected={{ color: 'white', borderColor: 'cyan.400' }}>
            Neighborhoods ({neighborhoods.length})
          </Tabs.Trigger>
          <Tabs.Trigger value="json" color="gray.400" _selected={{ color: 'white', borderColor: 'cyan.400' }}>
            Raw JSON
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.ContentGroup>
          {/* Entities Tab */}
          <Tabs.Content value="entities" px={0}>
            <VStack align="stretch" gap={4}>
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.400">Filter:</Text>
                <Button
                  size="sm"
                  variant={entityFilter === "all" ? "solid" : "outline"}
                  onClick={() => setEntityFilter("all")}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={entityFilter === "warehouse" ? "solid" : "outline"}
                  onClick={() => setEntityFilter("warehouse")}
                >
                  Warehouses
                </Button>
                <Button
                  size="sm"
                  variant={entityFilter === "store" ? "solid" : "outline"}
                  onClick={() => setEntityFilter("store")}
                >
                  Stores
                </Button>
                <Button
                  size="sm"
                  variant={entityFilter === "household" ? "solid" : "outline"}
                  onClick={() => setEntityFilter("household")}
                >
                  Households
                </Button>
              </HStack>

              <Box
                bg="#1a1d29"
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.100"
                overflow="hidden"
              >
                <Box overflowX="auto">
                  <Table.Root  size="sm">
                    <Table.Header bg="whiteAlpha.50">
                      <Table.Row>
                        <Table.ColumnHeader color="gray.400">ID</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Name</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Type</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Neighborhood</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Incoming</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Outgoing</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Capacity</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredEntities.slice(0, 100).map((entity) => (
                        <Table.Row key={entity.id} _hover={{ bg: 'whiteAlpha.50' }}>
                          <Table.Cell color="cyan.400" fontSize="xs" fontFamily="mono">{entity.id}</Table.Cell>
                          <Table.Cell color="white">{entity.name}</Table.Cell>
                          <Table.Cell>
                            <Badge
                              colorScheme={
                                entity.type === 'warehouse' ? 'cyan' :
                                entity.type === 'store' ? 'purple' :
                                entity.type === 'household' ? 'orange' : 'gray'
                              }
                            >
                              {entity.type}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell color="gray.400" fontSize="xs">
                            {entity.neighborhoodId || '-'}
                          </Table.Cell>
                          <Table.Cell color="green.400">{entity.incomingOrderIds.length}</Table.Cell>
                          <Table.Cell color="blue.400">{entity.outgoingOrderIds.length}</Table.Cell>
                          <Table.Cell color="gray.500">{entity.capacity.toLocaleString()}</Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
                {filteredEntities.length > 100 && (
                  <Box p={4} textAlign="center" borderTop="1px solid" borderColor="whiteAlpha.100">
                    <Text color="gray.500" fontSize="sm">
                      Showing first 100 of {filteredEntities.length} entities
                    </Text>
                  </Box>
                )}
              </Box>
            </VStack>
          </Tabs.Content>

          {/* Orders Tab */}
          <Tabs.Content value="orders" px={0}>
            <VStack align="stretch" gap={4}>
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.400">Filter:</Text>
                <Button
                  size="sm"
                  variant={orderFilter === "all" ? "solid" : "outline"}
                  onClick={() => setOrderFilter("all")}
                >
                  All Orders
                </Button>
                <Button
                  size="sm"
                  variant={orderFilter === "revealed" ? "solid" : "outline"}
                  onClick={() => setOrderFilter("revealed")}
                >
                  Revealed Only
                </Button>
                <Button
                  size="sm"
                  variant={orderFilter === "hidden" ? "solid" : "outline"}
                  onClick={() => setOrderFilter("hidden")}
                >
                  Hidden Only
                </Button>
              </HStack>

              <Box
                bg="#1a1d29"
                borderRadius="lg"
                border="1px solid"
                borderColor="whiteAlpha.100"
                overflow="hidden"
              >
                <Box overflowX="auto">
                  <Table.Root  size="sm">
                    <Table.Header bg="whiteAlpha.50">
                      <Table.Row>
                        <Table.ColumnHeader color="gray.400">ID</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Item</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Quantity</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">From</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">To</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Status</Table.ColumnHeader>
                        <Table.ColumnHeader color="gray.400">Source</Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filteredOrders.slice(0, 100).map((order) => (
                        <Table.Row key={order.id} _hover={{ bg: 'whiteAlpha.50' }}>
                          <Table.Cell color="cyan.400" fontSize="xs" fontFamily="mono">{order.id}</Table.Cell>
                          <Table.Cell color="white">{order.item}</Table.Cell>
                          <Table.Cell color="yellow.400">{order.quantity.toLocaleString()} lbs</Table.Cell>
                          <Table.Cell color="gray.400" fontSize="xs">{order.fromEntityId}</Table.Cell>
                          <Table.Cell color="gray.400" fontSize="xs">{order.toEntityId}</Table.Cell>
                          <Table.Cell>
                            <Badge colorScheme={order.isRevealed ? 'green' : 'gray'}>
                              {order.isRevealed ? 'Revealed' : 'Hidden'}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell color="gray.500" fontSize="xs">
                            {order.revealSource || '-'}
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
                {filteredOrders.length > 100 && (
                  <Box p={4} textAlign="center" borderTop="1px solid" borderColor="whiteAlpha.100">
                    <Text color="gray.500" fontSize="sm">
                      Showing first 100 of {filteredOrders.length} orders
                    </Text>
                  </Box>
                )}
              </Box>
            </VStack>
          </Tabs.Content>

          {/* Neighborhoods Tab */}
          <Tabs.Content value="neighborhoods" px={0}>
            <VStack align="stretch" gap={4}>
              {neighborhoods.map((neighborhood) => {
                const stores = neighborhood.storeIds.length;
                const households = neighborhood.householdIds.length;
                
                return (
                  <Box
                    key={neighborhood.id}
                    bg="#1a1d29"
                    p={5}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="whiteAlpha.100"
                  >
                    <HStack justify="space-between" mb={4}>
                      <Heading size="md" color="white">
                        {neighborhood.name}
                      </Heading>
                      <HStack>
                        <Badge colorScheme="purple">{stores} stores</Badge>
                        <Badge colorScheme="orange">{households} households</Badge>
                      </HStack>
                    </HStack>
                    <Text color="gray.400" fontSize="sm" fontFamily="mono">
                      ID: {neighborhood.id}
                    </Text>
                  </Box>
                );
              })}
            </VStack>
          </Tabs.Content>

          {/* Raw JSON Tab */}
          <Tabs.Content value="json" px={0}>
            <Box
              bg="#1a1d29"
              p={6}
              borderRadius="lg"
              border="1px solid"
              borderColor="whiteAlpha.100"
              maxH="600px"
              overflowY="auto"
            >
              <Code
                display="block"
                whiteSpace="pre"
                fontSize="xs"
                color="green.400"
                bg="transparent"
              >
                {JSON.stringify(gameState, null, 2)}
              </Code>
            </Box>
          </Tabs.Content>
        </Tabs.ContentGroup>
      </Tabs.Root>
    </VStack>
  );
}

