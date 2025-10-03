"use strict";
/**
 * 紫微斗数核心计算算法
 * 从生产环境完整迁移 - AstroZi Mobile
 *
 * 包含：
 * - 命宫、身宫、来因宫计算（100%迁移算法）
 * - 五行局推断
 * - 十二宫天干计算
 * - 星曜排盘（14主星系统）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZiweiCalculator = exports.getStemByIndex = exports.getStemIndex = exports.getBranchByIndex = exports.getBranchIndex = exports.arrangePojunStar = exports.arrangeQishaStar = exports.arrangeTianliangStar = exports.arrangeTianxiangStar = exports.arrangeJumenStar = exports.arrangeTanlangStar = exports.arrangeTaiyinStar = exports.arrangeTianfuStar = exports.arrangeLianzhenStar = exports.arrangeTiantongStar = exports.arrangeWuquStar = exports.arrangeTaiyangStar = exports.arrangeTianjiStar = exports.arrangeZiweiStar = exports.getOppositePalace = exports.calculatePalaceStems = exports.getFiveElementsBureau = exports.calculateLaiyinPalace = exports.calculateBodyPalace = exports.calculateLifePalace = void 0;
const types_1 = require("./types");
const hour_conversion_1 = require("../shared/hour-conversion");
// ==================== 常量定义（从生产环境迁移）====================
const EARTHLY_BRANCHES = [
    types_1.EarthlyBranch.ZI,
    types_1.EarthlyBranch.CHOU,
    types_1.EarthlyBranch.YIN,
    types_1.EarthlyBranch.MAO,
    types_1.EarthlyBranch.CHEN,
    types_1.EarthlyBranch.SI,
    types_1.EarthlyBranch.WU,
    types_1.EarthlyBranch.WEI,
    types_1.EarthlyBranch.SHEN,
    types_1.EarthlyBranch.YOU,
    types_1.EarthlyBranch.XU,
    types_1.EarthlyBranch.HAI,
];
const MONTH_BRANCHES = [
    types_1.EarthlyBranch.YIN,
    types_1.EarthlyBranch.MAO,
    types_1.EarthlyBranch.CHEN,
    types_1.EarthlyBranch.SI,
    types_1.EarthlyBranch.WU,
    types_1.EarthlyBranch.WEI,
    types_1.EarthlyBranch.SHEN,
    types_1.EarthlyBranch.YOU,
    types_1.EarthlyBranch.XU,
    types_1.EarthlyBranch.HAI,
    types_1.EarthlyBranch.ZI,
    types_1.EarthlyBranch.CHOU,
];
const HEAVENLY_STEMS = [
    types_1.HeavenlyStem.JIA,
    types_1.HeavenlyStem.YI,
    types_1.HeavenlyStem.BING,
    types_1.HeavenlyStem.DING,
    types_1.HeavenlyStem.WU,
    types_1.HeavenlyStem.JI,
    types_1.HeavenlyStem.GENG,
    types_1.HeavenlyStem.XIN,
    types_1.HeavenlyStem.REN,
    types_1.HeavenlyStem.GUI,
];
// ==================== 核心算法函数（100%迁移源文件算法）====================
/**
 * 命宫计算（正确的紫微斗数算法）
 * 规则：寅宫起正月，顺数生月，子时起数，逆数生时
 * 支持hourBranch统一接口
 */
const calculateLifePalace = (lunarMonth, lunarHour) => {
    // 1. 计算时辰序号（子时=1, 丑时=2, ...亥时=12）- 使用统一工具
    const hourNumber = (0, hour_conversion_1.getHourOrdinal)(lunarHour);
    // 2. 寅宫起正月，顺数到月宫
    const yinIndex = 2; // 寅在地支中的索引
    const monthPalaceIndex = (yinIndex + (lunarMonth - 1)) % 12;
    // 3. 从月宫起子时，逆数生时得命宫
    // 注意：起点算第1个，所以要减(hourNumber - 1)
    const lifePalaceBranchIndex = (monthPalaceIndex - (hourNumber - 1) + 12) % 12;
    const lifePalaceBranch = EARTHLY_BRANCHES[lifePalaceBranchIndex];
    return {
        lifePalaceBranch,
        lifePalaceBranchIndex,
    };
};
exports.calculateLifePalace = calculateLifePalace;
/**
 * 身宫计算（正确的紫微斗数算法）
 * 规则：寅宫起正月，顺数生月，子时起数，顺数生时
 * 支持hourBranch统一接口
 */
