/**
 * Sihua Calculator - Four Transformations System for ZiWei Dou Shu
 * 四化计算器 - 紫微斗数四化系统
 */

import type {
  HeavenlyStem,
  EarthlyBranch,
  SihuaType,
  SihuaTransformation,
  LunarDate,
  Star,
} from '../types/core';
import type { ISihuaCalculator } from '../types/algorithms';
import { 
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  SIHUA_MAPPING,
  WUHUDUN_TABLE,
} from '../constants/ziwei-constants';

/**
 * Sihua Calculator Class
 * 四化计算器类
 * 
 * Handles all four transformation calculations:
 * 1. Birth Year Sihua (生年四化)
 * 2. Palace Stem Sihua (宫干四化)
 * 3. Self-transformations (自化)
 *    - Outward (离心自化): xA, xB, xC, xD
 *    - Inward (向心自化): iA, iB, iC, iD
 */
export class SihuaCalculator implements ISihuaCalculator {
  private sihuaCache: Map<string, SihuaTransformation[]> = new Map();

  /**
   * Calculate birth year sihua (生年四化)
   * Based on the year stem, determines which stars transform
   */
  calculateBirthYearSihua(yearStem: HeavenlyStem): SihuaTransformation[] {
    const cacheKey = `birth-${yearStem}`;
    
    if (this.sihuaCache.has(cacheKey)) {
      return this.sihuaCache.get(cacheKey)!;
    }

    const transformations: SihuaTransformation[] = [];
    const sihuaMap = SIHUA_MAPPING[yearStem];

    if (sihuaMap) {
      // Create transformations for each sihua type
      Object.entries(sihuaMap).forEach(([letter, starName]) => {
        if (starName) {
          const type = this.getSihuaTypeFromLetter(letter)
          transformations.push({
            star: starName,
            type,
            source: 'birth',
            code: this.getSihuaCode(type, 'birth'),
          });
        }
      });
    }

    this.sihuaCache.set(cacheKey, transformations);
    return transformations;
  }

  /**
   * Calculate palace stem sihua (宫干四化)
   * Based on the palace stem, determines which stars transform
   */
  calculatePalaceStemSihua(
    palaceStem: HeavenlyStem,
    palaceIndex: number
  ): SihuaTransformation[] {
    const cacheKey = `palace-${palaceStem}-${palaceIndex}`;
    
    if (this.sihuaCache.has(cacheKey)) {
      return this.sihuaCache.get(cacheKey)!;
    }

    const transformations: SihuaTransformation[] = [];
    const sihuaMap = SIHUA_MAPPING[palaceStem];

    if (sihuaMap) {
      Object.entries(sihuaMap).forEach(([letter, starName]) => {
        if (starName) {
          const type = this.getSihuaTypeFromLetter(letter)
          transformations.push({
            star: starName,
            type,
            source: 'palace',
            sourcePalaceIndex: palaceIndex,
            code: this.getSihuaCode(type, 'palace'),
          });
        }
      });
    }

    this.sihuaCache.set(cacheKey, transformations);
    return transformations;
  }

  /**
   * Detect self-transformations (自化)
   * Checks if palace stem transforms stars that are in the same palace
   */
  detectSelfTransformations(
    palaceStem: HeavenlyStem,
    starsInPalace: Star[],
    hasBirthSihua: Map<string, SihuaType>
  ): SihuaTransformation[] {
    const transformations: SihuaTransformation[] = [];
    const sihuaMap = SIHUA_MAPPING[palaceStem];

    if (!sihuaMap) return transformations;

    // Check each sihua transformation from palace stem
    Object.entries(sihuaMap).forEach(([letter, starName]) => {
      if (!starName) return;

      const type = this.getSihuaTypeFromLetter(letter)

      // Check if this star is in the current palace
      const starInPalace = starsInPalace.find(star => star.name === starName);
      if (starInPalace) {
        // Check if this star already has birth year sihua
        const birthSihuaType = hasBirthSihua.get(starName);

        if (birthSihuaType) {
          // Inward self-transformation (向心自化)
          // Palace stem transforms a star that already has birth sihua
          transformations.push({
            star: starName,
            type,
            source: 'self-inward',
            code: `i${this.getSihuaLetter(type)}`,
            description: `向心自化: ${starName} has birth ${birthSihuaType}, palace transforms to ${type}`,
          });
        } else {
          // Outward self-transformation (离心自化)
          // Palace stem transforms a star without birth sihua
          transformations.push({
            star: starName,
            type,
            source: 'self-outward',
            code: `x${this.getSihuaLetter(type)}`,
            description: `离心自化: ${starName} transformed by palace stem to ${type}`,
          });
        }
      }
    });

    return transformations;
  }

