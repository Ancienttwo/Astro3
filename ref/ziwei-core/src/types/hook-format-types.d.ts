/**
 * 紫微斗数Hook接口数据格式类型定义
 * ZiWei Hook Interface Data Format Types
 *
 * @ai-context ZIWEI_HOOK_INTERFACE
 * @preload tyme4ts, AlgorithmRegistry
 * @algorithm-dependency ziwei-calculator
 */
export interface HookBirthInfo {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: string;
    isLunar: boolean;
    yearStem: string;
    yearBranch: string;
    yearGanzhi: string;
    monthLunar: number;
    dayLunar: number;
    hourBranch: number;
    isLeapMonth?: boolean;
}
export interface HookStarInfo {
    name: string;
    brightness: string;
    type?: string[];
}
export interface HookMajorPeriod {
    period: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
}
export interface HookFiveElementsBureau {
    name: string;
    局数: string;
}
export interface HookPalaceInfo {
    branch: string;
    branchIndex: number;
    stem: string;
    palaceName: string;
    "mainStars&sihuaStars": HookStarInfo[];
    "auxiliaryStars&sihuaStars": HookStarInfo[];
    minorStars: HookStarInfo[];
    fleetingYears: number[];
    majorPeriod: HookMajorPeriod;
    minorPeriod: number[];
}
export interface ZiWeiHookChart {
    [branchName: string]: unknown;
    birthInfo: HookBirthInfo;
    八字: string;
    八字起运: string;
    八字大运: string;
    命宫: string;
    身宫: string;
    来因宫: string;
    命主: string;
    身主: string;
    斗君: string;
    五行局: HookFiveElementsBureau;
    子: HookPalaceInfo;
    丑: HookPalaceInfo;
    寅: HookPalaceInfo;
    卯: HookPalaceInfo;
    辰: HookPalaceInfo;
    巳: HookPalaceInfo;
    午: HookPalaceInfo;
    未: HookPalaceInfo;
    申: HookPalaceInfo;
    酉: HookPalaceInfo;
    戌: HookPalaceInfo;
    亥: HookPalaceInfo;
    generatedAt?: string;
    version?: string;
}
export interface HookCalculationInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: "male" | "female";
    isLunar?: boolean;
    isLeapMonth?: boolean;
}
export declare const SIHUA_TYPES: {
    readonly BIRTH_LU: "iA";
    readonly BIRTH_QUAN: "iB";
    readonly BIRTH_KE: "iC";
    readonly BIRTH_JI: "iD";
    readonly SELF_LU: "xA";
    readonly SELF_QUAN: "xB";
    readonly SELF_KE: "xC";
    readonly SELF_JI: "xD";
    readonly STAR_TYPE_D: "D";
};
export declare const BRANCH_NAMES: readonly ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
export type BranchName = typeof BRANCH_NAMES[number];
export declare const STAR_BRIGHTNESS: {
    readonly TEMPLE: "庙";
    readonly PROSPER: "旺";
    readonly GAIN: "得";
    readonly BENEFIT: "利";
    readonly NORMAL: "平";
    readonly FALL: "陷";
};
export type StarBrightness = typeof STAR_BRIGHTNESS[keyof typeof STAR_BRIGHTNESS];
//# sourceMappingURL=hook-format-types.d.ts.map