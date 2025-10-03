"use strict";
/**
 * 八字计算核心算法
 * 从生产环境迁移并优化 - AstroZi Mobile
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaziCalculator = exports.TIANGAN_YINYANG = exports.TIANGAN_ELEMENTS = exports.EARTHLY_BRANCH_PRIMARY_QI = exports.EARTHLY_BRANCH_HIDDEN_STEMS = void 0;
exports.calculateTenGods = calculateTenGods;
const types_1 = require("./types");
// 地支藏干表 - 传统命理学标准
exports.EARTHLY_BRANCH_HIDDEN_STEMS = {
    '子': ['癸'], // 子藏癸水
    '丑': ['己', '癸', '辛'], // 丑藏己土、癸水、辛金
    '寅': ['甲', '丙', '戊'], // 寅藏甲木、丙火、戊土
    '卯': ['乙'], // 卯藏乙木
    '辰': ['戊', '乙', '癸'], // 辰藏戊土、乙木、癸水
    '巳': ['丙', '庚', '戊'], // 巳藏丙火、庚金、戊土
    '午': ['丁', '己'], // 午藏丁火、己土
    '未': ['己', '丁', '乙'], // 未藏己土、丁火、乙木
    '申': ['庚', '壬', '戊'], // 申藏庚金、壬水、戊土
    '酉': ['辛'], // 酉藏辛金
    '戌': ['戊', '辛', '丁'], // 戌藏戊土、辛金、丁火
    '亥': ['壬', '甲'] // 亥藏壬水、甲木
};
// 地支本气表 - 每个地支的主要五行
exports.EARTHLY_BRANCH_PRIMARY_QI = {
    '子': '癸', // 水
    '丑': '己', // 土
    '寅': '甲', // 木
    '卯': '乙', // 木
    '辰': '戊', // 土
    '巳': '丙', // 火
    '午': '丁', // 火
    '未': '己', // 土
    '申': '庚', // 金
    '酉': '辛', // 金
    '戌': '戊', // 土
    '亥': '壬' // 水
};
// 天干五行对应表
exports.TIANGAN_ELEMENTS = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};
// 天干阴阳对应表
exports.TIANGAN_YINYANG = {
    '甲': '阳', '乙': '阴',
    '丙': '阳', '丁': '阴',
    '戊': '阳', '己': '阴',
    '庚': '阳', '辛': '阴',
    '壬': '阳', '癸': '阴'
};
/**
 * 计算天干与日主的十神关系
 */
function calculateTenGods(dayMaster, targetStem) {
    const dayElement = exports.TIANGAN_ELEMENTS[dayMaster];
    const dayYinYang = exports.TIANGAN_YINYANG[dayMaster];
    const targetElement = exports.TIANGAN_ELEMENTS[targetStem];
    const targetYinYang = exports.TIANGAN_YINYANG[targetStem];
    return types_1.TenGodCalculator.getTenGod(dayElement, dayYinYang, targetElement, targetYinYang);
}
/**
 * 八字计算器类
 */