  /**
   * Detect flying transformations (飞化)
   * Checks transformations between different palaces
   */
  detectFlyingTransformations(
    sourcePalaceIndex: number,
    sourcePalaceStem: HeavenlyStem,
    targetPalaceIndex: number,
    starsInTargetPalace: Star[]
  ): SihuaTransformation[] {
    const transformations: SihuaTransformation[] = [];
    const sihuaMap = SIHUA_MAPPING[sourcePalaceStem];

    if (!sihuaMap) return transformations;

    // Check if source palace transforms stars in target palace
    Object.entries(sihuaMap).forEach(([letter, starName]) => {
      if (!starName) return;

      const type = this.getSihuaTypeFromLetter(letter)

      const starInTarget = starsInTargetPalace.find(star => star.name === starName);
      if (starInTarget) {
        transformations.push({
          star: starName,
          type,
          source: 'flying',
          sourcePalaceIndex,
          targetPalaceIndex,
          code: `${this.getSihuaLetter(type)}→${targetPalaceIndex}`,
          description: `飞化: Palace ${sourcePalaceIndex} transforms ${starName} in palace ${targetPalaceIndex}`,
        });
      }
    });

    return transformations;
  }

  /**
   * Calculate complete sihua for all palaces
   * Returns a comprehensive sihua analysis for the entire chart
   */
  calculateCompleteSihua(
    lunarDate: LunarDate,
    palaceStems: HeavenlyStem[],
    starsByPalace: Map<number, Star[]>
  ): Map<number, SihuaTransformation[]> {
    const result = new Map<number, SihuaTransformation[]>();
    
    // Step 1: Calculate birth year sihua
    const birthYearSihua = this.calculateBirthYearSihua(lunarDate.yearStem);
    
    // Create a map of stars that have birth sihua
    const birthSihuaMap = new Map<string, SihuaType>();
    birthYearSihua.forEach(trans => {
      birthSihuaMap.set(trans.star, trans.type);
    });

    // Step 2: Process each palace
    palaceStems.forEach((stem, palaceIndex) => {
      const transformations: SihuaTransformation[] = [];
      const starsInPalace = starsByPalace.get(palaceIndex) || [];

      // Add birth year sihua for stars in this palace
      birthYearSihua.forEach(trans => {
        if (starsInPalace.some(star => star.name === trans.star)) {
          transformations.push(trans);
        }
      });

      // Calculate palace stem sihua
      const palaceStemSihua = this.calculatePalaceStemSihua(stem, palaceIndex);

      // Detect self-transformations
      const selfTransformations = this.detectSelfTransformations(
        stem,
        starsInPalace,
        birthSihuaMap
      );

      transformations.push(...selfTransformations);

      // Detect flying transformations to other palaces
      starsByPalace.forEach((targetStars, targetIndex) => {
        if (targetIndex !== palaceIndex) {
          const flyingTrans = this.detectFlyingTransformations(
            palaceIndex,
            stem,
            targetIndex,
            targetStars
          );
          transformations.push(...flyingTrans);
        }
      });

      result.set(palaceIndex, transformations);
    });

    return result;
  }

