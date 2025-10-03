/**
 * ZiWei Facade - Main entry point for ZiWei Dou Shu calculations
 * 紫微门面 - 紫微斗数计算的主要入口
 */

import type {
  CompleteChart,
  LunarDate,
  CalculationOptions,
  BirthInfo,
  PalaceData,
  FiveElementsBureau,
  HeavenlyStem,
  EarthlyBranch,
} from '../types/core';
import type { IZiWeiFacade } from '../types/algorithms';
import { StarCalculator } from '../calculations/star-calculator';
import { SihuaCalculator } from '../calculations/sihua-calculator';
import { PalaceCalculator } from '../calculations/palace-calculator';
import { PALACE_NAMES, EARTHLY_BRANCHES } from '../constants/ziwei-constants';

/**
 * Cache entry for complete charts
 */
interface CacheEntry {
  chart: CompleteChart;
  timestamp: number;
  ttl: number;
}

/**
 * ZiWei Facade Class
 * 紫微门面类
 * 
 * Orchestrates all calculators to produce complete ZiWei charts
 */
export class ZiWeiFacade implements IZiWeiFacade {
  private starCalculator: StarCalculator;
  private sihuaCalculator: SihuaCalculator;
  private palaceCalculator: PalaceCalculator;
  private chartCache: Map<string, CacheEntry> = new Map();
  private readonly DEFAULT_TTL = 3600000; // 1 hour in milliseconds

  constructor() {
    this.starCalculator = new StarCalculator();
    this.sihuaCalculator = new SihuaCalculator();
    this.palaceCalculator = new PalaceCalculator();
  }