const calculateBodyPalace = (lunarMonth, lunarHour) => {
    // 1. 计算时辰序号（同命宫统一逻辑）- 使用统一工具
    const hourNumber = (0, hour_conversion_1.getHourOrdinal)(lunarHour);
    // 2. 寅宫起正月，顺数到月宫
    const yinIndex = 2; // 寅在地支中的索引
    const monthPalaceIndex = (yinIndex + (lunarMonth - 1)) % 12;
    // 3. 从月宫起子时，顺数生时得身宫
    const bodyPalaceBranchIndex = (monthPalaceIndex + (hourNumber - 1)) % 12;
    const bodyPalaceBranch = EARTHLY_BRANCHES[bodyPalaceBranchIndex];
    return { bodyPalaceBranch };
};
exports.calculateBodyPalace = calculateBodyPalace;
/**
 * 来因宫计算（100%迁移源文件算法）
 */
const calculateLaiyinPalace = (yearGan, palaceStems) => {
    // 在宫位天干中找到年干所在的宫位
    const laiyinBranchIndex = palaceStems.indexOf(yearGan);
    if (laiyinBranchIndex === -1) {
        return null;
    }
    // 月支顺序对应的地支
    const laiyinPalaceBranch = MONTH_BRANCHES[laiyinBranchIndex];
    return { laiyinPalaceBranch };
};
exports.calculateLaiyinPalace = calculateLaiyinPalace;
/**
 * 五行局计算（100%迁移源文件算法）
 */
const getFiveElementsBureau = (yearGan, lifePalaceBranch) => {
    // 天干分组映射
    const stemToGroup = {
        [types_1.HeavenlyStem.JIA]: '甲己',
        [types_1.HeavenlyStem.JI]: '甲己',
        [types_1.HeavenlyStem.YI]: '乙庚',
        [types_1.HeavenlyStem.GENG]: '乙庚',
        [types_1.HeavenlyStem.BING]: '丙辛',
        [types_1.HeavenlyStem.XIN]: '丙辛',
        [types_1.HeavenlyStem.DING]: '丁壬',
        [types_1.HeavenlyStem.REN]: '丁壬',
        [types_1.HeavenlyStem.WU]: '戊癸',
        [types_1.HeavenlyStem.GUI]: '戊癸',
    };
    // 地支索引映射
    const branchToIndex = {
        [types_1.EarthlyBranch.ZI]: 0,
        [types_1.EarthlyBranch.CHOU]: 0,
        [types_1.EarthlyBranch.YIN]: 1,
        [types_1.EarthlyBranch.MAO]: 1,
        [types_1.EarthlyBranch.CHEN]: 2,
        [types_1.EarthlyBranch.SI]: 2,
        [types_1.EarthlyBranch.WU]: 3,
        [types_1.EarthlyBranch.WEI]: 3,
        [types_1.EarthlyBranch.SHEN]: 4,
        [types_1.EarthlyBranch.YOU]: 4,
        [types_1.EarthlyBranch.XU]: 5,
        [types_1.EarthlyBranch.HAI]: 5,
    };
    // 五行局查询表（根据正确的紫微斗数表格）
    // 行：天干组（甲己、乙庚、丙辛、丁壬、戊癸）
    // 列：地支组（子丑、寅卯、辰巳、午未、申酉、戌亥）
    const bureauTable = [
        // 甲己年生
        [
            types_1.FiveElementsBureau.WATER_TWO, // 子丑
            types_1.FiveElementsBureau.FIRE_SIX, // 寅卯
            types_1.FiveElementsBureau.WOOD_THREE, // 辰巳
            types_1.FiveElementsBureau.EARTH_FIVE, // 午未
            types_1.FiveElementsBureau.METAL_FOUR, // 申酉
            types_1.FiveElementsBureau.FIRE_SIX, // 戌亥
        ],
        // 乙庚年生
        [
            types_1.FiveElementsBureau.FIRE_SIX, // 子丑
            types_1.FiveElementsBureau.EARTH_FIVE, // 寅卯
            types_1.FiveElementsBureau.METAL_FOUR, // 辰巳
            types_1.FiveElementsBureau.WOOD_THREE, // 午未
            types_1.FiveElementsBureau.WATER_TWO, // 申酉
            types_1.FiveElementsBureau.EARTH_FIVE, // 戌亥
        ],
        // 丙辛年生
        [
            types_1.FiveElementsBureau.EARTH_FIVE, // 子丑
            types_1.FiveElementsBureau.METAL_FOUR, // 寅卯
            types_1.FiveElementsBureau.WATER_TWO, // 辰巳
            types_1.FiveElementsBureau.FIRE_SIX, // 午未
            types_1.FiveElementsBureau.WOOD_THREE, // 申酉
            types_1.FiveElementsBureau.METAL_FOUR, // 戌亥
        ],
        // 丁壬年生
        [
            types_1.FiveElementsBureau.METAL_FOUR, // 子丑
            types_1.FiveElementsBureau.WOOD_THREE, // 寅卯
            types_1.FiveElementsBureau.FIRE_SIX, // 辰巳
            types_1.FiveElementsBureau.WATER_TWO, // 午未
            types_1.FiveElementsBureau.EARTH_FIVE, // 申酉
            types_1.FiveElementsBureau.WOOD_THREE, // 戌亥
        ],
        // 戊癸年生
        [
            types_1.FiveElementsBureau.WOOD_THREE, // 子丑
            types_1.FiveElementsBureau.WATER_TWO, // 寅卯
            types_1.FiveElementsBureau.EARTH_FIVE, // 辰巳
            types_1.FiveElementsBureau.FIRE_SIX, // 午未 (修正：应该是火六局)
            types_1.FiveElementsBureau.METAL_FOUR, // 申酉
            types_1.FiveElementsBureau.WATER_TWO, // 戌亥
        ],
    ];
    const stemGroup = stemToGroup[yearGan];
    const branchIndex = branchToIndex[lifePalaceBranch];
    if (stemGroup && branchIndex !== undefined) {
        const groupIndex = ['甲己', '乙庚', '丙辛', '丁壬', '戊癸'].indexOf(stemGroup);
        if (groupIndex !== -1) {
            return bureauTable[groupIndex][branchIndex];
        }
    }
    // 默认值
    return types_1.FiveElementsBureau.METAL_FOUR;
};
exports.getFiveElementsBureau = getFiveElementsBureau;
/**
 * 计算十二宫天干（五虎遁月表）
 */
