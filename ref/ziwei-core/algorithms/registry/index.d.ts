/**
 * Algorithm Registry - 算法注册中心
 *
 * @ai-context ALGORITHM_REGISTRY
 * @purpose 解决算法重复问题，提供统一的算法访问接口
 * @pattern Singleton + Factory + Cache
 * @critical 禁止在组件中直接实现算法，必须通过注册中心访问
 */
import { BaziCalculator } from '../bazi/calculator';
import { BaziAnalysisResult, BaziInput } from '../bazi/types';
import { ZiweiCalculator } from '../ziwei/calculator';
import { ZiweiChart, ZiweiInput } from '../../src/index';
export type AlgorithmType = 'bazi' | 'ziwei' | 'lunar';

export type LunarInput = { date: Date | string };

export type AlgorithmInput<T extends AlgorithmType> =
    T extends 'bazi' ? BaziInput :
    T extends 'ziwei' ? ZiweiInput :
    T extends 'lunar' ? LunarInput :
    never;

export type AlgorithmResult<T extends AlgorithmType> = 
    T extends 'bazi' ? BaziAnalysisResult :
    T extends 'ziwei' ? ZiweiChart :
    T extends 'lunar' ? LunarCalendar :
    never;

export interface LunarCalendar {
    toSolar(): Date;
    toLunar(date: Date): LunarCalendar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getYearStem(): string;
    getYearBranch(): string; 
    getMonthStem(): string;
    getMonthBranch(): string;
    getDayStem(): string;
    getDayBranch(): string;
    getTimeHour(): number;
    getTimeBranch(): string;
    isLeapMonth(): boolean;
    toString(): string;
}
export interface ICalculationOptions {
    enableCaching?: boolean;
    locale?: string;
    precision?: 'low' | 'medium' | 'high';
}
/**
 * 算法注册中心 - 防止重复实现的核心类
 *
 * @ai-pattern SINGLETON_REGISTRY
 * @enforcement CRITICAL - 组件必须通过此类访问算法
 * @performance 缓存算法实例，避免重复创建
 */
export declare class AlgorithmRegistry {
    private static instances;
    private static performanceMetrics;
    /**
     * 获取八字计算器实例
     * @ai-usage 在所有需要八字计算的组件中使用
     * @example const bazi = AlgorithmRegistry.getBaZi();
     */
    static getBaZi(): BaziCalculator;
    /**
     * 获取紫微斗数计算器实例
     *
     * @ai-usage 在所有需要紫微计算的组件中使用
     * @example const ziwei = AlgorithmRegistry.getZiWei();
     *
     * @parallel-strategy 并行使用方案 (2025-09)
     * 🔄 此方法返回 ziwei-core 高性能算法（新功能、AI API专用）
     * 📊 现有UI排盘继续使用函数式排盘算法（稳定、已验证）
     * 🚨 CRITICAL: 请勿删除，两套算法并行运行以保证稳定性
     *
     * @migration-status PARALLEL_COEXISTENCE
     * - ziwei-core: 用于新功能和AI API计算
     * - 函数排盘: 用于现有UI组件（保持稳定）
     * - 未来逐步统一到ziwei-core
     */
    static getZiWei(): ZiweiCalculator;
    /**
     * 获取紫微斗数标准数据格式计算接口
     *
     * @purpose 为新功能提供标准化的ZiweiChart数据格式
     * @usage 在需要标准数据格式的新功能中使用
     * @example const chart = AlgorithmRegistry.getZiWeiStandardFormat();
     *
     * @data-format 基于 test-ziwei-calculation.js 的标准格式
     * @ai-new-features 新功能和AI API应使用此接口
     * @coexistence 与现有排盘算法并行运行
     * @critical 禁止使用硬编码和简化算法 - 必须使用 @astroall/ziwei-core
     */
    static getZiWeiStandardFormat(): ZiweiChart;
    /**
     * 获取统一农历算法接口 (tyme4ts)
     * @ai-usage 替代所有 lunar-javascript/lunar-typescript 直接调用
     * @critical 防止农历算法重复实现
     * @example const lunar = AlgorithmRegistry.getLunar();
     */
    static getLunar(): LunarCalendar;
    /**
     * 通用算法访问接口 - AI 友好
     * @ai-usage 当算法类型动态确定时使用
     * @template T 算法实例类型
     */
    static getAlgorithm<T>(type: AlgorithmType): T;
    /**
     * 批量计算接口 - 性能优化
     * @ai-optimization 一次性计算多个算法，减少重复初始化
     */
    static calculateBatch<T extends AlgorithmType>(calculations: {
        type: T;
        input: AlgorithmInput<T>;
        options?: ICalculationOptions;
    }[]): Promise<{
        type: T;
        result: AlgorithmResult<T>;
        performance: number;
    }[]>;
    /**
     * 性能监控 - AI 协作优化
     */
    static getPerformanceMetrics(): {
        totalInstances: number;
        algorithms: {
            algorithmType: string;
            initializationTime: number;
            instanceAge: number;
            isWarm: boolean;
        }[];
        memoryEstimate: number;
    };
    /**
     * 清理缓存 - 内存管理
     * @ai-usage 在内存压力时调用
     */
    static clearCache(): void;
    /**
     * 验证注册中心状态 - 开发调试
     * @ai-debug 用于排查算法注册问题
     */
    static validateRegistry(): {
        isValid: boolean;
        availableAlgorithms: string[];
        issues: string[];
    };
}
/**
 * AI 友好的算法访问钩子
 * @ai-pattern ALGORITHM_HOOK
 * @usage 在 React 组件中使用，自动缓存和错误处理
 */
export declare const useAlgorithmRegistry: () => {
    getBaZi: () => BaziCalculator;
    getZiWei: () => ZiweiCalculator;
    getLunar: () => LunarCalendar;
    getAlgorithm: <T>(type: AlgorithmType) => T;
    calculateBatch: typeof AlgorithmRegistry.calculateBatch;
    getMetrics: typeof AlgorithmRegistry.getPerformanceMetrics;
    validate: typeof AlgorithmRegistry.validateRegistry;
};
/**
 * AI 上下文提供者 - 算法注册中心状态
 * @ai-context REGISTRY_PROVIDER
 * @global 全局算法状态管理
 * @note React组件部分移至专门的Provider文件
 */
/**
 * @ai-export-summary
 * 导出内容总结：
 * - AlgorithmRegistry: 核心注册中心类（单例模式）
 * - useAlgorithmRegistry: React Hook 接口
 * - AlgorithmRegistryProvider: React Context 提供者
 *
 * @ai-critical-rule
 * 🚨 严禁在组件中重复实现算法逻辑
 * ✅ 必须通过 AlgorithmRegistry 访问所有算法
 */
export default AlgorithmRegistry;
