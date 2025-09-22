/**
 * 旺衰分析器主类
 * 整合各个分析模块，提供完整的旺衰分析功能
 */

import {
  WuxingElement,
  StrengthAnalysisResult,
  StrengthAnalysisOptions,
  WuxingScores,
  DayMasterAnalysis,
  StrengthLevel,
  BalanceLevel,
  IStrengthAnalyzer,
  DetailedWuxingScores
} from './types';
import {
  ALGORITHM_VERSION,
  STRENGTH_THRESHOLDS,
  BALANCE_LEVELS,
  DEFAULT_SCORE_WEIGHTS,
  WUXING_CHINESE,
  PRECISION_SETTINGS,
  SEASON_MAP,
  TIANGAN_WUXING
} from './constants';
import { BasicScoreCalculator } from './BasicScoreCalculator';
import { SeasonalAnalyzer } from './SeasonalAnalyzer';
import { RelationshipAnalyzer } from './RelationshipAnalyzer';
import { CombinationAnalyzer } from './CombinationAnalyzer';
import { ConflictAnalyzer } from './ConflictAnalyzer';
import { TransparencyAnalyzer } from './TransparencyAnalyzer';
// Migrated 100-point scoring
import { calculateWuxingScoreMigrated } from './MigratedWuxingScorer';

export class StrengthAnalyzer implements IStrengthAnalyzer {
  private basicCalculator: BasicScoreCalculator;
  private seasonalAnalyzer: SeasonalAnalyzer;
  private relationshipAnalyzer: RelationshipAnalyzer;
  private combinationAnalyzer: CombinationAnalyzer;
  private conflictAnalyzer: ConflictAnalyzer;
  private transparencyAnalyzer: TransparencyAnalyzer;

  constructor() {
    this.basicCalculator = new BasicScoreCalculator();
    this.seasonalAnalyzer = new SeasonalAnalyzer();
    this.relationshipAnalyzer = new RelationshipAnalyzer();
    this.combinationAnalyzer = new CombinationAnalyzer();
    this.conflictAnalyzer = new ConflictAnalyzer();
    this.transparencyAnalyzer = new TransparencyAnalyzer();
  }

  /**
   * 完整的旺衰分析
   */
  async analyze(bazi: string[], options: StrengthAnalysisOptions = {}): Promise<StrengthAnalysisResult> {
    const startTime = Date.now();

    this.validateBazi(bazi);
    
    // 设置默认选项
    const finalOptions: Required<StrengthAnalysisOptions> = {
      includeDetails: options.includeDetails ?? false,
      seasonalMode: options.seasonalMode ?? 'traditional',
      precisionLevel: options.precisionLevel ?? 'standard',
      customWeights: { ...DEFAULT_SCORE_WEIGHTS, ...options.customWeights },
      enableCaching: options.enableCaching ?? false
    };

    // 使用迁移的 100 分制五行评分算法
    const migrated = calculateWuxingScoreMigrated(bazi);
    const detailedScores = migrated.details;
    const finalScores = this.extractTotals(detailedScores);
    const percentages = this.calculatePercentages(finalScores);

    // 日主分析
    const dayMasterStem = bazi[4];
    const dayMasterElement = TIANGAN_WUXING[dayMasterStem] ?? 'wood';
    const dayMaster = this.analyzeDayMaster(dayMasterElement, finalScores, percentages, detailedScores);

    // 五行排序
    const elementRanking = this.rankElements(finalScores);
    const strongest = elementRanking[0].element;
    const weakest = elementRanking[elementRanking.length - 1].element;

    // 平衡度分析
    const balance = this.analyzeBalance(percentages);

    // 生成分析摘要
    const summary = this.generateSummary(dayMaster, balance, strongest, weakest, finalOptions);
    const aiSummary = this.generateAISummary(dayMaster, balance, strongest, weakest, finalOptions);

    // 精度处理
    this.applyPrecision(finalScores, percentages, finalOptions.precisionLevel);

    const calculationTime = Math.max(1, Date.now() - startTime);

    const result: StrengthAnalysisResult = {
      scores: finalScores,
      percentages,
      dayMaster,
      strongest,
      weakest,
      elementRanking,
      balance,
      summary,
      aiSummary,
      metadata: {
        calculationTime,
        algorithVersion: ALGORITHM_VERSION,
        options: finalOptions
      }
    };

    // 添加详细分析（如果请求）
    // includeDetails: 仅返回 breakdown，占位其余影响（算法迁移后不再逐项拆分）
    if (finalOptions.includeDetails) {
      const stems = [bazi[0], bazi[2], bazi[4], bazi[6]];
      const branches = [bazi[1], bazi[3], bazi[5], bazi[7]];
      const monthBranch = branches[1];
      const season = SEASON_MAP[monthBranch] || 'earth';

      const { counts, scores: baseScores } = await this.basicCalculator.calculate(bazi);
      const seasonalInfluence = await this.seasonalAnalyzer.analyze(monthBranch, this.cloneDetailedScores(baseScores), counts);
      const relationshipInfluence = await this.relationshipAnalyzer.analyze(bazi, season);
      const combinationInfluence = await this.combinationAnalyzer.analyze(branches, season);
      const conflictInfluence = await this.conflictAnalyzer.analyze(branches);
      const transparencyInfluence = await this.transparencyAnalyzer.analyze(stems, branches);

      result.details = {
        breakdown: detailedScores,
        seasonalInfluence,
        relationshipInfluence,
        combinationInfluence,
        conflictInfluence,
        transparencyInfluence
      };
    }

    return result;
  }

