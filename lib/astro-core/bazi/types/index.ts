/**
 * @astroall/bazi-core Types - 八字核心类型定义
 * 
 * @ai-context BAZI_CORE_TYPES
 * @purpose 提供统一的八字计算类型定义
 * @pattern 参考 ziwei-core 设计模式
 * @version 1.0.0
 * @created 2025-01-05
 */

// 基础类型定义
export type StemName = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
export type BranchName = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
export type ElementName = '木' | '火' | '土' | '金' | '水';
export type YinYangType = '阴' | '阳';
export type GenderType = 'male' | 'female';

// 地支特殊属性类型
export type SpecialBranchAttribute = '桃花' | '驿马' | '金墓库' | '木墓库' | '水墓库' | '火墓库' | '羊刃' | '帝旺';

// 🆕 神煞分类系统
export type ShenShaCategory = 
  | 'love_romance'      // 感情桃花类
  | 'wealth_fortune'    // 财运福气类
  | 'career_power'      // 事业权力类
  | 'health_longevity'  // 健康长寿类
  | 'learning_wisdom'   // 学业智慧类
  | 'travel_movement'   // 出行变动类
  | 'disaster_calamity' // 灾难凶煞类
  | 'protection_noble'; // 贵人保护类

// 🆕 完整神煞名称定义
export type ShenShaName = 
  // 感情桃花类
  | '桃花' | '红鸾' | '天喜' | '咸池' | '红艳' | '天姚' | '沐浴'
  // 财运福气类  
  | '禄神' | '食神' | '正财' | '偏财' | '天德' | '月德' | '天乙贵人'
  // 事业权力类
  | '正官' | '七杀' | '印绶' | '将星' | '华盖' | '权威' | '学堂'
  // 健康长寿类
  | '长生' | '帝旺' | '天医' | '福德' | '寿元' | '健康'
  // 学业智慧类
  | '文昌' | '学士' | '博士' | '词馆' | '金舆' | '学堂'
  // 出行变动类
  | '驿马' | '邮差' | '车骑' | '舟车' | '移徙'
  // 灾难凶煞类
  | '羊刃' | '飞刃' | '血刃' | '亡神' | '劫煞' | '灾煞' | '孤辰' | '寡宿'
  // 贵人保护类
  | '天乙贵人' | '太极贵人' | '天德贵人' | '月德贵人' | '福星贵人'
  // 极权神煞类
  | '魁罡';

// 🆕 魁罡类型定义
export type KuiGangType = '庚辰' | '壬辰' | '戊戌' | '庚戌';
export type KuiGangSubType = '绝夫罡' | '绝妻罡';

// 🆕 魁罡详细信息
export interface KuiGangInfo {
  type: KuiGangType; // 魁罡类型
  subType: KuiGangSubType; // 子类型
  pillarType: 'day' | 'year' | 'month' | 'hour'; // 所在柱位
  strength: 'primary' | 'secondary'; // 强度 (日柱为主，其他为次)
  isPositive: boolean; // 当前是否为吉 (需要根据整体格局判断)
  analysis: {
    hasBreakage: boolean; // 是否被财官破格
    hasClash: boolean; // 是否被刑冲
    supportCount: number; // 支撑因素数量 (身旺、叠见魁罡等)
    breakageFactors: string[]; // 破格因素列表
    supportFactors: string[]; // 支撑因素列表
  };
  description: string; // 详细描述
  effect: string; // 主要作用
  advice: string; // 趋吉避凶建议
}

// 🆕 神煞详细信息
export interface ShenShaInfo {
  name: ShenShaName;
  category: ShenShaCategory;
  isPositive: boolean; // 是否为吉神
  strength: 'strong' | 'medium' | 'weak'; // 力量强度
  description: string; // 详细描述
  effect: string; // 主要作用
  calculation: string; // 计算方法说明
}

// 🆕 数值索引系统 - 天干
export const STEM_INDEX_MAP: Record<StemName, number> = {
  '甲': 0, '乙': 1, '丙': 2, '丁': 3, '戊': 4,
  '己': 5, '庚': 6, '辛': 7, '壬': 8, '癸': 9
};

