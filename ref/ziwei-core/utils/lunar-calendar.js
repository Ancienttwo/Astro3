"use strict";
/**
 * 农历日历转换工具
 * 基于tyme4ts库的统一接口，通过Algorithm Registry提供公历农历互转功能
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBaziDayun = exports.getBaziPillars = exports.getChineseZodiac = exports.isValidLunarDate = exports.getChineseHourName = exports.hourToChineseHourIndex = exports.formatLunarDate = exports.getCurrentLunarDate = exports.lunarToSolar = exports.solarToLunar = void 0;
const registry_1 = require("../algorithms/registry");
/**
 * 公历转农历
 * @param solarDate 公历日期
 * @returns 农历日期信息
 */
const solarToLunar = (solarDate) => {
    const lunarAlgo = registry_1.AlgorithmRegistry.getLunar();
    const result = lunarAlgo.solarToLunar(solarDate.year, solarDate.month, solarDate.day, solarDate.hour);
    const baziData = lunarAlgo.calculateBaZi(solarDate.year, solarDate.month, solarDate.day, solarDate.hour);
    return {
        year: result.lunarDay.getYear(),
        month: result.lunarDay.getMonth(),
        day: result.lunarDay.getDay(),
        hour: Math.floor(solarDate.hour / 2) * 2 + 1, // 转换为农历时辰
        isLeapMonth: result.lunarDay.getLunarMonth().isLeap(),
        yearGanZhi: baziData.year,
        monthGanZhi: baziData.month,
        dayGanZhi: baziData.day,
        hourGanZhi: baziData.hour,
        yearGan: baziData.year.charAt(0),
        yearZhi: baziData.year.charAt(1),
        monthGan: baziData.month.charAt(0),
        monthZhi: baziData.month.charAt(1),
        dayGan: baziData.day.charAt(0),
        dayZhi: baziData.day.charAt(1),
        hourGan: baziData.hour.charAt(0),
        hourZhi: baziData.hour.charAt(1)
    };
};
exports.solarToLunar = solarToLunar;
/**
 * 农历转公历
 * @param lunarDate 农历日期
 * @returns 公历日期信息
 */
const lunarToSolar = (lunarDate) => {
    const lunarAlgo = registry_1.AlgorithmRegistry.getLunar();
    const solar = lunarAlgo.lunarToSolar(lunarDate.year, lunarDate.month, lunarDate.day, lunarDate.isLeapMonth || false);
    return {
        year: solar.getYear(),
        month: solar.getMonth(),
        day: solar.getDay(),
        hour: lunarDate.hour || 12
    };
};
exports.lunarToSolar = lunarToSolar;
/**
 * 获取当前农历日期
 * @returns 当前农历日期信息
 */
const getCurrentLunarDate = () => {
    const now = new Date();
    return (0, exports.solarToLunar)({
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        hour: now.getHours()
    });
};
exports.getCurrentLunarDate = getCurrentLunarDate;
/**
 * 格式化农历日期显示
 * @param lunarDate 农历日期
 * @returns 格式化的农历日期字符串
 */
const formatLunarDate = (lunarDate) => {
    const monthNames = [
        '正月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '冬月', '腊月'
    ];
    const dayNames = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    const monthStr = lunarDate.isLeapMonth ? `闰${monthNames[lunarDate.month - 1]}` : monthNames[lunarDate.month - 1];
    const dayStr = dayNames[lunarDate.day - 1];
    return `${lunarDate.yearGanZhi}年 ${monthStr} ${dayStr}`;
};
exports.formatLunarDate = formatLunarDate;
/**
 * 将时刻转换为农历时辰索引（用于紫微斗数计算）
 * @param hour 小时（0-23）
 * @returns 时辰索引（0-11，对应子丑寅卯...）
 */
const hourToChineseHourIndex = (hour) => {
    // 23点-1点为子时(0), 1点-3点为丑时(1), 以此类推
    if (hour === 23)
        return 0;
    return Math.floor((hour + 1) / 2) % 12;
};
exports.hourToChineseHourIndex = hourToChineseHourIndex;
/**
 * 获取中文时辰名称
 * @param hourIndex 时辰索引（0-11）
 * @returns 中文时辰名称
 */
const getChineseHourName = (hourIndex) => {
    const hourNames = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
    return hourNames[hourIndex % 12];
};
exports.getChineseHourName = getChineseHourName;
/**
 * 验证农历日期是否有效
 * @param year 农历年
 * @param month 农历月
 * @param day 农历日
 * @param isLeapMonth 是否闰月
 * @returns 是否为有效的农历日期
 */
