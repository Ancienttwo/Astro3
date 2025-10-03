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
import { PALACE_NAMES, STEMS } from '../constants/basic-elements';
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
export function calculateLifePalace(month, timeZhiIndex) {
    // 寅宫索引为2，从寅宫起正月顺数到出生月
    const monthPalace = (2 + month - 1) % 12;
    // 从月宫起子时(0)，逆数到出生时辰
    // 逆数就是减法
    let lifePalace = (monthPalace - timeZhiIndex + 12) % 12;
    return lifePalace;
}
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
export function calculateBodyPalace(month, timeZhiIndex) {
    // 寅宫索引为2，从寅宫起正月顺数到出生月
    const monthPalace = (2 + month - 1) % 12;
    // 从月宫起子时(0)，顺数到出生时辰
    // 顺数就是加法
    let bodyPalace = (monthPalace + timeZhiIndex) % 12;
    return bodyPalace;
}
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
export function calculateLaiyinPalace(yearStem, lifePalaceIndex) {
    // 五虎遁表：年干 -> 寅宫起始天干
    const wuHuDunTable = {
        '甲': '丙', '己': '丙', // 甲己之年丙作首
        '乙': '戊', '庚': '戊', // 乙庚之岁戊为头  
        '丙': '庚', '辛': '庚', // 丙辛必定从庚起
        '丁': '壬', '壬': '壬', // 丁壬壬位顺流行
        '戊': '甲', '癸': '甲' // 戊癸之年甲寅宫
    };
    const startStem = wuHuDunTable[yearStem];
    if (!startStem)
        return PALACE_NAMES[0]; // 默认返回命宫
    // 从寅宫(index=2)开始，按五虎遁推算各宫天干
    const startStemIndex = STEMS.indexOf(startStem);
    // 遍历12宫，找到天干与年干相同的宫位
    for (let i = 0; i < 12; i++) {
        // 从寅宫开始，顺时针计算各宫的天干
        // 寅宫=2, 卯宫=3, ..., 子宫=0, 丑宫=1
        const palaceIndex = (i + 2) % 12;
        const palaceStemIndex = (startStemIndex + i) % 10;
        const palaceStem = (STEMS[palaceStemIndex] || STEMS[(palaceStemIndex + 10) % 10]);
        // 找到与年干相同的宫位
        if (palaceStem === yearStem) {
            // 计算该宫位相对于命宫的位置，返回对应的宫名
            const relativeIndex = (palaceIndex - lifePalaceIndex + 12) % 12;
            return PALACE_NAMES[relativeIndex];
        }
    }
    return PALACE_NAMES[0]; // 默认返回命宫
}
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
export function getInnateDauPalaceIndex(month, timeZhiIndex) {
    // 正月在子宫（索引0），二月在亥宫（索引11），三月在戌宫（索引10）...
    // 公式：(12 - (month - 1)) % 12 = (13 - month) % 12
    const monthPalaceIndex = (13 - month) % 12;
    // 从月宫起子时，顺数到出生时辰
    return (monthPalaceIndex + timeZhiIndex) % 12;
}
/**
 * 获取宫位名称
 * Get palace name by index relative to life palace
 *
 * @param index 宫位索引 (0-11)
 * @param lifePalaceIndex 命宫索引 (0-11)
 * @returns 宫位名称
 */
export function getPalaceName(index, lifePalaceIndex) {
    // 以命宫为起点顺时针排布：相对索引 = (life - index)
    const relativeIndex = (lifePalaceIndex - index + 12) % 12;
    return PALACE_NAMES[relativeIndex];
}
/**
 * 计算小限宫位
 * Calculate Minor Limit Palace
 *
 * @param currentAge 当前年龄 (虚岁)
 * @param lifePalaceIndex 命宫索引 (0-11)
 * @param gender 性别 (0=男性，1=女性)
 * @returns 小限宫位索引 (0-11)
 */
export function calculateMinorLimitPalace(currentAge, lifePalaceIndex, gender) {
    // 男性：从命宫顺行
    // 女性：从身宫逆行
    const baseAge = gender === 0 ? 1 : 1; // 起始虚岁
    const ageOffset = currentAge - baseAge;
    if (gender === 0) {
        // 男性顺行：命宫起1岁，兄弟宫2岁...
        return (lifePalaceIndex + ageOffset) % 12;
    }
    else {
        // 女性逆行：身宫起1岁，疾厄宫2岁... 
        // 身宫 = (命宫 + 6) % 12 (对宫)
        const bodyPalaceIndex = (lifePalaceIndex + 6) % 12;
        return (bodyPalaceIndex - ageOffset + 12) % 12;
    }
}
//# sourceMappingURL=palace-calculations.js.map