  /**
   * Calculate complete chart from birth information
   * 从出生信息计算完整命盘
   */
  async calculateCompleteChart(
    birthInfo: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute?: number;
      isLeapMonth?: boolean;
      timezone?: string;
    },
    options?: CalculationOptions
  ): Promise<CompleteChart> {
    // Convert birth info to lunar date
    const lunarDate = await this.convertToLunarDate(birthInfo);
    
    // Calculate synchronously
    return this.calculateWithLunarDate(lunarDate, options);
  }

  /**
   * Calculate with lunar date (synchronous)
   * 使用农历日期计算（同步）
   */
  calculateWithLunarDate(
    lunarDate: LunarDate,
    options?: CalculationOptions
  ): CompleteChart {
    const startTime = Date.now();
    
    // Check cache first
    const cacheKey = this.generateCacheKey(lunarDate, options);
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Calculate Five Elements Bureau
    const fiveElementsBureau = this.calculateFiveElementsBureau(lunarDate);
    
    // Calculate all palaces
    const palaces = this.palaceCalculator.calculatePalaces(lunarDate);
    
    // Find Life Palace and Body Palace indices
    let lifePalaceIndex = -1;
    let bodyPalaceIndex = -1;
    
    // Calculate Life Palace using the formula
    const monthIndex = EARTHLY_BRANCHES.indexOf(lunarDate.monthBranch);
    const hourIndex = EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch);
    lifePalaceIndex = (2 + monthIndex - hourIndex + 12) % 12;
    
    // Calculate Body Palace
    const monthLunar = lunarDate.month;
    const hourBranch = EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch) + 1;
    const monthBranchIndex = (monthLunar + 1) % 12;
    const hourIndexForBody = (hourBranch - 1) % 12;
    bodyPalaceIndex = (2 + monthBranchIndex + hourIndexForBody) % 12;

    // Calculate stars for each palace and add sihua
    palaces.forEach((palaceData, palaceName) => {
      const palaceIndex = palaceData.position.index;
      
      // Calculate stars with options
      const calculationOptions: CalculationOptions = {
        ...options,
        fiveElementsBureau,
        includeSihua: true,
      };
      
      const stars = this.starCalculator.calculateStarsForPalace(
        palaceIndex,
        lunarDate,
        calculationOptions
      );
      
      // Add stars to palace
      palaceData.stars = stars;
      
      // Count major stars
      palaceData.majorStarCount = stars.filter(s => s.isMainStar).length;
      palaceData.isEmpty = palaceData.majorStarCount === 0;
      
      // Extract sihua information from stars
      stars.forEach(star => {
        if (star.sihuaTransformations) {
          star.sihuaTransformations.forEach(trans => {
            // Check if it's a self-transformation
            const isSelfTransformation = 
              trans.source === 'self-outward' || 
              trans.source === 'self-inward';
            
            if (isSelfTransformation) {
              // Add to self-transformations
              const selfType = trans.code as any;
              if (!palaceData.selfTransformations.includes(selfType)) {
                palaceData.selfTransformations.push(selfType);
              }
            }
            
            // Add to general sihua info
            palaceData.sihua.push({
              type: trans.type,
              star: trans.star,
              sourceStem: palaceData.position.stem,
              sourcePalace: palaceName,
              isSelfTransformation,
              selfTransformationType: isSelfTransformation ? trans.code as any : undefined,
            });
          });
        }
      });
    });

    // Calculate global sihua (birth year sihua)
    const globalSihua = this.sihuaCalculator.calculateBirthYearSihua(lunarDate.yearStem);

    // Create birth info
    const birthInfo: BirthInfo = {
      year: lunarDate.year,
      month: lunarDate.month,
      day: lunarDate.day,
      hour: lunarDate.hour,
      isLeapMonth: false,
      timezone: 'Asia/Shanghai',
    };

    // Create complete chart
    const chart: CompleteChart = {
      birthInfo,
      lunarDate,
      palaces,
      lifePalaceIndex,
      bodyPalaceIndex,
      globalSihua: globalSihua.map(trans => ({
        type: trans.type,
        star: trans.star,
        sourceStem: lunarDate.yearStem,
      })),
      metadata: {
        calculatedAt: new Date(),
        version: '1.0.0',
        calculationTime: Date.now() - startTime,
      },
    };

    // Cache the result
    if (options?.useCache !== false) {
      this.cacheChart(cacheKey, chart);
    }

    return chart;
  }

  /**
   * Get cached result
   * 获取缓存结果
   */
  getCachedResult(cacheKey: string): CompleteChart | null {
    const entry = this.chartCache.get(cacheKey);
    
    if (!entry) {
      return null;
    }
    
    // Check if cache is still valid
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      // Cache expired
      this.chartCache.delete(cacheKey);
      return null;
    }
    
    return entry.chart;
  }

  /**
   * Clear cache
   * 清除缓存
   */
  clearCache(): void {
    this.chartCache.clear();
    this.starCalculator.clearCache();
    this.sihuaCalculator.clearCache();
    this.palaceCalculator.clearCache();
  }

  /**
   * Batch calculate multiple charts
   * 批量计算多个命盘
   */
  async batchCalculate(
    birthInfos: Array<Parameters<IZiWeiFacade['calculateCompleteChart']>[0]>,
    options?: CalculationOptions
  ): Promise<CompleteChart[]> {
    const charts: CompleteChart[] = [];
    
    // Process in parallel if parallel calculation is enabled
    if (options?.parallelCalculation) {
      const promises = birthInfos.map(info => 
        this.calculateCompleteChart(info, options)
      );
      return Promise.all(promises);
    }
    
    // Process sequentially
    for (const birthInfo of birthInfos) {
      const chart = await this.calculateCompleteChart(birthInfo, options);
      charts.push(chart);
    }
    
    return charts;
  }

  /**
   * Convert birth info to lunar date
   * 将出生信息转换为农历日期
   */
  private async convertToLunarDate(birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute?: number;
    isLeapMonth?: boolean;
    timezone?: string;
  }): Promise<LunarDate> {
    // This is a simplified conversion
    // In production, use a proper lunar calendar conversion library
    
    // Calculate stems and branches
    const yearStem = this.getYearStem(birthInfo.year);
    const yearBranch = this.getYearBranch(birthInfo.year);
    const monthBranch = EARTHLY_BRANCHES[(birthInfo.month + 1) % 12];
    const hourBranch = EARTHLY_BRANCHES[Math.floor(birthInfo.hour / 2) % 12];
    
    // Create lunar date
    const lunarDate: LunarDate = {
      year: birthInfo.year,
      month: birthInfo.month,
      day: birthInfo.day,
      hour: birthInfo.hour,
      yearStem,
      yearBranch,
      monthStem: this.getMonthStem(yearStem, birthInfo.month),
      monthBranch,
      dayStem: this.getDayStem(birthInfo.year, birthInfo.month, birthInfo.day),
      dayBranch: this.getDayBranch(birthInfo.year, birthInfo.month, birthInfo.day),
      hourStem: this.getHourStem(this.getDayStem(birthInfo.year, birthInfo.month, birthInfo.day), birthInfo.hour),
      hourBranch,
    };
    
    return lunarDate;
  }

  /**
   * Calculate Five Elements Bureau
   * 计算五行局
   */
  private calculateFiveElementsBureau(lunarDate: LunarDate): FiveElementsBureau {
    // Simplified calculation based on year stem and life palace
    // In production, use proper algorithm
    
    const bureauMap: Record<string, FiveElementsBureau> = {
      '甲子': '水二局',
      '甲午': '火六局',
      '乙丑': '金四局',
      '乙未': '金四局',
      '丙寅': '火六局',
      '丙申': '土五局',
      '丁卯': '火六局',
      '丁酉': '火六局',
      '戊辰': '木三局',
      '戊戌': '木三局',
      '己巳': '木三局',
      '己亥': '木三局',
      '庚午': '土五局',
      '庚子': '土五局',
      '辛未': '土五局',
      '辛丑': '土五局',
      '壬申': '金四局',
      '壬寅': '金四局',
      '癸酉': '金四局',
      '癸卯': '金四局',
    };
    
    const ganZhi = lunarDate.yearStem + lunarDate.yearBranch;
    
    // Find matching pattern
    for (const [key, bureau] of Object.entries(bureauMap)) {
      if (ganZhi.includes(key[0]) && ganZhi.includes(key[1])) {
        return bureau;
      }
    }
    
    // Default
    return '土五局';
  }

  /**
   * Generate cache key
   * 生成缓存键
   */
  private generateCacheKey(lunarDate: LunarDate, options?: CalculationOptions): string {
    const dateKey = `${lunarDate.year}-${lunarDate.month}-${lunarDate.day}-${lunarDate.hour}`;
    const optionsKey = options ? JSON.stringify(options) : '';
    return `${dateKey}-${optionsKey}`;
  }

  /**
   * Cache chart with TTL
   * 缓存命盘
   */
  private cacheChart(key: string, chart: CompleteChart, ttl?: number): void {
    this.chartCache.set(key, {
      chart,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
    });
    
    // Clean up old entries if cache is too large
    if (this.chartCache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   * 清理过期缓存
   */
  private cleanupCache(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.chartCache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    });
    
    toDelete.forEach(key => this.chartCache.delete(key));
  }

  // Helper methods for stem/branch calculations
  private getYearStem(year: number): HeavenlyStem {
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
    return stems[(year - 4) % 10] as HeavenlyStem;
  }

  private getYearBranch(year: number): EarthlyBranch {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
    return branches[(year - 4) % 12] as EarthlyBranch;
  }

  private getMonthStem(yearStem: HeavenlyStem, month: number): HeavenlyStem {
    const wuhuDun: Record<string, string> = {
      '甲': '丙', '己': '丙',
      '乙': '戊', '庚': '戊',
      '丙': '庚', '辛': '庚',
      '丁': '壬', '壬': '壬',
      '戊': '甲', '癸': '甲',
    };
    const startStem = wuhuDun[yearStem] || '甲';
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
    const startIndex = stems.indexOf(startStem);
    return stems[(startIndex + month - 1) % 10] as HeavenlyStem;
  }

  private getDayStem(year: number, month: number, day: number): HeavenlyStem {
    // Simplified calculation
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
    const total = year * 365 + month * 30 + day;
    return stems[total % 10] as HeavenlyStem;
  }

  private getDayBranch(year: number, month: number, day: number): EarthlyBranch {
    // Simplified calculation
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
    const total = year * 365 + month * 30 + day;
    return branches[total % 12] as EarthlyBranch;
  }

  private getHourStem(dayStem: HeavenlyStem, hour: number): HeavenlyStem {
    const wuziTable: Record<string, string> = {
      '甲': '甲', '己': '甲',
      '乙': '丙', '庚': '丙',
      '丙': '戊', '辛': '戊',
      '丁': '庚', '壬': '庚',
      '戊': '壬', '癸': '壬',
    };
    const startStem = wuziTable[dayStem] || '甲';
    const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
    const startIndex = stems.indexOf(startStem);
    const hourIndex = Math.floor(hour / 2);
    return stems[(startIndex + hourIndex) % 10] as HeavenlyStem;
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    charts: number;
    stars: number;
    sihua: number;
    palaces: number;
  } {
    return {
      charts: this.chartCache.size,
      stars: this.starCalculator.getCacheStats().positions,
      sihua: this.sihuaCalculator.getCacheStats().sihuaEntries,
      palaces: this.palaceCalculator.getCacheStats().palaceEntries,
    };
  }
}