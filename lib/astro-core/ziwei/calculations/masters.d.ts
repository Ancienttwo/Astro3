/**
 * 紫微斗数命主身主计算模块
 * Life & Body Masters Module for ZiWei DouShu
 *
 * @description
 * 提供命主、身主的计算功能
 * Provides calculation functions for life master and body master
 *
 * @module Masters
 * @version 2.0.0
 */
import type { EarthlyBranch } from '../types/core';
/**
 * 命主身主结果接口
 */
export interface Masters {
    lifeMaster: string;
    bodyMaster: string;
}
/**
 * 计算命主身主
 * Calculate life and body masters
 *
 * @param yearBranch 年支
 * @param lifePalaceBranch 命宫地支（可选，用于更精确的计算）
 * @returns 命主身主对象
 */
export declare function calculateMasters(yearBranch: string | EarthlyBranch, lifePalaceBranch?: string | EarthlyBranch): Masters;
/**
 * 获取命主星
 * Get life master star
 *
 * @param yearBranch 年支
 * @returns 命主星名称
 */
export declare function getLifeMaster(yearBranch: string | EarthlyBranch): string;
/**
 * 获取身主星
 * Get body master star
 *
 * @param yearBranch 年支
 * @returns 身主星名称
 */
export declare function getBodyMaster(yearBranch: string | EarthlyBranch): string;
//# sourceMappingURL=masters.d.ts.map