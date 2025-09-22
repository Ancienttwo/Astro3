/**
 * @astroall/ziwei-core - ZiWei Dou Shu Core Algorithm Library
 * 紫微斗数核心算法库
 * 
 * Migration Version 2.0 - Clean Architecture
 */

// ============= Type Exports =============
export * from './types/core';
export * from './types/algorithms';

// Import types for local use
import type { CompleteChart, BirthInfo, CalculationOptions } from './types/core';

// ============= Constants Exports =============
export * from './constants/ziwei-constants';

// ============= Calculator Exports (to be implemented) =============
// These will be uncommented as we implement them
// export { StarCalculator } from './calculations/star-calculator';
// export { SihuaCalculator } from './sihua/sihua-calculator';
// export { PalaceCalculator } from './palaces/palace-calculator';
// export { SelfTransformationCalculator } from './sihua/self-transformation-calculator';

// ============= Facade Export (to be implemented) =============
// export { ZiWeiAlgorithmFacade } from './facade/ZiWeiAlgorithmFacade';
// export { AlgorithmRegistry } from './facade/AlgorithmRegistry';

// ============= Store Hook Export (to be implemented) =============
// export { useZiWeiStore } from './hooks/useZiWeiStore';
// export { useZiWeiCompleteChart } from './hooks/useZiWeiCompleteChart';

// ============= Formatter Export (to be implemented) =============
// export { DisplayFormatter } from './formatters/display-formatter';
// export { WebFormatter } from './formatters/web-formatter';
// export { NativeFormatter } from './formatters/native-formatter';

// ============= Cache Manager Export (to be implemented) =============
// export { CacheManager } from './cache/cache-manager';
// export { LRUCache } from './cache/lru-cache';

// ============= Utility Exports =============
export * from './lunar-utils';

// ============= Version Information =============
export const VERSION = '2.0.0';
export const ALGORITHM_VERSION = 'v2-unified';
export const MIGRATION_DATE = '2025-01-07';

/**
 * Main entry point for ZiWei calculations
 * This will be the primary API after migration
 */
export async function calculateZiWeiChart(
  birthInfo: BirthInfo,
  options?: Partial<CalculationOptions>
): Promise<CompleteChart> {
  // This will be implemented when facade is ready
  throw new Error(
    'ZiWei chart calculation not yet implemented. ' +
    'Please wait for facade implementation in Task 4.'
  );
}

/**
 * Get AlgorithmRegistry singleton
 * This will be the standard way to access algorithms
 */
export interface AlgorithmRegistry {
  version: string;
  algorithms: Record<string, unknown>;
  status: 'loading' | 'ready' | 'error';
  metadata?: Record<string, unknown>;
}

export function getAlgorithmRegistry(): AlgorithmRegistry {
  // This will be implemented in Task 5
  throw new Error(
    'AlgorithmRegistry not yet implemented. ' +
    'Please wait for Task 5 implementation.'
  );
}

/**
 * Initialize the library
 * This will set up all necessary components
 */
export interface InitializationConfig {
  enableLogging?: boolean;
  cacheSize?: number;
  version?: string;
  algorithms?: string[];
  environment?: 'development' | 'production' | 'test';
}

export function initialize(config?: InitializationConfig): void {
  // This will be implemented after core components are ready
  console.log('ZiWei Core Library v2.0.0 - Migration in progress');
  console.log('Migration started: 2025-01-07');
  console.log('Expected completion: 2025-01-17');
  if (config?.enableLogging) {
    console.log('Configuration:', config);
  }
}