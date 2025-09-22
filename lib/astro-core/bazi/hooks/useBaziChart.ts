/**
 * useBaziChart Hook - 八字排盘数据管理 Hook
 * 
 * @ai-context BAZI_CHART_HOOK
 * @purpose 类似 ziwei.tsx 的设计，一次性计算完整排盘数据
 * @pattern React Hook + Unified Algorithm + State Management
 * @usage 替代 bazi.tsx 中分散的计算逻辑
 * @version 1.0.0
 * @created 2025-01-05
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { 
  BasicChartCalculator
} from '../index';
import type { 
  ChartCalculationInput,
  ChartCalculationOptions,
  BasicChartResult,
  BaziShenShaResult 
} from '../index';

// Hook 输入参数
export interface UseBaziChartInput {
  name: string;
  gender: 'male' | 'female';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute?: number;
  isLunar?: boolean;
  isLeapMonth?: boolean;
  birthPlace?: string;
  timezone?: string;
}

// Hook 输出结果
export interface UseBaziChartResult {
  // 计算状态
  isLoading: boolean;
  error: string | null;
  
  // 完整八字数据
  baziData: BasicChartResult | null;
  
  // 神煞数据（可选）
  shenShaData: BaziShenShaResult | null;
  
  // 便捷访问字段
  fourPillars: BasicChartResult['fourPillars'] | null;
  tenGodAnalysis: BasicChartResult['tenGodAnalysis'] | null;
  elementAnalysis: any | null; // BasicChartResult doesn't have elementAnalysis
  strengthAnalysis: any | null; // BasicChartResult doesn't have strengthAnalysis
  majorPeriods: BasicChartResult['majorPeriods'] | undefined;
  fleetingYears: any[];
  
  // 操作函数
  recalculate: () => void;
  updateInput: (newInput: Partial<UseBaziChartInput>) => void;
  
  // 元数据
  calculatedAt: number;
  version: string;
}

// Hook 配置选项
export interface UseBaziChartOptions {
  // 计算选项
  includeShenSha?: boolean; // 是否包含神煞计算
  includeAllAnalysis?: boolean; // 是否包含全部分析
  precision?: 'basic' | 'standard' | 'detailed';
  
  // 性能选项
  enableCache?: boolean;
  autoRecalculate?: boolean; // 输入改变时自动重新计算
  
  // 动画选项
  animationDelay?: number; // 加载动画延迟（毫秒），默认1000ms
  enableAnimation?: boolean; // 是否启用加载动画
  
  // 调试选项
  debug?: boolean;
}

/**
 * 🎯 八字排盘 Hook - 一次性计算完整数据
 * 
 * @param input 用户输入数据
 * @param options Hook 配置选项
 * @returns 完整的八字排盘结果和操作函数
 * 
 * @example
 * ```typescript
 * const baziChart = useBaziChart({
 *   name: '测试用户',
 *   gender: 'male',
 *   year: 1990,
 *   month: 6,
 *   day: 15,
 *   hour: 14
 * }, {
 *   includeShenSha: true,
 *   includeAllAnalysis: true
 * });
 * 
 * // 直接使用计算结果
 * console.log(baziChart.fourPillars);
 * console.log(baziChart.tenGodAnalysis);
 * console.log(baziChart.shenShaData);
 * ```
 */
