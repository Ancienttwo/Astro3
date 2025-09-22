/**
 * 旺衰分析模块 - 常量数据
 * 从 wuxingScoring.ts 提取的数据表和常量
 */

import { WuxingElement, SeasonType, WuxingScores } from './types';

// 月支季节映射
export const SEASON_MAP: Record<string, SeasonType> = {
  '寅': 'spring', '卯': 'spring',
  '巳': 'summer', '午': 'summer', 
  '申': 'autumn', '酉': 'autumn',
  '亥': 'winter', '子': 'winter',
  '辰': 'earth', '未': 'earth', '戌': 'earth', '丑': 'earth'
};

// 地支藏干表 - 完整版
export const DIZHI_CANGGAN: Record<string, Record<string, { element: WuxingElement; weight: number }>> = {
  '子': { '癸': { element: 'water', weight: 1.0 } },
  '丑': { '己': { element: 'earth', weight: 1.0 }, '癸': { element: 'water', weight: 0.3 }, '辛': { element: 'metal', weight: 0.5 } },
  '寅': { '甲': { element: 'wood', weight: 1.0 }, '丙': { element: 'fire', weight: 0.5 }, '戊': { element: 'earth', weight: 0.3 } },
  '卯': { '乙': { element: 'wood', weight: 1.0 } },
  '辰': { '戊': { element: 'earth', weight: 1.0 }, '乙': { element: 'wood', weight: 0.3 }, '癸': { element: 'water', weight: 0.5 } },
  '巳': { '丙': { element: 'fire', weight: 1.0 }, '戊': { element: 'earth', weight: 0.5 }, '庚': { element: 'metal', weight: 0.3 } },
  '午': { '丁': { element: 'fire', weight: 1.0 }, '己': { element: 'earth', weight: 0.3 } },
  '未': { '己': { element: 'earth', weight: 1.0 }, '丁': { element: 'fire', weight: 0.3 }, '乙': { element: 'wood', weight: 0.5 } },
  '申': { '庚': { element: 'metal', weight: 1.0 }, '壬': { element: 'water', weight: 0.5 }, '戊': { element: 'earth', weight: 0.3 } },
  '酉': { '辛': { element: 'metal', weight: 1.0 } },
  '戌': { '戊': { element: 'earth', weight: 1.0 }, '辛': { element: 'metal', weight: 0.3 }, '丁': { element: 'fire', weight: 0.5 } },
  '亥': { '壬': { element: 'water', weight: 1.0 }, '甲': { element: 'wood', weight: 0.3 } }
};

// 天干五行映射
export const TIANGAN_WUXING: Record<string, WuxingElement> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

// 五行相生关系
export const WUXING_SHENG: Record<WuxingElement, WuxingElement> = {
  wood: 'fire',
  fire: 'earth', 
  earth: 'metal',
  metal: 'water',
  water: 'wood'
};

// 五行相克关系
export const WUXING_KE: Record<WuxingElement, WuxingElement> = {
  wood: 'earth',
  fire: 'metal',
  earth: 'water',
  metal: 'wood',
  water: 'fire'
};

// 季节五行强弱表
export const SEASONAL_STRENGTH: Record<SeasonType, WuxingScores> = {
  spring: { wood: 1.0, fire: 0.7, earth: 0.3, metal: 0.2, water: 0.5 },
  summer: { wood: 0.5, fire: 1.0, earth: 0.7, metal: 0.3, water: 0.2 },
  autumn: { wood: 0.2, fire: 0.3, earth: 0.5, metal: 1.0, water: 0.7 },
  winter: { wood: 0.3, fire: 0.2, earth: 0.3, metal: 0.5, water: 1.0 },
  earth: { wood: 0.3, fire: 0.5, earth: 1.0, metal: 0.7, water: 0.3 }
};

// 地支三合、三会、六合表
export const DIZHI_COMBINATIONS = {
  sanhui: [
    { branches: ['寅', '卯', '辰'], element: 'wood' as WuxingElement, score: 4 },
    { branches: ['巳', '午', '未'], element: 'fire' as WuxingElement, score: 4 },
    { branches: ['申', '酉', '戌'], element: 'metal' as WuxingElement, score: 4 },
    { branches: ['亥', '子', '丑'], element: 'water' as WuxingElement, score: 4 }
  ],
  sanhe: [
    { branches: ['申', '子', '辰'], element: 'water' as WuxingElement, score: 3 },
    { branches: ['亥', '卯', '未'], element: 'wood' as WuxingElement, score: 3 },
    { branches: ['寅', '午', '戌'], element: 'fire' as WuxingElement, score: 3 },
    { branches: ['巳', '酉', '丑'], element: 'metal' as WuxingElement, score: 3 }
  ],
  liuhe: [
    { branches: ['子', '丑'], mergedElement: 'earth' as WuxingElement, score: 2 },
    { branches: ['寅', '亥'], mergedElement: 'wood' as WuxingElement, score: 2 },
    { branches: ['卯', '戌'], mergedElement: 'fire' as WuxingElement, score: 2 },
    { branches: ['辰', '酉'], mergedElement: 'metal' as WuxingElement, score: 2 },
    { branches: ['巳', '申'], mergedElement: 'water' as WuxingElement, score: 2 },
    { branches: ['午', '未'], mergedElement: 'fire' as WuxingElement, score: 2 }
  ]
};

