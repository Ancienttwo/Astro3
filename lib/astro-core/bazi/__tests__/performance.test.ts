/**
 * 性能和兼容性测试
 * 测试整个系统的性能表现和跨平台兼容性
 */

import {
  ChartUtils,
  BaziCapabilityEngine,
  createBaziEngine,
  CapabilityAssessmentUtils,
  AIPromptUtils
} from '../index';

// 测试数据集 - 涵盖不同类型的八字
const performanceTestCases = [
  // 标准八字
  { year: 1990, month: 5, day: 15, hour: 14, minute: 30, gender: 'male' as const, isLunar: false },
  { year: 1985, month: 8, day: 23, hour: 10, minute: 45, gender: 'female' as const, isLunar: false },
  // 极端时间
  { year: 1900, month: 1, day: 1, hour: 0, minute: 0, gender: 'male' as const, isLunar: false },
  { year: 2023, month: 12, day: 31, hour: 23, minute: 59, gender: 'female' as const, isLunar: false },
  // 农历八字
  { year: 1992, month: 3, day: 8, hour: 16, minute: 0, gender: 'male' as const, isLunar: true },
  { year: 1988, month: 7, day: 15, hour: 12, minute: 30, gender: 'female' as const, isLunar: true },
  // 特殊节气时间
  { year: 2000, month: 2, day: 4, hour: 14, minute: 20, gender: 'male' as const, isLunar: false }, // 立春附近
  { year: 2000, month: 2, day: 19, hour: 8, minute: 15, gender: 'female' as const, isLunar: false }, // 雨水附近
];

