/**
 * 旺衰分析模块 - 主入口文件
 * 基于现有 wuxingScoring.ts 算法的模块化重构
 */

// 类型定义
export * from './types';

// 常量数据
export * from './constants';

// 分析器模块
export { BasicScoreCalculator } from './BasicScoreCalculator';
export { SeasonalAnalyzer } from './SeasonalAnalyzer';
export { RelationshipAnalyzer } from './RelationshipAnalyzer';
export { CombinationAnalyzer } from './CombinationAnalyzer';
export { ConflictAnalyzer } from './ConflictAnalyzer';
export { TransparencyAnalyzer } from './TransparencyAnalyzer';
export { calculateWuxingScoreMigrated } from './MigratedWuxingScorer';

// 便捷函数
import { StrengthAnalyzer } from './StrengthAnalyzer';
import { StrengthAnalysisOptions, StrengthAnalysisResult } from './types';

export { StrengthAnalyzer };

/**
 * 快速旺衰分析函数
 * @param bazi 八字数组 [年干, 年支, 月干, 月支, 日干, 日支, 时干, 时支]
 * @param options 分析选项
 * @returns 完整的旺衰分析结果
 */
export async function analyzeWuxingStrength(
  bazi: string[], 
  options?: StrengthAnalysisOptions
): Promise<StrengthAnalysisResult> {
  const analyzer = new StrengthAnalyzer();
  return await analyzer.analyze(bazi, options);
}

/**
 * 简化版旺衰分析 - 仅返回基本结果
 * @param bazi 八字数组
 * @returns 简化的分析结果
 */
export async function analyzeWuxingStrengthSimple(bazi: string[]): Promise<{
  dayMasterElement: string;
  dayMasterStrength: 'strong' | 'weak' | 'balanced';
  scores: { wood: number; fire: number; earth: number; metal: number; water: number };
  percentages: { wood: number; fire: number; earth: number; metal: number; water: number };
  strongestElement: string;
  weakestElement: string;
  summary: string;
}> {
  const result = await analyzeWuxingStrength(bazi);
  
  return {
    dayMasterElement: result.dayMaster.element,
    dayMasterStrength: result.dayMaster.strength,
    scores: result.scores,
    percentages: result.percentages,
    strongestElement: result.strongest,
    weakestElement: result.weakest,
    summary: result.aiSummary.conciseDescription
  };
}

/**
 * 创建默认的旺衰分析器实例
 */
export function createStrengthAnalyzer(): StrengthAnalyzer {
  return new StrengthAnalyzer();
}

/**
 * 批量分析多个八字的旺衰
 * @param baziList 八字数组的数组
 * @param options 分析选项
 * @returns 批量分析结果
 */
export async function analyzeMultipleWuxingStrength(
  baziList: string[][],
  options?: StrengthAnalysisOptions
): Promise<StrengthAnalysisResult[]> {
  const analyzer = new StrengthAnalyzer();
  const results = await Promise.all(
    baziList.map(bazi => analyzer.analyze(bazi, options))
  );
  return results;
}

/**
 * 比较两个八字的旺衰差异
 * @param bazi1 第一个八字
 * @param bazi2 第二个八字
 * @param options 分析选项
 * @returns 比较结果
 */
export async function compareWuxingStrength(
  bazi1: string[],
  bazi2: string[],
  options?: StrengthAnalysisOptions
): Promise<{
  bazi1Result: StrengthAnalysisResult;
  bazi2Result: StrengthAnalysisResult;
  comparison: {
    dayMasterStrengthComparison: string;
    balanceComparison: string;
    elementDistributionComparison: string;
    overallComparison: string;
  };
}> {
  const analyzer = new StrengthAnalyzer();
  const [result1, result2] = await Promise.all([
    analyzer.analyze(bazi1, options),
    analyzer.analyze(bazi2, options)
  ]);

  const comparison = {
    dayMasterStrengthComparison: `八字1日主${result1.dayMaster.strength}，八字2日主${result2.dayMaster.strength}`,
    balanceComparison: `八字1平衡度${result1.balance.level}(${result1.balance.score.toFixed(1)})，八字2平衡度${result2.balance.level}(${result2.balance.score.toFixed(1)})`,
    elementDistributionComparison: `八字1最强${result1.strongest}最弱${result1.weakest}，八字2最强${result2.strongest}最弱${result2.weakest}`,
    overallComparison: result1.balance.score > result2.balance.score ? '八字1整体更平衡' : 
                      result1.balance.score < result2.balance.score ? '八字2整体更平衡' : '两个八字平衡度相近'
  };

  return {
    bazi1Result: result1,
    bazi2Result: result2,
    comparison
  };
}

// 版本信息
export const STRENGTH_ANALYSIS_VERSION = '2.0.0-modular';

/**
 * 获取模块信息
 */
export function getStrengthAnalysisInfo() {
  return {
    version: STRENGTH_ANALYSIS_VERSION,
    description: '八字旺衰分析模块 - 模块化重构版本',
    features: [
      '基础得分计算（天干+地支藏干）',
      '季节影响分析（当令休囚）',
      '生克关系分析（相生相克）',
      '合会关系分析（三合六合三会）',
      '冲突关系分析（刑冲害破穿绝）',
      '透干分析（天干透出加分）',
      '日主强弱判断',
      '平衡度评估',
      'AI友好数据输出',
      '高精度计算选项',
      '缓存支持'
    ],
    algorithms: [
      '100分制综合评分系统',
      '季节五行强弱表',
      '地支藏干权重计算',
      '合局冲突优先级算法',
      '透干质量评估',
      '平衡度标准差计算'
    ]
  };
}
