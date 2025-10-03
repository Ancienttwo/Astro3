/**
 * @astroall/ziwei-core - Public API (v2)
 * Clean, modular entry point for consumers.
 *
 * Exposes:
 * - Types: core and algorithm interfaces
 * - Constants: modular constants system
 * - Calculations: modular calculators and complete chart generator
 */

// ============= Types (type-only re-exports; no runtime import) =============
export type * from './types/core';
export type * from './types/algorithms';

// ============= Constants (values only, avoid duplicate type re-exports) =============
export {
  STEMS,
  BRANCHES,
  PALACE_NAMES,
  MAJOR_PERIOD_PALACE_NAMES,
  FLEETING_YEAR_PALACE_NAMES,
  MINOR_PERIOD_PALACE_NAMES,
} from './constants/basic-elements';

export {
  FIVE_ELEMENTS_BUREAU,
  BUREAU_NAME_TO_COLUMN,
  BUREAU_CODE_TO_COLUMN,
  BUREAU_TO_COLUMN,
  MAJOR_PERIOD_START_AGE,
} from './constants/five-elements-bureau';

export {
  ZIWEI_POSITION_TABLE,
  TIANFU_OFFSET_FROM_ZIWEI,
  ZIWEI_SERIES_POSITIONS,
  TIANFU_SERIES_POSITIONS,
  MAIN_STARS,
  AUXILIARY_STARS,
  MALEFIC_STARS,
  PEACH_BLOSSOM_STARS,
  MINOR_STARS,
} from './constants/star-systems';

export {
  STAR_BRIGHTNESS,
  BRIGHTNESS_LEVEL_MAP,
  STAR_BRIGHTNESS_TABLE,
} from './constants/star-brightness';

export {
  LIFE_MASTER_STARS,
  BODY_MASTER_STARS,
  BIRTH_YEAR_SIHUA,
  FLYING_PALACE_SIHUA,
} from './constants/master-stars';

// ============= Calculations (modular) =============
export * from './calculations';
export { createBaZiParams } from './calculations/data-conversion';

// ============= Chart Generator (unified entry) =============
export { generateCompleteZiWeiChart, calculateDouJun } from './chart-generator';
export type { IZiWeiCompleteChart } from './chart-generator';

// ============= API Functions =============
export { generateZiWeiHookChart } from './api/hook-ziwei-api';
export { generateIntegratedChart } from './api/integrated-chart-api';
export type { HookCalculationInput } from './types/hook-format-types';

// ============= Agent Helpers =============
export { buildZiweiAgentQuery } from './agent/ziweiAgent';
export { buildZiweiWealthAgentPrompt } from './agent/ziweiWealthAgent';

// ============= Analysis Modules =============
export * from './analysis/wealth';
export * from './analysis/pattern';
export * from './analysis/palace-knowledge';
export * from './analysis/fortune-rules';
export * from './analysis/career-rules';
export * from './analysis/star-knowledge';
export * from './analysis/health-rules';
export * from './analysis/health-analysis';
export * from './analysis/marriage-rules';
export * from './analysis/marriage-analysis';

// ============= Sihua Analysis =============
export * from './sihua/sihua-analysis';

// ============= Version Info =============
export const VERSION = '2.0.0-public-api';
