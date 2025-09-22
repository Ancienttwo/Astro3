/**
 * BasicChartCalculator 能力评估集成测试
 * 测试图表计算器与能力评估系统的完整集成
 */

import {
  BasicChartCalculator,
  ChartUtils,
  ChartCalculationInput,
  BasicChartResult
} from '../index';

describe('BasicChartCalculator - 能力评估集成', () => {
  let calculator: BasicChartCalculator;
  
  beforeEach(() => {
    calculator = new BasicChartCalculator();
  });
  
  afterEach(() => {
    // 清理能力评估缓存
    calculator.clearCapabilityCache();
  });

  // 测试用八字输入数据
  const testInputs = [
    {
      name: '经典八字1',
      input: {
        year: 1990,
        month: 5,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      }
    },
    {
      name: '经典八字2',
      input: {
        year: 1985,
        month: 8,
        day: 23,
        hour: 10,
        minute: 45,
        gender: 'female' as const,
        isLunar: false
      }
    },
    {
      name: '农历八字',
      input: {
        year: 1992,
        month: 3,
        day: 8,
        hour: 16,
        minute: 0,
        gender: 'male' as const,
        isLunar: true
      }
    }
  ];

  describe('基础能力评估集成', () => {
    testInputs.forEach(({ name, input }) => {
      it(`应该成功为${name}计算基础排盘+能力评估`, async () => {
        const result = await calculator.calculateBasicChart(input, {
          includeCapabilityAssessment: true,
          capabilityAnalysisLevel: 'basic'
        });

        expect(result).toBeDefined();
        expect(result.fourPillars).toBeDefined();
        expect(result.tenGodAnalysis).toBeDefined();
        expect(result.capabilityAssessment).toBeDefined();

        // 验证基础能力评估数据结构
        const capability = result.capabilityAssessment!;
        console.log('basic capability', capability);
        expect(capability).toHaveProperty('tenGodStrength');
        expect(capability).toHaveProperty('capabilityScores');
        expect(capability).toHaveProperty('overallStrength');
        expect(capability).toHaveProperty('topCapabilities');

        // 验证十神强度数据
        expect(capability.tenGodStrength).toBeDefined();
        const tenGodStrength = capability.tenGodStrength!;
        expect(typeof tenGodStrength).toBe('object');
        Object.values(tenGodStrength).forEach(strength => {
          expect(typeof strength).toBe('number');
          expect(strength).toBeGreaterThanOrEqual(0);
          expect(strength).toBeLessThanOrEqual(100);
        });

        // 验证能力评分数据
        expect(capability.capabilityScores).toBeDefined();
        const capabilityScores = capability.capabilityScores;
        expect(typeof capabilityScores).toBe('object');
        const expectedCapabilities = ['execution', 'innovation', 'management', 'sales', 'coordination', 'stability'];
        expectedCapabilities.forEach(cap => {
          expect(capabilityScores).toHaveProperty(cap);
          const score = capabilityScores[cap as keyof typeof capabilityScores];
          expect(typeof score).toBe('number');
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        });
      });
    });

    it('应该正确处理不同性别的能力评估差异', async () => {
      const maleInput = testInputs[0].input;
      const femaleInput = { ...maleInput, gender: 'female' as const };

      const maleResult = await calculator.calculateBasicChart(maleInput, {
        includeCapabilityAssessment: true
      });

      const femaleResult = await calculator.calculateBasicChart(femaleInput, {
        includeCapabilityAssessment: true
      });

      expect(maleResult.capabilityAssessment).toBeDefined();
      expect(femaleResult.capabilityAssessment).toBeDefined();

      // 相同八字不同性别可能有不同的能力评估结果
      const maleCapability = maleResult.capabilityAssessment!;
      const femaleCapability = femaleResult.capabilityAssessment!;

      // 虽然可能有差异，但都应该是有效的评估结果
      expect(maleCapability.overallStrength).toBeGreaterThan(0);
      expect(femaleCapability.overallStrength).toBeGreaterThan(0);
      expect(maleCapability.topCapabilities).toBeDefined();
      expect(femaleCapability.topCapabilities).toBeDefined();
      expect(maleCapability.topCapabilities!.length).toBeGreaterThan(0);
      expect(femaleCapability.topCapabilities!.length).toBeGreaterThan(0);
    });
  });

  describe('完整能力评估集成', () => {
    testInputs.forEach(({ name, input }) => {
      it(`应该成功为${name}计算完整排盘+能力评估`, async () => {
        const result = await calculator.calculateBasicChart(input, {
          includeCapabilityAssessment: true,
          capabilityAnalysisLevel: 'comprehensive',
          includeTenGods: true,
          includeMajorPeriods: true,
          includeNaYin: true
        });

        expect(result).toBeDefined();
        expect(result.capabilityAssessment).toBeDefined();

        const capability = result.capabilityAssessment!;

        // 完整评估应该包含更多信息
        expect(capability).toHaveProperty('patterns');
        expect(capability).toHaveProperty('recommendations');

        // 验证格局信息
        if (capability.patterns) {
          expect(capability.patterns).toHaveProperty('patternType');
          expect(capability.patterns).toHaveProperty('confidence');
          expect(capability.patterns).toHaveProperty('description');
        }

        // 验证建议信息
        if (capability.recommendations && capability.recommendations.length > 0) {
          capability.recommendations.forEach(rec => {
            expect(rec).toHaveProperty('category');
            expect(rec).toHaveProperty('suggestion');
            expect(rec).toHaveProperty('priority');
          });
        }
      });
    });

    it('应该提供准确的前三大能力排名', async () => {
      const result = await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true,
        capabilityAnalysisLevel: 'comprehensive'
      });

      const capability = result.capabilityAssessment!;
      expect(capability.topCapabilities).toBeDefined();
      const topCapabilities = capability.topCapabilities!;
      expect(topCapabilities.length).toBeLessThanOrEqual(3);
      expect(topCapabilities.length).toBeGreaterThan(0);

      // 前三大能力应该按强度排序
      const scores = topCapabilities.map(name => capability.capabilityScores[name]);

      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    });
  });

  describe('ChartUtils 便利方法测试', () => {
    it('应该支持一次性计算排盘+能力评估', async () => {
      const result = await ChartUtils.calculateChartWithCapabilities(
        testInputs[0].input,
        'comprehensive'
      );

      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      expect(result.tenGodAnalysis).toBeDefined();
      expect(result.majorPeriods).toBeDefined();
      expect(result.naYin).toBeDefined();
      expect(result.capabilityAssessment).toBeDefined();

      // 应该包含完整的能力评估数据
      const capability = result.capabilityAssessment!;
      expect(capability.patterns).toBeDefined();
      expect(capability.recommendations).toBeDefined();
    });

    it('应该支持单独的能力评估计算', async () => {
      // 先计算基础排盘
      const basicResult = await calculator.calculateBasicChart(testInputs[0].input);
      
      // 再单独计算能力评估
      const capabilityResult = await ChartUtils.calculateCapabilityAssessment(
        basicResult,
        'comprehensive'
      );

      expect(capabilityResult).toBeDefined();
      expect(capabilityResult.tenGodStrength).toBeDefined();
      expect(capabilityResult.capabilityScores).toBeDefined();
    });

    it('应该提供能力分析摘要', async () => {
      const result = await ChartUtils.calculateChartWithCapabilities(
        testInputs[0].input,
        'comprehensive'
      );

      const summary = ChartUtils.getCapabilityAnalysisSummary(result);

      expect(summary).toBeDefined();
      expect(summary).toHaveProperty('topCapabilities');
      expect(summary).toHaveProperty('overallStrength');
      expect(summary).toHaveProperty('dominantTenGods');
      expect(summary).toHaveProperty('personalityType');

      expect(summary.topCapabilities).toBeDefined();
      expect(Array.isArray(summary.topCapabilities)).toBe(true);
      expect(summary.topCapabilities!.length).toBeGreaterThan(0);
      summary.topCapabilities!.forEach(cap => {
        expect(cap).toHaveProperty('key');
        expect(cap).toHaveProperty('label');
        expect(typeof cap.score).toBe('number');
      });

      expect(summary.overallStrength).toBeDefined();
      expect(typeof summary.overallStrength).toBe('number');
      expect(Array.isArray(summary.dominantTenGods)).toBe(true);
    });
  });

  describe('缓存机制测试', () => {
    it('应该正确实现能力评估缓存', async () => {
      const input = testInputs[0].input;

      const performanceBefore = calculator.getCapabilityEnginePerformance();

      // 第一次计算
      const startTime1 = Date.now();
      const result1 = await calculator.calculateBasicChart(input, {
        includeCapabilityAssessment: true
      });
      const duration1 = Date.now() - startTime1;

      // 第二次计算（应该使用缓存）
      const startTime2 = Date.now();
      const result2 = await calculator.calculateBasicChart(input, {
        includeCapabilityAssessment: true
      });
      const duration2 = Date.now() - startTime2;

      const performanceAfter = calculator.getCapabilityEnginePerformance();

      // 第二次应该不慢于第一次，并触发缓存命中
      expect(duration2).toBeLessThanOrEqual(duration1);
      expect(performanceAfter.cacheHitRate).toBeGreaterThanOrEqual(performanceBefore.cacheHitRate);
      expect(performanceAfter.totalCalculations).toBeGreaterThan(performanceBefore.totalCalculations);

      // 结果应该相同
      expect(result1.capabilityAssessment?.tenGodStrength)
        .toEqual(result2.capabilityAssessment?.tenGodStrength);
      expect(result1.capabilityAssessment?.capabilityScores)
        .toEqual(result2.capabilityAssessment?.capabilityScores);
    });

    it('应该能清理能力评估缓存', async () => {
      // 先计算建立缓存
      await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true
      });

      // 清理缓存
      calculator.clearCapabilityCache();

      // 再次计算应该重新执行
      const result = await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true
      });

      expect(result.capabilityAssessment).toBeDefined();
    });

    it('应该正确统计缓存性能', () => {
      const initialPerformance = calculator.getCapabilityEnginePerformance();
      expect(initialPerformance).toBeDefined();
      expect(typeof initialPerformance.totalCalculations).toBe('number');
      expect(typeof initialPerformance.totalEvaluations).toBe('number');
      expect(typeof initialPerformance.cacheHitRate).toBe('number');
    });
  });

  describe('错误处理和边界条件', () => {
    it('应该处理能力评估计算失败的情况', async () => {
      // 模拟无效输入
      const invalidInput: ChartCalculationInput = {
        year: 0,  // 无效年份
        month: 0, // 无效月份
        day: 0,   // 无效日期
        hour: 25, // 无效小时
        minute: 0,
        gender: 'male',
        isLunar: false
      };

      await expect(calculator.calculateBasicChart(invalidInput, {
        includeCapabilityAssessment: true
      })).rejects.toThrow();
    });

    it('应该处理部分数据缺失的情况', async () => {
      // 正常排盘但能力评估可能部分失败的情况下，应该优雅处理
      const result = await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true,
        capabilityAnalysisLevel: 'basic'
      });

      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      
      // 即使能力评估部分失败，基础排盘也应该成功
      if (result.capabilityAssessment) {
        expect(result.capabilityAssessment.tenGodStrength).toBeDefined();
      }
    });

    it('应该正确处理极端时间的八字', async () => {
      const extremeInput: ChartCalculationInput = {
        year: 1900,  // 极早的年份
        month: 1,
        day: 1,
        hour: 0,
        minute: 0,
        gender: 'female',
        isLunar: false
      };

      const result = await calculator.calculateBasicChart(extremeInput, {
        includeCapabilityAssessment: true
      });

      expect(result).toBeDefined();
      expect(result.capabilityAssessment).toBeDefined();
    });
  });

  describe('性能和压力测试', () => {
    it('批量计算应该高效执行', async () => {
      const inputs = testInputs.map(t => t.input);

      const startTime = Date.now();
      const results = await Promise.all(
        inputs.map(input => calculator.calculateBasicChart(input, {
          includeCapabilityAssessment: true,
          capabilityAnalysisLevel: 'basic'
        }))
      );
      const duration = Date.now() - startTime;

      expect(results.length).toBe(inputs.length);
      results.forEach(result => {
        expect(result.capabilityAssessment).toBeDefined();
      });

      const averageTime = duration / inputs.length;
      expect(averageTime).toBeLessThan(1000); // 平均1秒内完成
    });

    it('应该正确处理高频计算请求', async () => {
      const input = testInputs[0].input;
      const iterations = 10;

      const results = [];
      for (let i = 0; i < iterations; i++) {
        const result = await calculator.calculateBasicChart(input, {
          includeCapabilityAssessment: true
        });
        results.push(result);
      }

      // 所有结果应该一致（由于缓存）
      const firstCapability = results[0].capabilityAssessment!;
      results.forEach(result => {
        expect(result.capabilityAssessment?.tenGodStrength)
          .toEqual(firstCapability.tenGodStrength);
      });
    });

    it('内存使用应该保持稳定', async () => {
      const input = testInputs[0].input;
      
      // 多次计算不应该导致内存泄漏
      for (let i = 0; i < 50; i++) {
        await calculator.calculateBasicChart(input, {
          includeCapabilityAssessment: true
        });
        
        // 每10次清理一次缓存模拟实际使用
        if (i % 10 === 0) {
          calculator.clearCapabilityCache();
        }
      }

      // 最终应该能正常计算
      const finalResult = await calculator.calculateBasicChart(input, {
        includeCapabilityAssessment: true
      });
      
      expect(finalResult.capabilityAssessment).toBeDefined();
    });
  });

  describe('与其他模块的集成验证', () => {
    it('能力评估应该与十神分析保持一致', async () => {
      const result = await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true,
        includeTenGods: true
      });

      expect(result.tenGodAnalysis).toBeDefined();
      expect(result.capabilityAssessment).toBeDefined();

      // 十神分析和能力评估中的十神数据应该有关联性
      const tenGodAnalysis = result.tenGodAnalysis!;
      const capabilityTenGods = result.capabilityAssessment!.tenGodStrength;

      expect(tenGodAnalysis.relationships).toBeDefined();
      expect(capabilityTenGods).toBeDefined();

      if (capabilityTenGods) {
        Object.keys(capabilityTenGods as Record<string, number>).forEach(tenGod => {
          expect(typeof tenGod).toBe('string');
          expect(tenGod.length).toBeGreaterThan(0);
        });
      }
    });

    it('能力评估应该与大运分析协调', async () => {
      const result = await calculator.calculateBasicChart(testInputs[0].input, {
        includeCapabilityAssessment: true,
        includeMajorPeriods: true,
        majorPeriodCount: 8
      });

      expect(result.majorPeriods).toBeDefined();
      expect(result.capabilityAssessment).toBeDefined();

      // 大运和能力评估都应该成功计算
      expect(result.majorPeriods?.periods.length ?? 0).toBeGreaterThan(0);
      expect(result.capabilityAssessment!.overallStrength).toBeGreaterThan(0);
    });

    it('能力评估结果应该稳定可重现', async () => {
      const input = testInputs[0].input;

      // 多次独立计算
      const results = await Promise.all([
        calculator.calculateBasicChart(input, { includeCapabilityAssessment: true }),
        calculator.calculateBasicChart(input, { includeCapabilityAssessment: true }),
        calculator.calculateBasicChart(input, { includeCapabilityAssessment: true })
      ]);

      // 所有结果应该完全一致
      const firstCapability = results[0].capabilityAssessment!;
      results.slice(1).forEach(result => {
        expect(result.capabilityAssessment).toEqual(firstCapability);
      });
    });
  });
});
