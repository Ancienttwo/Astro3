/**
 * Palace Calculator - Palace positioning and relationships for ZiWei Dou Shu
 * 宫位计算器 - 紫微斗数宫位定位与关系计算
 */

import type {
  PalaceName,
  PalacePosition,
  PalaceData,
  EarthlyBranch,
  HeavenlyStem,
  LunarDate,
  Star,
  FiveElement,
} from '../types/core';
import type { IPalaceCalculator } from '../types/algorithms';
import { 
  EARTHLY_BRANCHES, 
  HEAVENLY_STEMS,
  PALACE_NAMES,
  WUHUDUN_TABLE,
} from '../constants/ziwei-constants';

/**
 * Palace Calculator Class
 * 宫位计算器类
 * 
 * Handles all palace-related calculations:
 * 1. Life Palace (命宫) positioning
 * 2. Body Palace (身宫) positioning  
 * 3. Palace relationships (三方四正)
 * 4. Dynamic stems using WuHuDun (五虎遁)
 */
export class PalaceCalculator implements IPalaceCalculator {
  private palaceCache: Map<string, Map<PalaceName, PalaceData>> = new Map();

  /**
   * Calculate all palace positions for a birth chart
   * 计算命盘的所有宫位
   */
  calculatePalaces(lunarDate: LunarDate): Map<PalaceName, PalaceData> {
    const cacheKey = JSON.stringify(lunarDate);
    
    if (this.palaceCache.has(cacheKey)) {
      return this.palaceCache.get(cacheKey)!;
    }

    const palaces = new Map<PalaceName, PalaceData>();
    
    // Calculate Life Palace (命宫)
    const lifePalaceIndex = this.calculateLifePalace(
      lunarDate.monthBranch,
      lunarDate.hourBranch
    );
    
    // Calculate Body Palace (身宫)
    const bodyPalaceIndex = this.calculateBodyPalace(
      lunarDate.month,
      EARTHLY_BRANCHES.indexOf(lunarDate.hourBranch) + 1
    );
    
    // Generate dynamic stems for all palaces
    const palaceStems = this.generateDynamicStems(
      lunarDate.yearStem,
      lunarDate.monthBranch
    );
    
    // Create palace data for each position
    PALACE_NAMES.forEach((palaceName, relativeIndex) => {
      // Calculate absolute branch index
      const branchIndex = (lifePalaceIndex + relativeIndex) % 12;
      const branch = (EARTHLY_BRANCHES[branchIndex] ?? '子') as EarthlyBranch;
      const stem = (palaceStems[branchIndex] ?? HEAVENLY_STEMS[0]) as HeavenlyStem;
      
      // Determine palace element based on branch
      const element = this.getBranchElement(branch);
      
      // Create palace position
      const position: PalacePosition = {
        index: branchIndex,
        name: palaceName,
        branch,
        stem,
        element,
      };
      
      // Create palace data
      const palaceData: PalaceData = {
        position,
        stars: [], // Will be filled by StarCalculator
        sihua: [],  // Will be filled by SihuaCalculator
        selfTransformations: [],
        majorStarCount: 0,
        isEmpty: true, // Will be updated when stars are added
      };
      
      palaces.set(palaceName, palaceData);
    });
    
    this.palaceCache.set(cacheKey, palaces);
    return palaces;
  }

  /**
   * Calculate Life Palace position (命宫定位)
   * Formula: 寅 + 月 - 时
   */
  private calculateLifePalace(
    monthBranch: EarthlyBranch,
    hourBranch: EarthlyBranch
  ): number {
    const monthIndex = EARTHLY_BRANCHES.indexOf(monthBranch);
    const hourIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
    
    // 寅 is at index 2
    // Formula: (寅 + 月 - 时 + 12) % 12
    let lifePalaceIndex = (2 + monthIndex - hourIndex + 12) % 12;
    
    // Adjust if necessary
    if (lifePalaceIndex < 0) {
      lifePalaceIndex += 12;
    }
    
    return lifePalaceIndex;
  }

