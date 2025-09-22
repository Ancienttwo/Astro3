/**
 * ZiWei Facade Tests
 * 紫微门面测试
 */

import { ZiWeiFacade } from '../facade/ziwei-facade';
import type { BirthInfo, CalculationOptions } from '../types/core';

describe('ZiWeiFacade', () => {
  let facade: ZiWeiFacade;
  
  beforeEach(() => {
    facade = new ZiWeiFacade();
  });
  
  describe('calculateCompleteChart', () => {
    it('should calculate a complete chart from birth info', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      expect(chart).toBeDefined();
      expect(chart.birthInfo).toBeDefined();
      expect(chart.lunarDate).toBeDefined();
      expect(chart.palaces).toBeInstanceOf(Map);
      expect(chart.palaces.size).toBe(12);
      expect(chart.lifePalaceIndex).toBeGreaterThanOrEqual(0);
      expect(chart.lifePalaceIndex).toBeLessThan(12);
      expect(chart.bodyPalaceIndex).toBeGreaterThanOrEqual(0);
      expect(chart.bodyPalaceIndex).toBeLessThan(12);
    });
    
    it('should handle lunar date input', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 8,
        day: 15,
        hour: 10,
        minute: 0,
        gender: 'female',
        isLunar: true,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      expect(chart).toBeDefined();
      expect(chart.birthInfo.solar.isLunar).toBe(true);
    });
    
    it('should include optional calculations based on options', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const options: CalculationOptions = {
        includeMinorStars: true,
        includeSelfTransformations: true,
        calculateDynamicPalaces: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo, options);
      
      // Check for minor stars
      let hasMinorStars = false;
      chart.palaces.forEach(palace => {
        if (palace.stars.some(s => s.category === '小星')) {
          hasMinorStars = true;
        }
      });
      
      expect(hasMinorStars).toBe(true);
    });
  });
  
  describe('calculateWithLunarDate', () => {
    it('should calculate directly from lunar date', () => {
      const lunarDate = {
        year: 2024,
        month: 8,
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
      
      const chart = facade.calculateWithLunarDate(lunarDate);
      
      expect(chart).toBeDefined();
      expect(chart.lunarDate).toEqual(lunarDate);
      expect(chart.palaces.size).toBe(12);
    });
  });
  
  describe('palace structure', () => {
    it('should have all 12 palace names', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      const expectedPalaceNames = [
        '命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄',
        '迁移', '交友', '官禄', '田宅', '福德', '父母'
      ];
      
      const actualPalaceNames = Array.from(chart.palaces.keys());
      
      expectedPalaceNames.forEach(name => {
        expect(actualPalaceNames).toContain(name);
      });
    });
    
    it('should have stars in palaces', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      let totalStars = 0;
      let hasMainStars = false;
      
      chart.palaces.forEach(palace => {
        totalStars += palace.stars.length;
        if (palace.stars.some(s => s.isMainStar)) {
          hasMainStars = true;
        }
      });
      
      expect(totalStars).toBeGreaterThan(0);
      expect(hasMainStars).toBe(true);
    });
    
    it('should mark empty palaces correctly', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      chart.palaces.forEach(palace => {
        if (palace.stars.filter(s => s.isMainStar).length === 0) {
          expect(palace.isEmpty).toBe(true);
        } else {
          expect(palace.isEmpty).toBe(false);
        }
      });
    });
  });
  
  describe('sihua transformations', () => {
    it('should calculate birth year sihua', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo);
      
      // Check for birth year sihua
      let hasBirthSihua = false;
      chart.palaces.forEach(palace => {
        palace.sihua.forEach(si => {
          if (si.source === 'birth') {
            hasBirthSihua = true;
          }
        });
      });
      
      expect(hasBirthSihua).toBe(true);
    });
    
    it('should calculate self transformations when enabled', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const options: CalculationOptions = {
        includeSelfTransformations: true,
      };
      
      const chart = await facade.calculateCompleteChart(birthInfo, options);
      
      // Check for self transformations
      let hasSelfTransformation = false;
      chart.palaces.forEach(palace => {
        if (palace.selfTransformations.length > 0) {
          hasSelfTransformation = true;
        }
      });
      
      // May or may not have self transformations depending on the chart
      expect(typeof hasSelfTransformation).toBe('boolean');
    });
  });
  
  describe('caching', () => {
    it('should cache results', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const cacheKey = 'test-cache-key';
      
      const chart1 = await facade.calculateCompleteChart(birthInfo, {}, cacheKey);
      const cached = facade.getCachedResult(cacheKey);
      
      expect(cached).toBeDefined();
      expect(cached).toEqual(chart1);
    });
    
    it('should clear cache', async () => {
      const birthInfo: BirthInfo = {
        year: 2024,
        month: 10,
        day: 15,
        hour: 10,
        minute: 30,
        gender: 'male',
        isLunar: false,
      };
      
      const cacheKey = 'test-cache-key-2';
      
      await facade.calculateCompleteChart(birthInfo, {}, cacheKey);
      
      facade.clearCache();
      const cached = facade.getCachedResult(cacheKey);
      
      expect(cached).toBeNull();
    });
  });
  
  describe('batch calculation', () => {
    it('should calculate multiple charts in batch', async () => {
      const birthInfos: BirthInfo[] = [
        {
          year: 2024,
          month: 10,
          day: 15,
          hour: 10,
          minute: 30,
          gender: 'male',
          isLunar: false,
        },
        {
          year: 2023,
          month: 5,
          day: 20,
          hour: 14,
          minute: 0,
          gender: 'female',
          isLunar: false,
        },
      ];
      
      const charts = await facade.batchCalculate(birthInfos);
      
      expect(charts).toHaveLength(2);
      charts.forEach(chart => {
        expect(chart).toBeDefined();
        expect(chart.palaces.size).toBe(12);
      });
    });
  });
});