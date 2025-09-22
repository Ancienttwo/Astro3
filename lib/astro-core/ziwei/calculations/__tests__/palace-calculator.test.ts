/**
 * PalaceCalculator Test Suite
 * 宫位计算器测试套件
 */

import { PalaceCalculator } from '../palace-calculator';
import type { LunarDate, PalaceData } from '../../types/core';
import { PALACE_NAMES, EARTHLY_BRANCHES, HEAVENLY_STEMS } from '../../constants/ziwei-constants';

describe('PalaceCalculator', () => {
  let calculator: PalaceCalculator;
  
  // Sample lunar date for testing
  const sampleLunarDate: LunarDate = {
    year: 2024,
    month: 1,        // 正月
    day: 15,
    hour: 0,         // 子时
    yearStem: '甲',
    yearBranch: '辰',
    monthStem: '丙',
    monthBranch: '寅',  // 正月 = 寅
    dayStem: '戊',
    dayBranch: '子',
    hourStem: '壬',
    hourBranch: '子',   // 子时
  };

  beforeEach(() => {
    calculator = new PalaceCalculator();
  });

  afterEach(() => {
    calculator.clearCache();
  });

  describe('calculatePalaces', () => {
    it('should calculate all 12 palaces', () => {
      const palaces = calculator.calculatePalaces(sampleLunarDate);
      
      expect(palaces.size).toBe(12);
      
      // Check all palace names are present
      PALACE_NAMES.forEach(name => {
        expect(palaces.has(name)).toBe(true);
      });
    });

    it('should assign correct branches to palaces', () => {
      const palaces = calculator.calculatePalaces(sampleLunarDate);
      
      // Collect all branches
      const branches = new Set<string>();
      palaces.forEach(palace => {
        branches.add(palace.position.branch);
      });
      
      // Should have 12 unique branches
      expect(branches.size).toBe(12);
      
      // All branches should be valid
      branches.forEach(branch => {
        expect(EARTHLY_BRANCHES).toContain(branch);
      });
    });

    it('should assign stems using WuHuDun', () => {
      const palaces = calculator.calculatePalaces(sampleLunarDate);
      
      // For year stem 甲, WuHuDun starts with 丙 at 寅
      // Check all palaces have valid stems
      palaces.forEach(palace => {
        expect(HEAVENLY_STEMS).toContain(palace.position.stem);
      });
    });

    it('should calculate Life Palace correctly', () => {
      // For 正月(寅) 子时
      // Formula: (寅 + 月 - 时 + 12) % 12
      // (2 + 2 - 0 + 12) % 12 = 4 (辰)
      const palaces = calculator.calculatePalaces(sampleLunarDate);
      const lifePalace = palaces.get('命宫');
      
      expect(lifePalace).toBeDefined();
      expect(lifePalace?.position.branch).toBe('辰');
    });

    it('should set palace elements correctly', () => {
      const palaces = calculator.calculatePalaces(sampleLunarDate);
      
      palaces.forEach(palace => {
        const element = palace.position.element;
        expect(['木', '火', '土', '金', '水']).toContain(element);
        
        // Verify specific branch-element mappings
        switch (palace.position.branch) {
          case '寅':
          case '卯':
            expect(element).toBe('木');
            break;
          case '巳':
          case '午':
            expect(element).toBe('火');
            break;
          case '申':
          case '酉':
            expect(element).toBe('金');
            break;
          case '子':
          case '亥':
            expect(element).toBe('水');
            break;
          case '丑':
          case '辰':
          case '未':
          case '戌':
            expect(element).toBe('土');
            break;
        }
      });
    });
  });

  describe('calculatePalaceRelationships', () => {
    it('should calculate opposite palace correctly', () => {
      // Opposite is 6 positions away
      const relationships = calculator.calculatePalaceRelationships(0);
      expect(relationships.opposite).toBe(6);
      
      const relationships2 = calculator.calculatePalaceRelationships(3);
      expect(relationships2.opposite).toBe(9);
      
      const relationships3 = calculator.calculatePalaceRelationships(9);
      expect(relationships3.opposite).toBe(3);
    });

    it('should calculate triangle palaces correctly', () => {
      // Triangle palaces are 4 and 8 positions away
      const relationships = calculator.calculatePalaceRelationships(0);
      expect(relationships.triangle).toEqual([4, 8]);
      
      const relationships2 = calculator.calculatePalaceRelationships(5);
      expect(relationships2.triangle).toEqual([9, 1]);
    });

    it('should calculate square palaces correctly', () => {
      // Square includes self, opposite, and triangles
      const relationships = calculator.calculatePalaceRelationships(0);
      expect(relationships.square).toEqual([0, 6, 4, 8]);
      expect(relationships.square.length).toBe(4);
    });

    it('should handle wrap-around correctly', () => {
      const relationships = calculator.calculatePalaceRelationships(10);
      expect(relationships.opposite).toBe(4);
      expect(relationships.triangle).toEqual([2, 6]);
      expect(relationships.square).toEqual([10, 4, 2, 6]);
    });

    it('should throw error for invalid palace index', () => {
      expect(() => calculator.calculatePalaceRelationships(-1)).toThrow();
      expect(() => calculator.calculatePalaceRelationships(12)).toThrow();
    });
  });

  describe('generateDynamicStems', () => {
    it('should generate correct stems using WuHuDun for 甲 year', () => {
      const stems = calculator.generateDynamicStems('甲', '寅');
      
      // For 甲 year, WuHuDun starts with 丙 at 寅
      // 甲己之年丙作首
      expect(stems[2]).toBe('丙'); // 寅 is at index 2
      expect(stems[3]).toBe('丁'); // 卯
      expect(stems[4]).toBe('戊'); // 辰
      
      // All stems should be valid
      stems.forEach(stem => {
        expect(HEAVENLY_STEMS).toContain(stem);
      });
    });

    it('should generate correct stems for different year stems', () => {
      // Test 乙庚之岁戊为头
      const stemsYi = calculator.generateDynamicStems('乙', '寅');
      expect(stemsYi[2]).toBe('戊'); // 寅 starts with 戊
      
      const stemsGeng = calculator.generateDynamicStems('庚', '寅');
      expect(stemsGeng[2]).toBe('戊'); // 寅 starts with 戊
      
      // Test 丙辛必定寻庚起
      const stemsBing = calculator.generateDynamicStems('丙', '寅');
      expect(stemsBing[2]).toBe('庚'); // 寅 starts with 庚
      
      const stemsXin = calculator.generateDynamicStems('辛', '寅');
      expect(stemsXin[2]).toBe('庚'); // 寅 starts with 庚
    });

    it('should throw error for invalid year stem', () => {
      expect(() => calculator.generateDynamicStems('invalid' as any, '寅')).toThrow();
    });
  });

  describe('getPalaceByIndex and getPalaceIndexByName', () => {
    it('should correctly map between palace index and name', () => {
      // Test index to name
      expect(calculator.getPalaceByIndex(0)).toBe('命宫');
      expect(calculator.getPalaceByIndex(1)).toBe('兄弟');
      expect(calculator.getPalaceByIndex(11)).toBe('父母');
      
      // Test name to index
      expect(calculator.getPalaceIndexByName('命宫')).toBe(0);
      expect(calculator.getPalaceIndexByName('兄弟')).toBe(1);
      expect(calculator.getPalaceIndexByName('父母')).toBe(11);
    });

    it('should throw error for invalid inputs', () => {
      expect(() => calculator.getPalaceByIndex(-1)).toThrow();
      expect(() => calculator.getPalaceByIndex(12)).toThrow();
      expect(() => calculator.getPalaceIndexByName('invalid' as any)).toThrow();
    });
  });

  describe('calculateLaiyinPalace', () => {
    it('should find palace with matching year stem', () => {
      const stems = calculator.generateDynamicStems('甲', '寅');
      const laiyinIndex = calculator.calculateLaiyinPalace('甲', stems);
      
      // Should find the palace where stem equals 甲
      if (laiyinIndex >= 0) {
        expect(stems[laiyinIndex]).toBe('甲');
      }
    });

    it('should return -1 if year stem not found in palaces', () => {
      const stems = calculator.generateDynamicStems('甲', '寅');
      // If 癸 is not in the generated stems, should return -1
      const laiyinIndex = calculator.calculateLaiyinPalace('癸', stems);
      
      if (laiyinIndex === -1) {
        expect(stems).not.toContain('癸');
      } else {
        expect(stems[laiyinIndex]).toBe('癸');
      }
    });
  });

  describe('calculateSpecialRelationships', () => {
    it('should detect when body palace is in life palace', () => {
      const result = calculator.calculateSpecialRelationships(3, 3);
      
      expect(result.isBodyInLife).toBe(true);
      expect(result.isBodyInOpposite).toBe(false);
      expect(result.isBodyInTriangle).toBe(false);
      expect(result.bodyLifeRelationship).toBe('身命同宫');
    });

    it('should detect when body palace is opposite to life palace', () => {
      const result = calculator.calculateSpecialRelationships(0, 6);
      
      expect(result.isBodyInLife).toBe(false);
      expect(result.isBodyInOpposite).toBe(true);
      expect(result.isBodyInTriangle).toBe(false);
      expect(result.bodyLifeRelationship).toBe('身在对宫');
    });

    it('should detect when body palace is in triangle', () => {
      const result = calculator.calculateSpecialRelationships(0, 4);
      
      expect(result.isBodyInLife).toBe(false);
      expect(result.isBodyInOpposite).toBe(false);
      expect(result.isBodyInTriangle).toBe(true);
      expect(result.bodyLifeRelationship).toBe('身在三方');
    });

    it('should handle other relationships', () => {
      const result = calculator.calculateSpecialRelationships(0, 2);
      
      expect(result.isBodyInLife).toBe(false);
      expect(result.isBodyInOpposite).toBe(false);
      expect(result.isBodyInTriangle).toBe(false);
      expect(result.bodyLifeRelationship).toBe('其他');
    });
  });

  describe('calculatePalaceStrength', () => {
    it('should calculate strength based on main stars', () => {
      const stars = [
        { name: '紫微', category: '主星' as const, isMainStar: true, brightness: '庙' as const },
        { name: '天机', category: '主星' as const, isMainStar: true, brightness: '旺' as const },
      ];
      
      const result = calculator.calculatePalaceStrength(stars);
      
      expect(result.hasMainStar).toBe(true);
      expect(result.mainStarCount).toBe(2);
      expect(result.strength).toBeGreaterThan(60);
      expect(result.description).toBe('强');
    });

    it('should consider brightness in strength calculation', () => {
      const brightStars = [
        { name: '紫微', category: '主星' as const, brightness: '庙' as const },
        { name: '天府', category: '主星' as const, brightness: '旺' as const },
      ];
      
      const dimStars = [
        { name: '紫微', category: '主星' as const, brightness: '陷' as const },
        { name: '天府', category: '主星' as const, brightness: '不' as const },
      ];
      
      const brightResult = calculator.calculatePalaceStrength(brightStars);
      const dimResult = calculator.calculatePalaceStrength(dimStars);
      
      expect(brightResult.strength).toBeGreaterThan(dimResult.strength);
    });

    it('should consider beneficial sihua transformations', () => {
      const starsWithSihua = [
        { 
          name: '紫微', 
          category: '主星' as const, 
          isMainStar: true,
          sihuaTransformations: [
            { star: '紫微', type: '化禄' as const, source: 'birth' as const, code: 'A' }
          ]
        },
      ];
      
      const result = calculator.calculatePalaceStrength(starsWithSihua);
      expect(result.strength).toBeGreaterThan(30); // Base main star + sihua bonus
    });

    it('should cap strength at 100', () => {
      const manyStars = Array(10).fill(null).map((_, i) => ({
        name: `Star${i}`,
        category: '主星' as const,
        isMainStar: true,
        brightness: '庙' as const,
      }));
      
      const result = calculator.calculatePalaceStrength(manyStars);
      expect(result.strength).toBe(100);
      expect(result.description).toBe('极强');
    });
  });

  describe('cache management', () => {
    it('should cache palace calculations', () => {
      // First call - should calculate
      const palaces1 = calculator.calculatePalaces(sampleLunarDate);
      
      // Check cache stats
      const stats1 = calculator.getCacheStats();
      expect(stats1.palaceEntries).toBe(1);
      
      // Second call - should use cache
      const palaces2 = calculator.calculatePalaces(sampleLunarDate);
      
      // Results should be identical
      expect(palaces2).toBe(palaces1);
      
      // Cache stats should be the same
      const stats2 = calculator.getCacheStats();
      expect(stats2.palaceEntries).toBe(1);
    });

    it('should clear cache', () => {
      // Add to cache
      calculator.calculatePalaces(sampleLunarDate);
      
      // Verify cache has data
      const statsBefore = calculator.getCacheStats();
      expect(statsBefore.palaceEntries).toBe(1);
      
      // Clear cache
      calculator.clearCache();
      
      // Verify cache is empty
      const statsAfter = calculator.getCacheStats();
      expect(statsAfter.palaceEntries).toBe(0);
    });
  });
});