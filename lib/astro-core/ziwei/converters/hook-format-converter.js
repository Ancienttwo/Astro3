/**
 * Hook格式转换器
 * Hook Format Converter
 *
 * @ai-context HOOK_FORMAT_CONVERTER
 * @preload ZiWeiCompleteChart, HookBirthInfo, AlgorithmRegistry
 * @algorithm-dependency ziwei-registry
 */
import { BRANCH_NAMES } from '../types/hook-format-types';
/**
 * 转换出生信息为Hook格式
 */
export function convertBirthInfoToHook(birthInfo) {
    const base = {
        // 公历信息
        year: birthInfo.solar.year,
        month: birthInfo.solar.month,
        day: birthInfo.solar.day,
        hour: birthInfo.solar.hour,
        gender: birthInfo.solar.gender,
        isLunar: birthInfo.solar.isLunar,
        // 农历信息
        yearStem: birthInfo.lunar.yearStem,
        yearBranch: birthInfo.lunar.yearBranch,
        yearGanzhi: birthInfo.lunar.yearGanzhi,
        monthLunar: birthInfo.lunar.monthLunar,
        dayLunar: birthInfo.lunar.dayLunar,
        hourBranch: getBranchIndex(birthInfo.lunar.hourBranch),
    };
    if (typeof birthInfo.lunar.isLeapMonth === 'boolean') {
        base.isLeapMonth = birthInfo.lunar.isLeapMonth;
    }
    return base;
}
/**
 * 获取地支索引 (0-11 对应 子-亥)
 */
function getBranchIndex(branchName) {
    const index = BRANCH_NAMES.indexOf(branchName);
    return index >= 0 ? index : 0;
}
/**
 * 转换星曜信息为Hook格式
 */
function convertStarToHook(star) {
    const types = [];
    // 处理生年四化（A/B/C/D）
    if (star.sihua && /^[ABCD]$/.test(star.sihua))
        types.push(star.sihua);
    // 处理自化（x*/i*），支持空格或逗号分隔的多个标记
    if (star.self_sihua) {
        const parts = String(star.self_sihua).split(/[\s,]+/).filter(Boolean);
        for (const p of parts) {
            if (/^(i|x)[ABCD]$/.test(p))
                types.push(p);
        }
    }
    const base = {
        name: star.name,
        brightness: star.bright,
    };
    if (types.length > 0) {
        base.type = types;
    }
    return base;
}
/**
 * 转换大运信息为Hook格式
 */
function convertMajorPeriodToHook(period) {
    return {
        period: period.period,
        startAge: period.startAge,
        endAge: period.endAge,
        startYear: period.startYear,
        endYear: period.endYear
    };
}
/**
 * 转换五行局信息为Hook格式
 */
function convertFiveElementsBureauToHook(bureau) {
    return {
        name: bureau.name,
        局数: bureau.number
    };
}
/**
 * 生成流年年龄数组
 */
function generateFleetingYears(startAge = 5) {
    const years = [];
    for (let age = startAge; age <= 113; age += 12) {
        years.push(age);
    }
    return years;
}
/**
 * 转换宫位信息为Hook格式
 */
function convertPalaceToHook(palace, branchName, branchIndex) {
    const res = {
        branch: branchName,
        branchIndex: branchIndex,
        stem: palace.stem,
        palaceName: palace.palaceName,
        "mainStars&sihuaStars": palace.mainStars.map(convertStarToHook),
        "auxiliaryStars&sihuaStars": palace.auxiliaryStars.map(convertStarToHook),
        minorStars: palace.minorStars.map(convertStarToHook),
        // 流年：优先使用计算结果，回退到基于环型索引的占位序列
        fleetingYears: palace.fleetingYears ?? generateFleetingYears(5 + branchIndex),
        majorPeriod: convertMajorPeriodToHook(palace.majorPeriod),
        // 小限：必须使用核心算法产出的年龄分布，严禁用流年等价替代
        minorPeriod: palace.minorPeriod ?? []
    };
    // 兼容：显式提供 ringIndex（等于 branchIndex）
    res.ringIndex = branchIndex;
    return res;
}
/**
 * 转换完整紫微命盘为Hook格式
 */
