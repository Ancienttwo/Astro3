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
import { MAJOR_PERIOD_START_AGE, STEMS } from '../constants';
/**
 * 计算大运起运岁数
 * Calculate major period start age
 *
 * @param bureau 五行局代码
 * @param yearStem 年干
 * @param gender 性别 ('male' | 'female')
 * @returns 起运岁数
 */
export function calculateMajorPeriodStartAge(bureau, yearStem, gender) {
    const [yangAge, yinAge] = MAJOR_PERIOD_START_AGE[bureau] || [6, 5];
    // 判断阴阳
    const stemIndex = STEMS.indexOf(yearStem);
    const isYangYear = stemIndex % 2 === 0;
    if ((isYangYear && gender === 'male') || (!isYangYear && gender === 'female')) {
        return yangAge; // 阳男阴女顺行
    }
    else {
        return yinAge; // 阴男阳女逆行
    }
}
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
export function calculateMajorPeriods(startAge, birthYear, lifePalaceIndex, isClockwise) {
    const periods = [];
    for (let i = 0; i < 12; i++) {
        const periodStartAge = startAge + i * 10;
        const periodEndAge = periodStartAge + 9;
        // 计算大运宫位
        let palaceIndex;
        if (isClockwise) {
            palaceIndex = (lifePalaceIndex + i) % 12;
        }
        else {
            palaceIndex = (lifePalaceIndex - i + 12) % 12;
        }
        periods.push({
            period: i + 1,
            startAge: periodStartAge,
            endAge: periodEndAge,
            // 项目定义：起运年 = 出生年 + (起运岁数 - 1)
            startYear: birthYear + (periodStartAge - 1),
            endYear: birthYear + (periodEndAge - 1),
            palaceIndex
        });
    }
    return periods;
}
/**
 * 计算流年岁数
 * Calculate fleeting year ages for a branch
 *
 * @param branchIndex 地支索引
 * @returns 对应该地支的年龄数组
 */
export function calculateFleetingYears(branchIndex) {
    const years = [];
    // 从该地支开始，每12年循环一次
    for (let i = 0; i < 10; i++) {
        years.push(branchIndex + 1 + i * 12);
    }
    return years;
}
/**
 * 计算指定年龄的小限宫位
 * Calculate minor limit palace for specific age
 *
 * @param age 年龄 (虚岁)
 * @param lifePalaceIndex 命宫索引
 * @param gender 性别 (0=男性，1=女性)
 * @returns 小限宫位索引
 */
export function calculateMinorLimit(age, lifePalaceIndex, gender) {
    if (gender === 0) {
        // 男性：从命宫顺行，1岁在命宫，2岁在兄弟宫...
        return (lifePalaceIndex + age - 1) % 12;
    }
    else {
        // 女性：从身宫逆行，1岁在身宫...
        // 身宫通常在命宫的对宫（简化处理）
        const bodyPalaceIndex = (lifePalaceIndex + 6) % 12;
        return (bodyPalaceIndex - age + 1 + 12) % 12;
    }
}
/**
 * 获取指定年份的太岁地支
 * Get Taisui branch for specific year
 *
 * @param year 年份
 * @returns 太岁地支索引
 */
export function getTaisuiBranch(year) {
    // 太岁地支 = (年份 - 4) % 12
    return (year - 4) % 12;
}
/**
 * 计算120年小限表
 * Calculate 120-year minor limits table
 *
 * @param lifePalaceIndex 命宫索引
 * @param gender 性别
 * @returns 120年小限宫位数组
 */
export function calculate120YearMinorLimits(lifePalaceIndex, gender) {
    const limits = [];
    for (let age = 1; age <= 120; age++) {
        limits.push(calculateMinorLimit(age, lifePalaceIndex, gender));
    }
    return limits;
}
// Alias for backward compatibility
export const calculateMinorPeriod = calculateMinorLimit;
//# sourceMappingURL=period-calculations.js.map