/**
 * useZiWeiChart Hook - Main hook for ZiWei chart calculations
 * 紫微命盘钩子 - 用于紫微斗数命盘计算的主要钩子
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ZiWeiFacade } from '../facade/ziwei-facade';
import type {
  CompleteChart,
  BirthInfo,
  CalculationOptions,
  LunarDate,
} from '../types/core';

/**
 * Hook input parameters
 */
export interface UseZiWeiChartParams {
  birthInfo?: BirthInfo;
  options?: CalculationOptions;
  autoCalculate?: boolean;
  cacheKey?: string;
}

/**
 * Hook return value
 */
export interface UseZiWeiChartReturn {
  // Data
  chart: CompleteChart | null;
  lunarDate: LunarDate | null;
  
  // Status
  isLoading: boolean;
  isCalculating: boolean;
  error: Error | null;
  
  // Actions
  calculate: (birthInfo: BirthInfo) => Promise<void>;
  recalculate: () => Promise<void>;
  clearChart: () => void;
  clearCache: () => void;
  
  // Metadata
  calculationTime: number | null;
  cacheStatus: 'hit' | 'miss' | 'none';
}

// Singleton facade instance
let facadeInstance: ZiWeiFacade | null = null;

const getFacadeInstance = (): ZiWeiFacade => {
  if (!facadeInstance) {
    facadeInstance = new ZiWeiFacade();
  }
  return facadeInstance;
};

/**
 * Main hook for ZiWei chart calculations
 * 紫微命盘计算的主要钩子
 */
export function useZiWeiChart(params: UseZiWeiChartParams = {}): UseZiWeiChartReturn {
  const { birthInfo, options, autoCalculate = true, cacheKey } = params;
  
  // State
  const [chart, setChart] = useState<CompleteChart | null>(null);
  const [lunarDate, setLunarDate] = useState<LunarDate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [calculationTime, setCalculationTime] = useState<number | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'hit' | 'miss' | 'none'>('none');
  const [currentBirthInfo, setCurrentBirthInfo] = useState<BirthInfo | undefined>(birthInfo);
  
  // Get facade instance
  const facade = useMemo(() => getFacadeInstance(), []);
  
  /**
   * Calculate chart from birth info
   */
  const calculate = useCallback(async (newBirthInfo: BirthInfo) => {
    setIsCalculating(true);
    setError(null);
    setCacheStatus('none');
    
    try {
      const startTime = performance.now();
      
      // Check cache first if cache key provided
      if (cacheKey) {
        const cached = facade.getCachedResult(cacheKey);
        if (cached) {
          setChart(cached);
          setLunarDate(cached.lunarDate);
          setCacheStatus('hit');
          setCalculationTime(0);
          setCurrentBirthInfo(newBirthInfo);
          return;
        }
      }
      
      // Calculate new chart
      const result = await facade.calculateCompleteChart(newBirthInfo, options);
      
      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);
      
      setChart(result);
      setLunarDate(result.lunarDate);
      setCalculationTime(timeTaken);
      setCacheStatus('miss');
      setCurrentBirthInfo(newBirthInfo);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Calculation failed'));
      setChart(null);
      setLunarDate(null);
    } finally {
      setIsCalculating(false);
    }
  }, [facade, options, cacheKey]);
  
  /**
   * Recalculate with current birth info
   */
  const recalculate = useCallback(async () => {
    if (!currentBirthInfo) {
      setError(new Error('No birth info available for recalculation'));
      return;
    }
    
    // Clear cache to force recalculation
    if (cacheKey) {
      facade.clearCache();
    }
    
    await calculate(currentBirthInfo);
  }, [currentBirthInfo, calculate, facade, cacheKey]);
  
  /**
   * Clear chart data
   */
  const clearChart = useCallback(() => {
    setChart(null);
    setLunarDate(null);
    setError(null);
    setCalculationTime(null);
    setCacheStatus('none');
    setCurrentBirthInfo(undefined);
  }, []);
  
  /**
   * Clear facade cache
   */
  const clearCache = useCallback(() => {
    facade.clearCache();
    setCacheStatus('none');
  }, [facade]);
  
  // Auto-calculate on mount if birth info provided
  useEffect(() => {
    if (autoCalculate && birthInfo && !chart && !isCalculating) {
      setIsLoading(true);
      void calculate(birthInfo).finally(() => setIsLoading(false));
    }
  }, [autoCalculate, birthInfo, chart, isCalculating, calculate]);
  
  // Update birth info when prop changes
  useEffect(() => {
    if (birthInfo && JSON.stringify(birthInfo) !== JSON.stringify(currentBirthInfo)) {
      if (autoCalculate) {
        void calculate(birthInfo);
      } else {
        setCurrentBirthInfo(birthInfo);
      }
    }
  }, [birthInfo, currentBirthInfo, autoCalculate, calculate]);
  
  return {
    // Data
    chart,
    lunarDate,
    
    // Status
    isLoading,
    isCalculating,
    error,
    
    // Actions
    calculate,
    recalculate,
    clearChart,
    clearCache,
    
    // Metadata
    calculationTime,
    cacheStatus,
  };
}

/**
 * Hook for accessing specific palace data
 */
export function useZiWeiPalace(
  chart: CompleteChart | null,
  palaceName: string
) {
  return useMemo(() => {
    if (!chart) return null;
    return chart.palaces.get(palaceName as any) || null;
  }, [chart, palaceName]);
}

/**
 * Hook for accessing life palace
 */
export function useLifePalace(chart: CompleteChart | null) {
  return useZiWeiPalace(chart, '命宫');
}

/**
 * Hook for accessing body palace
 */
export function useBodyPalace(chart: CompleteChart | null) {
  return useMemo(() => {
    if (!chart) return null;
    
    // Find body palace by index
    const bodyPalaceEntry = Array.from(chart.palaces.entries()).find(
      ([_, palace]) => palace.position.index === chart.bodyPalaceIndex
    );
    
    return bodyPalaceEntry ? bodyPalaceEntry[1] : null;
  }, [chart]);
}
