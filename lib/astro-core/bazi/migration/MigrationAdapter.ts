/**
 * Migration Adapter
 * 
 * Provides seamless switching between old and new implementations
 * based on feature flags
 */

import { useNewArchitecture } from '../config/feature-flags';
import { getOrchestrator } from '../services/ServiceFactory';
import { BasicChartCalculator } from '../chart/BasicChartCalculator';
import { ChartCalculationInput, BasicChartResult } from '../chart/types';

/**
 * Adapter for migrating calculation functions
 */
export class MigrationAdapter {
  private static instance: MigrationAdapter;
  private oldCalculator: BasicChartCalculator;
  private useCount = { old: 0, new: 0 };

  private constructor() {
    this.oldCalculator = new BasicChartCalculator();
  }

  static getInstance(): MigrationAdapter {
    if (!MigrationAdapter.instance) {
      MigrationAdapter.instance = new MigrationAdapter();
    }
    return MigrationAdapter.instance;
  }

  /**
   * Calculate with automatic architecture selection
   */
  async calculateBasicChart(
    input: ChartCalculationInput,
    userId?: string
  ): Promise<BasicChartResult> {
    // Check if new architecture should be used
    if (useNewArchitecture(userId)) {
      return this.calculateWithNewArchitecture(input);
    } else {
      return this.calculateWithOldArchitecture(input);
    }
  }

  /**
   * Calculate using new service architecture
   */
  private async calculateWithNewArchitecture(
    input: ChartCalculationInput
  ): Promise<BasicChartResult> {
    this.useCount.new++;
    
    try {
      const orchestrator = getOrchestrator();
      
      // Convert input format
      const serviceInput = {
        year: input.year,
        month: input.month,
        day: input.day,
        hour: input.hour,
        minute: input.minute,
        gender: input.gender,
        isLunar: input.isLunar || false,
        options: {
          includeCapabilityAssessment: input.options?.includeCapabilityAssessment,
          includeShenSha: input.options?.includeShenSha,
          majorPeriodCount: input.options?.majorPeriodCount
        }
      };

      // Calculate using orchestrator
      const result = await orchestrator.calculate(serviceInput);

      // Convert result format back to BasicChartResult
      const chartResult: Partial<BasicChartResult> = {
        input,
        fourPillars: result.fourPillars,
        tenGodAnalysis: result.tenGods,
        majorPeriods: result.majorPeriods,
        naYin: result.naYin,
        capabilityAssessment: result.capabilityAssessment,
        shenSha: result.shenSha,
        solarDate: {
          year: input.year,
          month: input.month,
          day: input.day,
          hour: input.hour,
          minute: input.minute || 0
        },
        lunarDate: {
          year: input.year,
          month: input.month,
          day: input.day,
          isLeapMonth: false,
          yearName: '',
          monthName: '',
          dayName: ''
        },
        calculationTime: result.calculationTime,
        algorithm: 'new-service-architecture',
        options: {},
        performanceMetrics: {
          calculationTime: result.calculationTime,
          cacheHit: result.cacheHit
        },
        metadata: {
          architecture: 'new',
          version: '2.0.0'
        }
      };
      
      return chartResult as BasicChartResult;

    } catch (error) {
      // Fallback to old architecture on error
      console.error('New architecture failed, falling back:', error);
      return this.calculateWithOldArchitecture(input);
    }
  }

  /**
   * Calculate using old architecture
   */
  private async calculateWithOldArchitecture(
    input: ChartCalculationInput
  ): Promise<BasicChartResult> {
    this.useCount.old++;
    
    const result = await this.oldCalculator.calculateBasicChart(input);
    
    // Add metadata to track which architecture was used
    return {
      ...result,
      metadata: {
        ...result.metadata,
        architecture: 'old',
        version: '1.0.0'
      }
    };
  }

  /**
   * Force use of new architecture (for testing)
   */
  async forceNewArchitecture(
    input: ChartCalculationInput
  ): Promise<BasicChartResult> {
    return this.calculateWithNewArchitecture(input);
  }

  /**
   * Force use of old architecture (for testing)
   */
  async forceOldArchitecture(
    input: ChartCalculationInput
  ): Promise<BasicChartResult> {
    return this.calculateWithOldArchitecture(input);
  }

  /**
   * Get usage statistics
   */
  getUsageStats() {
    const total = this.useCount.old + this.useCount.new;
    return {
      old: this.useCount.old,
      new: this.useCount.new,
      total,
      newArchitecturePercentage: total > 0 
        ? ((this.useCount.new / total) * 100).toFixed(2)
        : '0.00'
    };
  }

  /**
   * Reset usage statistics
   */
  resetStats(): void {
    this.useCount = { old: 0, new: 0 };
  }
}

/**
 * Migrated calculation functions
 * These replace the old functions in calculation.ts
 */

/**
 * Main calculation function - migrated version
 */
export async function generateCompleteBaziChartMigrated(
  input: ChartCalculationInput,
  userId?: string
): Promise<BasicChartResult> {
  const adapter = MigrationAdapter.getInstance();
  return adapter.calculateBasicChart(input, userId);
}

/**
 * Batch calculation - migrated version
 */
export async function calculateBatchMigrated(
  inputs: ChartCalculationInput[],
  userId?: string
): Promise<BasicChartResult[]> {
  if (useNewArchitecture(userId)) {
    // Use new architecture with parallel processing
    const orchestrator = getOrchestrator();
    const serviceInputs = inputs.map(input => ({
      year: input.year,
      month: input.month,
      day: input.day,
      hour: input.hour,
      minute: input.minute,
      gender: input.gender,
      isLunar: input.isLunar || false
    }));

    const results = await orchestrator.calculateBatch(serviceInputs);
    
    return results.map((result, index) => {
      const currentInput = inputs[index];
      const chartResult: Partial<BasicChartResult> = {
        input: currentInput,
        fourPillars: result.fourPillars,
        tenGodAnalysis: result.tenGods,
        majorPeriods: result.majorPeriods,
        naYin: result.naYin,
        solarDate: {
          year: currentInput.year,
          month: currentInput.month,
          day: currentInput.day,
          hour: currentInput.hour,
          minute: currentInput.minute || 0
        },
        lunarDate: {
          year: currentInput.year,
          month: currentInput.month,
          day: currentInput.day,
          isLeapMonth: false,
          yearName: '',
          monthName: '',
          dayName: ''
        },
        calculationTime: result.calculationTime,
        algorithm: 'new-service-architecture',
        options: {},
        performanceMetrics: {
          calculationTime: result.calculationTime,
          cacheHit: result.cacheHit
        },
        metadata: {
          architecture: 'new',
          version: '2.0.0'
        }
      };
      return chartResult as BasicChartResult;
    });
  } else {
    // Use old architecture
    const calculator = new BasicChartCalculator();
    const results: BasicChartResult[] = [];
    
    for (const input of inputs) {
      const result = await calculator.calculateBasicChart(input);
      results.push({
        ...result,
        metadata: {
          ...result.metadata,
          architecture: 'old',
          version: '1.0.0'
        }
      });
    }
    
    return results;
  }
}

/**
 * Export adapter instance for direct access
 */
export const migrationAdapter = MigrationAdapter.getInstance();