import { useAtomValue } from 'jotai';
import { Box, Text, VStack, HStack, SimpleGrid, Badge, Grid, Button } from '@chakra-ui/react';
import { gameStateAtom, entityDetailsAtom } from '@/store/atoms';
import { Entity, Neighborhood } from '@/shared/types';
import { useGameActions } from '@/hooks/useGameActions';
import { useGameState } from '@/hooks/useGameState';

function WarehouseCard({ entity }: { entity: Entity }) {
  const { performAction } = useGameActions();
  const { getEntityDetails } = useGameState();
  const entityDetails = getEntityDetails(entity.id);

  const handleReveal = () => {
    performAction({
      type: 'reveal_orders',
      layer: 'warehouse',
    });
  };

  return (
    <VStack gap={2}>
      <Box
        bg="whiteAlpha.50"
        border="2px solid"
        borderColor="#22d3ee"
        borderRadius="lg"
        p={4}
        textAlign="center"
        cursor="pointer"
        transition="all 0.2s"
        _hover={{
          bg: 'whiteAlpha.100',
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 16px #22d3ee40',
        }}
      >
        <Text fontSize="md" color="cyan.300" fontWeight="bold" mb={2}>
          {entity.name}
        </Text>
        <VStack gap={1}>
          <Box
            bg="whiteAlpha.100"
            borderRadius="md"
            px={3}
            py={1}
            display="inline-block"
          >
            <Text fontSize="xs" color="gray.300" fontWeight="medium">
              {entity.outgoingOrderIds.length} total orders
            </Text>
          </Box>
          {entityDetails && entityDetails.revealedOutgoingCount > 0 && (
            <Box
              bg="cyan.900"
              borderRadius="md"
              px={3}
              py={1}
              display="inline-block"
              border="1px solid"
              borderColor="cyan.600"
            >
              <Text fontSize="xs" color="cyan.200" fontWeight="medium">
                {entityDetails.revealedOutgoingCount} revealed
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
      <Button
        size="sm"
        colorScheme="cyan"
        variant="solid"
        onClick={handleReveal}
        fontSize="xs"
        px={3}
        py={1}
        height="auto"
        bg="cyan.600"
        color="white"
        _hover={{
          bg: "cyan.500",
        }}
        _active={{
          bg: "cyan.700",
        }}
      >
        Reveal 70% (30m)
      </Button>
    </VStack>
  );
}

function NeighborhoodCard({ neighborhood, entities }: { neighborhood: Neighborhood; entities: Record<string, Entity> }) {
  const stores = neighborhood.storeIds.map(id => entities[id]).filter(Boolean);
  const households = neighborhood.householdIds.map(id => entities[id]).filter(Boolean);
  const { performAction } = useGameActions();
  const { getEntityDetails } = useGameState();

  const handleRevealStores = () => {
    performAction({
      type: 'reveal_orders',
      layer: 'store',
      neighborhoodId: neighborhood.id,
    });
  };

  const handleRevealHouseholds = () => {
    performAction({
      type: 'reveal_orders',
      layer: 'household',
      neighborhoodId: neighborhood.id,
    });
  };

  return (
    <Box
      bg="#1a1d29"
      border="2px solid"
      borderColor="whiteAlpha.200"
      borderRadius="lg"
      p={5}
      transition="all 0.2s"
      _hover={{
        borderColor: "purple.500",
        boxShadow: '0 4px 12px rgba(192, 132, 252, 0.2)',
      }}
    >
      <VStack align="stretch" gap={4}>
        {/* Neighborhood Header */}
        <HStack justify="space-between" align="center">
          <Text fontSize="lg" color="white" fontWeight="bold">
            {neighborhood.name}
          </Text>
          <HStack gap={2}>
            <Box
              bg="purple.900"
              borderRadius="md"
              px={3}
              py={1}
              border="1px solid"
              borderColor="purple.600"
            >
              <Text fontSize="xs" color="purple.200" fontWeight="medium">
                {stores.length} stores
              </Text>
            </Box>
            <Box
              bg="orange.900"
              borderRadius="md"
              px={3}
              py={1}
              border="1px solid"
              borderColor="orange.600"
            >
              <Text fontSize="xs" color="orange.200" fontWeight="medium">
                {households.length} households
              </Text>
            </Box>
          </HStack>
        </HStack>

        {/* Stores in this neighborhood */}
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center">
            <Box
              bg="purple.950"
              borderLeft="3px solid"
              borderColor="purple.500"
              px={2}
              py={1}
              borderRadius="sm"
              width="fit-content"
            >
              <Text fontSize="2xs" color="purple.300" fontWeight="bold" letterSpacing="wide">
                STORES
              </Text>
            </Box>
            <Button
              size="xs"
              colorScheme="purple"
              variant="solid"
              onClick={handleRevealStores}
              fontSize="2xs"
              px={2}
              py={1}
              height="auto"
              bg="purple.600"
              color="white"
              _hover={{
                bg: "purple.500",
              }}
              _active={{
                bg: "purple.700",
              }}
            >
              Reveal 50% (45m)
            </Button>
          </HStack>
          <SimpleGrid columns={5} gap={2}>
            {stores.map((store) => {
              const storeDetails = getEntityDetails(store.id);
              return (
                <Box
                  key={store.id}
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="#c084fc"
                  borderRadius="md"
                  px={2}
                  py={1.5}
                  textAlign="center"
                  cursor="pointer"
                  fontSize="2xs"
                  transition="all 0.2s"
                  _hover={{
                    bg: 'whiteAlpha.100',
                    borderColor: 'purple.400',
                    transform: 'scale(1.05)',
                  }}
                >
                  <Text color="purple.300" fontWeight="semibold">
                    {store.name.replace('Store ', 'S')}
                  </Text>
                  <Text color="gray.600" fontSize="3xs">
                    {store.outgoingOrderIds.length} total
                  </Text>
                  {storeDetails && storeDetails.revealedOutgoingCount > 0 && (
                    <Text color="purple.200" fontSize="3xs" fontWeight="medium">
                      {storeDetails.revealedOutgoingCount} revealed
                    </Text>
                  )}
                </Box>
              );
            })}
          </SimpleGrid>
        </VStack>

        {/* Households visualization */}
        <VStack align="stretch" gap={2}>
          <HStack justify="space-between" align="center">
            <Box
              bg="orange.950"
              borderLeft="3px solid"
              borderColor="orange.500"
              px={2}
              py={1}
              borderRadius="sm"
              width="fit-content"
            >
              <Text fontSize="2xs" color="orange.300" fontWeight="bold" letterSpacing="wide">
                HOUSEHOLDS ({households.length})
              </Text>
            </Box>
            <Button
              size="xs"
              colorScheme="orange"
              variant="solid"
              onClick={handleRevealHouseholds}
              fontSize="2xs"
              px={2}
              py={1}
              height="auto"
              bg="orange.600"
              color="white"
              _hover={{
                bg: "orange.500",
              }}
              _active={{
                bg: "orange.700",
              }}
            >
              Reveal 30% (60m)
            </Button>
          </HStack>
          <Box
            bg="whiteAlpha.30"
            borderRadius="md"
            p={2}
            position="relative"
            height="40px"
          >
            <Grid templateColumns="repeat(50, 1fr)" gap={0.5} h="full">
              {households.map((household) => (
                <Box
                  key={household.id}
                  bg="#fb923c"
                  borderRadius="sm"
                  cursor="pointer"
                  title={household.name}
                  transition="all 0.1s"
                  _hover={{
                    bg: 'orange.300',
                    transform: 'scale(1.5)',
                    zIndex: 10,
                  }}
                />
              ))}
            </Grid>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
}

export function TownVisualization() {
  const gameState = useAtomValue(gameStateAtom);

  if (!gameState) return null;

  const entities = Object.values(gameState.entities);
  const warehouses = entities.filter(e => e.type === 'warehouse');
  const neighborhoods = gameState.neighborhoods ? Object.values(gameState.neighborhoods) : [];
  
  // Calculate revealed orders count
  const allOrders = Object.values(gameState.orders);
  const revealedOrders = allOrders.filter(order => order.isRevealed).length;

  return (
    <VStack align="stretch" gap={8}>
      {/* Warehouses Section */}
      <VStack align="stretch" gap={4}>
        <HStack align="center" gap={3}>
          <Box
            bg="cyan.900"
            borderLeft="4px solid"
            borderColor="cyan.400"
            px={3}
            py={1.5}
            borderRadius="md"
          >
            <Text fontSize="xs" fontWeight="bold" color="cyan.300" letterSpacing="wider">
              GLOBAL WAREHOUSES
            </Text>
          </Box>
          <Box flex={1} height="1px" bg="cyan.900" />
        </HStack>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {warehouses.map((warehouse) => (
            <WarehouseCard key={warehouse.id} entity={warehouse} />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Visual separator */}
      <Box height="2px" bg="whiteAlpha.100" my={2} />

      {/* Neighborhoods Section */}
      <VStack align="stretch" gap={4}>
        <HStack align="center" gap={3}>
          <Box
            bg="purple.900"
            borderLeft="4px solid"
            borderColor="purple.400"
            px={3}
            py={1.5}
            borderRadius="md"
          >
            <Text fontSize="xs" fontWeight="bold" color="purple.300" letterSpacing="wider">
              NEIGHBORHOODS
            </Text>
          </Box>
          <Box flex={1} height="1px" bg="purple.900" />
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          {neighborhoods.map((neighborhood) => (
            <NeighborhoodCard 
              key={neighborhood.id} 
              neighborhood={neighborhood}
              entities={gameState.entities}
            />
          ))}
        </SimpleGrid>
      </VStack>
    </VStack>
  );
}
