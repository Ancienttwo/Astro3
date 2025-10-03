/**
 * 紫微斗数运程计算模块
 * Period Calculations Module for ZiWei DouShu
 *
 * @description
 * 提供大运、流年、小限等运程计算功能
 * Provides calculation functions for major periods, fleeting years, and minor periods
 *
 * @module PeriodCalculations
 * @version 2.0.0
 */
import type { HeavenlyStem } from '../types/core';
/**
 * 大运信息接口
 */
export interface MajorPeriod {
    period: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    palaceIndex: number;
    stem?: string;
    branch?: string;
}
/**
 * 计算大运起运岁数
 * Calculate major period start age
 *
 * @param bureau 五行局代码
 * @param yearStem 年干
 * @param gender 性别 ('male' | 'female')
 * @returns 起运岁数
 */
export declare function calculateMajorPeriodStartAge(bureau: string, yearStem: string | HeavenlyStem, gender: 'male' | 'female'): number;
/**
 * 计算大运信息
 * Calculate major period information
 *
 * @param startAge 起运岁数
 * @param birthYear 出生年份
 * @param lifePalaceIndex 命宫索引
 * @param isClockwise 是否顺行
 * @returns 大运信息数组
 */
export declare function calculateMajorPeriods(startAge: number, birthYear: number, lifePalaceIndex: number, isClockwise: boolean): MajorPeriod[];
/**
 * 计算流年岁数
 * Calculate fleeting year ages for a branch
 *
 * @param branchIndex 地支索引
 * @returns 对应该地支的年龄数组
 */
export declare function calculateFleetingYears(branchIndex: number): number[];
/**
 * 计算指定年龄的小限宫位
 * Calculate minor limit palace for specific age
 *
 * @param age 年龄 (虚岁)
 * @param lifePalaceIndex 命宫索引
 * @param gender 性别 (0=男性，1=女性)
 * @returns 小限宫位索引
 */
export declare function calculateMinorLimit(age: number, lifePalaceIndex: number, gender: number): number;
/**
 * 获取指定年份的太岁地支
 * Get Taisui branch for specific year
 *
 * @param year 年份
 * @returns 太岁地支索引
 */
export declare function getTaisuiBranch(year: number): number;
/**
 * 计算120年小限表
 * Calculate 120-year minor limits table
 *
 * @param lifePalaceIndex 命宫索引
 * @param gender 性别
 * @returns 120年小限宫位数组
 */
export declare function calculate120YearMinorLimits(lifePalaceIndex: number, gender: number): number[];
export declare const calculateMinorPeriod: typeof calculateMinorLimit;
//# sourceMappingURL=period-calculations.d.ts.map