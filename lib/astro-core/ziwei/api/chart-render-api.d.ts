/**
 * 星盘渲染专用API
 * Chart Render API
 *
 * @ai-context CHART_RENDER_API
 * @preload ZiWeiHookChart, 渲染组件数据转换
 * @algorithm-dependency ziwei-chart-render
 */
import type { ChartRenderInput, WebRenderData, NativeRenderData } from '../types/chart-render-types';
/**
 * 为Web平台生成渲染数据
 */
export declare function renderPalaceForWeb(input: ChartRenderInput): WebRenderData;
/**
 * 为Native平台生成渲染数据
 */
export declare function renderPalaceForNative(input: ChartRenderInput): NativeRenderData;
/**
 * 通用渲染数据生成器
 */
export declare function generateChartRenderData(input: ChartRenderInput): {
    platform: "web";
    data: WebRenderData;
} | {
    platform: "native";
    data: NativeRenderData;
};
/**
 * 批量生成渲染数据 (Web + Native)
 */
export declare function generateBothPlatformRenderData(input: ChartRenderInput): {
    web: WebRenderData;
    native: NativeRenderData;
};
/**
 * 清除渲染数据缓存
 */
export declare function clearRenderCache(): void;
/**
 * 获取缓存统计信息
 */
export declare function getRenderCacheStats(): {
    size: number;
    maxSize: number;
    ttl: number;
};
//# sourceMappingURL=chart-render-api.d.ts.map