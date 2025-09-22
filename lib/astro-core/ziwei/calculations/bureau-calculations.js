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
import { FIVE_ELEMENTS_BUREAU } from '../constants';
import { calculateLifePalace } from './palace-calculations';
import { BRANCHES } from '../constants';
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
export function calculateFiveElementsBureauDetail(yearStem, _yearBranch, month, hour) {
    // 计算命宫位置
    const lifePalaceIndex = calculateLifePalace(month, hour);
    const lifePalaceBranch = BRANCHES[lifePalaceIndex];
    // 使用年天干 + 命宫地支查表
    const ganZhi = yearStem + lifePalaceBranch;
    if (!FIVE_ELEMENTS_BUREAU[ganZhi]) {
        throw new Error(`Invalid GanZhi combination for Five Elements Bureau: ${ganZhi}`);
    }
    const nameCn = FIVE_ELEMENTS_BUREAU[ganZhi];
    // 将中文名称解析为 element + code
    const elementMap = { '水': 'water', '木': 'wood', '金': 'metal', '土': 'earth', '火': 'fire' };
    const elementCn = nameCn.charAt(0);
    const numberCn = nameCn.charAt(1); // "二"/"三"/...
    const numberMap = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6 };
    const number = numberMap[numberCn] ?? 6;
    const element = elementMap[elementCn] || 'fire';
    return {
        name: nameCn,
        局数: number,
        element: elementCn,
        code: `${element}_${number}`
    };
}
//# sourceMappingURL=bureau-calculations.js.map