const calculatePalaceStems = (yearGan) => {
    // 五虎遁月表：确定寅宫的起始天干
    const FIVE_TIGER_DUN = {
        [types_1.HeavenlyStem.JIA]: types_1.HeavenlyStem.BING,
        [types_1.HeavenlyStem.JI]: types_1.HeavenlyStem.BING,
        [types_1.HeavenlyStem.YI]: types_1.HeavenlyStem.WU,
        [types_1.HeavenlyStem.GENG]: types_1.HeavenlyStem.WU,
        [types_1.HeavenlyStem.BING]: types_1.HeavenlyStem.GENG,
        [types_1.HeavenlyStem.XIN]: types_1.HeavenlyStem.GENG,
        [types_1.HeavenlyStem.DING]: types_1.HeavenlyStem.REN,
        [types_1.HeavenlyStem.REN]: types_1.HeavenlyStem.REN,
        [types_1.HeavenlyStem.WU]: types_1.HeavenlyStem.JIA,
        [types_1.HeavenlyStem.GUI]: types_1.HeavenlyStem.JIA,
    };
    // 获取寅宫的起始天干
    const yinGan = FIVE_TIGER_DUN[yearGan];
    const yinGanIndex = HEAVENLY_STEMS.indexOf(yinGan);
    // 创建结果数组 - 按月支顺序
    const palaceStems = new Array(12);
    // 从寅宫开始，顺序排列十个天干（寅、卯、辰、巳、午、未、申、酉、戌、亥）
    for (let i = 0; i < 10; i++) {
        // 前10个：寅到亥
        const stemIndex = (yinGanIndex + i) % 10;
        palaceStems[i] = HEAVENLY_STEMS[stemIndex];
    }
    // 子宫天干同寅宫，丑宫天干同卯宫
    palaceStems[10] = palaceStems[0]; // 子干同寅
    palaceStems[11] = palaceStems[1]; // 丑干同卯
    return palaceStems; // 返回按月支顺序的天干数组
};
exports.calculatePalaceStems = calculatePalaceStems;
/**
 * 获取对宫地支
 */
