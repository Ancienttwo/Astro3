/**
 * 紫微斗数核心类型定义
 * 从生产环境迁移 - AstroZi Mobile
 */
/**
 * 天干枚举
 */
export declare enum HeavenlyStem {
    JIA = "\u7532",
    YI = "\u4E59",
    BING = "\u4E19",
    DING = "\u4E01",
    WU = "\u620A",
    JI = "\u5DF1",
    GENG = "\u5E9A",
    XIN = "\u8F9B",
    REN = "\u58EC",
    GUI = "\u7678"
}
/**
 * 地支枚举
 */
export declare enum EarthlyBranch {
    ZI = "\u5B50",
    CHOU = "\u4E11",
    YIN = "\u5BC5",
    MAO = "\u536F",
    CHEN = "\u8FB0",
    SI = "\u5DF3",
    WU = "\u5348",
    WEI = "\u672A",
    SHEN = "\u7533",
    YOU = "\u9149",
    XU = "\u620C",
    HAI = "\u4EA5"
}
/**
 * 五行局枚举
 */
export declare enum FiveElementsBureau {
    WATER_TWO = "\u6C34\u4E8C\u5C40",
    WOOD_THREE = "\u6728\u4E09\u5C40",
    METAL_FOUR = "\u91D1\u56DB\u5C40",
    EARTH_FIVE = "\u571F\u4E94\u5C40",
    FIRE_SIX = "\u706B\u516D\u5C40"
}
/**
 * 紫微斗数主星枚举
 */
export declare enum ZiweiMainStar {
    ZIWEI = "\u7D2B\u5FAE",
    TIANJI = "\u5929\u673A",
    TAIYANG = "\u592A\u9633",
    WUQU = "\u6B66\u66F2",
    TIANTONG = "\u5929\u540C",
    LIANZHEN = "\u5EC9\u8D1E",
    TIANFU = "\u5929\u5E9C",
    TAIYIN = "\u592A\u9634",
    TANLANG = "\u8D2A\u72FC",
    JUMEN = "\u5DE8\u95E8",
    TIANXIANG = "\u5929\u76F8",
    TIANLIANG = "\u5929\u6881",
    QISHA = "\u4E03\u6740",
    POJUN = "\u7834\u519B"
}
/**
 * 紫微斗数辅星枚举
 */
export declare enum ZiweiAuxiliaryStar {
    ZUOFU = "\u5DE6\u8F85",
    YOUBI = "\u53F3\u5F3C",
    WENCHANG = "\u6587\u660C",
    WENQU = "\u6587\u66F2",
    LUCUN = "\u7984\u5B58",
    TIANMA = "\u5929\u9A6C",
    QINGYANG = "\u64CE\u7F8A",
    TUOLUO = "\u9640\u7F57",
    HUOXING = "\u706B\u661F",
    LINGXING = "\u94C3\u661F",
    TIANKUI = "\u5929\u9B41",
    TIANYUE = "\u5929\u94BA"
}
/**
 * 紫微斗数小星枚举（部分常用）
 */
export declare enum ZiweiMinorStar {
    HONGLUAN = "\u7EA2\u9E3E",
    TIANXI = "\u5929\u559C",
    GUCHEN = "\u5B64\u8FB0",
    GUASU = "\u5BE1\u5BBF",
    TIANKU = "\u5929\u54ED",
    TIANXU = "\u5929\u865A",
    LONGCHI = "\u9F99\u6C60",
    FENGGE = "\u51E4\u9601",
    SANTAI = "\u4E09\u53F0",
    BAZUO = "\u516B\u5EA7"
}
/**
 * 四化枚举
 */
export declare enum SiHua {
    LU = "\u7984",
    QUAN = "\u6743",
    KE = "\u79D1",
    JI = "\u5FCC"
}
/**
 * 十二宫位枚举
 */
export declare enum ZiweiPalace {
    MING = "\u547D\u5BAB",
    XIONGDI = "\u5144\u5F1F\u5BAB",
    FUQI = "\u592B\u59BB\u5BAB",
    ZINV = "\u5B50\u5973\u5BAB",
    CAIBO = "\u8D22\u5E1B\u5BAB",
    JIBING = "\u75BE\u5384\u5BAB",
    QIANYI = "\u8FC1\u79FB\u5BAB",
    NUNU = "\u5974\u4EC6\u5BAB",
    GUANLU = "\u5B98\u7984\u5BAB",
    TIANZHAI = "\u7530\u5B85\u5BAB",
    FUDE = "\u798F\u5FB7\u5BAB",
    FUMU = "\u7236\u6BCD\u5BAB"
}
/**
 * 命宫计算结果
 */
export interface LifePalaceResult {
    lifePalaceBranch: EarthlyBranch;
    lifePalaceBranchIndex: number;
}
/**
 * 身宫计算结果
 */
