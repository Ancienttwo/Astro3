export interface HealthPrinciple {
    title: string;
    details: string[];
}
export interface RiskCombinationRule {
    title: string;
    conditions: string[];
}
export interface HealthRiskIndexEntry {
    description: string;
    level: number;
}
export interface MitigationEntry {
    description: string;
    level: number;
}
export interface SuicidalPatternRule {
    title: string;
    conditions: string[];
}
export interface AccidentPatternRule {
    title: string;
    conditions: string[];
}
export interface TimeConsideration {
    key: string;
    notes: string[];
}
export interface StarSymptomEntry {
    star: string;
    organs: string[];
    symptoms: string[];
}
export declare const HEALTH_CORE_PRINCIPLES: HealthPrinciple[];
export declare const HEALTH_RISK_COMBINATIONS: RiskCombinationRule[];
export declare const HEALTH_RISK_INDEX: HealthRiskIndexEntry[];
export declare const HEALTH_MITIGATION_INDEX: MitigationEntry[];
export declare const HEALTH_TIME_CONSIDERATIONS: TimeConsideration[];
export declare const SUICIDAL_PATTERNS: SuicidalPatternRule[];
export declare const ACCIDENT_PATTERNS: AccidentPatternRule[];
export declare const TRAFFIC_VEHICLE_MAPPING: Record<string, string>;
export declare const STAR_SYMPTOMS: StarSymptomEntry[];
//# sourceMappingURL=health-rules.d.ts.map