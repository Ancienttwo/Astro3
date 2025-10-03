/**
 * 紫微斗数宫位计算模块
 * Palace Calculations Module for ZiWei DouShu
 *
 * @description
 * 提供命宫、身宫、来因宫等核心宫位计算功能
 * Provides core palace calculation functions including Life Palace, Body Palace, and Laiyin Palace
 *
 * @module PalaceCalculations
 * @version 2.0.0
 */
import type { HeavenlyStem } from '../types/core';
/**
 * 计算命宫位置
 * Calculate Life Palace position
 *
 * @description
 * 紫微斗数标准算法：
 * 1. 从寅宫起正月，顺数到出生月份
 * 2. 从该宫起子时，逆数到出生时辰
 * 3. 所得宫位即为命宫
 *
 * @param month 农历生月 (1-12)
 * @param timeZhiIndex 时辰索引 (0-11: 子丑寅卯辰巳午未申酉戌亥)
 * @returns 命宫宫位索引 (0-11)
 */
export declare function calculateLifePalace(month: number, timeZhiIndex: number): number;
/**
 * 计算身宫位置
 * Calculate Body Palace position
 *
 * @description
 * 紫微斗数标准算法：
 * 1. 从寅宫起正月，顺数到出生月份
 * 2. 从该宫起子时，顺数到出生时辰
 * 3. 所得宫位即为身宫
 *
 * @param month 农历生月 (1-12)
 * @param timeZhiIndex 时辰索引 (0-11: 子丑寅卯辰巳午未申酉戌亥)
 * @returns 身宫宫位索引 (0-11)
 */
export declare function calculateBodyPalace(month: number, timeZhiIndex: number): number;
/**
 * 计算来因宫
 * Calculate Laiyin Palace
 *
 * @description
 * 来因宫是十二宫中宫干与生年天干相同的宫位名称。
 * The Laiyin Palace is the palace name whose stem matches the year stem.
 *
 * @algorithm
 * 使用五虎遁法确定各宫天干，找出与年干相同的宫位，返回其在命盘中的名称。
 * Uses Wu Hu Dun method to determine palace stems, finds the one matching year stem, returns palace name.
 *
 * @param yearStem 生年天干
 * @param lifePalaceIndex 命宫位置 (0-11)
 * @returns 来因宫名称 (命宫/兄弟/夫妻等)
 *
 * @example
 * // 甲年生人，命宫在寅
 * calculateLaiyinPalace('甲', 2) // 返回 "夫妻" (甲年五虎遁，申宫天干为甲)
 */
export declare function calculateLaiyinPalace(yearStem: string | HeavenlyStem, lifePalaceIndex: number): string;
/**
 * 获取先天斗君宫位索引
 * Get Innate Dou Jun palace index
 *
 * @description
 * 先天斗君是紫微斗数中用于确定流年宫位的重要概念
 * 从正月起子宫，逆数到出生月份，再从该宫起子时，顺数到出生时辰
 *
 * @param month 农历生月 (1-12)
 * @param timeZhiIndex 生时地支索引 (0-11)
 * @returns 宫位索引 (0-11，对应子丑寅卯辰巳午未申酉戌亥)
 */
export declare function getInnateDauPalaceIndex(month: number, timeZhiIndex: number): number;
/**
 * 获取宫位名称
 * Get palace name by index relative to life palace
 *
 * @param index 宫位索引 (0-11)
 * @param lifePalaceIndex 命宫索引 (0-11)
 * @returns 宫位名称
 */
export declare function getPalaceName(index: number, lifePalaceIndex: number): string;
/**
 * 计算小限宫位
 * Calculate Minor Limit Palace
 *
 * @param currentAge 当前年龄 (虚岁)
 * @param lifePalaceIndex 命宫索引 (0-11)
 * @param gender 性别 (0=男性，1=女性)
 * @returns 小限宫位索引 (0-11)
 */
export declare function calculateMinorLimitPalace(currentAge: number, lifePalaceIndex: number, gender: number): number;
//# sourceMappingURL=palace-calculations.d.ts.map