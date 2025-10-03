/**
 * Hook格式使用示例
 * Hook Format Usage Examples
 * 
 * @ai-context HOOK_FORMAT_EXAMPLES
 * @preload ZiWeiHookChart, HookCalculationInput, AlgorithmRegistry
 * @algorithm-dependency ziwei-hook
 */

import {
  generateZiWeiHookChart,
  validateHookInput,
  markStarWithSihua,
  getBirthYearSihua,
  type ZiWeiHookChart,
  type HookCalculationInput,
  type HookPalaceInfo
} from '../index';

/**
 * 示例1: 基本Hook格式命盘生成
 */
export async function basicHookChartExample() {
  // Hook标准输入格式
  const input: HookCalculationInput = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 14, // 下午2点
    gender: "male",
    isLunar: false // 公历输入
  };

  // 验证输入
  const validation = validateHookInput(input);
  if (!validation.isValid) {
    console.error('输入验证失败:', validation.errors);
    return;
  }

  try {
    // 生成Hook格式命盘
    const hookChart = await generateZiWeiHookChart(input);
    
    console.log('=== Hook格式紫微命盘 ===');
    console.log('出生信息:', hookChart.birthInfo);
    console.log('八字信息:', hookChart.八字);
    console.log('命宫位置:', hookChart.命宫);
    console.log('身宫位置:', hookChart.身宫);
    console.log('五行局:', hookChart.五行局);
    
    // 展示所有宫位数据
    displayAllPalaces(hookChart);
    
    return hookChart;
  } catch (error) {
    console.error('生成Hook命盘失败:', error);
  }
}

/**
 * 示例2: 农历输入处理
 */
export async function lunarInputExample() {
  const lunarInput: HookCalculationInput = {
    year: 1990,
    month: 12, // 农历十二月
    day: 6,    // 农历初六
    hour: 14,
    gender: "female",
    isLunar: true,
    isLeapMonth: false
  };

  const hookChart = await generateZiWeiHookChart(lunarInput);
  
  console.log('=== 农历输入示例 ===');
  console.log('农历信息:', {
    年干支: hookChart.birthInfo.yearGanzhi,
    农历月: hookChart.birthInfo.monthLunar,
    农历日: hookChart.birthInfo.dayLunar,
    时辰: hookChart.birthInfo.hourBranch
  });
  
  return hookChart;
}

/**
 * 示例3: 宫位数据详细解析
 */
export function palaceDataExample(hookChart: ZiWeiHookChart) {
  console.log('=== 宫位数据解析示例 ===');
  
  // 分析命宫
  const lifePalaceBranch = hookChart.命宫;
  const lifePalace = hookChart[lifePalaceBranch as keyof ZiWeiHookChart] as HookPalaceInfo;
  
  console.log(`命宫 (${lifePalaceBranch}宫):`);
  console.log('  宫位名称:', lifePalace.palaceName);
  console.log('  天干:', lifePalace.stem);
  console.log('  主星:', lifePalace["mainStars&sihuaStars"].map(s => `${s.name}(${s.brightness})`));
  console.log('  辅星:', lifePalace["auxiliaryStars&sihuaStars"].map(s => `${s.name}(${s.brightness})`));
  console.log('  流年:', lifePalace.fleetingYears);
  console.log('  大运:', lifePalace.majorPeriod);
  
  // 分析四化标记
  analyzeSihuaMarkers(lifePalace);
}

/**
 * 示例4: 四化系统分析
 */
export function sihuaAnalysisExample(hookChart: ZiWeiHookChart) {
  console.log('=== 四化系统分析示例 ===');
  
  // 获取生年四化
  const birthSihua = getBirthYearSihua(hookChart.birthInfo.yearStem);
  console.log('生年四化:', birthSihua);
  
  // 寻找四化星在各宫的分布
  const sihuaDistribution = findSihuaDistribution(hookChart);
  console.log('四化星分布:', sihuaDistribution);
  
  // 分析四化效应
  analyzeSihuaEffects(hookChart, sihuaDistribution);
}

/**
 * 示例5: 大运流年分析
 */
export function majorPeriodsExample(hookChart: ZiWeiHookChart) {
  console.log('=== 大运流年分析示例 ===');
  
  const majorPeriods: Array<{
    period: number;
    palace: string;
    branch: string;
    ages: string;
    years: string;
  }> = [];
  
  // 收集所有大运信息
  Object.entries(hookChart).forEach(([branchName, palace]) => {
    if (typeof palace === 'object' && palace.branch) {
      const palaceData = palace as HookPalaceInfo;
      if (palaceData.majorPeriod.period > 0) {
        majorPeriods.push({
          period: palaceData.majorPeriod.period,
          palace: palaceData.palaceName,
          branch: branchName,
          ages: `${palaceData.majorPeriod.startAge}-${palaceData.majorPeriod.endAge}岁`,
          years: `${palaceData.majorPeriod.startYear}-${palaceData.majorPeriod.endYear}年`
        });
      }
    }
  });
  
  // 按大运序号排序
  majorPeriods.sort((a, b) => a.period - b.period);
  
  console.log('大运序列:');
  majorPeriods.forEach(period => {
    console.log(`第${period.period}大运: ${period.palace} (${period.branch}) ${period.ages} ${period.years}`);
  });
}

/**
 * 示例6: 数据格式验证
 */