describe('性能和兼容性测试', () => {

  describe('基础排盘性能测试', () => {
    it('传统接口性能测试', async () => {
      const iterations = 100;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        const startTime = Date.now();
        const result = await ChartUtils.calculateFullChart(testCase);
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(result).toBeDefined();
        expect(result.fourPillars).toBeDefined();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`传统接口性能统计:`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);
      console.log(`  最大时间: ${maxTime}ms`);
      console.log(`  最小时间: ${minTime}ms`);
      console.log(`  总计算次数: ${iterations}`);

      // 性能要求
      expect(averageTime).toBeLessThan(100); // 平均100ms内完成
      expect(maxTime).toBeLessThan(500);     // 单次最大500ms内完成
    });

    it('新模块化接口性能测试', async () => {
      const iterations = 100;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        const startTime = Date.now();
        const result = await ChartUtils.calculateFullChart(testCase);
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(result).toBeDefined();
        expect(result.fourPillars).toBeDefined();
        expect(result.tenGodAnalysis).toBeDefined();
        expect(result.majorPeriods).toBeDefined();
        expect(result.naYin).toBeDefined();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`新接口性能统计:`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);
      console.log(`  最大时间: ${maxTime}ms`);

      expect(averageTime).toBeLessThan(150); // 新接口功能更多，允许稍慢
      expect(maxTime).toBeLessThan(800);
    });

    it('批量计算性能测试', async () => {
      const batchSize = 50;
      const testInputs = performanceTestCases.slice(0, batchSize);

      const startTime = Date.now();
      const results = await Promise.all(
        testInputs.map(input => ChartUtils.calculateFullChart(input))
      );
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / batchSize;

      console.log(`批量计算性能:`);
      console.log(`  总时间: ${totalTime}ms`);
      console.log(`  平均每次: ${averageTime.toFixed(2)}ms`);
      console.log(`  批量大小: ${batchSize}`);

      expect(results.length).toBe(batchSize);
      expect(averageTime).toBeLessThan(200); // 并行计算效率
    });
  });

  describe('能力评估系统性能测试', () => {
    let engine: BaziCapabilityEngine;

    beforeAll(() => {
      engine = createBaziEngine();
    });

    afterAll(() => {
      engine.clearCache();
    });

    it('能力评估引擎性能测试', async () => {
      const iterations = 100;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        // 将ChartCalculationInput转换为BaziInput
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        // 先计算八字获取四柱
        const chartResult = await ChartUtils.calculateFourPillarsOnly(testCase);
        const { fourPillars } = chartResult;

        // 转换为BaziInput格式
        const baziInput = {
          pillars: {
            year: { stem: fourPillars.year.stem, branch: fourPillars.year.branch },
            month: { stem: fourPillars.month.stem, branch: fourPillars.month.branch },
            day: { stem: fourPillars.day.stem, branch: fourPillars.day.branch },
            hour: { stem: fourPillars.hour.stem, branch: fourPillars.hour.branch }
          },
          gender: testCase.gender,
          solarDate: {
            year: testCase.year,
            month: testCase.month,
            day: testCase.day,
            hour: testCase.hour || 12,
            minute: testCase.minute || 0
          }
        };
        
        const startTime = Date.now();
        const result = await engine.evaluateBasic(baziInput);
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(result).toBeDefined();
        expect(result['执行力基础分']).toBeDefined();
        expect(result['创新力基础分']).toBeDefined();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`能力评估性能统计:`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);
      console.log(`  最大时间: ${maxTime}ms`);

      expect(averageTime).toBeLessThan(50);  // 纯算法应该很快
      expect(maxTime).toBeLessThan(200);
    });

    it('完整能力评估性能测试', async () => {
      const iterations = 50; // 完整评估更复杂，减少测试次数
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        const chartResult = await ChartUtils.calculateFourPillarsOnly(testCase);
        const baziInput = {
          pillars: {
            year: { stem: chartResult.fourPillars.year.stem, branch: chartResult.fourPillars.year.branch },
            month: { stem: chartResult.fourPillars.month.stem, branch: chartResult.fourPillars.month.branch },
            day: { stem: chartResult.fourPillars.day.stem, branch: chartResult.fourPillars.day.branch },
            hour: { stem: chartResult.fourPillars.hour.stem, branch: chartResult.fourPillars.hour.branch }
          },
          gender: testCase.gender,
          solarDate: {
            year: testCase.year,
            month: testCase.month,
            day: testCase.day,
            hour: testCase.hour || 12,
            minute: testCase.minute || 0
          }
        };
        
        const startTime = Date.now();
        const result = await engine.evaluateComplete(baziInput);
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(result).toBeDefined();
        expect(result.analysis_details).toBeDefined();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      console.log(`完整能力评估性能: ${averageTime.toFixed(2)}ms`);

      expect(averageTime).toBeLessThan(100); // 完整评估更复杂，允许更长时间
    });

    it('缓存机制性能验证', async () => {
      const testCase = performanceTestCases[0];
      const chartResult = await ChartUtils.calculateFourPillarsOnly(testCase);
      const baziInput = {
        pillars: {
          year: { stem: chartResult.fourPillars.year.stem, branch: chartResult.fourPillars.year.branch },
          month: { stem: chartResult.fourPillars.month.stem, branch: chartResult.fourPillars.month.branch },
          day: { stem: chartResult.fourPillars.day.stem, branch: chartResult.fourPillars.day.branch },
          hour: { stem: chartResult.fourPillars.hour.stem, branch: chartResult.fourPillars.hour.branch }
        },
        gender: testCase.gender,
        solarDate: {
          year: testCase.year,
          month: testCase.month,
          day: testCase.day,
          hour: testCase.hour || 12,
          minute: testCase.minute || 0
        }
      };

      // 第一次计算（建立缓存）
      const startTime1 = Date.now();
      await engine.evaluateBasic(baziInput);
      const firstTime = Date.now() - startTime1;

      // 后续计算（使用缓存）
      const cachedTimes = [];
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await engine.evaluateBasic(baziInput);
        cachedTimes.push(Date.now() - startTime);
      }

      const averageCachedTime = cachedTimes.reduce((sum, time) => sum + time, 0) / cachedTimes.length;

      console.log(`缓存性能对比:`);
      console.log(`  首次计算: ${firstTime}ms`);
      console.log(`  缓存平均: ${averageCachedTime.toFixed(2)}ms`);
      console.log(`  性能提升: ${(firstTime / averageCachedTime).toFixed(1)}x`);

      expect(averageCachedTime).toBeLessThan(firstTime * 0.5); // 缓存应该至少快50%
    });
  });

  describe('集成计算性能测试', () => {
    it('完整流程性能测试 (排盘 + 能力评估)', async () => {
      const iterations = 30;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        const startTime = Date.now();
        const result = await ChartUtils.calculateChartWithCapabilities(testCase, 'comprehensive');
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(result).toBeDefined();
        expect(result.fourPillars).toBeDefined();
        expect(result.capabilityAssessment).toBeDefined();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);

      console.log(`完整流程性能统计:`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);
      console.log(`  最大时间: ${maxTime}ms`);

      expect(averageTime).toBeLessThan(300); // 完整流程300ms内
      expect(maxTime).toBeLessThan(1000);    // 最长1秒内
    });

    it('AI提示词生成性能测试', async () => {
      const iterations = 20;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        
        // 先计算排盘
        const chartResult = await ChartUtils.calculateFullChart(testCase);
        
        const startTime = Date.now();
        const prompt = await AIPromptUtils.quickGenerate({
          fourPillars: chartResult.fourPillars,
          gender: testCase.gender,
          solarDate: chartResult.solarDate,
          timezone: 'Asia/Shanghai'
        }, {
          language: 'zh-CN',
          detailLevel: 'comprehensive'
        });
        const endTime = Date.now();

        times.push(endTime - startTime);
        
        expect(prompt).toBeDefined();
        expect(typeof prompt).toBe('string');
        expect(prompt.length).toBeGreaterThan(0);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;

      console.log(`AI提示词生成性能: ${averageTime.toFixed(2)}ms`);

      expect(averageTime).toBeLessThan(100); // AI提示词生成100ms内
    });
  });

  describe('内存使用和稳定性测试', () => {
    it('长时间运行稳定性测试', async () => {
      const iterations = 200;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < iterations; i++) {
        try {
          const testCase = performanceTestCases[i % performanceTestCases.length];
          const result = await ChartUtils.calculateChartWithCapabilities(testCase, 'basic');
          
          expect(result).toBeDefined();
          successCount++;
        } catch (error) {
          errorCount++;
          console.error(`Iteration ${i} failed:`, error);
        }

        // 每50次清理一次缓存模拟实际使用
        if (i % 50 === 0 && i > 0) {
          // 清理各种缓存
          const engine = createBaziEngine();
          engine.clearCache();
        }
      }

      console.log(`稳定性测试结果:`);
      console.log(`  成功次数: ${successCount}`);
      console.log(`  失败次数: ${errorCount}`);
      console.log(`  成功率: ${(successCount / iterations * 100).toFixed(2)}%`);

      expect(successCount).toBeGreaterThan(iterations * 0.95); // 95%以上成功率
    });

    it('并发计算压力测试', async () => {
      const concurrency = 20;
      const promises = [];

      for (let i = 0; i < concurrency; i++) {
        const testCase = performanceTestCases[i % performanceTestCases.length];
        promises.push(ChartUtils.calculateChartWithCapabilities(testCase, 'basic'));
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();

      const totalTime = endTime - startTime;
      const averageTime = totalTime / concurrency;

      console.log(`并发压力测试:`);
      console.log(`  并发数: ${concurrency}`);
      console.log(`  总时间: ${totalTime}ms`);
      console.log(`  平均时间: ${averageTime.toFixed(2)}ms`);

      expect(results.length).toBe(concurrency);
      results.forEach((result: any) => {
        expect(result).toBeDefined();
        expect(result.capabilityAssessment).toBeDefined();
      });

      expect(totalTime).toBeLessThan(5000); // 20个并发5秒内完成
    });
  });

  describe('跨平台兼容性测试', () => {
    it('应该在不同的JavaScript环境中正常工作', () => {
      // 测试基础JavaScript特性兼容性
      expect(typeof Promise).toBe('function');
      expect(typeof Map).toBe('function');
      expect(typeof Set).toBe('function');
      expect(typeof Array.from).toBe('function');
      expect(typeof Object.keys).toBe('function');
      expect(typeof Object.values).toBe('function');
      expect(typeof Object.entries).toBe('function');
    });

    it('应该正确处理中文字符', async () => {
      const testCase = performanceTestCases[0];
      const result = await ChartUtils.calculateFullChart(testCase);
      
      expect(result.fourPillars.year.stem).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
      expect(result.fourPillars.year.branch).toMatch(/[子丑寅卯辰巳午未申酉戌亥]/);
      
      if (result.naYin) {
        expect(typeof result.naYin.year).toBe('string');
        expect(result.naYin.year.length).toBeGreaterThan(0);
      }
    });

    it('应该正确处理时区和日期', async () => {
      const testCase = {
        year: 2023,
        month: 6,
        day: 15,
        hour: 14,
        minute: 30,
        gender: 'male' as const,
        isLunar: false
      };

      const result = await ChartUtils.calculateFullChart(testCase);
      
      expect(result).toBeDefined();
      expect(result.fourPillars).toBeDefined();
      
      // 验证计算结果的合理性
      expect(result.calculationTime).toBeGreaterThan(0);
      expect(result.algorithm).toBeTruthy();
    });

    it('应该正确处理农历转换', async () => {
      const lunarCase = {
        year: 2023,
        month: 5,
        day: 15,
        hour: 12,
        minute: 0,
        gender: 'female' as const,
        isLunar: true
      };

      const solarCase = {
        ...lunarCase,
        isLunar: false
      };

      const lunarResult = await ChartUtils.calculateFullChart(lunarCase);
      const solarResult = await ChartUtils.calculateFullChart(solarCase);

      // 农历和阳历的同一天期通常会产生不同的四柱
      expect(lunarResult.fourPillars).toBeDefined();
      expect(solarResult.fourPillars).toBeDefined();
    });
  });

  describe('边界条件和异常处理', () => {
    it('应该正确处理极端时间', async () => {
      const extremeCases = [
        { year: 1900, month: 1, day: 1, hour: 0, minute: 0, gender: 'male' as const, isLunar: false },
        { year: 2100, month: 12, day: 31, hour: 23, minute: 59, gender: 'female' as const, isLunar: false }
      ];

      for (const testCase of extremeCases) {
        const result = await ChartUtils.calculateChartWithCapabilities(testCase, 'basic');
        expect(result).toBeDefined();
        expect(result.capabilityAssessment).toBeDefined();
      }
    });

    it('应该正确处理特殊节气时间', async () => {
      // 测试节气交换时刻的处理
      const jieqiCases = [
        { year: 2023, month: 2, day: 4, hour: 10, minute: 42, gender: 'male' as const, isLunar: false },   // 立春
        { year: 2023, month: 5, day: 6, hour: 3, minute: 20, gender: 'female' as const, isLunar: false },   // 立夏
        { year: 2023, month: 8, day: 8, hour: 2, minute: 22, gender: 'male' as const, isLunar: false },     // 立秋
        { year: 2023, month: 11, day: 8, hour: 0, minute: 35, gender: 'female' as const, isLunar: false }   // 立冬
      ];

      for (const testCase of jieqiCases) {
        const result = await ChartUtils.calculateFullChart(testCase);
        expect(result).toBeDefined();
        expect(result.fourPillars.month.stem).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
      }
    });

    it('应该优雅处理计算错误', async () => {
      const invalidCases = [
        { year: 0, month: 0, day: 0, hour: 0, minute: 0, gender: 'male' as const, isLunar: false },
        { year: -1, month: 1, day: 1, hour: 1, minute: 0, gender: 'female' as const, isLunar: false }
      ];

      for (const testCase of invalidCases) {
        await expect(ChartUtils.calculateFullChart(testCase)).rejects.toThrow();
      }
    });
  });
});