export function convertZiWeiChartToHook(chart) {
    const hookChart = {
        // 基础信息
        birthInfo: convertBirthInfoToHook(chart.birthInfo),
        // 八字信息
        八字: chart.bazi,
        八字起运: chart.baziQiyun,
        八字大运: chart.baziDayun,
        // 紫微核心信息
        // 将位置输出为地支（用于前端定位）
        命宫: (() => {
            for (const p of Object.values(chart.palaces)) {
                if (p?.palaceName === '命宫')
                    return p.branch;
            }
            return '子';
        })(),
        身宫: (() => {
            // 输出宫名：找到与算法定位的身宫 branch 相同的宫，返回其 palaceName
            const branches = BRANCH_NAMES;
            const month = chart.birthInfo.lunar.monthLunar;
            const hourZhiIndex = (chart.birthInfo.lunar.hourBranch && typeof chart.birthInfo.lunar.hourBranch === 'string')
                ? branches.indexOf(chart.birthInfo.lunar.hourBranch)
                : chart.birthInfo.timeZhiIndex ?? 0;
            const monthPalace = (2 + month - 1 + 12) % 12;
            const bodyIndex = (monthPalace + hourZhiIndex) % 12;
            const bodyBranch = branches[bodyIndex] || '子';
            const entry = Object.values(chart.palaces).find((p) => p.branch === bodyBranch);
            return entry?.palaceName || '命宫';
        })(),
        来因宫: chart.laiyinPalace,
        命主: chart.lifeMaster,
        身主: chart.bodyMaster,
        // 斗君：输出为地支字符串（将索引或旧字符串安全映射到 BRANCH_NAMES）
        斗君: (() => {
            const v = chart.doujun;
            const branches = BRANCH_NAMES;
            if (typeof v === 'number')
                return branches[v] || '子';
            const n = Number(v);
            if (Number.isFinite(n))
                return branches[n] || '子';
            if (typeof v === 'string' && branches.includes(v))
                return v;
            return '子';
        })(),
        五行局: convertFiveElementsBureauToHook(chart.fiveElementsBureau),
        // 元数据
        generatedAt: chart.generatedAt,
        version: chart.version
    };
    // 转换十二宫数据
    BRANCH_NAMES.forEach((branchName, index) => {
        const palace = findPalaceByBranch(chart.palaces, branchName);
        if (palace) {
            hookChart[branchName] = convertPalaceToHook(palace, branchName, index);
        }
        else {
            // 创建空宫位
            hookChart[branchName] = createEmptyPalace(branchName, index);
        }
    });
    return hookChart;
}
/**
 * 根据地支查找宫位
 */
function findPalaceByBranch(palaces, branchName) {
    for (const palace of Object.values(palaces)) {
        if (palace.branch === branchName) {
            return palace;
        }
    }
    return null;
}
/**
 * 创建空宫位
 */
function createEmptyPalace(branchName, branchIndex) {
    return {
        branch: branchName,
        branchIndex: branchIndex,
        stem: "", // 需要根据实际算法计算
        palaceName: "", // 需要根据实际算法计算
        "mainStars&sihuaStars": [],
        "auxiliaryStars&sihuaStars": [],
        minorStars: [],
        fleetingYears: generateFleetingYears(5 + branchIndex),
        majorPeriod: {
            period: 0,
            startAge: 0,
            endAge: 0,
            startYear: 0,
            endYear: 0
        },
        minorPeriod: generateFleetingYears(5 + branchIndex)
    };
}
/**
 * Hook格式输入转换为标准输入
 */
export function convertHookInputToStandard(hookInput) {
    return {
        year: hookInput.year,
        month: hookInput.month,
        day: hookInput.day,
        hour: hookInput.hour,
        gender: hookInput.gender,
        isLunar: hookInput.isLunar || false,
        isLeapMonth: hookInput.isLeapMonth || false,
        timezone: 'Asia/Shanghai' // 默认时区
    };
}
//# sourceMappingURL=hook-format-converter.js.map