const getOppositePalace = (branch) => {
    const OPPOSITION_MAP = {
        [types_1.EarthlyBranch.ZI]: types_1.EarthlyBranch.WU,
        [types_1.EarthlyBranch.CHOU]: types_1.EarthlyBranch.WEI,
        [types_1.EarthlyBranch.YIN]: types_1.EarthlyBranch.SHEN,
        [types_1.EarthlyBranch.MAO]: types_1.EarthlyBranch.YOU,
        [types_1.EarthlyBranch.CHEN]: types_1.EarthlyBranch.XU,
        [types_1.EarthlyBranch.SI]: types_1.EarthlyBranch.HAI,
        [types_1.EarthlyBranch.WU]: types_1.EarthlyBranch.ZI,
        [types_1.EarthlyBranch.WEI]: types_1.EarthlyBranch.CHOU,
        [types_1.EarthlyBranch.SHEN]: types_1.EarthlyBranch.YIN,
        [types_1.EarthlyBranch.YOU]: types_1.EarthlyBranch.MAO,
        [types_1.EarthlyBranch.XU]: types_1.EarthlyBranch.CHEN,
        [types_1.EarthlyBranch.HAI]: types_1.EarthlyBranch.SI,
    };
    return OPPOSITION_MAP[branch] || null;
};
exports.getOppositePalace = getOppositePalace;
// ==================== 星曜排盘系统（紫微斗数14主星）====================
/**
 * 紫微星安排（根据五行局和农历生日）
 */
const arrangeZiweiStar = (fiveElementsBureau, lunarDay) => {
    // 紫微星排盘表（根据正确的紫微斗数表格）
    // 数组索引 = 农历日 - 1，值为地支索引（0=子，1=丑，...，10=戌，11=亥）
    const ZIWEI_TABLE = {
        // 水二局（根据表格准确录入）
        [types_1.FiveElementsBureau.WATER_TWO]: [
            1, 1, 2, 2, 3, 3, // 初一到初六：丑丑寅寅卯卯
            4, 4, 5, 5, 6, 6, // 初七到十二：辰辰巳巳午午
            7, 7, 8, 8, 9, 9, // 十三到十八：未未申申酉酉
            10, 10, 11, 11, 0, 0, // 十九到廿四：戌戌亥亥子子
            1, 1, 2, 2, 3, 3 // 廿五到三十：丑丑寅寅卯卯
        ],
        // 木三局（根据表格准确录入）
        [types_1.FiveElementsBureau.WOOD_THREE]: [
            4, 1, 1, 5, 2, 2, // 初一到初六：辰丑丑巳寅寅
            6, 3, 3, 7, 4, 4, // 初七到十二：午卯卯未辰辰
            8, 5, 5, 9, 6, 6, // 十三到十八：申巳巳酉午午
            10, 7, 7, 11, 8, 8, // 十九到廿四：戌未未亥申申
            0, 9, 9, 1, 10, 10 // 廿五到三十：子酉酉丑戌戌
        ],
        // 金四局（根据表格准确录入）
        [types_1.FiveElementsBureau.METAL_FOUR]: [
            11, 11, 0, 0, 1, 1, // 初一到初六：亥亥子子丑丑
            2, 2, 3, 3, 4, 4, // 初七到十二：寅寅卯卯辰辰
            5, 5, 6, 6, 7, 7, // 十三到十八：巳巳午午未未
            8, 8, 9, 9, 10, 10, // 十九到廿四：申申酉酉戌戌
            11, 11, 0, 0, 1, 1 // 廿五到三十：亥亥子子丑丑
        ],
        // 土五局（根据表格准确录入）
        [types_1.FiveElementsBureau.EARTH_FIVE]: [
            6, 6, 7, 7, 8, 8, // 初一到初六：午午未未申申
            9, 9, 10, 10, 11, 11, // 初七到十二：酉酉戌戌亥亥
            0, 0, 1, 1, 2, 2, // 十三到十八：子子丑丑寅寅
            3, 3, 4, 4, 5, 5, // 十九到廿四：卯卯辰辰巳巳
            6, 6, 7, 7, 8, 8 // 廿五到三十：午午未未申申
        ],
        // 火六局（根据表格准确录入）
        [types_1.FiveElementsBureau.FIRE_SIX]: [
            2, 3, 3, 4, 4, 5, // 初一到初六：寅卯卯辰辰巳
            10, 10, 6, 6, 7, 7, // 初七到十二：戌戌午午未未  ← 初七是戌宫！
            1, 1, 8, 8, 9, 9, // 十三到十八：丑丑申申酉酉
            5, 5, 10, 10, 11, 11, // 十九到廿四：巳巳戌戌亥亥
            3, 3, 0, 0, 1, 1 // 廿五到三十：卯卯子子丑丑
        ]
    };
    const dayIndex = Math.min(lunarDay - 1, 29); // 确保索引不超出数组范围
    return ZIWEI_TABLE[fiveElementsBureau][dayIndex];
};
exports.arrangeZiweiStar = arrangeZiweiStar;
/**
 * 天机星安排（紫微逆时针第1宫，即前一宫）
 */