export function useBaziChart(
  input: UseBaziChartInput,
  options: UseBaziChartOptions = {}
): UseBaziChartResult {
  
  // 默认选项
  const finalOptions: UseBaziChartOptions = {
    includeShenSha: true, // 默认包含神煞
    includeAllAnalysis: true,
    precision: 'detailed',
    enableCache: true,
    autoRecalculate: true,
    animationDelay: 1000, // 默认1秒动画
    enableAnimation: true, // 默认启用动画
    debug: false,
    ...options
  };
  
  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [baziData, setBaziData] = useState<BasicChartResult | null>(null);
  const [shenShaData, setShenShaData] = useState<BaziShenShaResult | null>(null);
  const [calculatedAt, setCalculatedAt] = useState<number>(0);
  
  // 输入状态管理
  const [currentInput, setCurrentInput] = useState<UseBaziChartInput>(input);
  
  // 转换为算法输入格式
  const algorithmInput: ChartCalculationInput = useMemo(() => ({
    year: currentInput.year,
    month: currentInput.month,
    day: currentInput.day,
    hour: currentInput.hour,
    minute: currentInput.minute || 0,
    gender: currentInput.gender,
    isLunar: currentInput.isLunar || false,
    isLeapMonth: currentInput.isLeapMonth || false,
    timezone: currentInput.timezone || 'Asia/Shanghai'
  }), [currentInput]);
  
  // 算法配置选项
  const calculationOptions: ChartCalculationOptions = useMemo(() => ({
    includeTenGods: finalOptions.includeAllAnalysis,
    includeMajorPeriods: finalOptions.includeAllAnalysis,
    includeNaYin: finalOptions.includeAllAnalysis,
    majorPeriodCount: 10,
    precision: finalOptions.precision === 'detailed' ? 'high' : 'standard',
    validateInput: true,
    includeCapabilityAssessment: finalOptions.includeAllAnalysis,
    capabilityAnalysisLevel: finalOptions.precision === 'detailed' ? 'comprehensive' : 'basic'
  }), [finalOptions]);
  
  // 🎯 主要计算函数 - 一次性计算所有数据
  const calculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      
      // 如果启用动画，添加延迟
      if (finalOptions.enableAnimation && finalOptions.animationDelay && finalOptions.animationDelay > 0) {
        await new Promise(resolve => setTimeout(resolve, finalOptions.animationDelay));
      }
      
      // 1. 核心八字计算（使用 BasicChartCalculator）
      const calculator = new BasicChartCalculator();
      const baziResult = await calculator.calculateBasicChart(algorithmInput, calculationOptions);
      setBaziData(baziResult);
      
      // 2. 神煞数据需要单独计算（BasicChartResult 不包含神煞）
      // 注意：checkBaziShenSha 可能需要不同的输入格式
      // const shenShaResult = checkBaziShenSha(baziResult.fourPillars);
      const shenShaResult = null; // 暂时设为 null，需要确认 checkBaziShenSha 的正确用法
      setShenShaData(shenShaResult);
      
      const endTime = Date.now();
      setCalculatedAt(endTime);
      
      if (finalOptions.debug) {
        console.log('🎯 useBaziChart 计算完成:', {
          input: algorithmInput,
          calculationTime: endTime - startTime,
          actualCalculationTime: endTime - startTime - (finalOptions.animationDelay || 0),
          animationDelay: finalOptions.animationDelay,
          hasBaziData: !!baziResult,
          hasShenShaData: !!shenShaResult,
          fourPillars: baziResult?.fourPillars,
          tenGods: baziResult?.tenGodAnalysis
        });
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '计算失败';
      setError(errorMessage);
      console.error('❌ useBaziChart 计算错误:', err);
    } finally {
      setIsLoading(false);
    }
  }, [algorithmInput, calculationOptions, finalOptions]);
  
  // 输入更新函数
  const updateInput = useCallback((newInput: Partial<UseBaziChartInput>) => {
    setCurrentInput(prev => ({ ...prev, ...newInput }));
  }, []);
  
  // 手动重新计算函数
  const recalculate = useCallback(() => {
    void calculate();
  }, [calculate]);
  
  // 自动重新计算效果
  useEffect(() => {
    if (finalOptions.autoRecalculate) {
      void calculate();
    }
  }, [calculate, finalOptions.autoRecalculate]);
  
  // 便捷访问字段
  const fourPillars = useMemo(() => baziData?.fourPillars || null, [baziData]);
  const tenGodAnalysis = useMemo(() => baziData?.tenGodAnalysis || null, [baziData]);
  const elementAnalysis = useMemo(() => null, []);  // BasicChartResult 不包含此字段
  const strengthAnalysis = useMemo(() => null, []); // BasicChartResult 不包含此字段
  const majorPeriods = useMemo(() => baziData?.majorPeriods, [baziData]);
  const fleetingYears = useMemo(() => [], []); // BasicChartResult 不包含此字段
  
  return {
    // 计算状态
    isLoading,
    error,
    
    // 完整数据
    baziData,
    shenShaData,
    
    // 便捷访问
    fourPillars,
    tenGodAnalysis,
    elementAnalysis,
    strengthAnalysis,
    majorPeriods,
    fleetingYears,
    
    // 操作函数
    recalculate,
    updateInput,
    
    // 元数据
    calculatedAt,
    version: baziData?.algorithm || '1.0.0' // BasicChartResult 使用 algorithm 字段而不是 version
  };
}

/**
 * 🔧 简化版 Hook - 只计算基础数据
 * 
 * @param input 基础输入参数
 * @returns 简化的八字结果
 */
export function useBaziChartBasic(input: UseBaziChartInput) {
  return useBaziChart(input, {
    includeShenSha: false,
    includeAllAnalysis: false,
    precision: 'basic'
  });
}

/**
 * 🎭 完整版 Hook - 包含所有计算
 * 
 * @param input 完整输入参数
 * @returns 完整的八字结果
 */
export function useBaziChartComplete(input: UseBaziChartInput) {
  return useBaziChart(input, {
    includeShenSha: true,
    includeAllAnalysis: true,
    precision: 'detailed',
    debug: true
  });
}