  /**
   * Calculate Body Palace position (身宫定位)
   * Formula: 寅 + 月 + 时
   */
  private calculateBodyPalace(
    monthLunar: number,
    hourBranch: number
  ): number {
    // Convert month to branch index (正月=寅, index 2)
    const monthBranchIndex = (monthLunar + 1) % 12;
    
    // Hour branch is already 1-12, convert to 0-11
    const hourIndex = (hourBranch - 1) % 12;
    
    // Formula: (寅 + 月 + 时) % 12
    let bodyPalaceIndex = (2 + monthBranchIndex + hourIndex) % 12;
    
    // Adjust if necessary
    if (bodyPalaceIndex < 0) {
      bodyPalaceIndex += 12;
    }
    
    return bodyPalaceIndex;
  }

  /**
   * Generate dynamic stems using WuHuDun (五虎遁)
   * 使用五虎遁生成动态天干
   */
  generateDynamicStems(
    yearStem: HeavenlyStem,
    monthBranch: EarthlyBranch
  ): HeavenlyStem[] {
    // Get starting stem from WuHuDun table
    const startStem = WUHUDUN_TABLE[yearStem];
    if (!startStem) {
      throw new Error(`Invalid year stem for WuHuDun: ${yearStem}`);
    }
    
    const startIndex = HEAVENLY_STEMS.indexOf(startStem);
    const stems: HeavenlyStem[] = [];
    
    // Generate stems for 12 palaces
    // Month order: 寅、卯、辰、巳、午、未、申、酉、戌、亥、子、丑
    const monthOrder = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
    
    // Create a mapping from branch index to stem
    const stemsByBranch: HeavenlyStem[] = new Array(12);
    
    for (let i = 0; i < 12; i++) {
      const stemIndex = (startIndex + i) % 10;
      const branchIndex = monthOrder[i] ?? 0;
      stemsByBranch[branchIndex] = (HEAVENLY_STEMS[stemIndex] ?? HEAVENLY_STEMS[0]) as HeavenlyStem;
    }
    
    return stemsByBranch;
  }

  /**
   * Calculate palace relationships (三方四正)
   * 计算宫位关系
   */
  calculatePalaceRelationships(palaceIndex: number): {
    opposite: number;      // 对宫
    triangle: number[];    // 三方
    square: number[];      // 四正
  } {
    // Validate index
    if (palaceIndex < 0 || palaceIndex > 11) {
      throw new Error(`Invalid palace index: ${palaceIndex}`);
    }
    
    // Opposite palace (对宫) - 6 positions away
    const opposite = (palaceIndex + 6) % 12;
    
    // Triangle palaces (三方) - 4 positions away on each side
    const triangle = [
      (palaceIndex + 4) % 12,
      (palaceIndex + 8) % 12,
    ];
    
    // Square palaces (四正) - includes self, opposite, and triangles
    const square = [
      palaceIndex,
      opposite,
      ...triangle,
    ];
    
    return {
      opposite,
      triangle,
      square,
    };
  }

  /**
   * Get palace by index
   * 根据索引获取宫位名称
   */
  getPalaceByIndex(index: number): PalaceName {
    // Validate index
    if (index < 0 || index > 11) {
      throw new Error(`Invalid palace index: ${index}`);
    }
    
    return (PALACE_NAMES[index] ?? PALACE_NAMES[0]) as PalaceName;
  }

  /**
   * Get palace index by name
   * 根据宫位名称获取索引
   */
  getPalaceIndexByName(name: PalaceName): number {
    const index = PALACE_NAMES.indexOf(name);
    
    if (index === -1) {
      throw new Error(`Invalid palace name: ${name}`);
    }
    
    return index;
  }

