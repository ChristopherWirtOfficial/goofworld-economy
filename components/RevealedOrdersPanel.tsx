import { useAtomValue } from 'jotai';
import { Box, Text, VStack, HStack, Badge, Button } from '@chakra-ui/react';
import { Separator } from '@chakra-ui/react';
import { useState } from 'react';
import { revealedOrdersAtom, entityDetailsAtom } from '@/store/atoms';
import { useGameState } from '@/hooks/useGameState';

export function RevealedOrdersPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const revealedOrders = useAtomValue(revealedOrdersAtom);
  const entityDetails = useAtomValue(entityDetailsAtom);
  const { getEntityById, getRevealedOrdersByLayer } = useGameState();

  const warehouseOrders = getRevealedOrdersByLayer('warehouse');
  const storeOrders = getRevealedOrdersByLayer('store');
  const householdOrders = getRevealedOrdersByLayer('household');

  const formatTimeRemaining = (revealedUntil?: number) => {
    if (!revealedUntil) return 'Unknown';
    const remaining = Math.max(0, revealedUntil - Date.now());
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getOrderColor = (revealSource?: string) => {
    switch (revealSource) {
      case 'warehouse': return 'cyan';
      case 'store': return 'purple';
      case 'household': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Box
      bg="#1a1d29"
      border="1px solid"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      p={4}
      position="fixed"
      top={4}
      right={4}
      width="350px"
      maxHeight="80vh"
      overflowY="auto"
      zIndex={1000}
    >
      <VStack align="stretch" gap={3}>
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" fontWeight="bold" color="white">
            Revealed Orders ({revealedOrders.length})
          </Text>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            color="gray.400"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </Button>
        </HStack>

        {isExpanded && (
          <VStack align="stretch" gap={4}>
            {/* Warehouse Orders */}
            {warehouseOrders.length > 0 && (
              <Box>
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="cyan.300">
                    Warehouse Orders ({warehouseOrders.length})
                  </Text>
                </HStack>
                <VStack align="stretch" gap={1}>
                  {warehouseOrders.slice(0, 3).map((order) => {
                    const fromEntity = getEntityById(order.fromEntityId);
                    const toEntity = getEntityById(order.toEntityId);
                    return (
                      <Box
                        key={order.id}
                        bg="whiteAlpha.50"
                        borderRadius="sm"
                        p={2}
                        fontSize="xs"
                      >
                        <HStack justify="space-between">
                          <Text color="gray.300">
                            {fromEntity?.name} → {toEntity?.name}
                          </Text>
                          <Badge colorScheme={getOrderColor(order.revealSource)} size="sm">
                            {order.quantity} {order.item}
                          </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="2xs">
                          {formatTimeRemaining(order.revealedUntil)}
                        </Text>
                      </Box>
                    );
                  })}
                  {warehouseOrders.length > 3 && (
                    <Text color="gray.500" fontSize="2xs" textAlign="center">
                      +{warehouseOrders.length - 3} more...
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {/* Store Orders */}
            {storeOrders.length > 0 && (
              <Box>
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="purple.300">
                    Store Orders ({storeOrders.length})
                  </Text>
                </HStack>
                <VStack align="stretch" gap={1}>
                  {storeOrders.slice(0, 3).map((order) => {
                    const fromEntity = getEntityById(order.fromEntityId);
                    const toEntity = getEntityById(order.toEntityId);
                    return (
                      <Box
                        key={order.id}
                        bg="whiteAlpha.50"
                        borderRadius="sm"
                        p={2}
                        fontSize="xs"
                      >
                        <HStack justify="space-between">
                          <Text color="gray.300">
                            {fromEntity?.name} → {toEntity?.name}
                          </Text>
                          <Badge colorScheme={getOrderColor(order.revealSource)} size="sm">
                            {order.quantity} {order.item}
                          </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="2xs">
                          {formatTimeRemaining(order.revealedUntil)}
                        </Text>
                      </Box>
                    );
                  })}
                  {storeOrders.length > 3 && (
                    <Text color="gray.500" fontSize="2xs" textAlign="center">
                      +{storeOrders.length - 3} more...
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {/* Household Orders */}
            {householdOrders.length > 0 && (
              <Box>
                <HStack mb={2}>
                  <Text fontSize="sm" fontWeight="semibold" color="orange.300">
                    Household Orders ({householdOrders.length})
                  </Text>
                </HStack>
                <VStack align="stretch" gap={1}>
                  {householdOrders.slice(0, 3).map((order) => {
                    const fromEntity = getEntityById(order.fromEntityId);
                    const toEntity = getEntityById(order.toEntityId);
                    return (
                      <Box
                        key={order.id}
                        bg="whiteAlpha.50"
                        borderRadius="sm"
                        p={2}
                        fontSize="xs"
                      >
                        <HStack justify="space-between">
                          <Text color="gray.300">
                            {fromEntity?.name} → {toEntity?.name}
                          </Text>
                          <Badge colorScheme={getOrderColor(order.revealSource)} size="sm">
                            {order.quantity} {order.item}
                          </Badge>
                        </HStack>
                        <Text color="gray.500" fontSize="2xs">
                          {formatTimeRemaining(order.revealedUntil)}
                        </Text>
                      </Box>
                    );
                  })}
                  {householdOrders.length > 3 && (
                    <Text color="gray.500" fontSize="2xs" textAlign="center">
                      +{householdOrders.length - 3} more...
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {revealedOrders.length === 0 && (
              <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                No orders revealed yet. Use the reveal buttons to uncover order information.
              </Text>
            )}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
