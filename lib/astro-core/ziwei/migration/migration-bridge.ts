/**
 * Migration Bridge - Connects old API with new architecture
 * 迁移桥接器 - 连接旧API与新架构
 */

import { ZiWeiFacade } from '../facade/ziwei-facade';
import type { 
  BirthInfo,
  CompleteChart,
  LunarDate,
  CalculationOptions,
} from '../types/core';

/**
 * Old API format (from ziwei-old.tsx)
 */
export interface OldZiWeiInput {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  gender: 'male' | 'female';
  isLunar?: boolean;
  isLeapMonth?: boolean;
}

/**
 * Old API output format
 */
export interface OldZiWeiChart {
  // Birth info
  birthInfo: {
    solar: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute: number;
      gender: string;
      isLunar: boolean;
      isLeapMonth?: boolean;
    };
    lunar: {
      yearStem: string;
      yearBranch: string;
      yearGanZhi: string;
      monthLunar: number;
      dayLunar: number;
      hourBranch: number;
    };
  };
  
  // Palace positions
  命宫: string;
  身宫: string;
  来因宫: string;
  命主: string;
  身主: string;
  斗君: string;
  
  // Five elements
  五行局: {
    name: string;
    局数: number;
  };
  
  // Palaces by branch
  palacesByBranch: Record<string, any>;
}

/**
 * Migration bridge class
 */
export class MigrationBridge {
  private facade: ZiWeiFacade;
  
  constructor() {
    this.facade = new ZiWeiFacade();
  }
  
  /**
   * Convert old input format to new BirthInfo
   */
  convertInput(oldInput: OldZiWeiInput): BirthInfo {
    return {
      year: oldInput.year,
      month: oldInput.month,
      day: oldInput.day,
      hour: oldInput.hour,
      minute: oldInput.minute || 0,
      gender: oldInput.gender,
      isLunar: oldInput.isLunar || false,
      isLeapMonth: oldInput.isLeapMonth,
    };
  }
  
  /**
   * Convert new CompleteChart to old format
   */
  convertOutput(chart: CompleteChart): OldZiWeiChart {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const palaceNames = [
      '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
      '迁移', '交友', '官禄', '田宅', '福德', '父母'
    ];
    
    // Build palacesByBranch
    const palacesByBranch: Record<string, any> = {};
    
    branches.forEach((branch, branchIndex) => {
      const palace = Array.from(chart.palaces.values()).find(
        p => p.position.index === branchIndex
      );
      
      if (palace) {
        // Calculate palace name relative to life palace
        const relativeIndex = (branchIndex - chart.lifePalaceIndex + 12) % 12;
        const palaceName = palaceNames[relativeIndex];
        
        palacesByBranch[branch] = {
          branch,
          branchIndex,
          stem: palace.position.stem,
          palaceName,
          palaceNumber: relativeIndex + 1,
          isLifePalace: branchIndex === chart.lifePalaceIndex,
          isBodyPalace: branchIndex === chart.bodyPalaceIndex,
          isLaiyinPalace: false, // TODO: Calculate from chart
          mainStars: palace.stars
            .filter(s => s.isMainStar)
            .map(s => ({ name: s.name, brightness: s.brightness })),
          auxiliaryStars: palace.stars
            .filter(s => s.category === '辅星')
            .map(s => ({ name: s.name, brightness: s.brightness })),
          minorStars: palace.stars
            .filter(s => s.category === '小星')
            .map(s => ({ name: s.name, brightness: s.brightness })),
          sihuaStars: palace.sihua.map(si => ({
            star: si.star,
            type: si.type,
          })),
          fleetingYears: [], // TODO: Calculate
          minorPeriod: [], // TODO: Calculate
          majorPeriod: undefined, // TODO: Calculate
        };
      }
    });
    
    return {
      birthInfo: {
        solar: {
          year: chart.birthInfo.year,
          month: chart.birthInfo.month,
          day: chart.birthInfo.day,
          hour: chart.birthInfo.hour,
          minute: chart.birthInfo.minute || 0,
          gender: chart.birthInfo.gender || 'male',
          isLunar: chart.birthInfo.isLunar || false,
          isLeapMonth: chart.birthInfo.isLeapMonth || false,
        },
        lunar: {
          yearStem: chart.lunarDate.yearStem,
          yearBranch: chart.lunarDate.yearBranch,
          yearGanZhi: `${chart.lunarDate.yearStem}${chart.lunarDate.yearBranch}`,
          monthLunar: chart.lunarDate.month,
          dayLunar: chart.lunarDate.day,
          hourBranch: chart.lunarDate.hourBranch,
        },
      },
      
      命宫: branches[chart.lifePalaceIndex],
      身宫: branches[chart.bodyPalaceIndex],
      来因宫: '田宅宫', // TODO: Calculate properly
      命主: chart.lifeMaster,
      身主: chart.bodyMaster,
      斗君: chart.douJun,
      
      五行局: {
        name: chart.fiveElementsBureau.name,
        局数: chart.fiveElementsBureau.value,
      },
      
      palacesByBranch,
    };
  }
  
  /**
   * Calculate chart using old API format
   */
  async calculateOldFormat(input: OldZiWeiInput): Promise<OldZiWeiChart> {
    const birthInfo = this.convertInput(input);
    const chart = await this.facade.calculateCompleteChart(birthInfo);
    return this.convertOutput(chart);
  }
  
  /**
   * Get cached result in old format
   */
  getCachedOldFormat(cacheKey: string): OldZiWeiChart | null {
    const cached = this.facade.getCachedResult(cacheKey);
    if (!cached) return null;
    return this.convertOutput(cached);
  }
}

/**
 * Global instance for compatibility
 */
let bridgeInstance: MigrationBridge | null = null;

export function getMigrationBridge(): MigrationBridge {
  if (!bridgeInstance) {
    bridgeInstance = new MigrationBridge();
  }
  return bridgeInstance;
}

/**
 * Direct replacement for old calculateZiweiChart function
 */
export async function calculateZiweiChartCompat(input: OldZiWeiInput): Promise<OldZiWeiChart> {
  const bridge = getMigrationBridge();
  return bridge.calculateOldFormat(input);
}

/**
 * Hook for using old API with new architecture
 */
export function useZiWeiChartCompat(input: OldZiWeiInput | null) {
  const [chart, setChart] = React.useState<OldZiWeiChart | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    if (!input) {
      setChart(null);
      return;
    }
    
    const calculate = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const bridge = getMigrationBridge();
        const result = await bridge.calculateOldFormat(input);
        setChart(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Calculation failed'));
        setChart(null);
      } finally {
        setLoading(false);
      }
    };
    
    void calculate();
  }, [input]);
  
  return { chart, loading, error };
}

// Add React import for the hook
import * as React from 'react';
