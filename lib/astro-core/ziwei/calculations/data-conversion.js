/**
 * 紫微斗数数据转换与预处理模块
 * Data Conversion & Preprocessing Module for ZiWei DouShu
 *
 * @description
 * 提供从 tyme4ts 到紫微斗数计算所需的数据转换功能
 * Provides data conversion functions from tyme4ts to ZiWei calculations
 *
 * @module DataConversion
 * @version 2.0.0
 */
import { STEMS, BRANCHES } from '../constants';
/**
 * 从 tyme4ts 创建 BaZi 参数对象
 * Create BaZi parameters from tyme4ts objects
 *
 * @description
 * 此函数是所有紫微斗数计算的入口点，确保数据的准确性和一致性。
 * This function is the entry point for all ZiWei calculations, ensuring data accuracy and consistency.
 *
 * @param solarTime tyme4ts SolarTime 对象
 * @param gender 性别 (0=男性，1=女性，影响大运起运方向)
 * @returns BaZiParams 包含所有计算所需的基础数据
 *
 * @example
 * ```typescript
 * import { SolarTime } from 'tyme4ts'
 * const solarTime = SolarTime.fromYmdHms(1989, 2, 1, 14, 30, 0)
 * const baziParams = createBaZiParams(solarTime, 0) // 0=男性
 * ```
 */
export function createBaZiParams(solarTime, gender = 0) {
    // 兼容当前 tyme4ts API：通过 EightChar 获取四柱
    const { ChildLimit, Gender } = require('tyme4ts');
    const solarDay = solarTime.getSolarDay();
    const lunarDay = solarDay.getLunarDay();
    const lunarMonth = lunarDay.getLunarMonth();
    const eightChar = solarTime.getLunarHour().getEightChar();
    const yearName = String(eightChar.getYear().getName());
    const monthName = String(eightChar.getMonth().getName());
    const dayName = String(eightChar.getDay().getName());
    const hourName = String(eightChar.getHour().getName());
    const yearStem = yearName.charAt(0);
    const yearBranch = yearName.charAt(1);
    const monthStem = monthName.charAt(0);
    const monthBranch = monthName.charAt(1);
    const dayStem = dayName.charAt(0);
    const dayBranch = dayName.charAt(1);
    const timeStem = hourName.charAt(0);
    const timeBranch = hourName.charAt(1);
    // Narrow arbitrary string to Branch union safely, defaulting to '子' when unknown
    const asBranch = (s) => {
        return BRANCHES.includes(s)
            ? s
            : '子';
    };
    // 起运（ChildLimit）
    const childLimit = ChildLimit.fromSolarTime(solarTime, gender === 0 ? Gender.MAN : Gender.WOMAN);
    const startAge = childLimit.getStartAge();
    // 计算大运干支数组（使用 DecadeFortune 获取准确干支与起止年龄）
    const { DecadeFortune } = require('tyme4ts');
    const majorPeriods = [];
    for (let i = 0; i < 8; i++) {
        const df = DecadeFortune.fromChildLimit(childLimit, i);
        const sc = df.getSixtyCycle().getName();
        const stem = sc.charAt(0);
        const branch = sc.charAt(1);
        majorPeriods.push({ stem, branch, startAge: df.getStartAge(), endAge: df.getEndAge() });
    }
    return {
        yearStem,
        yearBranch,
        monthStem,
        monthBranch,
        dayStem,
        dayBranch,
        timeStem,
        timeBranch,
        lunarMonth: lunarMonth.getMonth(),
        lunarDay: lunarDay.getDay(),
        isLeapMonth: lunarMonth.isLeap(),
        timeZhiIndex: BRANCHES.indexOf(asBranch(timeBranch)),
        majorPeriods,
        startMajorPeriodAge: startAge,
        qiyunDetail: { years: childLimit.getYearCount(), months: childLimit.getMonthCount(), days: childLimit.getDayCount() },
    };
}
/**
 * 计算年干支
 * Calculate year stem and branch
 *
 * @deprecated 建议使用 tyme4ts 的八字功能替代此函数
 * @deprecated Use tyme4ts eight-character (八字) functionality instead
 *
 * @param year 年份
 * @returns 年干支对象
 */
export function calculateYearGanZhi(year) {
    const stemIndex = (year - 4) % 10;
    const branchIndex = (year - 4) % 12;
    return {
        stem: (STEMS[stemIndex] || STEMS[(stemIndex + 10) % 10]),
        branch: (BRANCHES[branchIndex] || BRANCHES[(branchIndex + 12) % 12])
    };
}
//# sourceMappingURL=data-conversion.js.map