export function dataValidationExample(hookChart: ZiWeiHookChart) {
  console.log('=== 数据格式验证示例 ===');
  
  // 验证基本结构
  const requiredFields = ['birthInfo', '八字', '命宫', '身宫', '五行局'];
  const missingFields = requiredFields.filter(field => !hookChart[field as keyof ZiWeiHookChart]);
  
  if (missingFields.length > 0) {
    console.error('缺少必需字段:', missingFields);
  } else {
    console.log('✅ 基本结构验证通过');
  }
  
  // 验证十二宫完整性
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const missingPalaces = branches.filter(branch => 
    !hookChart[branch as keyof ZiWeiHookChart]
  );
  
  if (missingPalaces.length > 0) {
    console.error('缺少宫位数据:', missingPalaces);
  } else {
    console.log('✅ 十二宫数据完整');
  }
  
  // 验证流年计算
  validateFleetingYears(hookChart);
}

/**
 * 辅助函数: 显示所有宫位
 */
function displayAllPalaces(hookChart: ZiWeiHookChart) {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  console.log('\n=== 十二宫位详情 ===');
  branches.forEach(branch => {
    const palace = hookChart[branch as keyof ZiWeiHookChart] as HookPalaceInfo;
    if (palace && palace.palaceName) {
      console.log(`${branch}宫 (${palace.palaceName}):`);
      console.log(`  天干: ${palace.stem}`);
      console.log(`  主星: ${palace["mainStars&sihuaStars"].map(s => s.name).join(', ') || '无'}`);
      console.log(`  大运: 第${palace.majorPeriod.period}运 (${palace.majorPeriod.startAge}-${palace.majorPeriod.endAge}岁)`);
    }
  });
}

/**
 * 辅助函数: 分析四化标记
 */
function analyzeSihuaMarkers(palace: HookPalaceInfo) {
  console.log('\n四化标记分析:');
  
  const allStars = [
    ...palace["mainStars&sihuaStars"],
    ...palace["auxiliaryStars&sihuaStars"]
  ];
  
  allStars.forEach(star => {
    if (star.type && star.type.length > 1) {
      const sihuaMarks = star.type.filter(t => t.length === 2 && (t.startsWith('i') || t.startsWith('x')));
      if (sihuaMarks.length > 0) {
        console.log(`  ${star.name}: ${sihuaMarks.join(', ')}`);
      }
    }
  });
}

/**
 * 辅助函数: 查找四化星分布
 */
function findSihuaDistribution(hookChart: ZiWeiHookChart) {
  const distribution: { [key: string]: string[] } = {
    禄: [], 权: [], 科: [], 忌: []
  };
  
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  
  branches.forEach(branch => {
    const palace = hookChart[branch as keyof ZiWeiHookChart] as HookPalaceInfo;
    if (palace) {
      const allStars = [
        ...palace["mainStars&sihuaStars"],
        ...palace["auxiliaryStars&sihuaStars"]
      ];
      
      allStars.forEach(star => {
        if (star.type) {
          if (star.type.includes('iA')) distribution.禄.push(`${star.name}(${branch})`);
          if (star.type.includes('iB')) distribution.权.push(`${star.name}(${branch})`);
          if (star.type.includes('iC')) distribution.科.push(`${star.name}(${branch})`);
          if (star.type.includes('iD')) distribution.忌.push(`${star.name}(${branch})`);
        }
      });
    }
  });
  
  return distribution;
}

/**
 * 辅助函数: 分析四化效应
 */
function analyzeSihuaEffects(hookChart: ZiWeiHookChart, distribution: { [key: string]: string[] }) {
  console.log('\n四化效应分析:');
  
  Object.entries(distribution).forEach(([type, stars]) => {
    if (stars.length > 0) {
      console.log(`${type}星: ${stars.join(', ')}`);
    }
  });
  
  // 简单的四化分析逻辑
  if (distribution.禄.length > 0 && distribution.权.length > 0) {
    console.log('✨ 禄权并见，主财官双美');
  }
  
  if (distribution.忌.length > 0) {
    console.log('⚠️ 忌星入宫，需注意相关宫位的阻碍');
  }
}

/**
 * 辅助函数: 验证流年计算
 */
function validateFleetingYears(hookChart: ZiWeiHookChart) {
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  let validationPassed = true;
  
  branches.forEach((branch, index) => {
    const palace = hookChart[branch as keyof ZiWeiHookChart] as HookPalaceInfo;
    if (palace) {
      const expectedStart = 5 + index;
      if (palace.fleetingYears[0] !== expectedStart) {
        console.error(`${branch}宫流年起始年龄错误: 期望${expectedStart}, 实际${palace.fleetingYears[0]}`);
        validationPassed = false;
      }
    }
  });
  
  if (validationPassed) {
    console.log('✅ 流年计算验证通过');
  }
}

/**
 * 主示例运行函数
 */
export async function runAllExamples() {
  console.log('🔮 紫微斗数Hook格式使用示例\n');
  
  try {
    // 基本示例
    const hookChart = await basicHookChartExample();
    if (!hookChart) return;
    
    // 农历示例
    await lunarInputExample();
    
    // 宫位分析
    palaceDataExample(hookChart);
    
    // 四化分析
    sihuaAnalysisExample(hookChart);
    
    // 大运分析
    majorPeriodsExample(hookChart);
    
    // 数据验证
    dataValidationExample(hookChart);
    
    console.log('\n✅ 所有示例运行完成');
    
  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  void runAllExamples();
}
