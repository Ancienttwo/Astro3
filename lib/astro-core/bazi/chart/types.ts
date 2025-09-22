import type { PatternAnalysisResult } from '../patterns/types'
import type { StemName, BranchName, ElementName, TenGodType, TenGodSimplified } from '../types'

/**
 * 基础排盘模块 - 类型定义
 * 独立四柱、大运、十神、藏干计算的核心类型系统
 */

// ===== 基础数据类型 =====

// ===== Tyme4ts 库类型定义 =====
// 用于增强 tyme4ts 库的类型安全性

export interface HeavenlyStem {
  getName(): StemName;
}

export interface EarthlyBranch {
  getName(): BranchName;
}

export interface SixtyCycle {
  getHeavenStem(): HeavenlyStem;
  getEarthBranch(): EarthlyBranch;
}

export interface EightChar {
  getYear(): SixtyCycle;
  getMonth(): SixtyCycle;
  getDay(): SixtyCycle;
  getHour(): SixtyCycle;
}

// ===== 干支对类型 =====

export interface StemBranchPair {
  stem: StemName;
  branch: BranchName;
  naYin?: string;                    // 纳音五行
  element?: ElementName;             // 该柱的五行属性（以天干为准）
  branchElement?: ElementName;       // 地支的五行属性
  hiddenStems?: HiddenStem[];        // 地支藏干
  tenGod?: TenGodType;              // 相对日干的十神关系
  tenGodSimplified?: TenGodSimplified; // 简化十神
  pillarType?: 'year' | 'month' | 'day' | 'hour'; // 柱位类型
  pillarIndex?: number;              // 柱位索引 (0-3)
}

// ===== 藏干系统 =====

export interface HiddenStem {
  stem: StemName;                    // 藏干天干
  element: ElementName;              // 五行属性
  strength: number;                  // 强度 (0-100)
  weight: number;                    // 权重 (0-1)
  type: 'primary' | 'secondary' | 'tertiary'; // 本气、中气、余气
  tenGod?: TenGodType;              // 相对日干的十神
}

// ===== 四柱结构 =====

export interface FourPillars {
  year: StemBranchPair;              // 年柱
  month: StemBranchPair;             // 月柱
  day: StemBranchPair;               // 日柱
  hour: StemBranchPair;              // 时柱
  
  // 计算信息
  dayMaster: StemName;               // 日主（日干）
  monthOrder: ElementName;           // 月令五行
  season: '春' | '夏' | '秋' | '冬' | '土月'; // 季节
  
  // 统计信息
  elementCount: Record<ElementName, number>; // 五行统计
  tenGodCount: Record<TenGodType, number>;   // 十神统计
  hiddenStemCount: Record<ElementName, number>; // 藏干五行统计
}

// ===== 大运系统 =====

export interface MajorPeriod {
  period: number;                    // 运期（第几大运）
  startAge: number;                  // 起运年龄
  endAge: number;                    // 结束年龄
  stem: StemName;                    // 大运天干
  branch: BranchName;                // 大运地支
  element: ElementName;              // 大运五行
  naYin: string;                     // 大运纳音
  hiddenStems: HiddenStem[];         // 大运藏干
  tenGod: TenGodType;               // 大运十神
  
  // 运程分析
  relationship: 'favorable' | 'unfavorable' | 'neutral'; // 与日主关系
  strength: number;                  // 运势强度 (0-100)
  description: string;               // 运程描述
}

// ===== 大运起法 =====

export interface MajorPeriodCalculation {
  direction: 'forward' | 'backward'; // 顺排逆排
  startAge: number;                  // 起运年龄
  totalPeriods: number;              // 总运数
  periods: MajorPeriod[];            // 所有大运
  currentPeriod?: MajorPeriod;       // 当前大运
  nextPeriod?: MajorPeriod;          // 下一大运
}

// ===== 十神系统 =====

export interface TenGodAnalysis {
  dayMaster: StemName;               // 日主
  relationships: TenGodRelationship[]; // 所有十神关系
  summary: TenGodSummary;            // 十神总结
  patterns: TenGodPattern[];         // 十神格局
}

