/**
 * 紫微斗数星曜亮度计算模块
 * Star Brightness Calculations Module for ZiWei DouShu
 *
 * @description
 * 提供星曜亮度相关的计算功能
 * Provides calculation functions for star brightness
 *
 * @module BrightnessCalculations
 * @version 2.0.0
 */
import { type StarBrightnessValue } from '../constants';
/**
 * 获取星曜在指定宫位的亮度数值
 * Get star brightness value at specified palace position
 *
 * @param starName 星曜名称 Star name
 * @param palaceIndex 宫位索引 (0-11, 对应子丑寅卯辰巳午未申酉戌亥)
 * @returns 亮度数值 (0-6: 陷不地平利得旺庙)
 */
export declare function getStarBrightness(starName: string, palaceIndex: number): StarBrightnessValue;
/**
 * 获取星曜亮度等级名称
 * Get star brightness level name
 *
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 亮度等级名称 (庙、旺、得、利、平、不、陷)
 */
export declare function getStarBrightnessLevel(starName: string, palaceIndex: number): string;
/**
 * 判断星曜是否入庙
 * Check if star is in temple (入庙)
 *
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否入庙
 */
export declare function isStarInTemple(starName: string, palaceIndex: number): boolean;
/**
 * 判断星曜是否旺盛
 * Check if star is prosperous (旺)
 *
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否旺盛
 */
export declare function isStarProsperous(starName: string, palaceIndex: number): boolean;
/**
 * 判断星曜是否失陷
 * Check if star is trapped (陷)
 *
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 是否失陷
 */
export declare function isStarTrapped(starName: string, palaceIndex: number): boolean;
/**
 * 获取星曜亮度评分
 * Get star brightness score (0-6, 数值越高亮度越好)
 *
 * @param starName 星曜名称
 * @param palaceIndex 宫位索引
 * @returns 亮度评分
 */
export declare function getStarBrightnessScore(starName: string, palaceIndex: number): number;
//# sourceMappingURL=brightness-calculations.d.ts.map