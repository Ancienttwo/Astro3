/**
 * 紫微斗数完整命盘数据类型定义
 * Complete ZiWei Chart API Types
 */
export interface BirthInfo {
    solar: {
        year: number;
        month: number;
        day: number;
        hour: number;
        gender: 'male' | 'female';
        isLunar: boolean;
    };
    lunar: {
        yearStem: string;
        yearBranch: string;
        yearGanzhi: string;
        monthLunar: number;
        dayLunar: number;
        hourBranch: string;
        isLunar?: boolean;
        isLeapMonth?: boolean;
    };
}
export type SihuaType = 'lu' | 'quan' | 'ke' | 'ji';
export type SihuaSource = 'birth' | 'self';
export interface SihuaRecord {
    type: SihuaType;
    source: SihuaSource;
    isActive: boolean;
}
export interface StarInfo {
    name: string;
    bright: string;
    sihua?: string;
    self_sihua?: string;
}
export interface MajorPeriodInfo {
    period: number;
    startAge: number;
    endAge: number;
    startYear: number;
    endYear: number;
}
export interface PalaceSihuaInfo {
    birthYearSihua: {
        star: string;
        type: SihuaType;
    }[];
    selfSihua: {
        star: string;
        type: SihuaType;
        condition: string;
        effect: string;
    }[];
}
export interface PalaceInfo {
    branch: string;
    branchIndex: number;
    stem: string;
    palaceName: string;
    mainStars: StarInfo[];
    auxiliaryStars: StarInfo[];
    minorStars: StarInfo[];
    fleetingYears: number[];
    majorPeriod: MajorPeriodInfo;
    minorPeriod: number[];
    palaceStatus: {
        isEmpty: boolean;
        isBorrowingStars: boolean;
        borrowedFrom?: string;
        strength: 'strong' | 'normal' | 'weak';
        conflictLevel: number;
    };
}
export interface FiveElementsBureau {
    name: string;
    number: string;
}
export interface GlobalSihuaAnalysis {
    birthYearSihua: {
        stem: string;
        transformations: {
            lu: string;
            quan: string;
            ke: string;
            ji: string;
        };
    };
}
export interface ZiWeiCompleteChart {
    birthInfo: BirthInfo;
    bazi: string;
    baziQiyun: string;
    baziDayun: string;
    lifePalace: string;
    bodyPalace: string;
    laiyinPalace: string;
    lifeMaster: string;
    bodyMaster: string;
    doujun: string;
    fiveElementsBureau: FiveElementsBureau;
    palaces: {
        [branchName: string]: PalaceInfo;
    };
    sihuaAnalysis: GlobalSihuaAnalysis;
    generatedAt: string;
    version: string;
}
export interface ZiWeiChartInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: 'male' | 'female';
    isLunar?: boolean;
    isLeapMonth?: boolean;
    timezone?: string;
}
//# sourceMappingURL=complete-chart-types.d.ts.map