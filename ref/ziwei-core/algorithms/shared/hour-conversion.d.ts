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
export interface HourConversionResult {
    branch: string;
    ordinal: number;
    index: number;
}
/**
 * 统一时辰转换函数
 * 支持24小时制数字和地支字符串输入
 *
 * @param hour - 24小时制数字(0-23)或地支字符串(子、丑、寅...)
 * @returns 转换结果包含地支名称、序数、索引
 */
export declare function convertHour(hour: number | string): HourConversionResult;
/**
 * 获取时辰序数（用于命宫身宫计算）
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 时辰序数（1-12）
 */
export declare function getHourOrdinal(hour: number | string): number;
/**
 * 获取时辰索引（用于星曜定位）
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 时辰索引（0-11）
 */
export declare function getHourIndex(hour: number | string): number;
/**
 * 获取地支名称
 *
 * @param hour - 24小时制数字或地支字符串
 * @returns 地支名称（子、丑、寅...）
 */
export declare function getHourBranch(hour: number | string): string;
/**
 * 验证时辰转换的一致性
 *
 * @returns 验证结果
 */
export declare function validateHourConversion(): boolean;
declare const _default: {
    convertHour: typeof convertHour;
    getHourOrdinal: typeof getHourOrdinal;
    getHourIndex: typeof getHourIndex;
    getHourBranch: typeof getHourBranch;
    validateHourConversion: typeof validateHourConversion;
};
export default _default;
