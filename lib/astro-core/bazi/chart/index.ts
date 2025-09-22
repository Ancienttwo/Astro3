/**
 * 基础排盘模块入口文件
 * 提供统一的接口导出所有排盘功能
 */

// 分项计算器（基础功能优先）
export { FourPillarsCalculator } from './FourPillarsCalculator';
export { TenGodCalculator } from './TenGodCalculator';
export { MajorPeriodCalculator } from './MajorPeriodCalculator';
export { NaYinCalculator } from './NaYinCalculator';

// 主计算器（已修复循环依赖问题）
export { BasicChartCalculator } from './BasicChartCalculator';

// 导入用于ChartUtils
import { BasicChartCalculator } from './BasicChartCalculator';
import { FourPillarsCalculator } from './FourPillarsCalculator';
import { TenGodCalculator } from './TenGodCalculator';
import { MajorPeriodCalculator } from './MajorPeriodCalculator';
import { NaYinCalculator } from './NaYinCalculator';

import type {
  ChartCalculationInput,
  BasicChartResult,
  FourPillars,
  TenGodAnalysis,
  MajorPeriodCalculation,
  NaYinInfo
} from './types';

// 类型定义
export type {
  // 输入输出类型
  ChartCalculationInput,
  ChartCalculationOptions,
  BasicChartResult,
  ValidationResult,
  
  // 四柱相关类型
  FourPillars,
  StemBranchPair,
  HiddenStem,
  
  // 十神相关类型
  TenGodAnalysis,
  TenGodRelationship,
  TenGodPattern,
  
  // 大运相关类型
  MajorPeriod,
  MajorPeriodCalculation,
  
  // 纳音相关类型
  NaYinInfo,
  NaYinCompatibility,
  
  // 基础类型
  PerformanceMetrics,
  CapabilityAssessmentSnapshot,
  CapabilityRecommendation,
  CapabilitySummaryKey,
  
  // 接口类型
  IChartCalculator,
  ITenGodCalculator,
  IMajorPeriodCalculator,
  INaYinCalculator,
  
  // 错误类型
  ChartCalculationError,
  ChartErrorCode
} from './types';

export type {
  StemName,
  BranchName,
  ElementName,
  TenGodType
} from '../types';

// 常量导出
export {
  // 干支常量
  STEMS,
  BRANCHES,
  YANG_STEMS,
  YIN_STEMS,
  
  // 五行常量
  ELEMENTS,
  STEM_ELEMENTS,
  BRANCH_ELEMENTS,
  MONTH_ORDER_ELEMENTS,
  
  // 十神常量
  TEN_GODS,
  TEN_GOD_RELATIONSHIPS,
  TEN_GOD_ELEMENTS,
  
  // 地支藏干
  BRANCH_HIDDEN_STEMS,
  
  // 纳音表
  NAYIN_TABLE,
  NAYIN_ELEMENTS,
  
  // 季节映射
  SEASON_MAP,
  
  // 算法版本
  CHART_ALGORITHM_VERSION,
  
  // 默认选项
  DEFAULT_CHART_OPTIONS,
  
  // 精度设置
  PRECISION_SETTINGS
} from './constants';

