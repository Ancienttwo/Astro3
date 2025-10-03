/**
 * Enhanced ZiWei DouShu Data Types
 * 紫微斗数增强数据类型定义
 * 
 * @ai-context ZIWEI_ENHANCED_TYPES
 * @preload Star, Palace, ZiweiChart interfaces
 * @algorithm-dependency ziwei-core
 */

// ==================== 输入数据类型 ====================

/**
 * 增强的输入格式 - 支持公历、农历、八字多种输入
 */
export interface EnhancedBirthInput {
  // 公历信息 (优先级最高)
  solar?: {
    year: number;
    month: number; // 1-12
    day: number;
    hour: number; // 0-23
  };
  
  // 农历信息
  lunar?: {
    yearStem: string; // 天干，如"甲"
    yearBranch: string; // 地支，如"辰"
    yearGanzhi: string; // 干支，如"甲辰"
    monthLunar: number; // 农历月 1-12
    dayLunar: number; // 农历日 1-30
    hourBranch: string; // 时辰，如"子"
    isLeapMonth?: boolean; // 是否闰月
  };
  
  // 八字信息 (最高级输入)
  bazi?: {
    year: string; // 年柱，如"甲辰"
    month: string; // 月柱，如"丙寅"
    day: string; // 日柱，如"壬午" 
    hour: string; // 时柱，如"庚子"
    startLuck: string; // 起运信息，如"3岁9个月"
    majorPeriods?: string[]; // 大运信息，如["癸亥", "甲子", "乙丑"]
  };
  
  // 基本信息
  gender: 'male' | 'female';
  timezone?: string; // 时区，默认"Asia/Shanghai"
  isLunar?: boolean; // 标记数据是否已为农历格式
}

// ==================== 星曜数据类型 ====================

/**
 * 星曜亮度等级
 */
export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '陷';

/**
 * 星曜类型
 */
export type StarType = 'main' | 'auxiliary' | 'minor';

/**
 * 四化类型
 */
export type SihuaType = '禄' | '权' | '科' | '忌';

/**
 * 增强的星曜对象 - 包含所有必要属性
 */
export interface EnhancedStar {
  name: string; // 星曜名称，如"紫微"
  brightness: StarBrightness; // 亮度
  type: StarType; // 星曜类型
  sihua?: SihuaType; // 四化状态（可选）
  
  // 扩展属性
  description?: string; // 星曜描述
  element?: '木' | '火' | '土' | '金' | '水'; // 五行属性
  gender?: '阳' | '阴'; // 阴阳属性
  category?: string; // 星曜类别，如"北斗", "南斗"
}

// ==================== 宫位数据类型 ====================

/**
 * 小限信息
 */
export interface MinorPeriod {
  age: number; // 年龄
  year: number; // 对应年份
  branch: string; // 地支
  stem: string; // 天干
}

/**
 * 大运信息（增强版）
 */
export interface MajorPeriod {
  period: number; // 第几个大运
  startAge: number; // 起始年龄
  endAge: number; // 结束年龄
  startYear: number; // 起始年份
  endYear: number; // 结束年份
  stem: string; // 大运天干
  branch: string; // 大运地支
  ganzhi: string; // 大运干支
}

/**
 * 增强的宫位对象
 */
export interface EnhancedPalace {
  // 基本信息
  branch: string; // 地支，如"子"
  branchIndex: number; // 地支索引 0-11
  stem: string; // 天干，如"甲"
  palaceName: string; // 宫位名称，如"命宫"
  
  // 特殊标记
  isLifePalace: boolean; // 是否命宫
  isBodyPalace: boolean; // 是否身宫
  isLaiyinPalace: boolean; // 是否来因宫
  
  // 星曜信息（合并后的统一格式）
  stars: EnhancedStar[]; // 所有星曜统一在一个数组中
  
  // 时间信息
  fleetingYears: number[]; // 流年岁数
  majorPeriod?: MajorPeriod; // 大运信息
  minorPeriods?: MinorPeriod[]; // 小限信息数组
  
  // 扩展属性
  palaceStrength?: number; // 宫位力量评分
  luckyScore?: number; // 吉凶评分
}

// ==================== 五行局类型 ====================

/**
 * 结构化的五行局
 */
export interface FiveElementsBureau {
  name: string; // 完整名称，如"水二局"
  element: '木' | '火' | '土' | '金' | '水'; // 五行
  bureau: number; // 局数 1-5
  description?: string; // 描述
}

// ==================== 完整输出类型 ====================

/**
 * 增强的紫微斗数星盘输出
 */
export interface EnhancedZiweiChart {
  // 基本年份信息
  yearStem: string; // 年干
  yearBranch: string; // 年支
  yearGanzhi: string; // 年干支
  
  // 结构化的五行局
  fiveElementsBureau: FiveElementsBureau;
  
  // 重要宫位信息
  lifePalace: {
    branch: string;
    branchIndex: number;
    palaceName: string;
  };
  
  bodyPalace: {
    branch: string;
    branchIndex: number;
    palaceName: string;
  };
  
  laiyinPalace: {
    branch: string;
    branchIndex: number;
    palaceName: string;
  };
  
  // 命主身主
  lifeMaster: string; // 命主星
  bodyMaster: string; // 身主星
  
  // 斗君
  douJun: {
    branch: string;
    branchIndex: number;
    age: number;
  };
  
  // 宫位数据（从对象改为数组，便于前端处理）
  palaces: EnhancedPalace[];
  
  // 原始输入信息（用于调试）
  originalInput: EnhancedBirthInput;
  
  // 计算元数据
  metadata: {
    calculationTime: Date;
    version: string;
    algorithm: 'enhanced-ziwei-core';
  };
}

// ==================== 兼容性类型 ====================

/**
 * 向后兼容的原始输入格式
 */
export interface LegacyBirthInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
}

/**
 * Legacy chart format (for backward compatibility)
 */
export interface LegacyChart {
  birthInfo: Record<string, unknown>;
  palaces: Array<Record<string, unknown>>;
  stars: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * Hook-based chart format
 */
export interface HookChart {
  [branchName: string]: unknown;
  birthInfo?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

/**
 * 类型转换函数接口
 */
export interface TypeConverter {
  // 转换输入格式
  convertLegacyInput(legacy: LegacyBirthInput): EnhancedBirthInput;
  convertBaziToSolar(bazi: string): EnhancedBirthInput['solar'];
  convertLunarToSolar(lunar: EnhancedBirthInput['lunar']): EnhancedBirthInput['solar'];
  
  // 转换输出格式
  convertToLegacyFormat(enhanced: EnhancedZiweiChart): LegacyChart;
  convertToHookFormat(enhanced: EnhancedZiweiChart): HookChart;
}

// ==================== 导出所有类型 ====================

export {
  EnhancedBirthInput as BirthInput,
  EnhancedStar as Star,
  EnhancedPalace as Palace,
  EnhancedZiweiChart as ZiweiChart,
  StarBrightness,
  StarType,
  SihuaType,
  MinorPeriod,
  MajorPeriod,
  FiveElementsBureau
};

/**
 * 默认导出增强版计算函数的接口
 */
export interface EnhancedZiweiCalculator {
  calculateChart(input: EnhancedBirthInput): EnhancedZiweiChart;
  calculateSinglePalace(input: EnhancedBirthInput, branchIndex: number): EnhancedPalace;
  validateInput(input: EnhancedBirthInput): boolean;
}