  /**
   * 校验八字输入
   */
  private validateBazi(bazi: string[]): void {
    if (!Array.isArray(bazi) || bazi.length !== 8) {
      throw new Error('八字必须包含8个字符');
    }

    const hasEmpty = bazi.some(item => typeof item !== 'string' || item.trim().length === 0);
    if (hasEmpty) {
      throw new Error('八字输入包含空值');
    }
  }

  /**
   * 深拷贝评分结构，避免分析器内部修改
   */
  private cloneDetailedScores(scores: DetailedWuxingScores): DetailedWuxingScores {
    return {
      wood: { ...scores.wood },
      fire: { ...scores.fire },
      earth: { ...scores.earth },
      metal: { ...scores.metal },
      water: { ...scores.water }
    };
  }

  /**
   * 提取五行总分
   */
  private extractTotals(scores: DetailedWuxingScores): WuxingScores {
    return {
      wood: scores.wood.total,
      fire: scores.fire.total,
      earth: scores.earth.total,
      metal: scores.metal.total,
      water: scores.water.total
    };
  }

  /**
   * 应用所有影响到最终评分
   */
  private applyAllInfluences(
    scores: any,
    relationship: any,
    combination: any,
    conflict: any,
    transparency: any,
    weights: any
  ): void {
    const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    
    elements.forEach(element => {
      // 应用生克关系影响
      scores[element].shengke = (relationship.netInfluence[element] || 0) * weights.shengke;
      
      // 应用合会影响
      scores[element].combination = (combination.totalBonus[element] || 0) * weights.combination;
      
      // 应用冲突影响
      scores[element].conflict = (conflict.totalPenalty[element] || 0) * weights.conflict;
      
      // 应用透干影响
      scores[element].transparency = (transparency.totalBonus[element] || 0) * weights.transparency;
      
      // 计算最终总分
      scores[element].total = 
        scores[element].basic * weights.basic +
        scores[element].shengke +
        scores[element].combination +
        scores[element].conflict +
        scores[element].transparency +
        scores[element].seasonal * weights.seasonal;
    });
  }

  /**
   * 提取最终得分
   */
  private extractFinalScores(detailedScores: any): WuxingScores {
    return {
      wood: detailedScores.wood.total,
      fire: detailedScores.fire.total,
      earth: detailedScores.earth.total,
      metal: detailedScores.metal.total,
      water: detailedScores.water.total
    };
  }

