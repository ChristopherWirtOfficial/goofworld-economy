'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Spinner,
  SimpleGrid,
  Button,
} from '@chakra-ui/react';
import { Table } from '@chakra-ui/react';
import { Stat } from '@chakra-ui/react';

interface PlayerAction {
  id: number;
  player_id: string;
  action_type: string;
  action_data_json: string;
  timestamp: number;
  created_at: number;
}

export default function PlayerActionsPage() {
  const [actions, setActions] = useState<PlayerAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);

  const fetchActions = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/actions?limit=${limit}`);
      const data = await response.json();
      setActions(data);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActions();
    const interval = setInterval(fetchActions, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [fetchActions]);

  // Calculate statistics
  const uniquePlayers = new Set(actions.map(a => a.player_id)).size;
  const moveActions = actions.filter(a => a.action_type === 'move_order').length;
  const revealActions = actions.filter(a => a.action_type === 'reveal_orders').length;
  const actionsLast5Min = actions.filter(a => Date.now() - a.timestamp < 5 * 60 * 1000).length;

  return (
    <VStack align="stretch" gap={6}>
      {/* Header */}
      <Box>
        <Heading size="xl" color="white" mb={2}>
          Player Actions Analytics
        </Heading>
        <Text color="gray.400">
          Real-time monitoring of all player actions and game activity
        </Text>
      </Box>

      {/* Statistics */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
        <Box
          bg="#1a1d29"
          p={5}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Stat.Root>
            <Stat.Label color="gray.500" fontSize="sm">Total Actions</Stat.Label>
            <Stat.ValueText color="cyan.400" fontSize="3xl">{actions.length}</Stat.ValueText>
            <Stat.HelpText color="gray.600">all time</Stat.HelpText>
          </Stat.Root>
        </Box>

        <Box
          bg="#1a1d29"
          p={5}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Stat.Root>
            <Stat.Label color="gray.500" fontSize="sm">Unique Players</Stat.Label>
            <Stat.ValueText color="purple.400" fontSize="3xl">{uniquePlayers}</Stat.ValueText>
            <Stat.HelpText color="gray.600">active users</Stat.HelpText>
          </Stat.Root>
        </Box>

        <Box
          bg="#1a1d29"
          p={5}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Stat.Root>
            <Stat.Label color="gray.500" fontSize="sm">Move Orders</Stat.Label>
            <Stat.ValueText color="green.400" fontSize="3xl">{moveActions}</Stat.ValueText>
            <Stat.HelpText color="gray.600">{revealActions} reveals</Stat.HelpText>
          </Stat.Root>
        </Box>

        <Box
          bg="#1a1d29"
          p={5}
          borderRadius="lg"
          border="1px solid"
          borderColor="whiteAlpha.100"
        >
          <Stat.Root>
            <Stat.Label color="gray.500" fontSize="sm">Recent (5min)</Stat.Label>
            <Stat.ValueText color="orange.400" fontSize="3xl">{actionsLast5Min}</Stat.ValueText>
            <Stat.HelpText color="gray.600">active now</Stat.HelpText>
          </Stat.Root>
        </Box>
      </SimpleGrid>

      {/* Controls */}
      <HStack>
        <Box>
          <Text fontSize="sm" color="gray.400" mb={2}>Show:</Text>
          <HStack gap={2}>
            <Button
              size="sm"
              variant={limit === 50 ? "solid" : "outline"}
              onClick={() => setLimit(50)}
            >
              50
            </Button>
            <Button
              size="sm"
              variant={limit === 100 ? "solid" : "outline"}
              onClick={() => setLimit(100)}
            >
              100
            </Button>
            <Button
              size="sm"
              variant={limit === 500 ? "solid" : "outline"}
              onClick={() => setLimit(500)}
            >
              500
            </Button>
            <Button
              size="sm"
              variant={limit === 1000 ? "solid" : "outline"}
              onClick={() => setLimit(1000)}
            >
              1000
            </Button>
          </HStack>
        </Box>
      </HStack>

      {/* Actions Table */}
      <Box
        bg="#1a1d29"
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
        overflow="hidden"
      >
        {loading ? (
          <Box p={8} textAlign="center">
            <Spinner size="xl" color="cyan.400" />
          </Box>
        ) : (
          <Box overflowX="auto">
            <Table.Root size="sm">
              <Table.Header bg="whiteAlpha.50">
                <Table.Row>
                  <Table.ColumnHeader color="gray.400">ID</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400">Timestamp</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400">Player ID</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400">Action Type</Table.ColumnHeader>
                  <Table.ColumnHeader color="gray.400">Details</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {actions.map((action) => {
                  const actionData = JSON.parse(action.action_data_json);
                  const timestamp = new Date(action.timestamp).toLocaleString();
                  
                  return (
                    <Table.Row key={action.id} _hover={{ bg: 'whiteAlpha.50' }}>
                      <Table.Cell color="cyan.400" fontSize="xs" fontFamily="mono">#{action.id}</Table.Cell>
                      <Table.Cell color="gray.400" fontSize="xs">{timestamp}</Table.Cell>
                      <Table.Cell color="purple.400" fontSize="xs" fontFamily="mono">
                        {action.player_id.substring(0, 12)}...
                      </Table.Cell>
                      <Table.Cell>
                        <Badge
                          colorScheme={action.action_type === 'move_order' ? 'green' : 'orange'}
                        >
                          {action.action_type}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell color="gray.400" fontSize="xs">
                        {action.action_type === 'move_order' ? (
                          <>Order: {actionData.orderId} → {actionData.targetEntityId}</>
                        ) : (
                          <>Layer: {actionData.layer} {actionData.neighborhoodId ? `(${actionData.neighborhoodId})` : ''}</>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table.Root>
          </Box>
        )}

        {!loading && actions.length === 0 && (
          <Box p={8} textAlign="center">
            <Text color="gray.500">No player actions recorded yet</Text>
          </Box>
        )}
      </Box>
    </VStack>
  );
}

