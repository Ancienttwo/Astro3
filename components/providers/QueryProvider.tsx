'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient as useRQClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Query Client Configuration
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default to 5 minutes stale time
        staleTime: 5 * 60 * 1000,
        // Keep data in cache for 10 minutes
        gcTime: 10 * 60 * 1000,
        // Retry on network errors but not on 4xx errors
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          return failureCount < 3;
        },
        // Exponential backoff
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Refetch on window focus in development only
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
        // Don't refetch on reconnect in mobile apps
        refetchOnReconnect: 'always',
        // Refetch on mount if data is stale
        refetchOnMount: true,
      },
      mutations: {
        // Retry mutations on network errors
        retry: (failureCount, error) => {
          if (error instanceof Error && error.message.includes('4')) {
            return false;
          }
          return failureCount < 2;
        },
        // Shorter retry delay for mutations
        retryDelay: (attemptIndex) => Math.min(500 * 2 ** attemptIndex, 10000),
      },
    },
  });
};

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);
  const [persister, setPersister] = React.useState<any>(null);

  // Initialize localStorage persister on client
  React.useEffect(() => {
    try {
      const p = createSyncStoragePersister({ storage: window.localStorage });
      setPersister(p);
    } catch (e) {
      console.warn('Persistor init skipped (non-browser env)');
    }
  }, []);

  // Global error handler
  React.useEffect(() => {
    const handleError = (error: Error, query?: any) => {
      console.error('Query error:', error, query);
    };

    queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'queryError') {
        handleError(event.error as Error, event.query);
      }
    });

    queryClient.getMutationCache().subscribe((event) => {
      if (event.type === 'mutationError') {
        handleError(event.error as Error, event.mutation);
      }
    });
  }, [queryClient]);

  // Handle online/offline status changes
  React.useEffect(() => {
    const handleOnline = () => {
      console.log('Back online - resuming queries');
      queryClient.resumePausedMutations();
      queryClient.refetchQueries();
    };

    const handleOffline = () => {
      console.log('Gone offline - pausing queries');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [queryClient]);

  // Focus refetch management for mobile
  React.useEffect(() => {
    let refetchTimer: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Delay refetch to avoid overwhelming on quick tab switches
        refetchTimer = setTimeout(() => {
          queryClient.refetchQueries({
            type: 'active',
            stale: true
          });
        }, 1000);
      } else if (refetchTimer) {
        clearTimeout(refetchTimer);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refetchTimer) {
        clearTimeout(refetchTimer);
      }
    };
  }, [queryClient]);

  const inner = (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  );

  // Use persistence when available; otherwise fallback to standard provider
  if (persister) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister, buster: 'v1' }}
      >
        {inner}
      </PersistQueryClientProvider>
    );
  }

  return <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>;
}

// Performance monitoring component
export function QueryPerformanceMonitor() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const startTime = performance.now();
    let queryCount = 0;
    let mutationCount = 0;

    const unsubscribeQueries = window.__REACT_QUERY_CLIENT__?.getQueryCache().subscribe(() => {
      queryCount++;
    });

    const unsubscribeMutations = window.__REACT_QUERY_CLIENT__?.getMutationCache().subscribe(() => {
      mutationCount++;
    });

    // Log performance stats every 30 seconds
    const interval = setInterval(() => {
      const elapsed = performance.now() - startTime;
      console.log('React Query Performance Stats:', {
        elapsed: `${(elapsed / 1000).toFixed(2)}s`,
        queries: queryCount,
        mutations: mutationCount,
        queriesPerSecond: (queryCount / (elapsed / 1000)).toFixed(2),
        mutationsPerSecond: (mutationCount / (elapsed / 1000)).toFixed(2)
      });
    }, 30000);

    return () => {
      clearInterval(interval);
      unsubscribeQueries?.();
      unsubscribeMutations?.();
    };
  }, []);

  return null;
}

// Custom hook for query client access
export function useQueryClient() {
  // Use TanStack's official hook rather than React context on the provider component
  return useRQClient();
}

// Prefetch helper hook
