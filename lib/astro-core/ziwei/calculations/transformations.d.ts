/**
 * 紫微斗数四化计算模块
 * Four Transformations (Sihua) Module for ZiWei DouShu
 *
 * @description
 * 提供生年四化、飞宫四化等变化计算功能
 * Provides calculation functions for birth year sihua and flying palace sihua
 *
 * @module Transformations
 * @version 2.0.0
 */
/**
 * 四化类型定义
 */
export interface SihuaTransformation {
    star: string;
    type: string;
    source?: string;
}
/**
 * 计算生年四化
 * Calculate birth year Si Hua transformations
 *
 * @param yearStem 年天干
 * @returns 四化对象 {A: 化禄, B: 化权, C: 化科, D: 化忌}
 */
export declare function calculateBirthYearSihua(yearStem: string): {
    A: string;
    B: string;
    C: string;
    D: string;
};
/**
 * 计算飞宫四化
 * Calculate flying palace Si Hua transformations
 *
 * @param palaceStem 宫干
 * @param targetPalaceIndex 目标宫位索引
 * @param sourcePalaceIndex 源宫位索引
 * @returns 四化变换数组
 */
export declare function calculateFlyingPalaceSihua(palaceStem: string, targetPalaceIndex: number, sourcePalaceIndex: number): SihuaTransformation[];
/**
 * 计算自化
 * Calculate self transformations (宫干引发的四化)
 *
 * @param palaceStem 宫干
 * @param starsInPalace 该宫内的星曜列表
 * @returns 自化变换数组
 */
export declare function calculateSelfTransformations(palaceStem: string, starsInPalace: string[]): SihuaTransformation[];
/**
 * 计算自化（双向）
 * - outward(离心): 使用本宫宫干
 * - inward(向心): 使用对宫(+6)宫干
 */
export declare function calculateSelfTransformationsDual(palaceStem: string, oppositePalaceStem: string, starsInPalace: string[]): (SihuaTransformation & {
    direction: 'inward' | 'outward';
})[];
/**
 * 获取四化星曜信息
 * Get Sihua star information
 *
 * @param yearStem 年天干
 * @returns 详细的四化信息
 */
export declare function getSihuaStarInfo(yearStem: string): {
    chemicalLu: string;
    chemicalQuan: string;
    chemicalKe: string;
    chemicalJi: string;
};
//# sourceMappingURL=transformations.d.ts.map