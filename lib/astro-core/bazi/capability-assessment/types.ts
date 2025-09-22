/**
 * @astroall/bazi-core Capability Assessment Types
 * 
 * 基于BossAI算法的能力评估类型定义
 * 集成十神强度计算和六能力评分系统
 * 
 * @ai-context CAPABILITY_ASSESSMENT_TYPES
 * @purpose 提供能力评估系统的类型定义
 * @version 1.0.0
 * @created 2025-09-06
 */

import { StemName, BranchName, ElementName, GenderType } from '../types';

// ========================= 核心数据结构类型 =========================

/**
 * 八字输入数据结构 (与Core系统兼容)
 */
export interface BaziInput {
  pillars: {
    year: { stem: StemName; branch: BranchName };
    month: { stem: StemName; branch: BranchName };
    day: { stem: StemName; branch: BranchName };
    hour: { stem: StemName; branch: BranchName };
  };
  gender: GenderType;
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  lunarDate?: {
    year: number;
    month: number;
    day: number;
    hour: number;
    isLeap: boolean;
  };
}

/**
 * 十神类型定义
 */
export type TenGod = 
  | '比肩' | '劫财' | '食神' | '伤官' | '正财' 
  | '偏财' | '正官' | '七杀' | '正印' | '偏印';

/**
 * 十神强度分布 (总和为1.0)
 */
export interface TenGodStrength {
  '比肩': number;
  '劫财': number;
  '食神': number;
  '伤官': number;
  '正财': number;
  '偏财': number;
  '正官': number;
  '七杀': number;
  '正印': number;
  '偏印': number;
}

/**
 * 能力名称定义
 */
export type CapabilityName = 
  | '执行力基础分' | '创新力基础分' | '管理力基础分'
  | '销售力基础分' | '协调力基础分' | '稳定性基础分';

/**
 * 六能力评分结果 (0-100分制)
 */
export interface CapabilityScores {
  '执行力基础分': number;
  '创新力基础分': number; 
  '管理力基础分': number;
  '销售力基础分': number;
  '协调力基础分': number;
  '稳定性基础分': number;
}

/**
 * 聚合指标 (十神分组)
 */
export interface ClusterScores {
  食伤: number;  // 食神 + 伤官
  官杀: number;  // 正官 + 七杀
  比劫: number;  // 比肩 + 劫财
  财: number;    // 正财 + 偏财
  印: number;    // 正印 + 偏印
}

// ========================= 算法配置类型 =========================

/**
 * 算法配置参数
 */
export interface AlgorithmConfig {
  // 位置权重
  position_weights: {
    month: number;  // 月柱权重
    day: number;    // 日柱权重
    hour: number;   // 时柱权重
    year: number;   // 年柱权重
  };
  
  // 藏干层级系数
  layer_coefficients: {
    main: number;   // 主气系数
    mid: number;    // 中气系数
    rest: number;   // 余气系数
  };
  
  // 天干放大参数
  amplification: {
    k_amp: number;        // 放大系数k
    gamma_amp: number;    // 放大系数gamma
    decay_multi: number;  // 衰减倍数
    seed_ratio: number;   // 种子比例
  };
  
  // 十神处理参数
  ten_god_processing: {
    beta_food_hurt: number;     // 食伤吸收率
    weak_root_ratio: number;    // 弱根阈值
    weak_root_factor: number;   // 弱根衰减
    alpha_marginal: number;     // 边际递减
  };
  
  // 杀化触发条件
  kill_transformation: {
    dominance_threshold: number;      // 主导阈值
    root_density_threshold: number;  // 根密度阈值
  };
  
  // 从格判定
  cong_pattern: {
    dominance_threshold: number;  // 主导阈值
    support_ratio_max: number;    // 支撑比例上限
  };
}

/**
 * 能力评分配置参数
 */
export interface CapabilityConfig {
  // 基础配置
  amplification_factor: number;        // 基础放大系数
  dominance_threshold: number;         // 主导阈值
  dominance_bonus_factor: number;      // 主导加成系数
  min_score: number;                   // 最低分数
  max_score: number;                   // 最高分数
  smooth_factor: boolean;              // 是否使用平方根平滑

  // 权重配置
  capability_weights: {
    [key in CapabilityName]: {
      [K in TenGod]: number;
    };
  };
}

// ========================= 计算结果类型 =========================

/**
 * 强度计算中间结果
 */
export interface StrengthCalculationIntermediate {
  root_scores: { [K in ElementName]: number };          // 根分值
  seasonal_factors: { [K in ElementName]: number };     // 季节因子
  phantom_stems: string[];                               // 虚透天干列表
  amplified_scores: { [key: string]: number };          // 放大后分值
  ten_god_raw: Partial<TenGodStrength>;                // 原始十神分值
}

/**
 * 强度计算完整结果
 */
export interface StrengthCalculationResult {
  strengths: TenGodStrength;                    // 标准化十神强度
  tags: {
    hurt_absorb_rate: number;                   // 伤官吸收率
    kill_mode: 'normal' | 'kill_dominant';     // 杀化模式
    cong_pattern: boolean | { type: string };  // 从格信息
    phantom_ratio: number;                      // 虚透比例
    dominance: number;                          // 主导度
    seasonal_method: 'precise_matrix';          // 季节计算方法
    warnings: string[];                         // 警告信息
  };
  intermediate: StrengthCalculationIntermediate; // 中间计算结果
}

/**
 * 能力评分中间结果
 */
