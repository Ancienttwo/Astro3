/**
 * Hook格式紫微斗数API
 * Hook Format ZiWei API
 * 
 * @ai-context HOOK_ZIWEI_API
 * @preload AlgorithmRegistry, ZiWeiCalculatorSingleton
 * @algorithm-dependency ziwei-core
 */

import type { ZiWeiHookChart, HookCalculationInput } from '../types/hook-format-types';

import { BRANCH_NAMES } from '../types/hook-format-types';

// No direct type usage from complete-chart-types here; keep facade isolated

import { convertZiWeiChartToHook, convertHookInputToStandard } from '../converters/hook-format-converter';
import { ZiweiCalculatorSingleton } from '../system/ZiweiCalculatorSingleton';
// Deprecated legacy master-calculator removed from imports. Use modular calculators when needed.

/**
 * 使用Hook格式生成完整紫微斗数命盘
 * 
 * @param input Hook格式输入参数
 * @returns Hook格式紫微命盘数据
 */
export async function generateZiWeiHookChart(input: HookCalculationInput): Promise<ZiWeiHookChart> {
  try {
    // 转换输入格式
    const standardInput = convertHookInputToStandard(input);
    
    // 使用算法注册中心计算 (符合Vibe Coding原则)
    const calculator = ZiweiCalculatorSingleton.getInstance();
    const completeChart = await calculator.calculateComplete(standardInput);
    
    // 转换为Hook格式
    const hookChart = convertZiWeiChartToHook(completeChart);
    
    // 确保数据完整性
    return validateAndEnhanceHookChart(hookChart, input);
    
  } catch (error) {
    throw new Error(`Hook格式紫微命盘计算失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 验证和增强Hook格式命盘数据
 */
function validateAndEnhanceHookChart(
  chart: ZiWeiHookChart, 
  input: HookCalculationInput
): ZiWeiHookChart {
  // 计算小限（按年支三合库对宫起点；男顺、女逆）用于占位数据
  const computeMinorPeriodAges = (branchIndex: number): number[] => {
    // 起点地支：根据出生年支的三合库对宫
    const branches = BRANCH_NAMES as readonly string[]
    const yearBranch = chart.birthInfo.yearBranch
    const ybIndex = branches.indexOf(yearBranch as any)
    const startPositions: Record<number, number> = {
      0: 10, 1: 7, 2: 4, 3: 1, 4: 10, 5: 7, 6: 4, 7: 1, 8: 10, 9: 7, 10: 4, 11: 1
    }
    const startIndex = startPositions[ybIndex] ?? 4
    const isMale = input.gender === 'male'
    const ages: number[] = []
    for (let age = 1; age <= 120; age++) {
      const idx = isMale
        ? (startIndex + age - 1) % 12
        : (startIndex - age + 1 + 12) % 12
      if (idx === branchIndex) ages.push(age)
    }
    return ages
  }
  // 确保所有十二宫都存在
  BRANCH_NAMES.forEach((branchName, index) => {
    if (!chart[branchName]) {
      chart[branchName] = {
        branch: branchName,
        branchIndex: index,
        stem: "",
        palaceName: "",
        "mainStars&sihuaStars": [],
        "auxiliaryStars&sihuaStars": [],
        minorStars: [],
        fleetingYears: generateFleetingYears(5 + index),
        majorPeriod: {
          period: 0,
          startAge: 0,
          endAge: 0,
          startYear: 0,
          endYear: 0
        },
        // 使用正确小限规则填充占位数据
        minorPeriod: computeMinorPeriodAges(index)
      };
    }
  });
  
  // 确保基础信息完整
  if (!chart.birthInfo.yearGanzhi && chart.birthInfo.yearStem && chart.birthInfo.yearBranch) {
    chart.birthInfo.yearGanzhi = chart.birthInfo.yearStem + chart.birthInfo.yearBranch;
  }
  
  // 添加版本信息
  chart.generatedAt = new Date().toISOString();
  chart.version = "1.0.0-hook";
  
  return chart;
}

/**
 * 生成流年年龄数组
 */
function generateFleetingYears(startAge: number = 5): number[] {
  const years: number[] = [];
  for (let age = startAge; age <= 113; age += 12) {
    years.push(age);
  }
  return years;
}

/**
 * 批量生成Hook格式命盘 (用于测试和批处理)
 */
export async function generateBatchZiWeiHookCharts(
  inputs: HookCalculationInput[]
): Promise<ZiWeiHookChart[]> {
  const results: ZiWeiHookChart[] = [];
  
  for (const input of inputs) {
    try {
      const chart = await generateZiWeiHookChart(input);
      results.push(chart);
    } catch (error) {
      console.error(`批量计算失败 - 输入: ${JSON.stringify(input)}, 错误: ${error}`);
      // 继续处理下一个，不中断整个批处理
    }
  }
  
  return results;
}

/**
 * 验证Hook输入格式
 */
export function validateHookInput(input: HookCalculationInput): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 基础字段验证
  if (!input.year || input.year < 1900 || input.year > 2100) {
    errors.push("年份必须在1900-2100之间");
  }
  
  if (!input.month || input.month < 1 || input.month > 12) {
    errors.push("月份必须在1-12之间");
  }
  
  if (!input.day || input.day < 1 || input.day > 31) {
    errors.push("日期必须在1-31之间");
  }
  
  if (input.hour < 0 || input.hour > 23) {
    errors.push("小时必须在0-23之间");
  }
  
  if (!input.gender || !["male", "female"].includes(input.gender)) {
    errors.push("性别必须是 'male' 或 'female'");
  }
  
  // 农历相关验证
  if (input.isLunar && input.isLeapMonth && !validateLeapMonth(input)) {
    errors.push("指定的闰月在该年不存在");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证闰月
 */
function validateLeapMonth(_input: HookCalculationInput): boolean {
  // 这里需要使用tyme4ts库来验证闰月
  // 简单实现，实际应该调用农历库
  return true;
}

/**
 * 获取支持的Hook API版本
 */
export function getHookApiVersion(): {
  version: string;
  supportedFormats: string[];
  features: string[];
} {
  return {
    version: "1.0.0",
    supportedFormats: [
      "complete-chart",
      "simplified-chart", 
      "palace-only",
      "stars-only"
    ],
    features: [
      "birth-year-sihua",
      "self-sihua",
      "major-periods",
      "fleeting-years",
      "palace-analysis"
    ]
  };
}