const arrangeTianjiStar = (ziweiPosition) => {
    // 天机在紫微的前一宫（逆时针）
    return (ziweiPosition - 1 + 12) % 12;
};
exports.arrangeTianjiStar = arrangeTianjiStar;
/**
 * 太阳星安排（紫微逆时针第3宫）
 */
const arrangeTaiyangStar = (ziweiPosition) => {
    // 太阳在紫微的逆时针第3宫
    return (ziweiPosition - 3 + 12) % 12;
};
exports.arrangeTaiyangStar = arrangeTaiyangStar;
/**
 * 武曲星安排（紫微逆时针第4宫）
 */
const arrangeWuquStar = (ziweiPosition) => {
    // 武曲在紫微的逆时针第4宫
    return (ziweiPosition - 4 + 12) % 12;
};
exports.arrangeWuquStar = arrangeWuquStar;
/**
 * 天同星安排（紫微逆时针第5宫）
 */
const arrangeTiantongStar = (ziweiPosition) => {
    // 天同在紫微的逆时针第5宫
    return (ziweiPosition - 5 + 12) % 12;
};
exports.arrangeTiantongStar = arrangeTiantongStar;
/**
 * 廉贞星安排（紫微逆时针第8宫）
 */
const arrangeLianzhenStar = (ziweiPosition) => {
    // 廉贞在紫微的逆时针第8宫
    return (ziweiPosition - 8 + 12) % 12;
};
exports.arrangeLianzhenStar = arrangeLianzhenStar;
/**
 * 天府星安排（根据紫微天府对角关系）
 */
const arrangeTianfuStar = (ziweiPosition) => {
    // 使用生产环境的正确公式
    // tianfuPosIndex = (12 - ziweiPosIndex + 4) % 12
    return (12 - ziweiPosition + 4) % 12;
};
exports.arrangeTianfuStar = arrangeTianfuStar;
/**
 * 太阴星安排（天府星系，天府顺行第1宫）
 */
const arrangeTaiyinStar = (tianfuPosition) => {
    // 太阴在天府顺行第1宫（即天府的下一宫）
    return (tianfuPosition + 1) % 12;
};
exports.arrangeTaiyinStar = arrangeTaiyinStar;
/**
 * 贪狼星安排（天府顺时针第2宫）
 */
const arrangeTanlangStar = (tianfuPosition) => {
    // 贪狼在天府顺时针第2宫（太阴之后）
    return (tianfuPosition + 2) % 12;
};
exports.arrangeTanlangStar = arrangeTanlangStar;
/**
 * 巨门星安排（天府顺时针第3宫）
 */
const arrangeJumenStar = (tianfuPosition) => {
    // 巨门在天府的顺时针第3宫
    return (tianfuPosition + 3) % 12;
};
exports.arrangeJumenStar = arrangeJumenStar;
/**
 * 天相星安排（天府顺时针第4宫）
 */
const arrangeTianxiangStar = (tianfuPosition) => {
    // 天相在天府的顺时针第4宫
    return (tianfuPosition + 4) % 12;
};
exports.arrangeTianxiangStar = arrangeTianxiangStar;
/**
 * 天梁星安排（天府顺时针第5宫）
 */
