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
import { BRANCHES } from '../constants/basic-elements';
// Use legacy constant map for 火星起点，已在其他模块使用，保持一致
import { HUOXING_BASE_MAP } from '../constants/ziwei-constants';
import { ZIWEI_POSITION_TABLE, TIANFU_OFFSET_FROM_ZIWEI, ZIWEI_SERIES_POSITIONS, TIANFU_SERIES_POSITIONS } from '../constants/star-systems';
import { BUREAU_CODE_TO_COLUMN } from '../constants/five-elements-bureau';
/**
 * 计算紫微星位置
 * Calculate ZiWei star position
 *
 * @param bureauCode 五行局代码 (如 "fire_6", "water_2")
 * @param day 农历日 (1-30)
 * @returns 紫微星所在宫位索引 (0-11)
 */
export function calculateZiweiPosition(bureauCode, day) {
    // 获取五行局对应的列索引
    const columnIndex = BUREAU_CODE_TO_COLUMN[bureauCode];
    // 输入验证
    if (columnIndex === undefined) {
        throw new Error(`Invalid bureau code: ${bureauCode}`);
    }
    if (day < 1 || day > 30) {
        throw new Error(`Invalid day: ${day}. Must be between 1 and 30`);
    }
    // 从表中获取紫微星位置（地支名称）
    const rowIndex = day - 1; // 转换为0-based索引
    const positionBranch = ZIWEI_POSITION_TABLE[rowIndex]?.[columnIndex];
    if (!positionBranch) {
        throw new Error(`Missing Ziwei position mapping for day=${day}, bureauCol=${columnIndex}`);
    }
    // 将地支名称转换为索引
    const positionIndex = BRANCHES.indexOf(positionBranch);
    if (positionIndex === -1) {
        throw new Error(`Could not find branch index for: ${positionBranch}`);
    }
    return positionIndex;
}
/**
 * 计算天府星位置
 * Calculate TianFu star position
 *
 * @param ziweiPosition 紫微星位置索引
 * @returns 天府星位置索引
 */
export function calculateTianfuPosition(ziweiPosition) {
    const offset = TIANFU_OFFSET_FROM_ZIWEI[ziweiPosition];
    if (offset === undefined) {
        throw new Error(`Missing Tianfu offset for Ziwei position index: ${ziweiPosition}`);
    }
    return (ziweiPosition + offset) % 12;
}
/**
 * 计算十四主星位置
 * Calculate positions of 14 main stars
 *
 * @param ziweiPos 紫微星位置
 * @param tianfuPos 天府星位置
 * @returns 主星位置Map
 */
