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

// Re-export from modular system for backward compatibility (avoid barrel cycles)
export { STEMS as HEAVENLY_STEMS, BRANCHES as EARTHLY_BRANCHES, PALACE_NAMES } from './basic-elements'
export { MAIN_STARS, AUXILIARY_STARS, MALEFIC_STARS, ZIWEI_POSITION_TABLE } from './star-systems'
export { BIRTH_YEAR_SIHUA as SIHUA_MAPPING } from './master-stars'
export { BRIGHTNESS_LEVEL_MAP as BRIGHTNESS_LEVELS, STAR_BRIGHTNESS_TABLE as STAR_BRIGHTNESS_MAP } from './star-brightness'

// Import required types (avoid importing from './index' to prevent require cycles)
import type { Stem as HeavenlyStem, Branch as EarthlyBranch } from './basic-elements'
import type { FiveElementsBureauName } from './five-elements-bureau'
import type { BrightnessLevel } from './star-brightness'

// Legacy type aliases for backward compatibility
export type FiveElementsBureau = FiveElementsBureauName
export type StarBrightness = BrightnessLevel
export type LegacySihuaType = '化禄' | '化权' | '化科' | '化忌'

/**
 * WuHuDun Starting Stems (五虎遁起始天干)
 * Maps year stem to starting month stem
 * @legacy Kept for specific legacy algorithm compatibility
 */
export const WUHUDUN_TABLE: Record<HeavenlyStem, HeavenlyStem> = {
  甲: '丙', // 甲己之年丙作首
  己: '丙',
  乙: '戊', // 乙庚之年戊为头
  庚: '戊',
  丙: '庚', // 丙辛之年庚起始
  辛: '庚',
  丁: '壬', // 丁壬壬寅顺行流
  壬: '壬',
  戊: '甲', // 戊癸甲寅定始求
  癸: '甲',
} as const;

// ZIWEI_POSITION_TABLE already re-exported above from star-systems

/**
 * Legacy Star Position Maps
 * @legacy Kept for specific algorithm compatibility
 */
export const TIANMA_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  寅: '申', 午: '申', 戌: '申', // 寅午戌见申
  申: '寅', 子: '寅', 辰: '寅', // 申子辰见寅
  亥: '巳', 卯: '巳', 未: '巳', // 亥卯未见巳
  巳: '亥', 酉: '亥', 丑: '亥', // 巳酉丑见亥
} as const;

export const TIANKUI_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '丑', 戊: '丑', 庚: '丑',
  乙: '子', 己: '子',
  丙: '亥', 丁: '亥',
  壬: '卯', 癸: '卯',
  辛: '寅',
} as const;

export const TIANYUE_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '未', 戊: '未', 庚: '未',
  乙: '申', 己: '申',
  丙: '酉', 丁: '酉',
  壬: '巳', 癸: '巳',
  辛: '午',
} as const;

export const LUCUN_MAP: Record<HeavenlyStem, EarthlyBranch> = {
  甲: '寅', 乙: '卯', 丙: '巳', 丁: '午',
  戊: '巳', 己: '午', 庚: '申', 辛: '酉',
  壬: '亥', 癸: '子',
} as const;

export const HONGLUAN_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  子: '卯', 丑: '寅', 寅: '丑', 卯: '子',
  辰: '亥', 巳: '戌', 午: '酉', 未: '申',
  申: '未', 酉: '午', 戌: '巳', 亥: '辰',
} as const;

// 火星起点（按年支分组）
// 申子辰 → 寅；寅午戌 → 丑；巳酉丑 → 卯；亥卯未 → 酉
export const HUOXING_BASE_MAP: Record<EarthlyBranch, EarthlyBranch> = {
  申: '寅', 子: '寅', 辰: '寅',
  寅: '丑', 午: '丑', 戌: '丑',
  巳: '卯', 酉: '卯', 丑: '卯',
  亥: '酉', 卯: '酉', 未: '酉',
} as const;

// Re-export from modular system
// (moved above) brightness re-exports

// Note: SIHUA_MAPPING already exported above from BIRTH_YEAR_SIHUA
// This duplicate has been removed

/**
 * Palace Helper Functions
 * @legacy Kept for backward compatibility
 */
export const PALACE_TRIANGLES: Record<number, number[]> = {
  0: [4, 8], 1: [5, 9], 2: [6, 10], 3: [7, 11],
  4: [0, 8], 5: [1, 9], 6: [2, 10], 7: [3, 11], 
  8: [0, 4], 9: [1, 5], 10: [2, 6], 11: [3, 7],
} as const;

export function getOppositePalace(index: number): number {
  return (index + 6) % 12;
}

export function getPalaceSquare(index: number): number[] {
  const triangles = PALACE_TRIANGLES[index] ?? [];
  const opposite = getOppositePalace(index);
  return [index, opposite, ...triangles];
}

// ============= Calculation Constants =============

/**
 * Cache TTL settings (ms)
 */
export const CACHE_TTL = {
  CHART: 60 * 60 * 1000,        // 1 hour
  STARS: 30 * 60 * 1000,        // 30 minutes
  SIHUA: 30 * 60 * 1000,        // 30 minutes
  PALACE: 60 * 60 * 1000,       // 1 hour
} as const;

/**
 * Performance targets (ms)
 */
export const PERFORMANCE_TARGETS = {
  FULL_CHART: 50,               // Full chart calculation
  STAR_CALCULATION: 10,         // Single palace stars
  SIHUA_CALCULATION: 5,         // Sihua calculation
  PALACE_CALCULATION: 5,        // Palace structure
} as const;

/**
 * Maximum limits
 */
export const MAX_LIMITS = {
  BATCH_SIZE: 100,              // Max batch calculation
  CACHE_ENTRIES: 1000,          // Max cache entries
  STAR_COUNT_PER_PALACE: 50,    // Max stars per palace
} as const;
