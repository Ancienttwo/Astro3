/**
 * 紫微斗数计算工具函数
 * Calculation utility functions for ZiWei DouShu
 */
/**
 * 计算年干支
 * Calculate year stem and branch
 */
export declare function calculateYearGanZhi(year: number): {
    stem: string;
    branch: string;
};
/**
 * 计算命宫位置
 * Calculate Life Palace position
 */
export declare function calculateLifePalace(month: number, hour: number): number;
/**
 * 计算身宫位置
 * Calculate Body Palace position
 */
export declare function calculateBodyPalace(month: number, hour: number): number;
/**
 * 计算五行局详细信息
 * Calculate detailed Five Elements Bureau information
 */
export declare function calculateFiveElementsBureauDetail(yearStem: string, yearBranch: string, month: number, hour: number): {
    name: string;
    局数: number;
    element: string;
    code: string;
};
/**
 * 计算紫微星位置
 * Calculate ZiWei star position
 */
export declare function calculateZiweiPosition(bureau: string, day: number): number;
/**
 * 计算天府星位置
 * Calculate TianFu star position
 */
export declare function calculateTianfuPosition(ziweiPosition: number): number;
/**
 * 计算十四主星位置
 * Calculate positions of 14 main stars
 */
export declare function calculateMainStarPositions(ziweiPos: number, tianfuPos: number): Map<string, number[]>;
/**
 * 计算辅星位置
 * Calculate auxiliary star positions
 */
export declare function calculateAuxiliaryStarPositions(month: number, day: number, hour: number, yearStem: string): Map<string, number[]>;
/**
 * 计算小星位置
 * Calculate minor star positions
 */
export declare function calculateMinorStarPositions(month: number, day: number, hour: number, yearBranch: string): Map<string, number[]>;
/**
 * 计算生年四化
 * Calculate birth year Si Hua transformations
 */
export declare function calculateBirthYearSihua(yearStem: string): {
    A: string;
    B: string;
    C: string;
    D: string;
};
/**
 * 计算飞宫四化
 * Calculate flying palace Si Hua transformations
 */
export declare function calculateFlyingPalaceSihua(palaceStem: string, targetPalaceIndex: number, sourcePalaceIndex: number): Array<{
    star: string;
    type: string;
}>;
/**
 * 计算命主身主
 * Calculate life and body masters
 */
export declare function calculateMasters(yearBranch: string): {
    lifeMaster: string;
    bodyMaster: string;
};
/**
 * 获取先天斗君宫位索引
 * Get Innate Dou Jun palace index
 */
export declare function getInnateDauPalaceIndex(month: number, timeZhiIndex: number): number;
/**
 * 计算大运起运岁数
 * Calculate major period start age
 */
export declare function calculateMajorPeriodStartAge(bureau: string, yearStem: string, gender: 'male' | 'female'): number;
/**
 * 计算大运信息
 * Calculate major period information
 */
export declare function calculateMajorPeriods(startAge: number, birthYear: number, lifePalaceIndex: number, isClockwise: boolean): Array<{
    period: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
    palaceIndex: number;
}>;
/**
 * 计算流年岁数
 * Calculate fleeting year ages for a branch
 */
export declare function calculateFleetingYears(branchIndex: number): number[];
/**
 * 获取宫位名称
 * Get palace name by index relative to life palace
 */
export declare function getPalaceName(index: number, lifePalaceIndex: number): string;