export interface TenGodRelationship {
  target: StemName | BranchName;     // 目标干支
  targetType: 'stem' | 'branch' | 'hiddenStem'; // 目标类型
  pillar: 'year' | 'month' | 'day' | 'hour' | 'majorPeriod'; // 所在柱位
  position?: 'stem' | 'branch' | 'hidden'; // 在柱中的位置
  tenGod: TenGodType;               // 十神类型
  tenGodSimplified: TenGodSimplified; // 简化十神
  element: ElementName;              // 五行属性
  strength: number;                  // 强度
  isVisible: boolean;                // 是否透干
}

export interface TenGodSummary {
  strongest: TenGodType;             // 最强十神
  weakest: TenGodType;               // 最弱十神
  visible: TenGodType[];             // 透干十神
  hidden: TenGodType[];              // 藏干十神
  count: Record<TenGodType, number>; // 十神数量统计
  distribution: string;              // 分布描述
}

export interface TenGodPattern {
  name: string;                      // 格局名称
  type: 'favorable' | 'unfavorable' | 'neutral'; // 格局性质
  components: TenGodType[];          // 构成要素
  description: string;               // 格局描述
  strength: number;                  // 格局强度
}

// ===== 纳音系统 =====

export interface NaYinInfo {
  year: string;                      // 年柱纳音
  month: string;                     // 月柱纳音
  day: string;                       // 日柱纳音
  hour: string;                      // 时柱纳音
  dayMasterNaYin: string;           // 日主纳音（日柱）
  element: ElementName;              // 日主纳音五行
  characteristics: string[];         // 纳音特性
  compatibility: NaYinCompatibility; // 纳音相配
}

export interface NaYinCompatibility {
  favorable: string[];               // 相生纳音
  unfavorable: string[];             // 相克纳音
  neutral: string[];                 // 中性纳音
  analysis: string;                  // 相配分析
}

// ===== 排盘选项 =====

export interface ChartCalculationOptions {
  includeHiddenStems?: boolean;      // 是否计算藏干
  includeTenGods?: boolean;          // 是否计算十神
  includeMajorPeriods?: boolean;     // 是否计算大运
  includeNaYin?: boolean;           // 是否计算纳音
  majorPeriodCount?: number;         // 大运数量 (默认8)
  precision?: 'standard' | 'high';  // 计算精度
  validateInput?: boolean;           // 是否验证输入
  useTraditional?: boolean;          // 是否使用传统算法
  enablePerformanceLogging?: boolean; // 是否输出性能日志
  
  // 🆕 能力评估选项
  includeCapabilityAssessment?: boolean;  // 是否进行能力评估
  capabilityAnalysisLevel?: 'basic' | 'comprehensive'; // 能力分析级别
}

// ===== 排盘输入 =====

export interface ChartCalculationInput {
  year: number;                      // 公历年
  month: number;                     // 公历月
  day: number;                       // 公历日
  hour: number;                      // 小时 (0-23)
  minute?: number;                   // 分钟 (0-59)
  second?: number;                   // 秒钟 (0-59)
  gender: 'male' | 'female';         // 性别
  isLunar?: boolean;                 // 是否农历
  timezone?: string;                 // 时区
  location?: {                       // 出生地
    longitude: number;
    latitude: number;
    name?: string;
  };
  options?: {                        // 计算选项
    includeCapabilityAssessment?: boolean;
    includeShenSha?: boolean;
    majorPeriodCount?: number;
  };
}

// ===== 排盘结果 =====

export interface BasicChartResult {
  // 输入信息
  input: ChartCalculationInput;
  
  // 核心排盘结果
  fourPillars: FourPillars;
  naYin?: NaYinInfo;
  tenGodAnalysis: TenGodAnalysis;
  majorPeriods?: MajorPeriodCalculation;
  
  // 🆕 能力评估结果
  capabilityAssessment?: CapabilityAssessmentSnapshot;

  // 🆕 格局分析结果
  patternAnalysis?: PatternAnalysisResult;
  
  // 时间信息
  solarDate: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  lunarDate: {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
    yearName: string;  // 农历年名
    monthName: string; // 农历月名
    dayName: string;   // 农历日名
  };
  
