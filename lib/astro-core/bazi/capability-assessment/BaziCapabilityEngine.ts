/**
 * @astroall/bazi-core Bazi Capability Engine
 * 
 * 八字六能力评估引擎 - 完整实现
 * 集成十神强度计算和六能力评分算法，提供统一的评估接口
 * 
 * @ai-context BAZI_CAPABILITY_ENGINE
 * @purpose 八字能力评估系统的主引擎
 * @version 1.0.0
 * @created 2025-09-06
 */

import type { 
  BaziInput,
  TenGodStrength,
  CapabilityScores,
  ClusterScores,
  AlgorithmConfig,
  CapabilityConfig,
  AlgorithmOutput,
  IBaziCapabilityEngine,
  PatternDetectionResult
} from './types';
import { CalculationError, ValidationError } from './types';
import { DEFAULT_ALGORITHM_CONFIG } from './types';

// 定义性能相关的类型
interface PerformanceMetrics {
  totalCalculations: number;
  cacheHits: number;
  cacheMisses: number;
  averageCalculationTime: number;
}

type PerformanceSummary = ReturnType<PerformanceManager['getPerformanceSummary']>;

interface BaziEngineOptions {
  enableCaching?: boolean;
  useGlobalPerformanceManager?: boolean;
  performanceManager?: PerformanceManager;
}

import type { ElementName } from '../types';

import { BaziValidator, AlgorithmOutputValidator } from './data-validators';
import { TenGodStrengthCalculator } from './TenGodStrengthCalculator';
import { CapabilityScorer, PatternDetector, DEFAULT_CAPABILITY_CONFIG } from './CapabilityScorer';
import { PerformanceManager, getGlobalPerformanceManager } from './PerformanceManager';

// ========================= 完整引擎实现 =========================

export class BaziCapabilityEngine implements IBaziCapabilityEngine {
  private strengthCalculator: TenGodStrengthCalculator;
  private capabilityScorer: CapabilityScorer;
  private algorithmConfig: AlgorithmConfig;
  private capabilityConfig: CapabilityConfig;
  private performanceManager: PerformanceManager;
  private enableCaching: boolean;
  
  constructor(
    algorithmConfig: AlgorithmConfig = DEFAULT_ALGORITHM_CONFIG,
    capabilityConfig: CapabilityConfig = DEFAULT_CAPABILITY_CONFIG,
    options: BaziEngineOptions = {}
  ) {
    this.algorithmConfig = { ...algorithmConfig };
    this.capabilityConfig = { ...capabilityConfig };
    this.strengthCalculator = new TenGodStrengthCalculator(this.algorithmConfig);
    this.capabilityScorer = new CapabilityScorer(this.capabilityConfig);
    
    // 性能管理配置
    this.enableCaching = options.enableCaching !== false; // 默认启用缓存
    
    if (options.performanceManager) {
      this.performanceManager = options.performanceManager;
    } else if (options.useGlobalPerformanceManager !== false) {
      this.performanceManager = getGlobalPerformanceManager();
    } else {
      this.performanceManager = new PerformanceManager();
    }
  }
  
