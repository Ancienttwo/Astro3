/**
 * 神煞检测层架构 - 类型定义
 * 分离检测与分析的模块化神煞系统
 */

import type { StemName, BranchName } from '../types';

// ===== 基础类型 =====

export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type ShenShaCategory = 'auspicious' | 'inauspicious' | 'neutral' | 'mixed';
export type ShenShaGroup = 'nobleman' | 'peachBlossom' | 'wealth' | 'academic' | 'health' | 'relationship' | 'career' | 'disaster' | 'punishment' | 'general';

// ===== 神煞基础信息 =====

export interface ShenShaInfo {
  /** 神煞名称 */
  name: string;
  /** 神煞类别 */
  category: ShenShaCategory;
  /** 神煞分组 */
  group: ShenShaGroup;
  /** 简短描述 */
  description: string;
  /** 详细说明 */
  details?: string;
  /** 影响强度 (1-10) */
  strength: number;
  /** 是否为重要神煞 */
  isImportant: boolean;
  /** 别名 */
  aliases?: string[];
}

// ===== 检测条件 =====

export interface ShenShaCondition {
  /** 条件类型 */
  type: 'stem' | 'branch' | 'stemBranch' | 'nayin' | 'relationship' | 'combination';
  /** 目标柱位 */
  targetPillar?: PillarType;
  /** 参照柱位 */
  referencePillar?: PillarType;
  /** 目标值 */
  targetValue?: string | string[];
  /** 参照值 */
  referenceValue?: string | string[];
  /** 额外条件 */
  extraConditions?: Record<string, any>;
}

// ===== 检测结果 =====

export interface ShenShaDetectionResult {
  /** 神煞名称 */
  name: string;
  /** 是否检测到 */
  hasIt: boolean;
  /** 出现位置 */
  positions: {
    pillar: PillarType;
    stem?: string;
    branch?: string;
  }[];
  /** 检测详情 */
  details?: {
    type?: string;
    subtype?: string;
    triggerCondition?: string;
    matchedValue?: string;
  };
  /** 原始检测数据 */
  rawData?: any;
}

// ===== 神煞分析结果 =====

export interface ShenShaAnalysisResult {
  /** 检测结果 */
  detection: ShenShaDetectionResult;
  /** 神煞信息 */
  info: ShenShaInfo;
  /** 综合评分 (0-100) */
  score: number;
  /** 影响分析 */
  impact: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  /** 激活条件 */
  activationConditions?: string[];
  /** 化解方法 */
  resolutionMethods?: string[];
}

// ===== 批量检测结果 =====

export interface BatchShenShaResult {
  /** 所有检测到的神煞 */
  detectedShenSha: ShenShaAnalysisResult[];
  /** 按类别分组 */
  byCategory: Record<ShenShaCategory, ShenShaAnalysisResult[]>;
  /** 按分组分类 */
  byGroup: Record<ShenShaGroup, ShenShaAnalysisResult[]>;
  /** 重要神煞 */
  important: ShenShaAnalysisResult[];
  /** 综合统计 */
  statistics: {
    total: number;
    auspicious: number;
    inauspicious: number;
    neutral: number;
    mixed: number;
    averageStrength: number;
    totalScore: number;
  };
  /** 综合分析 */
  overallAnalysis: {
    summary: string;
    dominantCategory: ShenShaCategory;
    keyFindings: string[];
    recommendations: string[];
  };
}

// ===== 输入数据 =====

export interface ShenShaInput {
  /** 四柱干支 */
  fourPillars: {
    year: { stem: StemName; branch: BranchName; };
    month: { stem: StemName; branch: BranchName; };
    day: { stem: StemName; branch: BranchName; };
    hour: { stem: StemName; branch: BranchName; };
  };
  /** 纳音 */
  nayin?: {
    year: string;
    month: string;
    day: string;
    hour: string;
  };
  /** 性别 */
  gender: 'male' | 'female';
  /** 额外选项 */
  options?: {
    includeMinor?: boolean;      // 包含次要神煞
    includeModern?: boolean;     // 包含现代新增神煞
    detailedAnalysis?: boolean;  // 详细分析
    resolutionMethods?: boolean; // 包含化解方法
  };
}

// ===== 检测器接口 =====

export interface IShenShaDetector {
  /** 检测器名称 */
  name: string;
  /** 支持的神煞列表 */
  supportedShenSha: string[];
  /** 执行检测 */
  detect(input: ShenShaInput): ShenShaDetectionResult[];
  /** 获取神煞信息 */
  getShenShaInfo(name: string): ShenShaInfo | undefined;
}

// ===== 分析器接口 =====

export interface IShenShaAnalyzer {
  /** 分析器名称 */
  name: string;
  /** 分析检测结果 */
  analyze(detection: ShenShaDetectionResult, input: ShenShaInput): ShenShaAnalysisResult;
  /** 批量分析 */
  batchAnalyze(detections: ShenShaDetectionResult[], input: ShenShaInput): BatchShenShaResult;
  /** 获取分析建议 */
  getRecommendations(results: ShenShaAnalysisResult[]): string[];
}

// ===== 神煞注册表接口 =====

export interface IShenShaRegistry {
  /** 注册检测器 */
  registerDetector(detector: IShenShaDetector): void;
  /** 注册分析器 */
  registerAnalyzer(analyzer: IShenShaAnalyzer): void;
  /** 获取所有检测器 */
  getDetectors(): IShenShaDetector[];
  /** 获取指定检测器 */
  getDetector(name: string): IShenShaDetector | undefined;
  /** 获取分析器 */
  getAnalyzer(): IShenShaAnalyzer;
  /** 执行完整检测流程 */
  detectAndAnalyze(input: ShenShaInput): BatchShenShaResult;
}

// ===== 配置选项 =====

export interface ShenShaConfig {
  /** 启用的检测器 */
  enabledDetectors: string[];
  /** 分析器配置 */
  analyzerConfig: {
    includeMinorShenSha: boolean;
    detailedImpactAnalysis: boolean;
    includeResolutionMethods: boolean;
    customWeights?: Record<string, number>;
  };
  /** 性能设置 */
  performance: {
    enableCache: boolean;
    maxCacheSize: number;
    enableParallel: boolean;
  };
  /** 自定义神煞定义 */
  customShenSha?: Array<{
    name: string;
    info: ShenShaInfo;
    conditions: ShenShaCondition[];
  }>;
}

// ===== 错误类型 =====

export type ShenShaErrorCode = 
  | 'INVALID_INPUT'
  | 'DETECTOR_NOT_FOUND'
  | 'ANALYZER_NOT_FOUND'
  | 'DETECTION_ERROR'
  | 'ANALYSIS_ERROR'
  | 'CONFIGURATION_ERROR';

export class ShenShaError extends Error {
  constructor(
    message: string,
    public code: ShenShaErrorCode,
    public data?: any
  ) {
    super(message);
    this.name = 'ShenShaError';
  }
}