  /**
   * Calculate Laiyin Palace (来因宫)
   * The palace where the year stem appears
   */
  calculateLaiyinPalace(
    yearStem: HeavenlyStem,
    palaceStems: HeavenlyStem[]
  ): number {
    // Find which palace has the same stem as the year
    const laiyinIndex = palaceStems.findIndex(stem => stem === yearStem);
    
    // If not found, return -1 or throw error based on requirements
    return laiyinIndex >= 0 ? laiyinIndex : -1;
  }

  /**
   * Get element for earthly branch
   * 获取地支五行
   */
  private getBranchElement(branch: EarthlyBranch): FiveElement {
    const elementMap: Record<EarthlyBranch, FiveElement> = {
      '子': '水',
      '丑': '土',
      '寅': '木',
      '卯': '木',
      '辰': '土',
      '巳': '火',
      '午': '火',
      '未': '土',
      '申': '金',
      '酉': '金',
      '戌': '土',
      '亥': '水',
    };
    return elementMap[branch];
  }

  /**
   * Calculate special palace relationships
   * 计算特殊宫位关系
   */
  calculateSpecialRelationships(
    lifePalaceIndex: number,
    bodyPalaceIndex: number
  ): {
    isBodyInLife: boolean;           // 身命同宫
    isBodyInOpposite: boolean;       // 身在对宫
    isBodyInTriangle: boolean;       // 身在三方
    bodyLifeRelationship: string;    // 关系描述
  } {
    const relationships = this.calculatePalaceRelationships(lifePalaceIndex);
    
    const isBodyInLife = bodyPalaceIndex === lifePalaceIndex;
    const isBodyInOpposite = bodyPalaceIndex === relationships.opposite;
    const isBodyInTriangle = relationships.triangle.includes(bodyPalaceIndex);
    
    let bodyLifeRelationship = '其他';
    if (isBodyInLife) {
      bodyLifeRelationship = '身命同宫';
    } else if (isBodyInOpposite) {
      bodyLifeRelationship = '身在对宫';
    } else if (isBodyInTriangle) {
      bodyLifeRelationship = '身在三方';
    }
    
    return {
      isBodyInLife,
      isBodyInOpposite,
      isBodyInTriangle,
      bodyLifeRelationship,
    };
  }

  /**
   * Get palace strength based on stars
   * 根据星曜判断宫位强弱
   */
  calculatePalaceStrength(stars: Star[]): {
    strength: number;           // 0-100
    hasMainStar: boolean;       // 是否有主星
    mainStarCount: number;      // 主星数量
    description: string;        // 强弱描述
  } {
    const mainStars = stars.filter(star => star.isMainStar);
    const hasMainStar = mainStars.length > 0;
    const mainStarCount = mainStars.length;
    
    // Calculate strength score
    let strength = 0;
    
    // Main stars contribute most to strength
    strength += mainStarCount * 30;
    
    // Check for bright stars
    const brightStars = stars.filter(star => 
      star.brightness === '庙' || star.brightness === '旺'
    );
    strength += brightStars.length * 10;
    
    // Check for beneficial transformations
    const beneficialSihua = stars.filter(star =>
      star.sihuaTransformations?.some(t => 
        t.type === '化禄' || t.type === '化权' || t.type === '化科'
      )
    );
    strength += beneficialSihua.length * 15;
    
    // Cap at 100
    strength = Math.min(100, strength);
    
    // Generate description
    let description = '弱';
    if (strength >= 85) {
      description = '极强';
    } else if (strength >= 60) {
      description = '强';
    } else if (strength >= 40) {
      description = '中';
    } else if (strength >= 20) {
      description = '偏弱';
    }
    
    return {
      strength,
      hasMainStar,
      mainStarCount,
      description,
    };
  }

  /**
   * Clear palace cache
   */
  clearCache(): void {
    this.palaceCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { palaceEntries: number } {
    return {
      palaceEntries: this.palaceCache.size,
    };
  }
}
