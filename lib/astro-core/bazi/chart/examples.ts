/**
 * 基础排盘模块使用示例
 * 展示各种计算场景和用法
 */

import { 
  BasicChartCalculator,
  FourPillarsCalculator,
  TenGodCalculator,
  MajorPeriodCalculator,
  NaYinCalculator,
  ChartUtils,
  ChartCalculationInput,
  BasicChartResult
} from './index';

/**
 * 基础使用示例
 */
export async function basicUsageExample() {
  console.log('=== 基础排盘模块使用示例 ===\n');
  
  // 1. 基础输入数据
  const input: ChartCalculationInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    minute: 30,
    gender: 'male',
    isLunar: false // 公历
  };
  
  console.log('输入信息:', input);
  
  try {
    // 2. 快速排盘（仅四柱和十神）
    console.log('\n--- 快速排盘 ---');
    const quickResult = await ChartUtils.calculateQuickChart(input);
    console.log('日主:', quickResult.fourPillars.dayMaster);
    console.log('季节:', quickResult.fourPillars.season);
    console.log('最强十神:', quickResult.tenGodAnalysis.summary.strongest);
    console.log('计算耗时:', quickResult.calculationTime, 'ms');
    
    // 3. 完整排盘（包含所有模块）
    console.log('\n--- 完整排盘 ---');
    const fullResult = await ChartUtils.calculateFullChart(input);
    console.log('四柱:', {
      年: `${fullResult.fourPillars.year.stem}${fullResult.fourPillars.year.branch}`,
      月: `${fullResult.fourPillars.month.stem}${fullResult.fourPillars.month.branch}`,
      日: `${fullResult.fourPillars.day.stem}${fullResult.fourPillars.day.branch}`,
      时: `${fullResult.fourPillars.hour.stem}${fullResult.fourPillars.hour.branch}`
    });
    console.log('纳音:', fullResult.naYin?.dayMasterNaYin);
    const currentPeriod = fullResult.majorPeriods?.currentPeriod;
    console.log('当前大运:', currentPeriod ? `${currentPeriod.stem}${currentPeriod.branch}` : '未知');
    
    // 4. 排盘摘要
    console.log('\n--- 排盘摘要 ---');
    const summary = ChartUtils.getChartSummary(fullResult);
    console.log('摘要描述:', summary.description);
    
    // 5. 特殊格局检查
    console.log('\n--- 特殊格局 ---');
    const patterns = ChartUtils.checkSpecialPatterns(fullResult);
    if (patterns.hasSpecialPattern) {
      patterns.patterns.forEach((pattern: any) => {
        console.log(`${pattern.name}: ${pattern.description} (强度: ${pattern.strength})`);
      });
    } else {
      console.log('无特殊格局');
    }
    
    return fullResult;
    
  } catch (error) {
    console.error('排盘计算失败:', error);
    throw error;
  }
}

/**
 * 分模块使用示例
 */
export async function modularUsageExample() {
  console.log('\n=== 分模块使用示例 ===\n');
  
  const input: ChartCalculationInput = {
    year: 1985,
    month: 12,
    day: 25,
    hour: 8,
    gender: 'female',
    isLunar: true // 农历
  };
  
  try {
    // 1. 仅计算四柱
    console.log('--- 四柱计算 ---');
    const fourPillarsCalc = new FourPillarsCalculator();
    const fourPillars = await fourPillarsCalc.calculateFourPillars(input);
    console.log('日主:', fourPillars.dayMaster);
    console.log('月令:', fourPillars.monthOrder);
    console.log('五行统计:', fourPillars.elementCount);
    
    // 2. 基于四柱计算十神
    console.log('\n--- 十神分析 ---');
    const tenGodCalc = new TenGodCalculator();
    const tenGodAnalysis = await tenGodCalc.calculateTenGods(fourPillars);
    console.log('十神统计:', tenGodAnalysis.summary.count);
    console.log('格局:', tenGodAnalysis.patterns.map(p => p.name));
    
    // 3. 计算大运
    console.log('\n--- 大运计算 ---');
    const majorPeriodCalc = new MajorPeriodCalculator();
    const majorPeriods = await majorPeriodCalc.calculateMajorPeriods(
      fourPillars, 
      input.gender, 
      input.year, 
      6
    );
    console.log('起运方向:', majorPeriods.direction);
    console.log('起运年龄:', majorPeriods.startAge);
    console.log('当前大运:', majorPeriods.currentPeriod ? 
      `${majorPeriods.currentPeriod.stem}${majorPeriods.currentPeriod.branch}` : 
      '未起运');
    
    // 4. 计算纳音
    console.log('\n--- 纳音分析 ---');
    const naYinCalc = new NaYinCalculator();
    const naYinInfo = await naYinCalc.calculateNaYin(fourPillars);
    console.log('日主纳音:', naYinInfo.dayMasterNaYin);
    console.log('纳音五行:', naYinInfo.element);
    console.log('纳音特性:', naYinInfo.characteristics.slice(0, 3));
    
  } catch (error) {
    console.error('分模块计算失败:', error);
    throw error;
  }
}

