import { useAtomValue } from 'jotai';
import { Box, Text, VStack, HStack, SimpleGrid, Badge, Grid } from '@chakra-ui/react';
import { gameStateAtom } from '@/store/atoms';
import { Entity, Neighborhood } from '@/shared/types';

function WarehouseCard({ entity }: { entity: Entity }) {
  return (
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
      <Text fontSize="md" color="cyan.300" fontWeight="bold" mb={1}>
        {entity.name}
      </Text>
      <Badge colorScheme="cyan" fontSize="xs">
        {entity.outgoingOrderIds.length} orders
      </Badge>
    </Box>
  );
}

function NeighborhoodCard({ neighborhood, entities }: { neighborhood: Neighborhood; entities: Record<string, Entity> }) {
  const stores = neighborhood.storeIds.map(id => entities[id]).filter(Boolean);
  const households = neighborhood.householdIds.map(id => entities[id]).filter(Boolean);

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
            <Badge colorScheme="purple" fontSize="xs">
              {stores.length} stores
            </Badge>
            <Badge colorScheme="orange" fontSize="xs">
              {households.length} households
            </Badge>
          </HStack>
        </HStack>

        {/* Stores in this neighborhood */}
        <VStack align="stretch" gap={2}>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            STORES
          </Text>
          <SimpleGrid columns={5} gap={2}>
            {stores.map((store) => (
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
                  {store.outgoingOrderIds.length}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>

        {/* Households visualization */}
        <VStack align="stretch" gap={2}>
          <Text fontSize="xs" color="gray.500" fontWeight="semibold">
            HOUSEHOLDS ({households.length})
          </Text>
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

  return (
    <VStack align="stretch" gap={8}>
      {/* Warehouses Section */}
      <VStack align="stretch" gap={3}>
        <Badge colorScheme="cyan" fontSize="sm" px={3} py={1} width="fit-content">
          GLOBAL WAREHOUSES
        </Badge>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={4}>
          {warehouses.map((warehouse) => (
            <WarehouseCard key={warehouse.id} entity={warehouse} />
          ))}
        </SimpleGrid>
      </VStack>

      {/* Visual separator */}
      <Box height="1px" bg="whiteAlpha.200" />

      {/* Neighborhoods Section */}
      <VStack align="stretch" gap={3}>
        <Badge colorScheme="purple" fontSize="sm" px={3} py={1} width="fit-content">
          NEIGHBORHOODS
        </Badge>
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
