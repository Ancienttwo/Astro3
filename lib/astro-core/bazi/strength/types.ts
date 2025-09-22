/**
 * 旺衰分析模块 - 类型定义
 * 基于现有 wuxingScoring.ts 算法的模块化重构
 */

// 五行类型
export type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 五行评分
export interface WuxingScores {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

// 评分详细分解
export interface ScoreBreakdown {
  basic: number;        // 基础分（天干+地支藏干）
  shengke: number;      // 生克关系分
  combination: number;  // 合会加分（三合、六合、三会）
  conflict: number;     // 刑冲减分（冲、刑、害、破、穿、绝）
  transparency: number; // 透干加成
  seasonal: number;     // 季节加权
  total: number;        // 最终总分
}

// 完整的五行评分详情
export interface DetailedWuxingScores {
  wood: ScoreBreakdown;
  fire: ScoreBreakdown;
  earth: ScoreBreakdown;
  metal: ScoreBreakdown;
  water: ScoreBreakdown;
}

// 季节影响分析
export interface SeasonalInfluence {
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter' | 'earth';
  seasonalStrengths: WuxingScores;
  exemptElements: WuxingElement[]; // 免受季节影响的五行（成势）
  description: string;
}

// 关系影响分析
export interface RelationshipInfluence {
  shengRelationships: Array<{
    from: WuxingElement;
    to: WuxingElement;
    strength: number;
    description: string;
  }>;
  keRelationships: Array<{
    from: WuxingElement;
    to: WuxingElement;
    strength: number;
    description: string;
  }>;
  netInfluence: WuxingScores;
}

// 合会关系分析
export interface CombinationInfluence {
  sanhui: Array<{
    branches: string[];
    element: WuxingElement;
    score: number;
    isComplete: boolean;
  }>;
  sanhe: Array<{
    branches: string[];
    element: WuxingElement;
    score: number;
    isComplete: boolean;
  }>;
  liuhe: Array<{
    branches: string[];
    mergedElement: WuxingElement;
    score: number;
    isComplete: boolean;
  }>;
  totalBonus: WuxingScores;
}

// 冲突关系分析
export interface ConflictInfluence {
  chong: Array<{
    pair: string[];
    affectedElements: WuxingElement[];
    severity: number;
    description: string;
  }>;
  xing: Array<{
    group: string[];
    affectedElements: WuxingElement[];
    severity: number;
    description: string;
  }>;
  hai: Array<{
    pair: string[];
    affectedElements: WuxingElement[];
    severity: number;
    description: string;
  }>;
  totalPenalty: WuxingScores;
}

// 透干分析
export interface TransparencyInfluence {
  transparentStems: Array<{
    stem: string;
    element: WuxingElement;
    supportType: 'benqi' | 'zhongqi' | 'yuqi'; // 本气、中气、余气
    bonus: number;
    description: string;
  }>;
  totalBonus: WuxingScores;
}

// 日主强弱分析
export interface DayMasterAnalysis {
  element: WuxingElement;
  strength: 'strong' | 'weak' | 'balanced';
  score: number;
  percentage: number;
  supportingFactors: string[];
  weakenFactors: string[];
  recommendation: string;
}

// 分析选项
export interface StrengthAnalysisOptions {
  includeDetails?: boolean;      // 是否包含详细评分分解
  seasonalMode?: 'traditional' | 'modern'; // 季节分析模式
  precisionLevel?: 'standard' | 'high';    // 精度等级
  customWeights?: Partial<ScoreWeights>;   // 自定义权重
  enableCaching?: boolean;       // 是否启用缓存
}

// 权重配置
export interface ScoreWeights {
  basic: number;
  shengke: number;
  combination: number;
  conflict: number;
  transparency: number;
  seasonal: number;
}

// 完整的旺衰分析结果
export interface StrengthAnalysisResult {
  // 基础评分结果
  scores: WuxingScores;
  percentages: WuxingScores;
  
  // 日主分析
  dayMaster: DayMasterAnalysis;
  
  // 五行排序
  strongest: WuxingElement;
  weakest: WuxingElement;
  elementRanking: Array<{
    element: WuxingElement;
    score: number;
    rank: number;
  }>;
  
  // 平衡度分析
  balance: {
    score: number; // 0-100，100表示完全平衡
    level: 'excellent' | 'good' | 'fair' | 'poor';
    description: string;
  };
  
  // 详细分析（可选）
  details?: {
    breakdown: DetailedWuxingScores;
    seasonalInfluence: SeasonalInfluence;
    relationshipInfluence: RelationshipInfluence;
    combinationInfluence: CombinationInfluence;
    conflictInfluence: ConflictInfluence;
    transparencyInfluence: TransparencyInfluence;
  };
  
  // 分析摘要
  summary: {
    keyInsights: string[];
    strengths: string[];
    challenges: string[];
    recommendations: string[];
  };
  
  // AI 友好格式
  aiSummary: {
    conciseDescription: string;    // 简洁描述
    strengthPattern: string;       // 旺衰模式
    criticalFactors: string[];     // 关键因素
    lifeGuidance: string[];        // 人生指导
  };
  
  // 计算元数据
  metadata: {
    calculationTime: number;
    algorithVersion: string;
    options: StrengthAnalysisOptions;
    cacheHit?: boolean;
  };
}

// 分析器接口
export interface IStrengthAnalyzer {
  analyze(bazi: string[], options?: StrengthAnalysisOptions): Promise<StrengthAnalysisResult>;
}

export interface IBasicScoreCalculator {
  calculate(bazi: string[]): Promise<{ scores: DetailedWuxingScores; counts: WuxingCounts }>;
}

export interface ISeasonalAnalyzer {
  analyze(monthBranch: string, scores: DetailedWuxingScores, counts: WuxingCounts): Promise<SeasonalInfluence>;
}

export interface IRelationshipAnalyzer {
  analyze(bazi: string[], season: string): Promise<RelationshipInfluence>;
}

export interface ICombinationAnalyzer {
  analyze(branches: string[], season: string): Promise<CombinationInfluence>;
}

export interface IConflictAnalyzer {
  analyze(branches: string[], season: string): Promise<ConflictInfluence>;
}

export interface ITransparencyAnalyzer {
  analyze(stems: string[], branches: string[]): Promise<TransparencyInfluence>;
}

// 辅助类型
export interface WuxingCounts {
  tianganCount: WuxingScores;
  cangganCount: WuxingScores;
  benqiCount: WuxingScores;
  totalCount: WuxingScores;
}

// 常量映射类型
export type SeasonType = 'spring' | 'summer' | 'autumn' | 'winter' | 'earth';
export type TransparencyType = 'benqi' | 'zhongqi' | 'yuqi';
export type StrengthLevel = 'strong' | 'weak' | 'balanced';
export type BalanceLevel = 'excellent' | 'good' | 'fair' | 'poor';

// 错误类型
export class StrengthAnalysisError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'StrengthAnalysisError';
  }
}

// 缓存相关
export interface AnalysisCacheKey {
  bazi: string;
  options: string;
}

export interface AnalysisCacheEntry {
  key: AnalysisCacheKey;
  result: StrengthAnalysisResult;
  timestamp: number;
  hits: number;
}