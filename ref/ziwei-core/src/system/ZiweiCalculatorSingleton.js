/**
 * 紫微斗数计算器单例
 * ZiWei Calculator Singleton
 *
 * @ai-context ZIWEI_CALCULATOR_SINGLETON
 * @preload AlgorithmRegistry
 * @algorithm-dependency ziwei-core
 */
import { BRANCHES as CORE_BRANCHES } from '../constants/basic-elements';
import { calculateLifePalace, calculateBodyPalace, getPalaceName } from '../calculations/palace-calculations';
import { calculateMasters } from '../calculations/masters';
import { calculateFiveElementsBureauDetail } from '../calculations/bureau-calculations';
import { calculateZiweiPosition, calculateTianfuPosition, calculateMainStarPositions, calculateAuxiliaryStarPositions, calculateMaleficStarPositions, calculateRomanceStarPositions } from '../calculations/star-placements';
import { getStarBrightness } from '../calculations/brightness-calculations';
import { calculateBirthYearSihua } from '../calculations/transformations';
import { calculateMajorPeriods } from '../calculations/period-calculations';
import { createBaZiParams } from '../calculations/data-conversion';
/**
 * 紫微斗数计算器单例类
 * 符合Vibe Coding原则的算法统一访问
 */
export class ZiweiCalculatorSingleton {
    static instance;
    cacheStats = { hits: 0, misses: 0, totalCalculations: 0 };
    calculationCache = new Map();
    constructor() { }
    /**
     * 获取计算器单例实例
     * REQUIRED: 使用单例模式 - 符合算法注册中心原则
     */
    static getInstance() {
        if (!ZiweiCalculatorSingleton.instance) {
            ZiweiCalculatorSingleton.instance = new ZiweiCalculatorSingleton();
        }
        return ZiweiCalculatorSingleton.instance;
    }
    /**
     * 计算完整紫微命盘
     */
    async calculateComplete(input) {
        // 生成缓存键
        const cacheKey = this.generateCacheKey(input);
        // 检查缓存
        if (this.calculationCache.has(cacheKey)) {
            this.cacheStats.hits++;
            return this.calculationCache.get(cacheKey);
        }
        // 执行计算
        this.cacheStats.misses++;
        this.cacheStats.totalCalculations++;
        try {
            // 这里应该调用实际的计算函数
            // 临时使用模拟数据
            const chart = this.performCalculation(input);
            // 缓存结果
            this.calculationCache.set(cacheKey, chart);
            return chart;
        }
        catch (error) {
            throw new Error(`紫微斗数计算失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return { ...this.cacheStats };
    }
    /**
     * 清除缓存
     */
    clearCache() {
        this.calculationCache.clear();
        this.cacheStats = { hits: 0, misses: 0, totalCalculations: 0 };
    }
    /**
     * 生成缓存键
     */
    generateCacheKey(input) {
        return JSON.stringify({
            year: input.year,
            month: input.month,
            day: input.day,
            hour: input.hour,
            gender: input.gender,
            isLunar: input.isLunar || false,
            isLeapMonth: input.isLeapMonth || false
        });
    }
    /**
     * 执行实际计算 (临时模拟实现)
     */
    performCalculation(input) {
        // 使用 tyme4ts 通过 data-conversion 统一入口获取八字与农历信息
        // 为避免对外部类型的强依赖，这里按 any 引入 SolarTime
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { SolarTime } = require('tyme4ts');
        const solarTime = SolarTime.fromYmdHms(input.year, input.month, input.day, input.hour, 0, 0);
        const baziParams = createBaZiParams(solarTime, input.gender === 'male' ? 0 : 1);
        // 基础出生信息（公历 + 农历/干支）
        const birthInfo = {
            solar: {
                year: input.year,
                month: input.month,
                day: input.day,
                hour: input.hour,
                gender: input.gender,
                isLunar: input.isLunar || false,
            },
            lunar: {
                yearStem: baziParams.yearStem,
                yearBranch: baziParams.yearBranch,
                yearGanzhi: `${baziParams.yearStem}${baziParams.yearBranch}`,
                monthLunar: baziParams.lunarMonth,
                dayLunar: baziParams.lunarDay,
                hourBranch: baziParams.timeBranch,
            },
        };
        if (typeof input.isLunar === 'boolean') {
            birthInfo.lunar.isLunar = input.isLunar;
        }
        if (typeof input.isLeapMonth === 'boolean') {
            birthInfo.lunar.isLeapMonth = input.isLeapMonth;
        }
        // 命宫、身宫
        const lifePalaceIndex = calculateLifePalace(baziParams.lunarMonth, baziParams.timeZhiIndex);
        const bodyPalaceIndex = calculateBodyPalace(baziParams.lunarMonth, baziParams.timeZhiIndex);
        // 五行局
        const feb = calculateFiveElementsBureauDetail(baziParams.yearStem, baziParams.yearBranch, baziParams.lunarMonth, baziParams.timeZhiIndex);
        // 主星/辅星/煞星/桃花安星
        const ziweiPos = calculateZiweiPosition(feb.code, baziParams.lunarDay);
        const tianfuPos = calculateTianfuPosition(ziweiPos);
        const mainPos = calculateMainStarPositions(ziweiPos, tianfuPos);
        const auxPos = calculateAuxiliaryStarPositions(baziParams.lunarMonth, baziParams.lunarDay, baziParams.timeZhiIndex, baziParams.yearStem, baziParams.yearBranch);
        const malPos = calculateMaleficStarPositions(baziParams.lunarMonth, baziParams.timeZhiIndex, baziParams.yearStem, baziParams.yearBranch);
        const romancePos = calculateRomanceStarPositions(baziParams.yearBranch, baziParams.lunarMonth);
        // 生年四化 + 自化
        const birthSihua = calculateBirthYearSihua(baziParams.yearStem);
        // 大运（使用 tyme4ts 起运岁数 + 宫位顺逆推算）
        const isYangYear = ['甲', '丙', '戊', '庚', '壬'].includes(baziParams.yearStem);
        const isClockwise = isYangYear === (input.gender === 'male');
        // 起运岁数：按五行局（紫微规则）
        const startAgeByBureau = require('../calculations/period-calculations')
            .calculateMajorPeriodStartAge(feb.code, baziParams.yearStem, input.gender);
        const majorPeriodsAll = calculateMajorPeriods(startAgeByBureau, input.year, lifePalaceIndex, isClockwise);
        // 预计算120岁小限映射：age(1..120) -> palaceIndex，使用正式小限算法
        // 使用 time-calculations 中的小限规则：起始位置由年支决定；男顺女逆
        const startPositions = {
            0: 10, 1: 7, 2: 4, 3: 1, 4: 10, 5: 7, 6: 4, 7: 1, 8: 10, 9: 7, 10: 4, 11: 1
        };
        const startIndex = (() => {
            const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
            const yb = branches.indexOf(baziParams.yearBranch);
            return startPositions[yb] ?? 4;
        })();
        const male = input.gender === 'male';
        const minorLimitByAge = [];
        for (let age = 1; age <= 120; age++) {
            const idx = male ? (startIndex + age - 1) % 12 : (startIndex - age + 1 + 12) % 12;
            minorLimitByAge.push(idx);
        }
        // 宫位构建
        const palaces = {};
        for (let i = 0; i < 12; i++) {
            const branch = CORE_BRANCHES[i] || '子';
            const stem = (() => {
                // 五虎遁：年干起寅，依宫位推天干
                const wuhu = { '甲': '丙', '己': '丙', '乙': '戊', '庚': '戊', '丙': '庚', '辛': '庚', '丁': '壬', '壬': '壬', '戊': '甲', '癸': '甲' };
                const yinStem = wuhu[baziParams.yearStem] || '甲';
                const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                const start = stems.indexOf(yinStem);
                const offsetFromYin = (i - 2 + 12) % 12;
                return (stems[(start + offsetFromYin) % 10] || '甲');
            })();
            // 该宫内的星曜
            const starsAt = (mp) => {
                const res = [];
                mp.forEach((positions, name) => { if (positions.includes(i))
                    res.push(name); });
                return res;
            };
            const mainStarsNames = starsAt(mainPos);
            const auxStarsNames = starsAt(auxPos);
            const maleficNames = starsAt(malPos);
            const romanceNames = starsAt(romancePos);
            // 亮度映射
            const toStarObjects = (names) => names.map((name) => ({
                name,
                bright: (() => {
                    const val = getStarBrightness(name, i);
                    const names7 = ['陷', '不', '平', '利', '得', '旺', '庙'];
                    return names7[val] ?? '平';
                })(),
                // 生年四化标记（A/B/C/D）仅由出生年干决定，与宫干无关
                sihua: (() => {
                    if (birthSihua.A === name)
                        return 'A';
                    if (birthSihua.B === name)
                        return 'B';
                    if (birthSihua.C === name)
                        return 'C';
                    if (birthSihua.D === name)
                        return 'D';
                    return '';
                })(),
                // 自化标记：离心 xA/xB/xC/xD（本宫宫干），向心 iA/iB/iC/iD（对宫宫干）
                self_sihua: (() => {
                    const oppositePalaceIndex = (i + 6) % 12;
                    const stemForIndex = (index) => {
                        const wuhu = { '甲': '丙', '己': '丙', '乙': '戊', '庚': '戊', '丙': '庚', '辛': '庚', '丁': '壬', '壬': '壬', '戊': '甲', '癸': '甲' };
                        const yinStem = wuhu[baziParams.yearStem] || '甲';
                        const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                        const start = stems.indexOf(yinStem);
                        const offsetFromYin = (index - 2 + 12) % 12;
                        return (stems[(start + offsetFromYin) % 10] || '甲');
                    };
                    const oppositeStem = stemForIndex(oppositePalaceIndex);
                    const selfTs = require('../calculations/transformations')
                        .calculateSelfTransformationsDual(stem, oppositeStem, [...mainStarsNames, ...auxStarsNames]);
                    const tsForStar = selfTs.filter((t) => t.star === name);
                    if (tsForStar.length === 0)
                        return '';
                    const mapLetter = (t) => {
                        if (t.type.includes('禄'))
                            return 'A';
                        if (t.type.includes('权'))
                            return 'B';
                        if (t.type.includes('科'))
                            return 'C';
                        if (t.type.includes('忌'))
                            return 'D';
                        return '';
                    };
                    const tokens = tsForStar.map((t) => (t.direction === 'outward' ? 'x' : 'i') + mapLetter(t)).filter((z) => /^(i|x)[ABCD]$/.test(z));
                    return tokens.join(' ');
                })(),
            }));
            const mainStars = toStarObjects(mainStarsNames);
            const auxiliaryStars = toStarObjects(auxStarsNames);
            // 杂曜 = 煞星 + 桃花星（不参与四化，自化），亮度统一“平”
            const minorStars = [...maleficNames, ...romanceNames].map(name => ({ name, bright: '平' }));
            // 本宫大运（若匹配不到，设为0占位，但不使用任何随机/伪造数据）
            const mp = majorPeriodsAll.find(p => p.palaceIndex === i);
            const majorPeriod = mp
                ? { period: mp.period, startAge: mp.startAge, endAge: mp.endAge, startYear: mp.startYear, endYear: mp.endYear }
                : { period: 0, startAge: 0, endAge: 0, startYear: input.year, endYear: input.year };
            // 流年（太岁）按年支推进：出生年支为 age=1，对应环型 (yearBranchIndex + age - 1) % 12
            const yearBranchIndex = CORE_BRANCHES.indexOf(baziParams.yearBranch);
            const fleetingYears = [];
            for (let age = 1; age <= 120; age++) {
                const idx = (yearBranchIndex + age - 1) % 12;
                if (idx === i)
                    fleetingYears.push(age);
            }
            const minorPeriod = (() => {
                const ages = [];
                for (let age = 1; age <= 120; age++)
                    if (minorLimitByAge[age - 1] === i)
                        ages.push(age);
                return ages;
            })();
            palaces[branch] = {
                branch,
                branchIndex: i,
                stem,
                palaceName: getPalaceName(i, lifePalaceIndex),
                mainStars,
                auxiliaryStars,
                minorStars,
                fleetingYears,
                majorPeriod,
                minorPeriod,
                palaceStatus: {
                    isEmpty: mainStars.length === 0,
                    isBorrowingStars: false,
                    strength: mainStars.length > 0 ? 'normal' : 'weak',
                    conflictLevel: 0,
                },
            };
        }
        // 组装完整命盘（符合 convertZiWeiChartToHook 预期结构）
        const complete = {
            birthInfo,
            bazi: `${baziParams.yearStem}${baziParams.yearBranch} ${baziParams.monthStem}${baziParams.monthBranch} ${baziParams.dayStem}${baziParams.dayBranch} ${baziParams.timeStem}${baziParams.timeBranch}`,
            baziQiyun: `${baziParams.qiyunDetail.years}年${baziParams.qiyunDetail.months}个月`,
            baziDayun: baziParams.majorPeriods.map(p => `${p.startAge}-${p.endAge}岁: ${p.stem || ''}${p.branch || ''}`).join(', '),
            lifePalace: getPalaceName(lifePalaceIndex, lifePalaceIndex),
            bodyPalace: getPalaceName(bodyPalaceIndex, lifePalaceIndex),
            // 来因宫：与生年天干相同的宫干所在宫位（五虎遁），输出宫名
            laiyinPalace: (() => {
                const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
                const wuhu = { '甲': '丙', '己': '丙', '乙': '戊', '庚': '戊', '丙': '庚', '辛': '庚', '丁': '壬', '壬': '壬', '戊': '甲', '癸': '甲' };
                const startStem = wuhu[baziParams.yearStem] || '甲';
                const startIdx = stems.indexOf(startStem);
                const yearIdx = stems.indexOf(baziParams.yearStem);
                const k = (yearIdx - startIdx + 10) % 10;
                const laiyinIndex = (2 + k) % 12;
                return getPalaceName(laiyinIndex, lifePalaceIndex);
            })(),
            lifeMaster: calculateMasters(birthInfo.lunar.yearBranch, (CORE_BRANCHES[lifePalaceIndex] || CORE_BRANCHES[lifePalaceIndex % 12])).lifeMaster,
            bodyMaster: calculateMasters(birthInfo.lunar.yearBranch, (CORE_BRANCHES[lifePalaceIndex] || CORE_BRANCHES[lifePalaceIndex % 12])).bodyMaster,
            doujun: `${(lifePalaceIndex + birthInfo.lunar.monthLunar - 1 + 12) % 12}`,
            fiveElementsBureau: { name: feb.name, number: String(feb.局数) },
            palaces,
            sihuaAnalysis: {
                birthYearSihua: {
                    stem: baziParams.yearStem,
                    transformations: { lu: birthSihua.A || '', quan: birthSihua.B || '', ke: birthSihua.C || '', ji: birthSihua.D || '' },
                },
            },
            generatedAt: new Date().toISOString(),
            version: '2.0.0',
        };
        return complete;
    }
}
/**
 * 获取计算器实例的便捷函数
 */
export function getZiweiCalculator() {
    return ZiweiCalculatorSingleton.getInstance();
}
//# sourceMappingURL=ZiweiCalculatorSingleton.js.map