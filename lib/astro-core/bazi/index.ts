/**
 * @astroall/bazi-core - 八字核心计算模块
 * 
 * @ai-context BAZI_CORE_MAIN_EXPORT
 * @purpose 统一的八字计算核心模块，防止算法重复实现
 * @pattern 类似 ziwei-core 设计，提供标准化的计算接口
 * @critical 项目中所有八字计算必须通过此模块进行
 * @version 2.0.0
 * @created 2025-01-05
 * @updated 2025-01-09 - Added service architecture with migration support
 */

// =============== NEW SERVICE ARCHITECTURE ===============
// Feature flags for gradual rollout
export { featureFlags, useNewArchitecture, DevFlags } from './config/feature-flags';

// Service factory for dependency injection
export { 
  serviceFactory,
  getOrchestrator,
  getValidationService,
  getCalculationService,
  getCacheService,
  getPerformanceMonitor
} from './services/ServiceFactory';

// Migration adapter for seamless transition
export {
  migrationAdapter,
  generateCompleteBaziChartMigrated,
  calculateBatchMigrated
} from './migration/MigrationAdapter';

// Service interfaces
export type {
  IValidationService,
  ICalculationService,
  ICacheService,
  IPerformanceMonitor
} from './services/interfaces';

// =============== LEGACY EXPORTS (Will be deprecated) ===============
// 主要计算函数 - 导入并重新导出（临时注释，存在类型依赖问题）
// import {
//   generateCompleteBaziChart,
//   calculateBatch,
//   validateInput,
//   getPerformanceMetrics
// } from './calculation';

// export {
//   generateCompleteBaziChart,
//   calculateBatch,
//   validateInput,
//   getPerformanceMetrics
// };

// 新的模块化基础排盘系统
export {
  BasicChartCalculator,
  FourPillarsCalculator,
  TenGodCalculator,
  MajorPeriodCalculator,
  NaYinCalculator,
  ChartUtils,
  ChartModuleInfo
} from './chart';

export type {
  ChartCalculationInput,
  ChartCalculationOptions,
  BasicChartResult
} from './chart';

// 导入 chart 模块的类型和工具类用于默认导出
import { 
  BasicChartCalculator as BasicChartCalc,
  ChartUtils as ChartUtilsImpl,
  ChartModuleInfo as ChartModuleInfoImpl
} from './chart';

// 神煞计算函数
export {
  checkBaziShenSha,
  getPeachBlossomSummary,
  getNoblemanSummary,
  getSimplifiedShenSha,
  getColumnShenSha
} from './algorithms';

export type {
  BaziShenShaResult
} from './algorithms/shensha';

// 🆕 能力评估系统 - BossAI算法集成
export {
  BaziCapabilityEngine,
  createBaziEngine,
  createCustomBaziEngine,
  TenGodStrengthCalculator,
  CapabilityScorer,
  PatternDetector,
  CapabilityAssessmentUtils,
  CoreIntegrationAdapter,
  MODULE_INFO as CAPABILITY_MODULE_INFO
} from './capability-assessment';

// 能力评估类型定义
export type {
  BaziInput as CapabilityBaziInput,
  TenGodStrength,
  CapabilityScores,
  ClusterScores,
  AlgorithmOutput as CapabilityOutput,
  PatternDetectionResult,
  IBaziCapabilityEngine
} from './capability-assessment';

// AI Prompt 数据接口 
export {
  AIPromptGenerator,
  AIPromptDataFormatter
} from './ai-prompt';

// AI Prompt 工具类
export { AIPromptUtils } from './ai-prompt';

export type {
  AIPromptData,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AIPromptTemplate,
  AIPromptOptions
} from './ai-prompt';

// Hooks - React Hooks for BaZi calculations (temporarily disabled due to type compatibility)
// export { useBaziChart } from './hooks/useBaziChart';
// export type { UseBaziChartInput, UseBaziChartResult } from './hooks/useBaziChart';

// 类型定义 - 从各模块重新导出
export type * from './ai-prompt/types';
export type * from './capability-assessment/types';
export type * from './shensha/types';
export type * from './strength/types';
// Re-export migrated 100-point wuxing scorer from root for stable imports
export { calculateWuxingScoreMigrated } from './strength';

// 🆕 格局分析引擎
export * from './patterns';

// 🆕 Grid Formatters for UI
export {
  formatForGrid,
  formatSimpleGrid,
  GridFormatUtils,
  ELEMENT_COLORS
} from './formatters';

export type {
  BaziGridData,
  SimpleBaziGrid,
  GridFormatOptions,
  GridLayoutConfig,
  GridCell
} from './formatters';

// 🆕 用神推理 Agent
export {
  runYongshenAgent,
  deriveYongshenInput,
  summarizeYongshen,
  buildYongshenAgentQuery
} from './agent/yongshenAgent';

export {
  buildTiekouAgentQuery
} from './agent/tiekouAgent';

