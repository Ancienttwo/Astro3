import { type PalaceIdentifier } from './wealth';
export type MarriageLetter = 'A' | 'B' | 'C' | 'D';
export type MarriageCombinationKey = 'AB' | 'AC' | 'BC' | 'AD' | 'BD' | 'CD';
export declare const PALACE_INDEX_TO_NAME: Record<number, PalaceIdentifier>;
export declare const MARRIAGE_KEY_PALACES: readonly PalaceIdentifier[];
export declare const MARRIAGE_INNER_PALACES: readonly PalaceIdentifier[];
export interface MarriagePalaceRole {
    index: number;
    palace: PalaceIdentifier;
    aka?: string;
    summary: string;
}
export declare const MARRIAGE_PALACE_ROLES: MarriagePalaceRole[];
export declare const MARRIAGE_LETTER_MEANINGS: Record<MarriageLetter, string>;
export interface MarriageCombinationMeaning {
    key: MarriageCombinationKey;
    label: string;
    summary: string;
}
export declare const MARRIAGE_COMBINATION_MEANINGS: Record<MarriageCombinationKey, MarriageCombinationMeaning>;
export declare const PEACH_BLOSSOM_STARS: Set<string>;
export declare const NOBLE_STARS: Set<string>;
export declare const MARRIAGE_STAR_NOTES: {
    peach: string;
    noble: string;
    nobleRepetition: string;
};
export declare const MARRIAGE_TIMELINE_GUIDELINES: string[];
export declare const MARRIAGE_CHILD_PALACE_GUIDE = "\u5B50\u5973\u5BAB\u884C\u620A\u5E72\u98DE AC \u5165\u547D\uFF08\u6216\u5B50\u7530\u7EBF\uFF09\u65F6\uFF0C\u4EE3\u8868\u540E\u5929\u6843\u82B1\u89E6\u53D1\uFF0C\u4E3A\u6709\u7F18\u53C8\u6709\u60C5\u7684\u826F\u6027\u6843\u82B1\u8D70\u52BF\u3002";
export declare const MARRIAGE_EXAMPLE_NOTES: string[];
//# sourceMappingURL=marriage-rules.d.ts.map