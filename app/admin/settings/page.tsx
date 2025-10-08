'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Field } from '@chakra-ui/react';
import { Switch } from '@chakra-ui/react';
import { Separator } from '@chakra-ui/react';

export default function SettingsPage() {
  return (
    <VStack align="stretch" gap={6}>
      <Box>
        <Heading size="xl" color="white" mb={2}>
          Game Settings
        </Heading>
        <Text color="gray.400">
          Configure game parameters and system settings
        </Text>
      </Box>

      <Box
        bg="#1a1d29"
        p={6}
        borderRadius="lg"
        border="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Badge colorScheme="yellow" mb={4}>
          Coming Soon
        </Badge>
        <VStack align="stretch" gap={6}>
          <Box>
            <Heading size="md" color="white" mb={4}>
              Game Configuration
            </Heading>
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label color="gray.400">Turn Cooldown (minutes)</Field.Label>
                <Input
                  type="number"
                  defaultValue={5}
                  disabled
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  color="white"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="gray.400">Simulation Tick Interval (minutes)</Field.Label>
                <Input
                  type="number"
                  defaultValue={5}
                  disabled
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  color="white"
                />
              </Field.Root>

              <Field.Root display="flex" alignItems="center">
                <Field.Label color="gray.400" mb={0}>
                  Enable Turn Cooldown
                </Field.Label>
                <Switch.Root colorScheme="cyan" disabled>
                  <Switch.Control />
                  <Switch.Thumb />
                </Switch.Root>
              </Field.Root>

              <Field.Root display="flex" alignItems="center">
                <Field.Label color="gray.400" mb={0}>
                  Auto-save Game State
                </Field.Label>
                <Switch.Root colorScheme="cyan" defaultChecked disabled>
                  <Switch.Control />
                  <Switch.Thumb />
                </Switch.Root>
              </Field.Root>
            </VStack>
          </Box>

          <Separator borderColor="whiteAlpha.100" />

          <Box>
            <Heading size="md" color="white" mb={4}>
              Reveal Configuration
            </Heading>
            <VStack align="stretch" gap={4}>
              <Field.Root>
                <Field.Label color="gray.400">Warehouse Reveal % (currently 70%)</Field.Label>
                <Input
                  type="number"
                  defaultValue={70}
                  disabled
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  color="white"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="gray.400">Store Reveal % (currently 50%)</Field.Label>
                <Input
                  type="number"
                  defaultValue={50}
                  disabled
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  color="white"
                />
              </Field.Root>

              <Field.Root>
                <Field.Label color="gray.400">Household Reveal % (currently 30%)</Field.Label>
                <Input
                  type="number"
                  defaultValue={30}
                  disabled
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  color="white"
                />
              </Field.Root>
            </VStack>
          </Box>

          <HStack>
            <Button colorScheme="cyan" disabled>
              Save Settings
            </Button>
            <Button variant="outline" disabled>
              Reset to Defaults
            </Button>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}

