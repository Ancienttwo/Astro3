/**
 * Hook格式转换器
 * Hook Format Converter
 *
 * @ai-context HOOK_FORMAT_CONVERTER
 * @preload ZiWeiCompleteChart, HookBirthInfo, AlgorithmRegistry
 * @algorithm-dependency ziwei-registry
 */
import type { ZiWeiHookChart, HookBirthInfo } from '../types/hook-format-types';
import type { ZiWeiCompleteChart, BirthInfo } from '../complete-chart-types';
/**
 * 转换出生信息为Hook格式
 */
export declare function convertBirthInfoToHook(birthInfo: BirthInfo): HookBirthInfo;
/**
 * 转换完整紫微命盘为Hook格式
 */
export declare function convertZiWeiChartToHook(chart: ZiWeiCompleteChart): ZiWeiHookChart;
/**
 * Hook格式输入转换为标准输入
 */
export declare function convertHookInputToStandard(hookInput: {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: "male" | "female";
    isLunar?: boolean;
    isLeapMonth?: boolean;
}): {
    year: number;
    month: number;
    day: number;
    hour: number;
    gender: "male" | "female";
    isLunar: boolean;
    isLeapMonth: boolean;
    timezone: string;
};
//# sourceMappingURL=hook-format-converter.d.ts.map