// 🆕 数值索引系统 - 地支  
export const BRANCH_INDEX_MAP: Record<BranchName, number> = {
  '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
  '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11
};

// 🆕 反向索引 - 数值到天干
export const INDEX_TO_STEM: Record<number, StemName> = {
  0: '甲', 1: '乙', 2: '丙', 3: '丁', 4: '戊',
  5: '己', 6: '庚', 7: '辛', 8: '壬', 9: '癸'
};

// 🆕 反向索引 - 数值到地支
export const INDEX_TO_BRANCH: Record<number, BranchName> = {
  0: '子', 1: '丑', 2: '寅', 3: '卯', 4: '辰', 5: '巳',
  6: '午', 7: '未', 8: '申', 9: '酉', 10: '戌', 11: '亥'
};

// 🆕 天干关系类型
export type StemRelationType = '相生' | '相克' | '合' | '无关系';
export type StemCombinationType = '甲己合' | '乙庚合' | '丙辛合' | '丁壬合' | '戊癸合';

// 🆕 地支关系类型  
export type BranchRelationType = '相生' | '相克' | '相冲' | '相刑' | '相穿' | '相破' | '相绝' | '三合' | '半合' | '六合' | '三会' | '无关系';
export type BranchCombinationType = 
  | '申子辰合' | '亥卯未合' | '寅午戌合' | '巳酉丑合' // 三合
  | '申子半合' | '子辰半合' | '亥卯半合' | '卯未半合' | '寅午半合' | '午戌半合' | '巳酉半合' | '酉丑半合' // 半合
  | '子丑合' | '寅亥合' | '卯戌合' | '辰酉合' | '巳申合' | '午未合' // 六合
  | '寅卯辰会' | '巳午未会' | '申酉戌会' | '亥子丑会'; // 三会

export type BranchClashType = '子午冲' | '丑未冲' | '寅申冲' | '卯酉冲' | '辰戌冲' | '巳亥冲';
export type BranchPunishmentType = '子卯刑' | '寅巳申刑' | '丑戌未刑' | '辰午酉亥刑';
export type BranchHarmType = '子未穿' | '丑午穿' | '寅巳穿' | '卯辰穿' | '申亥穿' | '酉戌穿';
export type BranchBreakType = '子酉破' | '午卯破' | '寅亥破' | '申巳破' | '辰丑破' | '戌未破';
export type BranchDestroyType = '子巳绝' | '卯申绝' | '午亥绝' | '酉寅绝' | '戌卯绝' | '丑午绝' | '辰酉绝' | '未子绝' | '亥卯绝' | '寅午绝' | '巳酉绝' | '申子绝';

// 禄神信息
export interface LuShen {
  stem: StemName; // 对应的天干
  branch: BranchName; // 禄所在的地支
  description: string; // 描述，如"甲禄在寅"
}

// 🆕 天干关系分析
export interface StemRelationship {
  stem1: StemName;
  stem2: StemName;
  relationType: StemRelationType;
  combinationType?: StemCombinationType;
  description: string;
  isPositive: boolean; // 是否为正面关系
  strength: 'strong' | 'medium' | 'weak'; // 关系强度
}

// 🆕 地支关系分析
export interface BranchRelationship {
  branch1: BranchName;
  branch2: BranchName;
  relationType: BranchRelationType;
  combinationType?: BranchCombinationType;
  clashType?: BranchClashType;
  punishmentType?: BranchPunishmentType;
  harmType?: BranchHarmType;
  breakType?: BranchBreakType;
  destroyType?: BranchDestroyType;
  description: string;
  isPositive: boolean; // 是否为正面关系
  strength: 'strong' | 'medium' | 'weak'; // 关系强度
  effect: string; // 对命运的影响描述
}

// 🆕 羊刃信息 (五阳干专用)
export interface YangBlade {
  stem: StemName; // 对应的阳干
  branch: BranchName; // 羊刃所在的地支
  description: string; // 描述，如"甲羊刃在卯"
}

