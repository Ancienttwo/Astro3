/**
 * @astroall/bazi-core Capability Assessment Module
 * 
 * 八字能力评估模块 - 统一导出接口
 * 基于BossAI算法的完整十神强度和六能力评分系统
 * 
 * @ai-context CAPABILITY_ASSESSMENT_INDEX
 * @purpose 能力评估模块的统一导出接口
 * @version 1.0.0
 * @created 2025-09-06
 */

// ========================= 核心引擎导出 =========================

// 导入引擎和类型以供内部使用
import { 
  BaziCapabilityEngine,
  createBaziEngine,
  createCustomBaziEngine
} from './BaziCapabilityEngine';

import {
  BaziInput,
  AlgorithmOutput,
  TenGodStrength,
  CapabilityScores,
  PatternDetectionResult,
  AlgorithmConfig,
  CapabilityConfig
} from './types';

import { BaziValidator } from './data-validators';
import { PatternDetector } from './CapabilityScorer';

export {
  BaziCapabilityEngine,
  createBaziEngine,
  createCustomBaziEngine,
  createHighPerformanceBaziEngine
} from './BaziCapabilityEngine';

// ========================= 组件导出 =========================

export { TenGodStrengthCalculator } from './TenGodStrengthCalculator';
export { 
  CapabilityScorer, 
  PatternDetector, 
  DEFAULT_CAPABILITY_CONFIG,
  CAPABILITY_WEIGHTS_V2 
} from './CapabilityScorer';

// ========================= 验证器导出 =========================

export {
  BaziValidator,
  TenGodStrengthValidator,
  CapabilityScoresValidator,
  AlgorithmOutputValidator,
  PatternValidator
} from './data-validators';

// ========================= 性能管理导出 =========================

export {
  PerformanceManager,
  CacheManager,
  PerformanceMonitor,
  getGlobalPerformanceManager,
  configureGlobalPerformanceManager,
  destroyGlobalPerformanceManager
} from './PerformanceManager';

export type {
  CacheConfig,
  PerformanceMetrics
} from './PerformanceManager';

// ========================= 类型导出 =========================

export type {
  // 核心数据结构类型
  BaziInput,
  TenGod,
  TenGodStrength,
  CapabilityName,
  CapabilityScores,
  ClusterScores,
  
  // 配置类型
  AlgorithmConfig,
  CapabilityConfig,
  
  // 结果类型
  AlgorithmOutput,
  StrengthCalculationResult,
  StrengthCalculationIntermediate,
  CapabilityCalculationResult,
  CapabilityCalculationDetails,
  PatternDetectionResult,
  
  // 接口类型
  IBaziCapabilityEngine,
  EngineFactory,
  CustomEngineFactory,
  
  // 错误类型
  CapabilityEngineError,
  ValidationError,
  CalculationError
} from './types';

// ========================= 配置常量导出 =========================

export {
  DEFAULT_ALGORITHM_CONFIG
} from './types';

// ========================= 便捷工具类 =========================

/**
 * 能力评估工具类 - 提供便捷的静态方法
 */
export class CapabilityAssessmentUtils {
  private static defaultEngine: BaziCapabilityEngine | null = null;
  
  /**
   * 获取默认引擎实例（单例模式）
   */
  static getDefaultEngine(): BaziCapabilityEngine {
    if (!this.defaultEngine) {
      this.defaultEngine = createBaziEngine();
    }
    return this.defaultEngine;
  }
  
  /**
   * 快速能力评估 - 使用默认配置
   */
  static async quickAssessment(input: BaziInput): Promise<AlgorithmOutput> {
    const engine = this.getDefaultEngine();
    return await engine.evaluateComplete(input);
  }
  
  /**
   * 快速十神强度计算
   */
  static async quickTenGodStrength(input: BaziInput): Promise<TenGodStrength> {
    const engine = this.getDefaultEngine();
    return await engine.calculateTenGodStrength(input);
  }
  
  /**
   * 快速能力评分计算
   */
  static async quickCapabilityScores(input: BaziInput): Promise<CapabilityScores> {
    const engine = this.getDefaultEngine();
    const strength = await engine.calculateTenGodStrength(input);
    return await engine.calculateCapabilityScores(strength, input);
  }
  
  /**
   * 批量快速评估
   */
  static async batchQuickAssessment(inputs: BaziInput[]): Promise<AlgorithmOutput[]> {
    const engine = this.getDefaultEngine();
    return await engine.evaluateBatch(inputs);
  }
  
  /**
   * 验证八字输入数据
   */
  static validateInput(input: BaziInput): { valid: boolean; errors: string[] } {
    const engine = this.getDefaultEngine();
    return engine.validateInput(input);
  }
  
  /**
   * 格局快速检测
   */
  static async quickPatternDetection(input: BaziInput): Promise<PatternDetectionResult> {
    const strength = await this.quickTenGodStrength(input);
    return PatternDetector.detectPattern(strength);
  }
  
  /**
   * 重置默认引擎（用于测试或配置更改）
   */
  static resetDefaultEngine(): void {
    this.defaultEngine = null;
  }
  
  /**
   * 设置默认引擎配置
   */
  static setDefaultEngineConfig(
    algorithmConfig?: Partial<AlgorithmConfig>,
    capabilityConfig?: Partial<CapabilityConfig>
  ): void {
    this.defaultEngine = createCustomBaziEngine(algorithmConfig, capabilityConfig);
  }
}

// ========================= 兼容性接口 =========================

/**
 * 与Core系统集成的适配器函数
 */
export class CoreIntegrationAdapter {
  
  /**
   * 从Core的BaZiChart转换为BaziInput
   * 这个函数需要根据实际的Core BaZiChart结构进行调整
   */
  static fromBaZiChart(chart: any): BaziInput {
    return BaziValidator.fromBaZiChart(chart);
  }
  
  /**
   * 将能力评估结果转换为Core兼容的格式
   */
  static toCoreFriendlyOutput(output: AlgorithmOutput): any {
    return {
      tenGodStrength: output.ten_god_strength,
      capabilityScores: output.capabilities,
      clusters: output.clusters,
      pattern: output.analysis_details?.pattern,
      warnings: output.tags.warnings,
      metadata: {
        algorithm: 'BossAI-v2.0',
        calculatedAt: new Date().toISOString(),
        polarization: output.intermediates.polarization,
        phantom_stems: output.intermediates.phantom_stems
      }
    };
  }
  
  /**
   * 检查Core兼容性
   */
  static checkCoreCompatibility(): { compatible: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 这里可以添加具体的兼容性检查逻辑
    // 例如检查Core模块是否存在、版本是否兼容等
    
    return {
      compatible: issues.length === 0,
      issues
    };
  }
}

// ========================= 导出工具类 =========================

// Classes are already exported with export class declaration above

// ========================= 模块信息 =========================

export const MODULE_INFO = {
  name: '@astroall/bazi-core/capability-assessment',
  version: '1.0.0',
  description: '八字能力评估模块 - 基于BossAI算法的十神强度和六能力评分系统',
  algorithm: 'BossAI-v2.0',
  features: [
    '十神强度计算 (完整季节性系数矩阵)',
    '六能力评分系统 (执行力、创新力、管理力、销售力、协调力、稳定性)',
    '格局检测和分析',
    '虚透天干识别',
    '主导性加成计算',
    '批量处理支持',
    '性能测试工具',
    'Core系统集成适配器'
  ],
  compatibility: {
    coreVersion: '>=1.0.0',
    nodeVersion: '>=14.0.0',
    typescript: '>=4.5.0'
  }
};