/**
 * 紫微斗数计算器单例
 * ZiWei Calculator Singleton
 *
 * @ai-context ZIWEI_CALCULATOR_SINGLETON
 * @preload AlgorithmRegistry
 * @algorithm-dependency ziwei-core
 */
import type { ZiWeiCompleteChart, ZiWeiChartInput } from '../complete-chart-types';
export interface CacheStats {
    hits: number;
    misses: number;
    totalCalculations: number;
}
/**
 * 紫微斗数计算器单例类
 * 符合Vibe Coding原则的算法统一访问
 */
export declare class ZiweiCalculatorSingleton {
    private static instance;
    private cacheStats;
    private calculationCache;
    private constructor();
    /**
     * 获取计算器单例实例
     * REQUIRED: 使用单例模式 - 符合算法注册中心原则
     */
    static getInstance(): ZiweiCalculatorSingleton;
    /**
     * 计算完整紫微命盘
     */
    calculateComplete(input: ZiWeiChartInput): Promise<ZiWeiCompleteChart>;
    /**
     * 获取缓存统计
     */
    getCacheStats(): CacheStats;
    /**
     * 清除缓存
     */
    clearCache(): void;
    /**
     * 生成缓存键
     */
    private generateCacheKey;
    /**
     * 执行实际计算 (临时模拟实现)
     */
    private performCalculation;
}
/**
 * 获取计算器实例的便捷函数
 */
export declare function getZiweiCalculator(): ZiweiCalculatorSingleton;
//# sourceMappingURL=ZiweiCalculatorSingleton.d.ts.map