export function calculateMainStarPositions(ziweiPos, tianfuPos) {
    const positions = new Map();
    // 紫微系：根据常量表的相对偏移（逆时针）
    Object.entries(ZIWEI_SERIES_POSITIONS).forEach(([star, offset]) => {
        const idx = (ziweiPos + offset + 12) % 12;
        positions.set(star, [idx]);
    });
    // 天府系：根据常量表的相对偏移（顺时针）
    Object.entries(TIANFU_SERIES_POSITIONS).forEach(([star, offset]) => {
        const idx = (tianfuPos + offset + 12) % 12;
        positions.set(star, [idx]);
    });
    return positions;
}
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
export function calculateAuxiliaryStarPositions(month, _day, timeZhiIndex, yearStem, yearBranch) {
    const positions = new Map();
    // Get year branch index for calculations
    const yearBranchIndex = BRANCHES.indexOf(yearBranch);
    if (yearBranchIndex === -1) {
        throw new Error(`Invalid yearBranch: ${yearBranch}`);
    }
    if (timeZhiIndex < 0 || timeZhiIndex > 11) {
        throw new Error(`Invalid timeZhiIndex: ${timeZhiIndex}. Expected 0..11`);
    }
    // 文昌星 - 从戌宫（索引10）起子时，逆时针数到出生时辰
    // 戌宫起点，逆行：戌(10) -> 酉(9) -> 申(8) -> ...
    const wenchangPos = (10 - timeZhiIndex + 12) % 12;
    positions.set('文昌', [wenchangPos]);
    // 文曲星 - 从辰宫（索引4）起子时，顺时针数到出生时辰
    // 辰宫起点，顺行：辰(4) -> 巳(5) -> 午(6) -> ...
    const wenquPos = (4 + timeZhiIndex) % 12;
    positions.set('文曲', [wenquPos]);
    // 左辅星 - 从辰宫（索引4）起正月，顺时针数到出生月份
    // 辰宫起点，顺行：辰(4) -> 巳(5) -> 午(6) -> ...
    // month是1-12，需要减1作为偏移量
    const zuofuPos = (4 + (month - 1)) % 12;
    positions.set('左辅', [zuofuPos]);
    // 右弼星 - 从戌宫（索引10）起正月，逆时针数到出生月份
    // 戌宫起点，逆行：戌(10) -> 酉(9) -> 申(8) -> ...
    // month是1-12，需要减1作为偏移量
    const youbiPos = (10 - (month - 1) + 12) % 12;
    positions.set('右弼', [youbiPos]);
    // 天魁天钺 - 根据年干
    const kuiYueTable = {
        '甲': [1, 7], // 丑未
        '戊': [1, 7], // 丑未
        '庚': [1, 7], // 丑未
        '乙': [0, 8], // 子申
        '己': [0, 8], // 子申
        '丙': [11, 9], // 亥酉
        '丁': [11, 9], // 亥酉
        '辛': [6, 2], // 午寅
        '壬': [3, 5], // 卯巳
        '癸': [3, 5] // 卯巳
    };
    const mappingKuiYue = kuiYueTable[yearStem];
    if (!mappingKuiYue) {
        throw new Error(`Invalid yearStem for Kui/Yue mapping: ${yearStem}`);
    }
    const [kuiPos, yuePos] = mappingKuiYue;
    positions.set('天魁', [kuiPos]);
    positions.set('天钺', [yuePos]);
    // 禄存 - 根据年干
    const lucunTable = {
        '甲': 2, // 寅
        '乙': 3, // 卯
        '丙': 5, // 巳
        '戊': 5, // 巳
        '丁': 6, // 午
        '己': 6, // 午
        '庚': 8, // 申
        '辛': 9, // 酉
        '壬': 11, // 亥
        '癸': 0 // 子
    };
    if (lucunTable[yearStem] === undefined) {
        throw new Error(`Invalid yearStem for LuCun mapping: ${yearStem}`);
    }
    const lucunPos = (lucunTable[yearStem] ?? 0);
    positions.set('禄存', [lucunPos]);
    // 天马 - 根据生年地支
    // 规则：
    // 申子辰年（猴鼠龙）-> 寅宫
    // 亥卯未年（猪兔羊）-> 巳宫  
    // 寅午戌年（虎马狗）-> 申宫
    // 巳酉丑年（蛇鸡牛）-> 亥宫
    const tianmaTable = {
        0: 2, // 子(鼠)年在寅宫
        1: 11, // 丑(牛)年在亥宫
        2: 8, // 寅(虎)年在申宫
        3: 5, // 卯(兔)年在巳宫
        4: 2, // 辰(龙)年在寅宫
        5: 11, // 巳(蛇)年在亥宫
        6: 8, // 午(马)年在申宫
        7: 5, // 未(羊)年在巳宫
        8: 2, // 申(猴)年在寅宫
        9: 11, // 酉(鸡)年在亥宫
        10: 8, // 戌(狗)年在申宫
        11: 5 // 亥(猪)年在巳宫
    };
    const tianmaPos = (tianmaTable[yearBranchIndex] ?? 0);
    positions.set('天马', [tianmaPos]);
    return positions;
}
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
export function calculateMaleficStarPositions(month, timeZhiIndex, yearStem, yearBranch) {
    const positions = new Map();
    // 擎羊陀罗 - 根据年干
    const yangTuoTable = {
        '甲': [3, 1], // 卯丑
        '乙': [4, 2], // 辰寅
        '丙': [6, 4], // 午辰
        '戊': [6, 4], // 午辰
        '丁': [7, 5], // 未巳
        '己': [7, 5], // 未巳
        '庚': [9, 7], // 酉未
        '辛': [10, 8], // 戌申
        '壬': [0, 10], // 子戌
        '癸': [1, 11] // 丑亥
    };
    const yangTuo = yangTuoTable[yearStem];
    if (!yangTuo) {
        throw new Error(`Invalid yearStem for Qingyang/Tuoluo mapping: ${yearStem}`);
    }
    const [yangPos, tuoPos] = yangTuo;
    positions.set('擎羊', [yangPos]);
    positions.set('陀罗', [tuoPos]);
    // 火星 - 根据年支分组确定起点宫位，再顺数至时辰
    // 采用与 malefic-stars.ts / star-calculator.ts 一致的映射
    const yearBranchIndex = BRANCHES.indexOf(yearBranch);
    if (yearBranchIndex === -1) {
        throw new Error(`Invalid yearBranch for Huoxing: ${yearBranch}`);
    }
    const huoxingBaseBranch = HUOXING_BASE_MAP[BRANCHES[yearBranchIndex]];
    if (!huoxingBaseBranch) {
        throw new Error(`Missing Huoxing base for yearBranch: ${yearBranch}`);
    }
    const baseIndex = BRANCHES.indexOf(huoxingBaseBranch);
    const firePos = (baseIndex + timeZhiIndex) % 12;
    positions.set('火星', [firePos]);
    // 铃星 - 寅午戌年起卯，其余起戌；方向：顺时针（加）数至时辰
    // 与 malefic-stars.ts / star-calculator.ts 保持一致
    const yb = BRANCHES[yearBranchIndex];
    const lingBaseBranch = (yb === '寅' || yb === '午' || yb === '戌' ? '卯' : '戌');
    const lingBaseIndex = BRANCHES.indexOf(lingBaseBranch);
    const bellPos = (lingBaseIndex + timeZhiIndex) % 12;
    positions.set('铃星', [bellPos]);
    // 地空地劫 - 根据时支
    positions.set('地空', [(11 - timeZhiIndex) % 12]);
    positions.set('地劫', [(11 + timeZhiIndex) % 12]);
    // 天刑 - 根据月支
    // 正月在酉，二月在戌...十二月在申
    const tianxingPos = (9 + (month - 1)) % 12;
    positions.set('天刑', [tianxingPos]);
    return positions;
}
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
export function calculateRomanceStarPositions(yearBranch, lunarMonth) {
    const positions = new Map();
    const yearBranchIndex = BRANCHES.indexOf(yearBranch);
    if (yearBranchIndex === -1) {
        throw new Error(`Invalid yearBranch for Romance stars: ${yearBranch}`);
    }
    // 红鸾 - 根据年支
    // 子年在卯，丑年在寅，寅年在丑...
    const hongluanTable = {
        0: 3, // 子年在卯
        1: 2, // 丑年在寅
        2: 1, // 寅年在丑
        3: 0, // 卯年在子
        4: 11, // 辰年在亥
        5: 10, // 巳年在戌
        6: 9, // 午年在酉
        7: 8, // 未年在申
        8: 7, // 申年在未
        9: 6, // 酉年在午
        10: 5, // 戌年在巳
        11: 4 // 亥年在辰
    };
    const hongluanPos = hongluanTable[yearBranchIndex] || 0;
    positions.set('红鸾', [hongluanPos]);
    // 天喜 - 红鸾对宫
    const tianxiPos = (hongluanPos + 6) % 12;
    positions.set('天喜', [tianxiPos]);
    // 天姚 - 以丑宫为正月，顺时针数至农历出生月份（强制使用月份，不再回退旧逻辑）
    if (lunarMonth < 1 || lunarMonth > 12) {
        throw new Error(`Invalid lunarMonth for TianYao: ${lunarMonth}. Expected 1..12`);
    }
    const tianyaoPos = (1 + (lunarMonth - 1)) % 12; // 丑(index=1) + (月-1)
    positions.set('天姚', [tianyaoPos]);
    // 咸池 - 根据年支（桃花位）
    // 申子辰在酉，巳酉丑在午，寅午戌在卯，亥卯未在子
    const xianchiTable = {
        0: 9, // 子年在酉
        1: 6, // 丑年在午
        2: 3, // 寅年在卯
        3: 0, // 卯年在子
        4: 9, // 辰年在酉
        5: 6, // 巳年在午
        6: 3, // 午年在卯
        7: 0, // 未年在子
        8: 9, // 申年在酉
        9: 6, // 酉年在午
        10: 3, // 戌年在卯
        11: 0 // 亥年在子
    };
    const xianchiPos = xianchiTable[yearBranchIndex] || 0;
    positions.set('咸池', [xianchiPos]);
    return positions;
}
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
export function calculateMinorStarPositions(_yearBranch, _monthBranch, _dayBranch, _hourBranch) {
    const positions = new Map();
    // TODO: Implement complete minor star calculations
    // This is a placeholder that returns an empty map
    // Minor stars include: 天官, 天福, 天厨, 三台, 八座, 恩光, 天贵, etc.
    return positions;
}
//# sourceMappingURL=star-placements.js.map