// 🆕 帝旺信息 (五阴干专用)
export interface EmperorProsperity {
  stem: StemName; // 对应的阴干
  branch: BranchName; // 帝旺所在的地支
  description: string; // 描述，如"乙帝旺在午"
}

// 🆕 关系分析结果
export interface RelationshipAnalysis {
  // 天干关系分析
  stemRelationships: StemRelationship[]; // 所有天干之间的关系
  stemCombinations: StemRelationship[]; // 天干五合关系
  
  // 地支关系分析  
  branchRelationships: BranchRelationship[]; // 所有地支之间的关系
  branchCombinations: BranchRelationship[]; // 地支合会关系
  branchClashes: BranchRelationship[]; // 地支冲刑穿破绝关系
  
  // 关系统计
  positiveRelationships: number; // 正面关系数量
  negativeRelationships: number; // 负面关系数量
  neutralRelationships: number; // 中性关系数量
  
  // 关系强度
  strongRelationships: BranchRelationship[]; // 强关系列表
  
  // 整体评价
  overallHarmony: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'; // 整体和谐度
  relationshipScore: number; // 关系分数 (0-100)
  summary: string; // 关系分析总结
}

// 🆕 同柱暗合信息
export interface SamePillarHiddenCombination {
  stem: StemName; // 天干  
  hiddenStem: StemName; // 地支中的藏干
  combination: StemCombinationType; // 合化类型
  description: string; // 描述信息
}

// 天干地支对象
export interface StemBranchPair {
  stem: StemName;
  branch: BranchName;
  ganZhi: string; // 组合表示，如 "甲子"
  hiddenStems?: StemName[]; // 地支藏干
  primaryQi?: StemName; // 地支本气
  // 🆕 传统命理属性
  branchAttributes?: SpecialBranchAttribute[]; // 地支特殊属性（桃花、驿马、墓库、羊刃、帝旺等）
  isLuShen?: boolean; // 是否为该天干的禄神
  luShenInfo?: LuShen; // 禄神详细信息
  // 🆕 羊刃和帝旺信息
  isYangBlade?: boolean; // 是否为羊刃 (五阳干专用)
  yangBladeInfo?: YangBlade; // 羊刃详细信息
  isEmperorProsperity?: boolean; // 是否为帝旺 (五阴干专用)
  emperorProsperityInfo?: EmperorProsperity; // 帝旺详细信息
  // 🆕 暗合信息
  samePillarHiddenCombination?: SamePillarHiddenCombination; // 同柱暗合
  // 🆕 魁罡信息
  isKuiGang?: boolean; // 是否为魁罡
  kuiGangInfo?: KuiGangInfo; // 魁罡详细信息
}

// 四柱数据结构
export interface FourPillars {
  year: StemBranchPair;
  month: StemBranchPair;
  day: StemBranchPair;
  hour: StemBranchPair;
}

// 纳音数据
export interface NaYin {
  year: string;
  month: string;
  day: string;
  hour: string;
}

// 十神类型
export type TenGodType = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

// 十神简体类型
export type TenGodSimplified = '比' | '劫' | '食' | '伤' | '才' | '财' | '杀' | '官' | '枭' | '印';

// 十神分析结果
export interface TenGodAnalysis {
  yearPillar: TenGodType;
  monthPillar: TenGodType;
  dayPillar: TenGodType; // 日干为自己，通常为空或特殊标记
  hourPillar: TenGodType;
  // 简体字段
  yearPillarSimplified: TenGodSimplified;
  monthPillarSimplified: TenGodSimplified;
  dayPillarSimplified: TenGodSimplified;
  hourPillarSimplified: TenGodSimplified;
}

// 五行分析
export interface ElementAnalysis {
  elements: Record<ElementName, number>; // 五行个数统计
  strongest: ElementName; // 最强五行
  weakest: ElementName; // 最弱五行
  missing: ElementName[]; // 缺失五行
  excessive: ElementName[]; // 过旺五行
  balance: number; // 五行平衡度 (0-100)
}

