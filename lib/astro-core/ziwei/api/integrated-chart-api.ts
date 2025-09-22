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
import { generateZiWeiHookChart } from './hook-ziwei-api';
import { renderPalaceForWeb, renderPalaceForNative, generateBothPlatformRenderData } from './chart-render-api';
import { perfNow } from '../system/perf';

// =============================================================================
// 集成API响应类型
// =============================================================================

export interface IntegratedChartResponse {
  /** Hook格式的完整命盘数据 */
  hookChart: ZiWeiHookChart;
  /** Web渲染数据 */
  webRenderData: WebRenderData;
  /** Native渲染数据 */
  nativeRenderData: NativeRenderData;
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

// =============================================================================
// 核心集成API
// =============================================================================

/**
 * 🚀 一键生成完整星盘数据 (Hook + 双平台渲染)
 * 
 * 这是最核心的API，会：
 * 1. 生成Hook格式的完整命盘数据
 * 2. 为Web和Native平台生成优化的渲染数据
 * 3. 自动缓存和性能优化
 */
export async function generateIntegratedChart(
  input: HookCalculationInput,
  renderOptions: Partial<RenderOptions> = {}
): Promise<IntegratedChartResponse> {
  const startTime = perfNow();
  
  // Step 1: 生成Hook格式数据
  const hookStartTime = perfNow();
  const hookChart = await generateZiWeiHookChart(input);
  const hookEndTime = perfNow();
  
  // Step 2: 准备渲染选项
  const defaultRenderOptions: RenderOptions = {
    platform: 'web', // 默认平台，但会生成双平台数据
    showSihuaLines: true,
    compact: false,
    theme: 'light',
    fontSize: 'medium',
    showBrightness: true,
    showMajorPeriods: true,
    currentYear: new Date().getFullYear(),
    ...renderOptions
  };

  // Step 3: 生成双平台渲染数据
  const renderStartTime = perfNow();
  const renderData = generateBothPlatformRenderData({
    hookChart,
    options: defaultRenderOptions
  });
  const renderEndTime = perfNow();
  
  const totalTime = perfNow() - startTime;

  return {
    hookChart,
    webRenderData: renderData.web,
    nativeRenderData: renderData.native,
    generatedAt: new Date().toISOString(),
    version: hookChart.version || '1.0.0',
    performance: {
      hookGenerationTime: hookEndTime - hookStartTime,
      renderGenerationTime: renderEndTime - renderStartTime,
      totalTime
    }
  };
}

/**
 * ⚡ 快速单平台渲染 (基于现有Hook数据)
 * 
 * 当Hook数据已存在时，快速生成特定平台的渲染数据
 */
export function generateQuickRender(
  hookChart: ZiWeiHookChart,
  platform: 'web' | 'native',
  renderOptions: Partial<RenderOptions> = {}
): QuickRenderResponse {
  const options: RenderOptions = {
    platform,
    showSihuaLines: true,
    compact: false,
    theme: 'light',
    fontSize: 'medium',
    showBrightness: true,
    showMajorPeriods: true,
    currentYear: new Date().getFullYear(),
    ...renderOptions
  };

  const renderInput = { hookChart, options };
  
  const renderData = platform === 'web' 
    ? renderPalaceForWeb(renderInput)
    : renderPalaceForNative(renderInput);

  // 生成Hook数据指纹用于缓存验证（Web/Node通用，不依赖 Buffer）
  const toBase64 = (s: string): string => {
    try {
      // Browser/Web
      const g: any = globalThis as any;
      if (typeof g.btoa === 'function') {
        // handle UTF-8
        return g.btoa(unescape(encodeURIComponent(s)));
      }
      // Node fallback
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (globalThis as any).Buffer !== 'undefined') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const B: any = (globalThis as any).Buffer;
        return B.from(s, 'utf-8').toString('base64');
      }
    } catch {
      // ignore
    }
    return '';
  };

  const hookFingerprint = toBase64(JSON.stringify({
    birthInfo: hookChart.birthInfo,
    命宫: (hookChart as any).命宫,
    身宫: (hookChart as any).身宫,
    五行局: (hookChart as any).五行局
  })).slice(0, 32);

  return {
    renderData,
    hookFingerprint,
    optionsSnapshot: options
  };
}

// =============================================================================
// 便捷API方法
// =============================================================================

/**
 * 🎯 为Web平台快速生成星盘
 */