  /**
   * Calculate palace stems using WuHuDun (五虎遁)
   * Determines the heavenly stem for each palace
   */
  calculatePalaceStems(yearStem: HeavenlyStem): HeavenlyStem[] {
    const startStem = WUHUDUN_TABLE[yearStem];
    if (!startStem) {
      throw new Error(`Invalid year stem: ${yearStem}`);
    }

    const startIndex = HEAVENLY_STEMS.indexOf(startStem);
    const palaceStems: HeavenlyStem[] = [];

    // Generate stems for 12 palaces starting from 寅 (index 2)
    // Month order: 寅、卯、辰、巳、午、未、申、酉、戌、亥、子、丑
    for (let i = 0; i < 12; i++) {
      const stemIndex = (startIndex + i) % 10;
      palaceStems.push((HEAVENLY_STEMS[stemIndex] ?? HEAVENLY_STEMS[0]) as HeavenlyStem);
    }

    return palaceStems;
  }

  /**
   * Get palace stem for a specific palace
   */
  getPalaceStem(yearStem: HeavenlyStem, palaceIndex: number): HeavenlyStem {
    const palaceStems = this.calculatePalaceStems(yearStem);
    
    // Convert palace index to month order index
    // Palace order: 子(0)、丑(1)、寅(2)、卯(3)、辰(4)、巳(5)、午(6)、未(7)、申(8)、酉(9)、戌(10)、亥(11)
    // Month order: 寅(2)、卯(3)、辰(4)、巳(5)、午(6)、未(7)、申(8)、酉(9)、戌(10)、亥(11)、子(0)、丑(1)
    const monthOrder = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
    const monthIndex = monthOrder.indexOf(palaceIndex);
    
    if (monthIndex === -1) {
      // Fallback: use direct index
      return (palaceStems[palaceIndex % 12] ?? HEAVENLY_STEMS[0]) as HeavenlyStem;
    }
    
    return (palaceStems[monthIndex] ?? HEAVENLY_STEMS[0]) as HeavenlyStem;
  }

  /**
   * Get sihua code letter (A, B, C, D)
   */
  private getSihuaLetter(type: SihuaType): string {
    const letterMap: Record<SihuaType, string> = {
      '化禄': 'A',
      '化权': 'B',
      '化科': 'C',
      '化忌': 'D',
    };
    return letterMap[type] || '';
  }

  private getSihuaTypeFromLetter(letter: string): SihuaType {
    const typeMap: Record<string, SihuaType> = {
      A: '化禄',
      B: '化权',
      C: '化科',
      D: '化忌'
    };
    return typeMap[letter] ?? '化禄';
  }

  /**
   * Get full sihua code based on type and source
   */
  private getSihuaCode(type: SihuaType, source: string): string {
    const letter = this.getSihuaLetter(type);
    
    switch (source) {
      case 'birth':
        return letter; // Birth sihua: A, B, C, D
      case 'palace':
        return `P${letter}`; // Palace sihua: PA, PB, PC, PD
      case 'self-outward':
        return `x${letter}`; // Outward self: xA, xB, xC, xD
      case 'self-inward':
        return `i${letter}`; // Inward self: iA, iB, iC, iD
      default:
        return letter;
    }
  }

  /**
   * Validate sihua transformation
   */
  validateTransformation(transformation: SihuaTransformation): boolean {
    // Check if star name is valid
    if (!transformation.star || transformation.star.length === 0) {
      return false;
    }

    // Check if type is valid
    const validTypes: SihuaType[] = ['化禄', '化权', '化科', '化忌'];
    if (!validTypes.includes(transformation.type)) {
      return false;
    }

    // Check if source is valid
    const validSources = ['birth', 'palace', 'self-outward', 'self-inward', 'flying'];
    if (!validSources.includes(transformation.source)) {
      return false;
    }

    return true;
  }

  /**
   * Get sihua description in Chinese
   */
  getSihuaDescription(type: SihuaType): string {
    const descriptions: Record<SihuaType, string> = {
      '化禄': '财禄、顺利、圆满',
      '化权': '权力、主动、掌控',
      '化科': '名声、文昌、贵人',
      '化忌': '困扰、执着、变动',
    };
    return descriptions[type] || '';
  }

  /**
   * Clear sihua cache
   */
  clearCache(): void {
    this.sihuaCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { sihuaEntries: number } {
    return {
      sihuaEntries: this.sihuaCache.size,
    };
  }
}
