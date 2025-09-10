'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { syncManager } from '@/lib/services/syncManager';
import { useMutualAidStore } from '@/lib/stores/mutualAidStore';

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

  // Initialize sync manager when provider mounts
  React.useEffect(() => {
    syncManager.init(queryClient);

    return () => {
      syncManager.destroy();
    };
  }, [queryClient]);

  // Global error handler
  React.useEffect(() => {
    const handleError = (error: Error, query?: any) => {
      console.error('Query error:', error, query);
      
      // Add notification for user-facing errors
      const addNotification = useMutualAidStore.getState().addNotification;
      
      // Only show user notifications for certain error types
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        addNotification({
          type: 'error',
          title: '网络连接错误',
          message: '请检查网络连接后重试'
        });
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        addNotification({
          type: 'warning',
          title: '需要重新连接钱包',
          message: '请重新连接您的钱包'
        });
      } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
        addNotification({
          type: 'error',
          title: '权限不足',
          message: '您没有执行此操作的权限'
        });
      } else if (error.message.includes('500')) {
        addNotification({
          type: 'error',
          title: '服务器错误',
          message: '系统暂时不可用，请稍后重试'
        });
      }
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

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
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
  const queryClient = React.useContext(QueryClientProvider as any);
  
  if (!queryClient) {
    throw new Error('useQueryClient must be used within QueryProvider');
  }
  
  return queryClient;
}

// Prefetch helper hook
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchUserData = React.useCallback(async (walletAddress: string) => {
    const queries = [
      { queryKey: ['user', 'profile'], fn: () => import('@/lib/api/client').then(m => m.api.getUserStats()) },
      { queryKey: ['user', 'stats'], fn: () => import('@/lib/api/client').then(m => m.api.getUserStats()) },
      { queryKey: ['nfts', 'collection'], fn: () => import('@/lib/api/client').then(m => m.api.getNFTCollection()) },
    ];

    await Promise.all(
      queries.map(({ queryKey, fn }) =>
        queryClient.prefetchQuery({
          queryKey,
          queryFn: fn,
          staleTime: 5 * 60 * 1000
        })
      )
    );
  }, [queryClient]);

  const prefetchSystemData = React.useCallback(async () => {
    const queries = [
      { queryKey: ['stats', 'system'], fn: () => import('@/lib/api/client').then(m => m.api.getSystemStats()) },
      { queryKey: ['leaderboard', 'reputation'], fn: () => import('@/lib/api/client').then(m => m.api.getLeaderboard('reputation', 1, 10)) },
    ];

    await Promise.all(
      queries.map(({ queryKey, fn }) =>
        queryClient.prefetchQuery({
          queryKey,
          queryFn: fn,
          staleTime: 2 * 60 * 1000
        })
      )
    );
  }, [queryClient]);

  return {
    prefetchUserData,
    prefetchSystemData
  };
}