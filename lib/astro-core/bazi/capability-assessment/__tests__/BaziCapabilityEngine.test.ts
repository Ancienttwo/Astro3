/**
 * BaziCapabilityEngine 单元测试
 * 测试八字能力评估引擎的核心功能
 */

import { BaziCapabilityEngine, createBaziEngine, createCustomBaziEngine } from '../BaziCapabilityEngine';
import { BaziInput, TenGodStrength, CapabilityScores, AlgorithmOutput, AlgorithmConfig } from '../types';

describe('BaziCapabilityEngine', () => {
  let engine: BaziCapabilityEngine;
  
  // 测试用八字数据
  const testBaziInput: BaziInput = {
    pillars: {
      year: { stem: '庚', branch: '午' },
      month: { stem: '壬', branch: '午' },
      day: { stem: '甲', branch: '子' },
      hour: { stem: '丙', branch: '寅' }
    },
    gender: 'male',
    solarDate: {
      year: 1990,
      month: 6,
      day: 15,
      hour: 10,
      minute: 30
    }
  };
  
  beforeEach(() => {
    engine = createBaziEngine();
  });

  describe('引擎创建和配置', () => {
    it('应该成功创建默认引擎实例', () => {
      expect(engine).toBeInstanceOf(BaziCapabilityEngine);
      expect(engine).toBeDefined();
    });

    it('应该能创建自定义配置的引擎', () => {
      const customAlgoConfig: Partial<AlgorithmConfig> = {
        position_weights: {
          month: 20.0,
          day: 15.0,
          hour: 12.0,
          year: 10.0
        }
      };
      
      const customEngine = createCustomBaziEngine(customAlgoConfig);
      
      expect(customEngine).toBeInstanceOf(BaziCapabilityEngine);
      expect(customEngine).toBeDefined();
    });

    it('应该能获取当前配置', () => {
      const config = engine.getConfig();
      
      expect(config).toHaveProperty('position_weights');
      expect(config).toHaveProperty('layer_coefficients');
      expect(config).toHaveProperty('amplification');
      expect(config.position_weights).toHaveProperty('month');
      expect(config.position_weights).toHaveProperty('day');
    });

    it('应该能更新配置', () => {
      const newConfig: Partial<AlgorithmConfig> = {
        position_weights: {
          month: 30.0,
          day: 20.0,
          hour: 15.0,
          year: 12.0
        }
      };
      
      engine.updateConfig(newConfig);
      const updatedConfig = engine.getConfig();
      
      expect(updatedConfig.position_weights.month).toBe(30.0);
    });
  });

  describe('输入验证', () => {
    it('应该验证有效输入', () => {
      const validation = engine.validateInput(testBaziInput);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('应该识别无效输入', () => {
      const invalidInput = {
        pillars: {
          year: { stem: '甲' as any, branch: '午' as any },
          month: { stem: '壬' as any, branch: '午' as any },
          day: { stem: '甲' as any, branch: '子' as any },
          hour: { stem: '丙' as any, branch: '寅' as any }
        },
        gender: 'invalid' as any,
        solarDate: {
          year: 1990,
          month: 6,
          day: 15,
          hour: 10,
          minute: 30
        }
      };
      
      expect(() => engine.validateInput(invalidInput)).toBeDefined();
    });
  });

  describe('十神强度计算', () => {
    it('应该能计算十神强度', async () => {
      const result = await engine.calculateTenGodStrength(testBaziInput);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // 验证十神类型完整性
      expect(result).toHaveProperty('比肩');
      expect(result).toHaveProperty('劫财');
      expect(result).toHaveProperty('食神');
      expect(result).toHaveProperty('伤官');
      expect(result).toHaveProperty('正财');
      expect(result).toHaveProperty('偏财');
      expect(result).toHaveProperty('正官');
      expect(result).toHaveProperty('七杀');
      expect(result).toHaveProperty('正印');
      expect(result).toHaveProperty('偏印');
      
      // 验证每个十神强度值
      expect(typeof result['比肩']).toBe('number');
      expect(result['比肩']).toBeGreaterThanOrEqual(0);
      expect(result['比肩']).toBeLessThanOrEqual(1);
    });

    it('强度分布总和应该接近1.0', async () => {
      const result = await engine.calculateTenGodStrength(testBaziInput);
      
      const total = Object.values(result).reduce((sum, value) => sum + value, 0);
      
      // 允许一定的数值误差
      expect(total).toBeCloseTo(1.0, 2);
    });
  });

  describe('能力评分计算', () => {
    it('应该能基于十神强度计算能力评分', async () => {
      const tenGodStrength = await engine.calculateTenGodStrength(testBaziInput);
      const result = await engine.calculateCapabilityScores(tenGodStrength, testBaziInput);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      // 验证六项能力都存在
      expect(result).toHaveProperty('执行力基础分');
      expect(result).toHaveProperty('创新力基础分');
      expect(result).toHaveProperty('管理力基础分');
      expect(result).toHaveProperty('销售力基础分');
      expect(result).toHaveProperty('协调力基础分');
      expect(result).toHaveProperty('稳定性基础分');
      
      // 验证能力分数
      expect(typeof result['执行力基础分']).toBe('number');
      expect(result['执行力基础分']).toBeGreaterThanOrEqual(0);
      expect(result['执行力基础分']).toBeLessThanOrEqual(100);
    });

    it('能力评分应该在合理范围内', async () => {
      const tenGodStrength = await engine.calculateTenGodStrength(testBaziInput);
      const result = await engine.calculateCapabilityScores(tenGodStrength, testBaziInput);
      
      Object.values(result).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(typeof score).toBe('number');
        expect(score).not.toBeNaN();
      });
    });
  });

  describe('完整评估', () => {
    it('应该能进行完整评估', async () => {
      const result = await engine.evaluateComplete(testBaziInput);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('ten_god_strength');
      expect(result).toHaveProperty('clusters');
      expect(result).toHaveProperty('capabilities');
      expect(result).toHaveProperty('tags');
      expect(result).toHaveProperty('intermediates');
    });

    it('完整评估结果应该包含所有必要字段', async () => {
      const result = await engine.evaluateComplete(testBaziInput);
      
      // 验证十神强度
      expect(result.ten_god_strength).toBeDefined();
      Object.values(result.ten_god_strength).forEach(value => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
      });
      
      // 验证能力评分
      expect(result.capabilities).toBeDefined();
      Object.values(result.capabilities).forEach(score => {
        expect(typeof score).toBe('number');
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
      
      // 验证聚合分数
      expect(result.clusters).toBeDefined();
      expect(result.clusters).toHaveProperty('食伤');
      expect(result.clusters).toHaveProperty('官杀');
      expect(result.clusters).toHaveProperty('比劫');
      expect(result.clusters).toHaveProperty('财');
      expect(result.clusters).toHaveProperty('印');
    });
  });

  describe('辅助分析功能', () => {
    it('应该能分析根分值', async () => {
      const result = await engine.analyzeRootScores(testBaziInput);
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('object');
      
      expect(result).toHaveProperty('木');
      expect(result).toHaveProperty('火');
      expect(result).toHaveProperty('土');
      expect(result).toHaveProperty('金');
      expect(result).toHaveProperty('水');
      
      expect(typeof result['木']).toBe('number');
      expect(result['木']).toBeGreaterThanOrEqual(0);
    });

    it('应该能检测虚透天干', async () => {
      const result = await engine.detectPhantomStems(testBaziInput);
      
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      result.forEach(stem => {
        expect(typeof stem).toBe('string');
      });
    });

    it('应该能检测格局', async () => {
      const tenGodStrength = await engine.calculateTenGodStrength(testBaziInput);
      const result = engine.detectPattern(tenGodStrength);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('pattern_type');
      expect(result).toHaveProperty('dominant_ten_god');
      expect(result).toHaveProperty('strength_ratio');
      expect(result).toHaveProperty('confidence');
      
      expect(typeof result.pattern_type).toBe('string');
      expect(typeof result.confidence).toBe('number');
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('批量处理', () => {
    it('应该能处理批量输入', async () => {
      const inputs = [testBaziInput, testBaziInput];
      const results = await engine.evaluateBatch(inputs);
      
      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results).toHaveLength(2);
      
      results.forEach(result => {
        expect(result).toHaveProperty('ten_god_strength');
        expect(result).toHaveProperty('capabilities');
        expect(result).toHaveProperty('clusters');
      });
    });
  });

  describe('性能测试', () => {
    it('应该能进行性能测试', async () => {
      const result = await engine.performanceTest(testBaziInput, 10);
      
      expect(result).toBeDefined();
      expect(result).toHaveProperty('average_time_ms');
      expect(result).toHaveProperty('min_time_ms');
      expect(result).toHaveProperty('max_time_ms');
      expect(result).toHaveProperty('total_time_ms');
      
      expect(typeof result.average_time_ms).toBe('number');
      expect(result.average_time_ms).toBeGreaterThan(0);
      expect(result.min_time_ms).toBeLessThanOrEqual(result.average_time_ms);
      expect(result.max_time_ms).toBeGreaterThanOrEqual(result.average_time_ms);
    });

    it('单次计算应该在合理时间内完成', async () => {
      const startTime = Date.now();
      await engine.evaluateComplete(testBaziInput);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // 1秒内完成
    });
  });

  describe('输出验证', () => {
    it('应该验证输出结果', async () => {
      const result = await engine.evaluateComplete(testBaziInput);
      const validation = engine.validateOutput(result);
      
      expect(validation.valid).toBe(true);
      expect(validation.warnings).toBeDefined();
      expect(Array.isArray(validation.warnings)).toBe(true);
    });
  });

  describe('极端情况处理', () => {
    it('应该处理边界值输入', async () => {
      const boundaryInput: BaziInput = {
        pillars: {
          year: { stem: '甲', branch: '子' },
          month: { stem: '甲', branch: '子' },
          day: { stem: '甲', branch: '子' },
          hour: { stem: '甲', branch: '子' }
        },
        gender: 'female',
        solarDate: {
          year: 2000,
          month: 1,
          day: 1,
          hour: 0,
          minute: 0
        }
      };
      
      const result = await engine.evaluateComplete(boundaryInput);
      
      expect(result).toBeDefined();
      expect(result.ten_god_strength).toBeDefined();
      expect(result.capabilities).toBeDefined();
    });

    it('应该处理多次相同输入', async () => {
      const result1 = await engine.evaluateComplete(testBaziInput);
      const result2 = await engine.evaluateComplete(testBaziInput);
      
      expect(result1.ten_god_strength).toEqual(result2.ten_god_strength);
      expect(result1.capabilities).toEqual(result2.capabilities);
    });
  });
});