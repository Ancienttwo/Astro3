/**
 * 紫微斗数五行局计算模块
 * Five Elements Bureau Calculations Module for ZiWei DouShu
 *
 * @description
 * 提供五行局相关的计算功能
 * Provides calculation functions for Five Elements Bureau
 *
 * @module BureauCalculations
 * @version 2.0.0
 */
/**
 * 五行局详细信息接口
 */
export interface FiveElementsBureauDetail {
    name: string;
    局数: number;
    element: string;
    code: string;
}
/**
 * 计算五行局详细信息
 * Calculate detailed Five Elements Bureau information
 *
 * @param yearStem 年天干
 * @param yearBranch 年地支
 * @param month 农历月份 (1-12)
 * @param hour 出生时辰索引 (0-11)
 * @returns 五行局详细信息
 */
export declare function calculateFiveElementsBureauDetail(yearStem: string, _yearBranch: string, month: number, hour: number): FiveElementsBureauDetail;
//# sourceMappingURL=bureau-calculations.d.ts.map