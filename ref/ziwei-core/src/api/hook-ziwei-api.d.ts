/**
 * Hook格式紫微斗数API
 * Hook Format ZiWei API
 *
 * @ai-context HOOK_ZIWEI_API
 * @preload AlgorithmRegistry, ZiWeiCalculatorSingleton
 * @algorithm-dependency ziwei-core
 */
import type { ZiWeiHookChart, HookCalculationInput } from '../types/hook-format-types';
/**
 * 使用Hook格式生成完整紫微斗数命盘
 *
 * @param input Hook格式输入参数
 * @returns Hook格式紫微命盘数据
 */
export declare function generateZiWeiHookChart(input: HookCalculationInput): Promise<ZiWeiHookChart>;
/**
 * 批量生成Hook格式命盘 (用于测试和批处理)
 */
export declare function generateBatchZiWeiHookCharts(inputs: HookCalculationInput[]): Promise<ZiWeiHookChart[]>;
/**
 * 验证Hook输入格式
 */
export declare function validateHookInput(input: HookCalculationInput): {
    isValid: boolean;
    errors: string[];
};
/**
 * 获取支持的Hook API版本
 */
export declare function getHookApiVersion(): {
    version: string;
    supportedFormats: string[];
    features: string[];
};
//# sourceMappingURL=hook-ziwei-api.d.ts.map