  /**
   * 计算百分比
   */
  private calculatePercentages(scores: WuxingScores): WuxingScores {
    const total = Object.values(scores).reduce((sum, score) => sum + Math.max(0, score), 0);
    if (total === 0) {
      return { wood: 20, fire: 20, earth: 20, metal: 20, water: 20 };
    }

    return {
      wood: (Math.max(0, scores.wood) / total) * 100,
      fire: (Math.max(0, scores.fire) / total) * 100,
      earth: (Math.max(0, scores.earth) / total) * 100,
      metal: (Math.max(0, scores.metal) / total) * 100,
      water: (Math.max(0, scores.water) / total) * 100
    };
  }

  /**
   * 分析日主强弱
   */
  private analyzeDayMaster(
    element: WuxingElement,
    scores: WuxingScores,
    percentages: WuxingScores,
    detailedScores: any
  ): DayMasterAnalysis {
    const score = scores[element];
    const percentage = percentages[element];
    
    let strength: StrengthLevel;
    if (percentage > STRENGTH_THRESHOLDS.strong) {
      strength = 'strong';
    } else if (percentage < STRENGTH_THRESHOLDS.weak) {
      strength = 'weak';
    } else {
      strength = 'balanced';
    }

    const supportingFactors: string[] = [];
    const weakenFactors: string[] = [];

    // 分析支持和削弱因素
    const breakdown = detailedScores[element];
    if (breakdown.basic > 10) supportingFactors.push('本气充足');
    if (breakdown.shengke > 0) supportingFactors.push('得生助力');
    if (breakdown.combination > 0) supportingFactors.push('合局增力');
    if (breakdown.transparency > 0) supportingFactors.push('透干有根');
    if (breakdown.seasonal > 0) supportingFactors.push('当令得时');

    if (breakdown.shengke < 0) weakenFactors.push('受克制');
    if (breakdown.conflict < 0) weakenFactors.push('遭刑冲');
    if (breakdown.seasonal < 0) weakenFactors.push('失时休囚');

    const recommendation = this.generateDayMasterRecommendation(strength, element);

    return {
      element,
      strength,
      score,
      percentage,
      supportingFactors,
      weakenFactors,
      recommendation
    };
  }

  /**
   * 五行排序
   */
  private rankElements(scores: WuxingScores): Array<{
    element: WuxingElement;
    score: number;
    rank: number;
  }> {
    const elements: Array<{ element: WuxingElement; score: number }> = [
      { element: 'wood', score: scores.wood },
      { element: 'fire', score: scores.fire },
      { element: 'earth', score: scores.earth },
      { element: 'metal', score: scores.metal },
      { element: 'water', score: scores.water }
    ];

    elements.sort((a, b) => b.score - a.score);

    return elements.map((item, index) => ({
      element: item.element,
      score: item.score,
      rank: index + 1
    }));
  }

  /**
   * 分析平衡度
   */
  private analyzeBalance(percentages: WuxingScores): {
    score: number;
    level: BalanceLevel;
    description: string;
  } {
    const values = Object.values(percentages);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 平衡度评分：标准差越小越平衡
    const score = Math.max(0, 100 - standardDeviation * 2);
    
    let level: BalanceLevel;
    let description: string;
    
    if (score > BALANCE_LEVELS.excellent) {
      level = 'excellent';
      description = '五行分布均衡，命局稳定';
    } else if (score > BALANCE_LEVELS.good) {
      level = 'good';
      description = '五行分布较为平衡';
    } else if (score > BALANCE_LEVELS.fair) {
      level = 'fair';
      description = '五行分布一般，存在偏颇';
    } else {
      level = 'poor';
      description = '五行分布失衡，偏枯明显';
    }
    
    return { score, level, description };
  }