const arrangeTianliangStar = (tianfuPosition) => {
    // 天梁在天府的顺时针第5宫
    return (tianfuPosition + 5) % 12;
};
exports.arrangeTianliangStar = arrangeTianliangStar;
/**
 * 七杀星安排（天府顺时针第6宫）
 */
const arrangeQishaStar = (tianfuPosition) => {
    // 七杀在天府的顺时针第6宫
    return (tianfuPosition + 6) % 12;
};
exports.arrangeQishaStar = arrangeQishaStar;
/**
 * 破军星安排（天府顺时针第10宫）
 */
const arrangePojunStar = (tianfuPosition) => {
    // 破军在天府的顺时针第10宫
    return (tianfuPosition + 10) % 12;
};
exports.arrangePojunStar = arrangePojunStar;
// ==================== 工具函数 ====================
/**
 * 地支索引转换工具
 */
const getBranchIndex = (branch) => {
    return EARTHLY_BRANCHES.indexOf(branch);
};
exports.getBranchIndex = getBranchIndex;
/**
 * 索引转地支工具
 */
const getBranchByIndex = (index) => {
    return EARTHLY_BRANCHES[index % 12];
};
exports.getBranchByIndex = getBranchByIndex;
/**
 * 天干索引转换工具
 */
const getStemIndex = (stem) => {
    return HEAVENLY_STEMS.indexOf(stem);
};
exports.getStemIndex = getStemIndex;
/**
 * 索引转天干工具
 */
