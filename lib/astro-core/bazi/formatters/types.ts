/**
 * BaZi Formatters Type Definitions
 * 
 * Provides structured data formats for UI components
 * Maintains separation between calculation logic and presentation
 */

import { StemName, BranchName, ElementName, TenGodType } from '../types';

/**
 * Grid cell data structure
 */
export interface GridCell {
  // Core content
  stem?: StemName;
  branch?: BranchName;
  
  // Display properties
  element?: ElementName;
  tenGod?: TenGodType;
  naYin?: string;
  
  // Visual hints for UI
  color?: string;           // Element-based color
  strength?: number;        // 0-100 strength indicator
  isHighlighted?: boolean;  // Special emphasis
  
  // Metadata
  label?: string;           // Cell label (e.g., "年柱")
  sublabel?: string;        // Secondary label
  tooltip?: string;         // Hover text
}

/**
 * Complete BaZi grid data structure
 */
export interface BaziGridData {
  // Four Pillars
  pillars: {
    year: {
      stem: GridCell;
      branch: GridCell;
      hiddenStems?: GridCell[];
    };
    month: {
      stem: GridCell;
      branch: GridCell;
      hiddenStems?: GridCell[];
    };
    day: {
      stem: GridCell;
      branch: GridCell;
      hiddenStems?: GridCell[];
    };
    hour: {
      stem: GridCell;
      branch: GridCell;
      hiddenStems?: GridCell[];
    };
  };
  
  // Ten Gods Analysis
  tenGods: {
    yearStem?: TenGodType;
    monthStem?: TenGodType;
    dayStem?: TenGodType;
    hourStem?: TenGodType;
    yearBranch?: TenGodType[];
    monthBranch?: TenGodType[];
    dayBranch?: TenGodType[];
    hourBranch?: TenGodType[];
  };
  
  // Major Periods (大运)
  majorPeriods?: Array<{
    age: number;
    stem: GridCell;
    branch: GridCell;
    startYear: number;
    endYear: number;
  }>;
  
  // Annual Pillars (流年)
  annualPillars?: Array<{
    year: number;
    age: number;
    stem: GridCell;
    branch: GridCell;
  }>;
  
  // Summary Information
  summary: {
    dayMaster: StemName;        // 日主
    dayMasterElement: ElementName;
    strongWeak?: 'strong' | 'weak' | 'balanced';
    favorableElements?: ElementName[];
    unfavorableElements?: ElementName[];
  };
  
  // Display Metadata
  metadata: {
    title?: string;
    subtitle?: string;
    generatedAt: Date;
    calculationVersion: string;
  };
}

/**
 * Simplified grid data for basic display
 */
export interface SimpleBaziGrid {
  // 4x2 grid of stem/branch pairs
  grid: Array<{
    position: 'year' | 'month' | 'day' | 'hour';
    stem: string;
    branch: string;
    stemElement: ElementName;
    branchElement: ElementName;
  }>;
  
  // Basic info
  dayMaster: string;
  dayMasterElement: ElementName;
}

/**
 * Configuration options for grid formatting
 */
export interface GridFormatOptions {
  // Display options
  includeHiddenStems?: boolean;
  includeTenGods?: boolean;
  includeMajorPeriods?: boolean;
  includeAnnualPillars?: boolean;
  
  // Visual options
  useColors?: boolean;
  showStrength?: boolean;
  highlightDayMaster?: boolean;
  
  // Data options
  simplifiedFormat?: boolean;
  locale?: 'zh-CN' | 'zh-TW' | 'en';
}

/**
 * Element color mapping for UI
 */
export const ELEMENT_COLORS = {
  木: '#4CAF50',  // Green - Wood
  火: '#F44336',  // Red - Fire
  土: '#FF9800',  // Orange - Earth
  金: '#9E9E9E',  // Grey - Metal
  水: '#2196F3',  // Blue - Water
} as const;

/**
 * Grid layout configuration
 */
export interface GridLayoutConfig {
  columns: number;
  rows: number;
  cellWidth?: number;
  cellHeight?: number;
  spacing?: number;
  orientation?: 'horizontal' | 'vertical';
}