class BaziCalculator {
    /**
     * 完整的八字分析计算
     */
    static calculateBaziAnalysis(baziData) {
        console.log('🔍 开始八字分析计算...');
        const { yearPillar, monthPillar, dayPillar, hourPillar } = baziData;
        const dayMaster = dayPillar.stem;
        const dayMasterElement = exports.TIANGAN_ELEMENTS[dayMaster];
        const dayMasterYinYang = exports.TIANGAN_YINYANG[dayMaster];
        console.log(`日主: ${dayMaster} (${dayMasterElement}${dayMasterYinYang})`);
        // 1. 计算十神关系
        const tenGodsAnalysis = this.calculateTenGodsAnalysis(baziData);
        // 2. 计算五行强度
        const elementStrength = this.calculateElementStrength(baziData);
        // 3. 获取季节影响因子
        const seasonalFactors = types_1.SeasonalMatrix.getAllFactors(monthPillar.branch);
        // 4. 应用季节修正
        const adjustedElementStrength = this.applySeasonalAdjustment(elementStrength, seasonalFactors);
        // 5. 生成分析总结
        const summary = this.generateAnalysisSummary(adjustedElementStrength, tenGodsAnalysis);
        console.log('✅ 八字分析计算完成');
        return {
            dayMaster,
            dayMasterElement,
            dayMasterYinYang,
            pillars: {
                year: yearPillar,
                month: monthPillar,
                day: dayPillar,
                hour: hourPillar
            },
            tenGodsAnalysis,
            elementStrength: adjustedElementStrength,
            seasonalFactors,
            summary
        };
    }
    /**
     * 计算十神分析
     */
    static calculateTenGodsAnalysis(baziData) {
        const { yearPillar, monthPillar, dayPillar, hourPillar } = baziData;
        const dayMaster = dayPillar.stem;
        const analysis = {
            year: {
                stem: calculateTenGods(dayMaster, yearPillar.stem),
                branch: {
                    main: calculateTenGods(dayMaster, exports.EARTHLY_BRANCH_PRIMARY_QI[yearPillar.branch]),
                    hidden: exports.EARTHLY_BRANCH_HIDDEN_STEMS[yearPillar.branch].map(stem => calculateTenGods(dayMaster, stem))
                }
            },
            month: {
                stem: calculateTenGods(dayMaster, monthPillar.stem),
                branch: {
                    main: calculateTenGods(dayMaster, exports.EARTHLY_BRANCH_PRIMARY_QI[monthPillar.branch]),
                    hidden: exports.EARTHLY_BRANCH_HIDDEN_STEMS[monthPillar.branch].map(stem => calculateTenGods(dayMaster, stem))
                }
            },
            day: {
                stem: '比肩', // 日主自己
                branch: {
                    main: calculateTenGods(dayMaster, exports.EARTHLY_BRANCH_PRIMARY_QI[dayPillar.branch]),
                    hidden: exports.EARTHLY_BRANCH_HIDDEN_STEMS[dayPillar.branch].map(stem => calculateTenGods(dayMaster, stem))
                }
            },
            hour: {
                stem: calculateTenGods(dayMaster, hourPillar.stem),
                branch: {
                    main: calculateTenGods(dayMaster, exports.EARTHLY_BRANCH_PRIMARY_QI[hourPillar.branch]),
                    hidden: exports.EARTHLY_BRANCH_HIDDEN_STEMS[hourPillar.branch].map(stem => calculateTenGods(dayMaster, stem))
                }
            }
        };
        return analysis;
    }
    /**
     * 计算五行强度（基础版本）
     */
    static calculateElementStrength(baziData) {
        const strength = {
            '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
        };
        const { yearPillar, monthPillar, dayPillar, hourPillar } = baziData;
        // 计算天干强度（权重2.0）
        const stems = [yearPillar.stem, monthPillar.stem, dayPillar.stem, hourPillar.stem];
        stems.forEach((stem, index) => {
            const element = exports.TIANGAN_ELEMENTS[stem];
            // 月干权重更高，其他干等权重
            const weight = index === 1 ? 2.5 : index === 2 ? 3.0 : 2.0;
            strength[element] += weight;
        });
        // 计算地支本气强度（权重1.5）
        const branches = [yearPillar.branch, monthPillar.branch, dayPillar.branch, hourPillar.branch];
        branches.forEach((branch, index) => {
            const primaryStem = exports.EARTHLY_BRANCH_PRIMARY_QI[branch];
            const element = exports.TIANGAN_ELEMENTS[primaryStem];
            // 月支权重更高
            const weight = index === 1 ? 2.0 : 1.5;
            strength[element] += weight;
        });
        // 计算地支藏干强度（逐层递减权重）
        branches.forEach((branch, index) => {
            const hiddenStems = exports.EARTHLY_BRANCH_HIDDEN_STEMS[branch];
            hiddenStems.forEach((stem, hiddenIndex) => {
                const element = exports.TIANGAN_ELEMENTS[stem];
                // 第一层1.0，第二层0.6，第三层0.3
                const hiddenWeight = hiddenIndex === 0 ? 1.0 : hiddenIndex === 1 ? 0.6 : 0.3;
                // 月支权重更高
                const positionWeight = index === 1 ? 1.5 : 1.0;
                strength[element] += hiddenWeight * positionWeight;
            });
        });
        return strength;
    }
    /**
     * 应用季节修正
     */
    static applySeasonalAdjustment(baseStrength, seasonalFactors) {
        const adjustedStrength = {
            '木': 0, '火': 0, '土': 0, '金': 0, '水': 0
        };
        Object.keys(baseStrength).forEach(element => {
            const el = element;
            adjustedStrength[el] = baseStrength[el] * seasonalFactors[el];
        });
        return adjustedStrength;
    }
    /**
     * 生成分析总结
     */
    static generateAnalysisSummary(elementStrength, tenGodsAnalysis) {
        // 找出最强和最弱的五行
        const sortedElements = Object.keys(elementStrength)
            .sort((a, b) => elementStrength[b] - elementStrength[a]);
        const strongestElement = sortedElements[0];
        const weakestElement = sortedElements[sortedElements.length - 1];
        // 统计十神出现频次
        const tenGodCounts = {};
        Object.values(tenGodsAnalysis).forEach((pillarAnalysis) => {
            // 天干十神
            const stemTenGod = pillarAnalysis.stem;
            tenGodCounts[stemTenGod] = (tenGodCounts[stemTenGod] || 0) + 1;
            // 地支本气十神
            const branchMainTenGod = pillarAnalysis.branch.main;
            tenGodCounts[branchMainTenGod] = (tenGodCounts[branchMainTenGod] || 0) + 0.8;
            // 地支藏干十神
            pillarAnalysis.branch.hidden.forEach((hiddenTenGod, index) => {
                const weight = index === 0 ? 0.6 : index === 1 ? 0.4 : 0.2;
                tenGodCounts[hiddenTenGod] = (tenGodCounts[hiddenTenGod] || 0) + weight;
            });
        });
        // 找出主导十神（出现频次最高的前三个）
        const dominantTenGods = Object.keys(tenGodCounts)
            .sort((a, b) => tenGodCounts[b] - tenGodCounts[a])
            .slice(0, 3);
        // 判断整体平衡
        const maxStrength = Math.max(...Object.values(elementStrength));
        const minStrength = Math.min(...Object.values(elementStrength));
        const strengthRatio = maxStrength / (minStrength + 0.1); // 避免除零
        let overallBalance;
        if (strengthRatio > 3) {
            overallBalance = elementStrength[strongestElement] > 8 ? 'strong' : 'weak';
        }
        else if (strengthRatio < 1.5) {
            overallBalance = 'balanced';
        }
        else {
            overallBalance = 'balanced';
        }
        return {
            strongestElement,
            weakestElement,
            dominantTenGods,
            overallBalance
        };
    }
    /**
     * 简化版八字分析（用于快速计算）
     */
    static quickBaziAnalysis(baziData) {
        const dayMaster = baziData.dayPillar.stem;
        const dayElement = exports.TIANGAN_ELEMENTS[dayMaster];
        const monthBranch = baziData.monthPillar.branch;
        // 获取季节影响
        const seasonalFactor = types_1.SeasonalMatrix.getFactor(monthBranch, dayElement);
        // 简单强弱判断
        let dayMasterStrength = 3.0 * seasonalFactor; // 日主基础分
        // 月支影响
        const monthBranchPrimaryQi = exports.EARTHLY_BRANCH_PRIMARY_QI[monthBranch];
        const monthBranchElement = exports.TIANGAN_ELEMENTS[monthBranchPrimaryQi];
        if (types_1.ElementRelations.generates(monthBranchElement, dayElement)) {
            dayMasterStrength += 2.0; // 月支生日主
        }
        else if (monthBranchElement === dayElement) {
            dayMasterStrength += 1.5; // 月支同类
        }
        else if (types_1.ElementRelations.controls(monthBranchElement, dayElement)) {
            dayMasterStrength -= 1.5; // 月支克日主
        }
        const isStrong = dayMasterStrength > 4.0;
        const isWeak = dayMasterStrength < 2.5;
        return {
            dayMaster,
            dayElement,
            monthBranch,
            seasonalFactor,
            dayMasterStrength,
            isStrong,
            isWeak,
            isBalanced: !isStrong && !isWeak
        };
    }
}
exports.BaziCalculator = BaziCalculator;