export type {
  YongshenAgentResult
} from './agent/yongshenAgent';

export type {
  InputChart as YongshenAgentInput,
  OutputPayload as YongshenAgentOutput
} from './agent/yongshenToolkit';


/**
 * 🎯 快速开始示例
 * 
 * ```typescript
 * import { ChartUtils } from '@astroall/bazi-core';
 * 
 * // 使用新的模块化接口（推荐）
 * const chartResult = await ChartUtils.calculateFullChart({
 *   year: 1990,
 *   month: 6,
 *   day: 15,
 *   hour: 14,
 *   minute: 30,
 *   gender: 'male',
 *   isLunar: false
 * });
 * 
 * console.log('四柱:', chartResult.fourPillars);
 * console.log('十神:', chartResult.tenGodAnalysis);
 * console.log('大运:', chartResult.majorPeriods);
 * console.log('纳音:', chartResult.naYin);
 * 
 * // 获取排盘摘要
 * const summary = ChartUtils.getChartSummary(chartResult);
 * console.log('摘要:', summary.description);
 * 
 * // 方式3: 使用能力评估系统（BossAI算法）
 * const capabilityInput = CoreIntegrationAdapter.fromBaZiChart(chartResult);
 * const capabilityResult = await CapabilityAssessmentUtils.quickAssessment(capabilityInput);
 * 
 * console.log('十神强度:', capabilityResult.ten_god_strength);
 * console.log('六能力评分:', capabilityResult.capabilities);
 * console.log('格局分析:', capabilityResult.analysis_details?.pattern);
 * console.log('个性化建议:', capabilityResult.analysis_details?.recommendations);
 * 
 * // 🆕 方式4: 集成排盘 + 能力评估（一次调用完成）
 * const completeResult = await ChartUtils.calculateChartWithCapabilities({
 *   year: 1990, month: 6, day: 15, hour: 14, minute: 30,
 *   gender: 'male', isLunar: false
 * }, 'comprehensive');
 * 
 * // 获取完整排盘结果
 * console.log('四柱:', completeResult.fourPillars);
 * console.log('十神:', completeResult.tenGodAnalysis);
 * console.log('大运:', completeResult.majorPeriods);
 * 
 * // 获取能力评估结果
 * if (completeResult.capabilityAssessment) {
 *   console.log('能力评分:', completeResult.capabilityAssessment.capabilityScores);
 *   console.log('格局类型:', completeResult.capabilityAssessment.patterns?.patternType);
 *   console.log('建议:', completeResult.capabilityAssessment.recommendations);
 * }
 * 
 * // 获取能力分析摘要
 * const capabilitySummary = ChartUtils.getCapabilityAnalysisSummary(completeResult);
 * console.log('前三大能力:', capabilitySummary.topCapabilities);
 * console.log('整体强度:', capabilitySummary.overallStrength);
 * 
 * // 生成AI分析提示词
 * const aiPrompt = await AIPromptUtils.quickGenerate(chartResult, {
 *   language: 'zh-CN',
 *   scenario: 'personality',
 *   detailLevel: 'comprehensive'
 * });
 * console.log('AI分析提示词:', aiPrompt);
 * 
 * // 🆕 生成包含能力评估的AI提示词
 * if (completeResult.capabilityAssessment) {
 *   const prompt = await AIPromptUtils.quickGenerate({
 *     fourPillars: completeResult.fourPillars,
 *     gender: 'male',
 *     solarDate: completeResult.solarDate,
 *     timezone: 'Asia/Shanghai'
 *   }, {
 *     language: 'zh-CN',
 *     detailLevel: 'comprehensive',
 *     includeAnalysis: {
 *       capabilityAssessment: true,
 *       personality: true,
 *       career: true,
 *       shensha: false,
 *       wuxing: false,
 *       dayun: false,
 *       shishen: false,
 *       health: false,
 *       relationship: false
 *     }
 *   });
 *   console.log('AI分析提示词:', prompt);
 * }
 * ```
 * 
 * @ai-usage 替代所有直接的八字计算代码
 * @integration 通过 AlgorithmRegistry.getBaZi() 访问
 * @features 完整的八字排盘、神煞分析、能力评估、AI数据格式化
 */

// 导入能力评估工具用于默认导出
import { CapabilityAssessmentUtils, CoreIntegrationAdapter } from './capability-assessment';
import { AIPromptUtils } from './ai-prompt';

// 默认导出
export default {
  // 新模块化接口
  ChartUtils: ChartUtilsImpl,
  BasicChartCalculator: BasicChartCalc,
  ChartModuleInfo: ChartModuleInfoImpl,
  
  // 🆕 能力评估接口 (BossAI算法)
  CapabilityUtils: CapabilityAssessmentUtils,
  CoreAdapter: CoreIntegrationAdapter,
  
  // 🆕 AI数据接口
  AIPromptUtils: AIPromptUtils
};
