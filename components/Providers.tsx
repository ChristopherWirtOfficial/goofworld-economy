'use client';

import { Provider } from 'jotai';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Provider>
        <ChakraProvider value={defaultSystem}>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </ChakraProvider>
      </Provider>
    </QueryClientProvider>
  );
}

