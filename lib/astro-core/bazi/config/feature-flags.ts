/**
 * Feature Flags Configuration
 * 
 * Controls gradual rollout of new service architecture
 * Allows runtime switching between old and new implementations
 */

export interface FeatureFlags {
  useNewServiceArchitecture: boolean;
  enableCaching: boolean;
  enableParallelProcessing: boolean;
  enableWorkerThreads: boolean;
  enablePerformanceMonitoring: boolean;
  enableAdvancedValidation: boolean;
  cacheTimeout: number;
  maxCacheSize: number;
  maxWorkers: number;
  rolloutPercentage: number;
}

/**
 * Default feature flag values
 */
const DEFAULT_FLAGS: FeatureFlags = {
  useNewServiceArchitecture: false,
  enableCaching: false,
  enableParallelProcessing: false,
  enableWorkerThreads: false,
  enablePerformanceMonitoring: true,
  enableAdvancedValidation: true,
  cacheTimeout: 3600000, // 1 hour
  maxCacheSize: 100,
  maxWorkers: 4,
  rolloutPercentage: 0 // 0% rollout initially
};

/**
 * Feature flag manager
 */
class FeatureFlagManager {
  private flags: FeatureFlags;
  private overrides: Partial<FeatureFlags> = {};

  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this.loadFromEnvironment();
  }

  /**
   * Load flags from environment variables
   */
  private loadFromEnvironment(): void {
    if (typeof process !== 'undefined' && process.env) {
      // Service architecture flag
      if (process.env.BAZI_USE_NEW_ARCHITECTURE === 'true') {
        this.flags.useNewServiceArchitecture = true;
      }

      // Caching flag
      if (process.env.BAZI_ENABLE_CACHE === 'true') {
        this.flags.enableCaching = true;
      }

      // Parallel processing flag
      if (process.env.BAZI_ENABLE_PARALLEL === 'true') {
        this.flags.enableParallelProcessing = true;
      }

      // Worker threads flag
      if (process.env.BAZI_ENABLE_WORKERS === 'true') {
        this.flags.enableWorkerThreads = true;
      }

      // Rollout percentage
      if (process.env.BAZI_ROLLOUT_PERCENTAGE) {
        const percentage = parseInt(process.env.BAZI_ROLLOUT_PERCENTAGE, 10);
        if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
          this.flags.rolloutPercentage = percentage;
        }
      }

      // Cache settings
      if (process.env.BAZI_CACHE_TIMEOUT) {
        const timeout = parseInt(process.env.BAZI_CACHE_TIMEOUT, 10);
        if (!isNaN(timeout) && timeout > 0) {
          this.flags.cacheTimeout = timeout;
        }
      }

      if (process.env.BAZI_MAX_CACHE_SIZE) {
        const size = parseInt(process.env.BAZI_MAX_CACHE_SIZE, 10);
        if (!isNaN(size) && size > 0) {
          this.flags.maxCacheSize = size;
        }
      }
    }
  }

  /**
   * Get current feature flags
   */
  getFlags(): FeatureFlags {
    return { ...this.flags, ...this.overrides };
  }

  /**
   * Check if a specific feature is enabled
   */
  isEnabled(feature: keyof FeatureFlags): boolean {
    const flags = this.getFlags();
    const value = flags[feature];
    return typeof value === 'boolean' ? value : false;
  }

  /**
   * Set feature flag override (for testing)
   */
  setOverride(feature: keyof FeatureFlags, value: any): void {
    this.overrides[feature] = value;
  }

  /**
   * Clear all overrides
   */
  clearOverrides(): void {
    this.overrides = {};
  }

  /**
   * Check if user should get new architecture based on rollout
   */
  shouldUseNewArchitecture(userId?: string): boolean {
    const flags = this.getFlags();
    
    // If explicitly enabled, always use new architecture
    if (flags.useNewServiceArchitecture) {
      return true;
    }

    // If rollout percentage is 0, don't use new architecture
    if (flags.rolloutPercentage === 0) {
      return false;
    }

    // If rollout percentage is 100, always use new architecture
    if (flags.rolloutPercentage === 100) {
      return true;
    }

    // Use consistent hashing for gradual rollout
    if (userId) {
      const hash = this.hashUserId(userId);
      const threshold = flags.rolloutPercentage / 100;
      return hash < threshold;
    }

    // Random rollout if no userId provided
    return Math.random() * 100 < flags.rolloutPercentage;
  }

  /**
   * Simple hash function for consistent user assignment
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Return value between 0 and 1
    return Math.abs(hash) / 2147483647;
  }

  /**
   * Get configuration for new service architecture
   */
  getServiceConfig() {
    const flags = this.getFlags();
    return {
      cache: {
        enabled: flags.enableCaching,
        maxSize: flags.maxCacheSize,
        timeout: flags.cacheTimeout
      },
      parallel: {
        enabled: flags.enableParallelProcessing,
        useWorkers: flags.enableWorkerThreads,
        maxWorkers: flags.maxWorkers
      },
      monitoring: {
        enabled: flags.enablePerformanceMonitoring
      },
      validation: {
        advanced: flags.enableAdvancedValidation
      }
    };
  }

  /**
   * Export current configuration (for debugging)
   */
  exportConfig(): string {
    return JSON.stringify(this.getFlags(), null, 2);
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();

/**
 * Helper function to check if new architecture should be used
 */
export function useNewArchitecture(userId?: string): boolean {
  return featureFlags.shouldUseNewArchitecture(userId);
}

/**
 * Helper function to get service configuration
 */
export function getServiceConfig() {
  return featureFlags.getServiceConfig();
}

/**
 * Development helpers
 */
export const DevFlags = {
  /**
   * Enable all new features (for development)
   */
  enableAll(): void {
    featureFlags.setOverride('useNewServiceArchitecture', true);
    featureFlags.setOverride('enableCaching', true);
    featureFlags.setOverride('enableParallelProcessing', true);
    featureFlags.setOverride('enableWorkerThreads', false); // Keep workers disabled by default
    featureFlags.setOverride('enablePerformanceMonitoring', true);
    featureFlags.setOverride('rolloutPercentage', 100);
  },

  /**
   * Disable all new features (for testing legacy)
   */
  disableAll(): void {
    featureFlags.setOverride('useNewServiceArchitecture', false);
    featureFlags.setOverride('enableCaching', false);
    featureFlags.setOverride('enableParallelProcessing', false);
    featureFlags.setOverride('enableWorkerThreads', false);
    featureFlags.setOverride('enablePerformanceMonitoring', false);
    featureFlags.setOverride('rolloutPercentage', 0);
  },

  /**
   * Reset to defaults
   */
  reset(): void {
    featureFlags.clearOverrides();
  }
};