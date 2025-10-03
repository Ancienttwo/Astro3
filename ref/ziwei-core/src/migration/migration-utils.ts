/**
 * Migration Utilities - Helper functions for migrating from old to new architecture
 * 迁移工具 - 从旧架构迁移到新架构的辅助函数
 */

import type { 
  CompleteChart,
  PalaceData,
  Star,
  SihuaInfo,
} from '../types/core';

/**
 * Legacy/Old format data structure interface
 */
export interface LegacyChartData {
  birthInfo: Record<string, unknown>;
  palacesByBranch: Record<string, unknown>;
  '五行局': string;
  [key: string]: unknown;
}

/**
 * Unknown format data - used for data that needs runtime type checking
 */
export type UnknownChartData = Record<string, unknown> | null | undefined;

/**
 * Check if a value is using old format
 */
export function isOldFormat(data: unknown): data is LegacyChartData {
  // Old format has palacesByBranch and 五行局
  return data && 
         typeof data === 'object' && 
         'palacesByBranch' in data &&
         '五行局' in data;
}

/**
 * Check if a value is using new format
 */
export function isNewFormat(data: unknown): data is CompleteChart {
  // New format has palaces Map and fiveElementsBureau
  return data && 
         typeof data === 'object' && 
         'palaces' in data &&
         data.palaces instanceof Map &&
         'fiveElementsBureau' in data;
}

/**
 * Migration validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate old format data
 */
export function validateOldFormat(data: UnknownChartData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!data.birthInfo) {
    errors.push('Missing birthInfo');
  }
  
  if (!data.palacesByBranch) {
    errors.push('Missing palacesByBranch');
  }
  
  if (!data['五行局']) {
    errors.push('Missing 五行局');
  }
  
  // Check palace structure
  if (data.palacesByBranch) {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    branches.forEach(branch => {
      if (!data.palacesByBranch[branch]) {
        warnings.push(`Missing palace for branch ${branch}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate new format data
 */
export function validateNewFormat(data: UnknownChartData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!data.birthInfo) {
    errors.push('Missing birthInfo');
  }
  
  if (!data.palaces || !(data.palaces instanceof Map)) {
    errors.push('Missing or invalid palaces Map');
  }
  
  if (!data.fiveElementsBureau) {
    errors.push('Missing fiveElementsBureau');
  }
  
  // Check palace count
  if (data.palaces && data.palaces.size !== 12) {
    warnings.push(`Expected 12 palaces, found ${data.palaces.size}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Compare old and new chart data for consistency
 */
export function compareCharts(oldChart: UnknownChartData, newChart: CompleteChart): {
  matches: string[];
  differences: string[];
} {
  const matches: string[] = [];
  const differences: string[] = [];
  
  // Compare basic info
  if (oldChart['命宫'] === getBranchByIndex(newChart.lifePalaceIndex)) {
    matches.push('Life palace position matches');
  } else {
    differences.push('Life palace position differs');
  }
  
  if (oldChart['身宫'] === getBranchByIndex(newChart.bodyPalaceIndex)) {
    matches.push('Body palace position matches');
  } else {
    differences.push('Body palace position differs');
  }
  
  // Compare five elements
  if (oldChart['五行局']?.['局数'] === newChart.fiveElementsBureau.value) {
    matches.push('Five elements bureau matches');
  } else {
    differences.push('Five elements bureau differs');
  }
  
  // Compare masters
  if (oldChart['命主'] === newChart.lifeMaster) {
    matches.push('Life master matches');
  } else {
    differences.push('Life master differs');
  }
  
  if (oldChart['身主'] === newChart.bodyMaster) {
    matches.push('Body master matches');
  } else {
    differences.push('Body master differs');
  }
  
  return { matches, differences };
}

/**
 * Helper to get branch by index
 */
function getBranchByIndex(index: number): string {
  const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  return branches[index];
}

/**
 * Migration statistics
 */
export interface MigrationStats {
  totalPalaces: number;
  totalStars: number;
  mainStars: number;
  auxiliaryStars: number;
  minorStars: number;
  sihuaCount: number;
  emptyPalaces: number;
}

/**
 * Get migration statistics from chart
 */
export function getMigrationStats(chart: CompleteChart): MigrationStats {
  let totalStars = 0;
  let mainStars = 0;
  let auxiliaryStars = 0;
  let minorStars = 0;
  let sihuaCount = 0;
  let emptyPalaces = 0;
  
  chart.palaces.forEach(palace => {
    if (palace.isEmpty) {
      emptyPalaces++;
    }
    
    totalStars += palace.stars.length;
    mainStars += palace.stars.filter(s => s.isMainStar).length;
    auxiliaryStars += palace.stars.filter(s => s.category === '辅星').length;
    minorStars += palace.stars.filter(s => s.category === '小星').length;
    sihuaCount += palace.sihua.length;
  });
  
  return {
    totalPalaces: chart.palaces.size,
    totalStars,
    mainStars,
    auxiliaryStars,
    minorStars,
    sihuaCount,
    emptyPalaces,
  };
}

/**
 * Migration report
 */
export interface MigrationReport {
  timestamp: Date;
  sourceFormat: 'old' | 'new';
  targetFormat: 'old' | 'new';
  validation: ValidationResult;
  stats: MigrationStats;
  performance: {
    calculationTime: number;
    conversionTime: number;
  };
}

/**
 * Generate migration report
 */
export function generateMigrationReport(
  sourceData: UnknownChartData,
  targetData: UnknownChartData,
  timings: { calculation: number; conversion: number }
): MigrationReport {
  const sourceFormat = isOldFormat(sourceData) ? 'old' : 'new';
  const targetFormat = isNewFormat(targetData) ? 'new' : 'old';
  
  const validation = targetFormat === 'new' 
    ? validateNewFormat(targetData)
    : validateOldFormat(targetData);
  
  const stats = targetFormat === 'new' && targetData
    ? getMigrationStats(targetData as CompleteChart)
    : {
        totalPalaces: 12,
        totalStars: 0,
        mainStars: 0,
        auxiliaryStars: 0,
        minorStars: 0,
        sihuaCount: 0,
        emptyPalaces: 0,
      };
  
  return {
    timestamp: new Date(),
    sourceFormat,
    targetFormat,
    validation,
    stats,
    performance: {
      calculationTime: timings.calculation,
      conversionTime: timings.conversion,
    },
  };
}

/**
 * Batch migration helper
 */
export async function batchMigrate<T, R>(
  items: T[],
  migrationFn: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    onProgress?: (current: number, total: number) => void;
    onError?: (error: Error, item: T, index: number) => void;
  } = {}
): Promise<R[]> {
  const { 
    batchSize = 10, 
    onProgress,
    onError,
  } = options;
  
  const results: R[] = [];
  const total = items.length;
  
  for (let i = 0; i < total; i += batchSize) {
    const batch = items.slice(i, Math.min(i + batchSize, total));
    
    const batchResults = await Promise.all(
      batch.map(async (item, batchIndex) => {
        const index = i + batchIndex;
        try {
          const result = await migrationFn(item);
          onProgress?.(index + 1, total);
          return result;
        } catch (error) {
          onError?.(error as Error, item, index);
          throw error;
        }
      })
    );
    
    results.push(...batchResults);
  }
  
  return results;
}