/**
 * Algorithm interface definitions for ZiWei calculations
 * 紫微斗数算法接口定义
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  PalaceName,
  PalaceData,
  Star,
  SihuaInfo,
  SihuaType,
  SihuaTransformation,
  LunarDate,
  CompleteChart,
  CalculationOptions,
  BirthInfo,
} from './core';

// ============= Calculator Interfaces =============

/**
 * Star Calculator Interface (星曜计算器接口)
 */
export interface IStarCalculator {
  /**
   * Calculate all stars for a palace
   */
  calculateStarsForPalace(
    palaceIndex: number,
    lunarDate: LunarDate,
    options?: CalculationOptions
  ): Star[];

  /**
   * Calculate star brightness
   */
  calculateBrightness(
    starName: string,
    palaceIndex: number,
    element?: string
  ): string;

  /**
   * Get main stars for palace
   */
  getMainStars(palaceIndex: number, lunarDate: LunarDate): Star[];

  /**
   * Get auxiliary stars for palace
   */
  getAuxiliaryStars(palaceIndex: number, lunarDate: LunarDate): Star[];
}

/**
 * Sihua Calculator Interface (四化计算器接口)
 */
export interface ISihuaCalculator {
  /**
   * Calculate birth year sihua
   */
  calculateBirthYearSihua(yearStem: HeavenlyStem): SihuaTransformation[];
  
  /**
   * Calculate palace stem sihua
   */
  calculatePalaceStemSihua(
    palaceStem: HeavenlyStem,
    palaceIndex: number
  ): SihuaTransformation[];
  
  /**
   * Detect self-transformations
   */
  detectSelfTransformations(
    palaceStem: HeavenlyStem,
    starsInPalace: Star[],
    hasBirthSihua: Map<string, SihuaType>
  ): SihuaTransformation[];
  
  /**
   * Calculate complete sihua for all palaces
   */
  calculateCompleteSihua(
    lunarDate: LunarDate,
    palaceStems: HeavenlyStem[],
    starsByPalace: Map<number, Star[]>
  ): Map<number, SihuaTransformation[]>;
  
  /**
   * Calculate palace stems using WuHuDun
   */
  calculatePalaceStems(yearStem: HeavenlyStem): HeavenlyStem[];
  
  /**
   * Get palace stem for a specific palace
   */
  getPalaceStem(yearStem: HeavenlyStem, palaceIndex: number): HeavenlyStem;
}

/**
 * Palace Calculator Interface (宫位计算器接口)
 */
export interface IPalaceCalculator {
  /**
   * Calculate palace positions
   */
  calculatePalaces(lunarDate: LunarDate): Map<PalaceName, PalaceData>;

  /**
   * Generate dynamic stems using WuHuDun
   */
  generateDynamicStems(yearStem: HeavenlyStem, monthBranch: EarthlyBranch): HeavenlyStem[];

  /**
   * Calculate palace relationships
   */
  calculatePalaceRelationships(palaceIndex: number): {
    opposite: number;      // 对宫
    triangle: number[];    // 三方
    square: number[];      // 四正
  };

  /**
   * Get palace by index
   */
  getPalaceByIndex(index: number): PalaceName;
}

// ============= Facade Interface =============

/**
 * ZiWei Algorithm Facade Interface (紫微算法门面接口)
 */
export interface IZiWeiFacade {
  /**
   * Calculate complete chart
   */
  calculateCompleteChart(
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
  ): Promise<CompleteChart>;

  /**
   * Calculate with lunar date
   */
  calculateWithLunarDate(
    lunarDate: LunarDate,
    options?: CalculationOptions
  ): CompleteChart;

  /**
   * Get cached result
   */
  getCachedResult(cacheKey: string): CompleteChart | null;

  /**
   * Clear cache
   */
  clearCache(): void;

  /**
   * Batch calculate multiple charts
   */
  batchCalculate(
    birthInfos: Array<Parameters<IZiWeiFacade['calculateCompleteChart']>[0]>,
    options?: CalculationOptions
  ): Promise<CompleteChart[]>;
}

// ============= Registry Interface =============

/**
 * Algorithm Registry Interface (算法注册中心接口)
 */
export interface IAlgorithmRegistry {
  /**
   * Get ZiWei facade singleton
   */
  getZiWeiFacade(): IZiWeiFacade;

  /**
   * Register custom calculator
   */
  registerCalculator<T>(name: string, calculator: T): void;

  /**
   * Get registered calculator
   */
  getCalculator<T>(name: string): T | null;

  /**
   * Check if calculator exists
   */
  hasCalculator(name: string): boolean;
}

// ============= Cache Interface =============

/**
 * Cache Manager Interface (缓存管理器接口)
 */
export interface ICacheManager {
  /**
   * Get from cache
   */
  get<T>(key: string): T | null;

  /**
   * Set to cache
   */
  set<T>(key: string, value: T, ttl?: number): void;

  /**
   * Check if key exists
   */
  has(key: string): boolean;

  /**
   * Delete from cache
   */
  delete(key: string): boolean;

  /**
   * Clear all cache
   */
  clear(): void;

  /**
   * Get cache stats
   */
  getStats(): {
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  };
}

// ============= Formatter Interface =============

/**
 * Web display format
 */
export interface WebChartDisplay {
  palaces: Array<{
    name: string;
    position: number;
    stars: string[];
    transformations?: string[];
  }>;
  birthInfo: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
}

/**
 * Native display format
 */
export interface NativeChartDisplay {
  palaces: PalaceData[];
  birthInfo: BirthInfo;
  metadata?: Record<string, unknown>;
}

/**
 * Display Formatter Interface (显示格式化器接口)
 */
export interface IDisplayFormatter {
  /**
   * Format for web display
   */
  formatForWeb(chart: CompleteChart): WebChartDisplay;

  /**
   * Format for native display
   */
  formatForNative(chart: CompleteChart): NativeChartDisplay;

  /**
   * Get stars in snake order
   */
  getStarsInSnakeOrder(stars: Star[]): Star[];

  /**
   * Format palace name
   */
  formatPalaceName(name: PalaceName, locale?: string): string;

  /**
   * Format star name
   */
  formatStarName(star: Star, locale?: string): string;
}

// ============= Validation Interface =============

/**
 * Input Validator Interface (输入验证器接口)
 */
export interface IInputValidator {
  /**
   * Validate birth information
   */
  validateBirthInfo(birthInfo: Partial<BirthInfo>): boolean;

  /**
   * Validate lunar date
   */
  validateLunarDate(lunarDate: Partial<LunarDate>): boolean;

  /**
   * Validate calculation options
   */
  validateOptions(options: Partial<CalculationOptions>): boolean;

  /**
   * Get validation errors
   */
  getErrors(): string[];
}
