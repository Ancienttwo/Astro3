/**
 * 集成星盘API - Hook格式 + 渲染数据
 * Integrated Chart API - Hook Format + Render Data
 *
 * @ai-context INTEGRATED_CHART_API
 * @preload ZiWeiHookChart, 渲染数据, 缓存管理
 * @algorithm-dependency ziwei-integrated-api
 */
import type { HookCalculationInput, ZiWeiHookChart } from '../types/hook-format-types';
import type { RenderOptions, WebRenderData, NativeRenderData } from '../types/chart-render-types';
import type { PatternAnalysisResult } from '../analysis/pattern';
import type { HealthAnalysisResult } from '../analysis/health-analysis';
import type { MarriageAnalysisResult } from '../analysis/marriage-analysis';
export interface IntegratedChartAnalysis {
    pattern: PatternAnalysisResult;
    health: HealthAnalysisResult;
    marriage: MarriageAnalysisResult;
}
export interface IntegratedChartResponse {
    /** Hook格式的完整命盘数据 */
    hookChart: ZiWeiHookChart;
    /** Web渲染数据 */
    webRenderData: WebRenderData;
    /** Native渲染数据 */
    nativeRenderData: NativeRenderData;
    /** 综合分析结果 */
    analysis: IntegratedChartAnalysis;
    /** 生成时间戳 */
    generatedAt: string;
    /** 数据版本 */
    version: string;
    /** 性能统计 */
    performance: {
        hookGenerationTime: number;
        renderGenerationTime: number;
        totalTime: number;
    };
}
export interface QuickRenderResponse {
    /** 单平台渲染数据 */
    renderData: WebRenderData | NativeRenderData;
    /** Hook数据指纹 (用于缓存验证) */
    hookFingerprint: string;
    /** 渲染选项快照 */
    optionsSnapshot: RenderOptions;
}
/**
 * 🚀 一键生成完整星盘数据 (Hook + 双平台渲染)
 *
 * 这是最核心的API，会：
 * 1. 生成Hook格式的完整命盘数据
 * 2. 为Web和Native平台生成优化的渲染数据
 * 3. 自动缓存和性能优化
 */
export declare function generateIntegratedChart(input: HookCalculationInput, renderOptions?: Partial<RenderOptions>): Promise<IntegratedChartResponse>;
/**
 * ⚡ 快速单平台渲染 (基于现有Hook数据)
 *
 * 当Hook数据已存在时，快速生成特定平台的渲染数据
 */
export declare function generateQuickRender(hookChart: ZiWeiHookChart, platform: 'web' | 'native', renderOptions?: Partial<RenderOptions>): QuickRenderResponse;
/**
 * 🎯 为Web平台快速生成星盘
 */
export declare function generateWebChart(input: HookCalculationInput, options?: Partial<RenderOptions>): Promise<{
    hookChart: ZiWeiHookChart;
    renderData: WebRenderData;
    analysis: IntegratedChartAnalysis;
}>;
/**
 * 📱 为Native平台快速生成星盘
 */
export declare function generateNativeChart(input: HookCalculationInput, options?: Partial<RenderOptions>): Promise<{
    hookChart: ZiWeiHookChart;
    renderData: NativeRenderData;
    analysis: IntegratedChartAnalysis;
}>;
/**
 * 🔄 从Hook数据更新渲染 (用于主题切换、选项更改等)
 */
export declare function updateRenderFromHook(hookChart: ZiWeiHookChart, newOptions: Partial<RenderOptions>, currentOptions?: RenderOptions): {
    web?: WebRenderData;
    native?: NativeRenderData;
};
/**
 * 📊 批量生成多个星盘 (适用于家庭成员、比较分析等)
 */
export declare function generateBatchCharts(inputs: HookCalculationInput[], sharedRenderOptions?: Partial<RenderOptions>): Promise<IntegratedChartResponse[]>;
/**
 * 🎨 主题预设快速切换
 */
export declare function generateThemedCharts(hookChart: ZiWeiHookChart): Record<'light' | 'dark' | 'traditional', {
    web: WebRenderData;
    native: NativeRenderData;
}>;
/** 默认渲染选项预设 */
export declare const DEFAULT_RENDER_PRESETS: {
    readonly web: {
        readonly platform: "web";
        readonly showSihuaLines: true;
        readonly compact: false;
        readonly theme: "light";
        readonly fontSize: "medium";
        readonly showBrightness: true;
        readonly showMajorPeriods: true;
    };
    readonly native: {
        readonly platform: "native";
        readonly showSihuaLines: true;
        readonly compact: false;
        readonly theme: "light";
        readonly fontSize: "medium";
        readonly showBrightness: true;
        readonly showMajorPeriods: false;
    };
    readonly compact: {
        readonly platform: "native";
        readonly showSihuaLines: false;
        readonly compact: true;
        readonly theme: "light";
        readonly fontSize: "small";
        readonly showBrightness: false;
        readonly showMajorPeriods: false;
    };
};
/** 快速访问API别名 */
export declare const ChartAPI: {
    /** 一键生成完整数据 */
    generate: typeof generateIntegratedChart;
    /** Web平台专用 */
    web: typeof generateWebChart;
    /** Native平台专用 */
    native: typeof generateNativeChart;
    /** 快速渲染 */
    quick: typeof generateQuickRender;
    /** 批量处理 */
    batch: typeof generateBatchCharts;
    /** 主题切换 */
    themes: typeof generateThemedCharts;
};
//# sourceMappingURL=integrated-chart-api.d.ts.map