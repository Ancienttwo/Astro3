/**
 * 紫微斗数计算模块统一导出
 * Unified Export for ZiWei DouShu Calculation Modules
 * 
 * @description
 * 提供模块化的紫微斗数计算功能，按功能域组织
 * Provides modular ZiWei DouShu calculation functions organized by functional domains
 * 
 * @version 2.0.0
 */

// Data Conversion & Preprocessing
export * from './data-conversion'
export type { BaZiParams } from './data-conversion'

// Palace Calculations
export * from './palace-calculations'

// Star Placements (Main, Auxiliary, Malefic, Romance)
export * from './star-placements'

// Modularized Star Calculators
export { getAuxiliaryStars } from './auxiliary-stars'
export { getMaleficStars } from './malefic-stars'

// Four Transformations (Sihua)
export * from './transformations'
export type { SihuaTransformation } from './transformations'

// Life & Body Masters
export * from './masters'
export type { Masters } from './masters'

// Five Elements Bureau
export * from './bureau-calculations'
export type { FiveElementsBureauDetail } from './bureau-calculations'

// Star Brightness
export * from './brightness-calculations'

// Period Calculations (Major Periods, Fleeting Years, Minor Periods)
export * from './period-calculations'
export type { MajorPeriod } from './period-calculations'

// Complete Chart Generator (unified entry)
export { generateCompleteZiWeiChart, calculateDouJun } from '../chart-generator'
export type { IZiWeiCompleteChart } from '../chart-generator'

/**
 * @summary Modular Calculation System
 * 
 * The ZiWei DouShu calculation system has been organized into focused modules:
 * 
 * 1. **data-conversion**: Entry point functions for converting tyme4ts data
 * 2. **palace-calculations**: Life Palace, Body Palace, and related calculations
 * 3. **star-placements**: All star positioning calculations (main, auxiliary, malefic, romance)
 * 4. **transformations**: Four transformations (Sihua) calculations
 * 5. **masters**: Life Master and Body Master calculations
 * 6. **bureau-calculations**: Five Elements Bureau calculations
 * 7. **brightness-calculations**: Star brightness and temple/trap status
 * 8. **period-calculations**: Major periods, fleeting years, minor limits
 * 
 * @usage
 * ```typescript
 * import { 
 *   createBaZiParams,
 *   calculateLifePalace,
 *   calculateMainStarPositions,
 *   calculateBirthYearSihua
 * } from './calculations'
 * ```
 * 
 * Or import specific modules:
 * ```typescript
 * import { createBaZiParams } from './calculations/data-conversion'
 * import { calculateLifePalace } from './calculations/palace-calculations'
 * ```
 */
