import { useAtomValue } from 'jotai';
import { Box, Flex, Heading, Text, HStack, VStack, Badge } from '@chakra-ui/react';
import { gameStateAtom, onCooldownAtom, cooldownRemainingAtom } from '@/store/atoms';

export default function Header() {
  const gameState = useAtomValue(gameStateAtom);
  const onCooldown = useAtomValue(onCooldownAtom);
  const cooldownRemaining = useAtomValue(cooldownRemainingAtom);

  if (!gameState) return null;

  const now = Date.now();
  const timeRemaining = gameState.endTime - now;
  const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const cooldownMinutes = Math.floor(cooldownRemaining / 60);
  const cooldownSeconds = cooldownRemaining % 60;

  return (
    <Box 
      as="header" 
      bg="#1a1d29"
      color="white" 
      py={6} 
      px={8}
      borderBottom="1px solid"
      borderColor="whiteAlpha.100"
    >
      <Flex justify="space-between" align="center" maxW="1400px" mx="auto">
        <VStack align="start" gap={1}>
          <Heading 
            size="3xl" 
            fontWeight="black" 
            letterSpacing="tight"
            color="white"
          >
            GOOF WORLD
          </Heading>
          <Text 
            color="gray.400" 
            fontSize="md" 
            fontWeight="medium"
          >
            ⚠️ Catastrophe has struck. Stabilize the economy.
          </Text>
        </VStack>
        
        <HStack gap={6}>
          <Box 
            bg="whiteAlpha.50" 
            px={5} 
            py={3} 
            borderRadius="md"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="semibold" letterSpacing="wide">
                TIME REMAINING
              </Text>
              <Text fontSize="2xl" fontWeight="bold" lineHeight="1" color="cyan.400">
                {daysRemaining}d {hoursRemaining}h
              </Text>
            </VStack>
          </Box>
          
          <Box 
            bg="whiteAlpha.50" 
            px={5} 
            py={3} 
            borderRadius="md"
            border="1px solid"
            borderColor="whiteAlpha.100"
          >
            <VStack align="end" gap={0}>
              <Text fontSize="xs" color="gray.500" fontWeight="semibold" letterSpacing="wide">
                NEXT TURN
              </Text>
              <Text 
                fontSize="2xl" 
                fontWeight="bold" 
                lineHeight="1"
                color={onCooldown ? 'red.400' : 'green.400'}
              >
                {onCooldown ? `${cooldownMinutes}:${cooldownSeconds.toString().padStart(2, '0')}` : 'Ready'}
              </Text>
            </VStack>
          </Box>
        </HStack>
      </Flex>
    </Box>
  );
}