export interface CapabilityCalculationDetails {
  capability: CapabilityName;
  base_contributions: Array<{
    ten_god: TenGod;
    raw_strength: number;
    effective_strength: number;
    weight: number;
    contribution: number;
  }>;
  base_score: number;
  dominance_bonus: number;
  pattern_bonus: number;
  final_score: number;
}

/**
 * 能力评分完整结果
 */
export interface CapabilityCalculationResult {
  scores: CapabilityScores;
  details: {
    pattern: PatternDetectionResult;
    calculation_details: CapabilityCalculationDetails[];
    polarization: {
      disparity: number;
      balance: number;
    };
  };
}

// ========================= 格局检测类型 =========================

/**
 * 格局检测结果
 */
export interface PatternDetectionResult {
  pattern_type: string;           // 格局类型
  dominant_ten_god: TenGod;      // 主导十神
  strength_ratio: number;        // 强度比例
  confidence: number;            // 置信度
  description?: string;          // 格局描述
}

// ========================= 完整输出类型 =========================

/**
 * 能力评估系统完整输出
 */
export interface AlgorithmOutput {
  // 核心结果
  ten_god_strength: TenGodStrength;
  clusters: ClusterScores;
  capabilities: CapabilityScores;
  
  // 元信息标签
  tags: {
    hurt_absorb_rate: number;
    kill_mode: 'normal' | 'kill_dominant';
    cong_pattern: boolean | { type: string };
    phantom_ratio: number;
    dominance: number;
    seasonal_method: 'precise_matrix';
    warnings: string[];
  };
  
  // 中间计算结果
  intermediates: {
    root_scores: { [K in ElementName]: number };
    seasonal_factors: { [K in ElementName]: number };
    month_branch: BranchName;
    polarization: { disparity: number; balance: number };
    phantom_stems: string[];
  };
  
  // 能力分析详情
  analysis_details?: {
    pattern: PatternDetectionResult;
    capability_breakdown: CapabilityCalculationDetails[];
    recommendations?: string[];
  };
}

// ========================= 引擎接口类型 =========================

/**
 * 能力评估引擎核心接口
 */
export interface IBaziCapabilityEngine {
  // 核心计算方法
  calculateTenGodStrength(input: BaziInput, config?: Partial<AlgorithmConfig>): Promise<TenGodStrength>;
  calculateCapabilityScores(strength: TenGodStrength, input: BaziInput): Promise<CapabilityScores>;
  evaluateComplete(input: BaziInput, config?: Partial<AlgorithmConfig>): Promise<AlgorithmOutput>;
  evaluateBasic(input: BaziInput): Promise<CapabilityScores>;
  
  // 辅助分析方法
  analyzeRootScores(input: BaziInput): Promise<{ [K in ElementName]: number }>;
  detectPhantomStems(input: BaziInput): Promise<string[]>;
  calculatePolarization(clusters: ClusterScores): { disparity: number; balance: number };
  detectPattern(strengths: TenGodStrength): PatternDetectionResult;
  
  // 配置管理
  getConfig(): AlgorithmConfig;
  updateConfig(config: Partial<AlgorithmConfig>): void;
  updateCapabilityConfig(config: Partial<CapabilityConfig>): void;
  
  // 验证方法
  validateInput(input: BaziInput): { valid: boolean; errors: string[] };
  validateOutput(output: AlgorithmOutput): { valid: boolean; warnings: string[] };
  
  // 批量处理
  evaluateBatch(inputs: BaziInput[]): Promise<AlgorithmOutput[]>;
  
  // 性能测试
  performanceTest(input: BaziInput, iterations?: number): Promise<{
    average_time_ms: number;
    min_time_ms: number;
    max_time_ms: number;
    total_time_ms: number;
  }>;
}

// ========================= 工厂函数类型 =========================

/**
 * 引擎创建函数类型
 */
export type EngineFactory = () => IBaziCapabilityEngine;
export type CustomEngineFactory = (
  algorithmConfig?: Partial<AlgorithmConfig>,
  capabilityConfig?: Partial<CapabilityConfig>
) => IBaziCapabilityEngine;

// ========================= 错误类型 =========================

/**
 * 能力评估系统错误类型
 */
export class CapabilityEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'CapabilityEngineError';
  }
}

/**
 * 数据验证错误
 */
export class ValidationError extends CapabilityEngineError {
  constructor(message: string, context?: any) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * 计算错误
 */
export class CalculationError extends CapabilityEngineError {
  constructor(message: string, context?: any) {
    super(message, 'CALCULATION_ERROR', context);
    this.name = 'CalculationError';
  }
}

// ========================= 默认配置常量 =========================

/**
 * 默认算法配置
 */
export const DEFAULT_ALGORITHM_CONFIG: AlgorithmConfig = {
  position_weights: {
    month: 25.0,    // 放大25倍以适应0-100固定值系统
    day: 17.5,      // 原来0.70 * 25
    hour: 13.75,    // 原来0.55 * 25
    year: 11.25     // 原来0.45 * 25
  },
  layer_coefficients: {
    main: 25.0,     // 放大25倍
    mid: 13.75,     // 原来0.55 * 25
    rest: 7.5       // 原来0.30 * 25
  },
  amplification: {
    k_amp: 0.50,
    gamma_amp: 0.60,
    decay_multi: 0.35,
    seed_ratio: 0.15
  },
  ten_god_processing: {
    beta_food_hurt: 0.9,
    weak_root_ratio: 0.04,
    weak_root_factor: 0.6,
    alpha_marginal: 0.90
  },
  kill_transformation: {
    dominance_threshold: 2.2,
    root_density_threshold: 1.15
  },
  cong_pattern: {
    dominance_threshold: 1.8,
    support_ratio_max: 0.15
  }
};