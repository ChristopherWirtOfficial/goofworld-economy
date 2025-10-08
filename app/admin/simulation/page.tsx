'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';

export default function SimulationPage() {
  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="xl" color="white" mb={2}>
          Simulation Mode
        </Heading>
        <Text color="gray.400">
          Run non-persisted simulations to test game mechanics and balance
        </Text>
      </Box>

      <Box
        bg="#1a1d29"
        p={8}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
        textAlign="center"
      >
        <Badge colorScheme="yellow" fontSize="md" mb={4}>
          Coming Soon
        </Badge>
        <Heading size="md" color="white" mb={4}>
          Simulation Mode
        </Heading>
        <Text color="gray.400" mb={6}>
          This feature will allow you to:
        </Text>
        <VStack align="start" gap={2} maxW="500px" mx="auto" mb={6}>
          <HStack>
            <Text color="cyan.400">•</Text>
            <Text color="gray.300">Run simulations without affecting the live game</Text>
          </HStack>
          <HStack>
            <Text color="cyan.400">•</Text>
            <Text color="gray.300">Test different initial conditions and chaos levels</Text>
          </HStack>
          <HStack>
            <Text color="cyan.400">•</Text>
            <Text color="gray.300">Fast-forward through game time</Text>
          </HStack>
          <HStack>
            <Text color="cyan.400">•</Text>
            <Text color="gray.300">Simulate player actions and strategies</Text>
          </HStack>
          <HStack>
            <Text color="cyan.400">•</Text>
            <Text color="gray.300">Export simulation results for analysis</Text>
          </HStack>
        </VStack>
        <Button colorScheme="cyan" disabled>
          Start Simulation
        </Button>
      </Box>
    </VStack>
  );
}

