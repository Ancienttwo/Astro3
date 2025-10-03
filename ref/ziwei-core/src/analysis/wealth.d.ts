import type { ZiWeiHookChart } from '../types/hook-format-types';
export type PalaceIdentifier = '命宫' | '兄弟宫' | '夫妻宫' | '子女宫' | '财帛宫' | '疾厄宫' | '迁移宫' | '交友宫' | '官禄宫' | '田宅宫' | '福德宫' | '父母宫';
export interface WealthStarInput {
    name: string;
    markers: string[];
}
export interface WealthPalaceInput {
    index: number;
    name: PalaceIdentifier;
    branch: string;
    stem?: string;
    stars?: WealthStarInput[];
}
export interface WealthAnalysisInput {
    palaces: WealthPalaceInput[];
}
export interface MinimalChartPalaceInput {
    branch: string;
    stem?: string;
    name?: string;
    stars?: Array<{
        name: string;
        sihuaOrigin?: string | null;
        sihuaInward?: string | null;
        sihuaOutward?: string | null;
    }>;
}
export interface MinimalChartDataInput {
    palaces: MinimalChartPalaceInput[];
}
export interface PalaceRoleInsight {
    palace: PalaceIdentifier;
    index: number;
    tags: string[];
    description: string;
}
export interface PalaceCombinationInsight {
    palace: PalaceIdentifier;
    index: number;
    combinations: string[];
    markers: string[];
}
export interface WealthAnalysisResult {
    palaceRoles: PalaceRoleInsight[];
    palaceCombinations: PalaceCombinationInsight[];
}
export declare const PALACE_ORDER: PalaceIdentifier[];
export declare const PALACE_NAME_ALIASES: Record<string, PalaceIdentifier>;
export declare function analyzeWealthStructure(input: WealthAnalysisInput): WealthAnalysisResult;
export declare function buildWealthInputFromHook(chart: ZiWeiHookChart): WealthAnalysisInput;
export declare function buildWealthInputFromChartData(chart: MinimalChartDataInput): WealthAnalysisInput;
//# sourceMappingURL=wealth.d.ts.map