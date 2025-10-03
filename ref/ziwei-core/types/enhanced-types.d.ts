/**
 * Enhanced ZiWei DouShu Data Types
 * 紫微斗数增强数据类型定义
 *
 * @ai-context ZIWEI_ENHANCED_TYPES
 * @preload Star, Palace, ZiweiChart interfaces
 * @algorithm-dependency ziwei-core
 */
/**
 * 增强的输入格式 - 支持公历、农历、八字多种输入
 */
export interface EnhancedBirthInput {
    solar?: {
        year: number;
        month: number;
        day: number;
        hour: number;
    };
    lunar?: {
        yearStem: string;
        yearBranch: string;
        yearGanzhi: string;
        monthLunar: number;
        dayLunar: number;
        hourBranch: string;
        isLeapMonth?: boolean;
    };
    bazi?: {
        year: string;
        month: string;
        day: string;
        hour: string;
        startLuck: string;
        majorPeriods?: string[];
    };
    gender: 'male' | 'female';
    timezone?: string;
    isLunar?: boolean;
}
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
    name: string;
    brightness: StarBrightness;
    type: StarType;
    sihua?: SihuaType;
    description?: string;
    element?: '木' | '火' | '土' | '金' | '水';
    gender?: '阳' | '阴';
    category?: string;
}
/**
 * 小限信息
 */
export interface MinorPeriod {
    age: number;
    year: number;
    branch: string;
    stem: string;
}
/**
 * 大运信息（增强版）
 */
export interface MajorPeriod {
    period: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    stem: string;
    branch: string;
    ganzhi: string;
}
/**
 * 增强的宫位对象
 */
export interface EnhancedPalace {
    branch: string;
    branchIndex: number;
    stem: string;
    palaceName: string;
    isLifePalace: boolean;
    isBodyPalace: boolean;
    isLaiyinPalace: boolean;
    stars: EnhancedStar[];
    fleetingYears: number[];
    majorPeriod?: MajorPeriod;
    minorPeriods?: MinorPeriod[];
    palaceStrength?: number;
    luckyScore?: number;
}
/**
 * 结构化的五行局
 */
export interface FiveElementsBureau {
    name: string;
    element: '木' | '火' | '土' | '金' | '水';
    bureau: number;
    description?: string;
}
/**
 * 增强的紫微斗数星盘输出
 */
export interface EnhancedZiweiChart {
    yearStem: string;
    yearBranch: string;
    yearGanzhi: string;
    fiveElementsBureau: FiveElementsBureau;
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
    lifeMaster: string;
    bodyMaster: string;
    douJun: {
        branch: string;
        branchIndex: number;
        age: number;
    };
    palaces: EnhancedPalace[];
    originalInput: EnhancedBirthInput;
    metadata: {
        calculationTime: Date;
        version: string;
        algorithm: 'enhanced-ziwei-core';
    };
}
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
 * 类型转换函数接口
 */
export interface TypeConverter {
    convertLegacyInput(legacy: LegacyBirthInput): EnhancedBirthInput;
    convertBaziToSolar(bazi: string): EnhancedBirthInput['solar'];
    convertLunarToSolar(lunar: EnhancedBirthInput['lunar']): EnhancedBirthInput['solar'];
    convertToLegacyFormat(enhanced: EnhancedZiweiChart): LegacyChart;
    convertToHookFormat(enhanced: EnhancedZiweiChart): HookChart;
}
export { EnhancedBirthInput as BirthInput, EnhancedStar as Star, EnhancedPalace as Palace, EnhancedZiweiChart as ZiweiChart, StarBrightness, StarType, SihuaType, MinorPeriod, MajorPeriod, FiveElementsBureau };
/**
 * 默认导出增强版计算函数的接口
 */
export interface EnhancedZiweiCalculator {
    calculateChart(input: EnhancedBirthInput): EnhancedZiweiChart;
    calculateSinglePalace(input: EnhancedBirthInput, branchIndex: number): EnhancedPalace;
    validateInput(input: EnhancedBirthInput): boolean;
}
//# sourceMappingURL=enhanced-types.d.ts.map