"use client";

import { useState, useEffect, useCallback } from "react";
import { cache, CACHE_DURATION, getCacheKey } from "@/lib/cache";

interface DashboardStats {
  points: number;
  streak: number;
  rank: number;
  tasksCompleted: number;
}

interface DashboardData {
  stats: DashboardStats;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching dashboard data with caching
 * Implements client-side caching to reduce API calls
 */
export function useDashboardData(userId: string | null): DashboardData {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey.stats(userId);
    const cachedData = cache.get<DashboardStats>(cacheKey);

    if (cachedData) {
      setStats(cachedData);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard/data?userId=${userId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const data = await response.json();

      // Cache the result
      cache.set(cacheKey, data.stats, CACHE_DURATION.STATS);

      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    // Clear cache and refetch
    if (userId) {
      cache.clear(getCacheKey.stats(userId));
    }
    await fetchData();
  }, [userId, fetchData]);

  return {
    stats: stats || { points: 0, streak: 0, rank: 0, tasksCompleted: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * Prefetch dashboard data for faster subsequent loads
 */
export async function prefetchDashboardData(userId: string): Promise<void> {
  const cacheKey = getCacheKey.stats(userId);

  // Skip if already cached
  if (cache.has(cacheKey)) {
    return;
  }

  try {
    const response = await fetch(`/api/dashboard/data?userId=${userId}`);

    if (response.ok) {
      const data = await response.json();
      cache.set(cacheKey, data.stats, CACHE_DURATION.STATS);
    }
  } catch (error) {
    console.error("Failed to prefetch dashboard data:", error);
  }
}