/**
 * 批量计算示例
 */
export async function batchCalculationExample() {
  console.log('\n=== 批量计算示例 ===\n');
  
  const testCases: ChartCalculationInput[] = [
    { year: 1980, month: 1, day: 1, hour: 0, gender: 'male', isLunar: false },
    { year: 1990, month: 6, day: 15, hour: 12, gender: 'female', isLunar: false },
    { year: 2000, month: 12, day: 31, hour: 23, gender: 'male', isLunar: true },
  ];
  
  const calculator = new BasicChartCalculator();
  const results: BasicChartResult[] = [];
  
  console.log(`开始批量计算 ${testCases.length} 个命盘...`);
  const startTime = performance.now();
  
  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i];
    try {
      console.log(`\n计算第 ${i + 1} 个命盘...`);
      const result = await calculator.calculateBasicChart(input);
      results.push(result);
      
      console.log(`日主: ${result.fourPillars.dayMaster}, 计算时间: ${result.calculationTime}ms`);
    } catch (error) {
      console.error(`第 ${i + 1} 个命盘计算失败:`, error);
    }
  }
  
  const totalTime = performance.now() - startTime;
  console.log(`\n批量计算完成，总耗时: ${totalTime.toFixed(2)}ms`);
  console.log(`平均每个命盘: ${(totalTime / testCases.length).toFixed(2)}ms`);
  
  return results;
}

/**
 * 错误处理示例
 */
export async function errorHandlingExample() {
  console.log('\n=== 错误处理示例 ===\n');
  
  const invalidInputs: ChartCalculationInput[] = [
    // 无效年份
    { year: 1800, month: 1, day: 1, hour: 0, gender: 'male', isLunar: false },
    // 无效月份
    { year: 1990, month: 13, day: 1, hour: 0, gender: 'male', isLunar: false },
    // 无效日期
    { year: 1990, month: 2, day: 30, hour: 0, gender: 'male', isLunar: false },
    // 无效性别
    { year: 1990, month: 1, day: 1, hour: 0, gender: 'unknown' as any, isLunar: false },
  ];
  
  const calculator = new BasicChartCalculator();
  
  for (let i = 0; i < invalidInputs.length; i++) {
    const input = invalidInputs[i];
    try {
      console.log(`测试无效输入 ${i + 1}:`, input);
      await calculator.calculateBasicChart(input);
      console.log('❌ 应该抛出错误但没有');
    } catch (error: any) {
      console.log('✅ 正确捕获错误:', error.message);
      console.log('   错误代码:', error.code);
      console.log('   错误数据:', error.data);
    }
  }
}

/**
 * 性能测试示例
 */
export async function performanceTestExample() {
  console.log('\n=== 性能测试示例 ===\n');
  
  const testInput: ChartCalculationInput = {
    year: 1990,
    month: 5,
    day: 15,
    hour: 14,
    gender: 'male',
    isLunar: false
  };
  
  const calculator = new BasicChartCalculator();
  const iterations = 100;
  
  console.log(`性能测试：连续计算 ${iterations} 次同一命盘`);
  
  const times: number[] = [];
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    const iterStartTime = performance.now();
    await calculator.calculateBasicChart(testInput);
    const iterTime = performance.now() - iterStartTime;
    times.push(iterTime);
  }
  
  const totalTime = performance.now() - startTime;
  const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  console.log(`总耗时: ${totalTime.toFixed(2)}ms`);
  console.log(`平均耗时: ${avgTime.toFixed(2)}ms`);
  console.log(`最短耗时: ${minTime.toFixed(2)}ms`);
  console.log(`最长耗时: ${maxTime.toFixed(2)}ms`);
  console.log(`每秒可计算: ${(1000 / avgTime).toFixed(0)} 个命盘`);
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 开始运行基础排盘模块示例\n');
  
  try {
    await basicUsageExample();
    await modularUsageExample();
    await batchCalculationExample();
    await errorHandlingExample();
    await performanceTestExample();
    
    console.log('\n✅ 所有示例运行完成');
  } catch (error) {
    console.error('\n❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  void runAllExamples();
}
