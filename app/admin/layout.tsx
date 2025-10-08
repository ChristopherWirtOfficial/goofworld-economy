'use client';

import { Box, Flex, VStack, HStack, Heading, Link, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', exact: true },
    { href: '/admin/state', label: 'Game State' },
    { href: '/admin/actions', label: 'Player Actions' },
    { href: '/admin/simulation', label: 'Simulation' },
    { href: '/admin/settings', label: 'Settings' },
  ];

  return (
    <Flex minH="100vh" bg="#0f1117">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="#1a1d29"
        borderRight="1px solid"
        borderColor="whiteAlpha.100"
        position="fixed"
        h="100vh"
        overflowY="auto"
      >
        <VStack align="stretch" gap={0} p={4}>
          {/* Header */}
          <Box mb={6}>
            <Heading size="lg" color="red.400" mb={1}>
              ADMIN
            </Heading>
            <Text fontSize="sm" color="gray.500">
              Goof World Control Center
            </Text>
          </Box>

          {/* Navigation */}
          <VStack align="stretch" gap={1}>
            {navItems.map((item) => {
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  as={NextLink}
                  href={item.href}
                  px={4}
                  py={3}
                  borderRadius="md"
                  bg={isActive ? 'whiteAlpha.100' : 'transparent'}
                  color={isActive ? 'white' : 'gray.400'}
                  fontWeight={isActive ? 'semibold' : 'medium'}
                  fontSize="sm"
                  borderLeft="3px solid"
                  borderColor={isActive ? 'red.400' : 'transparent'}
                  _hover={{
                    bg: 'whiteAlpha.50',
                    color: 'white',
                    textDecoration: 'none',
                  }}
                  transition="all 0.2s"
                >
                  {item.label}
                </Link>
              );
            })}
          </VStack>

          {/* Quick Actions */}
          <Box mt={8} pt={6} borderTop="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="xs" color="gray.600" fontWeight="bold" mb={2} px={4}>
              QUICK ACTIONS
            </Text>
            <Link
              as={NextLink}
              href="/"
              px={4}
              py={2}
              fontSize="sm"
              color="cyan.400"
              _hover={{ color: 'cyan.300' }}
            >
              → View Game (Player View)
            </Link>
          </Box>
        </VStack>
      </Box>

      {/* Main Content */}
      <Box ml="250px" flex={1} p={8}>
        {children}
      </Box>
    </Flex>
  );
}