// 八字强弱分析
export interface StrengthAnalysis {
  dayMasterStrength: 'strong' | 'medium' | 'weak'; // 日主强弱
  score: number; // 强弱分数 (-100 到 100)
  supportingElements: ElementName[]; // 有利五行
  conflictingElements: ElementName[]; // 不利五行
  recommendation: string; // 建议用神
}

// 大运数据
export interface MajorPeriod {
  ganZhi: string; // 干支组合
  startAge: number; // 开始年龄
  endAge: number; // 结束年龄
  startYear: number; // 开始年份
  endYear: number; // 结束年份
  stemElement: ElementName; // 天干五行
  branchElement: ElementName; // 地支五行
  elementDescription: string; // 五行组合描述，如"金土运"、"木火运"
}

// 流年数据
export interface FleetingYear {
  year: number; // 年份
  ganZhi: string; // 该年干支
  age: number; // 对应年龄
  element: ElementName; // 主导五行
  fortune: 'excellent' | 'good' | 'average' | 'poor' | 'terrible'; // 运势等级
}

// 完整的八字分析结果
export interface CompleteBaziAnalysis {
  // 基础信息
  birthInfo: {
    solarDate: Date;
    lunarDate?: {
      year: number;
      month: number;
      day: number;
      isLeapMonth: boolean;
    };
    hour: number;
    minute?: number;
    gender: GenderType;
    timezone?: string;
  };
  
  // 四柱八字
  fourPillars: FourPillars;
  naYin: NaYin;
  
  // 分析结果
  tenGodAnalysis: TenGodAnalysis;
  elementAnalysis: ElementAnalysis;
  strengthAnalysis: StrengthAnalysis;
  
  // 运程
  startingAge: number; // 🆕 起运年龄（童限计算结果）
  majorPeriods: MajorPeriod[];
  currentMajorPeriod?: MajorPeriod;
  fleetingYears: FleetingYear[];
  currentFleetingYear?: FleetingYear;
  
  // 神煞分析 (可选)
  shenShaAnalysis?: any; // 暂时使用 any，等待具体类型定义
  
  // 🆕 关系分析 (可选)
  relationshipAnalysis?: RelationshipAnalysis; // 天干地支关系分析
  
  // 时间戳和版本
  calculatedAt: number;
  version: string;
}

// 计算输入参数
export interface BaziCalculationInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: GenderType;
  isLunar?: boolean;
  isLeapMonth?: boolean;
  timezone?: string;
}

// 计算选项
export interface BaziCalculationOptions {
  // 计算范围
  includeTenGods?: boolean;
  includeElementAnalysis?: boolean;
  includeStrengthAnalysis?: boolean;
  includeMajorPeriods?: boolean;
  includeFleetingYears?: boolean;
  includeShenSha?: boolean; // 🆕 神煞计算选项
  includeHiddenStems?: boolean; // 🆕 藏干计算选项
  includeRelationshipAnalysis?: boolean; // 🆕 关系分析选项
  includeYangBladeEmperorProsperity?: boolean; // 🆕 羊刃帝旺计算选项
  
  // 运程计算范围
  majorPeriodCount?: number; // 大运个数，默认10个
  fleetingYearRange?: number; // 流年范围，默认前后10年
  
  // 计算精度
  precision?: 'basic' | 'standard' | 'detailed';
  
  // 缓存选项
  enableCache?: boolean;
  cacheKey?: string;
  
  // 调试选项
  debug?: boolean;
  includeCalculationSteps?: boolean;
}

// 错误类型定义
export class BaziCalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public input?: BaziCalculationInput
  ) {
    super(message);
    this.name = 'BaziCalculationError';
  }
}

// 验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 性能指标
export interface PerformanceMetrics {
  calculationTime: number; // 计算耗时 (ms)
  memoryUsage: number; // 内存使用 (KB)
  cacheHits: number; // 缓存命中次数
  algorithmsUsed: string[]; // 使用的算法列表
}

// 批量计算结果
export interface BatchCalculationResult {
  results: CompleteBaziAnalysis[];
  performance: PerformanceMetrics;
  errors: Array<{ index: number; error: BaziCalculationError }>;
}

// Types are already exported above with their definitions