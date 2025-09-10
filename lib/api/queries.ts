'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api, APIError } from './client';
import { useMutualAidStore } from '@/lib/stores/mutualAidStore';

// Query Keys Factory
export const queryKeys = {
  all: ['mutual-aid'] as const,
  
  // User related
  user: () => [...queryKeys.all, 'user'] as const,
  userProfile: () => [...queryKeys.user(), 'profile'] as const,
  userStats: () => [...queryKeys.user(), 'stats'] as const,
  userRank: () => [...queryKeys.user(), 'rank'] as const,
  
  // Mutual Aid Requests
  requests: () => [...queryKeys.all, 'requests'] as const,
  requestsList: (filters?: Record<string, any>) => 
    [...queryKeys.requests(), 'list', filters] as const,
  requestsInfinite: (filters?: Record<string, any>) => 
    [...queryKeys.requests(), 'infinite', filters] as const,
  myRequests: () => [...queryKeys.requests(), 'my'] as const,
  requestDetail: (id: string) => [...queryKeys.requests(), 'detail', id] as const,
  
  // Validations
  validations: () => [...queryKeys.all, 'validations'] as const,
  validationsPending: (filters?: Record<string, any>) => 
    [...queryKeys.validations(), 'pending', filters] as const,
  validationHistory: () => [...queryKeys.validations(), 'history'] as const,
  
  // NFT Collection
  nfts: () => [...queryKeys.all, 'nfts'] as const,
  nftCollection: () => [...queryKeys.nfts(), 'collection'] as const,
  nftDetail: (tokenId: string) => [...queryKeys.nfts(), 'detail', tokenId] as const,
  
  // Leaderboard
  leaderboard: () => [...queryKeys.all, 'leaderboard'] as const,
  leaderboardByType: (type: string, filters?: Record<string, any>) => 
    [...queryKeys.leaderboard(), type, filters] as const,
  
  // System Stats
  stats: () => [...queryKeys.all, 'stats'] as const,
  systemStats: () => [...queryKeys.stats(), 'system'] as const,
  
  // Notifications
  notifications: () => [...queryKeys.all, 'notifications'] as const,
  notificationsList: (filters?: Record<string, any>) => 
    [...queryKeys.notifications(), 'list', filters] as const,
} as const;

// Default Query Options
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Common Query Options
const commonQueryOptions = {
  staleTime: DEFAULT_STALE_TIME,
  gcTime: DEFAULT_CACHE_TIME,
  retry: (failureCount: number, error: any) => {
    // Don't retry on 4xx errors (except timeout and rate limit)
    if (error instanceof APIError && error.status) {
      const status = error.status;
      if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
        return false;
      }
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// ============================================================================
// USER QUERIES
// ============================================================================

export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.userProfile(),
    queryFn: async () => {
      const response = await api.getUserStats();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.userStats(),
    queryFn: async () => {
      const response = await api.getUserStats();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

export function useMyRank() {
  return useQuery({
    queryKey: queryKeys.userRank(),
    queryFn: async () => {
      const response = await api.getMyRank();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

// ============================================================================
// MUTUAL AID REQUEST QUERIES
// ============================================================================

export function useAidRequests(page = 1, limit = 10, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.requestsList({ page, limit, ...filters }),
    queryFn: async () => {
      const response = await api.getAidRequests(page, limit);
      return response;
    },
    ...commonQueryOptions,
    keepPreviousData: true,
  });
}

export function useInfiniteAidRequests(limit = 10, filters?: Record<string, any>) {
  return useInfiniteQuery({
    queryKey: queryKeys.requestsInfinite({ limit, ...filters }),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.getAidRequests(pageParam, limit);
      return response;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNext) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
    ...commonQueryOptions,
  });
}

export function useMyRequests() {
  return useQuery({
    queryKey: queryKeys.myRequests(),
    queryFn: async () => {
      const response = await api.getMyRequests();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

// ============================================================================
// VALIDATION QUERIES
// ============================================================================

export function usePendingValidations(page = 1, limit = 10, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.validationsPending({ page, limit, ...filters }),
    queryFn: async () => {
      const response = await api.getPendingValidations(page, limit);
      return response;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for pending validations
  });
}

export function useValidationHistory() {
  return useQuery({
    queryKey: queryKeys.validationHistory(),
    queryFn: async () => {
      const response = await api.getValidationHistory();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

// ============================================================================
// NFT COLLECTION QUERIES
// ============================================================================

export function useNFTCollection() {
  return useQuery({
    queryKey: queryKeys.nftCollection(),
    queryFn: async () => {
      const response = await api.getNFTCollection();
      return response.data;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
  });
}

// ============================================================================
// LEADERBOARD QUERIES
// ============================================================================

export function useLeaderboard(
  type = 'reputation', 
  page = 1, 
  limit = 10, 
  filters?: Record<string, any>
) {
  return useQuery({
    queryKey: queryKeys.leaderboardByType(type, { page, limit, ...filters }),
    queryFn: async () => {
      const response = await api.getLeaderboard(type, page, limit);
      return response;
    },
    ...commonQueryOptions,
    staleTime: 2 * 60 * 1000, // 2 minutes for leaderboard
    keepPreviousData: true,
  });
}

// ============================================================================
// SYSTEM STATS QUERIES
// ============================================================================

export function useSystemStats() {
  return useQuery({
    queryKey: queryKeys.systemStats(),
    queryFn: async () => {
      const response = await api.getSystemStats();
      return response.data;
    },
    ...commonQueryOptions,
    staleTime: 1 * 60 * 1000, // 1 minute for system stats
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// ============================================================================
// NOTIFICATION QUERIES
// ============================================================================

export function useNotifications(page = 1, limit = 20, filters?: Record<string, any>) {
  return useQuery({
    queryKey: queryKeys.notificationsList({ page, limit, ...filters }),
    queryFn: async () => {
      const response = await api.getNotifications(page, limit);
      return response;
    },
    ...commonQueryOptions,
    enabled: !!useMutualAidStore.getState().web3.isConnected,
    refetchInterval: 60 * 1000, // Refetch every minute for notifications
  });
}

// ============================================================================
// MUTATIONS
// ============================================================================

export function useSubmitAidRequest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      amount: string;
      reason: string;
      severityLevel: number;
      analysisId: string;
    }) => {
      const response = await api.submitAidRequest(data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.myRequests() });
    },
  });
}

export function useSubmitValidation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      data 
    }: {
      requestId: string;
      data: {
        vote: 'approve' | 'reject';
        confidence: number;
        reason: string;
      };
    }) => {
      const response = await api.submitValidation(requestId, data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate validation queries
      queryClient.invalidateQueries({ queryKey: queryKeys.validations() });
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats() });
    },
  });
}

export function useAdversityAnalysis() {
  return useMutation({
    mutationFn: async (data: {
      slipNumber: number;
      userInfo: any;
      situation: string;
    }) => {
      const response = await api.analyzeAdversity(data);
      return response.data;
    },
  });
}

export function useMintNFT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestId: string) => {
      const response = await api.mintNFT(requestId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate NFT collection
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.userStats() });
    },
  });
}

