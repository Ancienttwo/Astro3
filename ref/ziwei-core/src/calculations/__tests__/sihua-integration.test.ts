/**
 * Sihua Integration Test Suite
 * 四化集成测试套件
 */

import { StarCalculator } from '../star-calculator';
import { SihuaCalculator } from '../sihua-calculator';
import type { LunarDate, CalculationOptions } from '../../types/core';

describe('Sihua Integration with StarCalculator', () => {
  let starCalculator: StarCalculator;
  let sihuaCalculator: SihuaCalculator;
  
  // Sample lunar date for testing
  const sampleLunarDate: LunarDate = {
    year: 2024,
    month: 1,
    day: 15,
    hour: 0,
    yearStem: '甲',
    yearBranch: '辰',
    monthStem: '丙',
    monthBranch: '寅',
    dayStem: '戊',
    dayBranch: '子',
    hourStem: '壬',
    hourBranch: '子',
  };

  beforeEach(() => {
    starCalculator = new StarCalculator();
    sihuaCalculator = new SihuaCalculator();
  });

  afterEach(() => {
    starCalculator.clearCache();
    sihuaCalculator.clearCache();
  });

  describe('Sihua Transformations in Stars', () => {
    it('should include birth year sihua in stars', () => {
      const options: CalculationOptions = {
        includeSihua: true,
        fiveElementsBureau: '水二局',
      };
      
      const stars = starCalculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Check if any stars have sihua transformations
      const starsWithSihua = stars.filter(star => star.sihuaTransformations && star.sihuaTransformations.length > 0);
      
      // For year stem 甲, we should have transformations
      // 甲: 廉贞化禄, 破军化权, 武曲化科, 太阳化忌
      expect(starsWithSihua.length).toBeGreaterThan(0);
      
      // Find specific star with transformation
      const lianZhen = stars.find(star => star.name === '廉贞');
      if (lianZhen && lianZhen.sihuaTransformations) {
        const birthTrans = lianZhen.sihuaTransformations.find(t => t.source === 'birth');
        expect(birthTrans).toBeDefined();
        expect(birthTrans?.type).toBe('化禄');
        expect(birthTrans?.code).toBe('A');
      }
    });

    it('should detect self-transformations when palace stem transforms stars in same palace', () => {
      const options: CalculationOptions = {
        includeSihua: true,
        fiveElementsBureau: '水二局',
      };
      
      // Calculate for a specific palace
      const palaceIndex = 2; // 寅宫
      const stars = starCalculator.calculateStarsForPalace(palaceIndex, sampleLunarDate, options);
      
      // Check for self-transformations
      const starsWithSelfTrans = stars.filter(star => 
        star.sihuaTransformations?.some(t => 
          t.source === 'self-outward' || t.source === 'self-inward'
        )
      );
      
      // Verify self-transformation codes
      starsWithSelfTrans.forEach(star => {
        star.sihuaTransformations?.forEach(trans => {
          if (trans.source === 'self-outward') {
            expect(trans.code).toMatch(/^x[ABCD]$/);
          } else if (trans.source === 'self-inward') {
            expect(trans.code).toMatch(/^i[ABCD]$/);
          }
        });
      });
    });

    it('should calculate palace stem sihua correctly', () => {
      const options: CalculationOptions = {
        includeSihua: true,
        fiveElementsBureau: '水二局',
      };
      
      // Test multiple palaces
      for (let palaceIndex = 0; palaceIndex < 12; palaceIndex++) {
        const stars = starCalculator.calculateStarsForPalace(palaceIndex, sampleLunarDate, options);
        
        // Get palace stem for this palace
        const palaceStem = sihuaCalculator.getPalaceStem(sampleLunarDate.yearStem, palaceIndex);
        
        // Calculate expected sihua for this palace stem
        const expectedSihua = sihuaCalculator.calculatePalaceStemSihua(palaceStem, palaceIndex);
        
        // Verify that stars have the correct palace sihua if applicable
        expectedSihua.forEach(expected => {
          const star = stars.find(s => s.name === expected.star);
          if (star) {
            const palaceTrans = star.sihuaTransformations?.find(t => 
              t.source === 'palace' && t.sourcePalaceIndex === palaceIndex
            );
            
            if (palaceTrans) {
              expect(palaceTrans.type).toBe(expected.type);
              expect(palaceTrans.code).toMatch(/^P[ABCD]$/);
            }
          }
        });
      }
    });

    it('should not include sihua when includeSihua is false', () => {
      const options: CalculationOptions = {
        includeSihua: false,
        fiveElementsBureau: '水二局',
      };
      
      const stars = starCalculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // No stars should have sihua transformations
      const starsWithSihua = stars.filter(star => star.sihuaTransformations && star.sihuaTransformations.length > 0);
      expect(starsWithSihua.length).toBe(0);
    });

    it('should handle multiple transformations on same star', () => {
      const options: CalculationOptions = {
        includeSihua: true,
        fiveElementsBureau: '水二局',
      };
      
      // Find a palace where a star might have multiple transformations
      const stars = starCalculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Check if any star has multiple transformations
      const multiTransStar = stars.find(star => 
        star.sihuaTransformations && star.sihuaTransformations.length > 1
      );
      
      if (multiTransStar) {
        // Verify each transformation has unique source or type
        const sources = new Set(multiTransStar.sihuaTransformations!.map(t => t.source));
        expect(sources.size).toBeGreaterThan(0);
        
        // Verify codes are different
        const codes = new Set(multiTransStar.sihuaTransformations!.map(t => t.code));
        expect(codes.size).toBe(multiTransStar.sihuaTransformations!.length);
      }
    });
  });

  describe('WuHuDun Palace Stems', () => {
    it('should calculate correct palace stems using WuHuDun', () => {
      // Test for year stem 甲
      const palaceStems = sihuaCalculator.calculatePalaceStems('甲');
      
      // For 甲 year, 寅 month should start with 丙
      expect(palaceStems[0]).toBe('丙'); // 寅
      expect(palaceStems[1]).toBe('丁'); // 卯
      expect(palaceStems[2]).toBe('戊'); // 辰
      
      // Verify all 12 palace stems are calculated
      expect(palaceStems.length).toBe(12);
    });

    it('should get correct palace stem for specific palace', () => {
      // Test getting stem for specific palace
      const stem = sihuaCalculator.getPalaceStem('甲', 2); // 寅宫
      
      // The palace order needs to be mapped correctly
      // For year 甲, palace at index 2 (寅) should have stem from WuHuDun
      expect(stem).toBeDefined();
      expect(['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']).toContain(stem);
    });
  });

  describe('Cache Integration', () => {
    it('should cache sihua calculations when cache is enabled', () => {
      const options: CalculationOptions = {
        includeSihua: true,
        useCache: true,
        fiveElementsBureau: '水二局',
      };
      
      // First call - should calculate
      const stars1 = starCalculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Second call - should use cache
      const stars2 = starCalculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Results should be identical
      expect(stars2).toEqual(stars1);
      
      // Verify sihua transformations are also cached
      const star1WithSihua = stars1.find(s => s.sihuaTransformations && s.sihuaTransformations.length > 0);
      const star2WithSihua = stars2.find(s => s.name === star1WithSihua?.name);
      
      if (star1WithSihua && star2WithSihua) {
        expect(star2WithSihua.sihuaTransformations).toEqual(star1WithSihua.sihuaTransformations);
      }
      
      // Check cache stats
      const cacheStats = starCalculator.getCacheStats();
      expect(cacheStats.positions).toBeGreaterThan(0);
    });
  });
});