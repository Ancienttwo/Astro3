import type { ZiWeiHookChart } from '../types/hook-format-types';
import { type PalaceIdentifier } from './wealth';
import { type MarriageCombinationKey, type MarriageLetter, MARRIAGE_PALACE_ROLES } from './marriage-rules';
export interface MarkerBuckets {
    origin: Record<MarriageLetter, string[]>;
    inward: Record<MarriageLetter, string[]>;
    outward: Record<MarriageLetter, string[]>;
}
export interface MarriagePalaceSummary {
    palace: PalaceIdentifier;
    index: number;
    branch: string | null;
    stem: string | null;
    markers: MarkerBuckets;
    combinations: MarriageCombinationKey[];
    peachStars: string[];
    nobleStars: string[];
}
export interface MarriageFinding {
    rule: string;
    severity: 'info' | 'low' | 'medium' | 'high';
    description: string;
    palaces: PalaceIdentifier[];
    markers: MarriageCombinationKey[];
    notes: string[];
}
export interface MarriagePositiveHighlight {
    palace: PalaceIdentifier;
    combination: MarriageCombinationKey;
    summary: string;
}
export interface MarriageAnalysisResult {
    palaceSummaries: MarriagePalaceSummary[];
    riskFindings: MarriageFinding[];
    positiveHighlights: MarriagePositiveHighlight[];
    meta: {
        palaceIndexMap: Record<number, PalaceIdentifier>;
        letterMeanings: Record<MarriageLetter, string>;
        palaceRoles: typeof MARRIAGE_PALACE_ROLES;
    };
}
export declare function analyzeMarriageFromHook(chart: ZiWeiHookChart): MarriageAnalysisResult;
//# sourceMappingURL=marriage-analysis.d.ts.map