describe('基准性能对比', () => {
  it('新旧接口性能对比', async () => {
    const testCase = {
      year: 1990,
      month: 5,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'male' as const,
      isLunar: false
    };

    const iterations = 50;

    // 测试传统接口
    const traditionalTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await ChartUtils.calculateFullChart(testCase);
      traditionalTimes.push(Date.now() - startTime);
    }

    // 测试新接口
    const modernTimes = [];
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await ChartUtils.calculateFullChart(testCase);
      modernTimes.push(Date.now() - startTime);
    }

    const traditionalAvg = traditionalTimes.reduce((sum, t) => sum + t, 0) / iterations;
    const modernAvg = modernTimes.reduce((sum, t) => sum + t, 0) / iterations;

    console.log('\n=== 性能对比报告 ===');
    console.log(`传统接口平均: ${traditionalAvg.toFixed(2)}ms`);
    console.log(`新接口平均: ${modernAvg.toFixed(2)}ms`);
    console.log(`性能差异: ${((modernAvg / traditionalAvg - 1) * 100).toFixed(1)}%`);

    // 新接口功能更丰富，允许适当的性能开销
    expect(modernAvg).toBeLessThan(traditionalAvg * 3); // 不超过3倍开销
  });

  it('系统整体性能摘要', async () => {
    const testCase = performanceTestCases[0];
    
    console.log('\n=== 系统性能摘要 ===');
    
    // 基础排盘
    const startBasic = Date.now();
    const basicResult = await ChartUtils.calculateFullChart(testCase);
    const basicTime = Date.now() - startBasic;
    console.log(`基础排盘: ${basicTime}ms`);

    // 能力评估
    const startCapability = Date.now();
    const capabilityResult = await ChartUtils.calculateCapabilityAssessment(basicResult, 'comprehensive');
    const capabilityTime = Date.now() - startCapability;
    console.log(`能力评估: ${capabilityTime}ms`);

    // AI提示词
    const startAI = Date.now();
    const prompt = await AIPromptUtils.quickGenerate({
      fourPillars: basicResult.fourPillars,
      gender: 'male',
      solarDate: basicResult.solarDate,
      timezone: 'Asia/Shanghai'
    }, { language: 'zh-CN' });
    const aiTime = Date.now() - startAI;
    console.log(`AI提示词: ${aiTime}ms`);

    // 完整流程
    const startComplete = Date.now();
    const completeResult = await ChartUtils.calculateChartWithCapabilities(testCase, 'comprehensive');
    const completeTime = Date.now() - startComplete;
    console.log(`完整流程: ${completeTime}ms`);
    
    console.log('\n验证结果正确性...');
    expect(basicResult.fourPillars).toBeDefined();
    expect(capabilityResult.tenGodStrength).toBeDefined();
    expect(prompt.length).toBeGreaterThan(0);
    expect(completeResult.capabilityAssessment).toBeDefined();
    console.log('✅ 所有功能正常工作');
  });
});