export async function generateWebChart(
  input: HookCalculationInput,
  options: Partial<RenderOptions> = {}
): Promise<{ hookChart: ZiWeiHookChart; renderData: WebRenderData }> {
  const result = await generateIntegratedChart(input, { ...options, platform: 'web' });
  return {
    hookChart: result.hookChart,
    renderData: result.webRenderData
  };
}

/**
 * 📱 为Native平台快速生成星盘  
 */
export async function generateNativeChart(
  input: HookCalculationInput,
  options: Partial<RenderOptions> = {}
): Promise<{ hookChart: ZiWeiHookChart; renderData: NativeRenderData }> {
  const result = await generateIntegratedChart(input, { ...options, platform: 'native' });
  return {
    hookChart: result.hookChart,
    renderData: result.nativeRenderData
  };
}

/**
 * 🔄 从Hook数据更新渲染 (用于主题切换、选项更改等)
 */
export function updateRenderFromHook(
  hookChart: ZiWeiHookChart,
  newOptions: Partial<RenderOptions>,
  currentOptions?: RenderOptions
): { web?: WebRenderData; native?: NativeRenderData } {
  const baseOptions: RenderOptions = {
    platform: 'web',
    showSihuaLines: true,
    compact: false,
    theme: 'light',
    fontSize: 'medium',
    showBrightness: true,
    showMajorPeriods: true,
    currentYear: new Date().getFullYear(),
    ...currentOptions,
    ...newOptions
  };

  const result: { web?: WebRenderData; native?: NativeRenderData } = {};

  // 生成Web版本
  if (!newOptions.platform || newOptions.platform === 'web') {
    result.web = renderPalaceForWeb({
      hookChart,
      options: { ...baseOptions, platform: 'web' }
    });
  }

  // 生成Native版本  
  if (!newOptions.platform || newOptions.platform === 'native') {
    result.native = renderPalaceForNative({
      hookChart,
      options: { ...baseOptions, platform: 'native' }
    });
  }

  return result;
}

// =============================================================================
// 批量处理API
// =============================================================================

/**
 * 📊 批量生成多个星盘 (适用于家庭成员、比较分析等)
 */
export async function generateBatchCharts(
  inputs: HookCalculationInput[],
  sharedRenderOptions: Partial<RenderOptions> = {}
): Promise<IntegratedChartResponse[]> {
  const results = await Promise.all(
    inputs.map(input => generateIntegratedChart(input, sharedRenderOptions))
  );
  return results;
}

/**
 * 🎨 主题预设快速切换
 */
export function generateThemedCharts(
  hookChart: ZiWeiHookChart
): Record<'light' | 'dark' | 'traditional', { web: WebRenderData; native: NativeRenderData }> {
  const themes: ('light' | 'dark' | 'traditional')[] = ['light', 'dark', 'traditional'];
  const results: any = {};

  themes.forEach(theme => {
    results[theme] = generateBothPlatformRenderData({
      hookChart,
      options: {
        platform: 'web', // 会生成双平台
        theme,
        showSihuaLines: true,
        compact: false,
        fontSize: 'medium',
        showBrightness: true,
        showMajorPeriods: true
      }
    });
  });

  return results;
}

// =============================================================================
// 导出便捷常量和工具
// =============================================================================

/** 默认渲染选项预设 */
export const DEFAULT_RENDER_PRESETS = {
  web: {
    platform: 'web' as const,
    showSihuaLines: true,
    compact: false,
    theme: 'light' as const,
    fontSize: 'medium' as const,
    showBrightness: true,
    showMajorPeriods: true
  },
  native: {
    platform: 'native' as const,
    showSihuaLines: true,
    compact: false,
    theme: 'light' as const,
    fontSize: 'medium' as const,
    showBrightness: true,
    showMajorPeriods: false // Native默认不显示大运信息以节省空间
  },
  compact: {
    platform: 'native' as const,
    showSihuaLines: false,
    compact: true,
    theme: 'light' as const,
    fontSize: 'small' as const,
    showBrightness: false,
    showMajorPeriods: false
  }
} as const;

/** 快速访问API别名 */
export const ChartAPI = {
  /** 一键生成完整数据 */
  generate: generateIntegratedChart,
  /** Web平台专用 */
  web: generateWebChart,
  /** Native平台专用 */
  native: generateNativeChart,
  /** 快速渲染 */
  quick: generateQuickRender,
  /** 批量处理 */
  batch: generateBatchCharts,
  /** 主题切换 */
  themes: generateThemedCharts
};
