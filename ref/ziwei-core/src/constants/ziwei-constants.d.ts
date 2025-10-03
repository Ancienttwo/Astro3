/**
 * @deprecated This file is deprecated in favor of modular constants system.
 * Please use imports from './index' instead.
 *
 * ZiWei Dou Shu Constants and Lookup Tables (LEGACY)
 * 紫微斗数常量和查找表 (传统版本)
 *
 * @ai-context DEPRECATION_NOTICE
 * @migration Use modular imports: import { STEMS, BRANCHES, MAIN_STARS } from './index'
 * @reason Resolves ESLint max-lines violations and improves maintainability
 */
export { STEMS as HEAVENLY_STEMS, BRANCHES as EARTHLY_BRANCHES, PALACE_NAMES } from './basic-elements';
export { MAIN_STARS, AUXILIARY_STARS, MALEFIC_STARS, ZIWEI_POSITION_TABLE } from './star-systems';
export { BIRTH_YEAR_SIHUA as SIHUA_MAPPING } from './master-stars';
export { BRIGHTNESS_LEVEL_MAP as BRIGHTNESS_LEVELS, STAR_BRIGHTNESS_TABLE as STAR_BRIGHTNESS_MAP } from './star-brightness';
import type { Stem as HeavenlyStem, Branch as EarthlyBranch } from './basic-elements';
import type { FiveElementsBureauName } from './five-elements-bureau';
import type { BrightnessLevel } from './star-brightness';
export type FiveElementsBureau = FiveElementsBureauName;
export type StarBrightness = BrightnessLevel;
export type LegacySihuaType = '化禄' | '化权' | '化科' | '化忌';
/**
 * WuHuDun Starting Stems (五虎遁起始天干)
 * Maps year stem to starting month stem
 * @legacy Kept for specific legacy algorithm compatibility
 */
export declare const WUHUDUN_TABLE: Record<HeavenlyStem, HeavenlyStem>;
/**
 * Legacy Star Position Maps
 * @legacy Kept for specific algorithm compatibility
 */
export declare const TIANMA_MAP: Record<EarthlyBranch, EarthlyBranch>;
export declare const TIANKUI_MAP: Record<HeavenlyStem, EarthlyBranch>;
export declare const TIANYUE_MAP: Record<HeavenlyStem, EarthlyBranch>;
export declare const LUCUN_MAP: Record<HeavenlyStem, EarthlyBranch>;
export declare const HONGLUAN_MAP: Record<EarthlyBranch, EarthlyBranch>;
export declare const HUOXING_BASE_MAP: Record<EarthlyBranch, EarthlyBranch>;
/**
 * Palace Helper Functions
 * @legacy Kept for backward compatibility
 */
export declare const PALACE_TRIANGLES: Record<number, number[]>;
export declare function getOppositePalace(index: number): number;
export declare function getPalaceSquare(index: number): number[];
/**
 * Cache TTL settings (ms)
 */
export declare const CACHE_TTL: {
    readonly CHART: number;
    readonly STARS: number;
    readonly SIHUA: number;
    readonly PALACE: number;
};
/**
 * Performance targets (ms)
 */
export declare const PERFORMANCE_TARGETS: {
    readonly FULL_CHART: 50;
    readonly STAR_CALCULATION: 10;
    readonly SIHUA_CALCULATION: 5;
    readonly PALACE_CALCULATION: 5;
};
/**
 * Maximum limits
 */
export declare const MAX_LIMITS: {
    readonly BATCH_SIZE: 100;
    readonly CACHE_ENTRIES: 1000;
    readonly STAR_COUNT_PER_PALACE: 50;
};
//# sourceMappingURL=ziwei-constants.d.ts.map