  /**
   * 完整评估：一键计算十神强度和六能力评分
   */
  async evaluateComplete(input: BaziInput, config?: Partial<AlgorithmConfig>): Promise<AlgorithmOutput> {
    const startTime = this.performanceManager.startTiming();
    
    try {
      // 检查缓存
      if (this.enableCaching) {
        const cachedResult = this.performanceManager.getCachedCompleteResult(input, config);
        if (cachedResult) {
          this.performanceManager.recordCalculation(startTime, true); // 缓存命中
          return cachedResult;
        }
      }
      
      // 输入验证
      const validation = this.validateInput(input);
      if (!validation.valid) {
        throw new ValidationError(`输入数据验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 应用临时配置
      if (config) {
        this.strengthCalculator.updateConfig({ ...this.algorithmConfig, ...config });
      }
      
      // 计算十神强度
      const strengthResult = await this.strengthCalculator.calculateStrength(input);
      const strengths = strengthResult.strengths;
      const strengthTags = strengthResult.tags;
      
      // 计算聚合指标
      const clusters = this.calculateClusters(strengths);
      
      // 计算六能力评分
      const capabilityResult = await this.capabilityScorer.calculateScores(
        strengths, 
        strengthTags, 
        clusters
      );
      
      // 验证输出
      const outputValidation = this.capabilityScorer.validateScores(capabilityResult.scores);
      const allWarnings = [...strengthTags.warnings, ...outputValidation.warnings];
      
      // 构建完整输出
      const output: AlgorithmOutput = {
        ten_god_strength: strengths,
        clusters,
        tags: {
          ...strengthTags,
          warnings: allWarnings
        },
        capabilities: capabilityResult.scores,
        intermediates: {
          root_scores: strengthResult.intermediate.root_scores,
          seasonal_factors: strengthResult.intermediate.seasonal_factors,
          month_branch: input.pillars.month.branch,
          polarization: capabilityResult.details.polarization,
          phantom_stems: strengthResult.intermediate.phantom_stems
        },
        analysis_details: {
          pattern: capabilityResult.details.pattern,
          capability_breakdown: capabilityResult.details.calculation_details,
          recommendations: this.generateRecommendations(capabilityResult.details.pattern, capabilityResult.scores)
        }
      };
      
      // 输出验证
      const finalValidation = this.validateOutput(output);
      if (finalValidation.warnings.length > 0) {
        output.tags.warnings.push(...finalValidation.warnings);
      }
      
      // 缓存结果
      if (this.enableCaching) {
        this.performanceManager.cacheCompleteResult(input, output, config);
      }
      
      // 记录性能
      this.performanceManager.recordCalculation(startTime, false);
      
      return output;
      
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CalculationError) {
        throw error;
      }
      
      throw new CalculationError(
        `完整评估失败: ${error instanceof Error ? error.message : String(error)}`,
        { input, config, error }
      );
    }
  }
  
  /**
   * 单独计算十神强度
   */
  async calculateTenGodStrength(input: BaziInput, config?: Partial<AlgorithmConfig>): Promise<TenGodStrength> {
    if (config) {
      this.strengthCalculator.updateConfig({ ...this.algorithmConfig, ...config });
    }
    
    const result = await this.strengthCalculator.calculateStrength(input);
    return result.strengths;
  }
  
  /**
   * 单独计算能力评分
   */
  async calculateCapabilityScores(strength: TenGodStrength, input: BaziInput): Promise<CapabilityScores> {
    // 需要一些额外的计算来获取必要的tags和clusters
    const tempResult = await this.strengthCalculator.calculateStrength(input);
    const clusters = this.calculateClusters(strength);
    
    const capabilityResult = await this.capabilityScorer.calculateScores(
      strength,
      tempResult.tags,
      clusters
    );
    
    return capabilityResult.scores;
  }

  /**
   * 基础评估：快速计算能力评分，适用于性能测试和简单场景
   */
  async evaluateBasic(input: BaziInput): Promise<CapabilityScores> {
    const startTime = this.performanceManager.startTiming();
    
    try {
      // 输入验证
      const validation = this.validateInput(input);
      if (!validation.valid) {
        throw new ValidationError(`输入数据验证失败: ${validation.errors.join(', ')}`);
      }
      
      // 计算十神强度
      const strengthResult = await this.strengthCalculator.calculateStrength(input);
      const strengths = strengthResult.strengths;
      
      // 计算聚合指标
      const clusters = this.calculateClusters(strengths);
      
      // 计算六能力评分
      const capabilityResult = await this.capabilityScorer.calculateScores(
        strengths,
        strengthResult.tags,
        clusters
      );
      
      // 记录性能
      this.performanceManager.recordCalculation(startTime, false);
      
      return capabilityResult.scores;
      
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CalculationError) {
        throw error;
      }
      
      throw new CalculationError(
        `基础评估失败: ${error instanceof Error ? error.message : String(error)}`,
        { input, error }
      );
    }
  }
  
  /**
   * 分析根分值
   */
  async analyzeRootScores(input: BaziInput): Promise<{ [K in ElementName]: number }> {
    const result = await this.strengthCalculator.calculateStrength(input);
    return result.intermediate.root_scores;
  }
  
  /**
   * 检测虚透天干
   */
  async detectPhantomStems(input: BaziInput): Promise<string[]> {
    const result = await this.strengthCalculator.calculateStrength(input);
    return result.intermediate.phantom_stems;
  }
  
  /**
   * 计算极化指标
   */
  calculatePolarization(clusters: ClusterScores): { disparity: number; balance: number } {
    const clusterValues = Object.values(clusters);
    const sortedValues = clusterValues.slice().sort((a, b) => a - b);
    const medianValue = sortedValues[Math.floor(sortedValues.length / 2)];
    const maxValue = Math.max(...clusterValues);
    
    const disparity = maxValue - medianValue;
    const balance = 1 - Math.max(0, Math.min(1, disparity / 0.25));
    
    return { disparity, balance };
  }
  
  /**
   * 检测格局
   */
  detectPattern(strengths: TenGodStrength): PatternDetectionResult {
    return PatternDetector.detectPattern(strengths);
  }
  
  /**
   * 计算聚合指标
   */
  private calculateClusters(strengths: TenGodStrength): ClusterScores {
    return {
      食伤: strengths['食神'] + strengths['伤官'],
      官杀: strengths['正官'] + strengths['七杀'],
      比劫: strengths['比肩'] + strengths['劫财'],
      财: strengths['正财'] + strengths['偏财'],
      印: strengths['正印'] + strengths['偏印']
    };
  }
  
  /**
   * 生成个性化建议
   */
  private generateRecommendations(pattern: PatternDetectionResult, scores: CapabilityScores): string[] {
    const recommendations: string[] = [];
    
    // 基于格局的建议
    switch (pattern.pattern_type) {
      case '印旺格':
        recommendations.push('适合从事教育、研究、文化等稳定性行业');
        recommendations.push('注重知识积累和专业技能提升');
        break;
      case '正官格':
        recommendations.push('适合管理岗位和公职工作');
        recommendations.push('发挥组织协调和规范执行的优势');
        break;
      case '七杀格':
        recommendations.push('适合开拓性和竞争性强的工作');
        recommendations.push('注重执行力和决断力的发挥');
        break;
      case '财旺格':
        recommendations.push('适合商业经营和财务管理工作');
        recommendations.push('发挥理财和市场敏感度优势');
        break;
      case '食伤格':
        recommendations.push('适合创意、表达和技艺类工作');
        recommendations.push('注重创新思维和沟通表达能力');
        break;
      case '比劫格':
        recommendations.push('适合团队合作和伙伴经营模式');
        recommendations.push('发挥协作和稳定发展优势');
        break;
    }
    
    // 基于能力分数的建议
    const sortedCapabilities = Object.entries(scores)
      .sort(([, a], [, b]) => b - a);
    
    const topCapability = sortedCapabilities[0];
    const weakestCapability = sortedCapabilities[sortedCapabilities.length - 1];
    
    if (topCapability[1] >= 75) {
      recommendations.push(`${topCapability[0].replace('基础分', '')}是您的优势领域，建议重点发展`);
    }
    
    if (weakestCapability[1] <= 40) {
      recommendations.push(`${weakestCapability[0].replace('基础分', '')}相对较弱，可通过学习和练习提升`);
    }
    
    // 平衡性建议
    const maxScore = Math.max(...Object.values(scores));
    const minScore = Math.min(...Object.values(scores));
    
    if (maxScore - minScore > 50) {
      recommendations.push('能力分布不够均衡，建议在发挥优势的同时补强短板');
    } else if (maxScore - minScore < 20) {
      recommendations.push('能力发展较为均衡，适合综合性和管理类岗位');
    }
    
    return recommendations;
  }
  
  /**
   * 获取算法配置
   */
  getConfig(): AlgorithmConfig {
    return { ...this.algorithmConfig };
  }
  
  /**
   * 更新算法配置
   */
  updateConfig(config: Partial<AlgorithmConfig>): void {
    this.algorithmConfig = { ...this.algorithmConfig, ...config };
    this.strengthCalculator.updateConfig(this.algorithmConfig);
  }
  
  /**
   * 更新能力评分配置
   */
  updateCapabilityConfig(config: Partial<CapabilityConfig>): void {
    this.capabilityConfig = { ...this.capabilityConfig, ...config };
    this.capabilityScorer.updateConfig(this.capabilityConfig);
  }
  
  /**
   * 验证输入数据
   */
  validateInput(input: BaziInput): { valid: boolean; errors: string[] } {
    const validation = BaziValidator.validateInput(input);
    return {
      valid: validation.valid,
      errors: validation.errors
    };
  }
  
  /**
   * 验证输出结果
   */
  validateOutput(output: AlgorithmOutput): { valid: boolean; warnings: string[] } {
    return AlgorithmOutputValidator.validate(output);
  }
  
  /**
   * 批量评估
   */
  async evaluateBatch(inputs: BaziInput[]): Promise<AlgorithmOutput[]> {
    const results: AlgorithmOutput[] = [];
    
    for (const input of inputs) {
      try {
        const result = await this.evaluateComplete(input);
        results.push(result);
      } catch (error) {
        // 返回错误结果
        const errorOutput: AlgorithmOutput = this.createErrorOutput(error);
        results.push(errorOutput);
      }
    }
    
    return results;
  }
  
  /**
   * 创建错误输出
   */
  private createErrorOutput(error: unknown): AlgorithmOutput {
    return {
      ten_god_strength: {
        '比肩': 0, '劫财': 0, '食神': 0, '伤官': 0, '正财': 0,
        '偏财': 0, '正官': 0, '七杀': 0, '正印': 0, '偏印': 0
      },
      clusters: { 食伤: 0, 官杀: 0, 比劫: 0, 财: 0, 印: 0 },
      tags: {
        hurt_absorb_rate: 0,
        kill_mode: 'normal',
        cong_pattern: false,
        phantom_ratio: 0,
        dominance: 0,
        seasonal_method: 'precise_matrix',
        warnings: [`计算错误: ${error instanceof Error ? error.message : String(error)}`]
      },
      capabilities: {
        '执行力基础分': 0,
        '创新力基础分': 0, 
        '管理力基础分': 0,
        '销售力基础分': 0,
        '协调力基础分': 0,
        '稳定性基础分': 0
      },
      intermediates: {
        root_scores: { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 },
        seasonal_factors: { '木': 1, '火': 1, '土': 1, '金': 1, '水': 1 },
        month_branch: '子',
        polarization: { disparity: 0, balance: 1 },
        phantom_stems: []
      },
      analysis_details: {
        pattern: { 
          pattern_type: 'Error', 
          confidence: 0,
          description: '计算错误，无法生成格局分析',
          dominant_ten_god: '比肩',
          strength_ratio: 0
        },
        capability_breakdown: [],
        recommendations: ['发生错误，请重新计算']
      }
    };
  }
  
  /**
   * 性能测试
   */
  async performanceTest(input: BaziInput, iterations: number = 1000): Promise<{
    average_time_ms: number;
    min_time_ms: number;
    max_time_ms: number;
    total_time_ms: number;
    cache_performance: {
      hit_rate: number;
      memory_usage: string;
    };
  }> {
    const times: number[] = [];
    
    // 清除缓存以获得准确的测试结果
    const initialCacheState = this.enableCaching;
    this.enableCaching = false;
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      await this.evaluateComplete(input);
      const endTime = performance.now();
      times.push(endTime - startTime);
    }
    
    // 恢复缓存设置
    this.enableCaching = initialCacheState;
    
    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    // 获取缓存性能数据
    const performanceSummary = this.performanceManager.getPerformanceSummary();
    
    return {
      average_time_ms: averageTime,
      min_time_ms: minTime,
      max_time_ms: maxTime,
      total_time_ms: totalTime,
      cache_performance: {
        hit_rate: performanceSummary.cacheHitRate,
        memory_usage: performanceSummary.memoryUsage
      }
    };
  }
  
  /**
   * 获取性能指标
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceManager.getPerformanceMetrics();
  }
  
  /**
   * 获取性能摘要
   */
  getPerformanceSummary(): PerformanceSummary {
    return this.performanceManager.getPerformanceSummary();
  }
  
  /**
   * 清除缓存
   */
  clearCache(): void {
    this.performanceManager.clearAllCaches();
  }
  
  /**
   * 优化内存使用
   */
  optimizeMemory(): void {
    this.performanceManager.optimizeMemory();
  }
  
  /**
   * 启用/禁用缓存
   */
  setCachingEnabled(enabled: boolean): void {
    this.enableCaching = enabled;
  }
  
  /**
   * 检查缓存状态
   */
  isCachingEnabled(): boolean {
    return this.enableCaching;
  }
}

// ========================= 工厂函数 =========================

/**
 * 创建默认配置的引擎实例
 */
export function createBaziEngine(options?: {
  enableCaching?: boolean;
  useGlobalPerformanceManager?: boolean;
}): BaziCapabilityEngine {
  return new BaziCapabilityEngine(
    DEFAULT_ALGORITHM_CONFIG,
    DEFAULT_CAPABILITY_CONFIG,
    options
  );
}

/**
 * 创建自定义配置的引擎实例
 */
export function createCustomBaziEngine(
  algorithmConfig?: Partial<AlgorithmConfig>,
  capabilityConfig?: Partial<CapabilityConfig>,
  options?: {
    enableCaching?: boolean;
    useGlobalPerformanceManager?: boolean;
    performanceManager?: PerformanceManager;
  }
): BaziCapabilityEngine {
  const fullAlgoConfig = algorithmConfig ? 
    { ...DEFAULT_ALGORITHM_CONFIG, ...algorithmConfig } : 
    DEFAULT_ALGORITHM_CONFIG;
    
  const fullCapConfig = capabilityConfig ? 
    { ...DEFAULT_CAPABILITY_CONFIG, ...capabilityConfig } : 
    DEFAULT_CAPABILITY_CONFIG;
    
  return new BaziCapabilityEngine(fullAlgoConfig, fullCapConfig, options);
}

/**
 * 创建高性能引擎实例（启用所有优化）
 */
export function createHighPerformanceBaziEngine(
  algorithmConfig?: Partial<AlgorithmConfig>,
  capabilityConfig?: Partial<CapabilityConfig>
): BaziCapabilityEngine {
  return createCustomBaziEngine(
    algorithmConfig,
    capabilityConfig,
    {
      enableCaching: true,
      useGlobalPerformanceManager: true
    }
  );
}

// ========================= 重新导出相关模块 =========================
// 注意：BaziCapabilityEngine, createBaziEngine, createCustomBaziEngine 已通过上面的直接导出

// 重新导出核心类型 (从 types 模块)
export type { 
  BaziInput,
  AlgorithmOutput,
  CapabilityScores,
  TenGodStrength,
  AlgorithmConfig,
  CapabilityConfig
} from './types';

// 重新导出配置常量 (从 types 模块)
export { 
  DEFAULT_ALGORITHM_CONFIG
} from './types';

// 重新导出计算器组件 (从各自模块)
export { TenGodStrengthCalculator } from './TenGodStrengthCalculator';
export { CapabilityScorer, PatternDetector, DEFAULT_CAPABILITY_CONFIG } from './CapabilityScorer';
