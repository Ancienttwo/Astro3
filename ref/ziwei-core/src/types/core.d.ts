/**
 * Core type definitions for ZiWei Dou Shu calculations
 * 紫微斗数核心类型定义
 */
/**
 * Ten Heavenly Stems (天干)
 */
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';
/**
 * Twelve Earthly Branches (地支)
 */
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';
/**
 * Five Elements (五行)
 */
export type FiveElement = '木' | '火' | '土' | '金' | '水';
/**
 * Yin Yang (阴阳)
 */
export type YinYang = '阴' | '阳';
/**
 * Five Elements Bureau Names (五行局名称)
 */
export type FiveElementsBureauName = '水二局' | '木三局' | '金四局' | '土五局' | '火六局';
/**
 * Five Elements Bureau Codes (五行局代码)
 */
export type FiveElementsBureauCode = 'water_2' | 'wood_3' | 'metal_4' | 'earth_5' | 'fire_6';
/**
 * Five Elements Bureau (五行局)
 */
export type FiveElementsBureau = FiveElementsBureauName;
/**
 * Algorithm Type (算法类型)
 */
export type AlgorithmType = 'ziwei' | 'bazi' | 'qimen' | 'liuyao';
import type { StarName } from '../constants/star-systems';
export type { StarName } from '../constants/star-systems';
/**
 * Twelve Palace Names (十二宫名称)
 */
export type PalaceName = '命宫' | '兄弟' | '夫妻' | '子女' | '财帛' | '疾厄' | '迁移' | '交友' | '官禄' | '田宅' | '福德' | '父母';
/**
 * Palace Position (宫位信息)
 */
export interface PalacePosition {
    index: number;
    name: PalaceName;
    branch: EarthlyBranch;
    stem: HeavenlyStem;
    element: FiveElement;
}
/**
 * Star Category (星曜类别)
 */
export type StarCategory = '主星' | '辅星' | '煞星' | '小星' | '桃花' | '吉星' | '杂曜';
/**
 * Star Brightness (星曜亮度)
 */
export type StarBrightness = '庙' | '旺' | '得' | '利' | '平' | '不' | '陷';
/**
 * Star Information (星曜信息)
 */
export interface Star {
    name: StarName;
    category: StarCategory;
    element?: FiveElement;
    brightness?: StarBrightness;
    isMainStar?: boolean;
    transformationType?: SihuaType;
    sihuaTransformations?: SihuaTransformation[];
}
/**
 * Four Transformations Type (四化类型)
 */
export type SihuaType = '化禄' | '化权' | '化科' | '化忌';
/**
 * Self-transformation Type (自化类型)
 */
export type SelfTransformationType = 'xA' | 'xB' | 'xC' | 'xD' | 'iA' | 'iB' | 'iC' | 'iD';
/**
 * Sihua Information (四化信息)
 */
export interface SihuaInfo {
    type: SihuaType;
    star: string;
    sourceStem: HeavenlyStem;
    sourcePalace?: PalaceName;
    targetPalace?: PalaceName;
    isSelfTransformation?: boolean;
    selfTransformationType?: SelfTransformationType;
}
/**
 * Sihua Transformation (四化转换)
 * Used for detailed sihua calculations
 */
export interface SihuaTransformation {
    star: string;
    type: SihuaType;
    source: 'birth' | 'palace' | 'self-outward' | 'self-inward' | 'flying';
    sourcePalaceIndex?: number;
    targetPalaceIndex?: number;
    code: string;
    description?: string;
}
/**
 * Birth Information (出生信息)
 */
export interface BirthInfo {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute?: number;
    gender?: 'male' | 'female';
    isLunar?: boolean;
    isLeapMonth?: boolean;
    timezone?: string;
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
    };
}
/**
 * Lunar Date Information (农历信息)
 */
export interface LunarDate {
    year: number;
    month: number;
    day: number;
    hour: number;
    isLeapMonth: boolean;
    yearStem: HeavenlyStem;
    yearBranch: EarthlyBranch;
    monthStem: HeavenlyStem;
    monthBranch: EarthlyBranch;
    dayStem: HeavenlyStem;
    dayBranch: EarthlyBranch;
    hourStem: HeavenlyStem;
    hourBranch: EarthlyBranch;
}
/**
 * Palace Data (宫位数据)
 */
export interface PalaceData {
    position: PalacePosition;
    stars: Star[];
    sihua: SihuaInfo[];
    selfTransformations: SelfTransformationType[];
    majorStarCount: number;
    isEmpty: boolean;
}
/**
 * Complete Chart Data (完整命盘数据)
 */
export interface CompleteChart {
    birthInfo: BirthInfo;
    lunarDate: LunarDate;
    palaces: Map<PalaceName, PalaceData>;
    lifePalaceIndex: number;
    bodyPalaceIndex: number;
    globalSihua: SihuaInfo[];
    metadata: {
        calculatedAt: Date;
        version: string;
        calculationTime: number;
    };
}
/**
 * Calculation Options (计算选项)
 */
export interface CalculationOptions {
    includeMinorStars?: boolean;
    includeSihua?: boolean;
    calculateTransformations?: boolean;
    calculateSelfTransformations?: boolean;
    calculateRelationships?: boolean;
    useCache?: boolean;
    parallelCalculation?: boolean;
    fiveElementsBureau?: FiveElementsBureau;
}
/**
 * Error details type for calculation errors
 */
export interface CalculationErrorDetails {
    input?: unknown;
    step?: string;
    context?: Record<string, unknown>;
    [key: string]: unknown;
}
/**
 * Calculation Error (计算错误)
 */
export declare class ZiWeiCalculationError extends Error {
    code: string;
    details?: CalculationErrorDetails | undefined;
    constructor(message: string, code: string, details?: CalculationErrorDetails | undefined);
}
/**
 * Validation Error (验证错误)
 */
export declare class ZiWeiValidationError extends Error {
    field: string;
    value?: unknown | undefined;
    constructor(message: string, field: string, value?: unknown | undefined);
}
//# sourceMappingURL=core.d.ts.map