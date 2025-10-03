"use strict";
/**
 * Algorithm Registry - 算法注册中心
 *
 * @ai-context ALGORITHM_REGISTRY
 * @purpose 解决算法重复问题，提供统一的算法访问接口
 * @pattern Singleton + Factory + Cache
 * @critical 禁止在组件中直接实现算法，必须通过注册中心访问
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod !== null && mod !== undefined) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.useAlgorithmRegistry = exports.AlgorithmRegistry = void 0;
// React相关导入移至组件文件
const calculator_1 = require("../bazi/calculator");
const calculator_2 = require("../ziwei/calculator");
const tyme4ts_1 = require("tyme4ts");
// 如果有其他类型定义文件，也可以导入
// import type { 
//   BaziData, 
//   BaziAnalysisResult,
//   ZiweiChart,
//   ZiweiCalculationInput
// } from '../types';
/**
 * 算法注册中心 - 防止重复实现的核心类
 *
 * @ai-pattern SINGLETON_REGISTRY
 * @enforcement CRITICAL - 组件必须通过此类访问算法
 * @performance 缓存算法实例，避免重复创建
 */
class AlgorithmRegistry {
    /**
     * 获取八字计算器实例
     * @ai-usage 在所有需要八字计算的组件中使用
     * @example const bazi = AlgorithmRegistry.getBaZi();
     */
    static getBaZi() {
        if (!this.instances.has('bazi')) {
            console.log('🔧 正在初始化八字算法实例...');
            this.instances.set('bazi', new calculator_1.BaziCalculator());
            this.performanceMetrics.set('bazi', Date.now());
        }
        return this.instances.get('bazi');
    }
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
    static getZiWei() {
        if (!this.instances.has('ziwei')) {
            console.log('🔧 正在初始化紫微斗数算法实例 (ziwei-core)...');
            this.instances.set('ziwei', new calculator_2.ZiweiCalculator());
            this.performanceMetrics.set('ziwei', Date.now());
        }
        return this.instances.get('ziwei');
    }
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
    static getZiWeiStandardFormat() {
        if (!this.instances.has('ziwei-standard')) {
            console.log('🔧 正在初始化紫微标准格式计算接口...');
            const standardInterface = {
                // 使用 @astroall/ziwei-core 的完整实现
                calculateStandardChart: async (input) => {
                    // 动态导入 @astroall/ziwei-core - 使用完整的算法实现
                    const { calculateZiweiChart } = await Promise.resolve().then(() => __importStar(require('@astroall/ziwei-core')));
                    // 调用 ziwei-core 的完整实现
                    const result = calculateZiweiChart(input);
                    // 🎯 返回 ziwei-core 的完整计算结果，转换为标准格式
                    return {
                        birthInfo: input,
                        yearInfo: {
                            yearStem: result.yearStem || result.yearGanZhi?.[0] || '',
                            yearBranch: result.yearBranch || result.yearGanZhi?.[1] || '',
                            yearGanZhi: result.yearGanZhi || '',
                            fiveElementsBureau: result.fiveElementsBureau || '',
                            fiveElementsText: result.fiveElementsText || ''
                        },
                        palacePositions: {
                            lifePalace: {
                                branch: result.lifePalace?.lifePalaceBranch || result.lifePalace?.branch || '',
                                branchIndex: result.lifePalace?.lifePalaceBranchIndex ?? result.lifePalace?.lifePalaceIndex ?? -1,
                                palaceName: '命宫'
                            },
                            bodyPalace: {
                                branch: result.bodyPalace?.bodyPalaceBranch || result.bodyPalace?.branch || '',
                                branchIndex: result.bodyPalace?.bodyPalaceBranchIndex ?? result.bodyPalace?.bodyPalaceIndex ?? -1,
                                palaceName: result.bodyPalace?.palaceName || '身宫'
                            },
                            laiyinPalace: result.laiyinPalace ? {
                                branch: result.laiyinPalace?.laiyinPalaceBranch || '',
                                branchIndex: result.laiyinPalace?.laiyinPalaceBranchIndex ?? -1,
                                palaceName: '来因宫'
                            } : {
                                branch: '',
                                branchIndex: -1,
                                palaceName: '来因宫'
                            }
                        },
                        lifeMaster: result.lifeMaster || '', // 使用实际计算结果，不硬编码
                        bodyMaster: result.bodyMaster || '', // 使用实际计算结果，不硬编码
                        douJun: result.douJun || '', // 使用实际计算结果，不硬编码
                        palacesByBranch: result.palacesByBranch || result.palaces || {}
                    };
                }
            };
            this.instances.set('ziwei-standard', standardInterface);
            this.performanceMetrics.set('ziwei-standard', Date.now());
        }
        return this.instances.get('ziwei-standard');
    }
    /**
     * 获取统一农历算法接口 (tyme4ts)
     * @ai-usage 替代所有 lunar-javascript/lunar-typescript 直接调用
     * @critical 防止农历算法重复实现
     * @example const lunar = AlgorithmRegistry.getLunar();
     */
    static getLunar() {
        if (!this.instances.has('lunar')) {
            console.log('🔧 正在初始化农历算法实例 (tyme4ts)...');
            // 创建统一的农历算法接口
            const lunarInterface = {
                // 公历转农历
                solarToLunar: (year, month, day, hour) => {
                    const solarDay = tyme4ts_1.SolarDay.fromYmd(year, month, day);
                    const lunarDay = solarDay.getLunarDay();
                    if (hour !== undefined) {
                        const hours = lunarDay.getHours();
                        const targetHour = hours.find(h => h.getHour() === hour) || hours[0];
                        return {
                            solarDay,
                            lunarDay,
                            targetHour,
                            eightChar: targetHour.getEightChar()
                        };
                    }
                    return { solarDay, lunarDay };
                },
                // 农历转公历
                lunarToSolar: (year, month, day, isLeap = false) => {
                    const lunarDay = tyme4ts_1.LunarDay.fromYmd(year, month, day);
                    return lunarDay.getSolarDay();
                },
                // 八字计算（完全使用 tyme4ts）
                calculateBaZi: (year, month, day, hour, isLunar = false) => {
                    let solarDay;
                    if (isLunar) {
                        const lunarDay = tyme4ts_1.LunarDay.fromYmd(year, month, day);
                        solarDay = lunarDay.getSolarDay();
                    }
                    else {
                        solarDay = tyme4ts_1.SolarDay.fromYmd(year, month, day);
                    }
                    const lunarDay = solarDay.getLunarDay();
                    const hours = lunarDay.getHours();
                    const targetHour = hours.find(h => h.getHour() === hour) || hours[0];
                    const eightChar = targetHour.getEightChar();
                    return {
                        year: eightChar.getYear().toString(),
                        month: eightChar.getMonth().toString(),
                        day: eightChar.getDay().toString(),
                        hour: eightChar.getHour().toString(),
                        naYin: {
                            year: eightChar.getYear().getSound().toString(),
                            month: eightChar.getMonth().getSound().toString(),
                            day: eightChar.getDay().getSound().toString(),
                            hour: eightChar.getHour().getSound().toString(),
                        }
                    };
                }
            };
            this.instances.set('lunar', lunarInterface);
            this.performanceMetrics.set('lunar', Date.now());
        }
        return this.instances.get('lunar');
    }
    /**
     * 通用算法访问接口 - AI 友好
     * @ai-usage 当算法类型动态确定时使用
     * @template T 算法实例类型
     */
    static getAlgorithm(type) {
        switch (type) {
            case 'bazi':
                return this.getBaZi();
            case 'ziwei':
                return this.getZiWei();
            case 'lunar':
                return this.getLunar();
            default:
                throw new Error(`未知算法类型: ${type}`);
        }
    }
    /**
     * 批量计算接口 - 性能优化
     * @ai-optimization 一次性计算多个算法，减少重复初始化
     */
    static async calculateBatch(calculations) {
        const results = [];
        for (const calc of calculations) {
            const algorithm = this.getAlgorithm(calc.type);
            const startTime = Date.now();
            const result = algorithm.calculate ?
                await algorithm.calculate(calc.input, calc.options) :
                await algorithm;
            const duration = Date.now() - startTime;
            console.log(`📊 ${calc.type} 计算耗时: ${duration}ms`);
            results.push({
                type: calc.type,
                result,
                performance: duration
            });
        }
        return results;
    }
    /**
     * 性能监控 - AI 协作优化
     */
    static getPerformanceMetrics() {
        const metrics = Array.from(this.performanceMetrics.entries()).map(([type, initTime]) => ({
            algorithmType: type,
            initializationTime: initTime,
            instanceAge: Date.now() - initTime,
            isWarm: this.instances.has(type)
        }));
        return {
            totalInstances: this.instances.size,
            algorithms: metrics,
            memoryEstimate: this.instances.size * 50 // KB per instance estimate
        };
    }
    /**
     * 清理缓存 - 内存管理
     * @ai-usage 在内存压力时调用
     */
    static clearCache() {
        console.log('🧹 清理算法缓存...');
        this.instances.clear();
        this.performanceMetrics.clear();
    }
    /**
     * 验证注册中心状态 - 开发调试
     * @ai-debug 用于排查算法注册问题
     */
    static validateRegistry() {
        const issues = [];
        const available = [];
        // 检查核心算法是否可用
        try {
            this.getBaZi();
            available.push('bazi');
        }
        catch (error) {
            issues.push(`八字算法不可用: ${error}`);
        }
        try {
            this.getZiWei();
            available.push('ziwei');
        }
        catch (error) {
            issues.push(`紫微算法不可用: ${error}`);
        }
        return {
            isValid: issues.length === 0,
            availableAlgorithms: available,
            issues
        };
    }
}
exports.AlgorithmRegistry = AlgorithmRegistry;
exports.default = AlgorithmRegistry;
AlgorithmRegistry.instances = new Map();
AlgorithmRegistry.performanceMetrics = new Map();
/**
 * AI 友好的算法访问钩子
 * @ai-pattern ALGORITHM_HOOK
 * @usage 在 React 组件中使用，自动缓存和错误处理
 */
const useAlgorithmRegistry = () => {
    return {
        getBaZi: () => AlgorithmRegistry.getBaZi(),
        getZiWei: () => AlgorithmRegistry.getZiWei(),
        getLunar: () => AlgorithmRegistry.getLunar(),
        getAlgorithm: (type) => AlgorithmRegistry.getAlgorithm(type),
        calculateBatch: AlgorithmRegistry.calculateBatch,
        getMetrics: AlgorithmRegistry.getPerformanceMetrics,
        validate: AlgorithmRegistry.validateRegistry
    };
};
exports.useAlgorithmRegistry = useAlgorithmRegistry;