// 地支刑冲害破穿绝表
export const DIZHI_CONFLICTS = {
  chong: [
    { pair: ['子', '午'], score: -3 },
    { pair: ['丑', '未'], score: -3 },
    { pair: ['寅', '申'], score: -3 },
    { pair: ['卯', '酉'], score: -3 },
    { pair: ['辰', '戌'], score: -3 },
    { pair: ['巳', '亥'], score: -3 }
  ],
  xing: [
    { group: ['寅', '巳', '申'], score: -2 },
    { group: ['丑', '未', '戌'], score: -2 },
    { pair: ['子', '卯'], score: -2 }
  ],
  po: [
    { pair: ['子', '酉'], score: -0.5 },
    { pair: ['卯', '午'], score: -0.5 },
    { pair: ['辰', '丑'], score: -0.5 },
    { pair: ['未', '戌'], score: -0.5 },
    { pair: ['寅', '亥'], score: -0.5 },
    { pair: ['巳', '申'], score: -0.5 }
  ],
  chuan: [
    { pair: ['寅', '巳'], score: -1.5 },
    { pair: ['申', '亥'], score: -1.5 },
    { pair: ['丑', '午'], score: -1.5 },
    { pair: ['子', '未'], score: -1.5 },
    { pair: ['卯', '辰'], score: -1.5 },
    { pair: ['酉', '戌'], score: -1.5 }
  ],
  jue: [
    { pair: ['寅', '酉'], score: -2.5 },
    { pair: ['卯', '申'], score: -2.5 },
    { pair: ['午', '亥'], score: -2.5 },
    { pair: ['子', '巳'], score: -2.5 }
  ]
};

// 默认权重配置
export const DEFAULT_SCORE_WEIGHTS = {
  basic: 1.0,
  shengke: 1.0,
  combination: 1.0,
  conflict: 1.0,
  transparency: 1.0,
  seasonal: 1.0
};

// 强弱判断阈值
export const STRENGTH_THRESHOLDS = {
  strong: 35,      // 日主占比 > 35% 为身强
  weak: 20,        // 日主占比 < 20% 为身弱
  veryStrong: 50,  // 日主占比 > 50% 为过强
  veryWeak: 10     // 日主占比 < 10% 为过弱
};

// 平衡度评级
export const BALANCE_LEVELS = {
  excellent: 80,   // 平衡度 > 80 为优秀
  good: 60,        // 平衡度 > 60 为良好
  fair: 40,        // 平衡度 > 40 为一般
  poor: 0          // 平衡度 <= 40 为较差
};

// 五行中文名称映射
export const WUXING_CHINESE: Record<WuxingElement, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水'
};

// 五行英文名称映射
export const WUXING_ENGLISH: Record<WuxingElement, string> = {
  wood: 'Wood',
  fire: 'Fire',
  earth: 'Earth',
  metal: 'Metal',
  water: 'Water'
};

// 季节中文名称映射
export const SEASON_CHINESE: Record<SeasonType, string> = {
  spring: '春季',
  summer: '夏季',
  autumn: '秋季',
  winter: '冬季',
  earth: '土季'
};

// 透干类型中文描述
export const TRANSPARENCY_CHINESE = {
  benqi: '本气透出',
  zhongqi: '中气透出', 
  yuqi: '余气透出'
};

// 算法版本
export const ALGORITHM_VERSION = '2.0.0-modular';

// 缓存设置
export const CACHE_SETTINGS = {
  maxEntries: 1000,
  ttlMinutes: 60,
  cleanupIntervalMinutes: 10
};

// 计算精度设置
export const PRECISION_SETTINGS = {
  standard: {
    scoreDecimalPlaces: 1,
    percentageDecimalPlaces: 1
  },
  high: {
    scoreDecimalPlaces: 2,
    percentageDecimalPlaces: 2
  }
};

// 特殊处理标记
export const SPECIAL_CASES = {
  // 未月土基数特殊处理标记
  weiMonthEarthReduction: 0.8,
  
  // 土五行权重调整标记
  earthWeightSwap: true,
  
  // 天干无根减分比例
  noRootPenalty: 0.5,
  
  // 地支坐克减分比例
  sittingClashPenalty: 0.5
};