export function useTransferNFT() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ tokenId, toAddress }: { tokenId: string; toAddress: string }) => {
      const response = await api.transferNFT(tokenId, toAddress);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate NFT collection
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts() });
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await api.markNotificationRead(notificationId);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}

// ============================================================================
// OPTIMISTIC UPDATE MUTATIONS
// ============================================================================

export function useOptimisticValidation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      requestId, 
      data 
    }: {
      requestId: string;
      data: {
        vote: 'approve' | 'reject';
        confidence: number;
        reason: string;
      };
    }) => {
      const response = await api.submitValidation(requestId, data);
      return response.data;
    },
    onMutate: async ({ requestId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.validationsPending() });
      
      // Snapshot the previous value
      const previousValidations = queryClient.getQueryData(queryKeys.validationsPending());
      
      // Optimistically update - remove the request from pending validations
      queryClient.setQueryData(queryKeys.validationsPending(), (old: any) => {
        if (!old || !old.data) return old;
        
        return {
          ...old,
          data: old.data.filter((request: any) => request.id !== requestId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1
          }
        };
      });
      
      return { previousValidations };
    },
    onError: (err, variables, context) => {
      // Revert optimistic update
      if (context?.previousValidations) {
        queryClient.setQueryData(queryKeys.validationsPending(), context.previousValidations);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.validations() });
    },
  });
}

// ============================================================================
// REAL-TIME SUBSCRIPTION HOOKS
// ============================================================================

export function useRealTimeUpdates() {
  const queryClient = useQueryClient();
  
  React.useEffect(() => {
    const cleanup = api.subscribeToUpdates(
      ['requests', 'validations', 'nfts', 'notifications'],
      (update) => {
        // Handle different update types
        switch (update.type) {
          case 'new_request':
            queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
            break;
          case 'request_status_changed':
            queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
            queryClient.invalidateQueries({ queryKey: queryKeys.myRequests() });
            break;
          case 'new_validation':
            queryClient.invalidateQueries({ queryKey: queryKeys.validations() });
            break;
          case 'nft_minted':
            queryClient.invalidateQueries({ queryKey: queryKeys.nfts() });
            break;
          case 'notification':
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
            // Also add to local store
            useMutualAidStore.getState().addNotification(update.data);
            break;
        }
      },
      (error) => {
        console.error('Real-time connection error:', error);
      }
    );
    
    return cleanup;
  }, [queryClient]);
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateUserData: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user() });
    },
    invalidateRequests: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.requests() });
    },
    invalidateValidations: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.validations() });
    },
    invalidateNFTs: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.nfts() });
    },
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    }
  };
}