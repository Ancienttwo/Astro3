import type { PalaceIdentifier } from './wealth';
export interface CombinationRule {
    key: 'AB' | 'AC' | 'BC' | 'AD' | 'BD' | 'CD';
    label: string;
    description: string;
    highlights: string[];
}
export declare const COMBINATION_RULES: Record<CombinationRule['key'], CombinationRule>;
export declare const SIX_BODY_PALACES: Set<PalaceIdentifier>;
export declare const SIX_USE_PALACES: Set<PalaceIdentifier>;
export interface DimensionRule {
    key: 'people' | 'events' | 'objects';
    summary: string;
    notes: string[];
}
export declare const DIMENSION_RULES: DimensionRule[];
export interface FlyingExchangeRule {
    formula: string;
    interpretation: string;
}
export declare const FLYING_EXCHANGE_RULES: FlyingExchangeRule[];
export interface PostTabooRule {
    title: string;
    details: string[];
}
export declare const POST_TABOO_RULES: PostTabooRule[];
export interface PeriodFinanceEntry {
    target: PalaceIdentifier;
    formula: string;
    conclusion: string;
    resultTags: string[];
}
export declare const PERIOD_FINANCE_TABLE: PeriodFinanceEntry[];
export declare const SIDE_WEALTH_RULES: {
    lifetime: string[];
    period: string[];
};
export declare const FLOW_ROUTES: {
    source: string;
    sink: string;
    medium: string;
    harmonizer: string;
};
export declare const RETIREMENT_HINT = "\u89C2\u5BDF\u5927\u8FD0\u5B98\u7984\u5BAB\u5316\u5FCC\uFF0C\u53EF\u63A8\u6D4B\u9000\u4F11\u6216\u4E8B\u4E1A\u9000\u51FA\u65F6\u673A\u3002";
export declare const LITIGATION_RULES: {
    focusPalace: string;
    combinations: string[];
    stars: string[];
};
export declare const STUDY_RULES: {
    observation: string[];
    priority: string[];
    discipline: {
        A: string;
        D: string;
        B: string;
        C: string;
    };
};
//# sourceMappingURL=fortune-rules.d.ts.map