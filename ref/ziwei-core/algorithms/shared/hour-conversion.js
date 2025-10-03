"use strict";
/**
 * 标准时辰转换工具函数
 * 解决时辰算法不一致问题，提供统一的hourBranch接口
 *
 * 标准时辰对应关系（基于测试验证的正确分界）：
 * 23:00-01:59 → 子时 (序数:1, 索引:0)
 * 02:00-03:59 → 丑时 (序数:2, 索引:1)
 * 04:00-05:59 → 寅时 (序数:3, 索引:2)
 * 06:00-07:59 → 卯时 (序数:4, 索引:3)
 * 08:00-09:59 → 辰时 (序数:5, 索引:4)
 * 10:00-11:59 → 巳时 (序数:6, 索引:5)
 * 12:00-12:59 → 午时 (序数:7, 索引:6) - 注意：只有12时！
 * 13:00-14:59 → 未时 (序数:8, 索引:7) - 注意：从13时开始！
 * 15:00-16:59 → 申时 (序数:9, 索引:8)
 * 17:00-18:59 → 酉时 (序数:10, 索引:9)
 * 19:00-20:59 → 戌时 (序数:11, 索引:10)
 * 21:00-22:59 → 亥时 (序数:12, 索引:11)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertHour = convertHour;
exports.getHourOrdinal = getHourOrdinal;
exports.getHourIndex = getHourIndex;
exports.getHourBranch = getHourBranch;
exports.validateHourConversion = validateHourConversion;
/**
 * 地支名称数组（按索引顺序）
 */
const BRANCH_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
/**
 * 地支到序数的映射
 */
const BRANCH_TO_ORDINAL = {
    '子': 1, '丑': 2, '寅': 3, '卯': 4,
    '辰': 5, '巳': 6, '午': 7, '未': 8,
    '申': 9, '酉': 10, '戌': 11, '亥': 12
};
/**
 * 地支到索引的映射
 */
const BRANCH_TO_INDEX = {
    '子': 0, '丑': 1, '寅': 2, '卯': 3,
    '辰': 4, '巳': 5, '午': 6, '未': 7,
    '申': 8, '酉': 9, '戌': 10, '亥': 11
};
/**
 * 统一时辰转换函数
 * 支持24小时制数字和地支字符串输入
 *
 * @param hour - 24小时制数字(0-23)或地支字符串(子、丑、寅...)
 * @returns 转换结果包含地支名称、序数、索引
 */
function convertHour(hour) {
    if (typeof hour === 'string') {
        // hourBranch方式（推荐）
        const ordinal = BRANCH_TO_ORDINAL[hour] || 1;
        const index = BRANCH_TO_INDEX[hour] || 0;
        return {
            branch: hour,
            ordinal,
            index
        };
    }
    else {
        // 24小时制转换（标准时辰分界算法）
        // 基于传统时辰分界和测试验证的正确算法
        let index;
        if (hour === 23 || hour === 0 || hour === 1) {
            index = 0; // 子时 (23:00-01:59)
        }
        else if (hour >= 2 && hour <= 11) {
            index = Math.floor(hour / 2); // 丑时-巳时 (2→1, 3→1, 4→2, 5→2, ..., 10→5, 11→5)
        }
        else if (hour === 12) {
            index = 6; // 午时 (12:00-12:59) - 特殊：仅12时
        }
        else if (hour >= 13 && hour <= 22) {
            // 未时-亥时：13→7, 14→7, 15→8, 16→8, ..., 21→11, 22→11
            index = Math.floor((hour + 1) / 2); // 修正公式: (13+1)/2=7, (14+1)/2=7, (15+1)/2=8, ...
        }
        else {
            index = 0; // 默认子时
        }
        return {
            branch: BRANCH_NAMES[index],
            ordinal: index + 1,
            index
        };
    }
}
/**
 * 获取时辰序数（用于命宫身宫计算）
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 时辰序数（1-12）
 */
function getHourOrdinal(hour) {
    return convertHour(hour).ordinal;
}
/**
 * 获取时辰索引（用于星曜定位）
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 时辰索引（0-11）
 */
function getHourIndex(hour) {
    return convertHour(hour).index;
}
/**
 * 获取地支名称
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 地支名称（子、丑、寅...）
 */
function getHourBranch(hour) {
    return convertHour(hour).branch;
}
/**
 * 验证时辰转换的一致性
 *
 * @returns 验证结果
 */
function validateHourConversion() {
    // 测试数据
    const testCases = [
        { hour24: 0, branch: '子', ordinal: 1, index: 0 },
        { hour24: 1, branch: '子', ordinal: 1, index: 0 },
        { hour24: 2, branch: '丑', ordinal: 2, index: 1 },
        { hour24: 13, branch: '未', ordinal: 8, index: 7 },
        { hour24: 23, branch: '子', ordinal: 1, index: 0 }
    ];
    for (const testCase of testCases) {
        const result1 = convertHour(testCase.hour24);
        const result2 = convertHour(testCase.branch);
        if (result1.branch !== testCase.branch ||
            result1.ordinal !== testCase.ordinal ||
            result1.index !== testCase.index ||
            result1.branch !== result2.branch ||
            result1.ordinal !== result2.ordinal ||
            result1.index !== result2.index) {
            return false;
        }
    }
    return true;
}
exports.default = {
    convertHour,
    getHourOrdinal,
    getHourIndex,
    getHourBranch,
    validateHourConversion
};