const isValidLunarDate = (year, month, day, isLeapMonth = false) => {
    try {
        const lunarAlgo = registry_1.AlgorithmRegistry.getLunar();
        const solar = lunarAlgo.lunarToSolar(year, month, day, isLeapMonth);
        const backToLunar = lunarAlgo.solarToLunar(solar.getYear(), solar.getMonth(), solar.getDay());
        return backToLunar.lunarDay.getYear() === year &&
            backToLunar.lunarDay.getMonth() === month &&
            backToLunar.lunarDay.getDay() === day &&
            backToLunar.lunarDay.getLunarMonth().isLeap() === isLeapMonth;
    }
    catch {
        return false;
    }
};
exports.isValidLunarDate = isValidLunarDate;
/**
 * 获取农历年的生肖
 * @param lunarYear 农历年份
 * @returns 生肖名称
 */
const getChineseZodiac = (lunarYear) => {
    const zodiacs = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
    return zodiacs[(lunarYear - 1900) % 12];
};
exports.getChineseZodiac = getChineseZodiac;
/**
 * 获取完整的八字信息（年月日时四柱）
 * @param solarDate 公历日期
 * @returns 八字四柱信息
 */
const getBaziPillars = (solarDate) => {
    const lunarAlgo = registry_1.AlgorithmRegistry.getLunar();
    const baziData = lunarAlgo.calculateBaZi(solarDate.year, solarDate.month, solarDate.day, solarDate.hour);
    return {
        yearPillar: {
            gan: baziData.year.charAt(0),
            zhi: baziData.year.charAt(1),
            ganZhi: baziData.year
        },
        monthPillar: {
            gan: baziData.month.charAt(0),
            zhi: baziData.month.charAt(1),
            ganZhi: baziData.month
        },
        dayPillar: {
            gan: baziData.day.charAt(0),
            zhi: baziData.day.charAt(1),
            ganZhi: baziData.day
        },
        hourPillar: {
            gan: baziData.hour.charAt(0),
            zhi: baziData.hour.charAt(1),
            ganZhi: baziData.hour
        }
    };
};
exports.getBaziPillars = getBaziPillars;
/**
 * 获取八字大运信息（使用 tyme4ts 完整实现）
 * @param solarDate 公历日期
 * @param gender 性别
 * @returns 八字大运信息
 */
const getBaziDayun = (solarDate, gender) => {
    // 使用 tyme4ts 的 SolarTime 和 ChildLimit 获取准确的大运信息
    const { SolarTime, ChildLimit } = require('tyme4ts');
    // 创建 SolarTime 对象
    const solarTime = SolarTime.fromYmdHms(solarDate.year, solarDate.month, solarDate.day, solarDate.hour, 0, 0);
    // 性别代码：tyme4ts 中 1=男，0=女
    const genderCode = gender === 'male' ? 1 : 0;
    // 通过 ChildLimit 获取起运信息和大运列表
    const childLimit = ChildLimit.fromSolarTime(solarTime, genderCode);
    // 获取起运年龄
    const startAge = childLimit.getStartAge();
    // 获取顺逆（tyme4ts 会自动根据年干阴阳和性别计算）
    const isForward = childLimit.isForward();
    // 获取大运列表
    const dayunList = [];
    let fortune = childLimit.getStartDecadeFortune();
    // 生成10个大运
    for (let i = 0; i < 10 && fortune; i++) {
        dayunList.push({
            序号: i + 1,
            干支: fortune.getName(),
            起始年龄: fortune.getStartAge(),
            结束年龄: fortune.getEndAge(),
            起始年份: solarDate.year + fortune.getStartAge(),
            结束年份: solarDate.year + fortune.getEndAge()
        });
        // 获取下一个大运
        fortune = fortune.next(1);
    }
    return {
        起运岁数: startAge,
        顺逆: isForward ? '顺' : '逆',
        运程: dayunList
    };
};
exports.getBaziDayun = getBaziDayun;
exports.default = {
    solarToLunar: exports.solarToLunar,
    lunarToSolar: exports.lunarToSolar,
    getCurrentLunarDate: exports.getCurrentLunarDate,
    formatLunarDate: exports.formatLunarDate,
    hourToChineseHourIndex: exports.hourToChineseHourIndex,
    getChineseHourName: exports.getChineseHourName,
    isValidLunarDate: exports.isValidLunarDate,
    getChineseZodiac: exports.getChineseZodiac,
    getBaziPillars: exports.getBaziPillars,
    getBaziDayun: exports.getBaziDayun
};