export interface BodyPalaceResult {
    bodyPalaceBranch: EarthlyBranch;
}
/**
 * 来因宫计算结果
 */
export interface LaiyinPalaceResult {
    laiyinPalaceBranch: EarthlyBranch;
}
/**
 * 星曜信息
 */
export interface StarInfo {
    name: string;
    type: 'main' | 'auxiliary' | 'minor';
    brightness?: 'temple' | 'prosperous' | 'stable' | 'fall' | 'trap';
    sihua?: SiHua;
}
/**
 * 宫位信息
 */
export interface PalaceInfo {
    name: ZiweiPalace;
    earthlyBranch: EarthlyBranch;
    heavenlyStem: HeavenlyStem;
    stars: StarInfo[];
    isLifePalace: boolean;
    isBodyPalace: boolean;
}
/**
 * 紫微斗数输入数据
 */
export interface ZiweiInputData {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    lunarHour: number | string;
    gender: 'male' | 'female';
    yearStem: HeavenlyStem;
    yearBranch: EarthlyBranch;
}
/**
 * 紫微斗数排盘结果
 */
export interface ZiweiChartResult {
    inputData: ZiweiInputData;
    lifePalace: LifePalaceResult;
    bodyPalace: BodyPalaceResult;
    laiyinPalace: LaiyinPalaceResult | null;
    fiveElementsBureau: FiveElementsBureau;
    palaces: PalaceInfo[];
    mainStarPositions: Record<ZiweiMainStar, number>;
    auxiliaryStarPositions: Record<string, number>;
    sihuaAnalysis: {
        luhua: {
            star: string;
            palace: number;
        };
        quanhua: {
            star: string;
            palace: number;
        };
        kehua: {
            star: string;
            palace: number;
        };
        jihua: {
            star: string;
            palace: number;
        };
    };
}
/**
 * 紫微斗数分析结果
 */
export interface ZiweiAnalysisResult {
    chartResult: ZiweiChartResult;
    personalityAnalysis: {
        lifePalaceAnalysis: string;
        bodyPalaceAnalysis: string;
        mainStarCombination: string;
        overallPersonality: string;
    };
    careerAnalysis: {
        careerDirection: string[];
        workStyle: string;
        leadershipPotential: string;
        careerChallenges: string[];
    };
    relationshipAnalysis: {
        marriagePalaceAnalysis: string;
        relationshipPattern: string;
        compatibility: string;
        familyRelations: string;
    };
    wealthAnalysis: {
        wealthPalaceAnalysis: string;
        incomePattern: string;
        investmentAdvice: string;
        financialChallenges: string[];
    };
    healthAnalysis: {
        healthPalaceAnalysis: string;
        physicalCondition: string;
        healthRisks: string[];
        wellnessAdvice: string;
    };
    overallFortune: {
        strengths: string[];
        challenges: string[];
        lifeTheme: string;
        developmentSuggestions: string[];
    };
}
/**
 * 命宫计算函数类型
 * 支持hourBranch统一接口
 */
export type CalculateLifePalaceFunction = (lunarMonth: number, lunarHour: number | string) => LifePalaceResult;
/**
 * 身宫计算函数类型
 * 支持hourBranch统一接口
 */
export type CalculateBodyPalaceFunction = (lunarMonth: number, lunarHour: number | string) => BodyPalaceResult;
/**
 * 五行局计算函数类型
 */
export type GetFiveElementsBureauFunction = (yearGan: HeavenlyStem, lifePalaceBranch: EarthlyBranch) => FiveElementsBureau;
/**
 * 星曜安排函数类型
 */
export type ArrangeStarsFunction = (lifePalaceIndex: number, bodyPalaceIndex: number, fiveElementsBureau: FiveElementsBureau, yearStem: HeavenlyStem, yearBranch: EarthlyBranch, lunarMonth: number, lunarDay: number, lunarHour: number) => {
    mainStars: Record<ZiweiMainStar, number>;
    auxiliaryStars: Record<string, number>;
};
/**
 * 地支索引映射
 */
export declare const EARTHLY_BRANCH_INDICES: Record<EarthlyBranch, number>;
/**
 * 宫位名称数组（按地支顺序）
 */
export declare const PALACE_NAMES: ZiweiPalace[];
declare const _default: {
    HeavenlyStem: typeof HeavenlyStem;
    EarthlyBranch: typeof EarthlyBranch;
    FiveElementsBureau: typeof FiveElementsBureau;
    ZiweiMainStar: typeof ZiweiMainStar;
    ZiweiAuxiliaryStar: typeof ZiweiAuxiliaryStar;
    ZiweiMinorStar: typeof ZiweiMinorStar;
    SiHua: typeof SiHua;
    ZiweiPalace: typeof ZiweiPalace;
    EARTHLY_BRANCH_INDICES: Record<EarthlyBranch, number>;
    PALACE_NAMES: ZiweiPalace[];
};
export default _default;
