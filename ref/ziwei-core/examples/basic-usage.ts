/**
 * Basic Usage Example for @astroall/ziwei-core
 * 基本使用示例
 */

import {
  calculateZiWeiChart,
  getAlgorithmRegistry,
  type BirthInfo,
  type CompleteChart,
  type CalculationOptions,
} from '../src/index-new';

/**
 * Example 1: Calculate a chart with birth information
 * 示例1：使用出生信息计算命盘
 */
async function example1_calculateChart() {
  const birthInfo: BirthInfo = {
    year: 1990,
    month: 6,
    day: 15,
    hour: 14,
    minute: 30,
    timezone: 'Asia/Shanghai',
    location: {
      latitude: 31.2304,
      longitude: 121.4737,
      name: 'Shanghai',
    },
  };

  const options: CalculationOptions = {
    includeMinorStars: true,
    calculateTransformations: true,
    calculateSelfTransformations: true,
    useCache: true,
  };

  try {
    const chart = await calculateZiWeiChart(birthInfo, options);
    console.log('Chart calculated successfully:', chart);
    
    // Access specific palace data
    const lifePalace = chart.palaces.get('命宫');
    console.log('Life Palace:', lifePalace);
    
    // Access sihua transformations
    console.log('Global Sihua:', chart.globalSihua);
    
  } catch (error) {
    console.error('Error calculating chart:', error);
  }
}

/**
 * Example 2: Use AlgorithmRegistry directly
 * 示例2：直接使用算法注册中心
 */
async function example2_useRegistry() {
  try {
    const registry = getAlgorithmRegistry();
    const facade = registry.getZiWeiFacade();
    
    // Use facade directly for more control
    const chart = await facade.calculateCompleteChart({
      year: 1995,
      month: 3,
      day: 10,
      hour: 8,
    });
    
    console.log('Chart from facade:', chart);
    
  } catch (error) {
    console.error('Error using registry:', error);
  }
}

/**
 * Example 3: Batch calculation
 * 示例3：批量计算
 */
async function example3_batchCalculation() {
  const birthInfos: BirthInfo[] = [
    { year: 1990, month: 1, day: 1, hour: 0 },
    { year: 1991, month: 2, day: 2, hour: 2 },
    { year: 1992, month: 3, day: 3, hour: 4 },
  ];

  try {
    const registry = getAlgorithmRegistry();
    const facade = registry.getZiWeiFacade();
    
    const charts = await facade.batchCalculate(birthInfos);
    console.log(`Calculated ${charts.length} charts`);
    
    charts.forEach((chart, index) => {
      console.log(`Chart ${index + 1}:`, chart.metadata);
    });
    
  } catch (error) {
    console.error('Error in batch calculation:', error);
  }
}

/**
 * Example 4: Cache management
 * 示例4：缓存管理
 */
async function example4_cacheManagement() {
  try {
    const registry = getAlgorithmRegistry();
    const facade = registry.getZiWeiFacade();
    
    // Calculate and cache
    const birthInfo = { year: 2000, month: 5, day: 15, hour: 12 };
    const chart1 = await facade.calculateCompleteChart(birthInfo);
    console.log('First calculation time:', chart1.metadata.calculationTime, 'ms');
    
    // Second calculation should be from cache
    const chart2 = await facade.calculateCompleteChart(birthInfo);
    console.log('Cached calculation time:', chart2.metadata.calculationTime, 'ms');
    
    // Clear cache
    facade.clearCache();
    console.log('Cache cleared');
    
  } catch (error) {
    console.error('Error in cache management:', error);
  }
}

/**
 * Example 5: Error handling
 * 示例5：错误处理
 */
async function example5_errorHandling() {
  try {
    // Invalid date
    await calculateZiWeiChart({
      year: 2024,
      month: 13, // Invalid month
      day: 32,   // Invalid day
      hour: 25,  // Invalid hour
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Validation error:', error.message);
    }
  }
}

// Run examples
if (require.main === module) {
  console.log('Running ZiWei Core Examples...\n');
  
  Promise.all([
    example1_calculateChart(),
    example2_useRegistry(),
    example3_batchCalculation(),
    example4_cacheManagement(),
    example5_errorHandling(),
  ])
    .then(() => {
      console.log('\nAll examples completed');
      return undefined;
    })
    .catch((error) => {
      console.error('Error running examples:', error);
    });
}
