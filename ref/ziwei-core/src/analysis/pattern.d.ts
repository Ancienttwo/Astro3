import type { ZiWeiHookChart } from '../types/hook-format-types';
import type { MinimalChartDataInput, WealthAnalysisInput, PalaceIdentifier } from './wealth';
import { type CombinationRule } from './fortune-rules';
export type OriginMode = 'self_reliant' | 'supported';
export interface OriginAnalysis {
    palace: PalaceIdentifier | null;
    index: number | null;
    mode: OriginMode | null;
    isInner: boolean | null;
    description: string;
    knowledgeBaseKey: string | null;
}
export type PatternOrientation = 'wealth_oriented' | 'status_oriented' | 'unknown';
export interface InnatePatternAnalysis {
    orientation: PatternOrientation;
    isBroken: boolean;
    isDamaged: boolean;
    recommendation: 'focus_wealth' | 'focus_status' | 'stabilize_first';
    notes: string[];
    referencePalace: {
        name: PalaceIdentifier | null;
        index: number | null;
    };
}
export interface TransformDetail {
    letter: 'A' | 'B' | 'C' | 'D';
    palaceIndices: number[];
    palaceNames: PalaceIdentifier[];
    isBody: boolean;
    isUse: boolean;
    description: string;
    combinationGroups: string[];
    combinationDetails: CombinationRule[];
}
export interface PriorityStage {
    key: 'same' | 'triad' | 'oppositeInner' | 'neighbor';
    label: string;
    indexes: number[];
}
export interface PriorityMatrix {
    stages: PriorityStage[];
    notes: string[];
}
export interface PatternAnalysisResult {
    origin: OriginAnalysis;
    innatePattern: InnatePatternAnalysis;
    natalTransforms: TransformDetail[];
    priority: Record<'A' | 'B' | 'C' | 'D', PriorityMatrix>;
    metadata: {
        birthTransforms: Record<'A' | 'B' | 'C' | 'D', number[]>;
    };
}
export declare function analyzePatternFromWealthInput(input: WealthAnalysisInput, originPalace: PalaceIdentifier | null): PatternAnalysisResult;
export declare function analyzePatternFromHookChart(chart: ZiWeiHookChart): PatternAnalysisResult;
export declare function analyzePatternFromChartData(chart: MinimalChartDataInput, options?: {
    originPalace?: string | null;
}): PatternAnalysisResult;
//# sourceMappingURL=pattern.d.ts.map