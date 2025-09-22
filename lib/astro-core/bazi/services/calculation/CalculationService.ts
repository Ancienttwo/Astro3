/**
 * Calculation Service
 * 
 * Core calculation service that delegates to specific calculators
 * Implements strategy pattern for different calculation modes
 */

import { BaziInput, BaziResult } from '../types';
import { ICalculationService, ICalculationStrategy } from './interfaces';
import { BasicChartCalculator } from '../../chart/BasicChartCalculator';
import { FourPillarsCalculator } from '../../chart/FourPillarsCalculator';
import { TenGodCalculator } from '../../chart/TenGodCalculator';
import { MajorPeriodCalculator } from '../../chart/MajorPeriodCalculator';
import { NaYinCalculator } from '../../chart/NaYinCalculator';

/**
 * Standard calculation strategy
 */
class StandardCalculationStrategy implements ICalculationStrategy {
  private basicCalculator: BasicChartCalculator;

  constructor() {
    this.basicCalculator = new BasicChartCalculator();
  }

  async execute(input: BaziInput): Promise<BaziResult> {
    const result = await this.basicCalculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: true,
      includeNaYin: true,
      validateInput: true,
      majorPeriodCount: input.options?.majorPeriodCount || 8
    });

    return {
      fourPillars: result.fourPillars,
      tenGods: result.tenGodAnalysis,
      majorPeriods: result.majorPeriods,
      naYin: result.naYin,
      calculationTime: result.performanceMetrics?.calculationTime || 0,
      cacheHit: false
    };
  }

  getName(): string {
    return 'standard';
  }
}

/**
 * Quick calculation strategy (minimal features)
 */
class QuickCalculationStrategy implements ICalculationStrategy {
  private fourPillarsCalc: FourPillarsCalculator;
  private tenGodCalc: TenGodCalculator;

  constructor() {
    this.fourPillarsCalc = new FourPillarsCalculator();
    this.tenGodCalc = new TenGodCalculator();
  }

  async execute(input: BaziInput): Promise<BaziResult> {
    const startTime = performance.now();

    // Calculate only essential components
    const fourPillars = await this.fourPillarsCalc.calculateFourPillars(input);
    const tenGods = await this.tenGodCalc.calculateTenGods(fourPillars);

    const calculationTime = performance.now() - startTime;

    return {
      fourPillars,
      tenGods,
      calculationTime,
      cacheHit: false
    };
  }

  getName(): string {
    return 'quick';
  }
}

/**
 * Comprehensive calculation strategy (all features)
 */
class ComprehensiveCalculationStrategy implements ICalculationStrategy {
  private basicCalculator: BasicChartCalculator;

  constructor() {
    this.basicCalculator = new BasicChartCalculator();
  }

  async execute(input: BaziInput): Promise<BaziResult> {
    const result = await this.basicCalculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: true,
      includeNaYin: true,
      includeCapabilityAssessment: true,
      capabilityAnalysisLevel: 'comprehensive',
      validateInput: true,
      majorPeriodCount: input.options?.majorPeriodCount || 8
    });

    return {
      fourPillars: result.fourPillars,
      tenGods: result.tenGodAnalysis,
      majorPeriods: result.majorPeriods,
      naYin: result.naYin,
      capabilityAssessment: result.capabilityAssessment,
      shenSha: result.shenSha,
      calculationTime: result.performanceMetrics?.calculationTime || 0,
      cacheHit: false
    };
  }

  getName(): string {
    return 'comprehensive';
  }
}

/**
 * Main calculation service
 */
export class CalculationService implements ICalculationService {
  private strategies: Map<string, ICalculationStrategy>;
  private defaultStrategy: string = 'standard';

  constructor() {
    this.strategies = new Map();
    this.registerDefaultStrategies();
  }

  /**
   * Register default calculation strategies
   */
  private registerDefaultStrategies(): void {
    this.registerStrategy(new StandardCalculationStrategy());
    this.registerStrategy(new QuickCalculationStrategy());
    this.registerStrategy(new ComprehensiveCalculationStrategy());
  }

  /**
   * Register a calculation strategy
   */
  registerStrategy(strategy: ICalculationStrategy): void {
    this.strategies.set(strategy.getName(), strategy);
  }

  /**
   * Calculate using specified or default strategy
   */
  async calculate(input: BaziInput, strategyName?: string): Promise<BaziResult> {
    const strategy = this.getStrategy(strategyName || this.defaultStrategy);
    return strategy.execute(input);
  }

  /**
   * Calculate batch of inputs
   */
  async calculateBatch(inputs: BaziInput[]): Promise<BaziResult[]> {
    // Process in parallel for better performance
    const batchSize = 10;
    const results: BaziResult[] = [];

    for (let i = 0; i < inputs.length; i += batchSize) {
      const batch = inputs.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(input => this.calculate(input))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get strategy by name
   */
  private getStrategy(name: string): ICalculationStrategy {
    const strategy = this.strategies.get(name);
    if (!strategy) {
      throw new Error(`Calculation strategy '${name}' not found`);
    }
    return strategy;
  }

  /**
   * Set default strategy
   */
  setDefaultStrategy(name: string): void {
    if (!this.strategies.has(name)) {
      throw new Error(`Strategy '${name}' not registered`);
    }
    this.defaultStrategy = name;
  }

  /**
   * Get available strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}