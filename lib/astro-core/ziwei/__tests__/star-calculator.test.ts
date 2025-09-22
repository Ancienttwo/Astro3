/**
 * Star Calculator Tests
 * 星曜计算器测试
 */

import { StarCalculator } from '../calculations/star-calculator';
import { SihuaCalculator } from '../calculations/sihua-calculator';
import type { LunarDate, CalculationOptions } from '../types/core';

describe('StarCalculator', () => {
  let calculator: StarCalculator;
  let sihuaCalculator: SihuaCalculator;
  
  beforeEach(() => {
    sihuaCalculator = new SihuaCalculator();
    calculator = new StarCalculator(sihuaCalculator);
  });
  
  describe('calculateStarsForPalace', () => {
    it('should calculate stars for a given palace', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      const stars = calculator.calculateStarsForPalace(0, lunarDate);
      
      expect(stars).toBeDefined();
      expect(Array.isArray(stars)).toBe(true);
      expect(stars.length).toBeGreaterThan(0);
      
      // Check star structure
      stars.forEach(star => {
        expect(star).toHaveProperty('name');
        expect(star).toHaveProperty('category');
        expect(star).toHaveProperty('isMainStar');
      });
    });
    
    it('should include main stars', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      const stars = calculator.calculateStarsForPalace(2, lunarDate);
      const mainStars = stars.filter(s => s.isMainStar);
      
      expect(mainStars.length).toBeGreaterThan(0);
      
      // Check for known main stars
      const mainStarNames = mainStars.map(s => s.name);
      const knownMainStars = ['紫微', '天机', '太阳', '武曲', '天同', '廉贞', 
                              '天府', '太阴', '贪狼', '巨门', '天相', '天梁', 
                              '七杀', '破军'];
      
      const hasKnownMainStar = mainStarNames.some(name => 
        knownMainStars.includes(name)
      );
      expect(hasKnownMainStar).toBe(true);
    });
    
    it('should include sihua transformations when birth year sihua is present', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      const options: CalculationOptions = {
        includeSelfTransformations: true,
      };
      
      const stars = calculator.calculateStarsForPalace(0, lunarDate, options);
      const starsWithSihua = stars.filter(s => 
        s.sihuaTransformations && s.sihuaTransformations.length > 0
      );
      
      // Year stem '甲' should create sihua transformations
      expect(starsWithSihua.length).toBeGreaterThan(0);
    });
    
    it('should cache results for same input', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      const stars1 = calculator.calculateStarsForPalace(0, lunarDate);
      const stars2 = calculator.calculateStarsForPalace(0, lunarDate);
      
      // Should return the same reference due to caching
      expect(stars1).toBe(stars2);
    });
  });
  
  describe('star positioning', () => {
    it('should correctly position ZiWei star series', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 1, // Day 1 for predictable position
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      // Calculate for all palaces to find ZiWei
      let ziweiFound = false;
      for (let i = 0; i < 12; i++) {
        const stars = calculator.calculateStarsForPalace(i, lunarDate);
        const ziwei = stars.find(s => s.name === '紫微');
        if (ziwei) {
          ziweiFound = true;
          expect(ziwei.isMainStar).toBe(true);
          break;
        }
      }
      
      expect(ziweiFound).toBe(true);
    });
    
    it('should correctly position TianFu star series', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 1,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      // Calculate for all palaces to find TianFu
      let tianfuFound = false;
      for (let i = 0; i < 12; i++) {
        const stars = calculator.calculateStarsForPalace(i, lunarDate);
        const tianfu = stars.find(s => s.name === '天府');
        if (tianfu) {
          tianfuFound = true;
          expect(tianfu.isMainStar).toBe(true);
          break;
        }
      }
      
      expect(tianfuFound).toBe(true);
    });
  });
  
  describe('star brightness', () => {
    it('should assign brightness levels to stars', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      const stars = calculator.calculateStarsForPalace(0, lunarDate);
      const mainStars = stars.filter(s => s.isMainStar);
      
      mainStars.forEach(star => {
        expect(star.brightness).toBeDefined();
        expect(['庙', '旺', '得', '利', '平', '不', '陷']).toContain(star.brightness);
      });
    });
  });
  
  describe('cache management', () => {
    it('should clear cache', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      // Calculate and cache
      calculator.calculateStarsForPalace(0, lunarDate);
      
      const statsBefore = calculator.getCacheStats();
      expect(statsBefore.positions).toBeGreaterThan(0);
      
      // Clear cache
      calculator.clearCache();
      
      const statsAfter = calculator.getCacheStats();
      expect(statsAfter.positions).toBe(0);
    });
    
    it('should report cache statistics', () => {
      const lunarDate: LunarDate = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 5,
        isLeapMonth: false,
        yearStem: '甲',
        yearBranch: '辰',
        monthStem: '乙',
        monthBranch: '亥',
        dayStem: '丙',
        dayBranch: '子',
        hourStem: '癸',
        hourBranch: '巳',
      };
      
      // Calculate multiple palaces
      for (let i = 0; i < 5; i++) {
        calculator.calculateStarsForPalace(i, lunarDate);
      }
      
      const stats = calculator.getCacheStats();
      expect(stats.positions).toBe(5);
      expect(stats.sihuaCache).toBeGreaterThanOrEqual(0);
    });
  });
});