const getStemByIndex = (index) => {
    return HEAVENLY_STEMS[index % 10];
};
exports.getStemByIndex = getStemByIndex;
// ==================== 主要计算器类 ====================
class ZiweiCalculator {
    /**
     * 紫微斗数完整排盘计算（集成完整134星系统）
     */
    static calculateZiweiChart(inputData) {
        try {
            // 1. 计算基本宫位
            const lifePalace = (0, exports.calculateLifePalace)(inputData.lunarMonth, inputData.lunarHour);
            const bodyPalace = (0, exports.calculateBodyPalace)(inputData.lunarMonth, inputData.lunarHour);
            const fiveElementsBureau = (0, exports.getFiveElementsBureau)(inputData.yearStem, lifePalace.lifePalaceBranch);
            // 2. 计算宫位天干
            const palaceStems = (0, exports.calculatePalaceStems)(inputData.yearStem);
            const laiyinPalace = (0, exports.calculateLaiyinPalace)(inputData.yearStem, palaceStems);
            // 3. 生成完整的134星系统（使用生产级算法）
            // 🚨【关键依赖 - 禁止删除】🚨
            // 动态调用算法层获取完整的134星数据
            // 依赖文件: ./star-positioning.ts 中的 generateZiweiChart() 函数
            const { generateZiweiChart } = require('./star-positioning');
            const completeChart = generateZiweiChart(inputData);
            // 4. 创建宫位信息（按逆时针排列十二宫）
            const palaces = [];
            // 十二宫名称（从命宫开始逆时针排列）
            const PALACE_NAMES_COUNTERCLOCKWISE = [
                types_1.ZiweiPalace.MING, types_1.ZiweiPalace.XIONGDI, types_1.ZiweiPalace.FUQI, types_1.ZiweiPalace.ZINV,
                types_1.ZiweiPalace.CAIBO, types_1.ZiweiPalace.JIBING, types_1.ZiweiPalace.QIANYI, types_1.ZiweiPalace.NUNU,
                types_1.ZiweiPalace.GUANLU, types_1.ZiweiPalace.TIANZHAI, types_1.ZiweiPalace.FUDE, types_1.ZiweiPalace.FUMU
            ];
            for (let i = 0; i < 12; i++) {
                // 从命宫位置开始，逆时针分配宫位
                const palaceIndex = (lifePalace.lifePalaceBranchIndex - i + 12) % 12;
                const earthlyBranch = (0, exports.getBranchByIndex)(palaceIndex);
                const heavenlyStem = palaceStems[palaceIndex];
                // 从完整星盘中获取当前地支的所有星曜
                const branchStars = completeChart.starMap.get(earthlyBranch) || [];
                palaces.push({
                    name: PALACE_NAMES_COUNTERCLOCKWISE[i],
                    earthlyBranch,
                    heavenlyStem,
                    stars: branchStars,
                    isLifePalace: i === 0,
                    isBodyPalace: (0, exports.getBranchIndex)(bodyPalace.bodyPalaceBranch) === palaceIndex
                });
            }
            // 5. 提取主星位置信息
            const mainStarPositions = {};
            completeChart.starMap.forEach((stars, branch) => {
                const branchIndex = (0, exports.getBranchIndex)(branch);
                stars.forEach(star => {
                    if (star.type === 'main') {
                        const starKey = star.name;
                        if (Object.values(types_1.ZiweiMainStar).includes(starKey)) {
                            mainStarPositions[starKey] = branchIndex;
                        }
                    }
                });
            });
            // 6. 提取辅星位置信息
            const auxiliaryStarPositions = {};
            completeChart.starMap.forEach((stars, branch) => {
                const branchIndex = (0, exports.getBranchIndex)(branch);
                stars.forEach(star => {
                    if (star.type === 'auxiliary' || star.type === 'minor') {
                        auxiliaryStarPositions[star.name] = branchIndex;
                    }
                });
            });
            // 7. 四化分析（基于完整星盘）
            const sihuaAnalysis = {
                luhua: { star: '禄存', palace: auxiliaryStarPositions['禄存'] || 0 },
                quanhua: { star: '天魁', palace: auxiliaryStarPositions['天魁'] || 0 },
                kehua: { star: '文昌', palace: auxiliaryStarPositions['文昌'] || 0 },
                jihua: { star: '擎羊', palace: auxiliaryStarPositions['擎羊'] || 0 }
            };
            return {
                inputData,
                lifePalace,
                bodyPalace,
                laiyinPalace,
                fiveElementsBureau,
                palaces,
                mainStarPositions,
                auxiliaryStarPositions,
                sihuaAnalysis
            };
        }
        catch (error) {
            console.error('ZiWei calculation error:', error);
            throw new Error('紫微斗数排盘计算失败');
        }
    }
    /**
     * 紫微斗数分析（基础版）
     */
    static analyzeZiweiChart(chartResult) {
        const { lifePalace, palaces, mainStarPositions, fiveElementsBureau } = chartResult;
        // 获取命宫主星
        const lifePalaceInfo = palaces.find(p => p.isLifePalace);
        const lifePalaceMainStars = lifePalaceInfo?.stars.filter(s => s.type === 'main').map(s => s.name) || [];
        // 基础性格分析
        const personalityAnalysis = {
            lifePalaceAnalysis: `命宫位于${lifePalace.lifePalaceBranch}，五行局为${fiveElementsBureau}`,
            bodyPalaceAnalysis: `身宫位于${chartResult.bodyPalace.bodyPalaceBranch}`,
            mainStarCombination: `命宫主星：${lifePalaceMainStars.join('、')}`,
            overallPersonality: '性格分析需要详细解读命宫星曜组合'
        };
        // 基础事业分析
        const careerAnalysis = {
            careerDirection: ['管理类', '技术类'],
            workStyle: '稳重踏实',
            leadershipPotential: '具备领导潜质',
            careerChallenges: ['需要提升沟通能力']
        };
        // 基础感情分析
        const relationshipAnalysis = {
            marriagePalaceAnalysis: '夫妻宫分析',
            relationshipPattern: '重情重义',
            compatibility: '与土象星座较为合拍',
            familyRelations: '家庭关系和谐'
        };
        // 基础财富分析
        const wealthAnalysis = {
            wealthPalaceAnalysis: '财帛宫分析',
            incomePattern: '收入稳定',
            investmentAdvice: '适合稳健投资',
            financialChallenges: ['需要理性消费']
        };
        // 基础健康分析
        const healthAnalysis = {
            healthPalaceAnalysis: '疾厄宫分析',
            physicalCondition: '身体状况良好',
            healthRisks: ['注意消化系统'],
            wellnessAdvice: '保持规律作息'
        };
        // 整体运势
        const overallFortune = {
            strengths: ['意志坚定', '责任心强'],
            challenges: ['需要增强灵活性'],
            lifeTheme: '稳步发展，追求卓越',
            developmentSuggestions: ['保持学习心态', '扩大社交圈子']
        };
        return {
            chartResult,
            personalityAnalysis,
            careerAnalysis,
            relationshipAnalysis,
            wealthAnalysis,
            healthAnalysis,
            overallFortune
        };
    }
}
exports.ZiweiCalculator = ZiweiCalculator;
