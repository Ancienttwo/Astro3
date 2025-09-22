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

// ============= Chart Generator (unified entry) =============
export { generateCompleteZiWeiChart, calculateDouJun } from './chart-generator';
export type { IZiWeiCompleteChart } from './chart-generator';

// ============= Version Info =============
export const VERSION = '2.0.0-public-api';
