import type { ZiWeiHookChart } from '../types/hook-format-types';
import type { PalaceIdentifier } from './wealth';
export type HealthLetter = 'A' | 'B' | 'C' | 'D';
interface MarkerBuckets {
    origin: Record<HealthLetter, string[]>;
    inward: Record<HealthLetter, string[]>;
    outward: Record<HealthLetter, string[]>;
}
export interface PalaceMarkerSummary {
    palace: PalaceIdentifier;
    branch: string | null;
    stem: string | null;
    markers: MarkerBuckets;
    totalStars: number;
}
export type MarkerSource = keyof MarkerBuckets;
export interface HealthRiskFinding {
    rule: string;
    severity: 'info' | 'low' | 'medium' | 'high';
    description: string;
    relatedPalaces: PalaceIdentifier[];
    triggeredLetters: HealthLetter[];
    details: string[];
}
export interface HealthMitigationHint {
    palace: PalaceIdentifier;
    letter: HealthLetter;
    sources: Partial<Record<MarkerSource, string[]>>;
    summary: string;
}
export interface SymptomHighlight {
    palace: PalaceIdentifier;
    star: string;
    markers: string[];
    organs: string[];
    symptoms: string[];
}
export interface HealthAnalysisResult {
    markers: Record<PalaceIdentifier, PalaceMarkerSummary>;
    riskFindings: HealthRiskFinding[];
    mitigationHints: HealthMitigationHint[];
    symptomHighlights: SymptomHighlight[];
}
export declare function analyzeHealthFromHook(chart: ZiWeiHookChart): HealthAnalysisResult;
export {};
//# sourceMappingURL=health-analysis.d.ts.map