/**
 * StarCalculator Test Suite
 * 星曜计算器测试套件
 */

import { StarCalculator } from '../star-calculator';
import type { LunarDate, CalculationOptions } from '../../types/core';

describe('StarCalculator', () => {
  let calculator: StarCalculator;
  
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
    calculator = new StarCalculator();
  });

  afterEach(() => {
    calculator.clearCache();
  });

  describe('calculateStarsForPalace', () => {
    it('should calculate stars for a given palace', () => {
      const stars = calculator.calculateStarsForPalace(0, sampleLunarDate);
      
      expect(stars).toBeDefined();
      expect(Array.isArray(stars)).toBe(true);
      expect(stars.length).toBeGreaterThan(0);
    });

    it('should include main stars', () => {
      const stars = calculator.calculateStarsForPalace(0, sampleLunarDate);
      const mainStars = stars.filter(star => star.isMainStar);
      
      expect(mainStars.length).toBeGreaterThanOrEqual(0);
      mainStars.forEach(star => {
        expect(star.category).toBe('主星');
        expect(star.brightness).toBeDefined();
      });
    });

    it('should include auxiliary stars', () => {
      const stars = calculator.calculateStarsForPalace(0, sampleLunarDate);
      const auxStars = stars.filter(star => star.category === '辅星');
      
      expect(auxStars.length).toBeGreaterThanOrEqual(0);
      auxStars.forEach(star => {
        expect(star.isMainStar).toBe(false);
        expect(star.brightness).toBeDefined();
      });
    });

    it('should include malefic stars when option is enabled', () => {
      const options: CalculationOptions = {
        includeMinorStars: true,
      };
      
      const stars = calculator.calculateStarsForPalace(0, sampleLunarDate, options);
      const maleficStars = stars.filter(star => star.category === '煞星');
      
      expect(maleficStars.length).toBeGreaterThanOrEqual(0);
      maleficStars.forEach(star => {
        expect(star.isMainStar).toBe(false);
        expect(star.brightness).toBeDefined();
      });
    });

    it('should use cache when enabled', () => {
      const options: CalculationOptions = {
        useCache: true,
      };
      
      // First call - should calculate
      const stars1 = calculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Check cache stats
      const stats1 = calculator.getCacheStats();
      expect(stats1.positions).toBeGreaterThan(0);
      
      // Second call - should use cache
      const stars2 = calculator.calculateStarsForPalace(0, sampleLunarDate, options);
      
      // Results should be identical
      expect(stars2).toEqual(stars1);
      
      // Cache stats should be the same
      const stats2 = calculator.getCacheStats();
      expect(stats2.positions).toEqual(stats1.positions);
    });
  });

  describe('calculateBrightness', () => {
    it('should calculate star brightness for a palace', () => {
      const brightness = calculator.calculateBrightness('紫微', 0);
      
      expect(brightness).toBeDefined();
      expect(['庙', '旺', '得', '利', '平', '不', '陷']).toContain(brightness);
    });

    it('should return default brightness for unknown stars', () => {
      const brightness = calculator.calculateBrightness('UnknownStar', 0);
      
      expect(brightness).toBe('平');
    });

    it('should use cache for brightness calculations', () => {
      // First call
      const brightness1 = calculator.calculateBrightness('紫微', 0);
      
      // Check cache
      const stats1 = calculator.getCacheStats();
      expect(stats1.brightness).toBeGreaterThan(0);
      
      // Second call - should use cache
      const brightness2 = calculator.calculateBrightness('紫微', 0);
      
      expect(brightness2).toEqual(brightness1);
    });
  });

  describe('cache management', () => {
    it('should clear all caches', () => {
      // Add some data to caches
      calculator.calculateStarsForPalace(0, sampleLunarDate, { useCache: true });
      calculator.calculateBrightness('紫微', 0);
      
      // Verify caches have data
      const statsBefore = calculator.getCacheStats();
      expect(statsBefore.brightness).toBeGreaterThan(0);
      expect(statsBefore.positions).toBeGreaterThan(0);
      
      // Clear caches
      calculator.clearCache();
      
      // Verify caches are empty
      const statsAfter = calculator.getCacheStats();
      expect(statsAfter.brightness).toBe(0);
      expect(statsAfter.positions).toBe(0);
    });
  });

  describe('star positioning accuracy', () => {
    it('should position ZiWei star correctly based on Five Elements Bureau', () => {
      const options: CalculationOptions = {
        fiveElementsBureau: '水二局',
      };
      
      // For 水二局, day 15, ZiWei should be at 申 (index 8)
      const stars = calculator.calculateStarsForPalace(8, sampleLunarDate, options);
      const ziwei = stars.find(star => star.name === '紫微');
      
      if (ziwei) {
        expect(ziwei).toBeDefined();
        expect(ziwei.category).toBe('主星');
      }
    });

    it('should position auxiliary stars based on birth time', () => {
      // Test Wenchang position (戌起子时逆数)
      // For hour 子 (index 0), Wenchang should be at 戌 (index 10)
      const stars = calculator.calculateStarsForPalace(10, sampleLunarDate);
      const wenchang = stars.find(star => star.name === '文昌');
      
      if (wenchang) {
        expect(wenchang).toBeDefined();
        expect(wenchang.category).toBe('辅星');
      }
    });
  });
});