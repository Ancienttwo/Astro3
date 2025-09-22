/**
 * BaZi Formatters Module
 * 
 * Provides data formatting utilities for UI components
 * Transforms calculation results into presentation-ready structures
 */

// Type exports
export type {
  GridCell,
  BaziGridData,
  SimpleBaziGrid,
  GridFormatOptions,
  GridLayoutConfig
} from './types';

// Constant exports
export { ELEMENT_COLORS } from './types';

// Function exports
export {
  formatForGrid,
  formatSimpleGrid,
  GridFormatUtils
} from './grid-formatter';

// Default formatter
export { formatForGrid as default } from './grid-formatter';