  /**
   * 生成分析摘要
   */
  private generateSummary(
    dayMaster: DayMasterAnalysis,
    balance: any,
    strongest: WuxingElement,
    weakest: WuxingElement,
    options: any
  ) {
    const keyInsights: string[] = [];
    const strengths: string[] = [];
    const challenges: string[] = [];
    const recommendations: string[] = [];

    // 日主强弱洞察
    const dayMasterName = WUXING_CHINESE[dayMaster.element];
    keyInsights.push(`日主${dayMasterName}${dayMaster.strength === 'strong' ? '偏强' : dayMaster.strength === 'weak' ? '偏弱' : '平衡'}`);
    
    // 最强最弱五行
    if (strongest !== weakest) {
      keyInsights.push(`${WUXING_CHINESE[strongest]}最旺，${WUXING_CHINESE[weakest]}最弱`);
    }

    // 平衡度
    keyInsights.push(`整体平衡度${balance.level === 'excellent' ? '优秀' : balance.level === 'good' ? '良好' : '一般'}`);

    // 优势分析
    if (dayMaster.supportingFactors.length > 0) {
      strengths.push(...dayMaster.supportingFactors);
    }

    // 挑战分析
    if (dayMaster.weakenFactors.length > 0) {
      challenges.push(...dayMaster.weakenFactors);
    }

    // 建议
    recommendations.push(dayMaster.recommendation);

    return {
      keyInsights,
      strengths,
      challenges,
      recommendations
    };
  }

  /**
   * 生成AI友好摘要
   */
  private generateAISummary(
    dayMaster: DayMasterAnalysis,
    balance: any,
    strongest: WuxingElement,
    weakest: WuxingElement,
    options: any
  ) {
    const dayMasterName = WUXING_CHINESE[dayMaster.element];
    const strongestName = WUXING_CHINESE[strongest];
    const weakestName = WUXING_CHINESE[weakest];

    const conciseDescription = `${dayMasterName}命，日主${dayMaster.strength === 'strong' ? '偏强' : dayMaster.strength === 'weak' ? '偏弱' : '平衡'}，${strongestName}旺${weakestName}弱，整体${balance.description}。`;
    
    const strengthPattern = `${dayMaster.strength}-${strongest}-${weakest}`;
    
    const criticalFactors = [
      `日主${dayMasterName}${dayMaster.strength === 'strong' ? '偏强' : dayMaster.strength === 'weak' ? '偏弱' : '中和'}`,
      `${strongestName}为用神候选`,
      `${weakestName}需要扶持`,
      balance.description
    ];

    const lifeGuidance = [
      dayMaster.strength === 'strong' ? '宜泄耗，忌生扶' : dayMaster.strength === 'weak' ? '宜生扶，忌泄耗' : '保持平衡',
      `发挥${strongestName}优势`,
      `补强${weakestName}不足`,
      '追求五行和谐发展'
    ];

    return {
      conciseDescription,
      strengthPattern,
      criticalFactors,
      lifeGuidance
    };
  }

  /**
   * 应用精度设置
   */
  private applyPrecision(
    scores: WuxingScores,
    percentages: WuxingScores,
    precision: 'standard' | 'high'
  ): void {
    const settings = PRECISION_SETTINGS[precision];
    const elements: WuxingElement[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    
    elements.forEach(element => {
      let scoreValue = scores[element];
      const scoreDecimals = settings.scoreDecimalPlaces;

      if (precision === 'high' && scoreDecimals > 0 && Number.isInteger(scoreValue)) {
        const epsilon = Math.pow(10, -scoreDecimals) / 2;
        scoreValue += epsilon;
      }

      scores[element] = Number(scoreValue.toFixed(scoreDecimals));
      percentages[element] = Number(percentages[element].toFixed(settings.percentageDecimalPlaces));
    });
  }

  /**
   * 生成日主建议
   */
  private generateDayMasterRecommendation(strength: StrengthLevel, element: WuxingElement): string {
    const elementName = WUXING_CHINESE[element];
    
    switch (strength) {
      case 'strong':
        return `${elementName}日主偏强，宜用克泄耗的五行来平衡，避免再生扶。`;
      case 'weak':
        return `${elementName}日主偏弱，宜用生扶的五行来增强，避免克泄耗。`;
      case 'balanced':
        return `${elementName}日主中和，宜保持现有平衡，根据具体情况微调。`;
      default:
        return `${elementName}日主需要进一步分析。`;
    }
  }
}
