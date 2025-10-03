/**
 * 农历日历转换工具
 * 基于tyme4ts库的统一接口，通过Algorithm Registry提供公历农历互转功能
 */
export interface LunarDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    isLeapMonth: boolean;
    yearGanZhi: string;
    monthGanZhi: string;
    dayGanZhi: string;
    hourGanZhi: string;
    yearGan: string;
    yearZhi: string;
    monthGan: string;
    monthZhi: string;
    dayGan: string;
    dayZhi: string;
    hourGan: string;
    hourZhi: string;
}
export interface SolarDate {
    year: number;
    month: number;
    day: number;
    hour: number;
}
/**
 * 公历转农历
 * @param solarDate 公历日期
 * @returns 农历日期信息
 */
export declare const solarToLunar: (solarDate: SolarDate) => LunarDate;
/**
 * 农历转公历
 * @param lunarDate 农历日期
 * @returns 公历日期信息
 */
export declare const lunarToSolar: (lunarDate: {
    year: number;
    month: number;
    day: number;
    hour?: number;
    isLeapMonth?: boolean;
}) => SolarDate;
/**
 * 获取当前农历日期
 * @returns 当前农历日期信息
 */
export declare const getCurrentLunarDate: () => LunarDate;
/**
 * 格式化农历日期显示
 * @param lunarDate 农历日期
 * @returns 格式化的农历日期字符串
 */
export declare const formatLunarDate: (lunarDate: LunarDate) => string;
/**
 * 将时刻转换为农历时辰索引（用于紫微斗数计算）
 * @param hour 小时（0-23）
 * @returns 时辰索引（0-11，对应子丑寅卯...）
 */
export declare const hourToChineseHourIndex: (hour: number) => number;
/**
 * 获取中文时辰名称
 * @param hourIndex 时辰索引（0-11）
 * @returns 中文时辰名称
 */
export declare const getChineseHourName: (hourIndex: number) => string;
/**
 * 验证农历日期是否有效
 * @param year 农历年
 * @param month 农历月
 * @param day 农历日
 * @param isLeapMonth 是否闰月
 * @returns 是否为有效的农历日期
 */
export declare const isValidLunarDate: (year: number, month: number, day: number, isLeapMonth?: boolean) => boolean;
/**
 * 获取农历年的生肖
 * @param lunarYear 农历年份
 * @returns 生肖名称
 */
export declare const getChineseZodiac: (lunarYear: number) => string;
/**
 * 单个柱的信息接口
 */
export interface BaziPillar {
    gan: string;      // 天干 (甲乙丙丁戊己庚辛壬癸)
    zhi: string;      // 地支 (子丑寅卯辰巳午未申酉戌亥)
    ganZhi: string;   // 干支组合 (如 "甲子")
}

/**
 * 八字四柱信息接口
 */
export interface BaziPillars {
    yearPillar: BaziPillar;
    monthPillar: BaziPillar;
    dayPillar: BaziPillar;
    hourPillar: BaziPillar;
}

/**
 * 获取完整的八字信息（年月日时四柱）
 * @param solarDate 公历日期
 * @returns 八字四柱信息
 */
export declare const getBaziPillars: (solarDate: SolarDate) => BaziPillars;
/**
 * 大运运程信息
 */
export interface DayunPeriod {
    序号: number;
    干支: string;      // 大运干支 (如 "甲子")
    起始年龄: number;  // 起始虚岁
    结束年龄: number;  // 结束虚岁
    起始年份: number;  // 起始公历年份
    结束年份: number;  // 结束公历年份
}

/**
 * 八字大运信息
 */
export interface BaziDayun {
    起运岁数: number;   // 起运虚岁
    顺逆: string;       // "顺行" 或 "逆行"
    运程: DayunPeriod[];
}

/**
 * 获取八字大运信息（使用 tyme4ts 完整实现）
 * @param solarDate 公历日期
 * @param gender 性别
 * @returns 八字大运信息
 */
export declare const getBaziDayun: (solarDate: SolarDate, gender: "male" | "female") => BaziDayun;
declare const _default: {
    solarToLunar: (solarDate: SolarDate) => LunarDate;
    lunarToSolar: (lunarDate: {
        year: number;
        month: number;
        day: number;
        hour?: number;
        isLeapMonth?: boolean;
    }) => SolarDate;
    getCurrentLunarDate: () => LunarDate;
    formatLunarDate: (lunarDate: LunarDate) => string;
    hourToChineseHourIndex: (hour: number) => number;
    getChineseHourName: (hourIndex: number) => string;
    isValidLunarDate: (year: number, month: number, day: number, isLeapMonth?: boolean) => boolean;
    getChineseZodiac: (lunarYear: number) => string;
    getBaziPillars: (solarDate: SolarDate) => BaziPillars;
    getBaziDayun: (solarDate: SolarDate, gender: "male" | "female") => BaziDayun;
};
export default _default;