  // 计算信息
  calculationTime: number;           // 计算耗时（毫秒）
  algorithm: string;                 // 算法版本
  options: ChartCalculationOptions;  // 使用的选项
  
  // 性能指标
  performanceMetrics?: {
    calculationTime: number;
    cacheHit: boolean;
  };
  
  // 神煞信息
  shenSha?: any;
  
  // 元数据
  metadata?: {
    architecture?: 'old' | 'new';
    version?: string;
    [key: string]: any;
  };
}

// ===== 能力评估快照 =====

export type CapabilitySummaryKey =
  | 'execution'
  | 'innovation'
  | 'management'
  | 'sales'
  | 'coordination'
  | 'stability';

export interface CapabilityRecommendation {
  category: string;
  suggestion: string;
  priority: number;
}

export interface CapabilityAssessmentSnapshot {
  tenGodStrength?: Record<string, number>;      // 十神强度（标准化）
  capabilityScores: Record<CapabilitySummaryKey, number>; // 英文Key的能力分数
  overallStrength?: number;                     // 综合实力评分
  topCapabilities?: CapabilitySummaryKey[];     // 优势能力Key列表
  topCapabilityLabels?: string[];               // 优势能力中文标签
  topCapabilityDetails?: Array<{               // 优势能力详细信息
    key: CapabilitySummaryKey;
    label: string;
    score: number;
    rank: number;
  }>;
  algorithmOutput?: any;                        // 完整算法输出
  analysisLevel: 'basic' | 'comprehensive';     // 分析级别
  recommendations?: CapabilityRecommendation[]; // 个性化建议
  patterns?: {                                  // 格局信息
    patternType: string;
    confidence: number;
    description: string;
  };
  analysisDetails?: any;                        // 兼容旧版的详细分析信息
  rawCapabilityScores?: Record<string, unknown>; // 原始能力分数字段（兼容中文Key）
}

// ===== 排盘分析器接口 =====

export interface IChartCalculator {
  calculateFourPillars(input: ChartCalculationInput): Promise<FourPillars>;
}

export interface ITenGodCalculator {
  calculateTenGods(fourPillars: FourPillars): Promise<TenGodAnalysis>;
}

export interface IMajorPeriodCalculator {
  calculateMajorPeriods(
    fourPillars: FourPillars, 
    gender: 'male' | 'female',
    birthYear: number,
    count?: number
  ): Promise<MajorPeriodCalculation>;
}

export interface INaYinCalculator {
  calculateNaYin(fourPillars: FourPillars): Promise<NaYinInfo>;
}

export interface IHiddenStemCalculator {
  calculateHiddenStems(branch: BranchName): Promise<HiddenStem[]>;
}

// ===== 常量映射 =====

export interface ElementMapping {
  stems: Record<StemName, ElementName>;
  branches: Record<BranchName, ElementName>;
  naYin: Record<string, ElementName>;
}

export interface TenGodMapping {
  relationships: Record<string, TenGodType>; // "日干-目标干" -> 十神
  simplified: Record<TenGodType, TenGodSimplified>;
  characteristics: Record<TenGodType, {
    nature: 'positive' | 'negative' | 'neutral';
    strength: number;
    description: string;
  }>;
}

// ===== 错误处理 =====

export class ChartCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'ChartCalculationError';
  }
}

// ===== 验证结果 =====

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// ===== 性能指标 =====

export interface PerformanceMetrics {
  fourPillarsTime: number;
  tenGodsTime: number;
  majorPeriodsTime: number;
  naYinTime: number;
  totalTime: number;
  memoryUsage?: number;
}

// ===== 错误类型 =====

export type ChartErrorCode = 
  | 'INVALID_INPUT'
  | 'INVALID_YEAR' 
  | 'INVALID_MONTH'
  | 'INVALID_DAY'
  | 'INVALID_HOUR'
  | 'INVALID_MINUTE'
  | 'INVALID_GENDER'
  | 'FOUR_PILLARS_CALCULATION_ERROR'
  | 'TEN_GOD_CALCULATION_ERROR'
  | 'MAJOR_PERIOD_CALCULATION_ERROR'
  | 'NAYIN_CALCULATION_ERROR'
  | 'BASIC_CHART_CALCULATION_ERROR';
