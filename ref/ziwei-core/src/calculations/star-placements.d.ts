/**
 * 紫微斗数星曜安星模块
 * Star Placements Module for ZiWei DouShu
 *
 * @description
 * 提供主星、辅星、煞星、桃花星等各类星曜的位置计算功能
 * Provides position calculation functions for main stars, auxiliary stars, malefic stars, and romance stars
 *
 * @module StarPlacements
 * @version 2.0.0
 */
import type { EarthlyBranch } from '../types/core';
/**
 * 计算紫微星位置
 * Calculate ZiWei star position
 *
 * @param bureauCode 五行局代码 (如 "fire_6", "water_2")
 * @param day 农历日 (1-30)
 * @returns 紫微星所在宫位索引 (0-11)
 */
export declare function calculateZiweiPosition(bureauCode: string, day: number): number;
/**
 * 计算天府星位置
 * Calculate TianFu star position
 *
 * @param ziweiPosition 紫微星位置索引
 * @returns 天府星位置索引
 */
export declare function calculateTianfuPosition(ziweiPosition: number): number;
/**
 * 计算十四主星位置
 * Calculate positions of 14 main stars
 *
 * @param ziweiPos 紫微星位置
 * @param tianfuPos 天府星位置
 * @returns 主星位置Map
 */
export declare function calculateMainStarPositions(ziweiPos: number, tianfuPos: number): Map<string, number[]>;
/**
 * 计算辅星位置（吉星类）
 * Calculate auxiliary star positions (Auspicious stars)
 *
 * @description 辅星包含：文昌、文曲、左辅、右弼、天魁、天钺、禄存、天马
 * - 文昌（時系星）：从戌宫起子时，逆时针数到出生时辰
 * - 文曲（時系星）：从辰宫起子时，顺时针数到出生时辰
 * - 左辅（月系星）：从辰宫起正月，顺时针数到出生月份
 * - 右弼（月系星）：从戌宫起正月，逆时针数到出生月份
 *
 * @param month 农历月 (1-12)
 * @param day 农历日 (1-30)
 * @param timeZhiIndex 时辰索引 (0-11, 0=子时)
 * @param yearStem 年干
 * @param yearBranch 年支
 */
export declare function calculateAuxiliaryStarPositions(month: number, _day: number, timeZhiIndex: number, yearStem: string, yearBranch: string | EarthlyBranch): Map<string, number[]>;
/**
 * 计算煞星位置
 * Calculate malefic star positions
 *
 * @description 煞星包含：擎羊、陀罗、火星、铃星、地空、地劫、天刑
 *
 * @param month 农历月 (1-12)
 * @param timeZhiIndex 时辰索引 (0-11)
 * @param yearStem 年干
 * @param yearBranch 年支
 */
export declare function calculateMaleficStarPositions(month: number, timeZhiIndex: number, yearStem: string, yearBranch: string | EarthlyBranch): Map<string, number[]>;
/**
 * 计算桃花星位置
 * Calculate romance star positions
 *
 * @description 桃花星包含：红鸾、天喜、天姚、咸池
 *
 * @param yearBranch 年支
 */
/**
 * 计算桃花星位置（红鸾、天喜、天姚、咸池）
 * - 红鸾/天喜/咸池：依年支
 * - 天姚：依农历月（丑宫为正月，顺时针数月）
 */
export declare function calculateRomanceStarPositions(yearBranch: string | EarthlyBranch, lunarMonth: number): Map<string, number[]>;
/**
 * Calculate minor star positions
 * 计算小星位置
 *
 * @param yearBranch - Year branch
 * @param monthBranch - Month branch
 * @param dayBranch - Day branch
 * @param hourBranch - Hour branch
 * @returns Map of minor star names to their palace positions
 */
export declare function calculateMinorStarPositions(_yearBranch: string | EarthlyBranch, _monthBranch: string | EarthlyBranch, _dayBranch: string | EarthlyBranch, _hourBranch: string | EarthlyBranch): Map<string, number[]>;
//# sourceMappingURL=star-placements.d.ts.map