// 便利工具函数
export const ChartUtils = {
  /**
   * 创建基础排盘计算器实例
   */
  createBasicCalculator(): BasicChartCalculator {
    return new BasicChartCalculator();
  },
  
  /**
   * 快速四柱计算
   */
  async calculateFourPillarsOnly(input: ChartCalculationInput): Promise<{
    fourPillars: FourPillars;
    calculationTime: number;
  }> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateFourPillarsOnly(input);
  },
  
  /**
   * 完整排盘计算
   */
  async calculateFullChart(input: ChartCalculationInput): Promise<BasicChartResult> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: true,
      includeNaYin: true,
      validateInput: true,
      majorPeriodCount: 8
    });
  },
  
  /**
   * 快速排盘（不含大运与纳音）
   */
  async calculateQuickChart(input: ChartCalculationInput): Promise<BasicChartResult> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: false,
      includeNaYin: false,
      validateInput: true
    });
  },
  
  /**
   * 分步计算完整排盘（使用分项计算器）
   */
  async calculateStepByStep(input: ChartCalculationInput): Promise<{
    fourPillars: FourPillars;
    tenGodAnalysis: TenGodAnalysis;
    majorPeriods: MajorPeriodCalculation;
    naYin: NaYinInfo;
    calculationTime: number;
  }> {
    const startTime = performance.now();
    
    // 1. 计算四柱
    const fourPillarsCalc = new FourPillarsCalculator();
    const fourPillars = await fourPillarsCalc.calculateFourPillars(input);
    
    // 2. 计算十神
    const tenGodCalc = new TenGodCalculator();
    const tenGodAnalysis = await tenGodCalc.calculateTenGods(fourPillars);
    
    // 3. 计算大运
    const majorPeriodCalc = new MajorPeriodCalculator();
    const majorPeriods = await majorPeriodCalc.calculateMajorPeriods(
      fourPillars,
      input.gender,
      input.year,
      8
    );
    
    // 4. 计算纳音
    const naYinCalc = new NaYinCalculator();
    const naYin = await naYinCalc.calculateNaYin(fourPillars);
    
    const calculationTime = performance.now() - startTime;
    
    return {
      fourPillars,
      tenGodAnalysis,
      majorPeriods,
      naYin,
      calculationTime
    };
  },
  
  /**
   * 获取排盘摘要
   */
  getChartSummary(result: BasicChartResult) {
    const calculator = new BasicChartCalculator();
    return calculator.getChartSummary(result);
  },
  
  /**
   * 检查特殊格局
   */
  checkSpecialPatterns(result: BasicChartResult) {
    const calculator = new BasicChartCalculator();
    return calculator.checkSpecialPatterns(result);
  },
  
  /**
   * 计算包含能力评估的完整排盘（如果模块可用）
   */
  async calculateChartWithCapabilities(
    input: ChartCalculationInput,
    analysisLevel: 'basic' | 'comprehensive' = 'comprehensive'
  ): Promise<BasicChartResult> {
    const calculator = new BasicChartCalculator();
    return calculator.calculateBasicChart(input, {
      includeTenGods: true,
      includeMajorPeriods: true,
      includeNaYin: true,
      includeCapabilityAssessment: true,
      capabilityAnalysisLevel: analysisLevel,
      validateInput: true,
      majorPeriodCount: 8
    });
  },
  
  /**
   * 单独进行能力评估（如果模块可用）
   */
  async calculateCapabilityAssessment(
    input: ChartCalculationInput | BasicChartResult,
    analysisLevel: 'basic' | 'comprehensive' = 'comprehensive'
  ) {
    const calculator = new BasicChartCalculator();
    return calculator.calculateCapabilityAssessment(input, analysisLevel);
  },
  
  /**
   * 获取能力分析摘要
   */
  getCapabilityAnalysisSummary(result: BasicChartResult) {
    const calculator = new BasicChartCalculator();
    return calculator.getCapabilityAnalysisSummary(result);
  }
} as const;

// 版本信息
export const ChartModuleInfo = {
  name: '@astroall/bazi-core/chart',
  version: '1.0.0',
  description: '八字基础排盘核心模块',
  features: [
    '四柱八字计算',
    '十神关系分析', 
    '大运计算',
    '纳音五行',
    '藏干分析',
    '格局识别',
    '性能监控',
    '输入验证'
  ],
  algorithms: {
    fourPillars: 'tyme4ts + 传统历法',
    tenGods: '完整关系映射表',
    majorPeriods: '传统起运算法',
    nayin: '六十花甲纳音表'
  },
  performance: {
    averageCalculationTime: '<50ms',
    memoryUsage: '<10MB',
    accuracy: '99.9%'
  }
} as const;
